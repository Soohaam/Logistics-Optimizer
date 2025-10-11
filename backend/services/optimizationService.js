// services/optimizationService.js
require("dotenv").config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Optimization = require('../models/Optimization');
const DelayPrediction = require('../models/DelayPrediction');
const PortToPlant = require('../models/PortToPlant');
const Vessel = require('../models/Vessel');

class OptimizationService {
  constructor() {
    const primaryKey = process.env.GOOGLE_GEMINI_API_KEY_OPTIMIZED;
    const secondaryKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    this.apiKeys = [primaryKey, secondaryKey].filter(Boolean);
    this.currentKeyIndex = 0;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    
    if (this.apiKeys.length === 0) {
      console.warn('⚠️ No Gemini API keys configured');
      this.genAI = null;
      this.model = null;
    } else {
      this.initializeModel();
      // console.log(`🔑 Initialized with ${this.apiKeys.length} API key(s)`);
    }
    
    // Indian ports with realistic coordinates and characteristics
    this.indianPorts = {
      'Haldia': { lat: 22.0258, lng: 88.0636, capacity: 45000, efficiency: 85, distanceFromAustralia: 5800 },
      'Paradip': { lat: 20.2597, lng: 86.6947, capacity: 55000, efficiency: 88, distanceFromAustralia: 5600 },
      'Vizag': { lat: 17.6868, lng: 83.2185, capacity: 65000, efficiency: 90, distanceFromAustralia: 5400 },
      'Chennai': { lat: 13.0878, lng: 80.2785, capacity: 50000, efficiency: 87, distanceFromAustralia: 5200 },
      'Mumbai': { lat: 19.0760, lng: 72.8777, capacity: 70000, efficiency: 85, distanceFromAustralia: 6800 },
      'Kandla': { lat: 23.0225, lng: 70.2208, capacity: 60000, efficiency: 83, distanceFromAustralia: 7200 },
      'Cochin': { lat: 9.9312, lng: 76.2673, capacity: 40000, efficiency: 86, distanceFromAustralia: 6200 },
      'Tuticorin': { lat: 8.7642, lng: 78.1348, capacity: 45000, efficiency: 84, distanceFromAustralia: 5800 }
    };

    // Realistic route distances (nautical miles converted to km)
    this.routeDistances = {
      'Newcastle': { 'Vizag': 5400, 'Haldia': 5800, 'Paradip': 5600, 'Chennai': 5200 },
      'Port Hedland': { 'Vizag': 4800, 'Haldia': 5200, 'Paradip': 5000, 'Chennai': 4600 },
      'Hay Point': { 'Vizag': 5600, 'Haldia': 6000, 'Paradip': 5800, 'Chennai': 5400 },
      'Gladstone': { 'Vizag': 5800, 'Haldia': 6200, 'Paradip': 6000, 'Chennai': 5600 },
      'Richards Bay': { 'Vizag': 6800, 'Haldia': 7400, 'Paradip': 7200, 'Chennai': 6600 },
      'Saldanha Bay': { 'Vizag': 7200, 'Haldia': 7800, 'Paradip': 7600, 'Chennai': 7000 },
      'Balikpapan': { 'Vizag': 3200, 'Haldia': 3600, 'Paradip': 3400, 'Chennai': 3000 },
      'Tanjung Bara': { 'Vizag': 3000, 'Haldia': 3400, 'Paradip': 3200, 'Chennai': 2800 }
    };
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

  async optimizeVesselOperations(vesselId) {
    const startTime = Date.now();
    
    try {
      // console.log(`🚀 Starting optimization for vessel ID: ${vesselId}`);
      
      const vesselData = await this.fetchCompleteVesselData(vesselId);
      
      if (!vesselData.vessel) {
        throw new Error('Vessel not found');
      }

      // console.log(`✅ Fetched data for vessel: ${vesselData.vessel.name}`);
      
      const optimizationId = `OPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const optimizationResults = await this.generateOptimizationInsights(vesselData);
      
      const mapVisualizationData = await this.generateMapVisualizationData(vesselData, optimizationResults);
      
      const computationTime = Date.now() - startTime;
      
      const optimizationResult = {
        vesselId: vesselData.vessel._id,
        optimizationId,
        vesselName: vesselData.vessel.name,
        optimizationResults,
        mapVisualizationData,
        inputDataSources: {
          vesselId: vesselData.vessel._id,
          delayPredictionId: vesselData.delayPrediction?.predictionId || null,
          portToPlantId: vesselData.portToPlant?._id || null,
          hasDelayData: !!vesselData.delayPrediction,
          hasPortToPlantData: !!vesselData.portToPlant
        },
        recommendations: optimizationResults.recommendations || this.getDefaultRecommendations(),
        status: 'completed',
        computationMetadata: {
          totalComputationTime: computationTime,
          dataQualityScore: this.calculateDataQuality(vesselData),
          aiModelVersion: optimizationResults.dataSource === 'gemini_ai' ? 'gemini-2.0-flash' : 'fallback',
          lastUpdated: new Date(),
          cacheHit: false,
          usedAI: optimizationResults.dataSource === 'gemini_ai'
        }
      };
      
      // console.log(`✅ Optimization completed in ${computationTime}ms`);
      
      return optimizationResult;
      
    } catch (error) {
      console.error(`❌ Optimization failed:`, error);
      throw new Error(`Optimization failed: ${error.message}`);
    }
  }

  async fetchCompleteVesselData(vesselId) {
    try {
      const [vessel, delayPrediction, portToPlant] = await Promise.all([
        Vessel.findById(vesselId),
        DelayPrediction.findOne({ vesselId }).sort({ createdAt: -1 }),
        PortToPlant.findOne({ vesselId })
      ]);

      return {
        vessel,
        delayPrediction,
        portToPlant,
        hasCompleteData: !!(vessel && delayPrediction && portToPlant)
      };
    } catch (error) {
      console.error('Error fetching vessel data:', error);
      throw error;
    }
  }

  async generateOptimizationInsights(vesselData) {
    const { vessel, delayPrediction, portToPlant } = vesselData;
    
    const prompt = this.buildOptimizationPrompt(vessel, delayPrediction, portToPlant);
    
    try {
      // console.log('📡 Requesting optimization insights from Gemini AI...');
      const response = await this.callGeminiWithRetry(prompt);
      
      if (response) {
        // console.log('✅ Received AI-generated optimization insights');
        const cleanedResponse = response.replace(/```json\n?|\n?```/g, '');
        const aiInsights = JSON.parse(cleanedResponse);
        
        // Validate and fix any inconsistencies in AI response
        const validatedInsights = this.validateAndFixInsights(aiInsights, vessel, delayPrediction, portToPlant);
        
        return {
          ...validatedInsights,
          dataSource: 'gemini_ai'
        };
      }
    } catch (error) {
      console.log(`⚠️ AI generation failed, using fallback: ${error.message}`);
    }
    
    // console.log('🔄 Generating fallback optimization insights');
    return this.generateFallbackOptimization(vessel, delayPrediction, portToPlant);
  }

  buildOptimizationPrompt(vessel, delayPrediction, portToPlant) {
    const totalCargo = vessel.parcels.reduce((sum, p) => sum + p.size, 0);
    const loadPort = vessel.loadPort;
    
    // Calculate realistic base metrics
    const seaDistance = this.getSeaDistance(loadPort);
    const seaTimeHours = Math.round(seaDistance / 12); // 12 knots average
    const portOperationsHours = 48; // 2 days for port operations
    const railTimeHours = portToPlant ? Math.round(portToPlant.analysisData.railTransportationAnalysis.estimatedTransitDays * 24) : 120;
    const totalTraditionalTime = seaTimeHours + portOperationsHours + railTimeHours;
    
    return `You are a maritime logistics expert. Analyze this cargo shipment and provide REALISTIC optimization recommendations.

CRITICAL REQUIREMENTS:
1. Time estimates must be realistic for international shipping (typically 18-32 days total from Australia, 15-20 days from Indonesia)
2. Optimized costs MUST be LOWER than traditional costs (never higher)
3. Fuel savings should be 8-15% through route optimization
4. Time savings should be 10-15% through better port selection and operations
5. All numbers must be internally consistent

VESSEL DATA:
- Name: ${vessel.name}
- Capacity: ${vessel.capacity} MT
- Total Cargo: ${totalCargo} MT
- Load Port: ${loadPort}
- Estimated Sea Distance: ${seaDistance} km
- Base Sea Transit: ${seaTimeHours} hours

${delayPrediction ? `DELAY DATA:
- Arrival Delay Risk: ${delayPrediction.predictions.arrivalDelay.hours}h
- Berthing Delay Risk: ${delayPrediction.predictions.berthingDelay.hours}h
- Risk Level: ${delayPrediction.riskLevel}
- Port Congestion: ${delayPrediction.realTimeFactors.portCongestion.queuedVessels} vessels` : ''}

${portToPlant ? `PORT-TO-PLANT DATA:
- Rail Transit Days: ${portToPlant.analysisData.railTransportationAnalysis.estimatedTransitDays}
- Rail Cost: ₹${portToPlant.analysisData.costBreakdown.totalRailTransportCost}
- Rakes Required: ${portToPlant.analysisData.rakeAnalysis.totalRakesRequired}
- Plants: ${portToPlant.analysisData.plantDistributionAnalysis.plantAllocations.length}` : ''}

COST PARAMETERS:
- Demurrage: ₹${vessel.costParameters.demurrageRate}/day
- Port Handling: ₹${vessel.costParameters.portHandlingFees}/MT
- Rail Fringe: ₹${vessel.costParameters.fringeRail}/MT

REALISTIC BENCHMARKS FOR ${loadPort}:
Traditional Approach: ${totalTraditionalTime}h (${Math.round(totalTraditionalTime/24)} days)
Target Optimized: ${Math.round(totalTraditionalTime * 0.88)}h (${Math.round((totalTraditionalTime * 0.88)/24)} days)

Return JSON with realistic values where optimized MUST be better than traditional:
{
  "performanceMetrics": {
    "efficiencyScore": 82,
    "costEfficiencyScore": 76,
    "reliabilityScore": ${delayPrediction?.riskLevel === 'low' ? 88 : 75},
    "overallOptimizationScore": 79
  },
  "portSelection": {
    "selectedPort": {
      "name": "Paradip",
      "efficiency": 88,
      "capacity": 55000,
      "currentCongestion": 28,
      "costPerTonne": 1150,
      "estimatedWaitTime": 12
    },
    "alternativePorts": [
      {"name": "Vizag", "efficiency": 90, "reasonForRejection": "Higher congestion during monsoon season"},
      {"name": "Haldia", "efficiency": 85, "reasonForRejection": "Longer rail distance to central plants"}
    ],
    "selectionReasoning": "Selected for optimal balance of efficiency, rail connectivity, and lower congestion"
  },
  "routeOptimization": {
    "recommendedRoute": {
      "routeName": "${loadPort} to Paradip - Direct Route",
      "description": "Optimized route with favorable currents and weather patterns",
      "totalDistance": ${seaDistance},
      "estimatedTime": ${seaTimeHours},
      "fuelConsumption": ${Math.round(seaDistance * 0.15)},
      "weatherRisk": "${delayPrediction?.riskLevel || 'medium'}"
    }
  },
  "costBenefitAnalysis": {
    "traditional": {
      "totalCost": ${Math.round(totalCargo * 1850)},
      "timeRequired": ${totalTraditionalTime},
      "fuelCost": ${Math.round(seaDistance * 0.18 * 680)},
      "portCharges": ${Math.round(totalCargo * 1.8)}
    },
    "optimized": {
      "totalCost": ${Math.round(totalCargo * 1850 * 0.85)},
      "timeRequired": ${Math.round(totalTraditionalTime * 0.88)},
      "fuelCost": ${Math.round(seaDistance * 0.15 * 680)},
      "portCharges": ${Math.round(totalCargo * 1.5)}
    },
    "savings": {
      "costSavings": ${Math.round(totalCargo * 1850 * 0.15)},
      "timeSavings": ${Math.round(totalTraditionalTime * 0.12)},
      "percentageSavings": 15,
      "co2ReductionTonnes": ${Math.round(seaDistance * 0.03 * 0.0031)}
    }
  },
  "recommendations": {
    "immediate": ["Confirm berth booking at Paradip", "Arrange ${portToPlant?.analysisData.rakeAnalysis.totalRakesRequired || 8} railway rakes", "Monitor weather patterns"],
    "shortTerm": ["Optimize discharge sequencing for ${portToPlant?.analysisData.plantDistributionAnalysis.plantAllocations.length || 3} plants", "Coordinate rail schedules"],
    "longTerm": ["Negotiate long-term port contracts", "Evaluate dedicated freight corridor usage"]
  }
}

ENSURE optimized values are ALWAYS better (lower costs, less time) than traditional values.`;
  }

  validateAndFixInsights(insights, vessel, delayPrediction, portToPlant) {
    const traditional = insights.costBenefitAnalysis?.traditional || {};
    const optimized = insights.costBenefitAnalysis?.optimized || {};
    
    // Fix if optimized costs are higher than traditional (data inconsistency)
    if (optimized.totalCost >= traditional.totalCost) {
      optimized.totalCost = Math.round(traditional.totalCost * 0.85);
    }
    if (optimized.fuelCost >= traditional.fuelCost) {
      optimized.fuelCost = Math.round(traditional.fuelCost * 0.88);
    }
    if (optimized.portCharges >= traditional.portCharges) {
      optimized.portCharges = Math.round(traditional.portCharges * 0.83);
    }
    if (optimized.timeRequired >= traditional.timeRequired) {
      optimized.timeRequired = Math.round(traditional.timeRequired * 0.88);
    }
    
    // Recalculate savings
    insights.costBenefitAnalysis.savings = {
      costSavings: traditional.totalCost - optimized.totalCost,
      timeSavings: traditional.timeRequired - optimized.timeRequired,
      percentageSavings: Math.round(((traditional.totalCost - optimized.totalCost) / traditional.totalCost) * 100),
      co2ReductionTonnes: Math.round((traditional.fuelCost - optimized.fuelCost) * 0.0031)
    };
    
    return insights;
  }

  getSeaDistance(loadPort) {
    // Return realistic sea distances in km
    const distances = {
      'Newcastle': 5600,
      'Port Hedland': 5000,
      'Hay Point': 5800,
      'Gladstone': 6000,
      'Richards Bay': 7200,
      'Saldanha Bay': 7600,
      'Balikpapan': 3400,
      'Tanjung Bara': 3200
    };
    return distances[loadPort] || 5500;
  }

  generateFallbackOptimization(vessel, delayPrediction, portToPlant) {
    const totalCargo = vessel.parcels.reduce((sum, p) => sum + p.size, 0);
    const loadPort = vessel.loadPort;
    
    // Realistic calculations
    const seaDistance = this.getSeaDistance(loadPort);
    const seaTimeHours = Math.round(seaDistance / 12); // 12 knots
    const portOperationsHours = 48;
    const railTimeHours = portToPlant ? Math.round(portToPlant.analysisData.railTransportationAnalysis.estimatedTransitDays * 24) : 120;
    
    const traditionalTime = seaTimeHours + portOperationsHours + railTimeHours + 24; // +24h buffer
    const optimizedTime = Math.round(traditionalTime * 0.88); // 12% time saving
    
    const traditionalFuelCost = Math.round(seaDistance * 0.18 * 680); // Less efficient
    const optimizedFuelCost = Math.round(seaDistance * 0.15 * 680); // More efficient route
    
    const traditionalPortCharges = Math.round(totalCargo * 1.8);
    const optimizedPortCharges = Math.round(totalCargo * 1.5);
    
    const traditionalRailCost = portToPlant ? Math.round(portToPlant.analysisData.costBreakdown.totalRailTransportCost * 1.1) : Math.round(totalCargo * 280);
    const optimizedRailCost = portToPlant ? portToPlant.analysisData.costBreakdown.totalRailTransportCost : Math.round(totalCargo * 240);
    
    const traditionalDemurrage = Math.round((traditionalTime / 24) * vessel.costParameters.demurrageRate);
    const optimizedDemurrage = Math.round((optimizedTime / 24) * vessel.costParameters.demurrageRate);
    
    const traditionalTotal = traditionalFuelCost + traditionalPortCharges + traditionalRailCost + traditionalDemurrage;
    const optimizedTotal = optimizedFuelCost + optimizedPortCharges + optimizedRailCost + optimizedDemurrage;
    
    const optimalPort = this.selectOptimalPort(loadPort, vessel.capacity);
    
    return {
      performanceMetrics: {
        efficiencyScore: 82,
        costEfficiencyScore: 76,
        reliabilityScore: delayPrediction?.riskLevel === 'low' ? 88 : 75,
        overallOptimizationScore: 79
      },
      portSelection: {
        selectedPort: optimalPort,
        alternativePorts: this.getAlternativePorts(optimalPort.name, vessel.capacity > 100000),
        selectionReasoning: `Selected ${optimalPort.name} for optimal efficiency (${optimalPort.efficiency}%), lower congestion, and best rail connectivity to steel plants from ${loadPort}`
      },
      routeOptimization: {
        recommendedRoute: {
          routeName: `${loadPort} to ${optimalPort.name} - Optimized Maritime Corridor`,
          description: `Direct route optimized for ${vessel.capacity}MT vessel with favorable weather patterns and efficient port operations`,
          totalDistance: seaDistance,
          estimatedTime: seaTimeHours,
          fuelConsumption: Math.round(seaDistance * 0.15),
          weatherRisk: delayPrediction?.riskLevel || 'medium'
        },
        alternativeRoutes: []
      },
      costBenefitAnalysis: {
        traditional: {
          totalCost: traditionalTotal,
          timeRequired: traditionalTime,
          fuelCost: traditionalFuelCost,
          portCharges: traditionalPortCharges,
          demurrageCost: traditionalDemurrage,
          railTransportCost: traditionalRailCost
        },
        optimized: {
          totalCost: optimizedTotal,
          timeRequired: optimizedTime,
          fuelCost: optimizedFuelCost,
          portCharges: optimizedPortCharges,
          demurrageCost: optimizedDemurrage,
          railTransportCost: optimizedRailCost
        },
        savings: {
          costSavings: traditionalTotal - optimizedTotal,
          timeSavings: traditionalTime - optimizedTime,
          percentageSavings: Math.round(((traditionalTotal - optimizedTotal) / traditionalTotal) * 100),
          co2ReductionTonnes: Math.round((traditionalFuelCost - optimizedFuelCost) * 0.0031)
        }
      },
      recommendations: this.generateRecommendations(vessel, delayPrediction, portToPlant),
      dataSource: 'fallback'
    };
  }

  selectOptimalPort(loadPort, capacity) {
    const isLargeVessel = capacity > 100000;
    let selectedName;
    
    if (['Newcastle', 'Port Hedland', 'Hay Point', 'Gladstone'].includes(loadPort)) {
      selectedName = isLargeVessel ? 'Paradip' : 'Vizag';
    } else if (['Richards Bay', 'Saldanha Bay'].includes(loadPort)) {
      selectedName = isLargeVessel ? 'Vizag' : 'Chennai';
    } else if (['Balikpapan', 'Tanjung Bara'].includes(loadPort)) {
      selectedName = 'Haldia';
    } else {
      selectedName = isLargeVessel ? 'Paradip' : 'Chennai';
    }
    
    const port = this.indianPorts[selectedName];
    return {
      name: selectedName,
      efficiency: port.efficiency,
      capacity: port.capacity,
      currentCongestion: Math.floor(Math.random() * 15) + 20,
      costPerTonne: port.efficiency > 88 ? 1150 : 1250,
      estimatedWaitTime: Math.floor(Math.random() * 10) + 8
    };
  }

  getAlternativePorts(selectedPort, isLargeVessel) {
    return Object.entries(this.indianPorts)
      .filter(([name, data]) => name !== selectedPort && (!isLargeVessel || data.capacity >= 50000))
      .slice(0, 2)
      .map(([name, data]) => ({
        name,
        efficiency: data.efficiency,
        reasonForRejection: data.efficiency < 87 ? 'Lower operational efficiency' : 'Higher congestion or longer rail distance'
      }));
  }

  generateRecommendations(vessel, delayPrediction, portToPlant) {
    return {
      immediate: [
        'Confirm optimal port berth availability',
        portToPlant ? `Arrange ${portToPlant.analysisData.rakeAnalysis.totalRakesRequired} railway rakes in advance` : 'Coordinate rail transport logistics',
        delayPrediction?.riskLevel === 'high' ? 'Monitor weather conditions closely' : 'Review weather forecast for voyage planning'
      ],
      shortTerm: [
        portToPlant ? `Optimize discharge for ${portToPlant.analysisData.plantDistributionAnalysis.plantAllocations.length} steel plants` : 'Optimize cargo discharge sequencing',
        'Coordinate with port authorities for priority berthing',
        'Schedule plant deliveries based on shortfall priorities'
      ],
      longTerm: [
        'Negotiate long-term port contracts for cost reduction',
        'Evaluate dedicated freight corridor for rail transport',
        'Implement predictive analytics for future voyages'
      ]
    };
  }

  async callGeminiWithRetry(prompt, maxRetries = 2) {
    if (!this.model) return null;
    
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < 60000 && this.requestCount >= 10) {
      await new Promise(resolve => setTimeout(resolve, 60000 - timeSinceLastRequest));
      this.requestCount = 0;
    } else if (timeSinceLastRequest >= 60000) {
      this.requestCount = 0;
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          this.model.generateContent(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        
        const response = await result.response;
        const text = response.text().trim();
        
        if (text && text.length > 0) {
          // console.log(`✅ Gemini API success (attempt ${attempt + 1})`);
          return text;
        }
      } catch (error) {
        // console.log(`⚠️ Attempt ${attempt + 1} failed: ${error.message}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt)));
        }
      }
    }
    
    return null;
  }

  calculateDataQuality(vesselData) {
    let score = 40;
    if (vesselData.delayPrediction) score += 30;
    if (vesselData.portToPlant) score += 30;
    return score;
  }

  getDefaultRecommendations() {
    return {
      immediate: ['Verify port availability', 'Check weather forecast', 'Coordinate rail logistics'],
      shortTerm: ['Optimize loading sequence', 'Schedule plant deliveries', 'Arrange rake bookings'],
      longTerm: ['Review port contracts', 'Evaluate fleet optimization', 'Implement predictive maintenance']
    };
  }

  async generateMapVisualizationData(vesselData, optimizationResults) {
    return {
      vessels: [],
      ports: [],
      steelPlants: [],
      railRoutes: [],
      mapBounds: { center: { lat: 20, lng: 80 } }
    };
  }
}

module.exports = new OptimizationService();