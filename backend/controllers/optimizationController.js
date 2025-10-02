﻿// controllers/optimizationController.js
const optimizationService = require('../services/optimizationService');
const Optimization = require('../models/Optimization');

// Track ongoing optimization requests
const ongoingOptimizations = new Map();

const getOptimizationAnalysis = async (req, res) => {
  try {
    const { vesselId } = req.params;
    
    // Check if there's an existing completed optimization
    let optimization = await Optimization.findOne({ vesselId });
    
    if (optimization && optimization.status === 'completed') {
      console.log(`✅ Returning cached optimization for vessel ${vesselId}`);
      return res.json({ success: true, data: optimization });
    }
    
    // Check if optimization is already in progress
    if (ongoingOptimizations.has(vesselId)) {
      console.log(`⏳ Optimization already in progress for vessel ${vesselId}`);
      return res.json({ 
        success: true, 
        data: optimization || { vesselId, status: 'computing' }, 
        message: 'Optimization already in progress...' 
      });
    }
    
    // Create new optimization record with computing status
    const optimizationId = `OPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!optimization) {
      optimization = new Optimization({
        vesselId: vesselId,
        optimizationId,
        vesselName: 'Processing...',
        status: 'computing',
        computationMetadata: {
          lastUpdated: new Date()
        }
      });
      await optimization.save();
    } else {
      optimization.status = 'computing';
      optimization.computationMetadata = { lastUpdated: new Date() };
      await optimization.save();
    }
    
    // Mark optimization as in progress
    ongoingOptimizations.set(vesselId, true);
    
    // Perform optimization asynchronously
    performOptimizationAsync(vesselId, optimization._id);
    
    res.json({ 
      success: true, 
      data: optimization, 
      message: 'Computing optimization insights...' 
    });
    
  } catch (error) {
    console.error('❌ Error in getOptimizationAnalysis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const performOptimizationAsync = async (vesselId, optimizationRecordId) => {
  try {
    console.log(`🔄 Starting async optimization for vessel ${vesselId}`);
    
    // Call the optimization service with vesselId
    const result = await optimizationService.optimizeVesselOperations(vesselId);
    
    if (!result) {
      await Optimization.findByIdAndUpdate(optimizationRecordId, { 
        status: 'failed',
        computationMetadata: {
          lastUpdated: new Date(),
          error: 'Optimization service returned no result'
        }
      });
      return;
    }
    
    // Update the optimization record with results
    await Optimization.findByIdAndUpdate(optimizationRecordId, {
      vesselName: result.vesselName,
      optimizationResults: result.optimizationResults,
      mapVisualizationData: result.mapVisualizationData,
      inputDataSources: result.inputDataSources,
      recommendations: result.recommendations,
      status: 'completed',
      computationMetadata: result.computationMetadata
    });
    
    console.log(`✅ Optimization completed for vessel ${vesselId}`);
    
  } catch (error) {
    console.error(`❌ Optimization failed for vessel ${vesselId}:`, error);
    await Optimization.findByIdAndUpdate(optimizationRecordId, { 
      status: 'failed',
      computationMetadata: {
        lastUpdated: new Date(),
        error: error.message
      }
    });
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
    
    console.log(`🔄 Regenerating optimization for vessel ${vesselId}`);
    
    // Delete existing optimization
    await Optimization.findOneAndDelete({ vesselId });
    
    // Trigger new optimization
    return getOptimizationAnalysis(req, res);
    
  } catch (error) {
    console.error('❌ Error in regenerateOptimizationAnalysis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOptimizationAnalysis,
  regenerateOptimizationAnalysis
};