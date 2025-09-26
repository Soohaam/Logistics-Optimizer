'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Ship } from 'lucide-react';
import OptimizationResults from './OptimizationResults';

interface OptimizationProps {
  vesselId?: string;
}

const Optimization: React.FC<OptimizationProps> = ({ vesselId }) => {
  const [optimizationData, setOptimizationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimizationData = async () => {
    if (!vesselId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/optimization/vessel/${vesselId}`, {
        method: 'GET'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch optimization data');
      }
      
      setOptimizationData(data.data);
      
      // If status is computing, poll for updates
      if (data.data.status === 'computing') {
        setTimeout(fetchOptimizationData, 5000); // Poll every 5 seconds
      }
      
    } catch (err) {
      console.error('Error fetching optimization data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizationData();
  }, [vesselId]);

  const regenerateOptimization = async () => {
    if (!vesselId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/optimization/vessel/${vesselId}/regenerate`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOptimizationData(data.data);
        fetchOptimizationData(); // Start polling
      }
    } catch (err) {
      console.error('Error regenerating optimization:', err);
    }
  };

  if (loading && !optimizationData) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading optimization analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOptimizationData} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!optimizationData) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Vessel Selected</h3>
            <p className="text-gray-500">Please select a vessel to view optimization analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" />Completed</Badge>;
      case 'computing':
        return <Badge className="bg-yellow-100 text-yellow-800"><div className="animate-spin w-4 h-4 mr-1 border-2 border-yellow-600 border-t-transparent rounded-full"></div>Computing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-4 h-4 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Ship className="h-6 w-6" />
                Optimization Analysis: {optimizationData.vesselName}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                {getStatusBadge(optimizationData.status)}
                {optimizationData.computationMetadata?.lastUpdated && (
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(optimizationData.computationMetadata.lastUpdated).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <Button onClick={regenerateOptimization} variant="outline">
              Regenerate
            </Button>
          </div>
        </CardHeader>
      </Card>

      {optimizationData.status === 'computing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Optimization in progress...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
            </div>
          </CardContent>
        </Card>
      )}

      {optimizationData.status === 'completed' && optimizationData.optimizationResults && (
        <OptimizationResults data={optimizationData} />
      )}
    </div>
  );
};

export default Optimization;