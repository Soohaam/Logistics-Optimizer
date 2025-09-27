"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Ship,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Settings,
  Train,
  Anchor,
  FileSpreadsheet,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PlantAllocation {
  plantName: string
  requiredQuantity: number
  plantStockAvailability: number
}

interface Parcel {
  id: string
  size: number
  loadPort: string
  materialType: string
  qualityGrade: string
  qualitySpecs: string
  plantAllocations: PlantAllocation[]
}

interface PortPreference {
  portName: string
  sequentialDischarge: boolean
  dischargeOrder: string[]
  portStockAvailability: number
}

interface UploadResult {
  successCount: number
  failureCount: number
  total: number
  successful: Array<{ name: string; id: string }>
  failed: Array<{ row: any; error: string }>
}

interface Vessel {
  _id?: string
  name: string
  capacity: number
  ETA: string
  laydays: {
    start: string
    end: string
  }
  loadPort: string
  supplier: {
    name: string
    country: string
  }
  parcels: Parcel[]
  costParameters: {
    fringeOcean: number
    fringeRail: number
    demurrageRate: number
    maxPortCalls: number
    portHandlingFees: number
    storageCost: number
    freeTime: number
    portDifferentialCost: number
  }
  railData: {
    rakeCapacity: number
    loadingTimePerDay: number
    availability: boolean
    numberOfRakesRequired: number
  }
  portPreferences: PortPreference[]
}

