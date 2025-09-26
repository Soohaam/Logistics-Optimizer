'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Ship, MapPin, Clock, AlertCircle, CheckCircle, Navigation } from 'lucide-react';

interface VesselManagementProps {
  vesselId?: string;
}

const VesselManagement: React.FC<VesselManagementProps> = ({ vesselId }) => {
  const [vesselData, setVesselData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVesselData = async () => {
    if (!vesselId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/vessels/${vesselId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVesselData(data);
    } catch (error) {
      console.error('Error fetching vessel data:', error);
      setError('Failed to fetch vessel data. Using sample data.');
      
      // Sample data for development
      setVesselData({
        id: vesselId,
        name: 'MV SAIL Navigator',
        type: 'Bulk Carrier',
        status: 'In Transit',
        currentPosition: {
          lat: 19.5,
          lng: 85.0,
          address: 'Bay of Bengal, India'
        },
        specifications: {
          length: 225,
          width: 32,
          deadweight: 75000,
          grossTonnage: 40000
        },
        cargo: {
          type: 'Iron Ore',
          quantity: 65000,
          capacity: 75000,
          utilization: 87
        },
        navigation: {
          speed: 12.5,
          heading: 285,
          destination: 'Visakhapatnam Port',
          eta: '2024-01-15T14:30:00Z',
          distanceRemaining: 245
        },
        crew: {
          total: 24,
          captain: 'Capt. Rajesh Kumar',
          chiefOfficer: 'First Officer Priya Sharma'
        },
        maintenance: {
          lastInspection: '2024-01-01T00:00:00Z',
          nextDueDate: '2024-07-01T00:00:00Z',
          status: 'Good',
          upcomingTasks: [
            'Engine oil change - Due in 15 days',
            'Hull inspection - Due in 45 days',
            'Safety equipment check - Due in 30 days'
          ]
        },
        performance: {
          fuelEfficiency: 92,
          onTimePerformance: 88,
          safetyScore: 95,
          environmentalScore: 89
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVesselData();
  }, [vesselId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vessel data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !vesselData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchVesselData} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vesselData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vessel Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Select a vessel to view management details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vessel Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-6 w-6" />
                {vesselData.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{vesselData.type}</p>
            </div>
            <Badge variant={vesselData.status === 'In Transit' ? 'default' : 'secondary'}>
              {vesselData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{vesselData.specifications?.length}m</p>
              <p className="text-sm text-gray-600">Length</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{vesselData.specifications?.deadweight?.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Deadweight (MT)</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{vesselData.cargo?.utilization}%</p>
              <p className="text-sm text-gray-600">Cargo Utilization</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{vesselData.crew?.total}</p>
              <p className="text-sm text-gray-600">Crew Members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation & Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Navigation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Speed</span>
                <span className="font-bold">{vesselData.navigation?.speed} knots</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Heading</span>
                <span className="font-bold">{vesselData.navigation?.heading}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Distance Remaining</span>
                <span className="font-bold">{vesselData.navigation?.distanceRemaining} NM</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Position</p>
                <p className="font-bold">{vesselData.currentPosition?.address}</p>
                <p className="text-xs text-gray-500">
                  {vesselData.currentPosition?.lat}°N, {vesselData.currentPosition?.lng}°E
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Destination</p>
                <p className="font-bold">{vesselData.navigation?.destination}</p>
                <p className="text-xs text-gray-500">
                  ETA: {new Date(vesselData.navigation?.eta).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cargo Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cargo Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cargo Type</span>
              <Badge variant="outline">{vesselData.cargo?.type}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Load Status</span>
                <span className="font-bold">
                  {vesselData.cargo?.quantity?.toLocaleString()} / {vesselData.cargo?.capacity?.toLocaleString()} MT
                </span>
              </div>
              <Progress value={vesselData.cargo?.utilization || 0} className="h-2" />
              <p className="text-xs text-gray-500 text-right">{vesselData.cargo?.utilization}% utilized</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fuel Efficiency</span>
                <span className="font-bold">{vesselData.performance?.fuelEfficiency}%</span>
              </div>
              <Progress value={vesselData.performance?.fuelEfficiency || 0} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">On-Time Performance</span>
                <span className="font-bold">{vesselData.performance?.onTimePerformance}%</span>
              </div>
              <Progress value={vesselData.performance?.onTimePerformance || 0} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Safety Score</span>
                <span className="font-bold">{vesselData.performance?.safetyScore}%</span>
              </div>
              <Progress value={vesselData.performance?.safetyScore || 0} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environmental Score</span>
                <span className="font-bold">{vesselData.performance?.environmentalScore}%</span>
              </div>
              <Progress value={vesselData.performance?.environmentalScore || 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crew Information */}
      <Card>
        <CardHeader>
          <CardTitle>Crew Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Captain</p>
                <p className="font-bold">{vesselData.crew?.captain}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Chief Officer</p>
                <p className="font-bold">{vesselData.crew?.chiefOfficer}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Crew</p>
              <p className="font-bold">{vesselData.crew?.total} members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Status</span>
              <Badge variant={vesselData.maintenance?.status === 'Good' ? 'default' : 'destructive'}>
                {vesselData.maintenance?.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Inspection</p>
                <p className="font-medium">
                  {new Date(vesselData.maintenance?.lastInspection).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Next Due Date</p>
                <p className="font-medium">
                  {new Date(vesselData.maintenance?.nextDueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {vesselData.maintenance?.upcomingTasks && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Upcoming Tasks</p>
                <div className="space-y-2">
                  {vesselData.maintenance.upcomingTasks.map((task: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VesselManagement;