import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import DelayPrediction from './DelayPrediction';
import { PortToPlant, Optimization } from './PlaceholderComponents';
import { TabType } from '../types/delay-prediction';

interface VesselDetails {
  name: string;
  capacity: number;
  ETA: string;
  loadPort: string;
  // Add other vessel details as needed
}

const VesselPrediction: React.FC = () => {
  const params = useParams();
  const vesselId = params.vesselId as string;

  const [activeTab, setActiveTab] = useState<TabType>('vessel-details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vesselDetails, setVesselDetails] = useState<VesselDetails | null>(null);
  const [delayPredictionLoaded, setDelayPredictionLoaded] = useState(false);

  // Tab order for navigation
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

  const handlePrevious = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const isNextDisabled = () => {
    if (activeTab === 'delay-prediction' && !delayPredictionLoaded) return true;
    return tabOrder.indexOf(activeTab) === tabOrder.length - 1;
  };

  const isPreviousDisabled = () => {
    return tabOrder.indexOf(activeTab) === 0;
  };

  if (!vesselId) {
    return <div>No vessel selected</div>;
  }

  if (loading) {
    return <div>Loading vessel details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <Button
          onClick={handlePrevious}
          disabled={isPreviousDisabled()}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          Next
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vessel-details">Vessel Details</TabsTrigger>
          <TabsTrigger value="delay-prediction">Delay Prediction</TabsTrigger>
          <TabsTrigger 
            value="port-to-plant" 
            disabled={!delayPredictionLoaded}
          >
            Port to Plant
          </TabsTrigger>
          <TabsTrigger 
            value="optimization"
            disabled={!delayPredictionLoaded}
          >
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vessel-details">
          <Card>
            <CardContent className="pt-6">
              {vesselDetails && (
                <div className="grid gap-4">
                  <div>
                    <h3 className="font-semibold">Vessel Name</h3>
                    <p>{vesselDetails.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Capacity</h3>
                    <p>{vesselDetails.capacity} MT</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">ETA</h3>
                    <p>{new Date(vesselDetails.ETA).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Load Port</h3>
                    <p>{vesselDetails.loadPort}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delay-prediction">
          <DelayPrediction 
            vesselId={vesselId as string}
            onLoadComplete={() => setDelayPredictionLoaded(true)}
          />
        </TabsContent>

        <TabsContent value="port-to-plant">
          <PortToPlant />
        </TabsContent>

        <TabsContent value="optimization">
          <Optimization />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VesselPrediction;
