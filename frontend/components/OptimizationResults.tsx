"use client"

import type React from "react"
import { useState } from "react"
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
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({ data }) => {
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
          <p className="text-sm text-muted-foreground">Comprehensive analysis and insights</p>
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
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 border border-border rounded-lg p-1 mb-8 h-12">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/30 transition-all duration-200 font-medium rounded-md px-4 py-2 text-sm h-10"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="ports"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/30 transition-all duration-200 font-medium rounded-md px-4 py-2 text-sm h-10"
          >
            Port Selection
          </TabsTrigger>
          <TabsTrigger
            value="routing"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/30 transition-all duration-200 font-medium rounded-md px-4 py-2 text-sm h-10"
          >
            Routing
          </TabsTrigger>
          <TabsTrigger
            value="costs"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/30 transition-all duration-200 font-medium rounded-md px-4 py-2 text-sm h-10"
          >
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger
            value="map"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/30 transition-all duration-200 font-medium rounded-md px-4 py-2 text-sm h-10"
          >
            Satellite Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <PerformanceOverview results={optimizationResults} />
        </TabsContent>

        <TabsContent value="ports" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <PortSelectionAnalysis portData={optimizationResults.portSelection} />
        </TabsContent>

        <TabsContent value="routing" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <RoutingAnalysis routeData={optimizationResults.routeOptimization} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <CostBenefitAnalysis costData={optimizationResults.costBenefitAnalysis} />
        </TabsContent>

        <TabsContent value="map" className="space-y-6 bg-background rounded-lg p-6 border border-border shadow-sm">
          <SatelliteMap vesselData={data} optimizationData={data.optimizationResults} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OptimizationResults
