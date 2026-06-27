import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Button from '../components/ui/Button';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const STATUS_COLORS = {
  missing: 'bg-red-500/20 text-red-300',
  safe: 'bg-emerald-500/20 text-emerald-300',
  injured: 'bg-amber-500/20 text-amber-300',
  evacuated: 'bg-blue-500/20 text-blue-300',
  unknown: 'bg-slate-500/20 text-slate-300',
};

const EvacuationCommandPage = () => {
  const { activeMineId, setActiveMineId, mines, socket } = useSocketContext();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.EMERGENCY_MANAGE);

  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [showingAllMines, setShowingAllMines] = useState(false);
  const [selected, setSelected] = useState(null);
  const [muster, setMuster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState('Main Exit, Emergency Exit A');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/emergencies/active');
      const list = res.data?.emergencies || [];
      const filtered = activeMineId
        ? list.filter((e) => String(e.mineId?._id || e.mineId) === String(activeMineId))
        : list;
      const visible = filtered.length ? filtered : list;
      setShowingAllMines(Boolean(activeMineId && filtered.length === 0 && list.length > 0));
      setActiveEmergencies(visible);
      setSelected((prev) => {
        if (prev && visible.some((e) => e._id === prev._id)) return prev;
        return visible[0] || null;
      });
    } catch {
      toast.error('Failed to load emergencies');
    } finally {
      setLoading(false);
    }
  }, [activeMineId]);

  const loadMuster = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await api.get(`/emergency/${id}/muster`);
      setMuster(res.data?.evacuation);
    } catch {
      setMuster(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (selected?._id) loadMuster(selected._id); }, [selected, loadMuster]);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => { load(); if (selected?._id) loadMuster(selected._id); };
    socket.on('evacuation:initiated', refresh);
    socket.on('muster:updated', refresh);
    socket.on('evacuation:completed', refresh);
    return () => {
      socket.off('evacuation:initiated', refresh);
      socket.off('muster:updated', refresh);
      socket.off('evacuation:completed', refresh);
    };
  }, [socket, load, loadMuster, selected]);

  const initiateEvacuation = async () => {
    if (!selected?._id) return;
    try {
      await api.post(`/emergency/${selected._id}/evacuate`, {
        evacuationRoutes: routes.split(',').map((r) => r.trim()),
        musterPoints: [
          { name: 'Muster Point A', latitude: 23.6, longitude: 87.1, radiusMeters: 50 },
          { name: 'Muster Point B', latitude: 23.61, longitude: 87.11, radiusMeters: 50 },
        ],
      });
      toast.success('Evacuation initiated');
      loadMuster(selected._id);
    } catch {
      toast.error('Failed to initiate evacuation');
    }
  };

  const reportSafe = async (musterPoint = 'Muster Point A') => {
    if (!selected?._id) return;
    try {
      await api.post(`/emergency/${selected._id}/muster/safe`, { musterPoint });
      toast.success('Marked safe at muster point');
      loadMuster(selected._id);
    } catch {
      toast.error('Failed to report muster status');
    }
  };

  const completeEvacuation = async () => {
    if (!selected?._id) return;
    try {
      await api.post(`/emergency/${selected._id}/evacuation/complete`);
      toast.success('Evacuation marked complete');
      load();
    } catch {
      toast.error('Failed to complete evacuation');
    }
  };

  const roll = muster?.musterRoll || [];
  const safeCount = roll.filter((r) => r.status === 'safe' || r.status === 'evacuated').length;
  const missingCount = roll.filter((r) => r.status === 'missing' || r.status === 'unknown').length;

  return (
    <PageShell
      title="Evacuation Command Center"
      subtitle="Initiate evacuations, track muster roll-call, and account for all personnel"
      variant="dark"
      action={
        mines.length > 1 ? (
          <select
            className="input-field !w-auto !py-2 !bg-slate-800 !border-slate-600"
            value={activeMineId || ''}
            onChange={(e) => setActiveMineId(e.target.value)}
          >
            {mines.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        ) : null
      }
    >
      {loading ? <LoadingBlock /> : (
        <div className="grid gap-6 lg:grid-cols-3">
          {showingAllMines && (
            <div className="lg:col-span-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              No active emergencies for the selected mine — showing incidents from other sites. Change the mine selector above to filter.
            </div>
          )}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Active emergencies</h2>
            {activeEmergencies.length === 0 ? (
              <div className="p-4 border border-slate-700 rounded-xl space-y-2">
                <p className="text-slate-400 text-sm">No active emergencies right now.</p>
                <p className="text-xs text-slate-500">Use the Emergency page to report an SOS, or run <code className="text-slate-400">npm run seed:ops</code> in CoalMine-B for demo incidents.</p>
              </div>
            ) : activeEmergencies.map((e) => (
              <button
                key={e._id}
                type="button"
                onClick={() => setSelected(e)}
                className={`w-full text-left p-4 rounded-xl border transition ${selected?._id === e._id ? 'border-red-500 bg-red-500/10' : 'border-slate-700 hover:border-slate-500'}`}
              >
                <p className="font-semibold text-white">{e.emergencyId}</p>
                <p className="text-sm text-slate-400 capitalize">{e.emergencyType?.replace(/_/g, ' ')} — {e.severity}</p>
                {e.evacuationStatus?.initiated && (
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Evacuation active</span>
                )}
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 text-center">
                    <p className="text-2xl font-bold text-white">{roll.length}</p>
                    <p className="text-xs text-slate-400">Total personnel</p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-700/50 bg-emerald-500/10 text-center">
                    <p className="text-2xl font-bold text-emerald-300">{safeCount}</p>
                    <p className="text-xs text-slate-400">Accounted for</p>
                  </div>
                  <div className="p-4 rounded-xl border border-red-700/50 bg-red-500/10 text-center">
                    <p className="text-2xl font-bold text-red-300">{missingCount}</p>
                    <p className="text-xs text-slate-400">Missing</p>
                  </div>
                </div>

                {canManage && !muster?.initiated && (
                  <div className="p-4 rounded-xl border border-slate-700 space-y-3">
                    <label className="text-sm text-slate-400">Evacuation routes (comma-separated)</label>
                    <input className="input-field w-full !bg-slate-800" value={routes} onChange={(e) => setRoutes(e.target.value)} />
                    <Button variant="danger" onClick={initiateEvacuation}>Initiate evacuation</Button>
                  </div>
                )}

                {!canManage && muster?.initiated && (
                  <div className="p-4 rounded-xl border border-amber-700/50 bg-amber-500/10">
                    <p className="text-amber-200 mb-3">Evacuation in progress — report to your muster point</p>
                    <Button variant="primary" onClick={() => reportSafe()}>I am safe at muster point</Button>
                  </div>
                )}

                {muster?.evacuationRoutes?.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Evacuation routes</h3>
                    <ul className="text-sm text-slate-400 list-disc pl-5">
                      {muster.evacuationRoutes.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-semibold text-white">Muster roll-call</h3>
                    {canManage && muster?.initiated && (
                      <Button variant="secondary" size="sm" onClick={completeEvacuation}>Complete evacuation</Button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-800">
                    {roll.length === 0 ? (
                      <p className="p-4 text-slate-500 text-sm">No personnel on roll — initiate evacuation to populate from live monitoring</p>
                    ) : roll.map((person) => (
                      <div key={person.userId || person.name} className="px-4 py-3 flex justify-between items-center">
                        <span className="text-slate-200">{person.name || 'Unknown'}</span>
                        <span className={`text-xs px-2 py-1 rounded capitalize ${STATUS_COLORS[person.status] || STATUS_COLORS.unknown}`}>
                          {person.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500 p-6 border border-slate-700 rounded-xl text-center">Select an active emergency</p>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default EvacuationCommandPage;
