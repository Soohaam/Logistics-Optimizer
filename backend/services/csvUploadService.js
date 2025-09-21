const csv = require('csv-parser');
const xlsx = require('xlsx');
const { Readable } = require('stream');
const Vessel = require('../models/Vessel');

class CSVUploadService {
  /**
   * Process uploaded vessel file (CSV or Excel)
   */
  async processVesselFile(file) {
    const fileType = file.originalname.split('.').pop().toLowerCase();
    let data;

    if (fileType === 'csv') {
      data = await this.parseCSV(file.buffer);
    } else if (['xlsx', 'xls'].includes(fileType)) {
      data = await this.parseExcel(file.buffer);
    } else {
      throw new Error('Unsupported file type. Please upload CSV or Excel file.');
    }

    return await this.processVesselData(data);
  }

  /**
   * Parse CSV file buffer
   */
  async parseCSV(buffer) {
    const results = [];
    const stream = Readable.from(buffer.toString());

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Parse Excel file buffer
   */
  parseExcel(buffer) {
    const workbook = xlsx.read(buffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(firstSheet);
  }

  /**
   * Map CSV row to vessel schema
   */
  mapRowToVesselSchema(row) {
    // Helper functions
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toISOString();
    };

    const parseNumber = (value, fallback = 0) => {
      if (!value || value === '') return fallback;
      const num = Number(value);
      return isNaN(num) ? fallback : num;
    };

    const parseBoolean = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return ['true', 'yes', '1'].includes(value.toLowerCase());
      }
      return Boolean(value);
    };

    const parseArray = (str) => {
      if (!str || str === '') return [];
      try {
        return JSON.parse(str);
      } catch {
        return str.split(',').map(item => item.trim()).filter(item => item !== '');
      }
    };

    // Process parcels
    const parcels = [];
    let parcelIndex = 1;
    
    while (row[`parcel${parcelIndex}Size`]) {
      const parcel = {
        size: parseNumber(row[`parcel${parcelIndex}Size`]),
        materialType: row[`parcel${parcelIndex}MaterialType`],
        qualityGrade: row[`parcel${parcelIndex}QualityGrade`],
        qualitySpecs: row[`parcel${parcelIndex}QualitySpecs`],
        plantAllocations: []
      };

      // Process plant allocations for this parcel
      let plantIndex = 1;
      while (row[`parcel${parcelIndex}Plant${plantIndex}Name`]) {
        if (row[`parcel${parcelIndex}Plant${plantIndex}Name`] && 
            row[`parcel${parcelIndex}Plant${plantIndex}Name`] !== '') {
          parcel.plantAllocations.push({
            plantName: row[`parcel${parcelIndex}Plant${plantIndex}Name`],
            requiredQuantity: parseNumber(row[`parcel${parcelIndex}Plant${plantIndex}Quantity`]),
            plantStockAvailability: parseNumber(row[`parcel${parcelIndex}Plant${plantIndex}Stock`])
          });
        }
        plantIndex++;
      }

      if (parcel.materialType && parcel.size > 0) {
        parcels.push(parcel);
      }
      parcelIndex++;
    }

    // Process port preferences
    const portPreferences = [];
    let portIndex = 1;
    
    while (row[`port${portIndex}Name`]) {
      if (row[`port${portIndex}Name`] && row[`port${portIndex}Name`] !== '') {
        portPreferences.push({
          portName: row[`port${portIndex}Name`],
          sequentialDischarge: parseBoolean(row[`port${portIndex}SequentialDischarge`]),
          dischargeOrder: parseArray(row[`port${portIndex}DischargeOrder`]),
          portStockAvailability: parseNumber(row[`port${portIndex}StockAvailability`])
        });
      }
      portIndex++;
    }

    // Return the complete vessel object
    return {
      name: row.name,
      capacity: parseNumber(row.capacity),
      ETA: parseDate(row.ETA),
      laydays: {
        start: parseDate(row.laydaysStart),
        end: parseDate(row.laydaysEnd)
      },
      loadPort: row.loadPort,
      supplier: {
        name: row.supplierName,
        country: row.supplierCountry
      },
      parcels: parcels,
      costParameters: {
        fringeOcean: parseNumber(row.costFringeOcean),
        fringeRail: parseNumber(row.costFringeRail),
        demurrageRate: parseNumber(row.costDemurrageRate),
        maxPortCalls: parseNumber(row.costMaxPortCalls),
        portHandlingFees: parseNumber(row.costPortHandlingFees),
        storageCost: parseNumber(row.costStorageCost),
        freeTime: parseNumber(row.costFreeTime),
        portDifferentialCost: parseNumber(row.costPortDifferentialCost)
      },
      railData: {
        rakeCapacity: parseNumber(row.railRakeCapacity),
        loadingTimePerDay: parseNumber(row.railLoadingTimePerDay),
        availability: parseBoolean(row.railAvailability),
        numberOfRakesRequired: parseNumber(row.railNumberOfRakes)
      },
      portPreferences: portPreferences
    };

