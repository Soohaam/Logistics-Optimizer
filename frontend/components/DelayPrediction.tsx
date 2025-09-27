"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import {
  Cloud,
  Anchor,
  Ship,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wind,
  Waves,
  Eye,
  Users,
  MapPin,
  Navigation,
  Calendar,
  TrendingUp,
  Lightbulb,
} from "lucide-react"

// Type definitions for the component
interface DelayPredictionResponse {
  success: boolean
  data: DelayPredictionData
  error?: string
}

interface DelayPredictionData {
  predictions?: {
    arrivalDelay?: {
      hours: number
      confidence: number
    }
    berthingDelay?: {
      hours: number
      confidence: number
    }
  }
  riskLevel?: string
  realTimeFactors?: {
    weatherConditions?: {
      windSpeed: string
      waveHeight: string
      visibility: string
    }
    portCongestion?: {
      queuedVessels: string
      averageWaitTime: string
      berthAvailability: string
    }
    vesselTracking?: {
      speed: string
      distanceToPort: string
      estimatedArrival: string
    }
  }
  delayReasons?: Array<{
    factor: string
    impact: string
    severity?: string
  }>
  recommendations?: string[]
}

interface DelayPredictionProps {
  vesselId: string
  onLoadComplete: () => void
}

const DelayPrediction: React.FC<DelayPredictionProps> = ({ vesselId, onLoadComplete }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [predictionData, setPredictionData] = useState<DelayPredictionData | null>(null)

  useEffect(() => {
    const fetchPredictionData = async () => {
      console.log("Fetching prediction data for vesselId:", vesselId)
      try {
        // First try to get prediction history
        console.log("Attempting to fetch prediction history...")
        let response = await fetch(`http://localhost:5000/api/delay/history/${vesselId}`)
        let data = await response.json()
        console.log("History response:", data)

        if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Get the most recent prediction from history
          const mostRecentPrediction = data.data[0] // Assuming sorted by timestamp descending
          console.log("Using most recent prediction:", mostRecentPrediction)
          setPredictionData(mostRecentPrediction)
          onLoadComplete()
        } else {
          // If no history found, request new prediction
          console.log("No history found, requesting new prediction...")
          response = await fetch(`http://localhost:5000/api/delay/predict/${vesselId}`, {
            method: "POST",
          })
          data = await response.json()
          console.log("New prediction response:", data)

          if (!data.success) {
            throw new Error(data.error || "Failed to fetch prediction data")
          }

          console.log("Setting prediction data:", data.data)
          setPredictionData(data.data)
          onLoadComplete()
        }
      } catch (err) {
        console.error("Error fetching prediction data:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPredictionData()
  }, [vesselId, onLoadComplete])

  // Log component state
  console.log("Component State:", {
    loading,
    error,
    predictionData,
    vesselId,
  })

  if (loading) {
    return (
      <div className="grid gap-8 animate-pulse">
        {/* Main Prediction Card Skeleton */}
        <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time factors skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="p-4 bg-slate-50 rounded-xl">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-0 shadow-lg rounded-2xl bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <AlertDescription className="font-semibold text-red-800 text-lg">{error}</AlertDescription>
        </div>
      </Alert>
    )
  }

  if (!predictionData) {
    console.log("No prediction data available")
    return (
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <Ship className="h-10 w-10 text-slate-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-700 mb-2">No prediction data available</p>
              <p className="text-slate-500">Please try again later or contact support for assistance.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRiskVariant = (risk: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      low: "default",
      medium: "secondary",
      high: "destructive",
      critical: "destructive",
    }
    return variants[risk] || "outline"
  }

  const getRiskIcon = (risk: string) => {
    const icons = {
      low: <CheckCircle className="h-4 w-4" />,
      medium: <Clock className="h-4 w-4" />,
      high: <AlertTriangle className="h-4 w-4" />,
      critical: <AlertTriangle className="h-4 w-4" />,
    }
    return icons[risk as keyof typeof icons] || <Clock className="h-4 w-4" />
  }

  const getRiskColor = (risk: string) => {
    const colors = {
      low: "from-emerald-50 to-emerald-100 border-emerald-200",
      medium: "from-yellow-50 to-yellow-100 border-yellow-200",
      high: "from-red-50 to-red-100 border-red-200",
      critical: "from-red-50 to-red-100 border-red-200",
    }
    return colors[risk as keyof typeof colors] || "from-slate-50 to-slate-100 border-slate-200"
  }

  return (
    <div className="grid gap-8">
      {/* Main Prediction Card */}
      <Card
        className={`relative overflow-hidden border-0 shadow-xl rounded-2xl bg-gradient-to-br ${getRiskColor(predictionData?.riskLevel || "low")}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
                <TrendingUp className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Delay Prediction Analysis</h2>
                <p className="text-slate-600 font-medium">Real-time vessel delay assessment</p>
              </div>
            </div>
            {predictionData?.riskLevel && (
              <Badge
                variant={getRiskVariant(predictionData.riskLevel)}
                className="gap-2 font-bold text-sm px-4 py-2 shadow-sm"
              >
                {getRiskIcon(predictionData.riskLevel)}
                {predictionData.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group space-y-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Anchor className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl text-slate-800">Arrival Delay</h3>
              </div>
              <div className="space-y-3">
                <p className="text-5xl font-bold text-blue-600">
                  {predictionData?.predictions?.arrivalDelay?.hours ?? 0}
                  <span className="text-2xl text-slate-500 ml-2">hours</span>
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">Confidence Level</span>
                    <span className="text-sm font-bold text-slate-800">
                      {((predictionData?.predictions?.arrivalDelay?.confidence ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(predictionData?.predictions?.arrivalDelay?.confidence ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="group space-y-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-xl text-slate-800">Berthing Delay</h3>
              </div>
              <div className="space-y-3">
                <p className="text-5xl font-bold text-emerald-600">
                  {predictionData?.predictions?.berthingDelay?.hours ?? 0}
                  <span className="text-2xl text-slate-500 ml-2">hours</span>
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">Confidence Level</span>
                    <span className="text-sm font-bold text-slate-800">
                      {((predictionData?.predictions?.berthingDelay?.confidence ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out delay-300"
                      style={{ width: `${(predictionData?.predictions?.berthingDelay?.confidence ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather */}
        <Card className="group border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Cloud className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Weather Conditions</h3>
                <p className="text-sm text-slate-600 font-medium">Current maritime weather</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <Wind className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">Wind Speed</span>
              </div>
              <span className="font-bold text-slate-800">
                {predictionData.realTimeFactors?.weatherConditions?.windSpeed ?? "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <Waves className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">Wave Height</span>
              </div>
              <span className="font-bold text-slate-800">
                {predictionData.realTimeFactors?.weatherConditions?.waveHeight ?? "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">Visibility</span>
              </div>
              <span className="font-bold text-slate-800">
                {predictionData.realTimeFactors?.weatherConditions?.visibility ?? "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Port Congestion */}
        <Card className="group border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Anchor className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Port Congestion</h3>
                <p className="text-sm text-slate-600 font-medium">Current port traffic status</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">Queued Vessels</span>
              </div>
              <span className="font-bold text-slate-800">
                {predictionData.realTimeFactors?.portCongestion?.queuedVessels ?? "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">Average Wait</span>
              </div>
              <span className="font-bold text-slate-800">
                {predictionData.realTimeFactors?.portCongestion?.averageWaitTime ?? "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">Available Berths</span>
              </div>
              <span className="font-bold text-slate-800">
                {predictionData.realTimeFactors?.portCongestion?.berthAvailability ?? "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Vessel Tracking */}
        <Card className="group border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Ship className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Vessel Tracking</h3>
                <p className="text-sm text-slate-600 font-medium">Real-time vessel position</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">Current Speed</span>
              </div>
              <span className="font-bold text-slate-800">
                {predictionData?.realTimeFactors?.vesselTracking?.speed ?? "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">Distance to Port</span>
              </div>
              <span className="font-bold text-slate-800">
                {predictionData?.realTimeFactors?.vesselTracking?.distanceToPort ?? "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-500" />
                <span className="font-semibold text-slate-700">ETA</span>
              </div>
              <span className="font-bold text-slate-800 text-sm">
                {predictionData?.realTimeFactors?.vesselTracking?.estimatedArrival
                  ? new Date(predictionData.realTimeFactors.vesselTracking.estimatedArrival).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delay Reasons and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-transparent" />
          <CardHeader className="relative pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Delay Factors</h3>
                <p className="text-slate-600 font-medium">Identified risk factors</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {predictionData.delayReasons?.map((reason, index) => (
                <div
                  key={index}
                  className="group p-5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-800 mb-2">{reason.factor}</h4>
                      <p className="text-slate-600 leading-relaxed">{reason.impact}</p>
                    </div>
                    {reason.severity && (
                      <Badge variant={getRiskVariant(reason.severity)} className="text-xs gap-1 shrink-0 font-semibold">
                        {getRiskIcon(reason.severity)}
                        {reason.severity.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {(!predictionData.delayReasons || predictionData.delayReasons.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-700 mb-1">No Significant Delays</p>
                  <p className="text-slate-500">No major delay factors have been identified</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent" />
          <CardHeader className="relative pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Recommendations</h3>
                <p className="text-slate-600 font-medium">Optimization suggestions</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {predictionData.recommendations?.map((rec, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm"
                >
                  <div className="mt-1 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
              {(!predictionData.recommendations || predictionData.recommendations.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-700 mb-1">No Recommendations</p>
                  <p className="text-slate-500">No specific recommendations are available at this time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DelayPrediction
