import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import api from '../services/axios';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';
import { useSocketContext } from '../context/SocketContext';

const STATUS_BADGE = {
  valid: 'text-emerald-400',
  expiring_soon: 'text-amber-400',
  expired: 'text-red-400',
  scheduled: 'text-blue-400',
  overdue: 'text-red-400',
  completed: 'text-emerald-400',
};

const ComplianceCenterPage = () => {
  const { can, isManager } = usePermissions();
  const { activeMineId } = useSocketContext();
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'certificate',
    name: '',
    description: '',
    expiryDate: '',
    scheduledDate: '',
    issuingAuthority: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeMineId ? { mineId: activeMineId } : {};
      const [recRes, remRes] = await Promise.all([
        api.get('/compliance-center', { params }),
        api.get('/compliance-center/reminders'),
      ]);
      let records = recRes.data.records || [];
      if (!records.length && activeMineId) {
        const allRes = await api.get('/compliance-center');
        records = allRes.data.records || [];
      }
      setRecords(records);
      setReminders(remRes.data.reminders || []);
    } catch {
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, [activeMineId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post('/compliance-center', { ...form, mineId: activeMineId });
      toast.success('Record created');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const markComplete = async (id) => {
    try {
      await api.put(`/compliance-center/${id}`, { completedDate: new Date(), status: 'completed' });
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const processReminders = async () => {
    try {
      const { data } = await api.post('/compliance-center/process-reminders');
      toast.success(`Reminders processed: ${data.sent ?? 0} sent`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reminder processing failed');
    }
  };

  return (
    <PageShell
      title="Compliance Center"
      subtitle="Certification expiry, inspection schedules, and automated reminders"
      variant="dark"
      action={
        <div className="flex gap-2">
          {isManager && (
            <Button variant="secondary" onClick={processReminders}>Process reminders</Button>
          )}
          {can(PERMISSIONS.COMPLIANCE_WRITE) && (
            <Button variant="primary" onClick={() => setModalOpen(true)}>Add record</Button>
          )}
        </div>
      }
    >
      {reminders.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="font-semibold text-amber-400">{reminders.length} upcoming or overdue compliance item(s)</p>
          <ul className="mt-2 text-sm text-slate-300 space-y-1">
            {reminders.slice(0, 5).map((r) => (
              <li key={r._id}>• {r.name} — {r.status} {r.daysUntil != null && `(${r.daysUntil}d)`}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Due / Expiry</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-t border-slate-700 text-slate-300">
                  <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3 capitalize">{r.type}</td>
                  <td className={`px-4 py-3 capitalize ${STATUS_BADGE[r.status] || ''}`}>{r.status?.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    {r.type === 'certificate' && r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : ''}
                    {r.type === 'inspection' && r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : ''}
                  </td>
                  <td className="px-4 py-3">
                    {can(PERMISSIONS.COMPLIANCE_WRITE) && r.type === 'inspection' && r.status !== 'completed' && (
                      <button type="button" className="text-emerald-400 text-xs" onClick={() => markComplete(r._id)}>Mark complete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && <p className="text-center text-slate-500 py-8">No compliance records</p>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add compliance record">
        <form onSubmit={save} className="space-y-3">
          <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="certificate">Certificate</option>
            <option value="inspection">Inspection</option>
          </select>
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <textarea className="input-field" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {form.type === 'certificate' ? (
            <input type="date" className="input-field" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          ) : (
            <input type="date" className="input-field" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
          )}
          <input className="input-field" placeholder="Issuing authority" value={form.issuingAuthority} onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

export default ComplianceCenterPage;
