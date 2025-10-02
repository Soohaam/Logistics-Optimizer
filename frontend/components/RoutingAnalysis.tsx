"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { MapPin, Navigation, Clock, Fuel, AlertTriangle } from "lucide-react"

interface RoutingAnalysisProps {
  routeData: any
  vesselId?: string
}

const RoutingAnalysis: React.FC<RoutingAnalysisProps> = ({ routeData }) => {
  if (!routeData || !routeData.recommendedRoute) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No routing data available</p>
      </div>
    )
  }

  const recommended = routeData.recommendedRoute
  const alternatives = routeData.alternativeRoutes || []

  const getWeatherRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Recommended Route - Main Card */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Navigation className="h-6 w-6 text-green-600" />
              </div>
              {recommended.routeName || 'Recommended Route'}
            </CardTitle>
            <Badge className="bg-green-600 text-white px-4 py-1.5">Optimal Route</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route Description */}
          {recommended.description && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-green-800">{recommended.description}</p>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-green-600">Distance</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{recommended.totalDistance || 0} km</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-green-600">Est. Time</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{recommended.estimatedTime || 0}h</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-green-600">Fuel</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{recommended.fuelConsumption || 0} MT</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-green-600">Weather Risk</p>
              </div>
              <Badge className={getWeatherRiskColor(recommended.weatherRisk)}>
                {recommended.weatherRisk || 'N/A'}
              </Badge>
            </div>
          </div>

          {/* Waypoints */}
          {recommended.waypoints && recommended.waypoints.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Route Waypoints
              </h4>
              <div className="space-y-3">
                {recommended.waypoints.map((waypoint: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full text-green-700 font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900">{waypoint.name || `Waypoint ${idx + 1}`}</p>
                      <p className="text-xs text-green-600">
                        {waypoint.lat?.toFixed(4)}, {waypoint.lng?.toFixed(4)}
                        {waypoint.type && (
                          <Badge variant="outline" className="ml-2 text-xs">{waypoint.type}</Badge>
                        )}
                      </p>
                    </div>
                    {idx < recommended.waypoints.length - 1 && (
                      <div className="text-green-400">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advantages */}
          {recommended.advantages && recommended.advantages.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">Route Advantages</h4>
              <div className="flex flex-wrap gap-2">
                {recommended.advantages.map((advantage: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-white text-green-700 border-green-300">
                    ✓ {advantage}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Traffic Density */}
          {recommended.trafficDensity && (
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-green-200">
              <span className="font-medium text-green-900">Traffic Density</span>
              <Badge variant="outline" className={
                recommended.trafficDensity === 'low' ? 'bg-green-50 text-green-700 border-green-300' :
                recommended.trafficDensity === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                'bg-red-50 text-red-700 border-red-300'
              }>
                {recommended.trafficDensity}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternative Routes */}
      {alternatives.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              Alternative Routes
            </CardTitle>
            <p className="text-sm text-blue-600 mt-1">
              Other route options considered in the analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alternatives.map((route: any, index: number) => (
                <div 
                  key={index} 
                  className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-blue-900 text-lg">
                      {route.routeName || `Alternative Route ${index + 1}`}
                    </h4>
                    <Badge className="bg-blue-100 text-blue-800">Alternative</Badge>
                  </div>
                  
                  {route.description && (
                    <p className="text-sm text-blue-700 mb-4">{route.description}</p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 rounded p-3 text-center">
                      <MapPin className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs text-blue-600 mb-1">Distance</p>
                      <p className="font-bold text-blue-900">{route.totalDistance || 0} km</p>
                    </div>
                    <div className="bg-blue-50 rounded p-3 text-center">
                      <Clock className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs text-blue-600 mb-1">Time</p>
                      <p className="font-bold text-blue-900">{route.estimatedTime || 0}h</p>
                    </div>
                    <div className="bg-blue-50 rounded p-3 text-center">
                      <Fuel className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs text-blue-600 mb-1">Fuel</p>
                      <p className="font-bold text-blue-900">{route.fuelConsumption || 0} MT</p>
                    </div>
                  </div>

                  {/* Waypoints preview */}
                  {route.waypoints && route.waypoints.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-blue-700 mb-2">Route Path:</p>
                      <div className="flex flex-wrap gap-2">
                        {route.waypoints.map((wp: any, wpIdx: number) => (
                          <span key={wpIdx} className="text-xs text-blue-600">
                            {wp.name}{wpIdx < route.waypoints.length - 1 ? ' →' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {route.advantages && route.advantages.map((adv: string, advIdx: number) => (
                      <Badge key={advIdx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                        {adv}
                      </Badge>
                    ))}
                    {route.disadvantages && route.disadvantages.map((dis: string, disIdx: number) => (
                      <Badge key={disIdx} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                        {dis}
                      </Badge>
                    ))}
                  </div>

                  {route.riskLevel && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-blue-700">Risk Level:</span>
                      <Badge className={getWeatherRiskColor(route.riskLevel)}>
                        {route.riskLevel}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Comparison Summary */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Route Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground mb-1">Routes Evaluated</p>
              <p className="text-2xl font-bold text-foreground">{1 + alternatives.length}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground mb-1">Optimal Distance</p>
              <p className="text-2xl font-bold text-green-600">{recommended.totalDistance || 0} km</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground mb-1">Est. Fuel Savings</p>
              <p className="text-2xl font-bold text-blue-600">
                {alternatives.length > 0 && alternatives[0].fuelConsumption ? 
                  `${Math.round(alternatives[0].fuelConsumption - recommended.fuelConsumption)} MT` : 
                  'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RoutingAnalysis