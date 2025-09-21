import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { 
  Cloud, 
  Anchor, 
  Ship, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Wind, 
  Waves, 
  Eye,
  Users,
  MapPin,
  Navigation,
  Calendar,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
// Type definitions for the component
interface DelayPredictionResponse {
  success: boolean;
  data: DelayPredictionData;
  error?: string;
}

interface DelayPredictionData {
  predictions?: {
    arrivalDelay?: {
      hours: number;
      confidence: number;
    };
    berthingDelay?: {
      hours: number;
      confidence: number;
    };
  };
  riskLevel?: string;
  realTimeFactors?: {
    weatherConditions?: {
      windSpeed: string;
      waveHeight: string;
      visibility: string;
    };
    portCongestion?: {
      queuedVessels: string;
      averageWaitTime: string;
      berthAvailability: string;
    };
    vesselTracking?: {
      speed: string;
      distanceToPort: string;
      estimatedArrival: string;
    };
  };
  delayReasons?: Array<{
    factor: string;
    impact: string;
    severity?: string;
  }>;
  recommendations?: string[];
}

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
    return (
      <div className="grid gap-6 animate-pulse">
        {/* Main Prediction Card Skeleton */}
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Real-time factors skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Bottom section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-50 duration-500">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="font-medium">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!predictionData) {
    console.log('No prediction data available');
    return (
      <Card className="animate-in fade-in-50 duration-500">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Ship className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No prediction data available</p>
            <p className="text-sm text-muted-foreground">Please try again later or contact support.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskVariant = (risk: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      low: 'default',
      medium: 'secondary', 
      high: 'destructive',
      critical: 'destructive'
    };
    return variants[risk] || 'outline';
  };

  const getRiskIcon = (risk: string) => {
    const icons = {
      low: <CheckCircle className="h-3 w-3" />,
      medium: <Clock className="h-3 w-3" />,
      high: <AlertTriangle className="h-3 w-3" />,
      critical: <AlertTriangle className="h-3 w-3" />
    };
    return icons[risk as keyof typeof icons] || <Clock className="h-3 w-3" />;
  };

  return (
    <div className="grid gap-6 animate-in fade-in-50 duration-700">
      {/* Main Prediction Card */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="flex justify-between items-center text-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Delay Prediction Analysis
            </div>
            {predictionData?.riskLevel && (
              <Badge 
                variant={getRiskVariant(predictionData.riskLevel)}
                className="gap-1 font-semibold animate-in slide-in-from-right-5 duration-500"
              >
                {getRiskIcon(predictionData.riskLevel)}
                {predictionData.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group space-y-3 p-4 rounded-lg bg-background/50 border transition-all hover:shadow-md hover:bg-background/70">
              <div className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Arrival Delay</h3>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-primary transition-all group-hover:scale-105">
                  {predictionData?.predictions?.arrivalDelay?.hours ?? 0}
                  <span className="text-xl text-muted-foreground ml-1">hours</span>
                </p>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${((predictionData?.predictions?.arrivalDelay?.confidence ?? 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground min-w-fit">
                    {((predictionData?.predictions?.arrivalDelay?.confidence ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Prediction Confidence</p>
              </div>
            </div>
            
            <div className="group space-y-3 p-4 rounded-lg bg-background/50 border transition-all hover:shadow-md hover:bg-background/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-lg">Berthing Delay</h3>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-primary transition-all group-hover:scale-105">
                  {predictionData?.predictions?.berthingDelay?.hours ?? 0}
                  <span className="text-xl text-muted-foreground ml-1">hours</span>
                </p>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 delay-300"
                      style={{ width: `${((predictionData?.predictions?.berthingDelay?.confidence ?? 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground min-w-fit">
                    {((predictionData?.predictions?.berthingDelay?.confidence ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Prediction Confidence</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Cloud className="h-4 w-4 text-blue-600" />
              </div>
              Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Wind Speed</span>
              </div>
              <span className="font-semibold text-base">{predictionData.realTimeFactors?.weatherConditions?.windSpeed ?? 'N/A'} km/h</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Wave Height</span>
              </div>
              <span className="font-semibold text-base">{predictionData.realTimeFactors?.weatherConditions?.waveHeight ?? 'N/A'}m</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Visibility</span>
              </div>
              <span className="font-semibold text-base">{predictionData.realTimeFactors?.weatherConditions?.visibility ?? 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Port Congestion */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                <Anchor className="h-4 w-4 text-orange-600" />
              </div>
              Port Congestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Queued Vessels</span>
              </div>
              <span className="font-semibold text-base">{predictionData.realTimeFactors?.portCongestion?.queuedVessels ?? 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Average Wait</span>
              </div>
              <span className="font-semibold text-base">{predictionData.realTimeFactors?.portCongestion?.averageWaitTime ?? 'N/A'}h</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Available Berths</span>
              </div>
              <span className="font-semibold text-base">{predictionData.realTimeFactors?.portCongestion?.berthAvailability ?? 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Vessel Tracking */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <Ship className="h-4 w-4 text-emerald-600" />
              </div>
              Vessel Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Current Speed</span>
              </div>
              <span className="font-semibold text-base">{predictionData?.realTimeFactors?.vesselTracking?.speed ?? 'N/A'} knots</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Distance to Port</span>
              </div>
              <span className="font-semibold text-base">{predictionData?.realTimeFactors?.vesselTracking?.distanceToPort ?? 'N/A'} nm</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-base text-muted-foreground">ETA</span>
              </div>
              <span className="font-semibold text-sm">
                {predictionData?.realTimeFactors?.vesselTracking?.estimatedArrival 
                  ? new Date(predictionData.realTimeFactors.vesselTracking.estimatedArrival).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delay Reasons and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              Delay Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictionData.delayReasons?.map((reason, index) => (
                <div key={index} 
                     className="group p-4 rounded-lg border bg-background/50 hover:bg-background transition-all hover:shadow-sm animate-in slide-in-from-left-5 duration-500"
                     style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                        {reason.factor}
                      </h4>
                      <p className="text-base text-muted-foreground mt-1 leading-relaxed">
                        {reason.impact}
                      </p>
                    </div>
                    {reason.severity && (
                      <Badge 
                        variant={getRiskVariant(reason.severity)}
                        className="text-xs gap-1 shrink-0"
                      >
                        {getRiskIcon(reason.severity)}
                        {reason.severity}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {(!predictionData.delayReasons || predictionData.delayReasons.length === 0) && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-muted-foreground">No significant delay factors identified</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Lightbulb className="h-4 w-4 text-amber-600" />
              </div>
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictionData.recommendations?.map((rec, index) => (
                <div key={index} 
                     className="group flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-all hover:shadow-sm animate-in slide-in-from-right-5 duration-500"
                     style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="mt-0.5 p-1 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-base text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
              {(!predictionData.recommendations || predictionData.recommendations.length === 0) && (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No specific recommendations available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DelayPrediction;