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
    <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-6 shadow-sm border border-slate-200/60">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Optimization Results</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="flex items-center gap-1 bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 border-blue-300 text-blue-800 hover:text-blue-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="flex items-center gap-1 bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 border-blue-300 text-blue-800 hover:text-blue-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-md border border-slate-200/80 rounded-lg p-1.5 mb-8">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 transition-all duration-200 font-medium rounded-md px-4 py-2.5 text-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="ports"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 transition-all duration-200 font-medium rounded-md px-4 py-2.5 text-sm"
          >
            Port Selection
          </TabsTrigger>
          <TabsTrigger
            value="routing"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 transition-all duration-200 font-medium rounded-md px-4 py-2.5 text-sm"
          >
            Routing
          </TabsTrigger>
          <TabsTrigger
            value="costs"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 transition-all duration-200 font-medium rounded-md px-4 py-2.5 text-sm"
          >
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger
            value="map"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 transition-all duration-200 font-medium rounded-md px-4 py-2.5 text-sm"
          >
            Satellite Map
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-slate-200/60"
        >
          <PerformanceOverview results={optimizationResults} />
        </TabsContent>

        <TabsContent value="ports" className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-slate-200/60">
          <PortSelectionAnalysis portData={optimizationResults.portSelection} />
        </TabsContent>

        <TabsContent value="routing" className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-slate-200/60">
          <RoutingAnalysis routeData={optimizationResults.routeOptimization} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-slate-200/60">
          <CostBenefitAnalysis costData={optimizationResults.costBenefitAnalysis} />
        </TabsContent>

        <TabsContent value="map" className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-slate-200/60">
          <SatelliteMap vesselData={data} optimizationData={data.optimizationResults} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OptimizationResults