const VesselManager: React.FC = () => {
  const router = useRouter()
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [activeTab, setActiveTab] = useState("general")
  const [validationAlert, setValidationAlert] = useState<string | null>(null)

  const tabOrder = ["general", "parcels", "costs", "rail"]
  const tabLabels = {
    general: "General Info",
    parcels: "Parcel Form",
    costs: "Cost Parameters",
    rail: "Rail Data",
  }

  // CSV Upload Modal Component
  const CSVUploadModal = () => (
    <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
      <DialogContent className="sm:max-w-[650px] rounded-xl border-0 shadow-2xl">
        <DialogHeader className="space-y-4 pb-6">
          <DialogTitle className="text-3xl font-bold text-blue-900">Import Vessels</DialogTitle>
          <DialogDescription className="text-lg text-slate-600">
            Upload a CSV or Excel file containing vessel information to bulk import your fleet data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="flex flex-col space-y-6">
            <Label className="text-lg font-semibold text-slate-700">Select File</Label>
            <div className="flex gap-4">
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="h-14 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
              />
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="whitespace-nowrap px-6 py-4 text-lg h-14 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors bg-transparent"
              >
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Template
              </Button>
            </div>
            {message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-6 w-6 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                )}
                <p className="text-lg font-medium">{message.text}</p>
              </div>
            )}
          </div>

          {uploadLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto mb-6"></div>
              <p className="text-slate-600 text-lg font-medium">Processing your vessel data...</p>
            </div>
          )}

          {uploadResult && !uploadLoading && (
            <div className="space-y-6 p-6 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-semibold text-green-700">
                    Successfully imported: {uploadResult.successCount}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-lg font-semibold text-red-700">Failed: {uploadResult.failureCount}</span>
                </div>
              </div>

              {uploadResult.failed.length > 0 && (
                <div className="mt-6">
                  <Label className="text-lg font-semibold text-red-700 mb-3 block">Import Errors:</Label>
                  <div className="max-h-48 overflow-y-auto space-y-3">
                    {uploadResult.failed.map((failure, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
                        <p className="text-lg text-red-700">{failure.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => {
              setShowUploadModal(false)
              setSelectedFile(null)
              setMessage(null)
              setUploadResult(null)
            }}
            className="px-8 py-3 text-lg rounded-xl"
          >
            Close
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadLoading}
            className="bg-blue-900 hover:bg-blue-800 px-8 py-3 text-lg rounded-xl shadow-lg transition-colors"
          >
            {uploadLoading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const handleVesselClick = (vesselId: string) => {
    router.push(`/vessels/${vesselId}`)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File select triggered")
    const file = event.target.files?.[0]
    if (!file) {
      setMessage({ type: "error", text: "No file selected" })
      setSelectedFile(null)
      return
    }
    console.log("Selected file:", file.name, "type:", file.type, "size:", file.size)

    // Reset previous states
    setMessage(null)
    setUploadResult(null)

    // Validate file size
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setMessage({ type: "error", text: "File size should be less than 10MB" })
      setSelectedFile(null)
      event.target.value = "" // Reset file input
      return
    }

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    const allowedExtensions = [".csv", ".xls", ".xlsx"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setMessage({
        type: "error",
        text: "Invalid file type. Please upload a CSV or Excel file (.csv, .xls, .xlsx)",
      })
      setSelectedFile(null)
      event.target.value = "" // Reset file input
      return
    }

    setSelectedFile(file)
    setMessage({ type: "success", text: "File selected: " + file.name })
  }

  const handleUpload = async () => {
    console.log("Upload triggered")
    if (!selectedFile) {
      console.log("No file selected for upload")
      setMessage({ type: "error", text: "Please select a file to upload" })
      return
    }

    console.log("Starting upload for file:", selectedFile.name)
    setUploadLoading(true)
    setMessage(null)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      // First attempt to check if the server is reachable
      const serverCheck = await fetch(API_BASE_URL, { method: "HEAD" }).catch(() => ({ ok: false }))

      if (!serverCheck.ok) {
        throw new Error("Server is not reachable. Please try again later.")
      }

      const response = await fetch(`${API_BASE_URL}/upload-csv`, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type header as it will be automatically set by the browser for FormData
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Upload failed")
      }

      if (data.data.successCount === 0 && data.data.failureCount === 0) {
        throw new Error("No vessels found in the uploaded file")
      }

      setUploadResult(data.data)
      await fetchVessels() // Refresh vessel list

      // Set appropriate message based on results
      if (data.data.failureCount === 0) {
        setMessage({
          type: "success",
          text: `Successfully imported ${data.data.successCount} vessels`,
        })
      } else if (data.data.successCount === 0) {
        setMessage({
          type: "error",
          text: `Failed to import any vessels. Please check the errors below.`,
        })
      } else {
        setMessage({
          type: "success",
          text: `Imported ${data.data.successCount} vessels with ${data.data.failureCount} failures`,
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to upload file",
      })
      setUploadResult(null)
    } finally {
      setUploadLoading(false)
      setSelectedFile(null)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = "" // Reset file input
    }
  }

  const downloadTemplate = async () => {
    try {
      setMessage(null)

      // Check if the server is reachable
      const serverCheck = await fetch(API_BASE_URL, { method: "HEAD" }).catch(() => ({ ok: false }))

      if (!serverCheck.ok) {
        throw new Error("Server is not reachable. Please try again later.")
      }

      const response = await fetch(`${API_BASE_URL}/download-template`, {
        headers: {
          Accept: "text/csv",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.statusText}`)
      }

      // Check content type
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("text/csv")) {
        throw new Error("Invalid template format received from server")
      }

      const blob = await response.blob()

      // Verify blob is not empty
      if (blob.size === 0) {
        throw new Error("Template file is empty")
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      const timestamp = new Date().toISOString().split("T")[0]
      a.href = url
      a.download = `vessel_template_${timestamp}.csv`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({
        type: "success",
        text: "Template downloaded successfully",
      })
    } catch (error) {
      console.error("Template download error:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to download template. Please try again.",
      })
    }
  }

  // API Base URL
  const API_BASE_URL = "http://localhost:5000/api/vessels"

  // Form state
  const [newVessel, setNewVessel] = useState<Vessel>({
    name: "",
    capacity: 0,
    ETA: "",
    laydays: {
      start: "",
      end: "",
    },
    loadPort: "",
    supplier: {
      name: "",
      country: "",
    },
    parcels: [],
    costParameters: {
      fringeOcean: 0,
      fringeRail: 0,
      demurrageRate: 0,
      maxPortCalls: 0,
      portHandlingFees: 0,
      storageCost: 0,
      freeTime: 0,
      portDifferentialCost: 0,
    },
    railData: {
      rakeCapacity: 0,
      loadingTimePerDay: 0,
      availability: false,
      numberOfRakesRequired: 0,
    },
    portPreferences: [],
  })

  // Demo data filling function
  const fillWithDemoData = () => {
    setNewVessel({
      name: "MV Ocean Star",
      capacity: 50000,
      ETA: "2025-12-20",
      laydays: {
        start: "2025-12-18",
        end: "2025-12-22",
      },
      loadPort: "Paradip",
      supplier: {
        name: "BHP",
        country: "Australia",
      },
      parcels: [
        {
          id: Date.now().toString(),
          size: 25000,
          loadPort: "Paradip",
          materialType: "Coking Coal",
          qualityGrade: "Hard coking coal (high vitrinite, low ash)",
          qualitySpecs: "Ash < 10%, Vitrinite > 60%, CSR > 65",
          plantAllocations: [
            {
              plantName: "Rourkela Steel Plant (RSP)",
              requiredQuantity: 12000,
              plantStockAvailability: 5000,
            },
          ],
        },
      ],
      costParameters: {
        fringeOcean: 100,
        fringeRail: 200,
        demurrageRate: 5000,
        maxPortCalls: 2,
        portHandlingFees: 1000,
        storageCost: 50,
        freeTime: 3,
        portDifferentialCost: 200,
      },
      railData: {
        rakeCapacity: 4000,
        loadingTimePerDay: 8000,
        availability: true,
        numberOfRakesRequired: 3,
      },
      portPreferences: [
        {
          portName: "Haldia Port",
          sequentialDischarge: true,
          dischargeOrder: ["Haldia Port", "Visakhapatnam (Vizag) Port"],
          portStockAvailability: 20000,
        },
        {
          portName: "Visakhapatnam (Vizag) Port",
          sequentialDischarge: false,
          dischargeOrder: ["Visakhapatnam (Vizag) Port"],
          portStockAvailability: 15000,
        },
      ],
    })

    setMessage({
      type: "success",
      text: "Demo data filled successfully! You can now review and modify the data before creating the vessel.",
    })
  }

  // Dropdown data
  const materialTypes = ["Coking Coal", "Limestone", "Dolomite", "Manganese Ore"]

  const qualityGrades: { [key: string]: string[] } = {
    "Coking Coal": [
      "Hard coking coal (high vitrinite, low ash)",
      "Semi-soft coking coal (medium rank, higher ash)",
      "PCI coal (Pulverized Coal Injection grade)",
    ],
    Limestone: ["Blast Furnace (BF) Grade Limestone", "Steel Melting Shop (SMS) Grade Limestone"],
    Dolomite: ["Blast Furnace (BF) Grade", "Steel Melting Shop (SMS) Grade"],
    "Manganese Ore": ["High Grade (>46% Mn)", "Medium Grade (35–46% Mn)", "Low Grade (30–35% Mn)"],
  }

  const qualitySpecs: { [key: string]: string } = {
    "Hard coking coal (high vitrinite, low ash)": "Ash < 10%, Vitrinite > 60%, CSR > 65",
    "Semi-soft coking coal (medium rank, higher ash)": "Ash 8–12%, Vitrinite 30–50%, Moderate CSR",
    "PCI coal (Pulverized Coal Injection grade)": "Volatile Matter 20–35%, Ash < 12%",
    "Blast Furnace (BF) Grade Limestone": "CaO: 43–50%, MgO: 2.25–5%, SiO₂: 3.5–6.5%",
    "Steel Melting Shop (SMS) Grade Limestone": "CaO: 52% (+), MgO ≤1%, SiO₂ ≤1.5%",
    "Blast Furnace (BF) Grade": "CaO ~30%, MgO ~18%, SiO₂ ≤5%",
    "Steel Melting Shop (SMS) Grade": "CaO 30–32%, MgO 20–22%, SiO₂ 2.5–3.5%",
    "High Grade (>46% Mn)": ">46% Mn",
    "Medium Grade (35–46% Mn)": "35–46% Mn",
    "Low Grade (30–35% Mn)": "30–35% Mn",
  }

  const plants = [
    "Bhilai Steel Plant (BSP)",
    "Durgapur Steel Plant (DSP)",
    "Rourkela Steel Plant (RSP)",
    "Bokaro Steel Plant (BSL)",
    "IISCO Steel Plant (ISP)",
  ]

  const portNames = ["Visakhapatnam (Vizag) Port", "Haldia Port", "Paradip Port"]

  const countries = [
    "India",
    "Australia",
    "Brazil",
    "South Africa",
    "Indonesia",
    "China",
    "United States",
    "Canada",
    "Germany",
    "United Kingdom",
    "France",
    "Japan",
    "South Korea",
    "Singapore",
    "Malaysia",
    "Thailand",
    "Vietnam",
    "Philippines",
    "New Zealand",
    "Chile",
    "Peru",
    "Colombia",
    "Argentina",
    "Mexico",
    "Russia",
    "Ukraine",
  ]

  // Helper functions for dropdown logic
  const getGrades = (materialType: string): string[] => {
    return qualityGrades[materialType] || []
  }

  const getSpecs = (qualityGrade: string): string => {
    return qualitySpecs[qualityGrade] || ""
  }

  // API Functions
  const fetchVessels = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE_URL)
      const data = await response.json()

      if (data.success) {
        setVessels(data.data)
      } else {
        setMessage({ type: "error", text: data.error || "Failed to fetch vessels" })
      }
    } catch {
      setMessage({ type: "error", text: "Network error: Failed to fetch vessels" })
    } finally {
      setLoading(false)
    }
  }

  const createVessel = async (vesselData: Vessel) => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vesselData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Vessel created successfully!" })
        setVessels([...vessels, data.data])
        setShowForm(false)
        resetForm()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create vessel" })
      }
    } catch {
      setMessage({ type: "error", text: "Network error: Failed to create vessel" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNewVessel({
      name: "",
      capacity: 0,
      ETA: "",
      laydays: {
        start: "",
        end: "",
      },
      loadPort: "",
      supplier: {
        name: "",
        country: "",
      },
      parcels: [],
      costParameters: {
        fringeOcean: 0,
        fringeRail: 0,
        demurrageRate: 0,
        maxPortCalls: 0,
        portHandlingFees: 0,
        storageCost: 0,
        freeTime: 0,
        portDifferentialCost: 0,
      },
      railData: {
        rakeCapacity: 0,
        loadingTimePerDay: 0,
        availability: false,
        numberOfRakesRequired: 0,
      },
      portPreferences: [],
    })
  }

  // Form handlers
  const addParcel = () => {
    const newParcel: Parcel = {
      id: Date.now().toString(),
      size: 0,
      loadPort: "",
      materialType: "",
      qualityGrade: "",
      qualitySpecs: "",
      plantAllocations: [],
    }
    setNewVessel({
      ...newVessel,
      parcels: [...newVessel.parcels, newParcel],
    })
  }

  const removeParcel = (id: string) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.filter((parcel) => parcel.id !== id),
    })
  }

  const updateParcel = (id: string, field: keyof Parcel, value: string | number) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map((parcel) => (parcel.id === id ? { ...parcel, [field]: value } : parcel)),
    })
  }

  const addPlantAllocation = (parcelId: string) => {
    const newAllocation: PlantAllocation = {
      plantName: "",
      requiredQuantity: 0,
      plantStockAvailability: 0,
    }
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map((parcel) =>
        parcel.id === parcelId ? { ...parcel, plantAllocations: [...parcel.plantAllocations, newAllocation] } : parcel,
      ),
    })
  }

  const removePlantAllocation = (parcelId: string, allocationIndex: number) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map((parcel) =>
        parcel.id === parcelId
          ? { ...parcel, plantAllocations: parcel.plantAllocations.filter((_, index) => index !== allocationIndex) }
          : parcel,
      ),
    })
  }

  const updatePlantAllocation = (
    parcelId: string,
    allocationIndex: number,
    field: keyof PlantAllocation,
    value: string | number,
  ) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map((parcel) =>
        parcel.id === parcelId
          ? {
              ...parcel,
              plantAllocations: parcel.plantAllocations.map((allocation, index) =>
                index === allocationIndex ? { ...allocation, [field]: value } : allocation,
              ),
            }
          : parcel,
      ),
    })
  }

  const addPortPreference = () => {
    const newPreference: PortPreference = {
      portName: "",
      sequentialDischarge: false,
      dischargeOrder: [],
      portStockAvailability: 0,
    }
    setNewVessel({
      ...newVessel,
      portPreferences: [...newVessel.portPreferences, newPreference],
    })
  }

  const removePortPreference = (index: number) => {
    setNewVessel({
      ...newVessel,
      portPreferences: newVessel.portPreferences.filter((_, i) => i !== index),
    })
  }

  const updatePortPreference = (
    index: number,
    field: keyof PortPreference,
    value: string | number | boolean | string[],
  ) => {
    setNewVessel({
      ...newVessel,
      portPreferences: newVessel.portPreferences.map((pref, i) => (i === index ? { ...pref, [field]: value } : pref)),
    })
  }

  const handleMaterialTypeChange = (parcelId: string, materialType: string) => {
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map((parcel) =>
        parcel.id === parcelId ? { ...parcel, materialType, qualityGrade: "", qualitySpecs: "" } : parcel,
      ),
    })
  }

  const handleQualityGradeChange = (parcelId: string, qualityGrade: string) => {
    const specs = getSpecs(qualityGrade)
    setNewVessel({
      ...newVessel,
      parcels: newVessel.parcels.map((parcel) =>
        parcel.id === parcelId ? { ...parcel, qualityGrade, qualitySpecs: specs } : parcel,
      ),
    })
  }

  const validateVesselData = () => {
    const missingFields: string[] = []

    // Validate basic vessel information
    if (!newVessel.name.trim()) missingFields.push("Vessel Name")
    if (!newVessel.capacity || newVessel.capacity <= 0) missingFields.push("Capacity")
    if (!newVessel.ETA) missingFields.push("ETA")
    if (!newVessel.loadPort.trim()) missingFields.push("Load Port")
    if (!newVessel.supplier.name.trim()) missingFields.push("Supplier Name")
    if (!newVessel.supplier.country.trim()) missingFields.push("Supplier Country")

    // Validate laydays
    if (!newVessel.laydays.start) missingFields.push("Laydays Start")
    if (!newVessel.laydays.end) missingFields.push("Laydays End")

    if (missingFields.length > 0) {
      const fieldList = missingFields.join(", ")
      setValidationAlert(`Please fill in the following required fields: ${fieldList}`)
      return false
    }

    return true
  }

  const validateDates = () => {
    const today = new Date().toISOString().split("T")[0]
    const eta = newVessel.ETA
    const laydaysStart = newVessel.laydays.start
    const laydaysEnd = newVessel.laydays.end

    if (eta && eta < today) {
      setValidationAlert("ETA must be today or a future date")
      return false
    }

    if (laydaysStart && laydaysEnd && laydaysStart > laydaysEnd) {
      setValidationAlert("Laydays start must be before or equal to laydays end")
      return false
    }

    return true
  }

  const submitVessel = () => {
    setValidationAlert(null)

    if (!validateVesselData()) return
    if (!validateDates()) return

    createVessel(newVessel)
  }

  // Fetch vessels on component mount
  useEffect(() => {
    fetchVessels()
  }, [])

  const renderVesselsList = () => (
    <div className="w-full space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-bold text-blue-900">Fleet Management</h2>
          <p className="text-slate-600 mt-3 text-xl">Manage your vessel fleet and cargo operations with precision</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setShowUploadModal(true)}
            variant="outline"
            className="shadow-lg px-8 py-4 text-lg rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            size="lg"
          >
            <FileSpreadsheet className="h-6 w-6 mr-3" />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-900 hover:bg-blue-800 shadow-xl text-white px-8 py-4 text-lg cursor-pointer rounded-xl transition-colors"
            size="lg"
          >
            <Plus className="h-6 w-6 mr-3" />
            Add New Vessel
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="shadow-2xl border-0 rounded-2xl bg-white w-full">
          <CardContent className="text-center py-20">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100 border-t-blue-600 mx-auto mb-8"></div>
            <p className="text-slate-600 text-xl font-medium">Loading your fleet...</p>
          </CardContent>
        </Card>
      ) : vessels.length === 0 ? (
        <Card className="shadow-2xl border-0 rounded-2xl bg-white w-full">
          <CardContent className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Ship className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-800">No vessels in your fleet</h3>
            <p className="text-slate-600 mb-10 text-xl max-w-md mx-auto">
              Start managing your maritime operations by adding your first vessel to the system
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-900 hover:bg-blue-800 px-10 py-4 text-lg rounded-xl shadow-lg transition-colors"
            >
              Add First Vessel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 w-full">
          {vessels.map((vessel) => (
            <Card
              key={vessel._id}
              className="shadow-xl hover:shadow-2xl transition-shadow border-0 rounded-2xl bg-white group w-full"
            >
              <CardHeader className="pb-6">
                <div className="flex justify-between items-center">
                  <div
                    className="cursor-pointer flex-grow hover:opacity-80 transition-opacity"
                    onClick={() => vessel._id && handleVesselClick(vessel._id)}
                  >
                    <CardTitle className="text-3xl flex items-center gap-4 font-bold text-slate-800">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Ship className="h-6 w-6 text-white" />
                      </div>
                      {vessel.name}
                    </CardTitle>
                    <CardDescription className="text-xl mt-3 text-slate-600 font-medium">
                      Capacity: {vessel.capacity.toLocaleString()} MT
                    </CardDescription>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <Button
                      onClick={() => vessel._id && handleVesselClick(vessel._id)}
                      className="bg-blue-900 hover:bg-blue-800 shadow-lg text-white px-8 py-4 text-lg cursor-pointer rounded-xl transition-colors"
                      size="lg"
                    >
                      <Ship className="h-6 w-6 mr-3" />
                      Optimize Vessel
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl border-2 border-red-200 hover:border-red-300 transition-colors bg-transparent"
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete the vessel "${vessel.name}"? This action cannot be undone.`,
                          )
                        ) {
                          try {
                            setLoading(true)
                            const response = await fetch(`${API_BASE_URL}/${vessel._id}`, {
                              method: "DELETE",
                              headers: {
                                "Content-Type": "application/json",
                              },
                            })
                            const data = await response.json()

                            if (data.success) {
                              setVessels(vessels.filter((v) => v._id !== vessel._id))
                              setMessage({ type: "success", text: `Vessel "${vessel.name}" deleted successfully!` })
                            } else {
                              setMessage({ type: "error", text: data.error || "Failed to delete vessel" })
                            }
                          } catch {
                            setMessage({ type: "error", text: "Network error: Failed to delete vessel" })
                          } finally {
                            setLoading(false)
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm text-slate-500 uppercase tracking-wide font-semibold">ETA</Label>
                    <p className="font-bold text-xl text-slate-800">{new Date(vessel.ETA).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Load Port</Label>
                    <p className="font-bold text-xl text-slate-800">{vessel.loadPort}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Parcels</Label>
                    <Badge
                      variant="secondary"
                      className="text-lg px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-semibold"
                    >
                      {vessel.parcels.length} parcels
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Rail Status</Label>
                    <Badge
                      variant="secondary"
                      className={`text-lg px-4 py-2 rounded-lg font-semibold ${
                        vessel.railData.availability ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vessel.railData.availability ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Port Status</Label>
                    <p className="font-bold text-xl text-slate-800">
                      {vessel.portPreferences.length > 0
                        ? vessel.portPreferences.map((pref) => pref.portName).join(", ")
                        : "Not Set"}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Plant Status</Label>
                    <p className="font-bold text-xl text-slate-800">
                      {vessel.parcels.some((parcel) => parcel.plantAllocations.length > 0)
                        ? [
                            ...new Set(
                              vessel.parcels.flatMap((parcel) =>
                                parcel.plantAllocations.map((alloc) => alloc.plantName),
                              ),
                            ),
                          ].join(", ")
                        : "Not Set"}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Laydays</Label>
                    <p className="font-bold text-xl text-slate-800">
                      {vessel.laydays.start && vessel.laydays.end
                        ? `${new Date(vessel.laydays.start).toLocaleDateString()} - ${new Date(vessel.laydays.end).toLocaleDateString()}`
                        : "Not Set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderVesselForm = () => (
    <div className="w-full space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-bold text-blue-900">Add New Vessel</h2>
          <p className="text-slate-600 mt-3 text-xl">
            Create a comprehensive vessel record with detailed specifications
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={fillWithDemoData}
            className="bg-green-600 hover:bg-green-700 shadow-lg text-white px-8 py-4 text-lg rounded-xl transition-colors"
            size="lg"
          >
            <Zap className="h-6 w-6 mr-3" />
            Quick Fill Demo Data
          </Button>
          <Button
            onClick={() => setShowForm(false)}
            variant="outline"
            className="px-8 py-4 text-lg rounded-xl border-2 border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </div>

      {validationAlert && (
        <Alert className="border-2 border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-semibold">Missing Required Information</AlertTitle>
          <AlertDescription className="text-red-700 text-lg">{validationAlert}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-2xl border-0 rounded-2xl bg-white w-full">
        <CardContent className="p-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12 h-20 bg-slate-100 rounded-2xl p-2">
              <TabsTrigger
                value="general"
                className="flex items-center gap-3 text-lg px-6 py-4 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-colors"
              >
                <Ship className="h-6 w-6" />
                General Info
              </TabsTrigger>
              <TabsTrigger
                value="parcels"
                className="flex items-center gap-3 text-lg px-6 py-4 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-colors"
              >
                <Package className="h-6 w-6" />
                Parcel Form
              </TabsTrigger>
              <TabsTrigger
                value="costs"
                className="flex items-center gap-3 text-lg px-6 py-4 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-colors"
              >
                <Settings className="h-6 w-6" />
                Cost Parameters
              </TabsTrigger>
              <TabsTrigger
                value="rail"
                className="flex items-center gap-3 text-lg px-6 py-4 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-colors"
              >
                <Train className="h-6 w-6" />
                Rail Data
              </TabsTrigger>
            </TabsList>

            {/* General Info Tab */}
            <TabsContent value="general" className="space-y-12">
              {/* Vessel Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Ship className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800">Vessel Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label htmlFor="vesselName" className="text-lg font-semibold text-slate-700">
                      Vessel Name
                    </Label>
                    <Input
                      id="vesselName"
                      value={newVessel.name}
                      onChange={(e) => setNewVessel({ ...newVessel, name: e.target.value })}
                      placeholder="e.g., MV Ocean Star"
                      className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="capacity" className="text-lg font-semibold text-slate-700">
                      Capacity (MT)
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newVessel.capacity || ""}
                      onChange={(e) => setNewVessel({ ...newVessel, capacity: Number(e.target.value) })}
                      placeholder="e.g., 50000"
                      className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="eta" className="text-lg font-semibold text-slate-700">
                      ETA
                    </Label>
                    <Input
                      id="eta"
                      type="date"
                      value={newVessel.ETA}
                      onChange={(e) => setNewVessel({ ...newVessel, ETA: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="loadPort" className="text-lg font-semibold text-slate-700">
                      Load Port
                    </Label>
                    <Input
                      id="loadPort"
                      value={newVessel.loadPort}
                      onChange={(e) => setNewVessel({ ...newVessel, loadPort: e.target.value })}
                      placeholder="Enter load port name"
                      className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="laydaysStart" className="text-lg font-semibold text-slate-700">
                      Laydays Start
                    </Label>
                    <Input
                      id="laydaysStart"
                      type="date"
                      value={newVessel.laydays.start}
                      onChange={(e) =>
                        setNewVessel({
                          ...newVessel,
                          laydays: { ...newVessel.laydays, start: e.target.value },
                        })
                      }
                      className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="laydaysEnd" className="text-lg font-semibold text-slate-700">
                      Laydays End
                    </Label>
                    <Input
                      id="laydaysEnd"
                      type="date"
                      value={newVessel.laydays.end}
                      onChange={(e) =>
                        setNewVessel({
                          ...newVessel,
                          laydays: { ...newVessel.laydays, end: e.target.value },
                        })
                      }
                      min={newVessel.laydays.start}
                      className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Supplier Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800">Supplier Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label htmlFor="supplierName" className="text-lg font-semibold text-slate-700">
                      Supplier Name
                    </Label>
                    <Input
                      id="supplierName"
                      value={newVessel.supplier.name}
                      onChange={(e) =>
                        setNewVessel({
                          ...newVessel,
                          supplier: { ...newVessel.supplier, name: e.target.value },
                        })
                      }
                      placeholder="e.g., BHP Billiton"
                      className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="supplierCountry" className="text-lg font-semibold text-slate-700">
                      Supplier Country
                    </Label>
                    <Select
                      value={newVessel.supplier.country}
                      onValueChange={(value) =>
                        setNewVessel({
                          ...newVessel,
                          supplier: { ...newVessel.supplier, country: value },
                        })
                      }
                    >
                      <SelectTrigger className="h-14 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country} className="text-lg">
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-slate-200">
                <Button
                  onClick={goToPreviousTab}
                  disabled={activeTab === tabOrder[0]}
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                  size="lg"
                >
                  <ChevronLeft className="h-6 w-6 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={goToNextTab}
                  disabled={activeTab === tabOrder[tabOrder.length - 1]}
                  className="bg-blue-900 hover:bg-blue-800 px-8 py-4 text-lg rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  Next
                  <ChevronRight className="h-6 w-6 ml-2" />
                </Button>
              </div>
            </TabsContent>

            {/* Parcels Tab */}
            <TabsContent value="parcels" className="space-y-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800">Cargo Parcels</h3>
                </div>
                <Button
                  onClick={addParcel}
                  className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg rounded-xl shadow-lg transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Parcel
                </Button>
              </div>

              {newVessel.parcels.length === 0 ? (
                <Card className="shadow-xl border-0 rounded-2xl bg-white">
                  <CardContent className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-purple-600" />
                    </div>
                    <p className="text-slate-600 text-xl">No parcels added yet. Click Add Parcel to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {newVessel.parcels.map((parcel, index) => (
                    <Card key={parcel.id} className="shadow-xl border-0 rounded-2xl bg-white">
                      <CardHeader className="pb-6">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-2xl font-bold text-slate-800">Parcel {index + 1}</CardTitle>
                          <Button
                            onClick={() => removeParcel(parcel.id)}
                            variant="outline"
                            size="default"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl border-2 border-red-200 hover:border-red-300 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-slate-700">Parcel Size (MT)</Label>
                            <Input
                              type="number"
                              value={parcel.size || ""}
                              onChange={(e) => updateParcel(parcel.id, "size", Number(e.target.value))}
                              placeholder="e.g., 25000"
                              className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-slate-700">Load Port</Label>
                            <Input
                              value={parcel.loadPort || ""}
                              onChange={(e) => updateParcel(parcel.id, "loadPort", e.target.value)}
                              placeholder="Enter load port name"
                              className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-slate-700">Material Type</Label>
                            <Select
                              value={parcel.materialType}
                              onValueChange={(value) => handleMaterialTypeChange(parcel.id, value)}
                            >
                              <SelectTrigger className="h-14 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors">
                                <SelectValue placeholder="Select material type" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {materialTypes.map((type) => (
                                  <SelectItem key={type} value={type} className="text-lg">
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-slate-700">Quality Grade</Label>
                            <Select
                              value={parcel.qualityGrade}
                              onValueChange={(value) => handleQualityGradeChange(parcel.id, value)}
                              disabled={!parcel.materialType}
                            >
                              <SelectTrigger className="h-14 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors">
                                <SelectValue placeholder="Select quality grade" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {parcel.materialType &&
                                  getGrades(parcel.materialType).map((grade) => (
                                    <SelectItem key={grade} value={grade} className="text-lg">
                                      {grade}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-4 md:col-span-2">
                            <Label className="text-lg font-semibold text-slate-700">Quality Specifications</Label>
                            <Input
                              value={parcel.qualitySpecs}
                              placeholder="Auto-populated based on quality grade"
                              readOnly
                              className="bg-slate-100 h-14 text-lg border-2 border-slate-200 rounded-xl"
                            />
                          </div>
                        </div>

                        <Separator className="my-8" />

                        <div className="space-y-8">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-2xl text-slate-800">Plant Allocations</h4>
                            <Button
                              onClick={() => addPlantAllocation(parcel.id)}
                              variant="outline"
                              className="px-6 py-3 text-lg rounded-xl border-2 border-green-300 bg-green-100 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100 hover:border-green-400 hover:bg-green-200 hover:text-green-900 dark:hover:bg-green-800 dark:hover:border-green-600 dark:hover:text-green-50 shadow-md hover:shadow-lg transition-all duration-200 group"
                            >
                              <Plus className="h-5 w-5 mr-2 text-green-800 group-hover:text-green-900 dark:text-green-100 dark:group-hover:text-green-50 group-hover:scale-110 transition-transform" />
                              Add Plant
                            </Button>
                          </div>

                          {parcel.plantAllocations.length === 0 ? (
                            <p className="text-slate-600 text-xl py-8 text-center">No plant allocations added yet.</p>
                          ) : (
                            <div className="space-y-6">
                              {parcel.plantAllocations.map((allocation, allocationIndex) => (
                                <Card key={allocationIndex} className="bg-slate-50 border-0 rounded-xl shadow-md">
                                  <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                      <div className="space-y-4">
                                        <Label className="text-lg font-semibold text-slate-700">Plant Name</Label>
                                        <Select
                                          value={allocation.plantName}
                                          onValueChange={(value) =>
                                            updatePlantAllocation(parcel.id, allocationIndex, "plantName", value)
                                          }
                                        >
                                          <SelectTrigger className="h-14 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors">
                                            <SelectValue placeholder="Select plant" />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-xl">
                                            {plants.map((plant) => (
                                              <SelectItem key={plant} value={plant} className="text-lg">
                                                {plant}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-4">
                                        <Label className="text-lg font-semibold text-slate-700">
                                          Required Quantity (MT)
                                        </Label>
                                        <Input
                                          type="number"
                                          value={allocation.requiredQuantity || ""}
                                          onChange={(e) =>
                                            updatePlantAllocation(
                                              parcel.id,
                                              allocationIndex,
                                              "requiredQuantity",
                                              Number(e.target.value),
                                            )
                                          }
                                          placeholder="MT"
                                          className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                                        />
                                      </div>
                                      <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                          <Label className="text-lg font-semibold text-slate-700">
                                            Stock Availability (MT)
                                          </Label>
                                          <Button
                                            onClick={() => removePlantAllocation(parcel.id, allocationIndex)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-auto p-2 rounded-lg transition-colors"
                                          >
                                            <Trash2 className="h-5 w-5" />
                                          </Button>
                                        </div>
                                        <Input
                                          type="number"
                                          value={allocation.plantStockAvailability || ""}
                                          onChange={(e) =>
                                            updatePlantAllocation(
                                              parcel.id,
                                              allocationIndex,
                                              "plantStockAvailability",
                                              Number(e.target.value),
                                            )
                                          }
                                          placeholder="MT"
                                          className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Port Preferences Section */}
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                      <Anchor className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">Port Preferences</h3>
                  </div>
                  <Button
                    onClick={addPortPreference}
                    variant="outline"
                    className="px-8 py-4 text-lg rounded-xl border-2 border-teal-300 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:border-teal-700 dark:text-teal-100 hover:border-teal-400 hover:bg-teal-200 hover:text-teal-900 dark:hover:bg-teal-800 dark:hover:border-teal-600 dark:hover:text-teal-50 shadow-md hover:shadow-lg transition-all duration-200 group"
                  >
                    <Plus className="h-5 w-5 mr-2 text-teal-800 group-hover:text-teal-900 dark:text-teal-100 dark:group-hover:text-teal-50 group-hover:scale-110 transition-transform" />
                    Add Port Preference
                  </Button>
                </div>

                {newVessel.portPreferences.length === 0 ? (
                  <Card className="shadow-xl border-0 rounded-2xl bg-white">
                    <CardContent className="text-center py-20">
                      <div className="w-20 h-20 mx-auto mb-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <Anchor className="h-10 w-10 text-teal-600" />
                      </div>
                      <p className="text-slate-600 text-xl">
                        No port preferences added yet. Click Add Port Preference to get started.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {newVessel.portPreferences.map((preference, index) => (
                      <Card key={index} className="shadow-xl border-0 rounded-2xl bg-white">
                        <CardHeader className="pb-6">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-bold text-slate-800">
                              Port Preference {index + 1}
                            </CardTitle>
                            <Button
                              onClick={() => removePortPreference(index)}
                              variant="outline"
                              size="default"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl border-2 border-red-200 hover:border-red-300 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <Label className="text-lg font-semibold text-slate-700">Port Name</Label>
                              <Select
                                value={preference.portName}
                                onValueChange={(value) => updatePortPreference(index, "portName", value)}
                              >
                                <SelectTrigger className="h-14 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors">
                                  <SelectValue placeholder="Select port" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {portNames.map((port) => (
                                    <SelectItem key={port} value={port} className="text-lg">
                                      {port}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-4">
                              <Label className="text-lg font-semibold text-slate-700">
                                Port Stock Availability (MT)
                              </Label>
                              <Input
                                type="number"
                                value={preference.portStockAvailability || ""}
                                onChange={(e) =>
                                  updatePortPreference(index, "portStockAvailability", Number(e.target.value))
                                }
                                placeholder="Enter stock availability in MT"
                                className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                              <Checkbox
                                id={`sequential-${index}`}
                                checked={preference.sequentialDischarge}
                                onCheckedChange={(checked) =>
                                  updatePortPreference(index, "sequentialDischarge", checked as boolean)
                                }
                                className="w-6 h-6"
                              />
                              <Label htmlFor={`sequential-${index}`} className="text-lg font-semibold text-slate-700">
                                Sequential Discharge
                              </Label>
                            </div>
                          </div>

                          {preference.sequentialDischarge && (
                            <div className="space-y-6">
                              <Label className="text-lg font-bold text-slate-800">Discharge Order</Label>
                              <div className="space-y-4">
                                {preference.dischargeOrder.map((port, orderIndex) => (
                                  <div key={orderIndex} className="flex items-center space-x-4">
                                    <span className="text-lg text-slate-600 w-10 font-semibold">{orderIndex + 1}.</span>
                                    <Select
                                      value={port}
                                      onValueChange={(value) => {
                                        const newOrder = [...preference.dischargeOrder]
                                        newOrder[orderIndex] = value
                                        updatePortPreference(index, "dischargeOrder", newOrder)
                                      }}
                                    >
                                      <SelectTrigger className="flex-1 h-14 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors">
                                        <SelectValue placeholder="Select port" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-xl">
                                        {portNames.map((portName) => (
                                          <SelectItem key={portName} value={portName} className="text-lg">
                                            {portName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      onClick={() => {
                                        const newOrder = preference.dischargeOrder.filter((_, i) => i !== orderIndex)
                                        updatePortPreference(index, "dischargeOrder", newOrder)
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl border-2 border-red-200 hover:border-red-300 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  onClick={() => {
                                    const newOrder = [...preference.dischargeOrder, ""]
                                    updatePortPreference(index, "dischargeOrder", newOrder)
                                  }}
                                  variant="outline"
                                  className="px-6 py-3 text-lg rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                  <Plus className="h-5 w-5 mr-2" />
                                  Add Port to Order
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="flex justify-between pt-8 border-t border-slate-200">
                  <Button
                    onClick={goToPreviousTab}
                    disabled={activeTab === tabOrder[0]}
                    variant="outline"
                    className="px-8 py-4 text-lg rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                    size="lg"
                  >
                    <ChevronLeft className="h-6 w-6 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={goToNextTab}
                    disabled={activeTab === tabOrder[tabOrder.length - 1]}
                    className="bg-blue-900 hover:bg-blue-800 px-8 py-4 text-lg rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    Next
                    <ChevronRight className="h-6 w-6 ml-2" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Cost Parameters Tab */}
            <TabsContent value="costs" className="space-y-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800">Cost Parameters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Fringe Ocean</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.fringeOcean || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        costParameters: { ...newVessel.costParameters, fringeOcean: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter fringe ocean cost"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Fringe Rail</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.fringeRail || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        costParameters: { ...newVessel.costParameters, fringeRail: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter fringe rail cost"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Demurrage Rate</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.demurrageRate || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        costParameters: { ...newVessel.costParameters, demurrageRate: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter demurrage rate"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Max Port Calls</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.maxPortCalls || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        costParameters: { ...newVessel.costParameters, maxPortCalls: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter maximum port calls"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Port Handling Fees</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.portHandlingFees || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        costParameters: { ...newVessel.costParameters, portHandlingFees: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter port handling fees"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Storage Cost</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.storageCost || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        costParameters: { ...newVessel.costParameters, storageCost: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter storage cost"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Free Time (Days)</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.freeTime || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        costParameters: { ...newVessel.costParameters, freeTime: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter free time in days"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Port Differential Cost</Label>
                  <Input
                    type="number"
                    value={newVessel.costParameters.portDifferentialCost || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        costParameters: { ...newVessel.costParameters, portDifferentialCost: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter port differential cost"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-slate-200">
                <Button
                  onClick={goToPreviousTab}
                  disabled={activeTab === tabOrder[0]}
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                  size="lg"
                >
                  <ChevronLeft className="h-6 w-6 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={goToNextTab}
                  disabled={activeTab === tabOrder[tabOrder.length - 1]}
                  className="bg-blue-900 hover:bg-blue-800 px-8 py-4 text-lg rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  Next
                  <ChevronRight className="h-6 w-6 ml-2" />
                </Button>
              </div>
            </TabsContent>

            {/* Rail Data Tab */}
            <TabsContent value="rail" className="space-y-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <Train className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800">Rail Data</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Rake Capacity (MT)</Label>
                  <Input
                    type="number"
                    value={newVessel.railData.rakeCapacity || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        railData: { ...newVessel.railData, rakeCapacity: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter rake capacity in MT"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Loading Time Per Day (Hours)</Label>
                  <Input
                    type="number"
                    value={newVessel.railData.loadingTimePerDay || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        railData: { ...newVessel.railData, loadingTimePerDay: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter loading time per day"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-slate-700">Number of Rakes Required</Label>
                  <Input
                    type="number"
                    value={newVessel.railData.numberOfRakesRequired || ""}
                    onChange={(e) =>
                      setNewVessel({
                        ...newVessel,
                        railData: { ...newVessel.railData, numberOfRakesRequired: Number(e.target.value) },
                      })
                    }
                    placeholder="Enter number of rakes required"
                    className="h-14 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex items-center space-x-4 pt-8">
                  <Checkbox
                    id="rakeAvailability"
                    checked={newVessel.railData.availability}
                    onCheckedChange={(checked) =>
                      setNewVessel({
                        ...newVessel,
                        railData: { ...newVessel.railData, availability: checked as boolean },
                      })
                    }
                    className="w-6 h-6"
                  />
                  <Label htmlFor="rakeAvailability" className="text-lg font-semibold text-slate-700">
                    Rake Availability
                  </Label>
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-slate-200">
                <Button
                  onClick={goToPreviousTab}
                  disabled={activeTab === tabOrder[0]}
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                  size="lg"
                >
                  <ChevronLeft className="h-6 w-6 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={goToNextTab}
                  disabled={activeTab === tabOrder[tabOrder.length - 1]}
                  className="bg-blue-900 hover:bg-blue-800 px-8 py-4 text-lg rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  Next
                  <ChevronRight className="h-6 w-6 ml-2" />
                </Button>
              </div>
            </TabsContent>

            <div className="flex justify-end pt-10 border-t border-slate-200">
              <Button
                onClick={submitVessel}
                disabled={loading}
                className="bg-blue-900 hover:bg-blue-800 px-12 py-4 text-lg rounded-xl shadow-xl transition-colors"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Creating Vessel...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6 mr-3" />
                    Create Vessel
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )

  // Navigation between tabs
  const goToNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  const goToPreviousTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="w-full max-w-none mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border-0 mb-10 overflow-hidden w-full">
          <div className="bg-blue-900 px-10 py-8">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Ship className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Vessel Management System</h1>
                <p className="text-xl text-blue-100 mt-2">
                  Create and manage vessel data with comprehensive form validation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-10 p-6 rounded-2xl flex items-center text-lg shadow-lg w-full ${
              message.type === "success"
                ? "bg-green-50 border-2 border-green-200 text-green-800"
                : "bg-red-50 border-2 border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-7 w-7 mr-4 flex-shrink-0" />
            ) : (
              <XCircle className="h-7 w-7 mr-4 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border-0 w-full">
          <div className="p-10 w-full">{showForm ? renderVesselForm() : renderVesselsList()}</div>
        </div>
      </div>
      <CSVUploadModal />
    </div>
  )
}

export default VesselManager
