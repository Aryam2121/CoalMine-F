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

const WORK_TYPES = ['hot_work', 'confined_space', 'electrical', 'excavation', 'height_work', 'other'];
const STATUS_COLORS = { pending: 'bg-amber-500/20 text-amber-300', approved: 'bg-blue-500/20 text-blue-300', active: 'bg-emerald-500/20 text-emerald-300', expired: 'bg-red-500/20 text-red-300', cancelled: 'bg-slate-500/20 text-slate-300', completed: 'bg-slate-500/20 text-slate-300' };

const emptyForm = { title: '', workType: 'hot_work', description: '', validFrom: '', validUntil: '', location: { area: '', level: '' }, hazards: '', precautions: '' };

const WorkPermitPage = () => {
  const { activeMineId, setActiveMineId, mines } = useSocketContext();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.DASHBOARD_MAINTENANCE);
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/work-permits', { params: { mineId: activeMineId } });
      setPermits(res.data?.items || []);
    } catch { toast.error('Failed to load permits'); }
    finally { setLoading(false); }
  }, [activeMineId]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    try {
      await api.post('/work-permits', {
        ...form,
        mineId: activeMineId,
        validFrom: new Date(form.validFrom),
        validUntil: new Date(form.validUntil),
        hazards: form.hazards.split(',').map((s) => s.trim()).filter(Boolean),
        precautions: form.precautions.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Permit requested');
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch { toast.error('Failed to create permit'); }
  };

  const approve = async (id) => {
    try {
      await api.post(`/work-permits/${id}/approve`);
      toast.success('Permit approved');
      load();
    } catch { toast.error('Failed to approve'); }
  };

  return (
    <PageShell
      title="Permit-to-Work"
      subtitle="Digital work permits for hot work, confined space, and electrical isolation"
      action={
        <div className="flex gap-2">
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          <Button variant="primary" onClick={() => setModalOpen(true)}>Request permit</Button>
        </div>
      }
    >
      {loading ? <LoadingBlock /> : (
        <div className="space-y-3">
          {permits.length === 0 ? <p className="text-slate-500 text-center py-8">No work permits</p> : permits.map((p) => (
            <div key={p._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-semibold">{p.permitNumber} — {p.title}</p>
                <p className="text-sm text-slate-500 capitalize">{p.workType?.replace(/_/g, ' ')} · {p.location?.area}</p>
                <p className="text-xs text-slate-400 mt-1">Valid {new Date(p.validFrom).toLocaleDateString()} – {new Date(p.validUntil).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded capitalize ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                {canManage && p.status === 'pending' && <Button size="sm" variant="secondary" onClick={() => approve(p._id)}>Approve</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Request work permit">
        <div className="space-y-3">
          <input className="input-field w-full" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="input-field w-full" value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })}>
            {WORK_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <textarea className="input-field w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" className="input-field" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
            <input type="datetime-local" className="input-field" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          </div>
          <input className="input-field w-full" placeholder="Area" value={form.location.area} onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })} />
          <input className="input-field w-full" placeholder="Hazards (comma-separated)" value={form.hazards} onChange={(e) => setForm({ ...form, hazards: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>Submit</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default WorkPermitPage;