    // Map the row data to vessel schema
    return {
      name: getName(['name', 'vesselName', 'Vessel Name']),
      capacity: parseNumber(getName(['capacity', 'Capacity', 'vesselCapacity'])),
      ETA: parseDate(getName(['ETA', 'eta', 'estimatedArrival'])),
      loadPort: getName(['loadPort', 'Load Port', 'port']),
      
      laydays: {
        start: parseDate(getName(['laydaysStart', 'Laydays Start', 'startDate'])),
        end: parseDate(getName(['laydaysEnd', 'Laydays End', 'endDate']))
      },

      supplier: {
        name: getName(['supplierName', 'Supplier Name', 'supplier']),
        country: getName(['supplierCountry', 'Supplier Country', 'country'])
      },

      costParameters: {
        fringeOcean: parseNumber(getName(['fringeOcean', 'Fringe Ocean'])),
        fringeRail: parseNumber(getName(['fringeRail', 'Fringe Rail'])),
        demurrageRate: parseNumber(getName(['demurrageRate', 'Demurrage Rate'])),
        maxPortCalls: parseNumber(getName(['maxPortCalls', 'Max Port Calls'])),
        portHandlingFees: parseNumber(getName(['portHandlingFees', 'Port Handling Fees'])),
        storageCost: parseNumber(getName(['storageCost', 'Storage Cost'])),
        freeTime: parseNumber(getName(['freeTime', 'Free Time'])),
        portDifferentialCost: parseNumber(getName(['portDifferentialCost', 'Port Differential Cost']))
      },

      railData: {
        rakeCapacity: parseNumber(getName(['rakeCapacity', 'Rake Capacity'])),
        loadingTimePerDay: parseNumber(getName(['loadingTimePerDay', 'Loading Time Per Day'])),
        availability: parseBoolean(getName(['railAvailability', 'Rail Availability'])),
        numberOfRakesRequired: parseNumber(getName(['numberOfRakesRequired', 'Number Of Rakes Required']))
      },

      parcels: this.parseParcels(row),
      portPreferences: this.parsePortPreferences(row)
    };
  }

  /**
   * Parse parcels from CSV row
   */
  parseParcels(row) {
    const parcelsStr = row.parcels || row.Parcels || row['Vessel Parcels'];
    if (!parcelsStr) return [];

    try {
      const parcels = JSON.parse(parcelsStr);
      return Array.isArray(parcels) ? parcels : [];
    } catch {
      // If JSON parsing fails, try basic comma-separated format
      return [{
        size: parseNumber(row.parcelSize || row['Parcel Size']),
        materialType: row.materialType || row['Material Type'],
        qualityGrade: row.qualityGrade || row['Quality Grade'],
        qualitySpecs: row.qualitySpecs || row['Quality Specs'],
        plantAllocations: []
      }];
    }
  }

  /**
   * Parse port preferences from CSV row
   */
  parsePortPreferences(row) {
    const prefsStr = row.portPreferences || row['Port Preferences'];
    if (!prefsStr) return [];

    try {
      const prefs = JSON.parse(prefsStr);
      return Array.isArray(prefs) ? prefs : [];
    } catch {
      return [];
    }
  }

  /**
   * Process all vessel data rows
   */
  async processVesselData(rows) {
    const results = {
      successful: [],
      failed: [],
      total: rows.length
    };

    for (const row of rows) {
      try {
        const vesselData = this.mapRowToVesselSchema(row);
        const vessel = new Vessel(vesselData);
        await vessel.validate();
        
        // Create the vessel
        const savedVessel = await vessel.save();
        results.successful.push({
          name: savedVessel.name,
          id: savedVessel._id
        });
      } catch (error) {
        results.failed.push({
          row,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Generate sample CSV template
   */
  generateTemplate() {
    return [
      'name,capacity,ETA,loadPort,laydaysStart,laydaysEnd,supplierName,supplierCountry',
      'Example Vessel,50000,2025-10-01,Kandla Port,2025-10-05,2025-10-15,Example Supplier,India',
      'Second Vessel,75000,2025-11-01,Paradip Port,2025-11-05,2025-11-15,Another Supplier,Australia'
    ].join('\n');
  }
}

module.exports = new CSVUploadService();