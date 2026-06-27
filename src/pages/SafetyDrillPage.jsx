import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const DRILL_TYPES = ['fire', 'gas', 'evacuation', 'collapse', 'medical', 'communication'];

const SafetyDrillPage = () => {
  const { activeMineId, setActiveMineId, mines } = useSocketContext();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.COMPLIANCE_WRITE);
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [completeModal, setCompleteModal] = useState(null);
  const [form, setForm] = useState({ title: '', drillType: 'evacuation', scheduledDate: '', objectives: '' });
  const [results, setResults] = useState({ responseTimeMinutes: '', personnelAccounted: '', personnelTotal: '', score: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/safety-drills', { params: { mineId: activeMineId } });
      setDrills(res.data?.items || []);
    } catch { toast.error('Failed to load drills'); }
    finally { setLoading(false); }
  }, [activeMineId]);

  useEffect(() => { load(); }, [load]);

  const schedule = async () => {
    try {
      await api.post('/safety-drills', {
        ...form,
        mineId: activeMineId,
        scheduledDate: new Date(form.scheduledDate),
        objectives: form.objectives.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Drill scheduled');
      setModalOpen(false);
      load();
    } catch { toast.error('Failed to schedule drill'); }
  };

  const complete = async () => {
    try {
      await api.post(`/safety-drills/${completeModal}/complete`, {
        results: {
          ...results,
          responseTimeMinutes: Number(results.responseTimeMinutes),
          personnelAccounted: Number(results.personnelAccounted),
          personnelTotal: Number(results.personnelTotal),
          score: Number(results.score),
        },
      });
      toast.success('Drill completed');
      setCompleteModal(null);
      load();
    } catch { toast.error('Failed to complete drill'); }
  };

  return (
    <PageShell
      title="Safety Drills & Exercises"
      subtitle="Schedule and evaluate fire, gas, and evacuation drills"
      action={
        <div className="flex gap-2">
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          {canManage && <Button variant="primary" onClick={() => setModalOpen(true)}>Schedule drill</Button>}
        </div>
      }
    >
      {loading ? <LoadingBlock /> : (
        <div className="space-y-3">
          {drills.length === 0 ? <p className="text-slate-500 text-center py-8">No drills scheduled</p> : drills.map((d) => (
            <div key={d._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between gap-3">
              <div>
                <p className="font-semibold">{d.title}</p>
                <p className="text-sm text-slate-500 capitalize">{d.drillType} · {new Date(d.scheduledDate).toLocaleString()}</p>
                {d.results?.score != null && <p className="text-xs text-emerald-500 mt-1">Score: {d.results.score}% · Response: {d.results.responseTimeMinutes}min</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-slate-500/20 capitalize">{d.status}</span>
                {canManage && d.status === 'scheduled' && (
                  <Button size="sm" variant="secondary" onClick={() => setCompleteModal(d._id)}>Complete</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule drill">
        <div className="space-y-3">
          <input className="input-field w-full" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="input-field w-full" value={form.drillType} onChange={(e) => setForm({ ...form, drillType: e.target.value })}>
            {DRILL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="datetime-local" className="input-field w-full" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
          <input className="input-field w-full" placeholder="Objectives (comma-separated)" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={schedule}>Schedule</Button>
          </div>
        </div>
      </Modal>
      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Record drill results">
        <div className="space-y-3">
          <input type="number" className="input-field w-full" placeholder="Response time (minutes)" value={results.responseTimeMinutes} onChange={(e) => setResults({ ...results, responseTimeMinutes: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className="input-field" placeholder="Accounted" value={results.personnelAccounted} onChange={(e) => setResults({ ...results, personnelAccounted: e.target.value })} />
            <input type="number" className="input-field" placeholder="Total personnel" value={results.personnelTotal} onChange={(e) => setResults({ ...results, personnelTotal: e.target.value })} />
          </div>
          <input type="number" className="input-field w-full" placeholder="Score (0-100)" value={results.score} onChange={(e) => setResults({ ...results, score: e.target.value })} />
          <textarea className="input-field w-full" placeholder="Notes" value={results.notes} onChange={(e) => setResults({ ...results, notes: e.target.value })} rows={2} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCompleteModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={complete}>Save results</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default SafetyDrillPage;
