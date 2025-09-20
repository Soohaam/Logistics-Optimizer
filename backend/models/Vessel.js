const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  ETA: {
    type: Date,
    required: true
  },
  laydays: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  loadPort: {
    type: String,
    required: true,
    trim: true
  },
  supplier: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    }
  },
  parcels: [{
    size: {
      type: Number,
      required: true,
      min: 0
    },
    materialType: {
      type: String,
      required: true,
      trim: true
    },
    qualityGrade: {
      type: String,
      required: true,
      trim: true
    },
    qualitySpecs: {
      type: String,
      required: true
    },
    plantAllocations: [{
      plantName: {
        type: String,
        required: true,
        trim: true
      },
      requiredQuantity: {
        type: Number,
        required: true,
        min: 0
      },
      plantStockAvailability: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  }],
  costParameters: {
    fringeOcean: {
      type: Number,
      required: true,
      min: 0
    },
    fringeRail: {
      type: Number,
      required: true,
      min: 0
    },
    demurrageRate: {
      type: Number,
      required: true,
      min: 0
    },
    maxPortCalls: {
      type: Number,
      required: true,
      min: 1
    },
    portHandlingFees: {
      type: Number,
      required: true,
      min: 0
    },
    storageCost: {
      type: Number,
      required: true,
      min: 0
    },
    freeTime: {
      type: Number,
      required: true,
      min: 0
    },
    portDifferentialCost: {
      type: Number,
      required: true,
      min: 0
    }
  },
  railData: {
    rakeCapacity: {
      type: Number,
      required: true,
      min: 0
    },
    loadingTimePerDay: {
      type: Number,
      required: true,
      min: 0
    },
    availability: {
      type: Boolean,
      required: true,
      default: false
    },
    numberOfRakesRequired: {
      type: Number,
      required: true,
      min: 0
    }
  },
  portPreferences: [{
    portName: {
      type: String,
      required: true,
      trim: true
    },
    sequentialDischarge: {
      type: Boolean,
      required: true,
      default: false
    },
    dischargeOrder: [{
      type: String,
      trim: true
    }],
    portStockAvailability: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance
vesselSchema.index({ name: 1 });
vesselSchema.index({ ETA: 1 });
vesselSchema.index({ loadPort: 1 });
vesselSchema.index({ 'supplier.name': 1 });

module.exports = mongoose.model('Vessel', vesselSchema);
