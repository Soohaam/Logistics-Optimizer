import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Ship, 
  Calendar, 
  Package, 
  MapPin, 
  Anchor,
  User,
  Clock,
  DollarSign,
  Train,
  AlertCircle,
  CheckCircle,
  Info,
  Globe,
  Factory,
  Truck,
  Timer,
  Map
} from 'lucide-react';
import DelayPrediction from './DelayPrediction';
import PortToPlant from './PortToPlant';
import { Optimization } from './PlaceholderComponents';
import { TabType } from '../types/delay-prediction';

interface PlantAllocation {
  plantName: string;
  requiredQuantity: number;
  plantStockAvailability: number;
  _id: string;
}

interface Parcel {
  size: number;
  materialType: string;
  qualityGrade: string;
  qualitySpecs: string;
  plantAllocations: PlantAllocation[];
  _id: string;
}

interface CostParameters {
  fringeOcean: number;
  fringeRail: number;
  demurrageRate: number;
  maxPortCalls: number;
  portHandlingFees: number;
  storageCost: number;
  freeTime: number;
  portDifferentialCost: number;
}

interface RailData {
  rakeCapacity: number;
  loadingTimePerDay: number;
  availability: boolean;
  numberOfRakesRequired: number;
}

interface PortPreference {
  portName: string;
  sequentialDischarge: boolean;
  dischargeOrder: string[];
  portStockAvailability: number;
  _id: string;
}

interface Supplier {
  name: string;
  country: string;
}

interface VesselDetails {
  _id: string;
  name: string;
  capacity: number;
  ETA: string;
  laydays: {
    start: string;
    end: string;
  };
  loadPort: string;
  supplier: Supplier;
  parcels: Parcel[];
  costParameters: CostParameters;
  railData: RailData;
  portPreferences: PortPreference[];
  createdAt: string;
  updatedAt: string;
}

