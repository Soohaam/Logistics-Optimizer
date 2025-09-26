'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import PerformanceOverview from './PerformanceOverview';
import PortSelectionAnalysis from './PortSelectionAnalysis';
import RoutingAnalysis from './RoutingAnalysis';
import CostBenefitAnalysis from './CostBenefitAnalysis';
import SatelliteMap from './SatelliteMap';

interface OptimizationResultsProps {
  data: any;
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({ data }) => {
  const { optimizationResults } = data;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ports">Port Selection</TabsTrigger>
        <TabsTrigger value="routing">Routing</TabsTrigger>
        <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        <TabsTrigger value="map">Satellite Map</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <PerformanceOverview results={optimizationResults} />
      </TabsContent>

      <TabsContent value="ports" className="space-y-6">
        <PortSelectionAnalysis portData={optimizationResults.portSelection} />
      </TabsContent>

      <TabsContent value="routing" className="space-y-6">
        <RoutingAnalysis routeData={optimizationResults.routeOptimization} />
      </TabsContent>

      <TabsContent value="costs" className="space-y-6">
        <CostBenefitAnalysis costData={optimizationResults.costBenefitAnalysis} />
      </TabsContent>

      <TabsContent value="map" className="space-y-6">
        <SatelliteMap vesselData={data} optimizationData={data.optimizationResults} />
      </TabsContent>
    </Tabs>
  );
};

export default OptimizationResults;