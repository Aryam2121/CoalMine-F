import { useEffect, useState } from 'react';
import api from '../services/axios';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Button from '../components/ui/Button';
import PredictiveAnalyticsDashboard from '../components/PredictiveAnalytics';

const AnalyticsPage = () => {
  const [mineId, setMineId] = useState(null);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/getallMines')
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(list) ? list : [];
        setMines(arr);
        if (arr[0]?._id) setMineId(arr[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageShell title="AI analytics" subtitle="Loading mine sites…" variant="dark">
        <LoadingBlock />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="AI analytics"
      subtitle="Risk scoring, incident forecasts, and ML recommendations"
      variant="dark"
      action={
        mines.length > 0 ? (
          <select
            className="input-field !w-auto !py-2 !bg-slate-800 !border-slate-600"
            value={mineId || ''}
            onChange={(e) => setMineId(e.target.value)}
          >
            {mines.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        ) : (
          <Button variant="secondary" onClick={() => window.location.assign('/coal-mines')}>
            Add mine
          </Button>
        )
      }
    >
      {mineId ? (
        <PredictiveAnalyticsDashboard mineId={mineId} />
      ) : (
        <p className="text-slate-500 text-center py-12 rounded-xl border border-slate-700">
          Create a coal mine to run predictive analysis.
        </p>
      )}
    </PageShell>
  );
};

export default AnalyticsPage;
