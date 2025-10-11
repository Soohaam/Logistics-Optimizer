"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
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
  Lightbulb,
  DollarSign,
  Package,
  Target,
  Activity,
  Timer,
  BarChart3,
  AlertCircle,
  CheckCheck,
} from "lucide-react"

interface DelayPredictionProps {
  vesselId: string
  onLoadComplete: () => void
}

const DelayPrediction: React.FC<DelayPredictionProps> = ({ vesselId, onLoadComplete }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [vesselName, setVesselName] = useState<string>("")

  useEffect(() => {
    const fetchPredictionData = async () => {
      try {
        // Fetch vessel name first
        const vesselResponse = await fetch(`http://localhost:5000/api/vessels/${vesselId}`)
        const vesselData = await vesselResponse.json()
        if (vesselData.success) {
          setVesselName(vesselData.data.name)
        }

        let response = await fetch(`http://localhost:5000/api/delay/history/${vesselId}`)
        let data = await response.json()

        if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
          setPredictionData(data.data[0])
          onLoadComplete()
        } else {
          response = await fetch(`http://localhost:5000/api/delay/predict/${vesselId}`, { method: "POST" })
          data = await response.json()

          if (!data.success) {
            throw new Error(data.error || "Failed to fetch prediction data")
          }

          setPredictionData(data.data)
          onLoadComplete()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPredictionData()
  }, [vesselId, onLoadComplete])

  if (loading) {
    return (
      <div className="grid gap-8 animate-pulse">
        {/* Main Prediction Card Skeleton */}
        <Card className="overflow-hidden border shadow-lg rounded-2xl">
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
            <Card key={i} className="border shadow-lg rounded-2xl">
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
            <Card key={i} className="border shadow-lg rounded-2xl">
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
      <Alert variant="destructive" className="border shadow-lg rounded-2xl bg-red-50">
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
    return (
      <Card className="border shadow-lg rounded-2xl bg-white">
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

  const predictions = predictionData.predictions || {}
  const realTimeFactors = predictionData.realTimeFactors || {}
  const riskLevel = predictionData.riskLevel || "medium"

  const totalDelay = (predictions.arrivalDelay?.hours || 0) + (predictions.berthingDelay?.hours || 0)
  const avgConfidence = ((predictions.arrivalDelay?.confidence || 0) + (predictions.berthingDelay?.confidence || 0)) / 2
  const costImpact = predictions.totalDelayImpact?.costImpact || 0

  const getRiskColor = (risk: string) => {
    const colors = {
      low: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", badgeBg: "bg-emerald-100" },
      medium: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", badgeBg: "bg-yellow-100" },
      high: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", badgeBg: "bg-orange-100" },
      critical: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", badgeBg: "bg-red-100" },
    }
    return colors[risk as keyof typeof colors] || colors.medium
  }

  const riskColors = getRiskColor(riskLevel)

  return (
    <div className="grid gap-6">
      {/* Hero Card with Key Metrics */}
      <Card className={`border-2 ${riskColors.border} shadow-xl rounded-2xl ${riskColors.bg}`}>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Delay Prediction Analysis</h2>
                  <p className="text-slate-700 font-medium mt-1">Comprehensive vessel delay assessment</p>
                </div>
              </div>
              <Badge
                className={`${riskColors.text} ${riskColors.badgeBg} border-2 ${riskColors.border} px-6 py-3 text-lg font-bold shadow-sm`}
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                {riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
            {vesselName && (
  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-slate-200 w-fit shadow-sm">
    <Ship className="h-5 w-5 text-blue-600" />
    <span className="text-sm font-semibold text-slate-700">Vessel:</span>
    <span className="text-sm font-bold text-slate-900">{vesselName}</span>
    <span className="text-xs text-slate-500 ml-2">ID: {vesselId}</span>
  </div>
)}

          </div>
        </CardHeader>
        <CardContent>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Timer className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-semibold text-slate-600">Total Delay</span>
      </div>
      <p className="text-4xl font-bold text-blue-600 mb-1">{totalDelay}h</p>
      <p className="text-xs text-slate-500">Combined delay estimate</p>
    </div>

    <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-5 w-5 text-green-600" />
        <span className="text-sm font-semibold text-slate-600">Confidence</span>
      </div>
      <p className="text-4xl font-bold text-green-600 mb-1">
        {(avgConfidence * 100).toFixed(0)}%
      </p>
      <Progress value={avgConfidence * 100} className="h-2 mt-2" />
    </div>

    <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-5 w-5 text-purple-600" />
        <span className="text-sm font-semibold text-slate-600">Risk Score</span>
      </div>
      <p className="text-4xl font-bold text-purple-600 mb-1">
        {Math.min(100, Math.round((totalDelay / 72) * 100))}
      </p>
      <Progress
        value={Math.min(100, (totalDelay / 72) * 100)}
        className="h-2 mt-2"
      />
    </div>
  </div>
</CardContent>

      </Card>

      {/* Delay Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 shadow-lg rounded-2xl bg-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-200">
                <Anchor className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Arrival Delay</h3>
                <p className="text-sm text-slate-600 font-medium">Port arrival delay estimate</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-6xl font-bold text-blue-600 mb-2">
                  {predictions.arrivalDelay?.hours || 0}
                  <span className="text-2xl text-slate-500 ml-2">hours</span>
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">Confidence Level</span>
                    <span className="font-bold text-slate-800">
                      {((predictions.arrivalDelay?.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(predictions.arrivalDelay?.confidence || 0) * 100} className="h-3" />
                </div>
              </div>
            </div>

            {predictions.arrivalDelay?.factors && predictions.arrivalDelay.factors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Contributing Factors:</p>
                <div className="space-y-2">
                  {predictions.arrivalDelay.factors.map((factor: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-blue-200 shadow-sm"
                    >
                      <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 shadow-lg rounded-2xl bg-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border-2 border-green-200">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Berthing Delay</h3>
                <p className="text-sm text-slate-600 font-medium">Port berthing delay estimate</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-6xl font-bold text-green-600 mb-2">
                  {predictions.berthingDelay?.hours || 0}
                  <span className="text-2xl text-slate-500 ml-2">hours</span>
                </p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">Confidence Level</span>
                    <span className="font-bold text-slate-800">
                      {((predictions.berthingDelay?.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(predictions.berthingDelay?.confidence || 0) * 100} className="h-3" />
                </div>
              </div>
            </div>

            {predictions.berthingDelay?.factors && predictions.berthingDelay.factors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Contributing Factors:</p>
                <div className="space-y-2">
                  {predictions.berthingDelay.factors.map((factor: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-green-200 shadow-sm"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Conditions */}
        <Card className="border-2 border-blue-200 shadow-lg rounded-2xl bg-white">
          <CardHeader className="pb-3 bg-blue-50 rounded-t-2xl">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-200">
                <Cloud className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Weather</h3>
                <p className="text-xs text-slate-600">Current conditions</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Wind</span>
              </div>
              <span className="font-bold text-slate-800">
                {realTimeFactors.weatherConditions?.windSpeed || "N/A"} km/h
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Waves</span>
              </div>
              <span className="font-bold text-slate-800">
                {realTimeFactors.weatherConditions?.waveHeight || "N/A"}m
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Visibility</span>
              </div>
              <Badge variant="outline" className="bg-white border-slate-300">
                {realTimeFactors.weatherConditions?.visibility || "N/A"}
              </Badge>
            </div>
            {realTimeFactors.weatherConditions?.weatherScore !== undefined && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-blue-700">Weather Score</span>
                  <span className="text-sm font-bold text-blue-800">
                    {realTimeFactors.weatherConditions.weatherScore}/100
                  </span>
                </div>
                <Progress value={realTimeFactors.weatherConditions.weatherScore} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Port Congestion */}
        <Card className="border-2 border-orange-200 shadow-lg rounded-2xl bg-white">
          <CardHeader className="pb-3 bg-orange-50 rounded-t-2xl">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center border-2 border-orange-200">
                <Anchor className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Port Status</h3>
                <p className="text-xs text-slate-600">Congestion level</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Queue</span>
              </div>
              <span className="font-bold text-slate-800">
                {realTimeFactors.portCongestion?.queuedVessels || 0} vessels
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Wait Time</span>
              </div>
              <span className="font-bold text-slate-800">{realTimeFactors.portCongestion?.averageWaitTime || 0}h</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Berths</span>
              </div>
              <Badge variant="outline" className="bg-white border-slate-300">
                {realTimeFactors.portCongestion?.berthAvailability || 0} available
              </Badge>
            </div>
            {realTimeFactors.portCongestion?.congestionScore !== undefined && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-orange-700">Congestion Score</span>
                  <span className="text-sm font-bold text-orange-800">
                    {realTimeFactors.portCongestion.congestionScore}/100
                  </span>
                </div>
                <Progress value={realTimeFactors.portCongestion.congestionScore} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vessel Tracking */}
        <Card className="border-2 border-green-200 shadow-lg rounded-2xl bg-white">
          <CardHeader className="pb-3 bg-green-50 rounded-t-2xl">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border-2 border-green-200">
                <Ship className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Vessel Status</h3>
                <p className="text-xs text-slate-600">Current position</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Speed</span>
              </div>
              <span className="font-bold text-slate-800">{realTimeFactors.vesselTracking?.speed || 0} knots</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Distance</span>
              </div>
              <span className="font-bold text-slate-800">{realTimeFactors.vesselTracking?.distanceToPort || 0} km</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Status</span>
              </div>
              <Badge variant="outline" className="bg-white border-slate-300 capitalize">
                {realTimeFactors.vesselTracking?.voyageStatus || "N/A"}
              </Badge>
            </div>
            {realTimeFactors.vesselTracking?.completionPercentage !== undefined && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-green-700">Voyage Progress</span>
                  <span className="text-sm font-bold text-green-800">
                    {realTimeFactors.vesselTracking.completionPercentage}%
                  </span>
                </div>
                <Progress value={realTimeFactors.vesselTracking.completionPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Operational Factors */}
      {realTimeFactors.operationalFactors && (
        <Card className="border-2 border-purple-200 shadow-lg rounded-2xl bg-white">
          <CardHeader className="bg-purple-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border-2 border-purple-200">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Operational Readiness</h3>
                <p className="text-sm text-slate-600">Cargo and crew status</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <p className="text-sm font-semibold text-slate-600 mb-2">Cargo Complexity</p>
                <Badge className="bg-purple-100 text-purple-800 capitalize border-purple-300">
                  {realTimeFactors.operationalFactors.cargoComplexity}
                </Badge>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm font-semibold text-slate-600 mb-2">Discharge Time</p>
                <p className="text-2xl font-bold text-blue-700">{realTimeFactors.operationalFactors.dischargeTime}h</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm font-semibold text-slate-600 mb-2">Crew Readiness</p>
                <div className="flex items-center gap-2">
                  <Progress value={realTimeFactors.operationalFactors.crewReadiness} className="h-2 flex-1" />
                  <span className="text-sm font-bold text-green-700">
                    {realTimeFactors.operationalFactors.crewReadiness}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <p className="text-sm font-semibold text-slate-600 mb-2">Equipment</p>
                <div className="flex items-center gap-2">
                  <Progress value={realTimeFactors.operationalFactors.equipmentAvailability} className="h-2 flex-1" />
                  <span className="text-sm font-bold text-orange-700">
                    {realTimeFactors.operationalFactors.equipmentAvailability}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delay Factors and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-red-200 shadow-lg rounded-2xl bg-white">
          <CardHeader className="bg-red-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center border-2 border-red-200">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Delay Factors</h3>
                <p className="text-sm text-slate-600">Identified risk contributors</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {predictionData.delayReasons?.map((reason: any, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h4 className="font-bold text-slate-800 flex-1">{reason.factor}</h4>
                    <div className="flex flex-col gap-2">
                      <Badge
                        variant={
                          reason.severity === "high"
                            ? "destructive"
                            : reason.severity === "medium"
                              ? "secondary"
                              : "default"
                        }
                        className="text-xs"
                      >
                        {reason.severity?.toUpperCase()}
                      </Badge>
                      {reason.probability && (
                        <div className="text-xs text-slate-600 text-right">{reason.probability}% likely</div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{reason.impact}</p>
                  {reason.mitigationTime && (
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Mitigation: {reason.mitigationTime}
                    </div>
                  )}
                </div>
              ))}
              {(!predictionData.delayReasons || predictionData.delayReasons.length === 0) && (
                <div className="text-center py-8">
                  <CheckCheck className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-600">No significant delay factors identified</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 shadow-lg rounded-2xl bg-white">
          <CardHeader className="bg-amber-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center border-2 border-amber-200">
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Recommendations</h3>
                <p className="text-sm text-slate-600">Action items</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {predictionData.recommendations?.map((rec: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border-2 border-green-200"
                >
                  <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 border-2 border-green-300">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-slate-700 font-medium flex-1">{rec}</p>
                </div>
              ))}
              {(!predictionData.recommendations || predictionData.recommendations.length === 0) && (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No specific recommendations at this time</p>
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
