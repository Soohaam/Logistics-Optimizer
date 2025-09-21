export interface DelayPredictionResponse {
  success: boolean;
  data?: DelayPredictionData | DelayPredictionData[];
  error?: string;
}

export interface DelayPredictionData {
  predictionId: string;
  vesselId: string;
  vesselName: string;
  predictions: {
    arrivalDelay: DelayPrediction;
    berthingDelay: DelayPrediction;
  };
  realTimeFactors: {
    weatherConditions: WeatherConditions;
    portCongestion: PortCongestion;
    vesselTracking: VesselTracking;
  };
  delayReasons: DelayReason[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

interface DelayPrediction {
  hours: number;
  confidence: number;
}

interface WeatherConditions {
  windSpeed: number;
  waveHeight: number;
  visibility: string;
  seaCondition: string;
  rainIntensity: number;
}

interface PortCongestion {
  queuedVessels: number;
  averageWaitTime: number;
  congestionLevel: string;
  berthAvailability: number;
}

interface VesselTracking {
  currentLatitude: number;
  currentLongitude: number;
  speed: number;
  distanceToPort: number;
  estimatedArrival: string;
}

interface DelayReason {
  factor: string;
  impact: string;
  severity: 'low' | 'medium' | 'high';
}

export type TabType = 'vessel-details' | 'delay-prediction' | 'port-to-plant' | 'optimization';