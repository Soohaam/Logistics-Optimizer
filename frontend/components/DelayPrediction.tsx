import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import {
  DelayPredictionResponse,
  DelayPredictionData
} from '../types/delay-prediction';

interface DelayPredictionProps {
  vesselId: string;
  onLoadComplete: () => void;
}

const DelayPrediction: React.FC<DelayPredictionProps> = ({ vesselId, onLoadComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<DelayPredictionData | null>(null);

  useEffect(() => {
    const fetchPredictionData = async () => {
      console.log('Fetching prediction data for vesselId:', vesselId);
      try {
        // First try to get prediction history
        console.log('Attempting to fetch prediction history...');
        let response = await fetch(`http://localhost:5000/api/delay/history/${vesselId}`);
        let data = await response.json();
        console.log('History response:', data);

        if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Get the most recent prediction from history
          const mostRecentPrediction = data.data[0]; // Assuming sorted by timestamp descending
          console.log('Using most recent prediction:', mostRecentPrediction);
          setPredictionData(mostRecentPrediction);
          onLoadComplete();
        } else {
          // If no history found, request new prediction
          console.log('No history found, requesting new prediction...');
          response = await fetch(`http://localhost:5000/api/delay/predict/${vesselId}`, {
            method: 'POST'
          });
          data = await response.json();
          console.log('New prediction response:', data);

          if (!data.success) {
            throw new Error(data.error || 'Failed to fetch prediction data');
          }

          console.log('Setting prediction data:', data.data);
          setPredictionData(data.data);
          onLoadComplete();
        }
      } catch (err) {
        console.error('Error fetching prediction data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictionData();
  }, [vesselId, onLoadComplete]);

  // Log component state
  console.log('Component State:', {
    loading,
    error,
    predictionData,
    vesselId
  });

  if (loading) {
    return <div className="w-full h-[400px] flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!predictionData) {
    console.log('No prediction data available');
    return <div>No prediction data available</div>;
  }

  const getRiskColor = (risk: string) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500',
      critical: 'bg-purple-500'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="grid gap-6">
      {/* Main Prediction Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Delay Prediction
            {predictionData?.riskLevel && (
              <Badge className={getRiskColor(predictionData.riskLevel)}>
                {predictionData.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Arrival Delay</h3>
              <p className="text-2xl">{predictionData?.predictions?.arrivalDelay?.hours ?? 0}h</p>
              <p className="text-sm text-gray-500">
                Confidence: {((predictionData?.predictions?.arrivalDelay?.confidence ?? 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Berthing Delay</h3>
              <p className="text-2xl">{predictionData?.predictions?.berthingDelay?.hours ?? 0}h</p>
              <p className="text-sm text-gray-500">
                Confidence: {((predictionData?.predictions?.berthingDelay?.confidence ?? 0) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Factors */}
      <div className="grid grid-cols-3 gap-4">
        {/* Weather */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weather Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Wind Speed</dt>
                <dd>{predictionData.realTimeFactors?.weatherConditions?.windSpeed ?? 'N/A'} km/h</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Wave Height</dt>
                <dd>{predictionData.realTimeFactors?.weatherConditions?.waveHeight ?? 'N/A'}m</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Visibility</dt>
                <dd>{predictionData.realTimeFactors?.weatherConditions?.visibility ?? 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Port Congestion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Port Congestion</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Queued Vessels</dt>
                <dd>{predictionData.realTimeFactors?.portCongestion?.queuedVessels ?? 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Average Wait</dt>
                <dd>{predictionData.realTimeFactors?.portCongestion?.averageWaitTime ?? 'N/A'}h</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Available Berths</dt>
                <dd>{predictionData.realTimeFactors?.portCongestion?.berthAvailability ?? 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Vessel Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vessel Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Current Speed</dt>
                <dd>{predictionData?.realTimeFactors?.vesselTracking?.speed ?? 'N/A'} knots</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Distance to Port</dt>
                <dd>{predictionData?.realTimeFactors?.vesselTracking?.distanceToPort ?? 'N/A'} nm</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">ETA</dt>
                <dd>{predictionData?.realTimeFactors?.vesselTracking?.estimatedArrival 
                  ? new Date(predictionData.realTimeFactors.vesselTracking.estimatedArrival).toLocaleString()
                  : 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Delay Reasons and Recommendations */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Delay Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {predictionData.delayReasons?.map((reason, index) => (
                <li key={index} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{reason.factor}</span>
                    {reason.severity && (
                      <Badge className={getRiskColor(reason.severity)}>{reason.severity}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{reason.impact}</p>
                </li>
              ))}
              {(!predictionData.delayReasons || predictionData.delayReasons.length === 0) && (
                <li className="text-gray-500">No delay reasons available</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {predictionData.recommendations?.map((rec, index) => (
                <li key={index} className="text-gray-600">{rec}</li>
              ))}
              {(!predictionData.recommendations || predictionData.recommendations.length === 0) && (
                <li className="text-gray-500">No recommendations available</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DelayPrediction;
