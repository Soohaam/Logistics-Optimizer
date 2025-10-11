// controllers/delayController.js
const delayPredictionService = require('../services/delayPredictionService');
const DelayPrediction = require('../models/DelayPrediction');

class DelayController {
  /**
   * Predict delays for a vessel
   */
  async predictDelay(req, res) {
    try {
      const { vesselId } = req.params;

      console.log(`📡 Received delay prediction request for vessel: ${vesselId}`);

      const prediction = await delayPredictionService.predictDelay(vesselId);

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      console.error('❌ Delay prediction error:', error);
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

      console.log(`📋 Fetching prediction history for vessel: ${vesselId}`);

      const predictions = await DelayPrediction
        .find({ vesselId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        data: predictions,
        count: predictions.length
      });
    } catch (error) {
      console.error('❌ Error fetching prediction history:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get prediction by ID
   */
  async getPredictionById(req, res) {
    try {
      const { predictionId } = req.params;

      console.log(`🔍 Fetching prediction: ${predictionId}`);

      const prediction = await DelayPrediction.findOne({ predictionId });

      if (!prediction) {
        return res.status(404).json({
          success: false,
          error: 'Prediction not found'
        });
      }

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      console.error('❌ Error fetching prediction:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get latest prediction for a vessel
   */
  async getLatestPrediction(req, res) {
    try {
      const { vesselId } = req.params;

      console.log(`📊 Fetching latest prediction for vessel: ${vesselId}`);

      const prediction = await DelayPrediction
        .findOne({ vesselId })
        .sort({ timestamp: -1 });

      if (!prediction) {
        return res.status(404).json({
          success: false,
          error: 'No predictions found for this vessel'
        });
      }

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      console.error('❌ Error fetching latest prediction:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete old predictions for a vessel (cleanup)
   */
  async deletePredictions(req, res) {
    try {
      const { vesselId } = req.params;
      const { keepLast = 5 } = req.query;

      console.log(`🗑️ Cleaning up old predictions for vessel: ${vesselId}`);

      // Get all predictions sorted by timestamp
      const predictions = await DelayPrediction
        .find({ vesselId })
        .sort({ timestamp: -1 });

      if (predictions.length <= parseInt(keepLast)) {
        return res.status(200).json({
          success: true,
          message: 'No predictions to delete',
          deleted: 0
        });
      }

      // Keep only the latest N predictions
      const predictionsToDelete = predictions.slice(parseInt(keepLast));
      const idsToDelete = predictionsToDelete.map(p => p._id);

      const result = await DelayPrediction.deleteMany({
        _id: { $in: idsToDelete }
      });

      res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} old predictions`,
        deleted: result.deletedCount
      });
    } catch (error) {
      console.error('❌ Error deleting predictions:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DelayController();