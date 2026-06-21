import { useCallback, useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Button from '../components/ui/Button';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const riskColor = (level) => {
  if (level === 'critical') return 'text-red-400';
  if (level === 'high') return 'text-orange-400';
  if (level === 'medium') return 'text-amber-400';
  return 'text-emerald-400';
};

const PredictiveMaintenancePage = () => {
  const { activeMineId, setActiveMineId, mines } = useSocketContext();
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const load = useCallback(async () => {
    if (!activeMineId) return;
    setLoading(true);
    try {
      const [predRes, analRes] = await Promise.all([
        api.post(`/mines/${activeMineId}/predict`).catch(() => ({ data: null })),
        api.get(`/mines/${activeMineId}/analytics`).catch(() => ({ data: null })),
      ]);
      setPrediction(predRes.data?.prediction || predRes.data);
      setAnalytics(analRes.data?.analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeMineId]);

  useEffect(() => {
    load();
  }, [load]);

  const equipmentRisk = analytics?.equipmentRisk || [];
  const factors = prediction?.factors?.operationalFactors || analytics?.riskFactors?.operationalFactors;

  const healthChart = {
    labels: equipmentRisk.slice(0, 6).map((e) => e.name?.slice(0, 12) || 'Equipment'),
    datasets: [{
      label: 'Failure risk %',
      data: equipmentRisk.slice(0, 6).map((e) => e.score),
      backgroundColor: equipmentRisk.slice(0, 6).map((e) => (e.score > 70 ? '#ef4444' : e.score > 40 ? '#f59e0b' : '#10b981')),
    }],
  };

  const statusChart = analytics?.maintenanceStatus
    ? {
        labels: Object.keys(analytics.maintenanceStatus),
        datasets: [{
          data: Object.values(analytics.maintenanceStatus),
          backgroundColor: ['#64748b', '#3b82f6', '#10b981', '#ef4444'],
        }],
      }
    : null;

  return (
    <PageShell
      title="Predictive Maintenance"
      subtitle="Deterministic failure risk scoring from maintenance history, overdue tasks, and equipment age"
      variant="dark"
      action={
        <div className="flex gap-2">
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2 !bg-slate-800" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          <Button variant="secondary" onClick={load}>Refresh analysis</Button>
        </div>
      }
    >
      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <p className="text-xs uppercase text-slate-500">Risk score</p>
              <p className={`text-4xl font-bold mt-1 ${riskColor(prediction?.riskLevel || analytics?.currentRiskLevel)}`}>
                {prediction?.riskScore ?? analytics?.currentRiskScore ?? '—'}
              </p>
              <p className="text-sm capitalize text-slate-400 mt-1">{prediction?.riskLevel || analytics?.currentRiskLevel || 'unknown'} risk</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <p className="text-xs uppercase text-slate-500">Open alerts</p>
              <p className="text-4xl font-bold text-amber-400 mt-1">{analytics?.unresolvedAlerts ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <p className="text-xs uppercase text-slate-500">Model confidence</p>
              <p className="text-4xl font-bold text-violet-400 mt-1">{prediction?.confidence ?? '—'}%</p>
            </div>
          </div>

          {factors && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Overdue maintenance', value: factors.maintenanceOverdue },
                { label: 'Equipment age (yrs)', value: factors.equipmentAge },
                { label: 'Open tasks (est.)', value: factors.hoursOperated ? Math.round(factors.hoursOperated / 8) : '—' },
                { label: 'Staff fatigue index', value: factors.staffFatigue },
              ].map((f) => (
                <div key={f.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                  <p className="text-xs uppercase text-slate-500">{f.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{f.value ?? '—'}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 p-4">
              <h3 className="font-semibold text-white mb-3">Equipment failure risk</h3>
              {equipmentRisk.length > 0 ? (
                <Bar data={healthChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              ) : (
                <p className="text-slate-500">No open maintenance tasks linked to equipment</p>
              )}
            </div>
            {statusChart && (
              <div className="rounded-xl border border-slate-700 p-4">
                <h3 className="font-semibold text-white mb-3">Maintenance status mix</h3>
                <Doughnut data={statusChart} />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {(prediction?.recommendations || analytics?.recommendations || []).map((rec, i) => (
                <li key={i} className="text-sm text-slate-300 border-l-2 border-amber-500 pl-3">
                  <span className="text-amber-400 uppercase text-xs">{rec.priority || 'action'}</span> — {rec.action || rec}
                </li>
              ))}
              {!prediction?.recommendations?.length && !analytics?.recommendations?.length && (
                <li className="text-slate-500">Run refresh to generate recommendations</li>
              )}
            </ul>
          </div>

          {(prediction?.predictedIncidents || []).length > 0 && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <h3 className="font-semibold text-red-400 mb-2">Predicted incidents</h3>
              {prediction.predictedIncidents.map((inc, i) => (
                <div key={i} className="text-sm text-slate-300 mb-2">
                  <strong className="capitalize">{inc.type?.replace(/_/g, ' ')}</strong> — {inc.probability}% · {inc.estimatedTimeframe}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default PredictiveMaintenancePage;
