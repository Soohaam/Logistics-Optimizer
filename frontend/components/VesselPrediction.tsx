import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Ship, Calendar, Package, MapPin } from 'lucide-react';
import DelayPrediction from './DelayPrediction';
import PortToPlant from './PortToPlant';
import { Optimization } from './PlaceholderComponents';
import { TabType } from '../types/delay-prediction';

interface VesselDetails {
  name: string;
  capacity: number;
  ETA: string;
  loadPort: string;
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
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <Button
          onClick={handleBack}
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg px-6 py-2 transition-all duration-200 shadow-sm"
          disabled={tabOrder.indexOf(activeTab) === 0}
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
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
          <Card className="border-0 shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Ship className="h-6 w-6 text-primary" />
                Vessel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {vesselDetails && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Vessel Name</h3>
                    <p className="text-lg font-medium text-gray-800">{vesselDetails.name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Capacity</h3>
                    <p className="text-lg font-medium text-gray-800">{vesselDetails.capacity.toLocaleString()} MT</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ETA</h3>
                    <p className="text-lg font-medium text-gray-800">{new Date(vesselDetails.ETA).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Load Port</h3>
                    <p className="text-lg font-medium text-gray-800">{vesselDetails.loadPort}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
              <Optimization />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VesselPrediction;