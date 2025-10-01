// models/Optimization.js
const mongoose = require('mongoose');

const optimizationSchema = new mongoose.Schema({
  vesselId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vessel',
    required: true,
    unique: true
  },
  optimizationId: {
    type: String,
    unique: true,
    required: true
  },
  vesselName: {
    type: String,
    required: true
  },
  optimizationResults: {
    portSelection: {
      selectedPort: {
        name: String,
        coordinates: {
          lat: Number,
          lng: Number
        },
        capacity: Number,
        efficiency: Number,
        currentCongestion: Number,
        costPerTonne: Number
      },
      alternativePorts: [{
        name: String,
        coordinates: {
          lat: Number,
          lng: Number
        },
        efficiency: Number,
        congestion: Number,
        costPerTonne: Number,
        reasonForRejection: String
      }],
      selectionReasoning: String
    },
    routeOptimization: {
      recommendedRoute: {
        waypoints: [{
          lat: Number,
          lng: Number,
          name: String,
          type: { type: String, enum: ['port', 'waypoint', 'checkpoint'] }
        }],
        totalDistance: Number,
        estimatedTime: Number,
        fuelConsumption: Number,
        weatherRisk: String
      },
      alternativeRoutes: [{
        waypoints: [{
          lat: Number,
          lng: Number,
          name: String
        }],
        totalDistance: Number,
        estimatedTime: Number,
        fuelConsumption: Number,
        riskLevel: String
      }]
    },
    dischargeSequencing: {
      optimalSequence: [{
        portName: String,
        parcelId: String,
        cargoVolume: Number,
        sequenceOrder: Number,
        estimatedDischargeDuration: Number,
        costSavings: Number,
        reasoning: String
      }],
      sequentialDischarges: Number,
      totalDischargeTime: Number,
      efficiencyGain: Number
    },
    railTransportOptimization: {
      selectedRoutes: [{
        routeName: String,
        plantDestinations: [String],
        rakeRequirement: Number,
        transitTime: Number,
        costPerTonne: Number,
        capacity: Number
      }],
      loadingSchedule: {
        startDate: Date,
        estimatedCompletionDate: Date,
        dailyLoadingCapacity: Number,
        rakeUtilization: Number
      }
    },
    costBenefitAnalysis: {
      traditional: {
        totalCost: Number,
        timeRequired: Number,
        fuelCost: Number,
        portCharges: Number,
        demurrageCost: Number,
        railTransportCost: Number
      },
      optimized: {
        totalCost: Number,
        timeRequired: Number,
        fuelCost: Number,
        portCharges: Number,
        demurrageCost: Number,
        railTransportCost: Number
      },
      savings: {
        costSavings: Number,
        timeSavings: Number,
        percentageSavings: Number,
        co2ReductionTonnes: Number
      }
    },
    riskAssessment: {
      overallRiskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      riskFactors: [{
        category: String,
        description: String,
        probability: Number,
        impact: Number,
        mitigation: String
      }],
      contingencyPlans: [String]
    },
    performanceMetrics: {
      efficiencyScore: Number,
      reliabilityScore: Number,
      costEfficiencyScore: Number,
      environmentalScore: Number,
      overallOptimizationScore: Number
    }
  },
  mapVisualizationData: {
    vesselPosition: {
      currentLat: Number,
      currentLng: Number,
      heading: Number,
      speed: Number,
      status: { type: String, enum: ['sailing', 'anchored', 'docked', 'loading', 'discharging'] }
    },
    routeHeatmap: [{
      lat: Number,
      lng: Number,
      intensity: Number,
      trafficLevel: String
    }],
    portStatuses: [{
      portName: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      status: { type: String, enum: ['available', 'busy', 'congested', 'closed'] },
      queuedVessels: Number,
      estimatedWaitTime: Number
    }]
  },
  inputDataSources: {
    delayPredictionId: String,
    portToPlantId: String,
    weatherData: mongoose.Schema.Types.Mixed,
    marketConditions: mongoose.Schema.Types.Mixed
  },
  recommendations: {
    immediate: [String],
    shortTerm: [String],
    longTerm: [String]
  },
  status: {
    type: String,
    enum: ['computing', 'completed', 'failed', 'outdated'],
    default: 'computing'
  },
  computationMetadata: {
    totalComputationTime: Number,
    dataQualityScore: Number,
    aiModelVersion: String,
    lastUpdated: Date,
    cacheHit: Boolean,
    fallbackComponents: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
optimizationSchema.index({ vesselId: 1 });
optimizationSchema.index({ optimizationId: 1 });
optimizationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Optimization', optimizationSchema);
