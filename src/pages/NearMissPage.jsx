import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../services/axios';
import { queueOrExecute } from '../utils/offlineQueue';
import { useSocketContext } from '../context/SocketContext';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const CATEGORIES = ['fall', 'equipment', 'gas', 'electrical', 'structural', 'vehicle', 'ppe', 'other'];

const NearMissPage = () => {
  const { activeMineId, setActiveMineId, mines } = useSocketContext();
  const { can } = usePermissions();
  const canReview = can(PERMISSIONS.SAFETY_REPORT_APPROVE);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'other', severity: 'medium', anonymous: false, location: { area: '' } });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/near-miss', { params: { mineId: activeMineId } });
      setReports(res.data?.items || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }, [activeMineId]);

  useEffect(() => { load(); }, [load]);

  const captureGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, location: { ...f.location, latitude: pos.coords.latitude, longitude: pos.coords.longitude } })),
      () => toast.error('GPS unavailable')
    );
  };

  const submit = async () => {
    try {
      const payload = { ...form, mineId: activeMineId };
      const result = await queueOrExecute(api, { method: 'post', url: '/near-miss', data: payload });
      if (result.queued) toast.info('Saved offline — will sync when connected');
      else toast.success('Near-miss reported — thank you');
      setModalOpen(false);
      if (!result.queued) load();
    } catch { toast.error('Failed to submit report'); }
  };

  const escalate = async (id) => {
    try {
      await api.post(`/near-miss/${id}/escalate-capa`);
      toast.success('Escalated to CAPA');
      load();
    } catch { toast.error('Failed to escalate'); }
  };

  return (
    <PageShell
      title="Near-Miss Reports"
      subtitle="Quick 30-second hazard reporting with optional anonymity"
      action={
        <div className="flex gap-2">
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          <Button variant="primary" onClick={() => setModalOpen(true)}>Report near-miss</Button>
        </div>
      }
    >
      {loading ? <LoadingBlock /> : (
        <div className="space-y-3">
          {reports.length === 0 ? <p className="text-slate-500 text-center py-8">No near-miss reports</p> : reports.map((r) => (
            <div key={r._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between gap-3">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-slate-500">{r.description?.slice(0, 120)}</p>
                <p className="text-xs text-slate-400 mt-1 capitalize">{r.category} · {r.severity} · {r.anonymous ? 'Anonymous' : 'Identified'}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs px-2 py-1 rounded bg-slate-500/20 capitalize">{r.status}</span>
                {canReview && r.status === 'submitted' && r.severity === 'high' && (
                  <Button size="sm" variant="secondary" onClick={() => escalate(r._id)}>Escalate to CAPA</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Report near-miss">
        <div className="space-y-3">
          <input className="input-field w-full" placeholder="Brief title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input-field w-full" placeholder="What almost happened?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-2">
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {['low', 'medium', 'high'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <input className="input-field w-full" placeholder="Location area" value={form.location.area} onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })} />
          <Button variant="secondary" size="sm" onClick={captureGPS}>Capture GPS</Button>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} />
            Submit anonymously
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>Submit</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default NearMissPage;