const VesselPrediction: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const vesselId = params.vesselId as string;

  const [activeTab, setActiveTab] = useState<TabType>('vessel-details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vesselDetails, setVesselDetails] = useState<VesselDetails | null>(null);
  const [delayPredictionLoaded, setDelayPredictionLoaded] = useState(false);
  const [portToPlantLoaded, setPortToPlantLoaded] = useState(false);

  const tabOrder: TabType[] = ['vessel-details', 'delay-prediction', 'port-to-plant', 'optimization'];

  useEffect(() => {
    const fetchVesselDetails = async () => {
      if (!vesselId) return;

      try {
        const response = await fetch(`http://localhost:5000/api/vessels/${vesselId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch vessel details');
        }

        setVesselDetails(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVesselDetails();
  }, [vesselId]);

  const handleNext = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    router.back();
  };


  const isNextDisabled = () => {
    if (activeTab === 'delay-prediction' && !delayPredictionLoaded) return true;
    if (activeTab === 'port-to-plant' && !portToPlantLoaded) return true;
    return tabOrder.indexOf(activeTab) === tabOrder.length - 1;
  };

  // Calculate some derived metrics
  const calculateDerivedMetrics = (vessel: VesselDetails) => {
    const totalCargoVolume = vessel.parcels.reduce((total, parcel) => total + parcel.size, 0);
    const totalPlantAllocations = vessel.parcels.reduce((total, parcel) => total + parcel.plantAllocations.length, 0);
    const laydaysDuration = Math.ceil(
      (new Date(vessel.laydays.end).getTime() - new Date(vessel.laydays.start).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalRequiredQuantity = vessel.parcels.reduce((total, parcel) => 
      total + parcel.plantAllocations.reduce((sum, allocation) => sum + allocation.requiredQuantity, 0), 0
    );
    const totalAvailableStock = vessel.parcels.reduce((total, parcel) => 
      total + parcel.plantAllocations.reduce((sum, allocation) => sum + allocation.plantStockAvailability, 0), 0
    );

    return {
      totalCargoVolume,
      totalPlantAllocations,
      laydaysDuration,
      totalRequiredQuantity,
      totalAvailableStock,
      stockShortfall: Math.max(0, totalRequiredQuantity - totalAvailableStock),
      utilizationPercentage: Math.round((totalCargoVolume / vessel.capacity) * 100)
    };
  };

  if (!vesselId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 shadow-lg rounded-xl border border-gray-200">
          <CardContent>
            <p className="text-lg text-gray-600 font-medium">No vessel selected</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 shadow-lg rounded-xl border border-gray-200">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-lg text-gray-600 font-medium">Loading vessel details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 shadow-lg rounded-xl border border-red-200">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-lg text-red-600 font-medium">Error: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2 transition-all duration-200"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = vesselDetails ? calculateDerivedMetrics(vesselDetails) : null;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg px-6 py-2 transition-all duration-200 shadow-sm"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          
          
        </div>
        
        <Button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2 transition-all duration-200 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
          <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-2 bg-gray-100 p-2 rounded-xl shadow-sm">
          {['vessel-details', 'delay-prediction', 'port-to-plant', 'optimization'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              disabled={
                (tab === 'port-to-plant' && !delayPredictionLoaded) ||
                (tab === 'optimization' && (!delayPredictionLoaded || !portToPlantLoaded))
              }
              className="py-3 px-4 rounded-lg font-medium text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed transition-all duration-200"
            >
              {tab === 'vessel-details' && <Ship className="h-5 w-5 mr-2" />}
              {tab === 'delay-prediction' && <Calendar className="h-5 w-5 mr-2" />}
              {tab === 'port-to-plant' && <Package className="h-5 w-5 mr-2" />}
              {tab === 'optimization' && <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              {tab.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="vessel-details">
          <div className="space-y-6">
            {vesselDetails && (
              <>
                {/* Vessel Overview Header */}
                <Card className="border-0 shadow-lg rounded-xl bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Ship className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-800">{vesselDetails.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">Vessel ID: {vesselDetails._id}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="px-3 py-1">
                        {metrics?.utilizationPercentage}% Utilized
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Anchor className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{vesselDetails.capacity.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">MT Capacity</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{metrics?.totalCargoVolume.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Cargo</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Factory className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{metrics?.totalPlantAllocations}</p>
                        <p className="text-sm text-gray-600">Plant Destinations</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{metrics?.laydaysDuration}</p>
                        <p className="text-sm text-gray-600">Laydays Duration</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rest of the existing content remains the same... */}
                {/* Vessel & Supplier Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg rounded-xl bg-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ship className="h-5 w-5 text-blue-600" />
                        Vessel Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Load Port</span>
                        </div>
                        <span>{vesselDetails.loadPort}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">ETA</span>
                        </div>
                        <span>{new Date(vesselDetails.ETA).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Created</span>
                        </div>
                        <span>{new Date(vesselDetails.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Last Updated</span>
                        </div>
                        <span>{new Date(vesselDetails.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg rounded-xl bg-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-green-600" />
                        Supplier Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Supplier Name</span>
                        </div>
                        <span className="font-semibold">{vesselDetails.supplier.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Country</span>
                        </div>
                        <span>{vesselDetails.supplier.country}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Laydays Information */}
                <Card className="border-0 shadow-lg rounded-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      Laydays Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">Start Date</h4>
                        <p className="text-lg font-medium text-orange-700">
                          {new Date(vesselDetails.laydays.start).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-orange-600">
                          {new Date(vesselDetails.laydays.start).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">End Date</h4>
                        <p className="text-lg font-medium text-red-700">
                          {new Date(vesselDetails.laydays.end).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-red-600">
                          {new Date(vesselDetails.laydays.end).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Duration</h4>
                        <p className="text-lg font-medium text-blue-700">
                          {metrics?.laydaysDuration} Days
                        </p>
                        <p className="text-sm text-blue-600">
                          Loading Window
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parcels & Plant Allocations */}
                <Card className="border-0 shadow-lg rounded-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      Cargo Parcels & Plant Allocations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {vesselDetails.parcels.map((parcel, index) => (
                        <div key={parcel._id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="px-3 py-1">
                                Parcel {index + 1}
                              </Badge>
                              <span className="text-lg font-semibold">{parcel.size.toLocaleString()} MT</span>
                            </div>
                            <Badge variant="outline">
                              {parcel.materialType}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h5 className="font-semibold text-sm text-gray-600 mb-1">Material Type</h5>
                              <p className="font-medium">{parcel.materialType}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm text-gray-600 mb-1">Quality Grade</h5>
                              <p className="font-medium">{parcel.qualityGrade}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm text-gray-600 mb-1">Quality Specs</h5>
                              <p className="font-medium">{parcel.qualitySpecs}</p>
                            </div>
                          </div>

                          {parcel.plantAllocations.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-sm text-gray-600 mb-3">Plant Allocations</h5>
                              <div className="grid gap-3">
                                {parcel.plantAllocations.map((allocation, allocIndex) => (
                                  <div key={allocation._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Factory className="h-5 w-5 text-gray-500" />
                                      <div>
                                        <p className="font-medium">{allocation.plantName}</p>
                                        <p className="text-sm text-gray-600">
                                          Required: {allocation.requiredQuantity.toLocaleString()} MT
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-600">Stock Available</p>
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">{allocation.plantStockAvailability.toLocaleString()} MT</p>
                                        {allocation.plantStockAvailability >= allocation.requiredQuantity ? (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-blue-600">Total Required</p>
                          <p className="text-xl font-bold text-blue-800">
                            {metrics?.totalRequiredQuantity.toLocaleString()} MT
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600">Total Available</p>
                          <p className="text-xl font-bold text-blue-800">
                            {metrics?.totalAvailableStock.toLocaleString()} MT
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600">Stock Shortfall</p>
                          <p className={`text-xl font-bold ${metrics?.stockShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {metrics?.stockShortfall > 0 ? `${metrics.stockShortfall.toLocaleString()} MT` : 'None'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rail Transportation Data */}
                <Card className="border-0 shadow-lg rounded-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Train className="h-5 w-5 text-green-600" />
                      Rail Transportation
                      <Badge variant={vesselDetails.railData.availability ? "default" : "destructive"}>
                        {vesselDetails.railData.availability ? "Available" : "Not Available"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Train className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-xl font-bold text-gray-800">{vesselDetails.railData.rakeCapacity.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Rake Capacity (MT)</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-xl font-bold text-gray-800">{vesselDetails.railData.loadingTimePerDay.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Loading/Day (MT)</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Package className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-xl font-bold text-gray-800">{vesselDetails.railData.numberOfRakesRequired}</p>
                        <p className="text-sm text-gray-600">Rakes Required</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        {vesselDetails.railData.availability ? (
                          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        ) : (
                          <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                        )}
                        <p className="text-xl font-bold text-gray-800">
                          {vesselDetails.railData.availability ? "Ready" : "Unavailable"}
                        </p>
                        <p className="text-sm text-gray-600">Rail Status</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Parameters */}
                <Card className="border-0 shadow-lg rounded-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      Cost Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(vesselDetails.costParameters).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-sm text-gray-600 mb-1">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          <p className="text-lg font-medium">
                            {key === 'freeTime' ? `${value} hours` : `${value.toLocaleString()}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Port Preferences */}
                {vesselDetails.portPreferences.length > 0 && (
                  <Card className="border-0 shadow-lg rounded-xl bg-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Anchor className="h-5 w-5 text-blue-600" />
                        Port Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {vesselDetails.portPreferences.map((port, index) => (
                          <div key={port._id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-lg">{port.portName}</h4>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant={port.sequentialDischarge ? "default" : "secondary"}>
                                  {port.sequentialDischarge ? "Sequential" : "Non-Sequential"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-semibold text-sm text-gray-600 mb-1">Stock Availability</h5>
                                <p className="text-lg font-medium">{port.portStockAvailability.toLocaleString()} MT</p>
                              </div>
                              {port.dischargeOrder.length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-600 mb-1">Discharge Order</h5>
                                  <p className="text-lg font-medium">{port.dischargeOrder.join(" → ")}</p>
                                </div>
                              )}
                            </div>
                            
                            {index < vesselDetails.portPreferences.length - 1 && (
                              <Separator className="mt-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="delay-prediction">
          <Card className="border-0 shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Delay Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DelayPrediction 
                vesselId={vesselId}
                onLoadComplete={() => setDelayPredictionLoaded(true)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="port-to-plant">
          <Card className="border-0 shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Port to Plant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortToPlant 
                vesselId={vesselId}
                onLoadComplete={() => setPortToPlantLoaded(true)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card className="border-0 shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Optimization vesselId={vesselId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VesselPrediction;