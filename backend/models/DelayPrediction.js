// models/DelayPrediction.js
const mongoose = require('mongoose');

const delayPredictionSchema = new mongoose.Schema({
  vesselId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vessel',
    required: true
  },
  predictionId: {
    type: String,
    unique: true,
    required: true
  },
  predictions: {
    arrivalDelay: {
      hours: { type: Number, required: true },
      confidence: { type: Number, min: 0, max: 1, required: true }
    },
    berthingDelay: {
      hours: { type: Number, required: true },
      confidence: { type: Number, min: 0, max: 1, required: true }
    }
  },
  realTimeFactors: {
    weatherConditions: {
      windSpeed: Number,
      waveHeight: Number,
      visibility: String,
      seaCondition: String,
      rainIntensity: Number
    },
    portCongestion: {
      queuedVessels: Number,
      averageWaitTime: Number,
      congestionLevel: String,
      berthAvailability: Number
    },
    vesselTracking: {
      currentLatitude: Number,
      currentLongitude: Number,
      speed: Number,
      distanceToPort: Number,
      estimatedArrival: Date
    }
  },
  delayReasons: [{
    factor: String,
    impact: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  recommendations: [String],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DelayPrediction', delayPredictionSchema);
