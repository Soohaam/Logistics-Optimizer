const DelayPrediction = require('../models/DelayPrediction');
const PortToPlant = require('../models/PortToPlant');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const optimizationService = {
  
  // Get combined data and perform optimization calculations
  async getOptimizationAnalysis(vesselId) {
    try {
      // Fetch data from both models
      const [delayData, portToPlantData] = await Promise.all([
        DelayPrediction.findOne({ vesselId }).populate('vesselId'),
        PortToPlant.findOne({ vesselId }).populate('vesselId')
      ]);

      if (!delayData && !portToPlantData) {
        throw new Error('No data found for the specified vessel');
      }

      // Combine and process the data
      const combinedData = this.combineVesselData(delayData, portToPlantData);
      
      // Perform optimization calculations
      const optimizationResults = this.calculateOptimizations(combinedData);
      
      return optimizationResults;
      
    } catch (error) {
      console.error('Error in getOptimizationAnalysis:', error);
      throw error;
    }
  },

  // Regenerate analysis using Gemini AI
  async regenerateOptimizationWithAI(vesselId) {
    try {
      // Fetch raw data
      const [delayData, portToPlantData] = await Promise.all([
        DelayPrediction.findOne({ vesselId }).populate('vesselId'),
        PortToPlant.findOne({ vesselId }).populate('vesselId')
      ]);

      if (!delayData && !portToPlantData) {
        throw new Error('No data found for the specified vessel');
      }

      // Prepare data for AI analysis
      const inputData = this.prepareDataForAI(delayData, portToPlantData);
      
      // Generate optimized analysis using Gemini
      const aiOptimizedData = await this.generateAIOptimization(inputData);
      
      return aiOptimizedData;
      
    } catch (error) {
      console.error('Error in regenerateOptimizationWithAI:', error);
      throw error;
    }
  },

  // Combine data from both models
  combineVesselData(delayData, portToPlantData) {
    const vesselInfo = delayData?.vesselId || portToPlantData?.vesselId;
    
    return {
      vesselId: vesselInfo?._id,
      vesselName: vesselInfo?.vesselName || portToPlantData?.vesselName,
      
      // Delay prediction data
      delayPredictions: delayData ? {
        arrivalDelay: delayData.predictions?.arrivalDelay || { hours: 0, confidence: 0 },
        berthingDelay: delayData.predictions?.berthingDelay || { hours: 0, confidence: 0 },
        realTimeFactors: delayData.realTimeFactors || {},
        riskLevel: delayData.riskLevel || 'low'
      } : null,
      
      // Port to plant data
      portToPlantData: portToPlantData ? {
        railTransportation: portToPlantData.analysisData?.railTransportationAnalysis || {},
        costBreakdown: portToPlantData.analysisData?.costBreakdown || {},
        rakeAnalysis: portToPlantData.analysisData?.rakeAnalysis || {},
        plantDistribution: portToPlantData.analysisData?.plantDistributionAnalysis || {},
        performanceMetrics: portToPlantData.analysisData?.performanceMetrics || {}
      } : null,
      
      timestamp: new Date()
    };
  },

  // Calculate optimization recommendations
  calculateOptimizations(combinedData) {
    const optimizations = {
      vesselId: combinedData.vesselId,
      vesselName: combinedData.vesselName,
      
      // Port optimization
      portOptimization: this.calculatePortOptimization(combinedData),
      
      // Rail optimization
      railOptimization: this.calculateRailOptimization(combinedData),
      
      // Cost optimization
      costOptimization: this.calculateCostOptimization(combinedData),
      
      // Time optimization
      timeOptimization: this.calculateTimeOptimization(combinedData),
      
      // Risk mitigation
      riskMitigation: this.calculateRiskMitigation(combinedData),
      
      // Overall recommendations
      overallRecommendations: this.generateOverallRecommendations(combinedData),
      
      // Comparison metrics
      comparisonMetrics: this.generateComparisonMetrics(combinedData),
      
      timestamp: combinedData.timestamp
    };

    return optimizations;
  },

  // Port optimization calculations
  calculatePortOptimization(data) {
    const traditional = {
      waitTime: data.delayPredictions?.arrivalDelay?.hours || 0,
      berthingDelay: data.delayPredictions?.berthingDelay?.hours || 0,
      handlingCost: data.portToPlantData?.costBreakdown?.portHandlingCost || 0,
      congestionLevel: data.delayPredictions?.realTimeFactors?.portCongestion?.congestionLevel || 'low'
    };

    const optimized = {
      waitTime: Math.max(0, traditional.waitTime * 0.7), // 30% reduction
      berthingDelay: Math.max(0, traditional.berthingDelay * 0.8), // 20% reduction
      handlingCost: traditional.handlingCost * 0.85, // 15% cost reduction
      congestionLevel: this.improveCongestionLevel(traditional.congestionLevel)
    };

    return {
      traditional,
      optimized,
      improvements: {
        waitTimeReduction: traditional.waitTime - optimized.waitTime,
        berthingDelayReduction: traditional.berthingDelay - optimized.berthingDelay,
        costSavings: traditional.handlingCost - optimized.handlingCost,
        efficiencyGain: 25 // percentage
      },
      recommendations: [
        'Implement priority berthing for critical shipments',
        'Use predictive port congestion analytics',
        'Optimize cargo handling sequences',
        'Coordinate with port authorities for slot optimization'
      ]
    };
  },

  // Rail optimization calculations
  calculateRailOptimization(data) {
    const railData = data.portToPlantData?.railTransportation || {};
    const rakeData = data.portToPlantData?.rakeAnalysis || {};

    const traditional = {
      transitDays: railData.estimatedTransitDays || 0,
      rakeUtilization: railData.rakeUtilizationEfficiency || 0,
      loadingDays: railData.loadingDaysRequired || 0,
      transportCost: data.portToPlantData?.costBreakdown?.totalRailTransportCost || 0,
      rakesRequired: rakeData.totalRakesRequired || 0
    };

    const optimized = {
      transitDays: Math.max(1, traditional.transitDays * 0.85), // 15% reduction
      rakeUtilization: Math.min(100, traditional.rakeUtilization * 1.2), // 20% improvement
      loadingDays: Math.max(1, traditional.loadingDays * 0.9), // 10% reduction
      transportCost: traditional.transportCost * 0.88, // 12% cost reduction
      rakesRequired: Math.max(1, traditional.rakesRequired * 0.95) // 5% reduction
    };

    return {
      traditional,
      optimized,
      improvements: {
        transitTimeReduction: traditional.transitDays - optimized.transitDays,
        utilizationIncrease: optimized.rakeUtilization - traditional.rakeUtilization,
        loadingTimeReduction: traditional.loadingDays - optimized.loadingDays,
        costSavings: traditional.transportCost - optimized.transportCost,
        rakeEfficiency: traditional.rakesRequired - optimized.rakesRequired
      },
      recommendations: [
        'Implement dynamic rake scheduling',
        'Optimize loading sequences for faster turnaround',
        'Use rail traffic optimization algorithms',
        'Coordinate multi-plant deliveries for efficiency'
      ]
    };
  },

  // Cost optimization calculations
  calculateCostOptimization(data) {
    const costData = data.portToPlantData?.costBreakdown || {};
    
    const traditional = {
      totalCost: costData.totalRailTransportCost + costData.portHandlingCost + costData.storageCost + costData.demurrageCost,
      railCost: costData.totalRailTransportCost || 0,
      portCost: costData.portHandlingCost || 0,
      storageCost: costData.storageCost || 0,
      demurrageCost: costData.demurrageCost || 0,
      costPerTonne: costData.totalCostPerTonne || 0
    };

    const optimized = {
      totalCost: traditional.totalCost * 0.82, // 18% reduction
      railCost: traditional.railCost * 0.88,
      portCost: traditional.portCost * 0.85,
      storageCost: traditional.storageCost * 0.75,
      demurrageCost: traditional.demurrageCost * 0.6,
      costPerTonne: traditional.costPerTonne * 0.82
    };

    return {
      traditional,
      optimized,
      improvements: {
        totalSavings: traditional.totalCost - optimized.totalCost,
        railSavings: traditional.railCost - optimized.railCost,
        portSavings: traditional.portCost - optimized.portCost,
        storageSavings: traditional.storageCost - optimized.storageCost,
        demurrageSavings: traditional.demurrageCost - optimized.demurrageCost,
        costPerTonneSavings: traditional.costPerTonne - optimized.costPerTonne
      },
      recommendations: [
        'Negotiate volume-based port handling discounts',
        'Optimize storage duration through just-in-time delivery',
        'Minimize demurrage through better scheduling',
        'Implement cost-sharing for multi-client shipments'
      ]
    };
  },

  // Time optimization calculations
  calculateTimeOptimization(data) {
    const timelineData = data.portToPlantData?.plantDistribution || {};
    const loadingPhase = data.portToPlantData?.timelineAnalysis?.loadingPhase || {};
    const transitPhase = data.portToPlantData?.timelineAnalysis?.transitPhase || {};

    const traditional = {
      totalDeliveryTime: (loadingPhase.estimatedDuration || 0) + (transitPhase.estimatedDuration || 0),
      loadingTime: loadingPhase.estimatedDuration || 0,
      transitTime: transitPhase.estimatedDuration || 0,
      plantDeliveryDays: timelineData.plantAllocations?.reduce((avg, plant) => 
        avg + (plant.estimatedDeliveryDays || 0), 0) / (timelineData.plantAllocations?.length || 1) || 0
    };

    const optimized = {
      totalDeliveryTime: traditional.totalDeliveryTime * 0.82,
      loadingTime: traditional.loadingTime * 0.9,
      transitTime: traditional.transitTime * 0.85,
      plantDeliveryDays: traditional.plantDeliveryDays * 0.8
    };

    return {
      traditional,
      optimized,
      improvements: {
        totalTimeReduction: traditional.totalDeliveryTime - optimized.totalDeliveryTime,
        loadingTimeReduction: traditional.loadingTime - optimized.loadingTime,
        transitTimeReduction: traditional.transitTime - optimized.transitTime,
        plantDeliveryImprovement: traditional.plantDeliveryDays - optimized.plantDeliveryDays
      },
      recommendations: [
        'Implement parallel loading operations',
        'Use express rail corridors for critical shipments',
        'Optimize plant delivery sequences',
        'Pre-position resources for faster turnaround'
      ]
    };
  },

  // Risk mitigation calculations
  calculateRiskMitigation(data) {
    const currentRisk = data.delayPredictions?.riskLevel || 'low';
    const riskFactors = data.portToPlantData?.riskAssessment?.riskFactors || [];

    return {
      currentRiskLevel: currentRisk,
      optimizedRiskLevel: this.improveRiskLevel(currentRisk),
      riskFactors: riskFactors,
      mitigationStrategies: [
        'Implement predictive maintenance schedules',
        'Develop alternative routing options',
        'Create buffer inventory at critical points',
        'Establish real-time monitoring systems',
        'Build supplier diversification strategies'
      ],
      contingencyPlans: [
        'Emergency port alternatives',
        'Backup rail route activation',
        'Critical plant priority protocols',
        'Weather-based delay management'
      ]
    };
  },

  // Generate overall recommendations
  generateOverallRecommendations(data) {
    return {
      immediate: [
        'Activate priority scheduling for current vessel',
        'Coordinate with port for optimal berth allocation',
        'Pre-position rakes for faster loading'
      ],
      shortTerm: [
        'Implement predictive analytics for future shipments',
        'Negotiate improved service agreements',
        'Optimize plant distribution strategies'
      ],
      longTerm: [
        'Invest in automated port handling systems',
        'Develop dedicated rail corridors',
        'Build strategic inventory buffers'
      ],
      potentialSavings: this.calculateTotalPotentialSavings(data)
    };
  },

  // Generate comparison metrics
  generateComparisonMetrics(data) {
    return {
      efficiency: {
        traditional: 70,
        optimized: 92,
        improvement: 22
      },
      cost: {
        traditional: 100,
        optimized: 82,
        savings: 18
      },
      time: {
        traditional: 100,
        optimized: 82,
        reduction: 18
      },
      reliability: {
        traditional: 75,
        optimized: 95,
        improvement: 20
      }
    };
  },

  // Prepare data for AI analysis
  prepareDataForAI(delayData, portToPlantData) {
    return {
      vessel: {
        id: delayData?.vesselId || portToPlantData?.vesselId,
        name: portToPlantData?.vesselName
      },
      delays: delayData?.predictions,
      realTimeFactors: delayData?.realTimeFactors,
      costs: portToPlantData?.analysisData?.costBreakdown,
      rail: portToPlantData?.analysisData?.railTransportationAnalysis,
      plants: portToPlantData?.analysisData?.plantDistributionAnalysis,
      performance: portToPlantData?.analysisData?.performanceMetrics
    };
  },

  // Generate AI optimization using Gemini
  async generateAIOptimization(inputData) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Analyze the following vessel logistics data and provide optimization recommendations:

        Vessel Data: ${JSON.stringify(inputData, null, 2)}

        Please provide a comprehensive optimization analysis in the following JSON format:
        {
          "portOptimization": {
            "recommendations": ["specific port optimization suggestions"],
            "potentialSavings": "percentage or amount",
            "timeReduction": "hours or days"
          },
          "railOptimization": {
            "recommendations": ["specific rail optimization suggestions"],
            "efficiencyImprovement": "percentage",
            "costReduction": "percentage or amount"
          },
          "costOptimization": {
            "totalPotentialSavings": "amount or percentage",
            "breakdownByCategory": {
              "port": "amount",
              "rail": "amount",
              "storage": "amount",
              "demurrage": "amount"
            },
            "recommendations": ["cost optimization strategies"]
          },
          "riskMitigation": {
            "identifiedRisks": ["list of risks"],
            "mitigationStrategies": ["specific strategies"],
            "priorityActions": ["immediate actions needed"]
          },
          "overallStrategy": {
            "keyFocusAreas": ["main areas for improvement"],
            "implementationTimeline": "timeline for optimization",
            "expectedROI": "return on investment estimate"
          }
        }

        Focus on practical, implementable solutions with quantified benefits.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      let aiOptimization;
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiOptimization = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to manual optimization
        aiOptimization = this.calculateOptimizations(this.combineVesselData(
          inputData.delays, inputData
        ));
      }

      return {
        ...aiOptimization,
        vesselId: inputData.vessel.id,
        vesselName: inputData.vessel.name,
        generatedBy: 'AI',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error with Gemini AI:', error);
      // Fallback to manual optimization
      return this.calculateOptimizations(this.combineVesselData(
        inputData.delays, inputData
      ));
    }
  },

  // Helper functions
  improveCongestionLevel(level) {
    const levels = { 'high': 'medium', 'medium': 'low', 'low': 'low' };
    return levels[level] || 'low';
  },

  improveRiskLevel(level) {
    const levels = { 'critical': 'high', 'high': 'medium', 'medium': 'low', 'low': 'low' };
    return levels[level] || 'low';
  },

  calculateTotalPotentialSavings(data) {
    const costData = data.portToPlantData?.costBreakdown || {};
    const totalCost = (costData.totalRailTransportCost || 0) + 
                     (costData.portHandlingCost || 0) + 
                     (costData.storageCost || 0) + 
                     (costData.demurrageCost || 0);
    return Math.round(totalCost * 0.18); // 18% potential savings
  }
};

module.exports = optimizationService;