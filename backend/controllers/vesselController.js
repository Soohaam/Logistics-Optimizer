// controllers/vesselController.js
const vesselService = require('../services/vesselService');

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
}

module.exports = new VesselController();
