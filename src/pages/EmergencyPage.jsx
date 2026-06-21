import { useEffect, useState } from 'react';
import api from '../services/axios';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import EmergencyResponsePanel from '../components/EmergencyResponse';

const EmergencyPage = () => {
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
      <PageShell title="Emergency response" subtitle="Loading site data…" variant="dark">
        <LoadingBlock />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Emergency response"
      subtitle="SOS reporting, live incidents, and response coordination"
      variant="dark"
      action={
        mines.length > 1 ? (
          <select
            className="input-field !w-auto !py-2 !bg-slate-800 !border-slate-600"
            value={mineId || ''}
            onChange={(e) => setMineId(e.target.value)}
          >
            {mines.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        ) : mines[0]?.name ? (
          <span className="text-sm text-slate-400">Site: {mines[0].name}</span>
        ) : null
      }
    >
      {mineId ? (
        <EmergencyResponsePanel mineId={mineId} />
      ) : (
        <p className="text-slate-500 rounded-xl border border-slate-700 p-6 text-center">
          No coal mines configured. Add a mine under Coal Mines to enable emergency reporting.
        </p>
      )}
    </PageShell>
  );
};

export default EmergencyPage;
