const optimizationService = require('../services/optimizationService');
const vesselService = require('../services/vesselService');
const Optimization = require('../models/Optimization');

const getOptimizationAnalysis = async (req, res) => {
  try {
    const { vesselId } = req.params;
    
    let optimization = await Optimization.findOne({ vesselId });
    
    if (optimization && optimization.status === 'completed') {
      return res.json({ success: true, data: optimization });
    }
    
    const vessel = await vesselService.getVesselById(vesselId);
    if (!vessel) {
      return res.status(404).json({ success: false, error: 'Vessel not found' });
    }
    
    const optimizationId = `OPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!optimization) {
      optimization = new Optimization({
        vesselId: vessel._id,
        optimizationId,
        vesselName: vessel.name,
        status: 'computing'
      });
      await optimization.save();
    }
    
    performOptimizationAsync(vessel, optimization._id);
    
    res.json({ success: true, data: optimization, message: 'Computing...' });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const performOptimizationAsync = async (vesselData, optimizationId) => {
  try {
    const result = await optimizationService.optimizeVesselOperations(vesselData);
    
    await Optimization.findByIdAndUpdate(optimizationId, {
      optimizationResults: result.optimizationResults,
      mapVisualizationData: result.mapVisualizationData,
      status: 'completed'
    });
    
  } catch (error) {
    console.error('Optimization failed:', error);
    await Optimization.findByIdAndUpdate(optimizationId, { status: 'failed' });
  }
};

const regenerateOptimizationAnalysis = async (req, res) => {
  try {
    const { vesselId } = req.params;
    await Optimization.findOneAndDelete({ vesselId });
    return getOptimizationAnalysis(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOptimizationAnalysis,
  regenerateOptimizationAnalysis
};
