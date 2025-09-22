import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Replace react-router-dom with next/navigation
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Clock, DollarSign, Ship, Train, Factory, AlertTriangle, CheckCircle, RefreshCw, Lightbulb } from 'lucide-react';

interface OptimizationData {
  vesselId: string;
  vesselName: string;
  portOptimization: any;
  railOptimization: any;
  costOptimization: any;
  timeOptimization: any;
  riskMitigation: any;
  overallRecommendations: any;
  comparisonMetrics: any;
  timestamp: string;
}

const OptimizationEngine: React.FC = () => {
  const searchParams = useSearchParams(); // Use next/navigation's useSearchParams
  const vesselId = searchParams.get('vesselId');
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    if (vesselId) {
      fetchOptimizationData();
    } else {
      setError('No vessel ID provided');
      setLoading(false);
    }
  }, [vesselId]);

  const fetchOptimizationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/optimization/vessel/${vesselId}`);
      const result = await response.json();

      if (result.success) {
        setOptimizationData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch optimization data');
      }
    } catch (err) {
      console.error('Error fetching optimization data:', err);
      setError('Failed to fetch optimization data');
    } finally {
      setLoading(false);
    }
  };

  const regenerateAnalysis = async () => {
    try {
      setRegenerating(true);
      const response = await fetch(`http://localhost:5000/api/optimization/vessel/${vesselId}/regenerate`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        setOptimizationData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to regenerate optimization analysis');
      }
    } catch (err) {
      console.error('Error regenerating analysis:', err);
      setError('Failed to regenerate optimization analysis');
    } finally {
      setRegenerating(false);
    }
  };

  const renderOverview = () => {
    if (!optimizationData) return null;

    const comparisonData = [
      { name: 'Efficiency', Traditional: 70, Optimized: 92 },
      { name: 'Cost', Traditional: 100, Optimized: 82 },
      { name: 'Time', Traditional: 100, Optimized: 82 },
      { name: 'Reliability', Traditional: 75, Optimized: 95 },
    ];

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Cost Savings</p>
                <p className="text-2xl font-bold">
                  ${optimizationData.costOptimization?.improvements?.totalSavings?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Time Reduction</p>
                <p className="text-2xl font-bold">
                  {optimizationData.timeOptimization?.improvements?.totalTimeReduction?.toFixed(1) || '0'} days
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Efficiency Gain</p>
                <p className="text-2xl font-bold">
                  {optimizationData.portOptimization?.improvements?.efficiencyGain || '0'}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Risk Level</p>
                <p className="text-2xl font-bold capitalize">
                  {optimizationData.riskMitigation?.optimizedRiskLevel || 'Low'}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Traditional vs Optimized Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Traditional" fill="#94A3B8" />
              <Bar dataKey="Optimized" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderPortOptimization = () => {
    if (!optimizationData?.portOptimization) return null;

    const portData = [
      {
        name: 'Wait Time',
        traditional: optimizationData.portOptimization.traditional.waitTime,
        optimized: optimizationData.portOptimization.optimized.waitTime,
      },
      {
        name: 'Berthing Delay',
        traditional: optimizationData.portOptimization.traditional.berthingDelay,
        optimized: optimizationData.portOptimization.optimized.berthingDelay,
      },
      {
        name: 'Handling Cost',
        traditional: optimizationData.portOptimization.traditional.handlingCost / 1000,
        optimized: optimizationData.portOptimization.optimized.handlingCost / 1000,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <Ship className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold">Port Operations Optimization</h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={portData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="traditional" fill="#EF4444" name="Traditional" />
              <Bar dataKey="optimized" fill="#10B981" name="Optimized" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-3 text-green-600">Improvements</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Wait Time Reduction:</span>
                <span className="font-medium">{optimizationData.portOptimization.improvements.waitTimeReduction.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between">
                <span>Berthing Delay Reduction:</span>
                <span className="font-medium">{optimizationData.portOptimization.improvements.berthingDelayReduction.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between">
                <span>Cost Savings:</span>
                <span className="font-medium">${optimizationData.portOptimization.improvements.costSavings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-3 text-blue-600">Recommendations</h4>
            <ul className="space-y-2">
              {optimizationData.portOptimization.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderRailOptimization = () => {
    if (!optimizationData?.railOptimization) return null;

    const railData = [
      {
        name: 'Transit Days',
        traditional: optimizationData.railOptimization.traditional.transitDays,
        optimized: optimizationData.railOptimization.optimized.transitDays,
      },
      {
        name: 'Rake Utilization %',
        traditional: optimizationData.railOptimization.traditional.rakeUtilization,
        optimized: optimizationData.railOptimization.optimized.rakeUtilization,
      },
      {
        name: 'Loading Days',
        traditional: optimizationData.railOptimization.traditional.loadingDays,
        optimized: optimizationData.railOptimization.optimized.loadingDays,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <Train className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-xl font-semibold">Rail Transportation Optimization</h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={railData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="traditional" stroke="#EF4444" strokeWidth={3} name="Traditional" />
              <Line type="monotone" dataKey="optimized" stroke="#10B981" strokeWidth={3} name="Optimized" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-3 text-purple-600">Efficiency Gains</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Transit Time:</span>
                <span className="font-medium text-green-600">-{optimizationData.railOptimization.improvements.transitTimeReduction.toFixed(1)} days</span>
              </div>
              <div className="flex justify-between">
                <span>Utilization:</span>
                <span className="font-medium text-green-600">+{optimizationData.railOptimization.improvements.utilizationIncrease.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-3 text-green-600">Cost Benefits</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Transport Savings:</span>
                <span className="font-medium">${optimizationData.railOptimization.improvements.costSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Rake Efficiency:</span>
                <span className="font-medium">{optimizationData.railOptimization.improvements.rakeEfficiency.toFixed(1)} less rakes</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-3 text-blue-600">Key Actions</h4>
            <ul className="space-y-1">
              {optimizationData.railOptimization.recommendations.slice(0, 3).map((rec: string, index: number) => (
                <li key={index} className="text-sm flex items-start">
                  <Lightbulb className="h-3 w-3 text-yellow-500 mr-1 mt-1 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderCostOptimization = () => {
    if (!optimizationData?.costOptimization) return null;

    const costBreakdown = [
      { name: 'Rail Transport', value: optimizationData.costOptimization.traditional.railCost },
      { name: 'Port Handling', value: optimizationData.costOptimization.traditional.portCost },
      { name: 'Storage', value: optimizationData.costOptimization.traditional.storageCost },
      { name: 'Demurrage', value: optimizationData.costOptimization.traditional.demurrageCost },
    ];

    const savingsData = [
      { name: 'Rail Savings', value: optimizationData.costOptimization.improvements.railSavings },
      { name: 'Port Savings', value: optimizationData.costOptimization.improvements.portSavings },
      { name: 'Storage Savings', value: optimizationData.costOptimization.improvements.storageSavings },
      { name: 'Demurrage Savings', value: optimizationData.costOptimization.improvements.demurrageSavings },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Traditional Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()}`, 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Potential Savings by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={savingsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()}`, 'Savings']} />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-xl font-semibold text-green-800">Total Cost Impact</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Traditional Total Cost</p>
              <p className="text-2xl font-bold text-red-600">
                ${optimizationData.costOptimization.traditional.totalCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Optimized Total Cost</p>
              <p className="text-2xl font-bold text-green-600">
                ${optimizationData.costOptimization.optimized.totalCost.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Savings</p>
              <p className="text-3xl font-bold text-blue-600">
                ${optimizationData.costOptimization.improvements.totalSavings.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 font-medium">
                (
                {(
                  (optimizationData.costOptimization.improvements.totalSavings /
                    optimizationData.costOptimization.traditional.totalCost) *
                  100
                ).toFixed(1)}
                % reduction)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="font-semibold mb-3 text-blue-600">Cost Optimization Strategies</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationData.costOptimization.recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRiskAnalysis = () => {
    if (!optimizationData?.riskMitigation) return null;

    const riskData = [
      { subject: 'Weather Risk', A: 70, B: 40 },
      { subject: 'Port Congestion', A: 85, B: 50 },
      { subject: 'Rail Delays', A: 60, B: 35 },
      { subject: 'Supply Chain', A: 75, B: 45 },
      { subject: 'Cost Overrun', A: 80, B: 40 },
      { subject: 'Schedule Delays', A: 90, B: 55 },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Risk Assessment: Traditional vs Optimized</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={riskData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Traditional Risk" dataKey="A" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
              <Radar name="Optimized Risk" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-3 text-orange-600">Risk Mitigation Strategies</h4>
            <ul className="space-y-2">
              {optimizationData.riskMitigation.mitigationStrategies.map((strategy: string, index: number) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strategy}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-3 text-blue-600">Contingency Plans</h4>
            <ul className="space-y-2">
              {optimizationData.riskMitigation.contingencyPlans.map((plan: string, index: number) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{plan}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Risk Level Assessment</h3>
              <p className="text-sm text-orange-600">Current vs Optimized Risk Levels</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Current Risk Level</p>
              <p
                className={`text-2xl font-bold capitalize ${
                  optimizationData.riskMitigation.currentRiskLevel === 'high'
                    ? 'text-red-600'
                    : optimizationData.riskMitigation.currentRiskLevel === 'medium'
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              >
                {optimizationData.riskMitigation.currentRiskLevel}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Optimized Risk Level</p>
              <p
                className={`text-2xl font-bold capitalize ${
                  optimizationData.riskMitigation.optimizedRiskLevel === 'high'
                    ? 'text-red-600'
                    : optimizationData.riskMitigation.optimizedRiskLevel === 'medium'
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              >
                {optimizationData.riskMitigation.optimizedRiskLevel}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!optimizationData?.overallRecommendations) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
            <h4 className="font-semibold mb-3 text-red-600 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Immediate Actions
            </h4>
            <ul className="space-y-2">
              {optimizationData.overallRecommendations.immediate.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="h-2 w-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
            <h4 className="font-semibold mb-3 text-orange-600 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Short Term (1-3 months)
            </h4>
            <ul className="space-y-2">
              {optimizationData.overallRecommendations.shortTerm.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="h-2 w-2 bg-orange-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <h4 className="font-semibold mb-3 text-green-600 flex items-center">
              <Factory className="h-5 w-5 mr-2" />
              Long Term (3+ months)
            </h4>
            <ul className="space-y-2">
              {optimizationData.overallRecommendations.longTerm.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-blue-800">Investment vs Returns</h3>
              <p className="text-sm text-blue-600">Projected savings from optimization implementation</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Potential Annual Savings</p>
            <p className="text-3xl font-bold text-green-600">
              ${optimizationData.overallRecommendations.potentialSavings?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-blue-600 mt-2">Based on optimization across all operational areas</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading optimization analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOptimizationData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Optimization Engine</h1>
              <p className="text-gray-600 mt-1">
                Vessel: <span className="font-semibold">{optimizationData?.vesselName || 'Unknown'}</span>
              </p>
              <p className="text-sm text-gray-500">
                Generated: {optimizationData?.timestamp ? new Date(optimizationData.timestamp).toLocaleString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={regenerateAnalysis}
              disabled={regenerating}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerating...' : 'Regenerate with AI'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'port', name: 'Port Optimization', icon: Ship },
                { id: 'rail', name: 'Rail Optimization', icon: Train },
                { id: 'cost', name: 'Cost Analysis', icon: DollarSign },
                { id: 'risk', name: 'Risk Analysis', icon: AlertTriangle },
                { id: 'recommendations', name: 'Recommendations', icon: Lightbulb },
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'port' && renderPortOptimization()}
          {activeTab === 'rail' && renderRailOptimization()}
          {activeTab === 'cost' && renderCostOptimization()}
          {activeTab === 'risk' && renderRiskAnalysis()}
          {activeTab === 'recommendations' && renderRecommendations()}
        </div>
      </div>
    </div>
  );
};

export default OptimizationEngine;