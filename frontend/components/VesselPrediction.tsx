"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import {
  Ship,
  Calendar,
  Package,
  MapPin,
  Anchor,
  User,
  Clock,
  DollarSign,
  Train,
  AlertCircle,
  CheckCircle,
  Info,
  Globe,
  Factory,
  Timer,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import DelayPrediction from "./DelayPrediction"
import PortToPlant from "./PortToPlant"
import { Optimization } from "./PlaceholderComponents"
import type { TabType } from "../types/delay-prediction"

interface PlantAllocation {
  plantName: string
  requiredQuantity: number
  plantStockAvailability: number
  _id: string
}

interface Parcel {
  size: number
  materialType: string
  qualityGrade: string
  qualitySpecs: string
  plantAllocations: PlantAllocation[]
  _id: string
}

interface CostParameters {
  fringeOcean: number
  fringeRail: number
  demurrageRate: number
  maxPortCalls: number
  portHandlingFees: number
  storageCost: number
  freeTime: number
  portDifferentialCost: number
}

interface RailData {
  rakeCapacity: number
  loadingTimePerDay: number
  availability: boolean
  numberOfRakesRequired: number
}

interface PortPreference {
  portName: string
  sequentialDischarge: boolean
  dischargeOrder: string[]
  portStockAvailability: number
  _id: string
}

interface Supplier {
  name: string
  country: string
}

interface VesselDetails {
  _id: string
  name: string
  capacity: number
  ETA: string
  laydays: {
    start: string
    end: string
  }
  loadPort: string
  supplier: Supplier
  parcels: Parcel[]
  costParameters: CostParameters
  railData: RailData
  portPreferences: PortPreference[]
  createdAt: string
  updatedAt: string
}

