const optimizationService = require('../services/optimizationService');

const optimizationController = {
  // Get optimization analysis for a specific vessel
  async getOptimizationAnalysis(req, res) {
    try {
      const { vesselId } = req.params;
      
      if (!vesselId) {
        return res.status(400).json({
          success: false,
          error: 'Vessel ID is required'
        });
      }

      const optimizationData = await optimizationService.getOptimizationAnalysis(vesselId);
      
      if (!optimizationData) {
        return res.status(404).json({
          success: false,
          error: 'No data found for the specified vessel'
        });
      }

      res.status(200).json({
        success: true,
        data: optimizationData
      });

    } catch (error) {
      console.error('Error in getOptimizationAnalysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch optimization analysis',
        details: error.message
      });
    }
  },

  // Regenerate optimization analysis using Gemini API
  async regenerateOptimizationAnalysis(req, res) {
    try {
      const { vesselId } = req.params;
      
      if (!vesselId) {
        return res.status(400).json({
          success: false,
          error: 'Vessel ID is required'
        });
      }

      const optimizationData = await optimizationService.regenerateOptimizationWithAI(vesselId);
      
      res.status(200).json({
        success: true,
        data: optimizationData,
        message: 'Optimization analysis regenerated successfully'
      });

    } catch (error) {
      console.error('Error in regenerateOptimizationAnalysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to regenerate optimization analysis',
        details: error.message
      });
    }
  }
};

module.exports = optimizationController;