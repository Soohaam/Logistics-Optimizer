import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { RefreshCw, TrendingUp, AlertTriangle, Clock, IndianRupee, Truck, BarChart3, Ship, Target, Zap, CheckCircle2, ArrowRight, Package, MapPin, Calendar, Users, Activity, Gauge } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';

interface PortToPlantAnalysis {
  _id: string;
  vesselId: string;
  vesselName: string;
  analysisData: {
    railTransportationAnalysis: {
      totalCargoVolume: number;
      estimatedTransitDays: number;
      rakeUtilizationEfficiency: number;
      loadingDaysRequired: number;
      routeEfficiencyScore: number;
    };
    costBreakdown: {
      totalRailTransportCost: number;
      fringeRailCost: number;
      demurrageCost: number;
      portHandlingCost: number;
      storageCost: number;
      totalCostPerTonne: number;
      costDistribution: {
        railTransport: number;
        portHandling: number;
        storage: number;
        demurrage: number;
      };
    };
    rakeAnalysis: {
      totalRakesRequired: number;
      rakeCapacity: number;
      availabilityStatus: boolean;
      utilizationByTrip: Array<{
        tripNumber: number;
        utilization: number;
      }>;
      loadingEfficiency: number;
    };
    plantDistributionAnalysis: {
      plantAllocations: Array<{
        plantName: string;
        allocatedQuantity: number;
        stockAvailability: number;
        shortfallQuantity: number;
        allocationPercentage: number;
        priorityLevel: string;
        estimatedDeliveryDays: number;
      }>;
      totalShortfall: number;
      allocationEfficiency: number;
    };
    timelineAnalysis: {
      loadingPhase: {
        startDate: string;
        estimatedDuration: number;
        endDate: string;
      };
      transitPhase: {
        estimatedDuration: number;
        milestones: Array<{
          plantName: string;
          estimatedArrival: string;
          status: string;
        }>;
      };
    };
    performanceMetrics: {
      deliveryReliabilityScore: number;
      costEfficiencyScore: number;
      timeEfficiencyScore: number;
      overallPerformanceScore: number;
    };
    riskAssessment: {
      riskLevel: string;
      riskFactors: Array<{
        factor: string;
        severity: number;
        probability: number;
      }>;
      mitigationStrategies: string[];
    };
    optimizationRecommendations: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
      potentialSavings: number;
    };
  };
  inputDataSnapshot: {
    vesselCapacity: number;
    loadPort: string;
    totalParcels: number;
    railAvailability: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface PortToPlantProps {
  vesselId: string;
  onLoadComplete: () => void;
}

const PortToPlant: React.FC<PortToPlantProps> = ({ vesselId, onLoadComplete }) => {
  const [analysisData, setAnalysisData] = useState<PortToPlantAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchAnalysisData = async (isRegenerate = false) => {
    if (!vesselId) return;

    try {
      setLoading(true);
      setError(null);
      
      const endpoint = isRegenerate 
        ? `http://localhost:5000/api/port-to-plant/vessel/${vesselId}/regenerate`
        : `http://localhost:5000/api/port-to-plant/vessel/${vesselId}`;
      
      const method = isRegenerate ? 'POST' : 'GET';
      
      const response = await fetch(endpoint, { method });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analysis data');
      }

      setAnalysisData(data.data);
      
      if (onLoadComplete) {
        onLoadComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await fetchAnalysisData(true);
  };

  useEffect(() => {
    fetchAnalysisData();
  }, [vesselId, onLoadComplete]);

  // Enhanced color schemes for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const RISK_COLORS = { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' };

  // Prepare data for visualizations
  const prepareCostDistributionData = (costDistribution: any) => [
    { name: 'Rail Transport', value: costDistribution.railTransport, color: '#3B82F6' },
    { name: 'Port Handling', value: costDistribution.portHandling, color: '#10B981' },
    { name: 'Storage', value: costDistribution.storage, color: '#F59E0B' },
    { name: 'Demurrage', value: costDistribution.demurrage, color: '#EF4444' }
  ];

  const preparePerformanceData = (metrics: any) => [
    { name: 'Delivery Reliability', value: metrics.deliveryReliabilityScore },
    { name: 'Cost Efficiency', value: metrics.costEfficiencyScore },
    { name: 'Time Efficiency', value: metrics.timeEfficiencyScore }
  ];

  const prepareRiskMatrix = (riskFactors: any[]) => 
    riskFactors.map((risk, index) => ({
      name: risk.factor.substring(0, 20) + '...',
      severity: risk.severity,
      probability: risk.probability,
      size: risk.severity * risk.probability * 10
    }));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                <Ship className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">Generating AI Analysis</h3>
                <p className="text-muted-foreground">Processing port-to-plant logistics data...</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Card className="w-full max-w-md border-destructive/20 shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">Analysis Failed</h3>
                <p className="text-destructive text-sm">{error}</p>
              </div>
              <Button onClick={() => fetchAnalysisData()} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <Card className="min-h-[40vh] flex items-center justify-center">
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const { analysisData: analysis } = analysisData;

  return (
    <div className="space-y-8 p-1">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Ship className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {analysisData.vesselName}
                  </CardTitle>
                  <p className="text-muted-foreground font-medium">Port-to-Plant Logistics Analysis</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  AI-Powered Analysis
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated {new Date(analysisData.updatedAt).toLocaleString()}
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Target className="h-3 w-3" />
                  Vessel ID: {analysisData.vesselId}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={handleRegenerate} 
              variant="outline" 
              disabled={regenerating}
              className="self-start lg:self-center hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerating...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Performance Score
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {analysis.performanceMetrics.overallPerformanceScore}%
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-700" 
                style={{ width: `${analysis.performanceMetrics.overallPerformanceScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground font-medium">AI Performance Analysis</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Total Cargo
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {analysis.railTransportationAnalysis.totalCargoVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Metric Tons • {analysis.rakeAnalysis.totalRakesRequired} Rakes Required
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Transit Timeline
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {analysis.railTransportationAnalysis.estimatedTransitDays}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Days Est. • {analysis.railTransportationAnalysis.loadingDaysRequired} Loading Days
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Cost Per Tonne
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
              <IndianRupee className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              ₹{(analysis.costBreakdown.totalCostPerTonne).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Transportation Cost • Optimized Rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Cost Analysis */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-green-50">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
            Financial Breakdown Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-foreground">Cost Distribution</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareCostDistributionData(analysis.costBreakdown.costDistribution)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {prepareCostDistributionData(analysis.costBreakdown.costDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-semibold text-lg text-foreground">Detailed Cost Breakdown</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">Rail Transport</span>
                  </div>
                  <span className="font-bold text-lg">₹{(analysis.costBreakdown.totalRailTransportCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">Port Handling</span>
                  </div>
                  <span className="font-bold text-lg">₹{(analysis.costBreakdown.portHandlingCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="font-medium">Storage</span>
                  </div>
                  <span className="font-bold text-lg">₹{(analysis.costBreakdown.storageCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium">Demurrage</span>
                  </div>
                  <span className="font-bold text-lg">₹{(analysis.costBreakdown.demurrageCost).toLocaleString()}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center p-4 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="font-semibold text-lg">Total Cost</span>
                  <span className="font-bold text-2xl text-primary">₹{((
                    analysis.costBreakdown.totalRailTransportCost + 
                    analysis.costBreakdown.portHandlingCost + 
                    analysis.costBreakdown.storageCost + 
                    analysis.costBreakdown.demurrageCost
                  )).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Plant Distribution */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-purple-50">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            Plant Allocation & Distribution Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Visual Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Allocation Efficiency</p>
                      <p className="text-2xl font-bold text-green-700">
                        {analysis.plantDistributionAnalysis.allocationEfficiency}%
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-green-100">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Plants</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {analysis.plantDistributionAnalysis.plantAllocations.length}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-2 ${analysis.plantDistributionAnalysis.totalShortfall > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${analysis.plantDistributionAnalysis.totalShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Shortfall Status
                      </p>
                      <p className={`text-2xl font-bold ${analysis.plantDistributionAnalysis.totalShortfall > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {analysis.plantDistributionAnalysis.totalShortfall > 0 
                          ? `${analysis.plantDistributionAnalysis.totalShortfall.toLocaleString()} MT`
                          : 'None'
                        }
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${analysis.plantDistributionAnalysis.totalShortfall > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                      {analysis.plantDistributionAnalysis.totalShortfall > 0 ? (
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      ) : (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Individual Plant Cards with Visual Improvements */}
            {analysis.plantDistributionAnalysis.plantAllocations.map((plant, index) => (
              <div key={index} className="p-6 border rounded-xl hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-slate-50 to-slate-50/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-white shadow-sm">
                      <Package className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{plant.plantName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={
                            plant.priorityLevel === 'High' ? 'destructive' : 
                            plant.priorityLevel === 'Medium' ? 'default' : 
                            'secondary'
                          } 
                          className="gap-1"
                        >
                          <ArrowRight className="h-3 w-3" />
                          {plant.priorityLevel} Priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Circular Progress Indicator */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: plant.allocationPercentage }]}>
                          <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{plant.allocationPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Visual Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-blue-600 font-medium uppercase">Allocated</p>
                    </div>
                    <p className="font-bold text-lg text-blue-800">{plant.allocatedQuantity.toLocaleString()}</p>
                    <p className="text-xs text-blue-600">MT</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-green-600 font-medium uppercase">Available</p>
                    </div>
                    <p className="font-bold text-lg text-green-800">{plant.stockAvailability.toLocaleString()}</p>
                    <p className="text-xs text-green-600">MT</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${plant.shortfallQuantity > 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-green-50 to-green-100 border-green-200'} border`}>
                    <div className="flex items-center gap-2 mb-1">
                      {plant.shortfallQuantity > 0 ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      <p className={`text-xs font-medium uppercase ${plant.shortfallQuantity > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Shortfall
                      </p>
                    </div>
                    <p className={`font-bold text-lg ${plant.shortfallQuantity > 0 ? 'text-red-800' : 'text-green-800'}`}>
                      {plant.shortfallQuantity > 0 ? plant.shortfallQuantity.toLocaleString() : '0'}
                    </p>
                    <p className={`text-xs ${plant.shortfallQuantity > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {plant.shortfallQuantity > 0 ? 'MT' : 'None'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <p className="text-xs text-purple-600 font-medium uppercase">Delivery</p>
                    </div>
                    <p className="font-bold text-lg text-purple-800">{plant.estimatedDeliveryDays}</p>
                    <p className="text-xs text-purple-600">Days</p>
                  </div>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Allocation Progress</span>
                    <span className="font-bold">{plant.allocationPercentage}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-1000 relative overflow-hidden" 
                      style={{ width: `${plant.allocationPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Performance Metrics */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-blue-50">
              <Gauge className="h-5 w-5 text-blue-600" />
            </div>
            Performance & Efficiency Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-foreground">Performance Dashboard</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={preparePerformanceData(analysis.performanceMetrics)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }} 
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-semibold text-lg text-foreground">Rail Operations Overview</h4>
              
              {/* Visual Efficiency Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Rake Efficiency</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{Math.min(analysis.railTransportationAnalysis.rakeUtilizationEfficiency, 100)}%</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(analysis.railTransportationAnalysis.rakeUtilizationEfficiency, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Loading Efficiency</span>
                </div>
                <div className="text-2xl font-bold text-green-800">{Math.min(analysis.rakeAnalysis.loadingEfficiency, 100)}%</div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(analysis.rakeAnalysis.loadingEfficiency, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

              {/* Operational Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total Rakes</p>
                      <p className="text-2xl font-bold text-purple-800">{analysis.rakeAnalysis.totalRakesRequired}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600 font-medium">Capacity</p>
                      <p className="text-lg font-bold text-amber-800">{analysis.rakeAnalysis.rakeCapacity.toLocaleString()}</p>
                      <p className="text-xs text-amber-600">MT per rake</p>
                    </div>
                    <Package className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              <div className="p-4 rounded-lg border bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Availability Status</span>
                  <Badge 
                    variant={analysis.rakeAnalysis.availabilityStatus ? "default" : "destructive"} 
                    className="gap-2 px-3 py-1"
                  >
                    {analysis.rakeAnalysis.availabilityStatus ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Fully Available
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        Limited Availability
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Timeline Analysis - MOVED UP */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            Transportation Timeline & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Loading Phase */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-xl text-blue-800">Loading Phase</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium uppercase tracking-wide mb-1">Start Date</p>
                  <p className="font-bold text-lg text-blue-800">{new Date(analysis.timelineAnalysis.loadingPhase.startDate).toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium uppercase tracking-wide mb-1">Duration</p>
                  <p className="font-bold text-lg text-blue-800">{analysis.timelineAnalysis.loadingPhase.estimatedDuration} days</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium uppercase tracking-wide mb-1">End Date</p>
                  <p className="font-bold text-lg text-blue-800">{new Date(analysis.timelineAnalysis.loadingPhase.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Transit Phase */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-50/50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <ArrowRight className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-bold text-xl text-green-800">Transit & Delivery Phase</h4>
              </div>
              <div className="mb-6">
                <p className="text-sm text-green-600 font-medium uppercase tracking-wide mb-1">
                  Estimated Duration
                </p>
                <p className="font-bold text-2xl text-green-800">{analysis.timelineAnalysis.transitPhase.estimatedDuration} days</p>
              </div>
              
              {analysis.timelineAnalysis.transitPhase.milestones?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-green-800 mb-4">Delivery Milestones</h5>
                  <div className="space-y-3">
                    {analysis.timelineAnalysis.transitPhase.milestones.map((milestone, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-semibold">{milestone.plantName}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{new Date(milestone.estimatedArrival).toLocaleDateString()}</p>
                          <Badge variant="secondary" className="mt-1">{milestone.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Risk Assessment - MOVED DOWN */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              Risk Assessment & Mitigation
            </CardTitle>
            <Badge 
              variant={
                analysis.riskAssessment.riskLevel === 'High' ? 'destructive' : 
                analysis.riskAssessment.riskLevel === 'Medium' ? 'default' : 
                'secondary'
              }
              className="text-sm px-3 py-1"
            >
              {analysis.riskAssessment.riskLevel} Risk Level
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-foreground">Risk Factors</h4>
              {analysis.riskAssessment.riskFactors?.length > 0 ? (
                <div className="space-y-4">
                  {analysis.riskAssessment.riskFactors.map((risk, index) => (
                    <div key={index} className="p-5 border rounded-xl hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <p className="font-semibold text-foreground">{risk.factor}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium uppercase">Severity</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-20 bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full" 
                                    style={{ width: `${risk.severity * 10}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold">{risk.severity}/10</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium uppercase">Probability</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-20 bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" 
                                    style={{ width: `${risk.probability * 10}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold">{risk.probability}/10</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            risk.severity * risk.probability > 50 ? 'destructive' : 
                            risk.severity * risk.probability > 25 ? 'default' : 
                            'secondary'
                          }
                        >
                          {risk.severity * risk.probability > 50 ? 'Critical' : 
                           risk.severity * risk.probability > 25 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">No significant risk factors identified</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-foreground">Mitigation Strategies</h4>
              {analysis.riskAssessment.mitigationStrategies?.length > 0 ? (
                <div className="space-y-3">
                  {analysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-green-800 font-medium">{strategy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No specific mitigation strategies provided</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced AI Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-purple-50">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            AI-Powered Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <h4 className="font-bold text-lg text-red-600">Immediate Actions</h4>
              </div>
              <div className="space-y-3">
                {analysis.optimizationRecommendations.immediate?.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-red-800 font-medium">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                <h4 className="font-bold text-lg text-amber-600">Short-term Improvements</h4>
              </div>
              <div className="space-y-3">
                {analysis.optimizationRecommendations.shortTerm?.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-amber-800 font-medium">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <h4 className="font-bold text-lg text-green-600">Long-term Strategy</h4>
              </div>
              <div className="space-y-3">
                {analysis.optimizationRecommendations.longTerm?.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-green-800 font-medium">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {analysis.optimizationRecommendations.potentialSavings && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-2xl text-green-800">Potential Cost Savings</h4>
                    <p className="text-green-600 font-medium">Through implementation of AI recommendations</p>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Estimated based on current analysis
                    </div>
                  </div>
                  <div className="text-center lg:text-right">
                    <p className="text-4xl font-bold text-green-800 mb-1">
                      ₹{(analysis.optimizationRecommendations.potentialSavings).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 font-semibold">Annual Savings Potential</p>
                  </div>
                </div>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortToPlant;