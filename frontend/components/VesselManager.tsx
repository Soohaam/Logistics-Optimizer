import React, { useState, useEffect } from 'react';
import { Ship, Plus, Edit, Trash2, CheckCircle, XCircle, Package, Settings, Train, Anchor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PlantAllocation {
  plantName: string;
  requiredQuantity: number;
  plantStockAvailability: number;
}

interface Parcel {
  id: string;
  size: number;
  loadPort: string;
  materialType: string;
  qualityGrade: string;
  qualitySpecs: string;
  plantAllocations: PlantAllocation[];
}

interface PortPreference {
  portName: string;
  sequentialDischarge: boolean;
  dischargeOrder: string[];
  portStockAvailability: number;
}

interface Vessel {
  _id?: string;
  name: string;
  capacity: number;
  ETA: string;
  laydays: {
    start: string;
    end: string;
  };
  loadPort: string;
  supplier: {
    name: string;
    country: string;
  };
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
    loadingTimePerDay: number;
    availability: boolean;
    numberOfRakesRequired: number;
  };
  portPreferences: PortPreference[];
}

const VesselManager: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/api/vessels';
  
  // Form state
  const [newVessel, setNewVessel] = useState<Vessel>({
    name: '',
    capacity: 0,
    ETA: '',
    laydays: {
      start: '',
      end: ''
    },
    loadPort: '',
    supplier: {
      name: '',
      country: ''
    },
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
      loadingTimePerDay: 0,
      availability: false,
      numberOfRakesRequired: 0
    },
    portPreferences: []
  });

  // Dropdown data
  const materialTypes = [
    'Coking Coal',
    'Limestone',
    'Dolomite',
    'Manganese Ore'
  ];
  
  const qualityGrades: { [key: string]: string[] } = {
    'Coking Coal': [
      'Hard coking coal (high vitrinite, low ash)',
      'Semi-soft coking coal (medium rank, higher ash)',
      'PCI coal (Pulverized Coal Injection grade)'
    ],
    'Limestone': [
      'Blast Furnace (BF) Grade Limestone',
      'Steel Melting Shop (SMS) Grade Limestone'
    ],
    'Dolomite': [
      'Blast Furnace (BF) Grade',
      'Steel Melting Shop (SMS) Grade'
    ],
    'Manganese Ore': [
      'High Grade (>46% Mn)',
      'Medium Grade (35–46% Mn)',
      'Low Grade (30–35% Mn)'
    ]
  };

  const qualitySpecs: { [key: string]: string } = {
    'Hard coking coal (high vitrinite, low ash)': 'Ash < 10%, Vitrinite > 60%, CSR > 65',
    'Semi-soft coking coal (medium rank, higher ash)': 'Ash 8–12%, Vitrinite 30–50%, Moderate CSR',
    'PCI coal (Pulverized Coal Injection grade)': 'Volatile Matter 20–35%, Ash < 12%',
    'Blast Furnace (BF) Grade Limestone': 'CaO: 43–50%, MgO: 2.25–5%, SiO₂: 3.5–6.5%',
    'Steel Melting Shop (SMS) Grade Limestone': 'CaO: 52% (+), MgO ≤1%, SiO₂ ≤1.5%',
    'Blast Furnace (BF) Grade': 'CaO ~30%, MgO ~18%, SiO₂ ≤5%',
    'Steel Melting Shop (SMS) Grade': 'CaO 30–32%, MgO 20–22%, SiO₂ 2.5–3.5%',
    'High Grade (>46% Mn)': '>46% Mn',
    'Medium Grade (35–46% Mn)': '35–46% Mn',
    'Low Grade (30–35% Mn)': '30–35% Mn'
  };

  const plants = [
    'Bhilai Steel Plant (BSP)',
    'Durgapur Steel Plant (DSP)',
    'Rourkela Steel Plant (RSP)',
    'Bokaro Steel Plant (BSL)',
    'IISCO Steel Plant (ISP)'
  ];

  const portNames = [
    'Visakhapatnam (Vizag) Port',
    'Haldia Port',
    'Paradip Port'
  ];

  const countries = [
    'India', 'Australia', 'Brazil', 'South Africa', 'Indonesia', 'China',
    'United States', 'Canada', 'Germany', 'United Kingdom', 'France',
    'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Thailand',
    'Vietnam', 'Philippines', 'New Zealand', 'Chile', 'Peru',
    'Colombia', 'Argentina', 'Mexico', 'Russia', 'Ukraine'
  ];

  // Helper functions for dropdown logic
  const getGrades = (materialType: string): string[] => {
    return qualityGrades[materialType] || [];
  };

  const getSpecs = (qualityGrade: string): string => {
    return qualitySpecs[qualityGrade] || '';
  };

  // API Functions
  const fetchVessels = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      
      if (data.success) {
        setVessels(data.data);
      } else {
        setMessage({type: 'error', text: data.error || 'Failed to fetch vessels'});
      }
    } catch {
      setMessage({type: 'error', text: 'Network error: Failed to fetch vessels'});
    } finally {
      setLoading(false);
    }
  };

  const createVessel = async (vesselData: Vessel) => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vesselData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({type: 'success', text: 'Vessel created successfully!'});
        setVessels([...vessels, data.data]);
        setShowForm(false);
        resetForm();
      } else {
        setMessage({type: 'error', text: data.error || 'Failed to create vessel'});
      }
    } catch {
      setMessage({type: 'error', text: 'Network error: Failed to create vessel'});
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewVessel({
      name: '',
      capacity: 0,
      ETA: '',
      laydays: {
        start: '',
        end: ''
      },
      loadPort: '',
      supplier: {
        name: '',
        country: ''
      },
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
        loadingTimePerDay: 0,
        availability: false,
        numberOfRakesRequired: 0
      },
      portPreferences: []
    });
  };

  // Form handlers
  const addParcel = () => {
    const newParcel: Parcel = {
      id: Date.now().toString(),
      size: 0,
      loadPort: '',
      materialType: '',
      qualityGrade: '',
      qualitySpecs: '',
      plantAllocations: []
    };
    setNewVessel({
      ...newVessel,
      parcels: [...newVessel.parcels, newParcel]
    });
  };

  const removeParcel = (id: string) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.filter(parcel => parcel.id !== id)
    });
  };

  const updateParcel = (id: string, field: keyof Parcel, value: string | number) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map(parcel => 
        parcel.id === id ? { ...parcel, [field]: value } : parcel
      )
    });
  };

  const addPlantAllocation = (parcelId: string) => {
    const newAllocation: PlantAllocation = {
      plantName: '',
      requiredQuantity: 0,
      plantStockAvailability: 0
    };
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map(parcel => 
        parcel.id === parcelId 
          ? { ...parcel, plantAllocations: [...parcel.plantAllocations, newAllocation] }
          : parcel
      )
    });
  };

  const removePlantAllocation = (parcelId: string, allocationIndex: number) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map(parcel => 
        parcel.id === parcelId 
          ? { ...parcel, plantAllocations: parcel.plantAllocations.filter((_, index) => index !== allocationIndex) }
          : parcel
      )
    });
  };

  const updatePlantAllocation = (parcelId: string, allocationIndex: number, field: keyof PlantAllocation, value: string | number) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map(parcel => 
        parcel.id === parcelId 
          ? { 
              ...parcel, 
              plantAllocations: parcel.plantAllocations.map((allocation, index) => 
                index === allocationIndex ? { ...allocation, [field]: value } : allocation
              )
            }
          : parcel
      )
    });
  };

  const addPortPreference = () => {
    const newPreference: PortPreference = {
      portName: '',
      sequentialDischarge: false,
      dischargeOrder: [],
      portStockAvailability: 0
    };
    setNewVessel({
      ...newVessel,
      portPreferences: [...newVessel.portPreferences, newPreference]
    });
  };

  const removePortPreference = (index: number) => {
    setNewVessel({
      ...newVessel,
      portPreferences: newVessel.portPreferences.filter((_, i) => i !== index)
    });
  };

  const updatePortPreference = (index: number, field: keyof PortPreference, value: string | number | boolean | string[]) => {
    setNewVessel({
      ...newVessel,
      portPreferences: newVessel.portPreferences.map((pref, i) => 
        i === index ? { ...pref, [field]: value } : pref
      )
    });
  };

  const handleMaterialTypeChange = (parcelId: string, materialType: string) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map(parcel => 
        parcel.id === parcelId 
          ? { ...parcel, materialType, qualityGrade: '', qualitySpecs: '' } 
          : parcel
      )
    });
  };

  const handleQualityGradeChange = (parcelId: string, qualityGrade: string) => {
    const specs = getSpecs(qualityGrade);
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map(parcel => 
        parcel.id === parcelId 
          ? { ...parcel, qualityGrade, qualitySpecs: specs } 
          : parcel
      )
    });
  };

  const validateDates = () => {
    const today = new Date().toISOString().split('T')[0];
    const eta = newVessel.ETA;
    const laydaysStart = newVessel.laydays.start;
    const laydaysEnd = newVessel.laydays.end;

    if (eta && eta < today) {
      setMessage({type: 'error', text: 'ETA must be today or a future date'});
      return false;
    }

    if (laydaysStart && laydaysEnd && laydaysStart > laydaysEnd) {
      setMessage({type: 'error', text: 'Laydays start must be before or equal to laydays end'});
      return false;
    }

    return true;
  };

  const submitVessel = () => {
    if (!validateDates()) return;
    createVessel(newVessel);
  };

  // Fetch vessels on component mount
  useEffect(() => {
    fetchVessels();
  }, []);

  const renderVesselsList = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold" style={{ color: '#06156B' }}>Fleet Management</h2>
          <p className="text-slate-600 mt-2 text-lg">Manage your vessel fleet and cargo operations</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          style={{ backgroundColor: '#06156B' }}
          className="hover:bg-blue-900 shadow-lg text-white px-8 py-4 text-lg"
          size="lg"
        >
          <Plus className="h-6 w-6 mr-3" />
          Add New Vessel
        </Button>
      </div>

      {loading ? (
        <Card className="shadow-lg border-0">
          <CardContent className="text-center py-16">
            <div 
              className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-6"
              style={{ borderBottomColor: '#06156B' }}
            ></div>
            <p className="text-slate-600 text-lg">Loading vessels...</p>
          </CardContent>
        </Card>
      ) : vessels.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="text-center py-20">
            <Ship className="h-20 w-20 mx-auto mb-6" style={{ color: '#06156B', opacity: 0.3 }} />
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#06156B' }}>No vessels in your fleet</h3>
            <p className="text-slate-600 mb-8 text-lg">Start managing your maritime operations by adding your first vessel</p>
            <Button 
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: '#06156B' }}
              className="hover:bg-blue-900 px-8 py-4 text-lg"
            >
              Add First Vessel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {vessels.map((vessel) => (
            <Card key={vessel._id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader className="pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3" style={{ color: '#06156B' }}>
                      <Ship className="h-6 w-6" style={{ color: '#06156B' }} />
                      {vessel.name}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      Capacity: {vessel.capacity.toLocaleString()} MT
                    </CardDescription>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="default" 
                      className="text-red-600 hover:text-red-700 px-4 py-2"
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete the vessel "${vessel.name}"? This action cannot be undone.`)) {
                          try {
                            setLoading(true);
                            const response = await fetch(`${API_BASE_URL}/${vessel._id}`, {
                              method: 'DELETE',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                            });
                            const data = await response.json();
                            
                            if (data.success) {
                              setVessels(vessels.filter(v => v._id !== vessel._id));
                              setMessage({ type: 'success', text: `Vessel "${vessel.name}" deleted successfully!` });
                            } else {
                              setMessage({ type: 'error', text: data.error || 'Failed to delete vessel' });
                            }
                          } catch {
                            setMessage({ type: 'error', text: 'Network error: Failed to delete vessel' });
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">ETA</Label>
                    <p className="font-semibold text-lg">{new Date(vessel.ETA).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Load Port</Label>
                    <p className="font-semibold text-lg">{vessel.loadPort}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Parcels</Label>
                    <Badge variant="secondary" className="text-base px-3 py-1">{vessel.parcels.length} parcels</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Rail Status</Label>
                    <Badge 
                      variant={vessel.railData.availability ? "default" : "secondary"}
                      className="text-base px-3 py-1"
                      style={vessel.railData.availability ? { backgroundColor: '#06156B' } : {}}
                    >
                      {vessel.railData.availability ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Port Status</Label>
                    <p className="font-semibold text-lg">
                      {vessel.portPreferences.length > 0 
                        ? vessel.portPreferences.map(pref => pref.portName).join(', ') 
                        : 'Not Set'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Plant Status</Label>
                    <p className="font-semibold text-lg">
                      {vessel.parcels.some(parcel => parcel.plantAllocations.length > 0)
                        ? [...new Set(vessel.parcels.flatMap(parcel => parcel.plantAllocations.map(alloc => alloc.plantName)))].join(', ')
                        : 'Not Set'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Laydays</Label>
                    <p className="font-semibold text-lg">
                      {vessel.laydays.start && vessel.laydays.end 
                        ? `${new Date(vessel.laydays.start).toLocaleDateString()} - ${new Date(vessel.laydays.end).toLocaleDateString()}`
                        : 'Not Set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderVesselForm = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold" style={{ color: '#06156B' }}>Add New Vessel</h2>
          <p className="text-slate-600 mt-2 text-lg">Create a comprehensive vessel record</p>
        </div>
        <Button
          onClick={() => setShowForm(false)}
          variant="outline"
          className="px-8 py-4 text-lg"
          size="lg"
        >
          Cancel
        </Button>
      </div>

      <Card className="shadow-xl border-0">
        <CardContent className="p-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-10 h-16">
              <TabsTrigger value="general" className="flex items-center gap-3 text-lg px-6 py-4">
                <Ship className="h-5 w-5" />
                General Info
              </TabsTrigger>
              <TabsTrigger value="parcels" className="flex items-center gap-3 text-lg px-6 py-4">
                <Package className="h-5 w-5" />
                Parcel Form
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-3 text-lg px-6 py-4">
                <Settings className="h-5 w-5" />
                Cost Parameters
              </TabsTrigger>
              <TabsTrigger value="rail" className="flex items-center gap-3 text-lg px-6 py-4">
                <Train className="h-5 w-5" />
                Rail Data
              </TabsTrigger>
            </TabsList>

            {/* General Info Tab */}
            <TabsContent value="general" className="space-y-10">
              {/* Vessel Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <Ship className="h-6 w-6" style={{ color: '#06156B' }} />
                  <h3 className="text-2xl font-semibold" style={{ color: '#06156B' }}>Vessel Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="vesselName" className="text-lg">Vessel Name</Label>
                    <Input
                      id="vesselName"
                      value={newVessel.name}
                      onChange={(e) => setNewVessel({...newVessel, name: e.target.value})}
                      placeholder="e.g., MV Ocean Star"
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="capacity" className="text-lg">Capacity (MT)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newVessel.capacity || ''}
                      onChange={(e) => setNewVessel({...newVessel, capacity: Number(e.target.value)})}
                      placeholder="e.g., 50000"
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="eta" className="text-lg">ETA</Label>
                    <Input
                      id="eta"
                      type="date"
                      value={newVessel.ETA}
                      onChange={(e) => setNewVessel({...newVessel, ETA: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="loadPort" className="text-lg">Load Port</Label>
                    <Input
                      id="loadPort"
                      value={newVessel.loadPort}
                      onChange={(e) => setNewVessel({...newVessel, loadPort: e.target.value})}
                      placeholder="Enter load port name"
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="laydaysStart" className="text-lg">Laydays Start</Label>
                    <Input
                      id="laydaysStart"
                      type="date"
                      value={newVessel.laydays.start}
                      onChange={(e) => setNewVessel({
                        ...newVessel, 
                        laydays: {...newVessel.laydays, start: e.target.value}
                      })}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="laydaysEnd" className="text-lg">Laydays End</Label>
                    <Input
                      id="laydaysEnd"
                      type="date"
                      value={newVessel.laydays.end}
                      onChange={(e) => setNewVessel({
                        ...newVessel, 
                        laydays: {...newVessel.laydays, end: e.target.value}
                      })}
                      min={newVessel.laydays.start}
                      className="h-12 text-lg"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Supplier Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="h-6 w-6" style={{ color: '#06156B' }} />
                  <h3 className="text-2xl font-semibold" style={{ color: '#06156B' }}>Supplier Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="supplierName" className="text-lg">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      value={newVessel.supplier.name}
                      onChange={(e) => setNewVessel({
                        ...newVessel, 
                        supplier: {...newVessel.supplier, name: e.target.value}
                      })}
                      placeholder="e.g., BHP Billiton"
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="supplierCountry" className="text-lg">Supplier Country</Label>
                    <Select
                      value={newVessel.supplier.country}
                      onValueChange={(value) => setNewVessel({
                        ...newVessel, 
                        supplier: {...newVessel.supplier, country: value}
                      })}
                    >
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country} className="text-lg">{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Parcels Tab */}
            <TabsContent value="parcels" className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6" style={{ color: '#06156B' }} />
                  <h3 className="text-2xl font-semibold" style={{ color: '#06156B' }}>Cargo Parcels</h3>
                </div>
                <Button
                  onClick={addParcel}
                  style={{ backgroundColor: '#06156B' }}
                  className="hover:bg-blue-900 px-6 py-3 text-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Parcel
                </Button>
              </div>

              {newVessel.parcels.length === 0 ? (
                <Card className="shadow-lg border-0">
                  <CardContent className="text-center py-16">
                    <Package className="h-16 w-16 mx-auto mb-6" style={{ color: '#06156B', opacity: 0.3 }} />
                    <p className="text-slate-600 text-lg">No parcels added yet. Click Add Parcel to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {newVessel.parcels.map((parcel, index) => (
                    <Card key={parcel.id} className="shadow-lg border-0">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl">Parcel {index + 1}</CardTitle>
                          <Button
                            onClick={() => removeParcel(parcel.id)}
                            variant="outline"
                            size="default"
                            className="text-red-600 hover:text-red-700 px-4 py-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="text-lg">Parcel Size (MT)</Label>
                            <Input
                              type="number"
                              value={parcel.size || ''}
                              onChange={(e) => updateParcel(parcel.id, 'size', Number(e.target.value))}
                              placeholder="e.g., 25000"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-lg">Load Port</Label>
                            <Input
                              value={parcel.loadPort || ''}
                              onChange={(e) => updateParcel(parcel.id, 'loadPort', e.target.value)}
                              placeholder="Enter load port name"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-lg">Material Type</Label>
                            <Select
                              value={parcel.materialType}
                              onValueChange={(value) => handleMaterialTypeChange(parcel.id, value)}
                            >
                              <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Select material type" />
                              </SelectTrigger>
                              <SelectContent>
                                {materialTypes.map(type => (
                                  <SelectItem key={type} value={type} className="text-lg">{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label className="text-lg">Quality Grade</Label>
                            <Select
                              value={parcel.qualityGrade}
                              onValueChange={(value) => handleQualityGradeChange(parcel.id, value)}
                              disabled={!parcel.materialType}
                            >
                              <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Select quality grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {parcel.materialType && getGrades(parcel.materialType).map(grade => (
                                  <SelectItem key={grade} value={grade} className="text-lg">{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3 md:col-span-2">
                            <Label className="text-lg">Quality Specifications</Label>
                            <Input
                              value={parcel.qualitySpecs}
                              placeholder="Auto-populated based on quality grade"
                              readOnly
                              className="bg-gray-50 h-12 text-lg"
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-xl" style={{ color: '#06156B' }}>Plant Allocations</h4>
                            <Button
                              onClick={() => addPlantAllocation(parcel.id)}
                              variant="outline"
                              className="px-4 py-2 text-lg"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Add Plant
                            </Button>
                          </div>
                          
                          {parcel.plantAllocations.length === 0 ? (
                            <p className="text-slate-600 text-lg py-6">No plant allocations added yet.</p>
                          ) : (
                            <div className="space-y-4">
                              {parcel.plantAllocations.map((allocation, allocationIndex) => (
                                <Card key={allocationIndex} className="bg-gray-50 border-0">
                                  <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="space-y-3">
                                        <Label className="text-lg">Plant Name</Label>
                                        <Select
                                          value={allocation.plantName}
                                          onValueChange={(value) => updatePlantAllocation(parcel.id, allocationIndex, 'plantName', value)}
                                        >
                                          <SelectTrigger className="h-12 text-lg">
                                            <SelectValue placeholder="Select plant" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {plants.map(plant => (
                                              <SelectItem key={plant} value={plant} className="text-lg">{plant}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-lg">Required Quantity (MT)</Label>
                                        <Input
                                          type="number"
                                          value={allocation.requiredQuantity || ''}
                                          onChange={(e) => updatePlantAllocation(parcel.id, allocationIndex, 'requiredQuantity', Number(e.target.value))}
                                          placeholder="MT"
                                          className="h-12 text-lg"
                                        />
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <Label className="text-lg">Stock Availability (MT)</Label>
                                          <Button
                                            onClick={() => removePlantAllocation(parcel.id, allocationIndex)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 h-auto p-2"
                                          >
                                            <Trash2 className="h-5 w-5" />
                                          </Button>
                                        </div>
                                        <Input
                                          type="number"
                                          value={allocation.plantStockAvailability || ''}
                                          onChange={(e) => updatePlantAllocation(parcel.id, allocationIndex, 'plantStockAvailability', Number(e.target.value))}
                                          placeholder="MT"
                                          className="h-12 text-lg"
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Separator />

              {/* Port Preferences */}
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Anchor className="h-6 w-6" style={{ color: '#06156B' }} />
                    <h3 className="text-2xl font-semibold" style={{ color: '#06156B' }}>Port Preferences</h3>
                  </div>
                  <Button
                    onClick={addPortPreference}
                    variant="outline"
                    className="px-6 py-3 text-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Port Preference
                  </Button>
                </div>

                {newVessel.portPreferences.length === 0 ? (
                  <Card className="shadow-lg border-0">
                    <CardContent className="text-center py-16">
                      <Anchor className="h-16 w-16 mx-auto mb-6" style={{ color: '#06156B', opacity: 0.3 }} />
                      <p className="text-slate-600 text-lg">No port preferences added yet. Click Add Port Preference to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {newVessel.portPreferences.map((preference, index) => (
                      <Card key={index} className="shadow-lg border-0">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xl">Port Preference {index + 1}</CardTitle>
                            <Button
                              onClick={() => removePortPreference(index)}
                              variant="outline"
                              size="default"
                              className="text-red-600 hover:text-red-700 px-4 py-2"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-lg">Port Name</Label>
                              <Select
                                value={preference.portName}
                                onValueChange={(value) => updatePortPreference(index, 'portName', value)}
                              >
                                <SelectTrigger className="h-12 text-lg">
                                  <SelectValue placeholder="Select port" />
                                </SelectTrigger>
                                <SelectContent>
                                  {portNames.map(port => (
                                    <SelectItem key={port} value={port} className="text-lg">{port}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-lg">Port Stock Availability (MT)</Label>
                              <Input
                                type="number"
                                value={preference.portStockAvailability || ''}
                                onChange={(e) => updatePortPreference(index, 'portStockAvailability', Number(e.target.value))}
                                placeholder="Enter stock availability in MT"
                                className="h-12 text-lg"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`sequential-${index}`}
                                checked={preference.sequentialDischarge}
                                onCheckedChange={(checked) => updatePortPreference(index, 'sequentialDischarge', checked as boolean)}
                              />
                              <Label htmlFor={`sequential-${index}`} className="text-lg">Sequential Discharge</Label>
                            </div>
                          </div>
                          
                          {preference.sequentialDischarge && (
                            <div className="space-y-4">
                              <Label className="text-lg font-semibold">Discharge Order</Label>
                              <div className="space-y-3">
                                {preference.dischargeOrder.map((port, orderIndex) => (
                                  <div key={orderIndex} className="flex items-center space-x-3">
                                    <span className="text-lg text-slate-600 w-8">{orderIndex + 1}.</span>
                                    <Select
                                      value={port}
                                      onValueChange={(value) => {
                                        const newOrder = [...preference.dischargeOrder];
                                        newOrder[orderIndex] = value;
                                        updatePortPreference(index, 'dischargeOrder', newOrder);
                                      }}
                                    >
                                      <SelectTrigger className="flex-1 h-12 text-lg">
                                        <SelectValue placeholder="Select port" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {portNames.map(portName => (
                                          <SelectItem key={portName} value={portName} className="text-lg">{portName}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      onClick={() => {
                                        const newOrder = preference.dischargeOrder.filter((_, i) => i !== orderIndex);
                                        updatePortPreference(index, 'dischargeOrder', newOrder);
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 px-3 py-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  onClick={() => {
                                    const newOrder = [...preference.dischargeOrder, ''];
                                    updatePortPreference(index, 'dischargeOrder', newOrder);
                                  }}
                                  variant="outline"
                                  className="px-4 py-2 text-lg"
                                >
                                  <Plus className="h-5 w-5 mr-2" />
                                  Add Port to Order
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Cost Parameters Tab */}
            <TabsContent value="costs" className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-6 w-6" style={{ color: '#06156B' }} />
                <h3 className="text-2xl font-semibold" style={{ color: '#06156B' }}>Cost Parameters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-lg">Fringe Ocean</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.fringeOcean || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      costParameters: {...newVessel.costParameters, fringeOcean: Number(e.target.value)}
                    })}
                    placeholder="Enter fringe ocean cost"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Fringe Rail</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.fringeRail || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      costParameters: {...newVessel.costParameters, fringeRail: Number(e.target.value)}
                    })}
                    placeholder="Enter fringe rail cost"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Demurrage Rate</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.demurrageRate || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      costParameters: {...newVessel.costParameters, demurrageRate: Number(e.target.value)}
                    })}
                    placeholder="Enter demurrage rate"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Max Port Calls</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.maxPortCalls || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      costParameters: {...newVessel.costParameters, maxPortCalls: Number(e.target.value)}
                    })}
                    placeholder="Enter max port calls"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Port Handling Fees</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.portHandlingFees || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      costParameters: {...newVessel.costParameters, portHandlingFees: Number(e.target.value)}
                    })}
                    placeholder="Enter port handling fees"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Storage Cost</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.storageCost || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      costParameters: {...newVessel.costParameters, storageCost: Number(e.target.value)}
                    })}
                    placeholder="Enter storage cost"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Free Time (Days)</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.freeTime || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      costParameters: {...newVessel.costParameters, freeTime: Number(e.target.value)}
                    })}
                    placeholder="Enter free time in days"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Port Differential Cost</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.portDifferentialCost || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      costParameters: {...newVessel.costParameters, portDifferentialCost: Number(e.target.value)}
                    })}
                    placeholder="Enter port differential cost"
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Rail Data Tab */}
            <TabsContent value="rail" className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <Train className="h-6 w-6" style={{ color: '#06156B' }} />
                <h3 className="text-2xl font-semibold" style={{ color: '#06156B' }}>Rail Data</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-lg">Rake Capacity (MT)</Label>
                  <Input
                    type="number"
                    value={newVessel.railData.rakeCapacity || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      railData: {...newVessel.railData, rakeCapacity: Number(e.target.value)}
                    })}
                    placeholder="Enter rake capacity in MT"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Loading Time Per Day (Hours)</Label>
                  <Input
                    type="number"
                    value={newVessel.railData.loadingTimePerDay || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      railData: {...newVessel.railData, loadingTimePerDay: Number(e.target.value)}
                    })}
                    placeholder="Enter loading time per day"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Number of Rakes Required</Label>
                  <Input
                    type="number"
                    value={newVessel.railData.numberOfRakesRequired || ''}
                    onChange={(e) => setNewVessel({
                      ...newVessel,
                      railData: {...newVessel.railData, numberOfRakesRequired: Number(e.target.value)}
                    })}
                    placeholder="Enter number of rakes required"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="flex items-center space-x-3 pt-6">
                  <Checkbox
                    id="rakeAvailability"
                    checked={newVessel.railData.availability}
                    onCheckedChange={(checked) => setNewVessel({
                      ...newVessel,
                      railData: {...newVessel.railData, availability: checked as boolean}
                    })}
                  />
                  <Label htmlFor="rakeAvailability" className="text-lg font-medium">Rake Availability</Label>
                </div>
              </div>
            </TabsContent>

            {/* Submit Button */}
            <div className="flex justify-end pt-8 border-t border-gray-200">
              <Button
                onClick={submitVessel}
                disabled={loading}
                style={{ backgroundColor: '#06156B' }}
                className="hover:bg-blue-900 px-10 py-4 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <div 
                      className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"
                    ></div>
                    Creating Vessel...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6 mr-3" />
                    Create Vessel
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Ship className="h-10 w-10" style={{ color: '#06156B' }} />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#06156B' }}>Vessel Management System</h1>
                <p className="text-lg text-slate-600 mt-1">Create and manage vessel data with comprehensive form validation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-8 p-6 rounded-lg flex items-center text-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-6 w-6 mr-3" />
            ) : (
              <XCircle className="h-6 w-6 mr-3" />
            )}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            {showForm ? renderVesselForm() : renderVesselsList()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VesselManager;