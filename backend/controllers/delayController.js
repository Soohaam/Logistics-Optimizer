
// controllers/delayController.js
const delayPredictionService = require('../services/delayPredictionService');
const vesselService = require('../services/vesselService');
const DelayPrediction = require('../models/DelayPrediction');

class DelayController {
  /**
   * Predict delays for a vessel
   */
  async predictDelay(req, res) {
    try {
      const vessel = await vesselService.getVesselById(req.params.vesselId);
      if (!vessel) {
        throw new Error('Vessel not found');
      }

      const prediction = await delayPredictionService.predictDelay(vessel);

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get prediction history for a vessel
   */
  async getPredictionHistory(req, res) {
    try {
      const { vesselId } = req.params;
      const { limit = 10 } = req.query;

      const predictions = await DelayPrediction
        .find({ vesselId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .populate('vesselId', 'name capacity ETA loadPort');

      res.status(200).json({
        success: true,
        data: predictions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get prediction by ID
   */
  async getPredictionById(req, res) {
    try {
      const { predictionId } = req.params;

      const prediction = await DelayPrediction
        .findOne({ predictionId })
        .populate('vesselId', 'name capacity ETA loadPort');

      if (!prediction) {
        return res.status(404).json({
          success: false,
          message: 'Prediction not found'
        });
      }

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new DelayController();

