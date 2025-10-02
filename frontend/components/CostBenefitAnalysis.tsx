"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { DollarSign, TrendingDown, TrendingUp, Clock, Fuel, Ship } from "lucide-react"

interface CostBenefitAnalysisProps {
  costData: any
  vesselId?: string
}

const CostBenefitAnalysis: React.FC<CostBenefitAnalysisProps> = ({ costData }) => {
  if (!costData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No cost benefit data available</p>
      </div>
    )
  }

  const traditional = costData.traditional || {}
  const optimized = costData.optimized || {}
  const savings = costData.savings || {}

  const savingsPercentage = savings.percentageSavings || 0
  const timeSaved = savings.timeSavings || 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-fit p-3 bg-green-100 rounded-full mb-3">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-700 mb-1">
                ₹{((savings.costSavings || 0) / 100000).toFixed(1)}L
              </div>
              <p className="text-sm text-green-600 font-medium mb-2">Total Savings</p>
              <Badge className="bg-green-600 text-white">
                {savingsPercentage}% reduction
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-fit p-3 bg-blue-100 rounded-full mb-3">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-1">{timeSaved}h</div>
              <p className="text-sm text-blue-600 font-medium mb-2">Time Saved</p>
              <Badge className="bg-blue-600 text-white">
                {traditional.timeRequired ? Math.round((timeSaved / traditional.timeRequired) * 100) : 0}% faster
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-fit p-3 bg-purple-100 rounded-full mb-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-1">
                {savings.co2ReductionTonnes || 0}T
              </div>
              <p className="text-sm text-purple-600 font-medium mb-2">CO₂ Reduced</p>
              <Badge className="bg-purple-600 text-white">
                Environmental impact
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional Approach */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-red-800">
              <div className="p-2 bg-red-100 rounded-lg">
                <Ship className="h-5 w-5 text-red-600" />
              </div>
              Traditional Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-red-700">Total Cost</span>
                  <span className="text-2xl font-bold text-red-900">
                    ₹{((traditional.totalCost || 0) / 100000).toFixed(1)}L
                  </span>
                </div>
                <p className="text-xs text-red-600">Without optimization</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100">
                  <span className="text-sm text-red-700">Time Required</span>
                  <span className="font-semibold text-red-900">{traditional.timeRequired || 0}h</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100">
                  <span className="text-sm text-red-700">Fuel Cost</span>
                  <span className="font-semibold text-red-900">
                    ₹{((traditional.fuelCost || 0) / 100000).toFixed(1)}L
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100">
                  <span className="text-sm text-red-700">Port Charges</span>
                  <span className="font-semibold text-red-900">
                    ₹{((traditional.portCharges || 0) / 100000).toFixed(1)}L
                  </span>
                </div>
                {traditional.demurrageCost && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100">
                    <span className="text-sm text-red-700">Demurrage Cost</span>
                    <span className="font-semibold text-red-900">
                      ₹{((traditional.demurrageCost || 0) / 100000).toFixed(1)}L
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">Efficiency</span>
                  <Badge className="bg-red-200 text-red-800">65-70%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimized Approach */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-green-800">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              Optimized Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-700">Total Cost</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-900">
                      ₹{((optimized.totalCost || 0) / 100000).toFixed(1)}L
                    </span>
                    <p className="text-xs text-green-600 mt-1">
                      -₹{((savings.costSavings || 0) / 100000).toFixed(1)}L saved
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                  <span className="text-sm text-green-700">Time Required</span>
                  <div className="text-right">
                    <span className="font-semibold text-green-900">{optimized.timeRequired || 0}h</span>
                    <p className="text-xs text-green-600">-{timeSaved}h</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                  <span className="text-sm text-green-700">Fuel Cost</span>
                  <div className="text-right">
                    <span className="font-semibold text-green-900">
                      ₹{((optimized.fuelCost || 0) / 100000).toFixed(1)}L
                    </span>
                    <p className="text-xs text-green-600">
                      -{Math.round(((traditional.fuelCost - optimized.fuelCost) / traditional.fuelCost) * 100)}%
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                  <span className="text-sm text-green-700">Port Charges</span>
                  <div className="text-right">
                    <span className="font-semibold text-green-900">
                      ₹{((optimized.portCharges || 0) / 100000).toFixed(1)}L
                    </span>
                    <p className="text-xs text-green-600">
                      -{Math.round(((traditional.portCharges - optimized.portCharges) / traditional.portCharges) * 100)}%
                    </p>
                  </div>
                </div>
                {optimized.demurrageCost && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-100">
                    <span className="text-sm text-green-700">Demurrage Cost</span>
                    <div className="text-right">
                      <span className="font-semibold text-green-900">
                        ₹{((optimized.demurrageCost || 0) / 100000).toFixed(1)}L
                      </span>
                      <p className="text-xs text-green-600">Reduced</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Efficiency</span>
                  <Badge className="bg-green-600 text-white">85-90%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Analysis */}
      <Card className="border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Return on Investment Analysis</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Financial impact of optimization over traditional methods
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {(savings.costSavings / optimized.totalCost).toFixed(1)}x
              </div>
              <p className="text-sm text-blue-600 font-medium">ROI Multiple</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-700 mb-1">
                {Math.round((optimized.totalCost / savings.costSavings) * 30)} days
              </div>
              <p className="text-sm text-green-600 font-medium">Payback Period</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-700 mb-1">
                ₹{((savings.costSavings * 12) / 100000).toFixed(1)}L
              </div>
              <p className="text-sm text-purple-600 font-medium">Annual Savings</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Fuel className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-700 mb-1">
                {savingsPercentage}%
              </div>
              <p className="text-sm text-orange-600 font-medium">Cost Reduction</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Breakdown */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Savings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Fuel className="h-5 w-5 text-green-600" />
                <span className="font-medium">Fuel Cost Savings</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                ₹{((traditional.fuelCost - optimized.fuelCost) / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Ship className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Port Charges Savings</span>
              </div>
              <span className="text-lg font-bold text-blue-700">
                ₹{((traditional.portCharges - optimized.portCharges) / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Time Efficiency Value</span>
              </div>
              <span className="text-lg font-bold text-purple-700">
                {timeSaved}h saved
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <span className="font-medium">CO₂ Emission Reduction</span>
              </div>
              <span className="text-lg font-bold text-orange-700">
                {savings.co2ReductionTonnes || 0}T CO₂
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CostBenefitAnalysis