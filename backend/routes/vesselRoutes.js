// routes/vesselRoutes.js
const express = require('express');
const vesselController = require('../controllers/vesselController');
const router = express.Router();

// Create a new vessel
router.post('/', vesselController.createVessel);

// Get all vessels with optional filters
router.get('/', vesselController.getAllVessels);

// Get vessel statistics
router.get('/stats', vesselController.getVesselStatistics);

// Get vessels by port
router.get('/port/:portName', vesselController.getVesselsByPort);

// Get vessels by supplier
router.get('/supplier/:supplierName', vesselController.getVesselsBySupplier);

// Get vessel by ID
router.get('/:id', vesselController.getVesselById);

// Predict delay for vessel by ID
router.post('/:id/predict-delay', vesselController.predictDelay);

// Update vessel by ID
router.put('/:id', vesselController.updateVessel);

// Delete vessel by ID
router.delete('/:id', vesselController.deleteVessel);

module.exports = router;
