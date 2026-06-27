import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Button from '../components/ui/Button';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';

const riskColor = (v) => (v > 70 ? 'text-red-400' : v > 40 ? 'text-amber-400' : 'text-emerald-400');

const IncidentForecastPage = () => {
  const { activeMineId, setActiveMineId, mines } = useSocketContext();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [latest, setLatest] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!activeMineId) return;
    setLoading(true);
    try {
      const res = await api.get(`/mines/${activeMineId}/incident-predictions`);
      const list = res.data?.predictions || [];
      setPredictions(list);
      setLatest(list[0] || null);
    } catch {
      toast.error('Failed to load incident forecasts');
    } finally {
      setLoading(false);
    }
  }, [activeMineId]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    if (!activeMineId) return;
    setGenerating(true);
    try {
      const res = await api.post(`/mines/${activeMineId}/incident-prediction`);
      setLatest(res.data?.prediction);
      toast.success('Forecast generated');
      load();
    } catch {
      toast.error('Failed to generate forecast');
    } finally {
      setGenerating(false);
    }
  };

  const ml = latest?.mlPredictions;
  const patterns = latest?.patterns;
  const hist = latest?.historicalComparison;

  return (
    <PageShell
      title="Incident Risk Forecast"
      subtitle="Pattern-based incident probability and recommended pre-shift actions"
      action={
        <div className="flex gap-2 items-center">
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          <Button variant="primary" onClick={generate} disabled={generating}>{generating ? 'Generating…' : 'Refresh forecast'}</Button>
        </div>
      }
    >
      {loading ? <LoadingBlock /> : !latest ? (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">No forecast data yet</p>
          <Button variant="primary" onClick={generate}>Generate first forecast</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 uppercase">Incident probability</p>
              <p className={`text-3xl font-bold ${riskColor(ml?.incidentProbability || 0)}`}>{ml?.incidentProbability ?? '—'}%</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 uppercase">Confidence</p>
              <p className="text-3xl font-bold">{ml?.confidenceLevel ?? '—'}%</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 uppercase">Days since last incident</p>
              <p className="text-3xl font-bold">{hist?.daysSinceLastIncident ?? '—'}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 uppercase">Trend</p>
              <p className="text-3xl font-bold capitalize">{hist?.trendDirection ?? '—'}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-3">High-risk hours</h3>
              <p className="text-sm text-slate-500">
                {patterns?.timeOfDay?.highRiskHours?.map((h) => `${h}:00`).join(', ') || 'Insufficient data'}
              </p>
              <h3 className="font-semibold mt-4 mb-3">High-risk days</h3>
              <p className="text-sm text-slate-500">{patterns?.dayOfWeek?.highRiskDays?.join(', ') || '—'}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-3">Contributing factors</h3>
              <ul className="text-sm text-slate-500 list-disc pl-5 space-y-1">
                {(ml?.contributingFactors || []).map((f) => <li key={f}>{f}</li>)}
              </ul>
              <h3 className="font-semibold mt-4 mb-3">Recommended pre-shift actions</h3>
              <ul className="text-sm text-slate-500 list-disc pl-5 space-y-1">
                <li>Review equipment in high-risk zones before peak hours</li>
                <li>Confirm gas detectors calibrated for {patterns?.timeOfDay?.peakIncidentHour ?? 12}:00 shift</li>
                <li>Brief team on {ml?.predictedType?.replace(/_/g, ' ') || 'general'} risk ({ml?.predictedSeverity} severity)</li>
              </ul>
            </div>
          </div>

          {predictions.length > 1 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Forecast history</div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {predictions.slice(1, 6).map((p) => (
                  <div key={p._id} className="px-4 py-3 flex justify-between text-sm">
                    <span>{new Date(p.predictionDate).toLocaleString()}</span>
                    <span className={riskColor(p.mlPredictions?.incidentProbability)}>{p.mlPredictions?.incidentProbability}% risk</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default IncidentForecastPage;
