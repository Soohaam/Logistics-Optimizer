// services/optimizationService.js
require("dotenv").config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const Optimization = require('../models/Optimization');
const DelayPrediction = require('../models/DelayPrediction');
const PortToPlant = require('../models/PortToPlant');

class OptimizationService {
  constructor() {
    // Initialize with primary API key, fallback to secondary
    const primaryKey = process.env.GOOGLE_GEMINI_API_KEY_OPTIMIZED;
    const secondaryKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    this.apiKeys = [primaryKey, secondaryKey].filter(Boolean);
    this.currentKeyIndex = 0;
    this.lastSwitchTime = 0;
    this.rateLimitResetTime = 0;
    this.requestCount = 0;
    this.dailyRequestCount = 0;
    this.lastRequestTime = 0;
    this.requestQueue = []; // Queue for requests
    this.isProcessingQueue = false;
    
    // Track active optimizations to prevent duplicates
    this.activeOptimizations = new Set();
    
    // Daily reset time (midnight)
    this.dailyResetTime = new Date();
    this.dailyResetTime.setHours(24, 0, 0, 0);
    
    if (this.apiKeys.length === 0) {
      console.warn('⚠️ No Gemini API keys configured');
      this.genAI = null;
      this.model = null;
    } else {
      this.initializeModel();
      console.log(`🔑 Initialized with ${this.apiKeys.length} API key(s)`);
    }
    
    // Indian major ports with their coordinates and characteristics
    this.indianPorts = {
      'Haldia': { lat: 22.0258, lng: 88.0636, capacity: 45000, efficiency: 85 },
      'Paradip': { lat: 20.2597, lng: 86.6947, capacity: 55000, efficiency: 88 },
      'Vizag': { lat: 17.6868, lng: 83.2185, capacity: 65000, efficiency: 90 },
      'Chennai': { lat: 13.0878, lng: 80.2785, capacity: 50000, efficiency: 87 },
      'Mumbai': { lat: 19.0760, lng: 72.8777, capacity: 70000, efficiency: 85 },
      'Kandla': { lat: 23.0225, lng: 70.2208, capacity: 60000, efficiency: 83 },
      'Cochin': { lat: 9.9312, lng: 76.2673, capacity: 40000, efficiency: 86 },
      'Tuticorin': { lat: 8.7642, lng: 78.1348, capacity: 45000, efficiency: 84 }
    };
    
    // Simple in-memory cache for optimization results
    this.resultCache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  initializeModel() {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKeys[this.currentKeyIndex]);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (error) {
      this.genAI = null;
      this.model = null;
    }
  }

