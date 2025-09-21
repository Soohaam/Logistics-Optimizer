// models/PortToPlant.js
const mongoose = require('mongoose');

const PortToPlantSchema = new mongoose.Schema({
  vesselId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vessel',
    required: true,
    unique: true
  },
  vesselName: {
    type: String,
    required: true
  },
  analysisData: {
    railTransportationAnalysis: {
      totalCargoVolume: {
        type: Number,
        required: true
      },
      estimatedTransitDays: {
        type: Number,
        required: true
      },
      rakeUtilizationEfficiency: {
        type: Number,
        required: true
      },
      loadingDaysRequired: {
        type: Number,
        required: true
      },
      routeEfficiencyScore: {
        type: Number,
        required: true
      }
    },
    costBreakdown: {
      totalRailTransportCost: {
        type: Number,
        required: true
      },
      fringeRailCost: {
        type: Number,
        required: true
      },
      demurrageCost: {
        type: Number,
        required: true
      },
      portHandlingCost: {
        type: Number,
        required: true
      },
      storageCost: {
        type: Number,
        required: true
      },
      totalCostPerTonne: {
        type: Number,
        required: true
      },
      costDistribution: {
        railTransport: Number,
        portHandling: Number,
        storage: Number,
        demurrage: Number
      }
    },
    rakeAnalysis: {
      totalRakesRequired: {
        type: Number,
        required: true
      },
      rakeCapacity: {
        type: Number,
        required: true
      },
      availabilityStatus: {
        type: Boolean,
        required: true
      },
      utilizationByTrip: [{
        tripNumber: Number,
        utilization: Number
      }],
      loadingEfficiency: {
        type: Number,
        required: true
      }
    },
    plantDistributionAnalysis: {
      plantAllocations: [{
        plantName: {
          type: String,
          required: true
        },
        allocatedQuantity: {
          type: Number,
          required: true
        },
        stockAvailability: {
          type: Number,
          required: true
        },
        shortfallQuantity: {
          type: Number,
          required: true
        },
        allocationPercentage: {
          type: Number,
          required: true
        },
        priorityLevel: {
          type: String,
          enum: ['High', 'Medium', 'Low'],
          required: true
        },
        estimatedDeliveryDays: {
          type: Number,
          required: true
        }
      }],
      totalShortfall: {
        type: Number,
        required: true
      },
      allocationEfficiency: {
        type: Number,
        required: true
      }
    },
    timelineAnalysis: {
      loadingPhase: {
        startDate: {
          type: Date,
          required: true
        },
        estimatedDuration: {
          type: Number,
          required: true
        },
        endDate: {
          type: Date,
          required: true
        }
      },
      transitPhase: {
        estimatedDuration: {
          type: Number,
          required: true
        },
        milestones: [{
          plantName: String,
          estimatedArrival: Date,
          status: String
        }]
      }
    },
    performanceMetrics: {
      deliveryReliabilityScore: {
        type: Number,
        required: true
      },
      costEfficiencyScore: {
        type: Number,
        required: true
      },
      timeEfficiencyScore: {
        type: Number,
        required: true
      },
      overallPerformanceScore: {
        type: Number,
        required: true
      }
    },
    riskAssessment: {
      riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
      },
      riskFactors: [{
        factor: String,
        severity: Number,
        probability: Number
      }],
      mitigationStrategies: [String]
    },
    optimizationRecommendations: {
      immediate: [String],
      shortTerm: [String],
      longTerm: [String],
      potentialSavings: Number
    }
  },
  inputDataSnapshot: {
    vesselCapacity: Number,
    loadPort: String,
    totalParcels: Number,
    railAvailability: Boolean
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PortToPlant', PortToPlantSchema);