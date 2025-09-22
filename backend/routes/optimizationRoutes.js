const express = require('express');
const router = express.Router();
const optimizationController = require('../controllers/optimizationController');

// GET /api/optimization/vessel/:vesselId - Get optimization analysis for a vessel
router.get('/vessel/:vesselId', optimizationController.getOptimizationAnalysis);

// POST /api/optimization/vessel/:vesselId/regenerate - Regenerate optimization analysis
router.post('/vessel/:vesselId/regenerate', optimizationController.regenerateOptimizationAnalysis);

module.exports = router;