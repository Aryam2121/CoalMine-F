import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Shield, Users, Tool } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const PredictiveAnalyticsDashboard = ({ mineId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (mineId) {
      fetchAnalytics();
      fetchPrediction();
    }
  }, [mineId]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/mines/${mineId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPrediction = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/mines/${mineId}/predictions?limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.predictions.length > 0) {
        setPrediction(response.data.predictions[0]);
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
    }
  };

  const generateNewPrediction = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/mines/${mineId}/predict`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrediction(response.data.prediction);
      toast.success('New prediction generated successfully');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (level) => {
    if (level === 'critical' || level === 'high') {
      return <AlertTriangle className="text-red-500" size={24} />;
    }
    return <Shield className="text-green-500" size={24} />;
  };

  if (!prediction && !analyticsData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Activity className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-semibold mb-2">No Analytics Data Available</h3>
          <p className="text-gray-600 mb-4">Generate your first prediction to get started</p>
          <button
            onClick={generateNewPrediction}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Prediction'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🔮 Predictive Analytics Dashboard</h2>
        <button
          onClick={generateNewPrediction}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Activity size={18} />
          {loading ? 'Generating...' : 'Run New Analysis'}
        </button>
      </div>

      {/* Risk Score Card */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Overall Risk Score</p>
                <h1 className="text-5xl font-bold">{prediction.riskScore}</h1>
                <p className="text-lg mt-2 capitalize">
                  Risk Level: <span className="font-semibold">{prediction.riskLevel}</span>
                </p>
              </div>
              <div className="text-6xl opacity-20">
                {getRiskIcon(prediction.riskLevel)}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${prediction.riskScore}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{prediction.confidence}% Confidence</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-green-500" size={24} />
              <h3 className="font-semibold">Safety Status</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {analyticsData?.currentRiskLevel || prediction.riskLevel}
            </p>
            <p className="text-sm text-gray-600 mt-1">Current Status</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-orange-500" size={24} />
              <h3 className="font-semibold">Alerts</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {analyticsData?.unresolvedAlerts || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Unresolved</p>
          </div>
        </div>
      )}

      {/* Predicted Incidents */}
      {prediction?.predictedIncidents && prediction.predictedIncidents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Predicted Incidents
          </h3>
          <div className="space-y-4">
            {prediction.predictedIncidents.map((incident, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold capitalize">
                      {incident.type.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Probability: <span className="font-semibold text-red-600">{incident.probability}%</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Timeframe: <span className="font-semibold">{incident.estimatedTimeframe.replace('_', ' ')}</span>
                    </p>
                    {incident.affectedArea && (
                      <p className="text-sm text-gray-600">
                        Area: <span className="font-semibold">{incident.affectedArea}</span>
                      </p>
                    )}
                  </div>
                </div>
                {incident.recommendedActions && incident.recommendedActions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Recommended Actions:</p>
                    <ul className="text-sm space-y-1">
                      {incident.recommendedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {prediction?.recommendations && prediction.recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            Safety Recommendations
          </h3>
          <div className="space-y-3">
            {prediction.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'critical' ? 'border-red-500 bg-red-50' :
                rec.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    rec.priority === 'critical' ? 'bg-red-200 text-red-800' :
                    rec.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                    rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-sm text-gray-600">
                    Risk Reduction: <span className="font-semibold text-green-600">{rec.potentialRiskReduction}%</span>
                  </span>
                </div>
                <p className="font-semibold mb-2">{rec.action}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>💰 Cost: ${rec.estimatedCost?.toLocaleString() || 'N/A'}</span>
                  <span>⏱️ Time: {rec.estimatedTimeToImplement || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factors Analysis */}
      {prediction?.factors && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prediction.factors.weatherConditions && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">🌦️ Weather Conditions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="font-semibold">{prediction.factors.weatherConditions.temperature?.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span className="font-semibold">{prediction.factors.weatherConditions.humidity?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Rainfall:</span>
                  <span className="font-semibold">{prediction.factors.weatherConditions.rainfall?.toFixed(1)}mm</span>
                </div>
              </div>
            </div>
          )}

          {prediction.factors.operationalFactors && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">⚙️ Operational Factors</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Hours Operated:</span>
                  <span className="font-semibold">{prediction.factors.operationalFactors.hoursOperated}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Overdue Tasks:</span>
                  <span className="font-semibold text-red-600">{prediction.factors.operationalFactors.maintenanceOverdue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Equipment Age:</span>
                  <span className="font-semibold">{prediction.factors.operationalFactors.equipmentAge?.toFixed(1)}y</span>
                </div>
              </div>
            </div>
          )}

          {prediction.factors.historicalData && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">📊 Historical Data</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Past Incidents:</span>
                  <span className="font-semibold">{prediction.factors.historicalData.pastIncidents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Days Without Incident:</span>
                  <span className="font-semibold text-green-600">{prediction.factors.historicalData.daysWithoutIncident}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response Time:</span>
                  <span className="font-semibold">{prediction.factors.historicalData.averageResponseTime?.toFixed(0)}min</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Metadata */}
      {prediction && (
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Analysis Date: {new Date(prediction.analysisDate).toLocaleString()}</span>
            <span>ML Model Version: {prediction.mlModelVersion}</span>
            <span>Confidence: {prediction.confidence}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
