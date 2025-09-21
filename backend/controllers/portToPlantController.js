// controllers/portToPlantController.js
const PortToPlant = require('../models/PortToPlant');
const Vessel = require('../models/Vessel');
const geminiService = require('../services/geminiService');

const portToPlantController = {
  // Get or create port-to-plant analysis
  async getPortToPlantAnalysis(req, res) {
    try {
      const { vesselId } = req.params;

      // First check if analysis already exists
      let existingAnalysis = await PortToPlant.findOne({ vesselId });
      
      if (existingAnalysis) {
        return res.json({
          success: true,
          data: existingAnalysis,
          message: 'Analysis retrieved from cache'
        });
      }

      // If no existing analysis, fetch vessel data and create new analysis
      const vessel = await Vessel.findById(vesselId);
      
      if (!vessel) {
        return res.status(404).json({
          success: false,
          error: 'Vessel not found'
        });
      }

      // Extract relevant data for analysis
      const extractedData = extractRelevantVesselData(vessel);

      // Get AI analysis from Gemini
      const aiAnalysis = await geminiService.analyzePortToPlant(extractedData);

      // Compute additional fields from vessel data
      const computedData = computeAnalysisData(vessel);

      // Merge AI analysis with computed data
      const completeAnalysisData = mergeAnalysisData(aiAnalysis, computedData, vessel);

      // Create and save new analysis
      const newAnalysis = new PortToPlant({
        vesselId: vessel._id,
        vesselName: vessel.name,
        analysisData: completeAnalysisData,
        inputDataSnapshot: {
          vesselCapacity: vessel.capacity,
          loadPort: vessel.loadPort,
          totalParcels: vessel.parcels.length,
          railAvailability: vessel.railData.availability
        }
      });

      await newAnalysis.save();

      res.json({
        success: true,
        data: newAnalysis,
        message: 'New analysis created and cached'
      });

    } catch (error) {
      console.error('Port to Plant Analysis Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate port-to-plant analysis'
      });
    }
  },

  // Regenerate analysis (force refresh)
  async regenerateAnalysis(req, res) {
    try {
      const { vesselId } = req.params;

      // Delete existing analysis
      await PortToPlant.findOneAndDelete({ vesselId });

      // Redirect to get analysis (will create new one)
      req.params.vesselId = vesselId;
      return portToPlantController.getPortToPlantAnalysis(req, res);

    } catch (error) {
      console.error('Regenerate Analysis Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to regenerate analysis'
      });
    }
  },

  // Get all analyses
  async getAllAnalyses(req, res) {
    try {
      const analyses = await PortToPlant.find()
        .populate('vesselId', 'name capacity loadPort')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: analyses,
        count: analyses.length
      });

    } catch (error) {
      console.error('Get All Analyses Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analyses'
      });
    }
  }
};

// Helper function to extract relevant vessel data
function extractRelevantVesselData(vessel) {
  const totalCargoVolume = vessel.parcels.reduce((total, parcel) => total + parcel.size, 0);
  
  const plantAllocations = [];
  vessel.parcels.forEach(parcel => {
    parcel.plantAllocations.forEach(allocation => {
      plantAllocations.push({
        plantName: allocation.plantName,
        requiredQuantity: allocation.requiredQuantity,
        plantStockAvailability: allocation.plantStockAvailability
      });
    });
  });

  return {
    vesselName: vessel.name,
    capacity: vessel.capacity,
    loadPort: vessel.loadPort,
    ETA: vessel.ETA,
    totalCargoVolume,
    parcels: vessel.parcels.map(parcel => ({
      size: parcel.size,
      materialType: parcel.materialType,
      qualityGrade: parcel.qualityGrade
    })),
    railData: {
      rakeCapacity: vessel.railData.rakeCapacity,
      loadingTimePerDay: vessel.railData.loadingTimePerDay,
      availability: vessel.railData.availability,
      numberOfRakesRequired: vessel.railData.numberOfRakesRequired
    },
    costParameters: {
      fringeRail: vessel.costParameters.fringeRail,
      demurrageRate: vessel.costParameters.demurrageRate,
      portHandlingFees: vessel.costParameters.portHandlingFees,
      storageCost: vessel.costParameters.storageCost,
      freeTime: vessel.costParameters.freeTime
    },
    plantAllocations
  };
}

// Helper function to compute analysis data from vessel
function computeAnalysisData(vessel) {
  const totalCargoVolume = vessel.parcels.reduce((total, parcel) => total + parcel.size, 0);
  const loadingDaysRequired = Math.ceil(totalCargoVolume / vessel.railData.loadingTimePerDay);
  const rakeUtilizationEfficiency = Math.round(
    (totalCargoVolume / (vessel.railData.rakeCapacity * vessel.railData.numberOfRakesRequired)) * 100
  );

  // Calculate plant allocations data
  const plantAllocationsData = [];
  let totalShortfall = 0;

  vessel.parcels.forEach(parcel => {
    parcel.plantAllocations.forEach(allocation => {
      const shortfall = Math.max(0, allocation.requiredQuantity - allocation.plantStockAvailability);
      const allocationPercentage = Math.round((allocation.requiredQuantity / totalCargoVolume) * 100);
      
      plantAllocationsData.push({
        plantName: allocation.plantName,
        allocatedQuantity: allocation.requiredQuantity,
        stockAvailability: allocation.plantStockAvailability,
        shortfallQuantity: shortfall,
        allocationPercentage
      });

      totalShortfall += shortfall;
    });
  });

  return {
    totalCargoVolume,
    loadingDaysRequired,
    rakeUtilizationEfficiency,
    plantAllocationsData,
    totalShortfall,
    fringeRailCost: vessel.costParameters.fringeRail,
    portHandlingCost: vessel.costParameters.portHandlingFees
  };
}

