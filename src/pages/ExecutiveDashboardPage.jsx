import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import api from '../services/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ExecutiveDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/executive/summary')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis || {};
  const sites = data?.sites || [];

  const safetyChart = {
    labels: sites.map((s) => s.name?.slice(0, 14) || 'Site'),
    datasets: [
      { label: 'Safety score', data: sites.map((s) => s.safetyScore ?? 0), backgroundColor: '#10b981' },
      { label: 'Productivity', data: sites.map((s) => s.productivityScore ?? 0), backgroundColor: '#f59e0b' },
    ],
  };

  const riskChart = {
    labels: sites.filter((s) => s.riskScore != null).map((s) => s.name?.slice(0, 14)),
    datasets: [{
      label: 'Risk score',
      data: sites.filter((s) => s.riskScore != null).map((s) => s.riskScore),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.2)',
      fill: true,
      tension: 0.3,
    }],
  };

  return (
    <PageShell title="Executive Dashboard" subtitle="Multi-site KPIs, safety scoring, and productivity analytics" variant="dark">
      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total sites', value: kpis.totalSites, color: 'text-white' },
              { label: 'Open alerts', value: kpis.openAlerts, color: 'text-amber-400' },
              { label: 'Avg safety score', value: kpis.avgSafetyScore, color: 'text-emerald-400' },
              { label: 'Avg productivity', value: kpis.avgProductivityScore, color: 'text-violet-400' },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-xs uppercase text-slate-500">{k.label}</p>
                <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value ?? '—'}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 p-4">
              <h3 className="font-semibold text-white mb-3">Site performance comparison</h3>
              {sites.length > 0 ? <Bar data={safetyChart} options={{ responsive: true }} /> : <p className="text-slate-500">No sites configured</p>}
            </div>
            <div className="rounded-xl border border-slate-700 p-4">
              <h3 className="font-semibold text-white mb-3">Predictive risk by site</h3>
              {riskChart.labels.length > 0 ? <Line data={riskChart} options={{ responsive: true }} /> : <p className="text-slate-500">Run AI analytics on sites for risk data</p>}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Site</th>
                  <th className="px-4 py-3 text-left">Safety</th>
                  <th className="px-4 py-3 text-left">Productivity</th>
                  <th className="px-4 py-3 text-left">Alerts</th>
                  <th className="px-4 py-3 text-left">Maintenance</th>
                  <th className="px-4 py-3 text-left">Risk</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id} className="border-t border-slate-700 text-slate-300">
                    <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                    <td className="px-4 py-3 text-emerald-400">{s.safetyScore}</td>
                    <td className="px-4 py-3 text-amber-400">{s.productivityScore ?? 'N/A'}</td>
                    <td className="px-4 py-3">{s.openAlerts} ({s.criticalAlerts} critical)</td>
                    <td className="px-4 py-3">{s.maintenanceOpen} open</td>
                    <td className="px-4 py-3 capitalize">{s.riskLevel} {s.riskScore != null && `(${s.riskScore})`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default ExecutiveDashboardPage;
