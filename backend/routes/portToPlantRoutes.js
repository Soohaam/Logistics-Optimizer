// routes/portToPlantRoutes.js
const express = require('express');
const router = express.Router();
const portToPlantController = require('../controllers/portToPlantController');

// Get port-to-plant analysis for a specific vessel
// GET /api/port-to-plant/vessel/:vesselId
router.get('/vessel/:vesselId', portToPlantController.getPortToPlantAnalysis);

// Regenerate analysis for a specific vessel (force refresh)
// POST /api/port-to-plant/vessel/:vesselId/regenerate
router.post('/vessel/:vesselId/regenerate', portToPlantController.regenerateAnalysis);

// Get all port-to-plant analyses
// GET /api/port-to-plant/
router.get('/', portToPlantController.getAllAnalyses);

module.exports = router;