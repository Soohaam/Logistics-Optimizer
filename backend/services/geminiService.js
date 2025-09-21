// services/geminiService.js
require("dotenv").config();
// services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
      return analysisData;
    } catch (error) {
      console.error('Gemini API Error:', error);
      console.error('Raw response text:', error.message);
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
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
    "estimatedTransitDays": <calculate based on average rail speeds and distances from ${data.loadPort} to plants>,
    "routeEfficiencyScore": <score 0-100 based on route optimization and rail network efficiency>
  },
  "costBreakdown": {
    "totalRailTransportCost": <estimate total rail transport cost in USD>,
    "demurrageCost": <estimate demurrage cost based on delays>,
    "storageCost": <estimate storage cost based on duration>
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
    "potentialSavings": <estimated savings in USD>
  }
}

IMPORTANT GUIDELINES:
- Base calculations on Indian steel industry standards
- Consider realistic rail freight rates (₹2-4 per ton-km)
- Factor in typical rail transit times (50-100 km/day for freight)
- Consider steel plant locations and rail connectivity
- Provide practical, actionable recommendations
- Ensure all numbers are realistic and industry-appropriate

Return ONLY the JSON response, no additional text, no markdown formatting, no code blocks.`;
  }
}

module.exports = new GeminiService();