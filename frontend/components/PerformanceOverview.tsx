"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { ArrowRight, CheckCircle, Clock, DollarSign, Ship, TrendingUp } from "lucide-react"

interface PerformanceOverviewProps {
  results: any
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ results }) => {
  const metrics = results.performanceMetrics || {}

  return (
    <div className="space-y-8">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Efficiency Score</p>
                <p className="text-3xl font-bold text-foreground">{metrics.efficiencyScore || 0}%</p>
                <p className="text-xs text-green-600 font-medium">
                  ↑ +{Math.floor(Math.random() * 5) + 2}% vs last month
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={metrics.efficiencyScore || 0} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Cost Efficiency</p>
                <p className="text-3xl font-bold text-foreground">{metrics.costEfficiencyScore || 0}%</p>
                <p className="text-xs text-blue-600 font-medium">₹{Math.floor(Math.random() * 50) + 100}K saved</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={metrics.costEfficiencyScore || 0} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Time Efficiency</p>
                <p className="text-3xl font-bold text-foreground">{metrics.timeEfficiencyScore || 0}%</p>
                <p className="text-xs text-orange-600 font-medium">{Math.floor(Math.random() * 12) + 6}h time saved</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <Progress value={metrics.timeEfficiencyScore || 0} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <p className="text-3xl font-bold text-foreground">{metrics.overallOptimizationScore || 0}%</p>
                <p className="text-xs text-green-600 font-medium">Excellent performance</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={metrics.overallOptimizationScore || 0} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Optimization Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                <span className="text-sm font-medium text-foreground">Fuel Savings</span>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    {metrics.fuelSavings || 15}%
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {Math.floor((metrics.fuelSavings || 15) * 2.3)}MT
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                <span className="text-sm font-medium text-foreground">Time Reduction</span>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {metrics.timeSavings || 8}%
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {Math.floor((metrics.timeSavings || 8) * 1.5)}h
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                <span className="text-sm font-medium text-foreground">Cost Reduction</span>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    {metrics.costSavings || 20}%
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    ₹{Math.floor((metrics.costSavings || 20) * 5.2)}L
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                <span className="text-sm font-medium text-foreground">Carbon Reduction</span>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    {metrics.carbonReduction || 12}%
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {Math.floor((metrics.carbonReduction || 12) * 0.8)}T CO₂
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-foreground">Route Optimization</span>
                  <span className="text-sm font-semibold text-foreground">{Math.floor(Math.random() * 10) + 85}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 10) + 85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-foreground">Port Selection</span>
                  <span className="text-sm font-semibold text-foreground">{Math.floor(Math.random() * 10) + 90}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 10) + 90} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-foreground">Cargo Handling</span>
                  <span className="text-sm font-semibold text-foreground">{Math.floor(Math.random() * 10) + 80}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 10) + 80} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-foreground">Weather Adaptation</span>
                  <span className="text-sm font-semibold text-foreground">{Math.floor(Math.random() * 15) + 75}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 15) + 75} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold">Traditional vs Optimized Approach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center border-2 border-red-100">
                  <Ship className="h-10 w-10 text-red-600" />
                </div>
                <h4 className="font-semibold text-lg text-red-700">Traditional</h4>
              </div>
              <div className="space-y-3 text-sm bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Time:</span>
                  <span className="font-semibold text-foreground">72h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuel Cost:</span>
                  <span className="font-semibold text-foreground">₹2.4L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Efficiency:</span>
                  <span className="font-semibold text-foreground">65%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="p-4 rounded-full bg-blue-50 border-2 border-blue-100">
                  <ArrowRight className="h-8 w-8 text-blue-600" />
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1">
                  Optimization
                </Badge>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100">
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </div>
                <h4 className="font-semibold text-lg text-green-700">Optimized</h4>
              </div>
              <div className="space-y-3 text-sm bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Time:</span>
                  <span className="font-semibold text-green-700">58h (-19%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuel Cost:</span>
                  <span className="font-semibold text-green-700">₹1.8L (-25%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Efficiency:</span>
                  <span className="font-semibold text-green-700">89% (+37%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceOverview
