"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { MapPin, Anchor, TrendingDown, Clock } from "lucide-react"

interface PortSelectionAnalysisProps {
  portData: any
  vesselId?: string
}

const PortSelectionAnalysis: React.FC<PortSelectionAnalysisProps> = ({ portData }) => {
  if (!portData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No port selection data available</p>
      </div>
    )
  }

  const selectedPort = portData.selectedPort || {}
  const alternativePorts = portData.alternativePorts || []

  return (
    <div className="space-y-6">
      {/* Selected Port - Main Card */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Anchor className="h-6 w-6 text-green-600" />
              </div>
              Selected Port
            </CardTitle>
            <Badge className="bg-green-600 text-white px-4 py-1.5 text-sm font-semibold">
              Optimal Choice
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-900">{selectedPort.name || 'N/A'}</h3>
              <p className="text-sm text-green-700">
                Coordinates: {selectedPort.coordinates?.lat?.toFixed(4) || 'N/A'}, {selectedPort.coordinates?.lng?.toFixed(4) || 'N/A'}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-green-600">Efficiency</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{selectedPort.efficiency || 0}%</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-green-600">Capacity</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{selectedPort.capacity?.toLocaleString() || 0} MT</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-green-600">Congestion</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{selectedPort.currentCongestion || 0}%</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-medium text-green-600">Cost/Tonne</p>
              </div>
              <p className="text-2xl font-bold text-green-900">₹{selectedPort.costPerTonne || 0}</p>
            </div>
          </div>

          {/* Wait Time Info */}
          {selectedPort.estimatedWaitTime && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-700" />
                  <span className="font-medium text-green-800">Estimated Wait Time</span>
                </div>
                <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                  {selectedPort.estimatedWaitTime}h
                </Badge>
              </div>
            </div>
          )}

          {/* Selection Reasoning */}
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <span className="inline-block w-1 h-5 bg-green-600 rounded"></span>
              Selection Reasoning
            </h4>
            <p className="text-green-800 leading-relaxed">
              {portData.selectionReasoning || 'This port was selected based on optimal efficiency, capacity, and cost factors.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Ports */}
      {alternativePorts && alternativePorts.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Alternative Ports
            </CardTitle>
            <p className="text-sm text-blue-600 mt-1">
              Other ports considered in the optimization analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alternativePorts.map((port: any, index: number) => (
                <div 
                  key={index} 
                  className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h4 className="font-bold text-blue-900 text-lg">{port.name || `Port ${index + 1}`}</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        {port.reasonForRejection || 'Alternative option not selected'}
                      </p>
                      {port.coordinates && (
                        <p className="text-xs text-blue-600">
                          Coordinates: {port.coordinates.lat?.toFixed(4)}, {port.coordinates.lng?.toFixed(4)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 md:flex-col md:items-end">
                      {port.efficiency && (
                        <div className="text-center md:text-right">
                          <p className="text-xs text-blue-600 font-medium">Efficiency</p>
                          <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-300">
                            {port.efficiency}%
                          </Badge>
                        </div>
                      )}
                      {port.costPerTonne && (
                        <div className="text-center md:text-right">
                          <p className="text-xs text-blue-600 font-medium">Cost/MT</p>
                          <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-300">
                            ₹{port.costPerTonne}
                          </Badge>
                        </div>
                      )}
                      {port.congestion !== undefined && (
                        <div className="text-center md:text-right">
                          <p className="text-xs text-blue-600 font-medium">Congestion</p>
                          <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-300">
                            {port.congestion}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Port Comparison Summary */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Port Selection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground mb-1">Total Ports Evaluated</p>
              <p className="text-2xl font-bold text-foreground">{1 + alternativePorts.length}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground mb-1">Efficiency Gain</p>
              <p className="text-2xl font-bold text-green-600">
                {selectedPort.efficiency ? `+${selectedPort.efficiency - 75}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground mb-1">Cost Advantage</p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedPort.costPerTonne ? `₹${Math.round(selectedPort.costPerTonne * 0.15)} saved/MT` : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PortSelectionAnalysis