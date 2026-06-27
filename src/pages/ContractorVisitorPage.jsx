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

const BRIEFING_ITEMS = ['PPE requirements', 'Emergency exits', 'Gas detection', 'Restricted zones', 'Host contact'];

const ContractorVisitorPage = () => {
  const { activeMineId, setActiveMineId, mines } = useSocketContext();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.COMPLIANCE_WRITE);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'visitor', name: '', company: '', phone: '', purpose: '', safetyBriefingCompleted: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/contractors', { params: { mineId: activeMineId, status: 'checked_in' } });
      setRecords(res.data?.items || []);
    } catch { toast.error('Failed to load records'); }
    finally { setLoading(false); }
  }, [activeMineId]);

  useEffect(() => { load(); }, [load]);

  const checkIn = async () => {
    try {
      await api.post('/contractors', {
        ...form,
        mineId: activeMineId,
        briefingItems: BRIEFING_ITEMS.map((item) => ({ item, completed: form.safetyBriefingCompleted })),
      });
      toast.success('Checked in');
      setModalOpen(false);
      load();
    } catch { toast.error('Check-in failed'); }
  };

  const checkOut = async (id) => {
    try {
      await api.post(`/contractors/${id}/checkout`);
      toast.success('Checked out');
      load();
    } catch { toast.error('Check-out failed'); }
  };

  const underground = records.filter((r) => r.status === 'checked_in');

  return (
    <PageShell
      title="Contractors & Visitors"
      subtitle="Track non-employee personnel underground for emergency headcount"
      action={
        <div className="flex gap-2 items-center">
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          <span className="text-sm text-slate-500">{underground.length} on site</span>
          {canManage && <Button variant="primary" onClick={() => setModalOpen(true)}>Check in</Button>}
        </div>
      }
    >
      {loading ? <LoadingBlock /> : (
        <div className="space-y-3">
          {records.length === 0 ? <p className="text-slate-500 text-center py-8">No one checked in</p> : records.map((r) => (
            <div key={r._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between gap-3">
              <div>
                <p className="font-semibold">{r.name} <span className="text-xs text-slate-400 capitalize">({r.type})</span></p>
                <p className="text-sm text-slate-500">{r.company} · {r.purpose}</p>
                <p className="text-xs text-slate-400 mt-1">In: {new Date(r.checkInAt).toLocaleString()}</p>
                {!r.safetyBriefingCompleted && <p className="text-xs text-amber-500 mt-1">Briefing incomplete</p>}
              </div>
              {canManage && r.status === 'checked_in' && (
                <Button size="sm" variant="secondary" onClick={() => checkOut(r._id)}>Check out</Button>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Check in contractor/visitor">
        <div className="space-y-3">
          <select className="input-field w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="visitor">Visitor</option>
            <option value="contractor">Contractor</option>
          </select>
          <input className="input-field w-full" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field w-full" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="input-field w-full" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field w-full" placeholder="Purpose of visit" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.safetyBriefingCompleted} onChange={(e) => setForm({ ...form, safetyBriefingCompleted: e.target.checked })} />
            Safety briefing completed
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={checkIn}>Check in</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default ContractorVisitorPage;