const VesselPrediction: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const vesselId = params.vesselId as string

  const [activeTab, setActiveTab] = useState<TabType>("vessel-details")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vesselDetails, setVesselDetails] = useState<VesselDetails | null>(null)
  const [delayPredictionLoaded, setDelayPredictionLoaded] = useState(false)
  const [portToPlantLoaded, setPortToPlantLoaded] = useState(false)

  const tabOrder: TabType[] = ["vessel-details", "delay-prediction", "port-to-plant", "optimization"]

  useEffect(() => {
    const fetchVesselDetails = async () => {
      if (!vesselId) return

      try {
        const response = await fetch(`http://localhost:5000/api/vessels/${vesselId}`)
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch vessel details")
        }

        setVesselDetails(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchVesselDetails()
  }, [vesselId])

  const handleNext = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isNextDisabled = () => {
    if (activeTab === "delay-prediction" && !delayPredictionLoaded) return true
    if (activeTab === "port-to-plant" && !portToPlantLoaded) return true
    return tabOrder.indexOf(activeTab) === tabOrder.length - 1
  }

  // Calculate some derived metrics
  const calculateDerivedMetrics = (vessel: VesselDetails) => {
    const totalCargoVolume = vessel.parcels.reduce((total, parcel) => total + parcel.size, 0)
    const totalPlantAllocations = vessel.parcels.reduce((total, parcel) => total + parcel.plantAllocations.length, 0)
    const laydaysDuration = Math.ceil(
      (new Date(vessel.laydays.end).getTime() - new Date(vessel.laydays.start).getTime()) / (1000 * 60 * 60 * 24),
    )
    const totalRequiredQuantity = vessel.parcels.reduce(
      (total, parcel) =>
        total + parcel.plantAllocations.reduce((sum, allocation) => sum + allocation.requiredQuantity, 0),
      0,
    )
    const totalAvailableStock = vessel.parcels.reduce(
      (total, parcel) =>
        total + parcel.plantAllocations.reduce((sum, allocation) => sum + allocation.plantStockAvailability, 0),
      0,
    )

    return {
      totalCargoVolume,
      totalPlantAllocations,
      laydaysDuration,
      totalRequiredQuantity,
      totalAvailableStock,
      stockShortfall: Math.max(0, totalRequiredQuantity - totalAvailableStock),
      utilizationPercentage: Math.round((totalCargoVolume / vessel.capacity) * 100),
    }
  }

  if (!vesselId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="p-8 shadow-xl rounded-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Ship className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-xl font-semibold text-slate-700">No vessel selected</p>
            <p className="text-slate-500 mt-2">Please select a vessel to view details</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="p-8 shadow-xl rounded-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600"></div>
              <div
                className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-slate-700">Loading vessel details</p>
              <p className="text-slate-500 mt-1">Please wait while we fetch the information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="p-8 shadow-xl rounded-2xl border-0 bg-white/80 backdrop-blur-sm max-w-md">
          <CardContent className="flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-semibold text-red-600 mb-2">Something went wrong</p>
              <p className="text-slate-600">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metrics = vesselDetails ? calculateDerivedMetrics(vesselDetails) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={handleBack}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 gap-2 bg-gray-100 p-2 rounded-xl shadow-sm">
  {['vessel-details', 'delay-prediction', 'port-to-plant', 'optimization'].map((tab) => (
    <TabsTrigger
      key={tab}
      value={tab}
      disabled={
        (tab === 'port-to-plant' && !delayPredictionLoaded) ||
        (tab === 'optimization' && (!delayPredictionLoaded || !portToPlantLoaded))
      }
      className="py-3 px-4 rounded-lg font-bold text-lg text-gray-700 
                 data-[state=active]:bg-primary data-[state=active]:text-white 
                 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed 
                 transition-all duration-200"
    >
      {tab === 'vessel-details' && <Ship className="h-5 w-5 mr-2" />}
      {tab === 'delay-prediction' && <Calendar className="h-5 w-5 mr-2" />}
      {tab === 'port-to-plant' && <Package className="h-5 w-5 mr-2" />}
      {tab === 'optimization' && (
        <svg
          className="h-5 w-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      )}
      {tab.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </TabsTrigger>
  ))}
</TabsList>



          <TabsContent value="vessel-details" className="space-y-8">
            {vesselDetails && (
              <>
                {/* Vessel Overview Header */}
                <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent" />
                  <CardHeader className="relative pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <Ship className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold text-slate-800 mb-1">{vesselDetails.name}</CardTitle>
                          <p className="text-slate-500 font-medium">ID: {vesselDetails._id}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="px-4 py-2 text-sm font-semibold border-blue-200 text-blue-700 bg-blue-50"
                      >
                        {metrics?.utilizationPercentage}% Capacity Utilized
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-6 bg-slate-50/80 rounded-xl border border-slate-100">
                        <Anchor className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-800 mb-1">
                          {vesselDetails.capacity.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-slate-600">MT Capacity</p>
                      </div>
                      <div className="text-center p-6 bg-slate-50/80 rounded-xl border border-slate-100">
                        <Package className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-800 mb-1">
                          {metrics?.totalCargoVolume.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-slate-600">Total Cargo</p>
                      </div>
                      <div className="text-center p-6 bg-slate-50/80 rounded-xl border border-slate-100">
                        <Factory className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-800 mb-1">{metrics?.totalPlantAllocations}</p>
                        <p className="text-sm font-medium text-slate-600">Plant Destinations</p>
                      </div>
                      <div className="text-center p-6 bg-slate-50/80 rounded-xl border border-slate-100">
                        <Clock className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-800 mb-1">{metrics?.laydaysDuration}</p>
                        <p className="text-sm font-medium text-slate-600">Laydays Duration</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vessel & Supplier Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Ship className="h-5 w-5 text-blue-600" />
                        </div>
                        Vessel Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-50/80 rounded-xl">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-slate-500" />
                          <span className="font-semibold text-slate-700">Load Port</span>
                        </div>
                        <span className="font-medium text-slate-800">{vesselDetails.loadPort}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-50/80 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-slate-500" />
                          <span className="font-semibold text-slate-700">ETA</span>
                        </div>
                        <span className="font-medium text-slate-800">
                          {new Date(vesselDetails.ETA).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-50/80 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Timer className="h-5 w-5 text-slate-500" />
                          <span className="font-semibold text-slate-700">Created</span>
                        </div>
                        <span className="font-medium text-slate-800">
                          {new Date(vesselDetails.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-50/80 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Info className="h-5 w-5 text-slate-500" />
                          <span className="font-semibold text-slate-700">Last Updated</span>
                        </div>
                        <span className="font-medium text-slate-800">
                          {new Date(vesselDetails.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        Supplier Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-50/80 rounded-xl">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-slate-500" />
                          <span className="font-semibold text-slate-700">Supplier Name</span>
                        </div>
                        <span className="font-bold text-slate-800">{vesselDetails.supplier.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-50/80 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-slate-500" />
                          <span className="font-semibold text-slate-700">Country</span>
                        </div>
                        <span className="font-medium text-slate-800">{vesselDetails.supplier.country}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Laydays Information */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-orange-600" />
                      </div>
                      Laydays Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-100">
                        <h4 className="font-bold text-orange-800 mb-3 text-lg">Start Date</h4>
                        <p className="text-2xl font-bold text-orange-700 mb-1">
                          {new Date(vesselDetails.laydays.start).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-orange-600">
                          {new Date(vesselDetails.laydays.start).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                        <h4 className="font-bold text-red-800 mb-3 text-lg">End Date</h4>
                        <p className="text-2xl font-bold text-red-700 mb-1">
                          {new Date(vesselDetails.laydays.end).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-red-600">
                          {new Date(vesselDetails.laydays.end).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-3 text-lg">Duration</h4>
                        <p className="text-2xl font-bold text-blue-700 mb-1">{metrics?.laydaysDuration} Days</p>
                        <p className="text-sm font-medium text-blue-600">Loading Window</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parcels & Plant Allocations */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      Cargo Parcels & Plant Allocations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {vesselDetails.parcels.map((parcel, index) => (
                        <div key={parcel._id} className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                              <Badge
                                variant="secondary"
                                className="px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-700"
                              >
                                Parcel {index + 1}
                              </Badge>
                              <span className="text-2xl font-bold text-slate-800">
                                {parcel.size.toLocaleString()} MT
                              </span>
                            </div>
                            <Badge variant="outline" className="px-3 py-1 border-slate-300 text-slate-700">
                              {parcel.materialType}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                              <h5 className="font-bold text-sm text-slate-600 mb-2">Material Type</h5>
                              <p className="font-semibold text-slate-800">{parcel.materialType}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                              <h5 className="font-bold text-sm text-slate-600 mb-2">Quality Grade</h5>
                              <p className="font-semibold text-slate-800">{parcel.qualityGrade}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                              <h5 className="font-bold text-sm text-slate-600 mb-2">Quality Specs</h5>
                              <p className="font-semibold text-slate-800">{parcel.qualitySpecs}</p>
                            </div>
                          </div>

                          {parcel.plantAllocations.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-700 mb-4 text-lg">Plant Allocations</h5>
                              <div className="grid gap-4">
                                {parcel.plantAllocations.map((allocation, allocIndex) => (
                                  <div
                                    key={allocation._id}
                                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                        <Factory className="h-5 w-5 text-slate-600" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800">{allocation.plantName}</p>
                                        <p className="text-sm font-medium text-slate-600">
                                          Required: {allocation.requiredQuantity.toLocaleString()} MT
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-slate-600 mb-1">Stock Available</p>
                                      <div className="flex items-center gap-3">
                                        <p className="font-bold text-slate-800">
                                          {allocation.plantStockAvailability.toLocaleString()} MT
                                        </p>
                                        {allocation.plantStockAvailability >= allocation.requiredQuantity ? (
                                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                          </div>
                                        ) : (
                                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm font-semibold text-blue-600 mb-2">Total Required</p>
                          <p className="text-3xl font-bold text-blue-800">
                            {metrics?.totalRequiredQuantity.toLocaleString()} MT
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-600 mb-2">Total Available</p>
                          <p className="text-3xl font-bold text-blue-800">
                            {metrics?.totalAvailableStock.toLocaleString()} MT
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-600 mb-2">Stock Shortfall</p>
                          <p
                            className={`text-3xl font-bold ${(metrics?.stockShortfall ?? 0) > 0 ? "text-red-600" : "text-emerald-600"}`}
                          >
                            {(metrics?.stockShortfall ?? 0) > 0 ? `${metrics?.stockShortfall?.toLocaleString()} MT` : "None"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rail Transportation Data */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Train className="h-5 w-5 text-emerald-600" />
                      </div>
                      Rail Transportation
                      <Badge variant={vesselDetails.railData.availability ? "default" : "destructive"} className="ml-2">
                        {vesselDetails.railData.availability ? "Available" : "Not Available"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-6 bg-slate-50/80 rounded-xl border border-slate-100">
                        <Train className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-slate-800 mb-1">
                          {vesselDetails.railData.rakeCapacity.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-slate-600">Rake Capacity (MT)</p>
                      </div>
                      <div className="text-center p-6 bg-slate-50/80 rounded-xl border border-slate-100">
                        <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-slate-800 mb-1">
                          {vesselDetails.railData.loadingTimePerDay.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-slate-600">Loading/Day (MT)</p>
                      </div>
                      <div className="text-center p-6 bg-slate-50/80 rounded-xl border border-slate-100">
                        <Package className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-slate-800 mb-1">
                          {vesselDetails.railData.numberOfRakesRequired}
                        </p>
                        <p className="text-sm font-medium text-slate-600">Rakes Required</p>
                      </div>
                      <div className="text-center p-6 bg-slate-50/80 rounded-xl border border-slate-100">
                        {vesselDetails.railData.availability ? (
                          <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                        ) : (
                          <AlertCircle className="h-10 w-10 text-red-600 mx-auto mb-3" />
                        )}
                        <p className="text-2xl font-bold text-slate-800 mb-1">
                          {vesselDetails.railData.availability ? "Ready" : "Unavailable"}
                        </p>
                        <p className="text-sm font-medium text-slate-600">Rail Status</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Parameters */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-yellow-600" />
                      </div>
                      Cost Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(vesselDetails.costParameters).map(([key, value]) => (
                        <div key={key} className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                          <h4 className="font-bold text-sm text-slate-600 mb-2">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </h4>
                          <p className="text-lg font-bold text-slate-800">
                            {key === "freeTime" ? `${value} hours` : `${value.toLocaleString()}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Port Preferences */}
                {vesselDetails.portPreferences.length > 0 && (
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Anchor className="h-5 w-5 text-blue-600" />
                        </div>
                        Port Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {vesselDetails.portPreferences.map((port, index) => (
                          <div key={port._id} className="p-6 border border-slate-200 rounded-2xl bg-slate-50/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                  <MapPin className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-xl text-slate-800">{port.portName}</h4>
                              </div>
                              <Badge variant={port.sequentialDischarge ? "default" : "secondary"} className="px-3 py-1">
                                {port.sequentialDischarge ? "Sequential" : "Non-Sequential"}
                              </Badge>
                            </div>

                            

                            {index < vesselDetails.portPreferences.length - 1 && <Separator className="mt-6" />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="delay-prediction">
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  Delay Prediction Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DelayPrediction vesselId={vesselId} onLoadComplete={() => setDelayPredictionLoaded(true)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="port-to-plant">
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  Port to Plant Logistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortToPlant vesselId={vesselId} onLoadComplete={() => setPortToPlantLoaded(true)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization">
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Optimization vesselId={vesselId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default VesselPrediction
