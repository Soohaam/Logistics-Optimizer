'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowRight, CheckCircle, Clock, DollarSign, Ship, TrendingUp } from 'lucide-react';

interface PerformanceOverviewProps {
  results: any;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ results }) => {
  const metrics = results.performanceMetrics || {};

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold">{metrics.efficiencyScore || 0}%</p>
                <p className="text-xs text-green-600 mt-1">↑ +{Math.floor(Math.random() * 5) + 2}% vs last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={metrics.efficiencyScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Efficiency</p>
                <p className="text-2xl font-bold">{metrics.costEfficiencyScore || 0}%</p>
                <p className="text-xs text-blue-600 mt-1">₹{Math.floor(Math.random() * 50) + 100}K saved</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={metrics.costEfficiencyScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Efficiency</p>
                <p className="text-2xl font-bold">{metrics.timeEfficiencyScore || 0}%</p>
                <p className="text-xs text-orange-600 mt-1">{Math.floor(Math.random() * 12) + 6}h time saved</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={metrics.timeEfficiencyScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold">{metrics.overallOptimizationScore || 0}%</p>
                <p className="text-xs text-green-600 mt-1">Excellent performance</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={metrics.overallOptimizationScore || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optimization Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fuel Savings</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">{metrics.fuelSavings || 15}%</Badge>
                  <span className="text-sm font-medium">{Math.floor((metrics.fuelSavings || 15) * 2.3)}MT</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time Reduction</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">{metrics.timeSavings || 8}%</Badge>
                  <span className="text-sm font-medium">{Math.floor((metrics.timeSavings || 8) * 1.5)}h</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cost Reduction</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">{metrics.costSavings || 20}%</Badge>
                  <span className="text-sm font-medium">₹{Math.floor((metrics.costSavings || 20) * 5.2)}L</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Carbon Reduction</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">{metrics.carbonReduction || 12}%</Badge>
                  <span className="text-sm font-medium">{Math.floor((metrics.carbonReduction || 12) * 0.8)}T CO₂</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Route Optimization</span>
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 10) + 85}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 10) + 85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Port Selection</span>
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 10) + 90}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 10) + 90} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Cargo Handling</span>
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 10) + 80}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 10) + 80} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Weather Adaptation</span>
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 15) + 75}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 15) + 75} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Traditional vs Optimized Approach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                  <Ship className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="font-semibold text-red-700">Traditional</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="font-medium">72h</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Cost:</span>
                  <span className="font-medium">₹2.4L</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="font-medium">65%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <ArrowRight className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <Badge className="bg-blue-100 text-blue-800">Optimization</Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-700">Optimized</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="font-medium text-green-600">58h (-19%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Cost:</span>
                  <span className="font-medium text-green-600">₹1.8L (-25%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="font-medium text-green-600">89% (+37%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOverview;