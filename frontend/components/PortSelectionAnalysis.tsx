'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';

interface PortSelectionAnalysisProps {
  portData: any;
}

const PortSelectionAnalysis: React.FC<PortSelectionAnalysisProps> = ({ portData }) => {
  if (!portData) return <div>No port data available</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selected Port</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold">{portData.selectedPort?.name}</h3>
                <p className="text-gray-600">
                  Capacity: {portData.selectedPort?.capacity?.toLocaleString()} MT
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {portData.selectedPort?.efficiency}% Efficiency
            </Badge>
          </div>
          <p className="text-gray-700">{portData.selectionReasoning}</p>
        </CardContent>
      </Card>

      {portData.alternativePorts && portData.alternativePorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternative Ports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portData.alternativePorts.map((port: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{port.name}</p>
                    <p className="text-sm text-gray-600">{port.reasonForRejection}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Efficiency: {port.efficiency}%</p>
                    <p className="text-sm">Cost: ₹{port.costPerTonne}/MT</p>
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

export default PortSelectionAnalysis;