// Helper function to merge AI analysis with computed data
function mergeAnalysisData(aiAnalysis, computedData, vessel) {
  // Calculate cost distribution percentages
  const totalCost = aiAnalysis.costBreakdown.totalRailTransportCost + 
                   computedData.fringeRailCost + 
                   aiAnalysis.costBreakdown.demurrageCost + 
                   computedData.portHandlingCost + 
                   aiAnalysis.costBreakdown.storageCost;

  const costDistribution = {
    railTransport: Math.round((aiAnalysis.costBreakdown.totalRailTransportCost / totalCost) * 100),
    portHandling: Math.round((computedData.portHandlingCost / totalCost) * 100),
    storage: Math.round((aiAnalysis.costBreakdown.storageCost / totalCost) * 100),
    demurrage: Math.round((aiAnalysis.costBreakdown.demurrageCost / totalCost) * 100)
  };

  // Calculate overall performance score
  const overallPerformanceScore = Math.round(
    (aiAnalysis.performanceMetrics.deliveryReliabilityScore + 
     aiAnalysis.performanceMetrics.costEfficiencyScore + 
     aiAnalysis.performanceMetrics.timeEfficiencyScore) / 3
  );

  // Merge AI plant allocations with computed data
  const mergedPlantAllocations = computedData.plantAllocationsData.map((computed, index) => {
    const aiData = aiAnalysis.plantDistributionAnalysis.plantAllocations.find(
      ai => ai.plantName === computed.plantName
    ) || aiAnalysis.plantDistributionAnalysis.plantAllocations[index] || {};

    return {
      ...computed,
      priorityLevel: aiData.priorityLevel || 'Medium',
      estimatedDeliveryDays: aiData.estimatedDeliveryDays || 7
    };
  });

  const loadingStartDate = new Date(vessel.ETA);
  const loadingEndDate = new Date(loadingStartDate);
  loadingEndDate.setDate(loadingStartDate.getDate() + computedData.loadingDaysRequired);

  return {
    railTransportationAnalysis: {
      totalCargoVolume: computedData.totalCargoVolume,
      estimatedTransitDays: aiAnalysis.railTransportationAnalysis.estimatedTransitDays,
      rakeUtilizationEfficiency: computedData.rakeUtilizationEfficiency,
      loadingDaysRequired: computedData.loadingDaysRequired,
      routeEfficiencyScore: aiAnalysis.railTransportationAnalysis.routeEfficiencyScore
    },
    costBreakdown: {
      totalRailTransportCost: aiAnalysis.costBreakdown.totalRailTransportCost,
      fringeRailCost: computedData.fringeRailCost,
      demurrageCost: aiAnalysis.costBreakdown.demurrageCost,
      portHandlingCost: computedData.portHandlingCost,
      storageCost: aiAnalysis.costBreakdown.storageCost,
      totalCostPerTonne: Math.round(totalCost / computedData.totalCargoVolume),
      costDistribution
    },
    rakeAnalysis: {
      totalRakesRequired: vessel.railData.numberOfRakesRequired,
      rakeCapacity: vessel.railData.rakeCapacity,
      availabilityStatus: vessel.railData.availability,
      utilizationByTrip: aiAnalysis.rakeAnalysis.utilizationByTrip,
      loadingEfficiency: aiAnalysis.rakeAnalysis.loadingEfficiency
    },
    plantDistributionAnalysis: {
      plantAllocations: mergedPlantAllocations,
      totalShortfall: computedData.totalShortfall,
      allocationEfficiency: aiAnalysis.plantDistributionAnalysis.allocationEfficiency
    },
    timelineAnalysis: {
      loadingPhase: {
        startDate: loadingStartDate,
        estimatedDuration: computedData.loadingDaysRequired,
        endDate: loadingEndDate
      },
      transitPhase: {
        estimatedDuration: aiAnalysis.timelineAnalysis.transitPhase.estimatedDuration,
        milestones: aiAnalysis.timelineAnalysis.transitPhase.milestones
      }
    },
    performanceMetrics: {
      deliveryReliabilityScore: aiAnalysis.performanceMetrics.deliveryReliabilityScore,
      costEfficiencyScore: aiAnalysis.performanceMetrics.costEfficiencyScore,
      timeEfficiencyScore: aiAnalysis.performanceMetrics.timeEfficiencyScore,
      overallPerformanceScore
    },
    riskAssessment: aiAnalysis.riskAssessment,
    optimizationRecommendations: aiAnalysis.optimizationRecommendations
  };
}

module.exports = portToPlantController;