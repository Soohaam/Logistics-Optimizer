import React, { useState, useEffect } from 'react';
import { Ship, Plus, Edit, Trash2, BarChart3, MapPin, Clock, TrendingUp, AlertTriangle, Route, Calendar } from 'lucide-react';

interface Parcel {
  id: string;
  size: number;
  materialType: string;
  qualityGrade: string;
  targetPlant: string;
  qualitySpecs: string;
}

interface Vessel {
  _id?: string;
  name: string;
  capacity: number;
  ETA: string;
  loadPort: string;
  parcels: Parcel[];
  costParameters: {
    fringeOcean: number;
    fringeRail: number;
    demurrageRate: number;
    maxPortCalls: number;
    portHandlingFees: number;
    storageCost: number;
    freeTime: number;
    portDifferentialCost: number;
  };
  railData: {
    rakeCapacity: number;
    railLoadingTimePerDay: number;
    rakeAvailability: boolean;
  };
}

const VesselManager: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'addVessel' | 'optimization' | 'delayPrediction' | 'portToPlant' | 'timeline'>('dashboard');
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  
  // Add Vessel Form States
  const [formStep, setFormStep] = useState(1);
  const [newVessel, setNewVessel] = useState<Vessel>({
    name: '',
    capacity: 0,
    ETA: '',
    loadPort: '',
    parcels: [],
    costParameters: {
      fringeOcean: 0,
      fringeRail: 0,
      demurrageRate: 0,
      maxPortCalls: 0,
      portHandlingFees: 0,
      storageCost: 0,
      freeTime: 0,
      portDifferentialCost: 0
    },
    railData: {
      rakeCapacity: 0,
      railLoadingTimePerDay: 0,
      rakeAvailability: false
    }
  });

  // Dropdown options
  const loadPorts = ['Mumbai Port', 'JNPT Mumbai', 'Kandla Port', 'Paradip Port', 'Visakhapatnam Port'];
  const materialTypes = ['Iron Ore', 'Coal', 'Bauxite', 'Limestone', 'Manganese'];
  const qualityGrades = ['Grade A', 'Grade B', 'Grade C', 'Premium', 'Standard'];
  const targetPlants = ['Steel Plant A', 'Steel Plant B', 'Power Plant C', 'Cement Plant D', 'Aluminum Plant E'];

  const addParcel = () => {
    const newParcel: Parcel = {
      id: Date.now().toString(),
      size: 0,
      materialType: '',
      qualityGrade: '',
      targetPlant: '',
      qualitySpecs: ''
    };
    setNewVessel({
      ...newVessel,
      parcels: [...newVessel.parcels, newParcel]
    });
  };

  const updateParcel = (id: string, field: keyof Parcel, value: any) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map(parcel => 
        parcel.id === id ? { ...parcel, [field]: value } : parcel
      )
    });
  };

  const removeParcel = (id: string) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.filter(parcel => parcel.id !== id)
    });
  };

  const submitVessel = () => {
    setVessels([...vessels, { ...newVessel, _id: Date.now().toString() }]);
    setCurrentView('dashboard');
    setFormStep(1);
    setNewVessel({
      name: '',
      capacity: 0,
      ETA: '',
      loadPort: '',
      parcels: [],
      costParameters: {
        fringeOcean: 0,
        fringeRail: 0,
        demurrageRate: 0,
        maxPortCalls: 0,
        portHandlingFees: 0,
        storageCost: 0,
        freeTime: 0,
        portDifferentialCost: 0
      },
      railData: {
        rakeCapacity: 0,
        railLoadingTimePerDay: 0,
        rakeAvailability: false
      }
    });
  };

  const renderDashboard = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Current Vessels</h2>
        <button
          onClick={() => setCurrentView('addVessel')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Vessel
        </button>
      </div>

      {vessels.length === 0 ? (
        <div className="text-center py-12">
          <Ship className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vessels found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first vessel</p>
          <button
            onClick={() => setCurrentView('addVessel')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add First Vessel
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {vessels.map((vessel) => (
            <div key={vessel._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{vessel.name}</h3>
                  <p className="text-gray-600">Capacity: {vessel.capacity.toLocaleString()} MT</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedVessel(vessel);
                      setCurrentView('optimization');
                    }}
                    className="bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 flex items-center"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Optimize
                  </button>
                  <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">ETA:</span> {new Date(vessel.ETA).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Load Port:</span> {vessel.loadPort}
                </div>
                <div>
                  <span className="font-medium">Parcels:</span> {vessel.parcels.length}
                </div>
                <div>
                  <span className="font-medium">Rail Available:</span> {vessel.railData.rakeAvailability ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedVessel(vessel);
                    setCurrentView('delayPrediction');
                  }}
                  className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200 flex items-center"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Delay Prediction
                </button>
                <button
                  onClick={() => {
                    setSelectedVessel(vessel);
                    setCurrentView('portToPlant');
                  }}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 flex items-center"
                >
                  <Route className="h-3 w-3 mr-1" />
                  Port to Plant
                </button>
                <button
                  onClick={() => {
                    setSelectedVessel(vessel);
                    setCurrentView('timeline');
                  }}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm hover:bg-indigo-200 flex items-center"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Timeline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddVesselForm = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Vessel</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {[
            { step: 1, title: 'Basic Info' },
            { step: 2, title: 'Parcel Info' },
            { step: 3, title: 'Cost Parameters' },
            { step: 4, title: 'Constraints' },
            { step: 5, title: 'Rail Data' }
          ].map(({ step, title }) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                formStep === step ? 'bg-blue-600 text-white' : 
                formStep > step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              <span className={`ml-2 text-sm ${formStep === step ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {formStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vessel Name</label>
                <input
                  type="text"
                  value={newVessel.name}
                  onChange={(e) => setNewVessel({...newVessel, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter vessel name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (MT)</label>
                <input
                  type="number"
                  value={newVessel.capacity || ''}
                  onChange={(e) => setNewVessel({...newVessel, capacity: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter capacity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ETA</label>
                <input
                  type="date"
                  value={newVessel.ETA}
                  onChange={(e) => setNewVessel({...newVessel, ETA: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Load Port</label>
                <select
                  value={newVessel.loadPort}
                  onChange={(e) => setNewVessel({...newVessel, loadPort: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select load port</option>
                  {loadPorts.map(port => (
                    <option key={port} value={port}>{port}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Parcel Information</h3>
              <button
                onClick={addParcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Parcel
              </button>
            </div>

            {newVessel.parcels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No parcels added yet. Click "Add Parcel" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {newVessel.parcels.map((parcel, index) => (
                  <div key={parcel.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Parcel {index + 1}</h4>
                      <button
                        onClick={() => removeParcel(parcel.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parcel Size (MT)</label>
                        <input
                          type="number"
                          value={parcel.size || ''}
                          onChange={(e) => updateParcel(parcel.id, 'size', Number(e.target.value))}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
                        <select
                          value={parcel.materialType}
                          onChange={(e) => updateParcel(parcel.id, 'materialType', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="">Select material</option>
                          {materialTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
                        <select
                          value={parcel.qualityGrade}
                          onChange={(e) => updateParcel(parcel.id, 'qualityGrade', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="">Select grade</option>
                          {qualityGrades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Plant</label>
                        <select
                          value={parcel.targetPlant}
                          onChange={(e) => updateParcel(parcel.id, 'targetPlant', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="">Select plant</option>
                          {targetPlants.map(plant => (
                            <option key={plant} value={plant}>{plant}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quality Specifications</label>
                        <input
                          type="text"
                          value={parcel.qualitySpecs}
                          onChange={(e) => updateParcel(parcel.id, 'qualitySpecs', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter quality specifications"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {formStep === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Cost Parameters</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fringe Rate Ocean</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVessel.costParameters.fringeOcean || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    costParameters: {...newVessel.costParameters, fringeOcean: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fringe Rate Rail</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVessel.costParameters.fringeRail || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    costParameters: {...newVessel.costParameters, fringeRail: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Demurrage Rate</label>
                <input
                  type="number"
                  value={newVessel.costParameters.demurrageRate || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    costParameters: {...newVessel.costParameters, demurrageRate: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Port Calls</label>
                <input
                  type="number"
                  value={newVessel.costParameters.maxPortCalls || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    costParameters: {...newVessel.costParameters, maxPortCalls: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Port Handling Fees</label>
                <input
                  type="number"
                  value={newVessel.costParameters.portHandlingFees || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    costParameters: {...newVessel.costParameters, portHandlingFees: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Cost</label>
                <input
                  type="number"
                  value={newVessel.costParameters.storageCost || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    costParameters: {...newVessel.costParameters, storageCost: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Time (Hours)</label>
                <input
                  type="number"
                  value={newVessel.costParameters.freeTime || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    costParameters: {...newVessel.costParameters, freeTime: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Port Differential Cost</label>
                <input
                  type="number"
                  value={newVessel.costParameters.portDifferentialCost || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    costParameters: {...newVessel.costParameters, portDifferentialCost: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {formStep === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Constraints</h3>
            <div className="text-center py-8 text-gray-500">
              <p>Constraints configuration will be implemented here.</p>
              <p className="text-sm">This section will contain operational constraints and limitations.</p>
            </div>
          </div>
        )}

        {formStep === 5 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Rail Data</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rake Capacity</label>
                <input
                  type="number"
                  value={newVessel.railData.rakeCapacity || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    railData: {...newVessel.railData, rakeCapacity: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter rake capacity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rail Loading Time Per Day (Hours)</label>
                <input
                  type="number"
                  value={newVessel.railData.railLoadingTimePerDay || ''}
                  onChange={(e) => setNewVessel({
                    ...newVessel,
                    railData: {...newVessel.railData, railLoadingTimePerDay: Number(e.target.value)}
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter loading time per day"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newVessel.railData.rakeAvailability}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      railData: {...newVessel.railData, rakeAvailability: e.target.checked}
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Rake Availability</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setFormStep(Math.max(1, formStep - 1))}
            disabled={formStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          
          {formStep < 5 ? (
            <button
              onClick={() => setFormStep(formStep + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitVessel}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Vessel
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderOptimizationEngine = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Optimization Engine</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Dashboard
        </button>
      </div>

      {selectedVessel && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Vessel: {selectedVessel.name}</h3>
            
            {/* Recommended Port */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Recommended Port: JNPT Mumbai
              </h4>
              <p className="text-blue-700">Based on target plant analysis and cost optimization</p>
            </div>

            {/* Optimization Comparison */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Traditional Approach</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-medium">$2,450,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transit Time:</span>
                    <span className="font-medium">18 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Demurrage Risk:</span>
                    <span className="font-medium text-red-600">High</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3 text-green-700">Optimized Approach</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-medium text-green-600">$2,180,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transit Time:</span>
                    <span className="font-medium text-green-600">14 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Demurrage Risk:</span>
                    <span className="font-medium text-green-600">Low</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-900 mb-3">Total Savings: $270,000 (11% reduction)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$85K</div>
                  <div className="text-gray-600">Fringe Optimization</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$120K</div>
                  <div className="text-gray-600">Port Allocation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$35K</div>
                  <div className="text-gray-600">Rail Coordination</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$30K</div>
                  <div className="text-gray-600">Demurrage Reduction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Graph Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold mb-4">Cost Comparison Chart</h4>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Traditional vs Optimized Cost Breakdown Chart</p>
                <p className="text-sm">Chart visualization would be implemented here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDelayPrediction = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Delay Prediction</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Dashboard
        </button>
      </div>

      {selectedVessel && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Vessel: {selectedVessel.name}</h3>
            
            {/* Prediction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">2.5 Days</div>
                <div className="text-yellow-700 font-medium">Predicted Delay</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">78%</div>
                <div className="text-blue-700 font-medium">Confidence Level</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">$62,500</div>
                <div className="text-red-700 font-medium">Demurrage Impact</div>
              </div>
            </div>

            {/* Delay Factors */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Contributing Factors</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Weather Conditions</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">60% Impact</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Port Congestion</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">80% Impact</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Equipment Availability</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">25% Impact</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction Graph */}
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                <p>Delay Prediction Timeline Chart</p>
                <p className="text-sm">Historical patterns vs current prediction</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPortToPlant = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Port to Plant Analysis</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Dashboard
        </button>
      </div>

      {selectedVessel && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Vessel: {selectedVessel.name}</h3>
            
            {/* Plant Analysis for each parcel */}
            {selectedVessel.parcels.map((parcel, index) => (
              <div key={parcel.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">
                  Parcel {index + 1}: {parcel.materialType} → {parcel.targetPlant}
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">425 km</div>
                    <div className="text-sm text-gray-600">Distance to Plant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Rakes Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">12h</div>
                    <div className="text-sm text-gray-600">Loading Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">36h</div>
                    <div className="text-sm text-gray-600">Transit Time</div>
                  </div>
                </div>

                {/* Rake Requirements */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold mb-2">Rake Allocation</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Required Rakes:</span> {Math.ceil(parcel.size / selectedVessel.railData.rakeCapacity)}
                    </div>
                    <div>
                      <span className="font-medium">Material Size:</span> {parcel.size.toLocaleString()} MT
                    </div>
                    <div>
                      <span className="font-medium">Rake Capacity:</span> {selectedVessel.railData.rakeCapacity} MT
                    </div>
                  </div>
                </div>

                {/* Schedule Timeline */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Predicted Timeline</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Port Arrival:</span>
                      <span className="font-medium">{new Date(selectedVessel.ETA).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loading Complete:</span>
                      <span className="font-medium">{new Date(new Date(selectedVessel.ETA).getTime() + 24*60*60*1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plant Delivery:</span>
                      <span className="font-medium">{new Date(new Date(selectedVessel.ETA).getTime() + 3*24*60*60*1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Route Map Placeholder */}
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Route className="h-12 w-12 mx-auto mb-2" />
                <p>Port to Plant Route Visualization</p>
                <p className="text-sm">Interactive map showing rail routes and schedules</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTimeline = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complete Timeline</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Dashboard
        </button>
      </div>

      {selectedVessel && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6">Vessel: {selectedVessel.name}</h3>
            
            {/* Timeline Events */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              {/* Timeline Items */}
              <div className="space-y-6">
                {/* Departure from Origin */}
                <div className="relative flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Ship className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">Departure from Origin Port</h4>
                        <p className="text-gray-600">Vessel begins journey with cargo</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{new Date(new Date(selectedVessel.ETA).getTime() - 14*24*60*60*1000).toLocaleDateString()}</div>
                        <div className="text-gray-500">14 days before ETA</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ocean Transit */}
                <div className="relative flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">Ocean Transit</h4>
                        <p className="text-gray-600">Vessel in transit across ocean</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">12 days</div>
                        <div className="text-gray-500">Transit duration</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Port Arrival */}
                <div className="relative flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">Arrival at {selectedVessel.loadPort}</h4>
                        <p className="text-gray-600">Vessel docks and begins unloading process</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{new Date(selectedVessel.ETA).toLocaleDateString()}</div>
                        <div className="text-gray-500">ETA Date</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Port Processing */}
                <div className="relative flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">Port Processing & Documentation</h4>
                        <p className="text-gray-600">Customs clearance and cargo handling</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">1-2 days</div>
                        <div className="text-gray-500">Processing time</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rail Loading */}
                <div className="relative flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <Route className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">Rail Loading</h4>
                        <p className="text-gray-600">Cargo loaded onto rail rakes for transport</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{selectedVessel.railData.railLoadingTimePerDay}h per rake</div>
                        <div className="text-gray-500">Loading rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rail Transit */}
                <div className="relative flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">Rail Transit to Plants</h4>
                        <p className="text-gray-600">Material transport via rail to target plants</p>
                        <div className="mt-2 space-y-1">
                          {selectedVessel.parcels.map((parcel, index) => (
                            <div key={parcel.id} className="text-sm text-gray-600">
                              • {parcel.materialType} → {parcel.targetPlant}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">24-48h</div>
                        <div className="text-gray-500">Transit time</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Delivery */}
                <div className="relative flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">Final Delivery to Plants</h4>
                        <p className="text-gray-600">Material delivered and unloaded at target plants</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{new Date(new Date(selectedVessel.ETA).getTime() + 5*24*60*60*1000).toLocaleDateString()}</div>
                        <div className="text-gray-500">Predicted completion</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Timeline Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">19 days</div>
                  <div className="text-sm text-gray-600">Total Journey Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">5 days</div>
                  <div className="text-sm text-gray-600">Port to Plant</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">2 days</div>
                  <div className="text-sm text-gray-600">Buffer Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-gray-600">On-time Probability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Ship className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Vessel Manager</h1>
                  <p className="text-sm text-gray-500">Complete vessel management and optimization system</p>
                </div>
              </div>
              
              {currentView !== 'dashboard' && currentView !== 'addVessel' && (
                <nav className="flex space-x-4 text-sm">
                  <button
                    onClick={() => setCurrentView('optimization')}
                    className={`px-3 py-1 rounded ${currentView === 'optimization' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Optimization
                  </button>
                  <button
                    onClick={() => setCurrentView('delayPrediction')}
                    className={`px-3 py-1 rounded ${currentView === 'delayPrediction' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Delay Prediction
                  </button>
                  <button
                    onClick={() => setCurrentView('portToPlant')}
                    className={`px-3 py-1 rounded ${currentView === 'portToPlant' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Port to Plant
                  </button>
                  <button
                    onClick={() => setCurrentView('timeline')}
                    className={`px-3 py-1 rounded ${currentView === 'timeline' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Timeline
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'addVessel' && renderAddVesselForm()}
            {currentView === 'optimization' && renderOptimizationEngine()}
            {currentView === 'delayPrediction' && renderDelayPrediction()}
            {currentView === 'portToPlant' && renderPortToPlant()}
            {currentView === 'timeline' && renderTimeline()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VesselManager;