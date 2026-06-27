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

const STATUS_COLORS = { operational: 'text-emerald-400', warning: 'text-amber-400', malfunction: 'text-red-400', offline: 'text-slate-400', maintenance: 'text-blue-400', decommissioned: 'text-slate-500' };
const emptyForm = { equipmentId: '', name: '', type: '', criticality: 'medium', location: { area: '' }, manufacturer: '', installDate: '' };

const EquipmentRegistryPage = () => {
  const { activeMineId, setActiveMineId, mines } = useSocketContext();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.DASHBOARD_MAINTENANCE);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/equipment-registry', { params: { mineId: activeMineId } });
      setItems(res.data?.items || []);
    } catch { toast.error('Failed to load equipment'); }
    finally { setLoading(false); }
  }, [activeMineId]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    try {
      await api.post('/equipment-registry', { ...form, mineId: activeMineId, installDate: form.installDate || undefined });
      toast.success('Equipment registered');
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch { toast.error('Failed to register equipment'); }
  };

  return (
    <PageShell
      title="Equipment Registry"
      subtitle="Asset lifecycle tracking with criticality, location, and maintenance linkage"
      action={
        <div className="flex gap-2">
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          {canManage && <Button variant="primary" onClick={() => setModalOpen(true)}>Register equipment</Button>}
        </div>
      }
    >
      {loading ? <LoadingBlock /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? <p className="text-slate-500 col-span-full text-center py-8">No equipment registered</p> : items.map((eq) => (
            <div key={eq._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <p className="font-semibold">{eq.name}</p>
                <span className={`text-xs capitalize ${STATUS_COLORS[eq.status]}`}>{eq.status}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{eq.equipmentId} · {eq.type}</p>
              <p className="text-xs text-slate-400 mt-2">{eq.location?.area || 'No location'} · {eq.criticality} criticality</p>
              {eq.failureCount > 0 && <p className="text-xs text-red-400 mt-1">{eq.failureCount} failure(s) recorded</p>}
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register equipment">
        <div className="space-y-3">
          <input className="input-field w-full" placeholder="Equipment ID" value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })} />
          <input className="input-field w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field w-full" placeholder="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <select className="input-field w-full" value={form.criticality} onChange={(e) => setForm({ ...form, criticality: e.target.value })}>
            {['low', 'medium', 'high', 'critical'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="input-field w-full" placeholder="Location area" value={form.location.area} onChange={(e) => setForm({ ...form, location: { area: e.target.value } })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>Register</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default EquipmentRegistryPage;