  async tryNextApiKey() {
    // Reset to primary key if enough time has passed (15 minutes)
    const now = Date.now();
    if (this.currentKeyIndex > 0 && now - this.lastSwitchTime > 15 * 60 * 1000) {
      console.log('🔄 Resetting to primary API key after cooldown');
      this.currentKeyIndex = 0;
      this.initializeModel();
      return true;
    }
    
    // If we've used all keys, implement rate limiting delay
    if (this.currentKeyIndex >= this.apiKeys.length - 1) {
      // If we're hitting daily limits, wait longer
      console.log('⏳ All API keys exhausted, implementing extended wait...');
      // Wait for 5 minutes or until next day, whichever is sooner
      const timeUntilMidnight = this.dailyResetTime.getTime() - now;
      const waitTime = Math.min(300000, timeUntilMidnight); // Max 5 minutes
      if (waitTime > 0) {
        console.log(`⏳ Waiting ${Math.ceil(waitTime/1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      // Reset to first key after wait
      this.currentKeyIndex = 0;
      this.initializeModel();
      console.log('🔄 Reset to first API key after wait');
      return true;
    }
    
    // Try next key
    this.currentKeyIndex++;
    this.initializeModel();
    this.lastSwitchTime = Date.now();
    console.log(`🔑 Switched to API key ${this.currentKeyIndex + 1}`);
    return true;
  }

  async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const { request, resolve, reject } = this.requestQueue.shift();
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  async makeRequest(request) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      this.processQueue();
    });
  }

  async optimizeRoute(plantId, portId, cargoType, cargoVolume) {
    const cacheKey = `${plantId}-${portId}-${cargoType}-${cargoVolume}`;
    const cachedResult = this.resultCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < this.cacheExpiry) {
      return cachedResult.data;
    }

    const plant = await PortToPlant.findOne({ plantId, portId });
    if (!plant) {
      throw new Error('Plant not found for the given port');
    }

    const port = this.indianPorts[portId];
    if (!port) {
      throw new Error('Port not found');
    }

    const delayPrediction = await DelayPrediction.findOne({ portId });
    if (!delayPrediction) {
      throw new Error('Delay prediction not found for the given port');
    }

    const optimization = await Optimization.findOne({ plantId, portId, cargoType });
    if (!optimization) {
      throw new Error('Optimization data not found for the given plant and cargo type');
    }

    const prompt = `
      Optimize the route for the following shipment:
      - Plant ID: ${plantId}
      - Port ID: ${portId}
      - Cargo Type: ${cargoType}
      - Cargo Volume: ${cargoVolume}
      - Port Coordinates: (${port.lat}, ${port.lng})
      - Port Capacity: ${port.capacity}
      - Port Efficiency: ${port.efficiency}%
      - Delay Prediction: ${delayPrediction.delay} days
      - Optimization Data: ${JSON.stringify(optimization.data)}

      Provide the optimized route as a JSON object.
    `;

    try {
      const result = await this.makeRequest(() => this.model.generateContent(prompt));
      const optimizedRoute = result.response.text();
      this.resultCache.set(cacheKey, { data: optimizedRoute, timestamp: Date.now() });
      return optimizedRoute;
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw new Error('Failed to optimize route');
    }
  }

  async callGeminiWithRetry(prompt, maxRetries = 3) {
    if (!this.model) {
      console.log('❌ No Gemini model available');
      return null;
    }
    
    // More aggressive rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Reset counter every 60 seconds
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0;
    }
    
    // Implement stricter rate limiting (max 10 requests per minute for free tier)
    if (this.requestCount >= 10) {
      const waitTime = 60000 - timeSinceLastRequest;
      if (waitTime > 0) {
        console.log(`⏳ Strict rate limit: Waiting ${Math.ceil(waitTime/1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.requestCount = 0;
    }
    
    // Log prompt size for debugging
    const promptTokens = prompt.length / 4; // Rough estimation of tokens
    console.log(`📝 Prompt size: ~${Math.round(promptTokens)} tokens`);
    
    // Check if prompt is too large (reduced limit to 15k tokens for safety)
    if (promptTokens > 15000) {
      console.log(`⚠️ Prompt too large (${Math.round(promptTokens)} tokens), using fallback data`);
      return null;
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
    
    console.log('📡 Sending request to Gemini API...');
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add request timeout
        const result = await Promise.race([
          this.model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
          )
        ]);
        
        const response = await result.response;
        const text = response.text().trim();
        
        if (!text || text.length === 0) {
          throw new Error('Empty response from Gemini API');
        }
        
        console.log(`✅ Gemini API call successful (attempt ${attempt + 1})`);
        return text;
      } catch (error) {
        console.log(`⚠️ Gemini API attempt ${attempt + 1} failed: ${error.message}`);
        
        // Log specific error types
        if (error.message.includes('429')) {
          console.log('🚦 Rate limit exceeded');
          // Implement longer wait for rate limits (2 minutes for daily limit)
          const waitTime = error.message.includes('200') ? 120000 : 60000;
          console.log(`⏳ Waiting ${waitTime/1000} seconds due to rate limit...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (error.message.includes('500')) {
          console.log('💥 Server error');
        } else if (error.message.includes('timeout')) {
          console.log('⏰ Request timeout');
        }
        
        if (attempt === maxRetries) {
          // Try next API key if available
          if (await this.tryNextApiKey()) {
            console.log(`🔄 Switched to backup API key (${this.currentKeyIndex + 1}/${this.apiKeys.length})`);
            return this.callGeminiWithRetry(prompt, 1); // One more try with new key
          }
          console.log('❌ All retry attempts failed');
          throw error;
        }
        // Wait before retry with exponential backoff
        const waitTime = Math.pow(2, attempt) * 2000; // Increased base wait time
        console.log(`⏳ Waiting ${Math.ceil(waitTime/1000)} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }


  /**
   * Main optimization method
   */
  async optimizeVesselOperations(vesselData) {
    const vesselId = vesselData._id.toString();
    // Mark this vessel as having an active optimization
    this.activeOptimizations.add(vesselId);
    
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting optimization for vessel ${vesselData.name} (${vesselId})`);
      
      // First check if we have recent optimization data for this vessel (extended cache)
      const recentOptimization = await Optimization.findOne({
        vesselId: vesselData._id,
        'computationMetadata.lastUpdated': { 
          $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) // Extended to 12 hours
        }
      }).sort({ 'computationMetadata.lastUpdated': -1 });

      if (recentOptimization) {
        console.log(`✅ Using cached optimization for vessel ${vesselData.name} (${vesselId})`);
        // Add some dynamic elements to make it look fresh
        recentOptimization.computationMetadata.cacheHit = true;
        recentOptimization.computationMetadata.retrievalTime = Date.now() - startTime;
        return recentOptimization;
      }

      console.log(`🔄 Generating new optimization for vessel ${vesselData.name} (${vesselId})`);
      
      // Generate unique optimization ID
      const optimizationId = `OPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Step 1: Gather input data from existing analyses
      console.log('📥 Gathering input data...');
      const inputData = await this.gatherInputData(vesselData._id);
      console.log('✅ Input data gathered');
      
      // Step 2: Perform port selection optimization
      console.log('🚢 Optimizing port selection...');
      const portOptimization = await this.optimizePortSelection(vesselData, inputData);
      console.log(`✅ Port selection completed (source: ${portOptimization.dataSource})`);
      
      // Step 3: Optimize routing
      console.log('🧭 Optimizing routing...');
      const routeOptimization = await this.optimizeRouting(vesselData, portOptimization.selectedPort, inputData);
      console.log(`✅ Routing optimization completed (source: ${routeOptimization.dataSource})`);
      
      // Step 4: Optimize discharge sequencing
      console.log('📦 Optimizing discharge sequencing...');
      const dischargeOptimization = await this.optimizeDischargeSequencing(vesselData, inputData);
      console.log(`✅ Discharge sequencing completed (source: ${dischargeOptimization.dataSource})`);
      
      // Step 5: Optimize rail transport
      console.log('🚂 Optimizing rail transport...');
      const railOptimization = await this.optimizeRailTransport(vesselData, inputData);
      console.log('✅ Rail transport optimization completed');
      
      // Step 6: Perform cost-benefit analysis
      console.log('💰 Performing cost-benefit analysis...');
      const costBenefitAnalysis = await this.performCostBenefitAnalysis(
        vesselData, portOptimization, routeOptimization, dischargeOptimization, railOptimization, inputData
      );
      console.log('✅ Cost-benefit analysis completed');
      
      // Step 7: Generate map visualization data
      console.log('🗺️ Generating map visualization data...');
      const mapData = await this.generateMapVisualizationData(
        vesselData, portOptimization, routeOptimization, inputData
      );
      console.log('✅ Map visualization data generated');
      
      // Step 8: Assess risks and generate recommendations
      console.log('⚠️ Assessing risks and generating recommendations...');
      const riskAssessment = await this.assessOptimizationRisks(vesselData, inputData);
      const recommendations = await this.generateRecommendations(vesselData, inputData);
      console.log('✅ Risk assessment and recommendations completed');
      
      // Calculate performance metrics
      console.log('📊 Calculating performance metrics...');
      const performanceMetrics = this.calculatePerformanceMetrics(
        costBenefitAnalysis, riskAssessment, inputData
      );
      console.log('✅ Performance metrics calculated');
      
      const computationTime = Date.now() - startTime;
      
      // Log fallback usage
      const fallbackCount = [
        portOptimization,
        routeOptimization,
        dischargeOptimization
      ].filter(opt => opt.dataSource === 'fallback').length;
      
      if (fallbackCount > 0) {
        console.log(`⚠️ ${fallbackCount} components used fallback data instead of AI`);
      }
      
      // Create optimization result
      const optimizationResult = {
        vesselId: vesselData._id,
        optimizationId,
        vesselName: vesselData.name,
        optimizationResults: {
          portSelection: portOptimization,
          routeOptimization,
          dischargeSequencing: dischargeOptimization,
          railTransportOptimization: railOptimization,
          costBenefitAnalysis,
          riskAssessment,
          performanceMetrics
        },
        mapVisualizationData: mapData,
        inputDataSources: {
          delayPredictionId: inputData.delayPrediction?.predictionId,
          portToPlantId: inputData.portToPlant?._id,
          weatherData: inputData.weatherData,
          marketConditions: inputData.marketConditions
        },
        recommendations,
        status: 'completed',
        computationMetadata: {
          totalComputationTime: computationTime,
          dataQualityScore: this.calculateDataQuality(inputData),
          aiModelVersion: 'gemini-2.0-flash',
          lastUpdated: new Date(),
          cacheHit: false,
          fallbackComponents: fallbackCount
        }
      };
      
      console.log(`✅ Optimization completed for vessel ${vesselData.name} in ${computationTime}ms`);
      
      // Save to database
      const savedOptimization = await this.saveOptimization(optimizationResult);
      
      console.log(`💾 Optimization data successfully saved to database for vessel ${vesselData.name}`);
      
      return savedOptimization;
      
    } catch (error) {
      console.error(`❌ Optimization failed for vessel ${vesselData?.name || 'unknown'}:`, error);
      throw new Error(`Optimization failed: ${error.message}`);
    } finally {
      // Remove vessel from active optimizations
      this.activeOptimizations.delete(vesselId);
      console.log(`🧹 Cleaned up active optimization tracking for vessel ${vesselData.name} (${vesselId})`);
    }
  }

  /**
   * Gather input data from existing analyses
   */
  async gatherInputData(vesselId) {
    try {
      const [delayPrediction, portToPlant, weatherData, marketConditions] = await Promise.allSettled([
        DelayPrediction.findOne({ vesselId }).sort({ createdAt: -1 }),
        PortToPlant.findOne({ vesselId }),
        this.getCurrentWeatherConditions(),
        this.getMarketConditions()
      ]);

      return {
        delayPrediction: delayPrediction.status === 'fulfilled' ? delayPrediction.value : null,
        portToPlant: portToPlant.status === 'fulfilled' ? portToPlant.value : null,
        weatherData: weatherData.status === 'fulfilled' ? weatherData.value : this.getDefaultWeatherData(),
        marketConditions: marketConditions.status === 'fulfilled' ? marketConditions.value : this.getDefaultMarketConditions()
      };
    } catch (error) {
      console.error('Error gathering input data:', error);
      return {
        delayPrediction: null,
        portToPlant: null,
        weatherData: this.getDefaultWeatherData(),
        marketConditions: this.getDefaultMarketConditions()
      };
    }
  }

  /**
   * Optimize port selection using AI
   */
  async optimizePortSelection(vesselData, inputData) {
    // Summarize data to reduce prompt size
    const vesselSummary = this.summarizeVesselData(vesselData);
    
    // Create a much smaller prompt by limiting port information
    const portEntries = Object.entries(this.indianPorts);
    const limitedPorts = portEntries.slice(0, 5); // Only use top 5 ports
    
    const prompt = `
You are a maritime logistics expert optimizing port selection for vessel operations in India.

VESSEL DATA:
- Name: ${vesselData.name}
- Capacity: ${vesselData.capacity} MT
- Current Load Port: ${vesselData.loadPort}
- Total Cargo: ${vesselData.parcels.reduce((sum, p) => sum + p.size, 0)} MT



AVAILABLE PORTS:
${Object.entries(this.indianPorts).map(([name, data]) => 
  `- ${name}: Capacity ${data.capacity}MT, Efficiency ${data.efficiency}%, Coords: ${data.lat}, ${data.lng}`
).join('\n')}

 
REQUIREMENTS:
Select the optimal port and provide up to 4 alternatives. Consider efficiency, capacity, weather conditions, and congestion.

Respond in this JSON format:
{
  "selectedPort": {
    "name": "PortName",
    "efficiency": 0,
    "capacity": 0
  },
  "alternativePorts": [
    {
      "name": "AlternativePort",
      "efficiency": 0,
      "reasonForRejection": "Higher congestion levels"
    }
  ],
  "selectionReasoning": "Selected based on optimal efficiency"
}`;

    try {
      console.log(`🚢 Port Selection: Processing vessel ${vesselData.name} (${vesselData._id})`);
      const text = await this.callGeminiWithRetry(prompt);
      if (text) {
        console.log('✅ Port Selection: Gemini AI response received');
        const cleanedText = text.replace(/```json\n?|\n?```/g, '');
        const portSelection = JSON.parse(cleanedText);
        const validatedResult = this.validatePortSelection(portSelection);
        validatedResult.dataSource = 'gemini_ai';
        return validatedResult;
      }
    } catch (error) {
      console.log(`⚠️ Port Selection: Using fallback data (${error.message})`);
    }
    
    const fallbackResult = this.getRealisticPortSelection(vesselData.loadPort, vesselData);
    fallbackResult.dataSource = 'fallback';
    console.log('🔄 Port Selection: Generated fallback data');
    return fallbackResult;
  }

  /**
   * Optimize routing with AI
   */
  // Helper function to calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  // Helper function to calculate bearing between two points
  calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return Math.round((bearing + 360) % 360);
  }

  // Helper method to summarize large vessel data
  summarizeVesselData(vesselData) {
    // Summarize parcels with key statistics only
    const totalCargo = vesselData.parcels.reduce((sum, p) => sum + p.size, 0);
    const parcelTypes = [...new Set(vesselData.parcels.map(p => p.materialType))];
    const qualityGrades = [...new Set(vesselData.parcels.map(p => p.qualityGrade))];
    
    // Limit arrays to prevent large prompts
    return {
      name: vesselData.name,
      capacity: vesselData.capacity,
      loadPort: vesselData.loadPort,
      ETA: vesselData.ETA,
      totalCargo: totalCargo,
      parcelCount: vesselData.parcels.length,
      parcelTypes: parcelTypes.slice(0, 3), // Limit to 3 types
      qualityGrades: qualityGrades.slice(0, 3) // Limit to 3 grades
    };
  }

  // More aggressive plant data summarization
  summarizePlantData(portToPlantData) {
    if (!portToPlantData || !portToPlantData.analysisData) return null;
    
    const plantAllocations = portToPlantData.analysisData.plantDistributionAnalysis?.plantAllocations || [];
    
    // Only include key metrics and limit the number of plants
    const summarizedPlants = plantAllocations
      .slice(0, 5) // Limit to top 5 plants
      .map(plant => ({
        plantName: plant.plantName,
        allocatedQuantity: plant.allocatedQuantity || 0,
        shortfall: plant.shortfall || 0
      }));
    
    return {
      totalPlants: Math.min(plantAllocations.length, 10), // Cap at 10
      totalAllocation: plantAllocations.reduce((sum, p) => sum + (p.allocatedQuantity || 0), 0),
      totalShortfall: portToPlantData.analysisData.plantDistributionAnalysis?.totalShortfall || 0,
      topPlants: summarizedPlants
    };
  }

  // Optimize routing with smaller prompt
  async optimizeRouting(vesselData, selectedPort, inputData) {
    const currentPort = this.indianPorts[vesselData.loadPort] || this.indianPorts['Chennai'];
    const destinationPort = this.indianPorts[selectedPort.name] || selectedPort.coordinates;
    
    // Calculate distance for realistic values
    const directDistance = this.calculateDistance(currentPort.lat, currentPort.lng, destinationPort.lat, destinationPort.lng);
    const estimatedTime = Math.round(directDistance / 12); // Assuming 12 knots average speed
    const fuelConsumption = Math.round(directDistance * 0.15); // Rough fuel consumption estimate

    // Optimize prompt by reducing data size
    const vesselCargoSummary = `Total: ${vesselData.parcels.reduce((sum, p) => sum + p.size, 0)}MT, ${vesselData.parcels.length} parcels`;

    const prompt = `
You are a maritime route optimization expert for Indian Ocean routes.

ROUTE REQUIREMENTS:
- From: ${vesselData.loadPort} to ${selectedPort.name}
- Distance: ${directDistance} km
- Vessel: ${vesselData.name} - ${vesselData.capacity}MT capacity
- Cargo: ${vesselCargoSummary}
- Distance: ${directDistance} km
- Weather Risk: ${inputData.delayPrediction?.riskLevel || 'medium'}

Provide detailed routing with specific waypoints and route description and 2 alternative routes.

Respond in JSON format:
{
  "recommendedRoute": {
    "routeName": "${vesselData.loadPort} to ${selectedPort.name} - Eastern Maritime Corridor",
    "description": "Optimized coastal route via ${vesselData.loadPort}-${selectedPort.name} shipping lane",
    "waypoints": [
      {"lat": ${currentPort.lat}, "lng": ${currentPort.lng}, "name": "${vesselData.loadPort} Port", "type": "port"},
      {"lat": ${(currentPort.lat + destinationPort.lat) / 2}, "lng": ${(currentPort.lng + destinationPort.lng) / 2}, "name": "Mid-Route Checkpoint", "type": "waypoint"},
      {"lat": ${destinationPort.lat}, "lng": ${destinationPort.lng}, "name": "${selectedPort.name} Port", "type": "port"}
    ],
    "totalDistance": ${directDistance},
    "estimatedTime": ${estimatedTime},
    "fuelConsumption": ${fuelConsumption},
    "weatherRisk": "low",
    "advantages": ["Optimized route"],
    "trafficDensity": "medium"
  },
  "alternativeRoutes": [
    {
      "routeName": "Alternative Route",
      "description": "Alternative shipping route",
      "waypoints": [
        {"lat": ${currentPort.lat}, "lng": ${currentPort.lng}, "name": "${vesselData.loadPort} Port"},
        {"lat": ${destinationPort.lat}, "lng": ${destinationPort.lng}, "name": "${selectedPort.name} Port"}
      ],
      "totalDistance": ${Math.round(directDistance * 1.1)},
      "estimatedTime": ${Math.round(estimatedTime * 1.1)},
      "fuelConsumption": ${Math.round(fuelConsumption * 1.1)},
      "riskLevel": "medium"
    }
  ]
}`;

    try {
      console.log(`🧭 Route Optimization: Processing vessel ${vesselData.name} (${vesselData._id})`);
      const text = await this.callGeminiWithRetry(prompt);
      if (text) {
        console.log('✅ Route Optimization: Gemini AI response received');
        const cleanedText = text.replace(/```json\n?|\n?```/g, '');
        const routeOptimization = JSON.parse(cleanedText);
        const validatedResult = this.validateRouteOptimization(routeOptimization);
        validatedResult.dataSource = 'gemini_ai';
        return validatedResult;
      }
    } catch (error) {
      console.log(`⚠️ Route Optimization: Using fallback data (${error.message})`);
    }
    
    const fallbackResult = this.getRealisticRouteOptimization(currentPort, destinationPort, vesselData, selectedPort);
    fallbackResult.dataSource = 'fallback';
    console.log('🔄 Route Optimization: Generated fallback data');
    return fallbackResult;
  }

  /**
   * Optimize discharge sequencing
   */
  async optimizeDischargeSequencing(vesselData, inputData) {
    // Summarize data to reduce prompt size
    const vesselSummary = this.summarizeVesselData(vesselData);
    const plantSummary = this.summarizePlantData(inputData.portToPlant);

    const prompt = `
Optimize discharge sequencing for vessel ${vesselSummary.name}.

VESSEL SUMMARY:
- Capacity: ${vesselSummary.capacity} MT
- Total Cargo: ${vesselSummary.totalCargo} MT (${vesselSummary.parcelCount} parcels)
- Cargo Types: ${vesselSummary.parcelTypes.join(', ')}

PLANT ALLOCATION SUMMARY:
${plantSummary ? 
  `- Plants: ${plantSummary.totalPlants}
- Total Allocation: ${plantSummary.totalAllocation} MT
- Shortfall: ${plantSummary.totalShortfall} MT` : 
  'No plant allocation data available'}

Optimize the sequence to minimize total discharge time and costs. Provide up to 3 discharge points.

Respond in JSON format:
{
  "optimalSequence": [
    {
      "cargoVolume": 15000,
      "sequenceOrder": 1,
      "estimatedDischargeDuration": 12
    }
  ],
  "sequentialDischarges": 2,
  "totalDischargeTime": 24,
  "efficiencyGain": 10
}`;

    try {
      console.log(`📦 Discharge Sequencing: Processing vessel ${vesselData.name} (${vesselData._id})`);
      const text = await this.callGeminiWithRetry(prompt);
      if (text) {
        console.log('✅ Discharge Sequencing: Gemini AI response received');
        const cleanedText = text.replace(/```json\n?|\n?```/g, '');
        const dischargeOptimization = JSON.parse(cleanedText);
        const validatedResult = this.validateDischargeOptimization(dischargeOptimization, vesselData);
        validatedResult.dataSource = 'gemini_ai';
        return validatedResult;
      }
    } catch (error) {
      console.log(`⚠️ Discharge Sequencing: Using fallback data (${error.message})`);
    }
    
    const fallbackResult = this.getRealisticDischargeOptimization(vesselData, inputData);
    fallbackResult.dataSource = 'fallback';
    console.log('🔄 Discharge Sequencing: Generated fallback data');
    return fallbackResult;
  }

  /**
   * Save optimization to database
   */
  async saveOptimization(optimizationData) {
    try {
      // Use findOneAndUpdate with upsert to handle both new and existing optimizations
      const savedOptimization = await Optimization.findOneAndUpdate(
        { vesselId: optimizationData.vesselId },
        optimizationData,
        { upsert: true, new: true, runValidators: true }
      );
      
      console.log(`✅ Optimization saved for vessel ${optimizationData.vesselName} (${optimizationData.vesselId})`);
      return savedOptimization;
    } catch (error) {
      console.error('❌ Error saving optimization:', error);
      throw error;
    }
  }

  /**
   * Retrieve optimization results for a vessel
   */
  async getOptimizationResults(vesselId) {
    try {
      const optimization = await Optimization.findOne({ vesselId }).sort({ createdAt: -1 });
      return optimization;
    } catch (error) {
      console.error('Error retrieving optimization results:', error);
      throw error;
    }
  }

  /**
   * Delete optimization results for a vessel
   */
  async deleteOptimizationResults(vesselId) {
    try {
      const result = await Optimization.findOneAndDelete({ vesselId });
      return result;
    } catch (error) {
      console.error('Error deleting optimization results:', error);
      throw error;
    }
  }

  // Validation and helper methods
  validatePortSelection(portSelection) {
    return {
      selectedPort: {
        name: portSelection.selectedPort?.name || 'Chennai',
        coordinates: portSelection.selectedPort?.coordinates || { lat: 13.0878, lng: 80.2785 },
        capacity: Number(portSelection.selectedPort?.capacity) || 50000,
        efficiency: Number(portSelection.selectedPort?.efficiency) || 85,
        currentCongestion: Number(portSelection.selectedPort?.currentCongestion) || 30,
        costPerTonne: Number(portSelection.selectedPort?.costPerTonne) || 1200
      },
      alternativePorts: Array.isArray(portSelection.alternativePorts) ? 
        portSelection.alternativePorts.slice(0, 3) : [],
      selectionReasoning: portSelection.selectionReasoning || 'Optimized based on efficiency and congestion levels'
    };
  }

  validateRouteOptimization(routeOptimization) {
    return {
      recommendedRoute: {
        waypoints: Array.isArray(routeOptimization.recommendedRoute?.waypoints) ? 
          routeOptimization.recommendedRoute.waypoints.map(wp => ({
            lat: wp.lat,
            lng: wp.lng,
            name: wp.name,
            type: ['port', 'waypoint', 'checkpoint'].includes(wp.type) ? wp.type : 'waypoint'
          })) : [],
        totalDistance: Number(routeOptimization.recommendedRoute?.totalDistance) || 800,
        estimatedTime: Number(routeOptimization.recommendedRoute?.estimatedTime) || 36,
        fuelConsumption: Number(routeOptimization.recommendedRoute?.fuelConsumption) || 180,
        weatherRisk: routeOptimization.recommendedRoute?.weatherRisk || 'medium'
      },
      alternativeRoutes: Array.isArray(routeOptimization.alternativeRoutes) ? 
        routeOptimization.alternativeRoutes : []
    };
  }

  validateDischargeOptimization(dischargeOptimization, vesselData) {
    return {
      optimalSequence: Array.isArray(dischargeOptimization.optimalSequence) ? 
        dischargeOptimization.optimalSequence : [],
      sequentialDischarges: Number(dischargeOptimization.sequentialDischarges) || vesselData.parcels.length,
      totalDischargeTime: Number(dischargeOptimization.totalDischargeTime) || 48,
      efficiencyGain: Number(dischargeOptimization.efficiencyGain) || 10
    };
  }

  // Realistic fallback methods with correlated data
  getRealisticPortSelection(currentPort, vesselData) {
    // Logic based on vessel capacity and current port
    const capacity = vesselData.capacity;
    const isLargeVessel = capacity > 100000;
    
    // Select optimal port based on vessel size and current location
    let selectedPortName;
    if (currentPort === 'Richards Bay' || currentPort === 'Saldanha Bay') {
      selectedPortName = isLargeVessel ? 'Paradip' : 'Chennai';
    } else if (currentPort === 'Port Hedland') {
      selectedPortName = isLargeVessel ? 'Vizag' : 'Chennai';
    } else {
      selectedPortName = isLargeVessel ? 'Paradip' : 'Mumbai';
    }
    
    const selectedPort = this.indianPorts[selectedPortName];
    const congestionLevel = isLargeVessel ? 35 : 25; // Large vessels face more congestion
    const costPerTonne = selectedPort.efficiency > 88 ? 1150 : 1250;
    
    return {
      selectedPort: {
        name: selectedPortName,
        coordinates: { lat: selectedPort.lat, lng: selectedPort.lng },
        capacity: selectedPort.capacity,
        efficiency: selectedPort.efficiency,
        currentCongestion: congestionLevel,
        costPerTonne: costPerTonne
      },
      alternativePorts: this.getAlternativePorts(selectedPortName, isLargeVessel),
      selectionReasoning: `Selected ${selectedPortName} based on vessel capacity (${capacity}MT), port efficiency (${selectedPort.efficiency}%), and optimal distance from ${currentPort}`
    };
  }

  getAlternativePorts(selectedPort, isLargeVessel) {
    const alternatives = [];
    const allPorts = Object.entries(this.indianPorts);
    
    for (const [name, data] of allPorts) {
      if (name === selectedPort) continue;
      
      // Only show suitable alternatives based on vessel size
      if (isLargeVessel && data.capacity < 50000) continue;
      
      alternatives.push({
        name: name,
        coordinates: { lat: data.lat, lng: data.lng },
        efficiency: data.efficiency,
        congestion: data.efficiency > 87 ? 30 : 40,
        costPerTonne: data.efficiency > 87 ? 1200 : 1300,
        reasonForRejection: data.efficiency < 87 ? 'Lower efficiency rating' : 'Higher operational costs'
      });
      
      if (alternatives.length >= 2) break;
    }
    
    return alternatives;
  }

  getRealisticRouteOptimization(originPort, destinationPort, vesselData, selectedPort) {
    const distance = this.calculateDistance(originPort.lat, originPort.lng, destinationPort.lat, destinationPort.lng);
    const vesselSpeed = vesselData.capacity > 100000 ? 11 : 13; // Large vessels are slower
    const estimatedTime = Math.round(distance / vesselSpeed);
    const fuelConsumption = Math.round(distance * (vesselData.capacity > 100000 ? 0.18 : 0.12));
    
    // Generate realistic waypoints
    const midLat = (originPort.lat + destinationPort.lat) / 2;
    const midLng = (originPort.lng + destinationPort.lng) / 2;
    
    return {
      recommendedRoute: {
        routeName: `${vesselData.loadPort} to ${selectedPort.name} - Optimal Maritime Corridor`,
        description: `Direct coastal route optimized for ${vesselData.capacity}MT vessel, considering current weather patterns and traffic density`,
        waypoints: [
          { lat: originPort.lat, lng: originPort.lng, name: `${vesselData.loadPort} Port`, type: 'port' },
          { lat: midLat, lng: midLng, name: 'Navigation Checkpoint', type: 'waypoint' },
          { lat: destinationPort.lat, lng: destinationPort.lng, name: `${selectedPort.name} Port`, type: 'port' }
        ],
        totalDistance: distance,
        estimatedTime: estimatedTime,
        fuelConsumption: fuelConsumption,
        weatherRisk: distance > 1500 ? 'medium' : 'low',
        advantages: [
          'Optimized for vessel size',
          'Weather-adjusted route',
          distance < 1000 ? 'Short distance advantage' : 'Established shipping lane'
        ],
        trafficDensity: distance > 1500 ? 'high' : 'medium'
      },
      alternativeRoutes: [
        {
          routeName: 'Extended Deep Water Route',
          description: 'Longer offshore route avoiding coastal traffic',
          waypoints: [
            { lat: originPort.lat, lng: originPort.lng, name: `${vesselData.loadPort} Port` },
            { lat: originPort.lat - 1.5, lng: originPort.lng + 2, name: 'Deep Water Point' },
            { lat: destinationPort.lat, lng: destinationPort.lng, name: `${selectedPort.name} Port` }
          ],
          totalDistance: Math.round(distance * 1.12),
          estimatedTime: Math.round(estimatedTime * 1.08),
          fuelConsumption: Math.round(fuelConsumption * 1.12),
          riskLevel: 'low',
          advantages: ['Less coastal traffic', 'Better for large vessels'],
          disadvantages: ['12% longer distance', '8% more time required']
        }
      ]
    };
  }

  getRealisticDischargeOptimization(vesselData, inputData) {
    const totalCargo = vesselData.parcels.reduce((sum, p) => sum + p.size, 0);
    const vesselCapacity = vesselData.capacity;
    
    // Simple calculation: discharge time based on vessel capacity and cargo
    const dischargeCycles = Math.ceil(totalCargo / vesselCapacity);
    const dischargeTimePerCycle = vesselCapacity > 100000 ? 36 : 24; // Hours
    const totalDischargeTime = dischargeCycles * dischargeTimePerCycle;
    
    // Simple sequence with 1-3 discharge points
    const dischargePoints = Math.min(3, dischargeCycles);
    const cargoPerPoint = Math.ceil(totalCargo / dischargePoints);
    
    const optimalSequence = [];
    let remainingCargo = totalCargo;
    
    for (let i = 0; i < dischargePoints; i++) {
      const cargoVolume = Math.min(cargoPerPoint, remainingCargo);
      const estimatedDischargeDuration = Math.ceil(cargoVolume / (vesselCapacity > 100000 ? 1500 : 2000)); // MT per hour
      
      optimalSequence.push({
        cargoVolume: cargoVolume,
        sequenceOrder: i + 1,
        estimatedDischargeDuration: estimatedDischargeDuration
      });
      
      remainingCargo -= cargoVolume;
      if (remainingCargo <= 0) break;
    }
    
    // Efficiency gain: 5-15% improvement over naive approach
    const efficiencyGain = Math.min(15, Math.max(5, Math.floor(Math.random() * 10) + 5));
    
    return {
      optimalSequence,
      sequentialDischarges: dischargePoints,
      totalDischargeTime,
      efficiencyGain
    };
  }

  async callGeminiWithRetry(prompt, maxRetries = 3) {
    if (!this.model) {
      console.log('❌ No Gemini model available');
      return null;
    }
    
    // Check and reset daily counter if needed
    const now = Date.now();
    if (now >= this.dailyResetTime.getTime()) {
      this.dailyRequestCount = 0;
      // Set next reset time (next midnight)
      this.dailyResetTime = new Date();
      this.dailyResetTime.setDate(this.dailyResetTime.getDate() + 1);
      this.dailyResetTime.setHours(0, 0, 0, 0);
    }
    
    // More aggressive rate limiting
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Reset counter every 60 seconds
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0;
    }
    
    // Log prompt size for debugging
    const promptTokens = prompt.length / 4; // Rough estimation of tokens
    console.log(`📝 Prompt size: ~${Math.round(promptTokens)} tokens`);
    
    // Check if prompt is too large (reduced limit to 8k tokens for safety)
    if (promptTokens > 8000) {
      console.log(`⚠️ Prompt too large (${Math.round(promptTokens)} tokens), using fallback data`);
      return null;
    }
    
    this.requestCount++;
    this.dailyRequestCount++;
    this.lastRequestTime = now;
    
    console.log(`📡 Sending request to Gemini API... (Daily count: ${this.dailyRequestCount}/150)`);
    
    // Add a timestamp for tracking request start time
    const requestStartTime = Date.now();
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add request timeout (reduced to 10 seconds for better user experience)
        const result = await Promise.race([
          this.model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
          )
        ]);
        
        const response = await result.response;
        const text = response.text().trim();
        
        if (!text || text.length === 0) {
          throw new Error('Empty response from Gemini API');
        }
        
        console.log(`✅ Gemini API call successful (attempt ${attempt + 1})`);
        return text;
      } catch (error) {
        console.log(`⚠️ Gemini API attempt ${attempt + 1} failed: ${error.message}`);
        
        // Check if we've exceeded the 10-second limit for real-time user experience
        const timeElapsed = Date.now() - requestStartTime;
        if (timeElapsed > 10000) {
          console.log(`⏰ Request time exceeded 10 seconds (${timeElapsed}ms), using fallback data`);
          return null;
        }
        
        // Log specific error types
        if (error.message.includes('429')) {
          console.log('🚦 Rate limit exceeded');
          // Implement shorter wait for rate limits to improve user experience
          const isDailyLimit = error.message.includes('200');
          // Reduced wait times for better user experience
          const waitTime = isDailyLimit ? 60000 : 30000; // 1 min for daily, 30 sec for per-minute
          console.log(`⏳ Waiting ${waitTime/1000} seconds due to rate limit...`);
          
          // If wait time is more than 10 seconds, use fallback instead
          if (waitTime > 10000) {
            console.log('⏰ Rate limit wait time exceeds 10 seconds, using fallback data instead');
            return null;
          }
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (error.message.includes('500')) {
          console.log('💥 Server error');
        } else if (error.message.includes('timeout')) {
          console.log('⏰ Request timeout');
        }
        
        if (attempt === maxRetries) {
          // Try next API key if available
          if (await this.tryNextApiKey()) {
            console.log(`🔄 Switched to backup API key (${this.currentKeyIndex + 1}/${this.apiKeys.length})`);
            // Check time limit before trying again
            const timeElapsed = Date.now() - requestStartTime;
            if (timeElapsed > 10000) {
              console.log(`⏰ Request time exceeded 10 seconds (${timeElapsed}ms), using fallback data`);
              return null;
            }
            return this.callGeminiWithRetry(prompt, 1); // One more try with new key
          }
          console.log('❌ All retry attempts failed');
          throw error;
        }
        // Wait before retry with exponential backoff (reduced wait times)
        const waitTime = Math.pow(2, attempt) * 1000; // Reduced base wait time
        console.log(`⏳ Waiting ${Math.ceil(waitTime/1000)} seconds before retry...`);
        
        // If wait time is more than 10 seconds, use fallback instead
        if (waitTime > 10000) {
          console.log('⏰ Retry wait time exceeds 10 seconds, using fallback data instead');
          return null;
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  getRealisticDischargeOptimization(vesselData, inputData) {
    // Get plant allocation data if available
    const plantAllocations = inputData.portToPlant?.analysisData?.plantDistributionAnalysis?.plantAllocations || [];
    
    // Calculate total cargo and discharge parameters
    const totalCargo = vesselData.parcels.reduce((sum, p) => sum + p.size, 0);
    const averageParcelSize = totalCargo / vesselData.parcels.length;
    
    // Discharge rate based on vessel size and cargo type
    const dischargeRatePerHour = averageParcelSize > 30000 ? 1500 : 2000; // MT per hour
    
    // Create discharge sequence based on plant allocations and cargo priorities
    let optimalSequence = [];
    
    if (plantAllocations.length > 0) {
      // Sort plants by shortfall (highest priority first)
      const sortedPlants = [...plantAllocations].sort((a, b) => 
        (b.shortfall || 0) - (a.shortfall || 0)
      );
      
      // Create discharge sequence based on plant priorities
      optimalSequence = sortedPlants.slice(0, 3).map((plant, index) => {
        // Calculate discharge duration based on allocated quantity
        const cargoVolume = Math.min(plant.allocatedQuantity || 0, totalCargo / sortedPlants.length);
        const dischargeDuration = Math.ceil(cargoVolume / dischargeRatePerHour);
        
        return {
          portName: vesselData.loadPort,
          cargoVolume: Math.round(cargoVolume),
          sequenceOrder: index + 1,
          estimatedDischargeDuration: dischargeDuration,
          reasoning: plant.shortfall > 0 
            ? `High priority discharge to address ${plant.shortfall}MT shortfall at ${plant.plantName}`
            : `Standard discharge for ${plant.plantName} allocation`
        };
      });
    } else {
      // Default sequence if no plant data available
      optimalSequence = vesselData.parcels
        .map((parcel, index) => {
          const dischargeDuration = Math.ceil(parcel.size / dischargeRatePerHour);
          
          return {
            portName: vesselData.loadPort,
            cargoVolume: parcel.size,
            sequenceOrder: index + 1,
            estimatedDischargeDuration: dischargeDuration,
            reasoning: parcel.qualityGrade === 'Premium' 
              ? 'High-grade material prioritized for immediate processing'
              : 'Standard discharge sequence'
          };
        })
        .sort((a, b) => {
          // Priority: Premium grade first
          const aIsPremium = a.reasoning.includes('High-grade');
          const bIsPremium = b.reasoning.includes('High-grade');
          
          if (aIsPremium && !bIsPremium) return -1;
          if (!aIsPremium && bIsPremium) return 1;
          return a.sequenceOrder - b.sequenceOrder;
        })
        .map((item, index) => ({ ...item, sequenceOrder: index + 1 }));
    }
    
    // Calculate total discharge time
    const totalDischargeTime = optimalSequence.reduce((total, seq) => total + seq.estimatedDischargeDuration, 0);
    
    // Calculate efficiency gain (compared to sequential discharge of all cargo)
    const baselineTime = Math.ceil(totalCargo / (dischargeRatePerHour * 0.7)); // Less efficient baseline
    const efficiencyGain = Math.max(5, Math.round(((baselineTime - totalDischargeTime) / baselineTime) * 100));
    
    return {
      optimalSequence: optimalSequence.slice(0, 3), // Limit to 3 discharge points
      sequentialDischarges: Math.min(3, optimalSequence.length),
      totalDischargeTime,
      efficiencyGain
    };
  }

  calculateDataQuality(inputData) {
    let score = 0;
    if (inputData.delayPrediction) score += 30;
    if (inputData.portToPlant) score += 30;
    if (inputData.weatherData) score += 20;
    if (inputData.marketConditions) score += 20;
    return score;
  }

  getDefaultWeatherData() {
    return {
      windSpeed: 15,
      waveHeight: 1.5,
      visibility: 'Good',
      severity: 'moderate'
    };
  }

  getDefaultMarketConditions() {
    return {
      fuelPrice: 650,
      portCharges: 1200,
      demurrageRate: 8000,
      exchangeRate: 83.2
    };
  }

  // Additional required methods would be implemented here...
  async optimizeRailTransport(vesselData, inputData) {
    // Implementation for rail transport optimization
    return {
      selectedRoutes: [],
      loadingSchedule: {
        startDate: new Date(),
        estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        dailyLoadingCapacity: 5000,
        rakeUtilization: 85
      }
    };
  }

  async performCostBenefitAnalysis(vesselData, portOpt, routeOpt, dischargeOpt, railOpt, inputData) {
    // Calculate realistic costs based on actual optimization results
    const vesselCapacity = vesselData.capacity;
    const routeDistance = routeOpt.recommendedRoute?.totalDistance || 800;
    const estimatedTime = routeOpt.recommendedRoute?.estimatedTime || 48;
    const fuelConsumption = routeOpt.recommendedRoute?.fuelConsumption || 150;
    const dischargeTime = dischargeOpt.totalDischargeTime || 72;
    const portEfficiency = portOpt.selectedPort?.efficiency || 85;
    
    // Base costs (traditional approach)
    const baseFuelCost = Math.round(fuelConsumption * 1.15 * 680); // Higher fuel consumption
    const basePortCharges = Math.round(vesselCapacity * 1.8); // $1.8 per MT
    const baseDemurrageCost = Math.round((estimatedTime + dischargeTime) * 12 * 8500); // $8500/day
    const baseRailCost = Math.round(vesselCapacity * 280); // $280 per MT
    const traditionalCost = baseFuelCost + basePortCharges + baseDemurrageCost + baseRailCost;
    
    // Optimized costs
    const optimizedFuelCost = Math.round(fuelConsumption * 680); // Optimized route
    const optimizedPortCharges = Math.round(vesselCapacity * (portEfficiency > 88 ? 1.5 : 1.6));
    const efficiencyFactor = Math.max(0.85, (portEfficiency / 100) * (dischargeOpt.efficiencyGain / 100 + 1));
    const optimizedDemurrageCost = Math.round((estimatedTime + dischargeTime) * efficiencyFactor * 8500);
    const optimizedRailCost = Math.round(vesselCapacity * 240); // Better coordination
    const optimizedCost = optimizedFuelCost + optimizedPortCharges + optimizedDemurrageCost + optimizedRailCost;
    
    const costSavings = traditionalCost - optimizedCost;
    const timeSavings = Math.round((estimatedTime + dischargeTime) * (1 - efficiencyFactor));
    const co2Reduction = Math.round((baseFuelCost - optimizedFuelCost) * 0.0031); // 3.1 kg CO2 per liter
    
    return {
      traditional: {
        totalCost: traditionalCost,
        timeRequired: Math.round(estimatedTime + dischargeTime + 24), // Additional buffer time
        fuelCost: baseFuelCost,
        portCharges: basePortCharges,
        demurrageCost: baseDemurrageCost,
        railTransportCost: baseRailCost
      },
      optimized: {
        totalCost: optimizedCost,
        timeRequired: Math.round(estimatedTime + dischargeTime),
        fuelCost: optimizedFuelCost,
        portCharges: optimizedPortCharges,
        demurrageCost: optimizedDemurrageCost,
        railTransportCost: optimizedRailCost
      },
      savings: {
        costSavings: Math.max(costSavings, 0),
        timeSavings: Math.max(timeSavings, 0),
        percentageSavings: Math.round((costSavings / traditionalCost) * 100),
        co2ReductionTonnes: Math.max(co2Reduction, 0)
      }
    };
  }

  async generateMapVisualizationData(vesselData, portOpt, routeOpt, inputData) {
    // Steel Plants by Company
    const companies = {
      'SAIL': {
        color: '#dc2626',
        plants: {
          'Bhilai Steel Plant': { lat: 21.185157, lng: 81.394207, location: 'Bhilai, Chhattisgarh', capacity: 5.5 },
          'Durgapur Steel Plant': { lat: 23.548430, lng: 87.245247, location: 'Durgapur, West Bengal', capacity: 4.2 },
          'Rourkela Steel Plant': { lat: 22.210804, lng: 84.868950, location: 'Rourkela, Odisha', capacity: 4.8 },
          'Bokaro Steel Plant': { lat: 23.671677, lng: 86.106870, location: 'Bokaro Steel City, Jharkhand', capacity: 4.0 },
          'IISCO Steel Plant': { lat: 23.673236, lng: 86.926179, location: 'Burnpur, Asansol, West Bengal', capacity: 1.8 }
        }
      },
      'Tata Steel': {
        color: '#1f2937',
        plants: {
          'Jamshedpur Steel Plant': { lat: 22.802160, lng: 86.185043, location: 'Jamshedpur, Jharkhand', capacity: 9.7 },
          'Kalinganagar Steel Plant': { lat: 21.095833, lng: 86.415833, location: 'Kalinganagar, Odisha', capacity: 3.0 }
        }
      },
      'JSW Steel': {
        color: '#059669',
        plants: {
          'Vijayanagar Steel Plant': { lat: 15.195833, lng: 76.818611, location: 'Toranagallu, Karnataka', capacity: 12.0 },
          'Salem Steel Plant': { lat: 11.664167, lng: 78.146111, location: 'Salem, Tamil Nadu', capacity: 1.0 }
        }
      },
      'Jindal Steel': {
        color: '#7c3aed',
        plants: {
          'Raigarh Steel Plant': { lat: 21.901944, lng: 83.395278, location: 'Raigarh, Chhattisgarh', capacity: 3.6 },
          'Angul Steel Plant': { lat: 20.840556, lng: 85.101389, location: 'Angul, Odisha', capacity: 6.0 }
        }
      },
      'Rashtriya Ispat Nigam': {
        color: '#ea580c',
        plants: {
          'Visakhapatnam Steel Plant': { lat: 17.730556, lng: 83.301389, location: 'Visakhapatnam, Andhra Pradesh', capacity: 7.3 }
        }
      }
    };

    // Major Indian Ports with detailed information
    const majorPorts = {
      'Visakhapatnam': { lat: 17.686815, lng: 83.218483, location: 'Visakhapatnam, Andhra Pradesh', capacity: 100, type: 'major' },
      'Paradip': { lat: 20.265400, lng: 86.676283, location: 'Paradip, Odisha', capacity: 85, type: 'major' },
      'Haldia': { lat: 22.044700, lng: 88.088800, location: 'Haldia, West Bengal', capacity: 75, type: 'major' },
      'Chennai': { lat: 13.0827, lng: 80.2707, location: 'Chennai, Tamil Nadu', capacity: 95, type: 'major' },
      'Mumbai': { lat: 18.9220, lng: 72.8347, location: 'Mumbai, Maharashtra', capacity: 120, type: 'major' },
      'Kandla': { lat: 23.0225, lng: 70.2208, location: 'Kandla, Gujarat', capacity: 110, type: 'major' },
      'Cochin': { lat: 9.9312, lng: 76.2673, location: 'Cochin, Kerala', capacity: 65, type: 'major' },
      'Mangalore': { lat: 12.9141, lng: 74.8560, location: 'Mangalore, Karnataka', capacity: 70, type: 'major' },
      'Tuticorin': { lat: 8.7642, lng: 78.1348, location: 'Tuticorin, Tamil Nadu', capacity: 45, type: 'medium' },
      'Ennore': { lat: 13.2167, lng: 80.3167, location: 'Ennore, Tamil Nadu', capacity: 35, type: 'medium' }
    };

    // Real Railway Routes in India (major freight corridors)
    const railwayRoutes = {
      'Eastern Dedicated Freight Corridor': {
        waypoints: [
          { lat: 22.044700, lng: 88.088800, name: 'Haldia Port', type: 'port' },
          { lat: 22.569722, lng: 88.369722, name: 'Kolkata Junction', type: 'junction' },
          { lat: 23.548430, lng: 87.245247, name: 'Durgapur', type: 'plant' },
          { lat: 23.673236, lng: 86.926179, name: 'IISCO Burnpur', type: 'plant' },
          { lat: 23.671677, lng: 86.106870, name: 'Bokaro', type: 'plant' },
          { lat: 22.802160, lng: 86.185043, name: 'Jamshedpur', type: 'plant' }
        ],
        status: 'operational',
        operator: 'Indian Railways',
        capacity: 'High'
      },
      'South Eastern Railway Coal Corridor': {
        waypoints: [
          { lat: 20.265400, lng: 86.676283, name: 'Paradip Port', type: 'port' },
          { lat: 20.450000, lng: 85.833333, name: 'Bhubaneswar Junction', type: 'junction' },
          { lat: 21.095833, lng: 86.415833, name: 'Kalinganagar', type: 'plant' },
          { lat: 22.210804, lng: 84.868950, name: 'Rourkela', type: 'plant' },
          { lat: 21.901944, lng: 83.395278, name: 'Raigarh', type: 'plant' }
        ],
        status: 'operational',
        operator: 'Indian Railways',
        capacity: 'High'
      },
      'Western Dedicated Freight Corridor': {
        waypoints: [
          { lat: 18.9220, lng: 72.8347, name: 'Mumbai Port', type: 'port' },
          { lat: 23.0225, lng: 70.2208, name: 'Kandla Port', type: 'port' },
          { lat: 21.185157, lng: 81.394207, name: 'Bhilai', type: 'plant' },
          { lat: 20.840556, lng: 85.101389, name: 'Angul', type: 'plant' }
        ],
        status: 'operational',
        operator: 'Indian Railways',
        capacity: 'High'
      },
      'Southern Railway Steel Route': {
        waypoints: [
          { lat: 13.0827, lng: 80.2707, name: 'Chennai Port', type: 'port' },
          { lat: 13.2167, lng: 80.3167, name: 'Ennore Port', type: 'port' },
          { lat: 15.195833, lng: 76.818611, name: 'Vijayanagar', type: 'plant' },
          { lat: 11.664167, lng: 78.146111, name: 'Salem', type: 'plant' }
        ],
        status: 'operational',
        operator: 'Indian Railways',
        capacity: 'Medium'
      },
      'Visakhapatnam Steel Corridor': {
        waypoints: [
          { lat: 17.686815, lng: 83.218483, name: 'Visakhapatnam Port', type: 'port' },
          { lat: 17.730556, lng: 83.301389, name: 'VSP Steel Plant', type: 'plant' },
          { lat: 8.7642, lng: 78.1348, name: 'Tuticorin Port', type: 'port' }
        ],
        status: 'operational',
        operator: 'Indian Railways',
        capacity: 'Medium'
      }
    };

    // Generate realistic vessel position based on route
    const selectedPortCoords = portOpt.selectedPort.coordinates;
    const currentPortCoords = this.indianPorts[vesselData.loadPort] || this.indianPorts['Chennai'];
    
    // Position vessel about 60% along the route
    const progressRatio = 0.6;
    const vesselLat = currentPortCoords.lat + (selectedPortCoords.lat - currentPortCoords.lat) * progressRatio;
    const vesselLng = currentPortCoords.lng + (selectedPortCoords.lng - currentPortCoords.lng) * progressRatio;

    // Calculate bounding box for map centering
    const allLats = [
      vesselLat,
      selectedPortCoords.lat,
      currentPortCoords.lat,
      ...Object.values(majorPorts).map(p => p.lat),
      ...Object.entries(companies).flatMap(([_, companyData]) => Object.values(companyData.plants).map(p => p.lat))
    ];
    const allLngs = [
      vesselLng,
      selectedPortCoords.lng,
      currentPortCoords.lng,
      ...Object.values(majorPorts).map(p => p.lng),
      ...Object.entries(companies).flatMap(([_, companyData]) => Object.values(companyData.plants).map(p => p.lng))
    ];

    const mapBounds = {
      north: Math.max(...allLats) + 1,
      south: Math.min(...allLats) - 1,
      east: Math.max(...allLngs) + 1,
      west: Math.min(...allLngs) - 1,
      center: {
        lat: (Math.max(...allLats) + Math.min(...allLats)) / 2,
        lng: (Math.max(...allLngs) + Math.min(...allLngs)) / 2
      }
    };

    // Comprehensive vessel fleet with sequential discharge routes
    const vesselFleet = [
      // Capesize vessels (150,000+ MT)
      { 
        name: 'MV Iron Giant', capacity: 180000, loadPort: 'Richards Bay', 
        route: ['Visakhapatnam', 'Paradip', 'Haldia'], 
        dischargeSequence: [60000, 60000, 60000],
        currentPosition: { lat: 17.2, lng: 82.8 }, status: 'sailing', 
        company: 'Shipping Corporation of India', cargoType: 'Iron Ore'
      },
      { 
        name: 'MV Steel Titan', capacity: 170000, loadPort: 'Port Hedland', 
        route: ['Chennai', 'Tuticorin', 'Cochin'], 
        dischargeSequence: [70000, 50000, 50000],
        currentPosition: { lat: 12.5, lng: 79.2 }, status: 'sailing',
        company: 'Great Eastern Shipping', cargoType: 'Iron Ore'
      },
      // Panamax vessels (60,000-80,000 MT)
      { 
        name: 'MV Ocean Carrier', capacity: 75000, loadPort: 'Dampier', 
        route: ['Mumbai', 'Kandla'], 
        dischargeSequence: [45000, 30000],
        currentPosition: { lat: 20.5, lng: 71.8 }, status: 'anchored',
        company: 'Essar Shipping', cargoType: 'Iron Ore'
      },
      { 
        name: 'MV Bay Navigator', capacity: 82000, loadPort: 'Saldanha Bay', 
        route: ['Mangalore', 'Chennai'], 
        dischargeSequence: [50000, 32000],
        currentPosition: { lat: 13.8, lng: 74.2 }, status: 'loading',
        company: 'Mercator Lines', cargoType: 'Iron Ore'
      },
      // Handymax vessels (40,000-60,000 MT)
      { 
        name: 'MV Coastal Express', capacity: 55000, loadPort: 'Goa', 
        route: ['Paradip', 'Haldia'], 
        dischargeSequence: [30000, 25000],
        currentPosition: { lat: 21.8, lng: 86.2 }, status: 'discharging',
        company: 'Chowgule Steamships', cargoType: 'Iron Ore'
      },
      { 
        name: 'MV Steel Runner', capacity: 48000, loadPort: 'Krishnapatnam', 
        route: ['Visakhapatnam'], 
        dischargeSequence: [48000],
        currentPosition: { lat: 17.7, lng: 83.3 }, status: 'berthed',
        company: 'Adani Logistics', cargoType: 'Iron Ore'
      },
      // Coking Coal vessels
      { 
        name: 'MV Coal Express', capacity: 90000, loadPort: 'Gladstone', 
        route: ['Visakhapatnam', 'Paradip'], 
        dischargeSequence: [50000, 40000],
        currentPosition: { lat: 18.9, lng: 84.1 }, status: 'sailing',
        company: 'JSW Shipping', cargoType: 'Coking Coal'
      },
      { 
        name: 'MV Black Diamond', capacity: 85000, loadPort: 'Newcastle NSW', 
        route: ['Chennai', 'Ennore'], 
        dischargeSequence: [55000, 30000],
        currentPosition: { lat: 13.1, lng: 80.2 }, status: 'waiting',
        company: 'Tata NYK Shipping', cargoType: 'Coking Coal'
      },
      // Multi-port discharge vessels
      { 
        name: 'MV Multi Trader', capacity: 120000, loadPort: 'Dampier', 
        route: ['Mumbai', 'Kandla', 'Cochin', 'Chennai'], 
        dischargeSequence: [35000, 30000, 25000, 30000],
        currentPosition: { lat: 16.8, lng: 75.4 }, status: 'sailing',
        company: 'Shreyas Shipping', cargoType: 'Iron Ore'
      },
      { 
        name: 'MV Bulk Master', capacity: 95000, loadPort: 'Port Hedland', 
        route: ['Visakhapatnam', 'Chennai', 'Tuticorin'], 
        dischargeSequence: [40000, 35000, 20000],
        currentPosition: { lat: 15.2, lng: 80.8 }, status: 'sailing',
        company: 'Varun Shipping', cargoType: 'Iron Ore'
      }
    ];

    // Generate traffic heat map data
    const trafficHeatMap = [
      // High traffic zones
      { lat: 17.686815, lng: 83.218483, intensity: 0.9, radius: 50, zone: 'Visakhapatnam Port Approach' },
      { lat: 20.265400, lng: 86.676283, intensity: 0.8, radius: 45, zone: 'Paradip Port Approach' },
      { lat: 22.044700, lng: 88.088800, intensity: 0.85, radius: 40, zone: 'Haldia Port Approach' },
      { lat: 13.0827, lng: 80.2707, intensity: 0.7, radius: 55, zone: 'Chennai Port Approach' },
      { lat: 18.9220, lng: 72.8347, intensity: 0.95, radius: 60, zone: 'Mumbai Port Approach' },
      
      // Shipping lanes
      { lat: 18.0, lng: 81.5, intensity: 0.6, radius: 30, zone: 'Eastern Coast Shipping Lane' },
      { lat: 16.5, lng: 80.0, intensity: 0.5, radius: 25, zone: 'Bay of Bengal Corridor' },
      { lat: 15.0, lng: 75.0, intensity: 0.4, radius: 35, zone: 'Western Ghats Passage' },
      { lat: 19.5, lng: 70.0, intensity: 0.55, radius: 40, zone: 'Arabian Sea Route' },
      
      // Congestion zones
      { lat: 21.5, lng: 87.0, intensity: 0.75, radius: 20, zone: 'Hooghly River Mouth' },
      { lat: 12.0, lng: 79.5, intensity: 0.45, radius: 25, zone: 'Palk Strait' }
    ];

    const allVessels = [
      {
        id: vesselData._id,
        name: vesselData.name,
        capacity: vesselData.capacity,
        currentPosition: { lat: vesselLat, lng: vesselLng },
        heading: this.calculateBearing(vesselLat, vesselLng, selectedPortCoords.lat, selectedPortCoords.lng),
        speed: 12,
        status: 'sailing',
        loadPort: vesselData.loadPort,
        destinationPort: portOpt.selectedPort.name,
        route: [portOpt.selectedPort.name],
        dischargeSequence: [vesselData.capacity],
        company: 'Selected Vessel',
        cargoType: 'Iron Ore',
        isSelected: true
      },
      ...vesselFleet.map((vessel, idx) => ({
        id: `fleet_${idx + 1}`,
        name: vessel.name,
        capacity: vessel.capacity,
        currentPosition: vessel.currentPosition,
        heading: this.calculateBearing(vessel.currentPosition.lat, vessel.currentPosition.lng, 
                 majorPorts[vessel.route[0]]?.lat || 17.686815, majorPorts[vessel.route[0]]?.lng || 83.218483),
        speed: vessel.status === 'sailing' ? 10 + Math.random() * 6 : 0,
        status: vessel.status,
        loadPort: vessel.loadPort,
        destinationPort: vessel.route[0],
        route: vessel.route,
        dischargeSequence: vessel.dischargeSequence,
        company: vessel.company,
        cargoType: vessel.cargoType,
        isSelected: false
      }))
    ];

    return {
      vessels: allVessels,
      companies: Object.entries(companies).map(([name, data]) => ({
        name: name,
        color: data.color,
        plantCount: Object.keys(data.plants).length,
        totalCapacity: Object.values(data.plants).reduce((sum, plant) => sum + plant.capacity, 0),
        plants: Object.entries(data.plants).map(([plantName, plantData]) => ({
          name: plantName,
          coordinates: { lat: plantData.lat, lng: plantData.lng },
          location: plantData.location,
          capacity: plantData.capacity,
          company: name
        }))
      })),
      trafficHeatMap: trafficHeatMap,
      shippingLanes: [
        {
          name: 'Eastern Coast Main Shipping Lane',
          waypoints: [
            { lat: 22.5, lng: 88.5 }, { lat: 20.5, lng: 86.8 }, { lat: 18.0, lng: 83.5 }, 
            { lat: 15.5, lng: 81.0 }, { lat: 13.5, lng: 80.5 }, { lat: 11.0, lng: 79.5 }
          ],
          trafficDensity: 'high',
          type: 'main'
        },
        {
          name: 'Western Coast Shipping Lane',
          waypoints: [
            { lat: 23.0, lng: 70.0 }, { lat: 20.0, lng: 72.0 }, { lat: 17.0, lng: 73.5 }, 
            { lat: 14.0, lng: 74.5 }, { lat: 11.0, lng: 75.5 }, { lat: 9.0, lng: 76.0 }
          ],
          trafficDensity: 'medium',
          type: 'secondary'
        },
        {
          name: 'Bay of Bengal Cross Route',
          waypoints: [
            { lat: 17.7, lng: 83.2 }, { lat: 16.5, lng: 82.0 }, { lat: 15.2, lng: 80.8 }, { lat: 13.8, lng: 80.3 }
          ],
          trafficDensity: 'medium',
          type: 'connecting'
        }
      ],
      ports: Object.entries(majorPorts).map(([name, data]) => ({
        name: name,
        coordinates: { lat: data.lat, lng: data.lng },
        location: data.location,
        status: name === portOpt.selectedPort.name ? 'selected' : 'available',
        type: data.type,
        queuedVessels: data.type === 'major' ? Math.floor(Math.random() * 12) + 3 : Math.floor(Math.random() * 6) + 1,
        estimatedWaitTime: data.type === 'major' ? Math.floor(Math.random() * 24) + 6 : Math.floor(Math.random() * 12) + 2,
        capacity: data.capacity,
        efficiency: data.type === 'major' ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 25) + 60,
        utilizationRate: Math.floor(Math.random() * 30) + 60,
        availableBerths: data.type === 'major' ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 4) + 2,
        berthOccupancy: Math.floor(Math.random() * 40) + 50
      })),
      steelPlants: Object.entries(companies).flatMap(([companyName, companyData]) =>
        Object.entries(companyData.plants).map(([plantName, plantData]) => ({
          name: plantName,
          coordinates: { lat: plantData.lat, lng: plantData.lng },
          location: plantData.location,
          company: companyName,
          companyColor: companyData.color,
          status: 'operational',
          capacity: plantData.capacity,
          demandLevel: Math.floor(Math.random() * 40) + 60,
          currentStock: Math.floor(Math.random() * 30) + 20,
          urgency: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          monthlyRequirement: Math.floor(plantData.capacity * 1000 / 12) // MT per month
        }))
      ),
      railRoutes: Object.entries(railwayRoutes).map(([routeName, routeData]) => ({
        routeName: routeName,
        waypoints: routeData.waypoints,
        status: routeData.status,
        operator: routeData.operator,
        capacity: routeData.capacity,
        utilization: Math.floor(Math.random() * 40) + 60,
        averageSpeed: routeData.capacity === 'High' ? 50 : 35, // km/h
        dailyTrains: routeData.capacity === 'High' ? Math.floor(Math.random() * 8) + 12 : Math.floor(Math.random() * 6) + 8
      })),
      vesselRoutes: allVessels.filter(v => v.route && v.route.length > 1).map(vessel => ({
        vesselName: vessel.name,
        route: vessel.route.map((portName, index) => ({
          portName: portName,
          coordinates: majorPorts[portName] ? { lat: majorPorts[portName].lat, lng: majorPorts[portName].lng } : null,
          dischargeAmount: vessel.dischargeSequence[index] || 0,
          sequenceNumber: index + 1,
          estimatedArrival: new Date(Date.now() + (index * 2 * 24 * 60 * 60 * 1000)).toISOString() // 2 days between ports
        })),
        totalCargo: vessel.capacity,
        cargoType: vessel.cargoType,
        company: vessel.company
      })),
      mapBounds: {
        north: Math.max(...allLats) + 2,
        south: Math.min(...allLats) - 2,
        east: Math.max(...allLngs) + 2,
        west: Math.min(...allLngs) - 2,
        center: {
          lat: (Math.max(...allLats) + Math.min(...allLats)) / 2,
          lng: (Math.max(...allLngs) + Math.min(...allLngs)) / 2
        }
      }
    };
  }



  calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  async assessOptimizationRisks(vesselData, inputData) {
    return {
      overallRiskLevel: 'medium',
      riskFactors: [
        {
          category: 'Weather',
          description: 'Moderate weather conditions may affect transit',
          probability: 0.3,
          impact: 0.6,
          mitigation: 'Monitor weather patterns and adjust route if needed'
        }
      ],
      contingencyPlans: ['Alternative port selection', 'Route adjustment protocols']
    };
  }

  async generateRecommendations(vesselData, inputData) {
    return {
      immediate: ['Confirm port berth availability', 'Check weather forecast'],
      shortTerm: ['Optimize loading sequence', 'Coordinate with rail transport'],
      longTerm: ['Consider long-term port contracts', 'Evaluate fleet optimization']
    };
  }

  calculatePerformanceMetrics(costBenefitAnalysis, riskAssessment, inputData) {
    // Calculate efficiency score based on time savings
    const timeSavingsPercent = costBenefitAnalysis.savings.timeSavings > 0 ? 
      Math.min(100, Math.round((costBenefitAnalysis.savings.timeSavings / costBenefitAnalysis.traditional.timeRequired) * 100)) : 0;
    
    // Calculate cost efficiency score based on cost savings
    const costSavingsPercent = costBenefitAnalysis.savings.costSavings > 0 ?
      Math.min(100, Math.round((costBenefitAnalysis.savings.costSavings / costBenefitAnalysis.traditional.totalCost) * 100)) : 0;
    
    // Calculate environmental score based on CO2 reduction
    const co2ReductionPercent = costBenefitAnalysis.savings.co2ReductionTonnes > 0 ?
      Math.min(100, Math.round((costBenefitAnalysis.savings.co2ReductionTonnes / 50) * 100)) : 0; // Assuming 50 tonnes as max
    
    // Calculate reliability score based on risk factors
    const riskScore = riskAssessment.overallRiskLevel === 'low' ? 95 : 
                     riskAssessment.overallRiskLevel === 'medium' ? 80 : 
                     riskAssessment.overallRiskLevel === 'high' ? 60 : 40;
    
    // Calculate overall optimization score as weighted average
    const overallScore = Math.round(
      (timeSavingsPercent * 0.3) + 
      (costSavingsPercent * 0.3) + 
      (co2ReductionPercent * 0.2) + 
      (riskScore * 0.2)
    );
    
    return {
      efficiencyScore: Math.min(100, Math.max(0, timeSavingsPercent + 15)), // Base score + time savings
      reliabilityScore: Math.min(100, riskScore + 5), // Base risk score + buffer
      costEfficiencyScore: Math.min(100, costSavingsPercent + 20), // Base score + cost savings
      environmentalScore: Math.min(100, co2ReductionPercent + 10), // Base score + environmental benefits
      overallOptimizationScore: Math.min(100, overallScore)
    };
  }

  async getCurrentWeatherConditions() {
    return this.getDefaultWeatherData();
  }

  async getMarketConditions() {
    return this.getDefaultMarketConditions();
  }
}

module.exports = new OptimizationService();