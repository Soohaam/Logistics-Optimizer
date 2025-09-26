require("dotenv").config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Realistic cost data based on actual routes
    this.routeCostData = {
      'Haldia': {
        'DSP': { railTransport: 320000, portHandling: 69980, storagePerDay: 1500, demurragePerDay: 15000 },
        'BSL': { railTransport: 480000, portHandling: 69980, storagePerDay: 1500, demurragePerDay: 15000 },
        'ISP': { railTransport: 510400, portHandling: 69980, storagePerDay: 1500, demurragePerDay: 15000 }
      },
      'Paradip': {
        'RSP': { railTransport: 598400, portHandling: 54400, storagePerDay: 2000, demurragePerDay: 11600 }
      },
      'Vizag': {
        'BSP': { railTransport: 888000, portHandling: 60000, storagePerDay: 1800, demurragePerDay: 12000 }
      }
    };
  }

  async analyzePortToPlant(extractedData) {
    try {
      const prompt = this.createAnalysisPrompt(extractedData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let analysisText = response.text();
      
      // Clean the response - remove markdown code blocks if present
      analysisText = analysisText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      console.log('Cleaned Gemini Response:', analysisText);
      
      // Parse the JSON response
      const analysisData = JSON.parse(analysisText);
      
      // Convert estimatedTransitDays to a single number if it's an object
      if (typeof analysisData.railTransportationAnalysis.estimatedTransitDays === 'object') {
        const days = Object.values(analysisData.railTransportationAnalysis.estimatedTransitDays);
        analysisData.railTransportationAnalysis.estimatedTransitDays = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
      }
      
      // Override cost data with realistic values
      const realisticCosts = this.calculateRealisticCosts(extractedData);
      analysisData.costBreakdown.totalRailTransportCost = realisticCosts.totalRailTransportCost;
      analysisData.costBreakdown.demurrageCost = realisticCosts.demurrageCost;
      analysisData.costBreakdown.storageCost = realisticCosts.storageCost;
      
      return analysisData;
    } catch (error) {
      console.error('Gemini API Error:', error);
      console.error('Raw response text:', error.message);
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
  }

  calculateRealisticCosts(extractedData) {
    const loadPort = extractedData.loadPort;
    const totalCargoVolume = extractedData.totalCargoVolume;
    
    // Find the most appropriate route data
    let selectedRoute = null;
    if (this.routeCostData[loadPort] && extractedData.plantAllocations && extractedData.plantAllocations.length > 0) {
      // Try to find exact plant match
      const primaryPlant = extractedData.plantAllocations[0].plantName;
      const plantCode = this.extractPlantCode(primaryPlant);
      
      if (this.routeCostData[loadPort][plantCode]) {
        selectedRoute = this.routeCostData[loadPort][plantCode];
      } else {
        // Use first available route for the port
        const availableRoutes = Object.keys(this.routeCostData[loadPort]);
        if (availableRoutes.length > 0) {
          selectedRoute = this.routeCostData[loadPort][availableRoutes[0]];
        }
      }
    }
    
    // Fallback to default values if no route found
    if (!selectedRoute) {
      selectedRoute = {
        railTransport: 400000,
        portHandling: 65000,
        storagePerDay: 1600,
        demurragePerDay: 13000
      };
    }
    
    // Calculate costs based on cargo volume (scaling factor)
    const scalingFactor = totalCargoVolume / 50000; // Assuming base calculation for 50,000 tonnes
    
    // Estimate storage and demurrage based on typical delays
    const estimatedStorageDays = Math.floor(Math.random() * 5) + 3; // 3-7 days
    const estimatedDemurrageDays = Math.floor(Math.random() * 3) + 1; // 1-3 days
    
    return {
      totalRailTransportCost: Math.round(selectedRoute.railTransport * scalingFactor),
      demurrageCost: Math.round(selectedRoute.demurragePerDay * estimatedDemurrageDays * scalingFactor),
      storageCost: Math.round(selectedRoute.storagePerDay * estimatedStorageDays * scalingFactor)
    };
  }

  extractPlantCode(plantName) {
    // Extract plant codes from full plant names
    const plantMappings = {
      'Durgapur Steel Plant': 'DSP',
      'DSP': 'DSP',
      'Bokaro Steel Limited': 'BSL',
      'BSL': 'BSL',
      'IISCO Steel Plant': 'ISP',
      'ISP': 'ISP',
      'Rourkela Steel Plant': 'RSP',
      'RSP': 'RSP',
      'Bhilai Steel Plant': 'BSP',
      'BSP': 'BSP'
    };
    
    return plantMappings[plantName] || plantName;
  }

  createAnalysisPrompt(data) {
    return `
You are a logistics and supply chain expert analyzing rail transportation from port to steel plants. 
Analyze the following vessel and cargo data to provide comprehensive insights.

INPUT DATA:
${JSON.stringify(data, null, 2)}

Please provide a detailed analysis in the following JSON format. Ensure all numerical values are realistic based on industry standards for steel industry logistics in India:

{
  "railTransportationAnalysis": {
    "estimatedTransitDays": <single integer representing the average estimated transit days across all plants, based on average rail speeds and distances from ${data.loadPort} to plants>,
    "routeEfficiencyScore": <score 0-100 based on route optimization and rail network efficiency>
  },
  "costBreakdown": {
    "totalRailTransportCost": <estimate total rail transport cost in Rs>,
    "demurrageCost": <estimate demurrage cost based on delays in Rs>,
    "storageCost": <estimate storage cost based on duration in Rs>
  },
  "rakeAnalysis": {
    "utilizationByTrip": [
      {"tripNumber": 1, "utilization": <percentage utilization for trip 1>},
      {"tripNumber": 2, "utilization": <percentage utilization for trip 2>},
      {"tripNumber": 3, "utilization": <percentage utilization for trip 3>}
    ],
    "loadingEfficiency": <percentage efficiency of loading operations>
  },
  "plantDistributionAnalysis": {
    "plantAllocations": [
      {
        "plantName": "<plant name from input>",
        "priorityLevel": "<High/Medium/Low based on stock shortage>",
        "estimatedDeliveryDays": <days to deliver to this plant>
      }
    ],
    "allocationEfficiency": <percentage efficiency of plant distribution>
  },
  "timelineAnalysis": {
    "transitPhase": {
      "estimatedDuration": <total transit duration in days>,
      "milestones": [
        {
          "plantName": "<plant name>",
          "estimatedArrival": "<date in ISO format>",
          "status": "Scheduled"
        }
      ]
    }
  },
  "performanceMetrics": {
    "deliveryReliabilityScore": <score 0-100 based on factors like rail availability and route efficiency>,
    "costEfficiencyScore": <score 0-100 based on cost optimization>,
    "timeEfficiencyScore": <score 0-100 based on transit time optimization>
  },
  "riskAssessment": {
    "riskLevel": "<Low/Medium/High based on overall assessment>",
    "riskFactors": [
      {
        "factor": "<risk factor description>",
        "severity": <1-10>,
        "probability": <1-10>
      }
    ],
    "mitigationStrategies": ["<strategy 1>", "<strategy 2>"]
  },
  "optimizationRecommendations": {
    "immediate": ["<immediate recommendation 1>", "<immediate recommendation 2>"],
    "shortTerm": ["<short term recommendation 1>", "<short term recommendation 2>"],
    "longTerm": ["<long term recommendation 1>", "<long term recommendation 2>"],
    "potentialSavings": <estimated savings in Rs>
  }
}

IMPORTANT GUIDELINES:
- Base calculations on Indian steel industry standards
- Consider realistic rail freight rates (₹2-4 per ton-km)
- Factor in typical rail transit times (50-100 km/day for freight)
- Consider steel plant locations and rail connectivity
- Provide practical, actionable recommendations
- Ensure all numbers are realistic and industry-appropriate
- All cost values should be in Indian Rupees (Rs)

Return ONLY the JSON response, no additional text, no markdown formatting, no code blocks.`;
  }
}

module.exports = new GeminiService();