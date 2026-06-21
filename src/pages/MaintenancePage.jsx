import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const COLUMNS = [
  { id: 'pending', label: 'Pending', color: 'border-slate-500' },
  { id: 'in-progress', label: 'In Progress', color: 'border-blue-500' },
  { id: 'overdue', label: 'Overdue', color: 'border-red-500' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-500' },
];

const emptyForm = {
  task: '',
  description: '',
  priority: 3,
  dueDate: '',
  status: 'pending',
  category: 'preventive',
  equipmentId: '',
  equipmentName: '',
  assignedTo: '',
};

const MaintenancePage = () => {
  const { socket, activeMineId, setActiveMineId, mines } = useSocketContext();
  const { can } = usePermissions();
  const [tasks, setTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, overdueRes, userRes] = await Promise.all([
        api.get('/getallTask'),
        api.get(`/maintenance/overdue/${activeMineId || 'all'}`),
        can(PERMISSIONS.USER_MANAGE) ? api.get('/users/getAllusers') : Promise.resolve({ data: [] }),
      ]);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setOverdue(overdueRes.data?.tasks || []);
      setUsers(Array.isArray(userRes.data) ? userRes.data : userRes.data?.users || []);
    } catch (_err) {
      toast.error('Failed to load maintenance tasks');
    } finally {
      setLoading(false);
    }
  }, [activeMineId, can]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => load();
    socket.on('maintenance:created', refresh);
    socket.on('maintenance:updated', refresh);
    socket.on('maintenance:deleted', refresh);
    return () => {
      socket.off('maintenance:created', refresh);
      socket.off('maintenance:updated', refresh);
      socket.off('maintenance:deleted', refresh);
    };
  }, [socket, load]);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
    tasks.forEach((t) => {
      const col = map[t.status] ? t.status : 'pending';
      if (map[col]) map[col].push(t);
    });
    return map;
  }, [tasks]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({
      task: task.task,
      description: task.description || '',
      priority: task.priority || 3,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      status: task.status,
      category: task.category || 'preventive',
      equipmentId: task.equipmentId || '',
      equipmentName: task.equipmentName || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, mineId: activeMineId, priority: Number(form.priority) };
      if (editing) {
        await api.put(`/updateTask/${editing._id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/createTask', payload);
        toast.success('Task created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/deleteTask/${id}`);
      toast.success('Task deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const moveStatus = async (task, status) => {
    try {
      await api.put(`/updateTask/${task._id}`, { status });
      load();
    } catch {
      toast.error('Status update failed');
    }
  };

  return (
    <PageShell
      title="Maintenance Management"
      subtitle="Kanban board, assignments, priorities, and overdue tracking"
      action={
        <div className="flex gap-2">
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          {can(PERMISSIONS.DASHBOARD_MAINTENANCE) && (
            <Button variant="primary" onClick={openCreate}>New task</Button>
          )}
        </div>
      }
    >
      {overdue.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <p className="font-semibold text-red-400">{overdue.length} overdue task(s) require attention</p>
        </div>
      )}

      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className={`rounded-xl border-t-4 ${col.color} bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 min-h-[320px]`}>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3">{col.label} ({grouped[col.id]?.length || 0})</h3>
              <ul className="space-y-2">
                {(grouped[col.id] || []).map((task) => (
                  <li key={task._id} className="rounded-lg border border-slate-200 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-900/50">
                    <p className="font-medium text-sm text-slate-800 dark:text-white">{task.task}</p>
                    <p className="text-xs text-slate-500 mt-1">P{task.priority} · {task.category}</p>
                    {task.assignedTo?.name && <p className="text-xs text-slate-500">→ {task.assignedTo.name}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {can(PERMISSIONS.DASHBOARD_MAINTENANCE) && (
                        <>
                          <button type="button" className="text-xs text-amber-600" onClick={() => openEdit(task)}>Edit</button>
                          <button type="button" className="text-xs text-red-500" onClick={() => remove(task._id)}>Delete</button>
                          {col.id !== 'completed' && (
                            <button type="button" className="text-xs text-emerald-600" onClick={() => moveStatus(task, 'completed')}>Complete</button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit task' : 'New maintenance task'} size="lg">
        <form onSubmit={save} className="space-y-3">
          <input className="input-field" placeholder="Task name" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} required />
          <textarea className="input-field" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>Priority {p}</option>)}
            </select>
            <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['preventive', 'corrective', 'predictive', 'emergency'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Equipment ID" value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })} />
            <input className="input-field" placeholder="Equipment name" value={form.equipmentName} onChange={(e) => setForm({ ...form, equipmentName: e.target.value })} />
          </div>
          {users.length > 0 && (
            <select className="input-field" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

export default MaintenancePage;
