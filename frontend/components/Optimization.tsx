"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { AlertCircle, CheckCircle, Ship, RefreshCw, Play } from "lucide-react"
import OptimizationResults from "./OptimizationResults"


interface OptimizationProps {
  vesselId?: string
}

const Optimization: React.FC<OptimizationProps> = ({ vesselId }) => {
  const [optimizationData, setOptimizationData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  const fetchOptimizationData = async () => {
    if (!vesselId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:5000/api/optimization/vessel/${vesselId}`, {
        method: "GET",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch optimization data")
      }

      setOptimizationData(data.data)

      // If status is computing, poll for updates
      if (data.data.status === "computing") {
        setTimeout(fetchOptimizationData, 5000) // Poll every 5 seconds
      }
    } catch (err) {
      console.error("Error fetching optimization data:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      setInitialCheckDone(true)
    }
  }

  // Check for existing optimization on component mount
  useEffect(() => {
    fetchOptimizationData()
  }, [vesselId])

  const regenerateOptimization = async () => {
    if (!vesselId) return

    try {
      const response = await fetch(`http://localhost:5000/api/optimization/vessel/${vesselId}/regenerate`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setOptimizationData(data.data)
        fetchOptimizationData() // Start polling
      }
    } catch (err) {
      console.error("Error regenerating optimization:", err)
    }
  }

  // Run optimization if no existing data
  const runOptimization = async () => {
    if (!vesselId) return

    try {
      const response = await fetch(`http://localhost:5000/api/optimization/vessel/${vesselId}/regenerate`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setOptimizationData(data.data)
        fetchOptimizationData() // Start polling
      }
    } catch (err) {
      console.error("Error running optimization:", err)
    }
  }

  if (loading && !optimizationData) {
    return (
      <Card className="w-full shadow-lg border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-slate-700 font-medium text-lg">Loading optimization analysis...</p>
              <p className="text-slate-500 text-sm">This may take a moment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full shadow-lg border-red-200/80 bg-gradient-to-br from-white to-red-50/30">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-6">
            <div className="bg-red-100 rounded-full p-4 w-fit mx-auto">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
              <p className="text-red-600 max-w-md">{error}</p>
            </div>
            <Button
              onClick={fetchOptimizationData}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors duration-200 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show run optimization button if no data and initial check is done
  if (!optimizationData && initialCheckDone) {
    return (
      <Card className="w-full shadow-lg border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center h-[400px] space-y-6">
          <div className="bg-blue-100 rounded-full p-6 w-fit">
            <Ship className="h-16 w-16 text-blue-600" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-slate-800">No Optimization Data Found</h3>
            <p className="text-slate-600 max-w-md">
              Run an optimization analysis to get recommendations for port selection, routing, and cost savings.
            </p>
          </div>
          <Button
            onClick={runOptimization}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5 mr-2" />
            Run Optimization
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show loading state while checking for existing data
  if (!optimizationData && !initialCheckDone) {
    return (
      <Card className="w-full shadow-lg border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-slate-700 font-medium text-lg">Checking for existing optimization...</p>
              <p className="text-slate-500 text-sm">Please wait</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1.5 font-medium">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed
          </Badge>
        )
      case "computing":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1.5 font-medium">
            <div className="animate-spin w-4 h-4 mr-2 border-2 border-amber-600 border-t-transparent rounded-full"></div>
            Computing
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1.5 font-medium">
            <AlertCircle className="w-4 h-4 mr-2" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-3 py-1.5 font-medium">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="w-full space-y-8">
      <Card className="shadow-lg border-slate-200/80 bg-gradient-to-r from-white to-blue-50/30">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <CardTitle className="text-3xl font-bold flex items-center gap-3 text-slate-800">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Ship className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl">Optimization Analysis</div>
                  <div className="text-lg font-medium text-blue-600 mt-1">{optimizationData.vesselName}</div>
                </div>
              </CardTitle>
              <div className="flex items-center gap-6">
                {getStatusBadge(optimizationData.status)}
                {optimizationData.computationMetadata?.lastUpdated && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Last updated: {new Date(optimizationData.computationMetadata.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={regenerateOptimization}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 px-6 py-2.5 font-medium shadow-sm bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </CardHeader>
      </Card>

      {optimizationData.status === "computing" && (
        <Card className="shadow-lg border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="bg-amber-100 rounded-full p-4 w-fit mx-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
              </div>
              <div className="space-y-2">
                <p className="text-amber-800 font-semibold text-lg">Optimization in progress...</p>
                <p className="text-amber-600 text-sm">This process typically takes 10-30 seconds to complete</p>
                <p className="text-amber-500 text-xs mt-2">Using AI optimization with fallback mechanisms for faster results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {optimizationData.status === "completed" && optimizationData.optimizationResults && (
        <OptimizationResults data={optimizationData} />
      )}
    </div>
  )
}

export default Optimization