// controllers/vesselController.js
const vesselService = require('../services/vesselService');
const delayPredictionService = require('../services/delayPredictionService');
const csvUploadService = require('../services/csvUploadService');

class VesselController {
  
  async createVessel(req, res) {
    try {
      const vessel = await vesselService.createVessel(req.body);
      res.status(201).json({
        success: true,
        message: 'Vessel created successfully',
        data: vessel
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAllVessels(req, res) {
    try {
      const filters = {
        name: req.query.name,
        loadPort: req.query.loadPort,
        supplierName: req.query.supplierName,
        etaFrom: req.query.etaFrom,
        etaTo: req.query.etaTo
      };

      const vessels = await vesselService.getAllVessels(filters);
      res.status(200).json({
        success: true,
        count: vessels.length,
        data: vessels
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getVesselById(req, res) {
    try {
      const vessel = await vesselService.getVesselById(req.params.id);
      res.status(200).json({
        success: true,
        data: vessel
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateVessel(req, res) {
    try {
      const vessel = await vesselService.updateVessel(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Vessel updated successfully',
        data: vessel
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteVessel(req, res) {
    try {
      await vesselService.deleteVessel(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Vessel deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async uploadCsv(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const result = await csvUploadService.processVesselFile(req.file);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('CSV Upload Error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async downloadTemplate(req, res) {
    try {
      const templateContent = [
        'name,capacity,ETA,laydaysStart,laydaysEnd,loadPort,supplierName,supplierCountry',
        'Example Vessel,50000,2025-09-30,2025-09-25,2025-10-05,Port A,Supplier Inc,Country A'
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=vessel_template.csv');
      res.status(200).send(templateContent);
    } catch (error) {
      console.error('Template Download Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate template'
      });
    }
  }

  async getVesselsByPort(req, res) {
    try {
      const vessels = await vesselService.getVesselsByPort(req.params.portName);
      res.status(200).json({
        success: true,
        count: vessels.length,
        data: vessels
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getVesselsBySupplier(req, res) {
    try {
      const vessels = await vesselService.getVesselsBySupplier(req.params.supplierName);
      res.status(200).json({
        success: true,
        count: vessels.length,
        data: vessels
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getVesselStatistics(req, res) {
    try {
      const stats = await vesselService.getVesselStatistics();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async predictDelay(req, res) {
    try {
      const vessel = await vesselService.getVesselById(req.params.id);
      const prediction = await delayPredictionService.predictDelay(vessel);
      
      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Upload vessels from CSV/Excel file
   */
  async uploadVesselCSV(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const results = await csvUploadService.processVesselFile(req.file);
      
      res.status(200).json({
        success: true,
        data: {
          successCount: results.successful.length,
          failureCount: results.failed.length,
          total: results.total,
          successful: results.successful,
          failed: results.failed
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Download CSV template
   */
  async downloadTemplate(req, res) {
    try {
      const template = csvUploadService.generateTemplate();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=vessel_template.csv');
      res.send(template);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new VesselController();
