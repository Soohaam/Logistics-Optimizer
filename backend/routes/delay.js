// routes/delay.js
const express = require('express');
const DelayController = require('../controllers/delayController');

const router = express.Router();

// Predict delay for vessel
router.post('/predict/:vesselId', DelayController.predictDelay);

// Get prediction history
router.get('/history/:vesselId', DelayController.getPredictionHistory);

// Get specific prediction
router.get('/prediction/:predictionId', DelayController.getPredictionById);

module.exports = router;
