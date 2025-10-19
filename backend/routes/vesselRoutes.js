// routes/vesselRoutes.js
const express = require('express');
const multer = require('multer');
const vesselController = require('../controllers/vesselController');
const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Create a new vessel
router.post('/', vesselController.createVessel);

// Get all vessels with optional filters
router.get('/', vesselController.getAllVessels);

// Get vessel statistics
router.get('/stats', vesselController.getVesselStatistics);

// Download CSV template - MUST come before /:id route
router.get('/download-template', vesselController.downloadTemplate);

// Handle CSV upload
router.post('/upload-csv', upload.single('file'), vesselController.uploadVesselCSV);

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
