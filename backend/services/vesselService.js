// services/vesselService.js
const Vessel = require('../models/Vessel');

class VesselService {
  
  async createVessel(vesselData) {
    try {
      // Validate laydays
      if (new Date(vesselData.laydays.start) >= new Date(vesselData.laydays.end)) {
        throw new Error('Laydays start date must be before end date');
      }

      // Validate ETA is in the future
      if (new Date(vesselData.ETA) < new Date()) {
        throw new Error('ETA must be in the future');
      }

      const vessel = new Vessel(vesselData);
      await vessel.save();
      return vessel;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new Error(`Validation Error: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async getAllVessels(filters = {}) {
    try {
      const query = {};
      
      // Apply filters
      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }
      if (filters.loadPort) {
        query.loadPort = { $regex: filters.loadPort, $options: 'i' };
      }
      if (filters.supplierName) {
        query['supplier.name'] = { $regex: filters.supplierName, $options: 'i' };
      }
      if (filters.etaFrom && filters.etaTo) {
        query.ETA = {
          $gte: new Date(filters.etaFrom),
          $lte: new Date(filters.etaTo)
        };
      }

      const vessels = await Vessel.find(query).sort({ createdAt: -1 });
      return vessels;
    } catch (error) {
      throw new Error(`Error fetching vessels: ${error.message}`);
    }
  }

  async getVesselById(id) {
    try {
      const vessel = await Vessel.findById(id);
      if (!vessel) {
        throw new Error('Vessel not found');
      }
      return vessel;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid vessel ID format');
      }
      throw error;
    }
  }

  async updateVessel(id, updateData) {
    try {
      // Validate dates if they're being updated
      if (updateData.laydays) {
        if (new Date(updateData.laydays.start) >= new Date(updateData.laydays.end)) {
          throw new Error('Laydays start date must be before end date');
        }
      }

      if (updateData.ETA && new Date(updateData.ETA) < new Date()) {
        throw new Error('ETA must be in the future');
      }

      const vessel = await Vessel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!vessel) {
        throw new Error('Vessel not found');
      }

      return vessel;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new Error(`Validation Error: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
      }
      if (error.name === 'CastError') {
        throw new Error('Invalid vessel ID format');
      }
      throw error;
    }
  }

  async deleteVessel(id) {
    try {
      const vessel = await Vessel.findByIdAndDelete(id);
      if (!vessel) {
        throw new Error('Vessel not found');
      }
      return vessel;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid vessel ID format');
      }
      throw error;
    }
  }

  async getVesselsByPort(portName) {
    try {
      const vessels = await Vessel.find({
        $or: [
          { loadPort: { $regex: portName, $options: 'i' } },
          { 'portPreferences.portName': { $regex: portName, $options: 'i' } }
        ]
      }).sort({ ETA: 1 });
      
      return vessels;
    } catch (error) {
      throw new Error(`Error fetching vessels by port: ${error.message}`);
    }
  }

  async getVesselsBySupplier(supplierName) {
    try {
      const vessels = await Vessel.find({
        'supplier.name': { $regex: supplierName, $options: 'i' }
      }).sort({ ETA: 1 });
      
      return vessels;
    } catch (error) {
      throw new Error(`Error fetching vessels by supplier: ${error.message}`);
    }
  }

  async getVesselStatistics() {
    try {
      const stats = await Vessel.aggregate([
        {
          $group: {
            _id: null,
            totalVessels: { $sum: 1 },
            totalCapacity: { $sum: '$capacity' },
            avgCapacity: { $avg: '$capacity' },
            upcomingVessels: {
              $sum: {
                $cond: [
                  { $gte: ['$ETA', new Date()] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalVessels: 1,
            totalCapacity: 1,
            avgCapacity: { $round: ['$avgCapacity', 2] },
            upcomingVessels: 1
          }
        }
      ]);

      return stats[0] || {
        totalVessels: 0,
        totalCapacity: 0,
        avgCapacity: 0,
        upcomingVessels: 0
      };
    } catch (error) {
      throw new Error(`Error fetching vessel statistics: ${error.message}`);
    }
  }
}

module.exports = new VesselService();