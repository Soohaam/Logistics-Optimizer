'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Ship, Train, Route, Clock, Fuel } from 'lucide-react';

interface RoutingAnalysisProps {
  routeData: any;
}

const RoutingAnalysis: React.FC<RoutingAnalysisProps> = ({ routeData }) => {
  // If no data from backend, use sample data
  const sampleRouteData = {
    recommendedRoute: {
      routeName: 'Eastern Corridor Route',
      description: 'Optimized multi-modal route via Paradip Port with rail connectivity to Bhilai Steel Plant',
      totalDistance: 485,
      estimatedTime: 72,
      fuelConsumption: 120,
      weatherRisk: 'low',
      advantages: ['Shortest distance', 'Best rail connectivity', 'Lower port congestion', 'Weather favorable'],
      routeSequence: [
        { step: 1, mode: 'Sea', from: 'Current Position', to: 'Paradip Port', distance: 285, time: 24, description: 'Direct sea route to Paradip Port' },
        { step: 2, mode: 'Port', from: 'Paradip Port', to: 'Paradip Port', distance: 0, time: 12, description: 'Discharge and handling at port' },
        { step: 3, mode: 'Rail', from: 'Paradip Port', to: 'Bhilai Steel Plant', distance: 485, time: 18, description: 'Rail transport via Eastern Railway' },
        { step: 4, mode: 'Plant', from: 'Bhilai Steel Plant', to: 'Bhilai Steel Plant', distance: 0, time: 8, description: 'Unloading and processing at plant' }
      ]
    },
    alternativeRoutes: [
      {
        routeName: 'Haldia-Durgapur Route',
        description: 'Alternative route via Haldia Port with shorter rail distance to Durgapur',
        totalDistance: 420,
        estimatedTime: 68,
        fuelConsumption: 105,
        weatherRisk: 'medium',
        advantages: ['Shorter rail distance', 'Modern port facilities', 'Good handling capacity'],
        disadvantages: ['Higher port congestion', 'Weather dependent', 'Higher port charges'],
        routeSequence: [
          { step: 1, mode: 'Sea', from: 'Current Position', to: 'Haldia Port', distance: 255, time: 22, description: 'Sea route to Haldia Port' },
          { step: 2, mode: 'Port', from: 'Haldia Port', to: 'Haldia Port', distance: 0, time: 14, description: 'Port operations and discharge' },
          { step: 3, mode: 'Rail', from: 'Haldia Port', to: 'Durgapur Steel Plant', distance: 165, time: 8, description: 'Short rail haul to Durgapur' },
          { step: 4, mode: 'Plant', from: 'Durgapur Steel Plant', to: 'Durgapur Steel Plant', distance: 0, time: 6, description: 'Plant operations' }
        ]
      },
      {
        routeName: 'Visakhapatnam-Rourkela Route',
        description: 'Southern route via Visakhapatnam with established rail network',
        totalDistance: 580,
        estimatedTime: 84,
        fuelConsumption: 145,
        weatherRisk: 'high',
        advantages: ['Established logistics network', 'Multiple steel plants access', 'Good port infrastructure'],
        disadvantages: ['Longer distance', 'Higher fuel cost', 'Monsoon risk', 'Longer transit time'],
        routeSequence: [
          { step: 1, mode: 'Sea', from: 'Current Position', to: 'Visakhapatnam Port', distance: 315, time: 28, description: 'Extended sea route to Vizag' },
          { step: 2, mode: 'Port', from: 'Visakhapatnam Port', to: 'Visakhapatnam Port', distance: 0, time: 16, description: 'Port handling and processing' },
          { step: 3, mode: 'Rail', from: 'Visakhapatnam Port', to: 'Rourkela Steel Plant', distance: 520, time: 22, description: 'Long rail haul via central corridor' },
          { step: 4, mode: 'Plant', from: 'Rourkela Steel Plant', to: 'Rourkela Steel Plant', distance: 0, time: 10, description: 'Plant unloading and storage' }
        ]
      }
    ]
  };
  
  const displayData = routeData && Object.keys(routeData).length > 0 ? routeData : sampleRouteData;
  
  if (!displayData) return <div>No routing data available</div>;

  return (
    <div className="space-y-6">
      {/* Recommended Route */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Route className="h-5 w-5" />
              {displayData.recommendedRoute?.routeName || 'Recommended Route'}
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">Optimal</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {displayData.recommendedRoute?.description && (
            <p className="text-green-700 mb-4">{displayData.recommendedRoute.description}</p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <MapPin className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-lg font-bold text-green-800">{displayData.recommendedRoute?.totalDistance}km</p>
              <p className="text-sm text-green-600">Distance</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Clock className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-lg font-bold text-green-800">{displayData.recommendedRoute?.estimatedTime}h</p>
              <p className="text-sm text-green-600">Time</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Fuel className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-lg font-bold text-green-800">{displayData.recommendedRoute?.fuelConsumption}MT</p>
              <p className="text-sm text-green-600">Fuel</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Badge variant={displayData.recommendedRoute?.weatherRisk === 'low' ? 'default' : 'destructive'}>
                {displayData.recommendedRoute?.weatherRisk}
              </Badge>
              <p className="text-sm text-green-600 mt-1">Weather Risk</p>
            </div>
          </div>

          {/* Route Sequence */}
          {displayData.recommendedRoute?.routeSequence && (
            <div className="mb-4">
              <h4 className="font-semibold text-green-800 mb-3">Route Sequence</h4>
              <div className="space-y-2">
                {displayData.recommendedRoute.routeSequence.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      {step.mode === 'Sea' && <Ship className="h-4 w-4 text-green-600" />}
                      {step.mode === 'Rail' && <Train className="h-4 w-4 text-green-600" />}
                      {step.mode === 'Port' && <MapPin className="h-4 w-4 text-green-600" />}
                      {step.mode === 'Plant' && <div className="w-3 h-3 bg-green-600 rounded"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-green-800">Step {step.step}</span>
                        <Badge variant="outline" className="text-xs">{step.mode}</Badge>
                      </div>
                      <p className="text-sm text-green-700">{step.description}</p>
                      <div className="flex gap-4 mt-1 text-xs text-green-600">
                        {step.distance > 0 && <span>{step.distance}km</span>}
                        <span>{step.time}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayData.recommendedRoute?.advantages && (
            <div className="flex flex-wrap gap-2">
              {displayData.recommendedRoute.advantages.map((advantage: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs bg-green-100 text-green-700">
                  {advantage}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternative Routes */}
      {displayData.alternativeRoutes && displayData.alternativeRoutes.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Alternative Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayData.alternativeRoutes.map((route: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-blue-800">
                      {route.routeName || `Alternative Route ${index + 1}`}
                    </h5>
                    <Badge className="bg-blue-100 text-blue-800">Alternative</Badge>
                  </div>
                  
                  {route.description && (
                    <p className="text-blue-700 mb-3 text-sm">{route.description}</p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <MapPin className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                      <p className="font-bold text-blue-800">{route.totalDistance}km</p>
                      <p className="text-xs text-blue-600">Distance</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <Clock className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                      <p className="font-bold text-blue-800">{route.estimatedTime}h</p>
                      <p className="text-xs text-blue-600">Time</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <Fuel className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                      <p className="font-bold text-blue-800">{route.fuelConsumption}MT</p>
                      <p className="text-xs text-blue-600">Fuel</p>
                    </div>
                  </div>
                  
                  {/* Route Sequence for alternatives */}
                  {route.routeSequence && (
                    <div className="mb-3">
                      <h5 className="text-sm font-semibold text-blue-800 mb-2">Route Steps</h5>
                      <div className="flex flex-wrap gap-1">
                        {route.routeSequence.map((step: any, stepIdx: number) => (
                          <div key={stepIdx} className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs">
                            {step.mode === 'Sea' && <Ship className="h-3 w-3" />}
                            {step.mode === 'Rail' && <Train className="h-3 w-3" />}
                            {step.mode === 'Port' && <MapPin className="h-3 w-3" />}
                            <span>{step.step}. {step.mode}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    {route.advantages && (
                      <div className="flex flex-wrap gap-1">
                        {route.advantages.map((advantage: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-blue-100 text-blue-700">
                            {advantage}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {route.disadvantages && (
                      <div className="flex flex-wrap gap-1">
                        {route.disadvantages.map((disadvantage: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-orange-100 text-orange-700">
                            {disadvantage}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoutingAnalysis;