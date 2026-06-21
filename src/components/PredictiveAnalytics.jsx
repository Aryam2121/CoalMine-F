import api from '../services/axios';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from './ui/Button';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';

const riskPill = (level) => {
  const l = (level || '').toLowerCase();
  if (l === 'critical' || l === 'high') return 'risk-pill--high';
  if (l === 'medium') return 'risk-pill--medium';
  return 'risk-pill--low';
};

const PredictiveAnalyticsDashboard = ({ mineId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  const loadData = useCallback(async () => {
    if (!mineId) return;
    try {
      const [analyticsRes, predRes] = await Promise.all([
        api.get(`/mines/${mineId}/analytics`).catch(() => ({ data: {} })),
        api.get(`/mines/${mineId}/predictions`, { params: { limit: 1 } }).catch(() => ({ data: { predictions: [] } })),
      ]);
      setAnalyticsData(analyticsRes.data?.analytics ?? analyticsRes.data ?? null);
      const preds = predRes.data?.predictions ?? [];
      if (preds.length > 0) setPrediction(preds[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoad(false);
    }
  }, [mineId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateNewPrediction = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/mines/${mineId}/predict`, {});
      setPrediction(data.prediction ?? data);
      toast.success('New AI analysis complete');
      loadData();
    } catch {
      toast.error('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <LoadingBlock label="Loading AI analytics…" />;

  if (!prediction && !analyticsData) {
    return (
      <EmptyState
        title="No predictions yet"
        message="Run your first AI risk analysis for this mine site."
        action={
          <Button onClick={generateNewPrediction} disabled={loading}>
            <Sparkles className="w-4 h-4 inline mr-1" />
            {loading ? 'Analyzing…' : 'Run AI analysis'}
          </Button>
        }
      />
    );
  }

  const formatLabel = (s) => (s || '').replace(/_/g, ' ');

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-wrap justify-between items-center gap-3">
        <p className="text-sm text-slate-400">ML-powered risk scoring and incident forecasts</p>
        <Button variant="secondary" onClick={generateNewPrediction} disabled={loading}>
          <RefreshCw className={`w-4 h-4 inline mr-1 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running…' : 'Run new analysis'}
        </Button>
      </div>

      {prediction && (
        <>
          <div className="ops-kpi-grid">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="ops-kpi col-span-full md:col-span-2 border-violet-500/30 bg-gradient-to-br from-violet-950/60 to-slate-900/80"
            >
              <span className="ops-kpi-label">Overall risk score</span>
              <p className="ops-kpi-value !text-4xl text-white">{prediction.riskScore ?? '—'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={riskPill(prediction.riskLevel)}>{prediction.riskLevel || 'unknown'}</span>
                <span className="text-xs text-slate-400">{prediction.confidence ?? 0}% confidence</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, prediction.riskScore || 0)}%` }}
                />
              </div>
            </motion.div>
            <div className="ops-kpi border-slate-700/70 bg-slate-900/50">
              <Shield className="text-emerald-400 w-5 h-5 mb-2" />
              <span className="ops-kpi-label">Safety status</span>
              <p className="ops-kpi-value !text-lg capitalize">{analyticsData?.currentRiskLevel || prediction.riskLevel}</p>
            </div>
            <div className="ops-kpi border-slate-700/70 bg-slate-900/50">
              <AlertTriangle className="text-amber-400 w-5 h-5 mb-2" />
              <span className="ops-kpi-label">Open alerts</span>
              <p className="ops-kpi-value !text-lg">{analyticsData?.unresolvedAlerts ?? 0}</p>
            </div>
          </div>

          {prediction.predictedIncidents?.length > 0 && (
            <section className="ops-panel">
              <div className="ops-panel-header">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="text-red-400 w-5 h-5" /> Predicted incidents
                </h3>
              </div>
              <div className="ops-panel-body space-y-3">
                {prediction.predictedIncidents.map((incident, index) => (
                  <div key={index} className="rounded-xl border border-red-500/20 bg-red-950/20 p-4">
                    <h4 className="font-semibold text-white capitalize">{formatLabel(incident.type)}</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      {incident.probability}% probability · {formatLabel(incident.estimatedTimeframe)}
                      {incident.affectedArea && ` · ${incident.affectedArea}`}
                    </p>
                    {incident.recommendedActions?.length > 0 && (
                      <ul className="mt-2 text-sm text-slate-300 space-y-1 list-disc list-inside">
                        {incident.recommendedActions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {prediction.recommendations?.length > 0 && (
            <section className="ops-panel">
              <div className="ops-panel-header">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="text-emerald-400 w-5 h-5" /> Recommendations
                </h3>
              </div>
              <div className="ops-panel-body grid gap-3 md:grid-cols-2">
                {prediction.recommendations.map((rec, index) => (
                  <div key={index} className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                    <span className={riskPill(rec.priority)}>{rec.priority} priority</span>
                    <p className="font-medium text-white mt-2">{rec.action}</p>
                    <p className="text-xs text-emerald-400 mt-1">−{rec.potentialRiskReduction}% risk</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {prediction.factors && (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'Weather', icon: '🌦️', data: prediction.factors.weatherConditions, rows: [
                  ['Temperature', prediction.factors.weatherConditions?.temperature?.toFixed(1) + '°C'],
                  ['Humidity', prediction.factors.weatherConditions?.humidity?.toFixed(1) + '%'],
                ]},
                { title: 'Operations', icon: '⚙️', data: prediction.factors.operationalFactors, rows: [
                  ['Hours operated', prediction.factors.operationalFactors?.hoursOperated + 'h'],
                  ['Overdue maintenance', prediction.factors.operationalFactors?.maintenanceOverdue],
                ]},
                { title: 'History', icon: '📊', data: prediction.factors.historicalData, rows: [
                  ['Past incidents', prediction.factors.historicalData?.pastIncidents],
                  ['Days safe', prediction.factors.historicalData?.daysWithoutIncident],
                ]},
              ].filter((f) => f.data).map((block) => (
                <div key={block.title} className="ops-panel">
                  <div className="ops-panel-body">
                    <h4 className="font-semibold text-white mb-3">{block.icon} {block.title}</h4>
                    <dl className="space-y-2 text-sm">
                      {block.rows.map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <dt className="text-slate-500">{k}</dt>
                          <dd className="text-white font-medium">{v ?? '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500 text-center">
            {prediction.analysisDate && `Analysis: ${new Date(prediction.analysisDate).toLocaleString()}`}
            {prediction.mlModelVersion && ` · Model ${prediction.mlModelVersion}`}
          </p>
        </>
      )}
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
