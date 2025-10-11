// routes/delay.js
const express = require('express');
const DelayController = require('../controllers/delayController');

const router = express.Router();

// Predict delay for vessel
router.post('/predict/:vesselId', DelayController.predictDelay);

// Get prediction history for vessel (multiple predictions)
router.get('/history/:vesselId', DelayController.getPredictionHistory);

// Get latest prediction for vessel
router.get('/latest/:vesselId', DelayController.getLatestPrediction);

// Get specific prediction by predictionId
router.get('/prediction/:predictionId', DelayController.getPredictionById);

// Delete old predictions (cleanup endpoint)
router.delete('/cleanup/:vesselId', DelayController.deletePredictions);

module.exports = router;