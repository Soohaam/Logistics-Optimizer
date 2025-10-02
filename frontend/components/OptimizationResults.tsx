"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import PerformanceOverview from "./PerformanceOverview"
import PortSelectionAnalysis from "./PortSelectionAnalysis"
import RoutingAnalysis from "./RoutingAnalysis"
import CostBenefitAnalysis from "./CostBenefitAnalysis"
import SatelliteMap from "./SatelliteMap"

interface OptimizationResultsProps {
  data: any
  vesselId?: string
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({ data, vesselId }) => {
  const { optimizationResults } = data

  const tabs = ["overview", "ports", "routing", "costs", "map"]
  const [activeTab, setActiveTab] = useState("overview")

  const handlePrevious = () => {
    const currentIndex = tabs.indexOf(activeTab)
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
    setActiveTab(tabs[previousIndex])
  }

  const handleNext = () => {
    const currentIndex = tabs.indexOf(activeTab)
    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
    setActiveTab(tabs[nextIndex])
  }

  return (
    <div className="w-full bg-background rounded-xl p-8 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Optimization Results</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis based on vessel data, delays, and port-to-plant logistics
          </p>
          {data.computationMetadata?.usedAI && (
            <p className="text-xs text-blue-600 mt-1">
              ✨ AI-Generated Insights using {data.computationMetadata.aiModelVersion}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="flex items-center gap-2 h-9 px-4 border-border hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="flex items-center gap-2 h-9 px-4 border-border hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Toggle Bar */}
        <TabsList className="grid w-full grid-cols-5 bg-muted/60 border border-border rounded-lg p-2 mb-8 h-16">
  <TabsTrigger
    value="overview"
    className="relative transition-all duration-300 ease-in-out
               data-[state=active]:bg-blue-300 data-[state=active]:text-blue-900 
               data-[state=inactive]:text-muted-foreground 
               data-[state=inactive]:hover:text-blue-600
               after:absolute after:bottom-0 after:left-0 after:right-0 
               after:h-[3px] after:rounded-t-md after:scale-x-0 
               data-[state=active]:after:scale-x-100 data-[state=active]:after:bg-blue-700
               after:transition-transform after:duration-300
               px-8 py-4 h-14 text-lg font-semibold rounded-lg"
  >
    Overview
  </TabsTrigger>

  <TabsTrigger
    value="ports"
    className="relative transition-all duration-300 ease-in-out
               data-[state=active]:bg-green-300 data-[state=active]:text-green-900 
               data-[state=inactive]:text-muted-foreground 
               data-[state=inactive]:hover:text-green-600
               after:absolute after:bottom-0 after:left-0 after:right-0 
               after:h-[3px] after:rounded-t-md after:scale-x-0 
               data-[state=active]:after:scale-x-100 data-[state=active]:after:bg-green-700
               after:transition-transform after:duration-300
               px-8 py-4 h-14 text-lg font-semibold rounded-lg"
  >
    Port Selection
  </TabsTrigger>

  <TabsTrigger
    value="routing"
    className="relative transition-all duration-300 ease-in-out
               data-[state=active]:bg-purple-300 data-[state=active]:text-purple-900 
               data-[state=inactive]:text-muted-foreground 
               data-[state=inactive]:hover:text-purple-600
               after:absolute after:bottom-0 after:left-0 after:right-0 
               after:h-[3px] after:rounded-t-md after:scale-x-0 
               data-[state=active]:after:scale-x-100 data-[state=active]:after:bg-purple-700
               after:transition-transform after:duration-300
               px-8 py-4 h-14 text-lg font-semibold rounded-lg"
  >
    Routing
  </TabsTrigger>

  <TabsTrigger
  value="costs"
  className="relative transition-all duration-300 ease-in-out
             data-[state=active]:bg-yellow-200 data-[state=active]:text-yellow-800 
             data-[state=inactive]:text-muted-foreground 
             data-[state=inactive]:hover:text-yellow-600
             after:absolute after:bottom-0 after:left-0 after:right-0 
             after:h-[3px] after:rounded-t-md after:scale-x-0 
             data-[state=active]:after:scale-x-100 data-[state=active]:after:bg-yellow-500
             after:transition-transform after:duration-300
             px-8 py-4 h-14 text-lg font-semibold rounded-lg"
>
  Cost Analysis
</TabsTrigger>


  <TabsTrigger
    value="map"
    className="relative transition-all duration-300 ease-in-out
               data-[state=active]:bg-orange-300 data-[state=active]:text-orange-900 
               data-[state=inactive]:text-muted-foreground 
               data-[state=inactive]:hover:text-orange-600
               after:absolute after:bottom-0 after:left-0 after:right-0 
               after:h-[3px] after:rounded-t-md after:scale-x-0 
               data-[state=active]:after:scale-x-100 data-[state=active]:after:bg-orange-700
               after:transition-transform after:duration-300
               px-8 py-4 h-14 text-lg font-semibold rounded-lg"
  >
    Satellite Map
  </TabsTrigger>
</TabsList>


        {/* Tab Contents */}
        <TabsContent value="overview" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <PerformanceOverview results={optimizationResults} vesselId={vesselId} />
        </TabsContent>

        <TabsContent value="ports" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <PortSelectionAnalysis portData={optimizationResults.portSelection} vesselId={vesselId} />
        </TabsContent>

        <TabsContent value="routing" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <RoutingAnalysis routeData={optimizationResults.routeOptimization} vesselId={vesselId} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <CostBenefitAnalysis costData={optimizationResults.costBenefitAnalysis} vesselId={vesselId} />
        </TabsContent>

        <TabsContent value="map" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <SatelliteMap vesselData={data} optimizationData={data.optimizationResults} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OptimizationResults
