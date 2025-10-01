﻿const optimizationService = require('../services/optimizationService');
const vesselService = require('../services/vesselService');
const Optimization = require('../models/Optimization');

// Track ongoing optimization requests
const ongoingOptimizations = new Map();

const getOptimizationAnalysis = async (req, res) => {
  try {
    const { vesselId } = req.params;
    
    let optimization = await Optimization.findOne({ vesselId });
    
    if (optimization && optimization.status === 'completed') {
      return res.json({ success: true, data: optimization });
    }
    
    // Check if optimization is already in progress
    if (ongoingOptimizations.has(vesselId)) {
      return res.json({ 
        success: true, 
        data: optimization || { vesselId, status: 'computing' }, 
        message: 'Optimization already in progress...' 
      });
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
    
    // Mark optimization as in progress
    ongoingOptimizations.set(vesselId, true);
    
    // Perform optimization asynchronously
    performOptimizationAsync(vessel, optimization._id, vesselId);
    
    res.json({ success: true, data: optimization, message: 'Computing...' });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const performOptimizationAsync = async (vesselData, optimizationId, vesselId) => {
  try {
    const result = await optimizationService.optimizeVesselOperations(vesselData);
    
    // Check if we got a result or if it failed
    if (!result) {
      await Optimization.findByIdAndUpdate(optimizationId, { status: 'failed' });
      return;
    }
    
    await Optimization.findByIdAndUpdate(optimizationId, {
      optimizationResults: result.optimizationResults,
      mapVisualizationData: result.mapVisualizationData,
      status: 'completed',
      computationMetadata: result.computationMetadata
    });
  } catch (error) {
    console.error('Optimization failed:', error);
    await Optimization.findByIdAndUpdate(optimizationId, { status: 'failed' });
  } finally {
    // Remove from ongoing optimizations
    ongoingOptimizations.delete(vesselId);
  }
};

const regenerateOptimizationAnalysis = async (req, res) => {
  try {
    const { vesselId } = req.params;
    
    // Check if optimization is already in progress
    if (ongoingOptimizations.has(vesselId)) {
      return res.json({ 
        success: true, 
        message: 'Optimization already in progress...' 
      });
    }
    
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