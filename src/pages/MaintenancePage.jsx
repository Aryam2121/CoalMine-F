import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaPlay,
  FaClock,
  FaUser,
  FaWrench,
  FaExclamationTriangle,
  FaCalendarAlt,
} from 'react-icons/fa';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import EmptyState from '../components/ui/EmptyState';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const COLUMNS = [
  { id: 'pending', label: 'Pending', dot: 'bg-slate-400', head: 'bg-slate-500/10' },
  { id: 'in-progress', label: 'In Progress', dot: 'bg-blue-400', head: 'bg-blue-500/10' },
  { id: 'overdue', label: 'Overdue', dot: 'bg-red-400', head: 'bg-red-500/10' },
  { id: 'completed', label: 'Completed', dot: 'bg-emerald-400', head: 'bg-emerald-500/10' },
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
  isRecurring: false,
  recurringInterval: 'weekly',
};

const priorityClass = (p) => {
  const n = Number(p) || 3;
  if (n <= 1) return 'maint-priority--1';
  if (n <= 2) return 'maint-priority--2';
  if (n <= 3) return 'maint-priority--3';
  return 'maint-priority--low';
};

const formatDue = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const overdue = d < new Date() && d.toDateString() !== new Date().toDateString();
  return { label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), overdue };
};

const MaintenancePage = () => {
  const { socket, activeMineId, setActiveMineId, mines } = useSocketContext();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.DASHBOARD_MAINTENANCE);
  const [tasks, setTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [schedule, setSchedule] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, overdueRes, userRes, schedRes] = await Promise.all([
        api.get('/getallTask'),
        api.get(`/maintenance/overdue/${activeMineId || 'all'}`),
        can(PERMISSIONS.USER_MANAGE) ? api.get('/users/getAllusers') : Promise.resolve({ data: [] }),
        api.get('/maintenance/schedule', { params: { mineId: activeMineId } }).catch(() => ({ data: { schedule: [] } })),
      ]);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setOverdue(overdueRes.data?.tasks || []);
      setUsers(Array.isArray(userRes.data) ? userRes.data : userRes.data?.users || []);
      setSchedule(schedRes.data?.schedule || []);
    } catch {
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

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: grouped.pending?.length || 0,
      inProgress: grouped['in-progress']?.length || 0,
      overdue: grouped.overdue?.length || 0,
      completed: grouped.completed?.length || 0,
    }),
    [tasks.length, grouped]
  );

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
      isRecurring: task.recurringSchedule?.isRecurring || false,
      recurringInterval: task.recurringSchedule?.interval || 'weekly',
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        mineId: activeMineId,
        priority: Number(form.priority),
        recurringSchedule: form.isRecurring
          ? { isRecurring: true, interval: form.recurringInterval, intervalValue: 1 }
          : { isRecurring: false },
      };
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
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === status)?.label || status}`);
      load();
    } catch {
      toast.error('Status update failed');
    }
  };

  const renderTaskCard = (task, colId) => {
    const due = formatDue(task.dueDate);
    const assignee = task.assignedTo?.name || (typeof task.assignedTo === 'string' ? null : null);

    return (
      <motion.li
        key={task._id}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="maint-card"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="maint-card-title">{task.task}</p>
          <span className={priorityClass(task.priority)}>P{task.priority || 3}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="maint-category">{task.category || 'general'}</span>
          {task.recurringSchedule?.isRecurring && (
            <span className="maint-category !bg-violet-500/20 !text-violet-300">↻ Recurring</span>
          )}
        </div>

        <div className="maint-card-meta">
          {task.equipmentName && (
            <p className="flex items-center gap-1.5">
              <FaWrench className="text-slate-500 shrink-0" />
              {task.equipmentName}
              {task.equipmentId && <span className="text-slate-600">· {task.equipmentId}</span>}
            </p>
          )}
          {assignee && (
            <p className="flex items-center gap-1.5">
              <FaUser className="text-slate-500 shrink-0" />
              {assignee}
            </p>
          )}
          {due && (
            <p className={`flex items-center gap-1.5 ${due.overdue ? 'text-red-400' : ''}`}>
              <FaCalendarAlt className="shrink-0" />
              Due {due.label}
              {due.overdue && ' · Overdue'}
            </p>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{task.description}</p>
        )}

        {canManage && (
          <div className="maint-card-actions">
            <button type="button" className="maint-action-btn--edit" onClick={() => openEdit(task)}>
              <FaEdit /> Edit
            </button>
            <button type="button" className="maint-action-btn--delete" onClick={() => remove(task._id)}>
              <FaTrash /> Delete
            </button>
            {colId === 'pending' && (
              <button type="button" className="maint-action-btn--start" onClick={() => moveStatus(task, 'in-progress')}>
                <FaPlay /> Start
              </button>
            )}
            {colId !== 'completed' && (
              <button type="button" className="maint-action-btn--complete" onClick={() => moveStatus(task, 'completed')}>
                <FaCheck /> Complete
              </button>
            )}
          </div>
        )}
      </motion.li>
    );
  };

  return (
    <PageShell
      title="Maintenance Management"
      subtitle="Kanban board, assignments, priorities, and overdue tracking"
      variant="dark"
      action={
        <div className="flex flex-wrap items-center gap-2">
          {mines.length > 0 && (
            <select
              className="input-field !w-auto !py-2 !min-w-[180px]"
              value={activeMineId || ''}
              onChange={(e) => setActiveMineId(e.target.value)}
            >
              {mines.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          )}
          {canManage && (
            <Button variant="primary" onClick={openCreate}>
              <FaPlus /> New task
            </Button>
          )}
        </div>
      }
    >
      {!loading && (
        <div className="maint-kpi-grid">
          {[
            { label: 'Total tasks', value: stats.total },
            { label: 'Pending', value: stats.pending },
            { label: 'In progress', value: stats.inProgress },
            { label: 'Overdue', value: stats.overdue, alert: stats.overdue > 0 },
            { label: 'Completed', value: stats.completed },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`maint-kpi ${s.alert ? 'border-red-500/40 bg-red-500/5' : ''}`}
            >
              <span className="maint-kpi-label">{s.label}</span>
              <p className={`maint-kpi-value ${s.alert ? 'text-red-400' : ''}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {overdue.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex items-start gap-3"
        >
          <FaExclamationTriangle className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-300">{overdue.length} overdue task(s) require attention</p>
            <p className="text-sm text-red-400/80 mt-1">Review the Overdue column and reassign or complete them promptly.</p>
          </div>
        </motion.div>
      )}

      {schedule.length > 0 && (
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <FaClock /> Upcoming schedule (90 days)
          </p>
          <div className="flex flex-wrap gap-2">
            {schedule.slice(0, 8).map((t) => (
              <span
                key={t._id}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600 text-slate-300"
              >
                {new Date(t.dueDate).toLocaleDateString()} — {t.task}
                {t.recurringSchedule?.isRecurring && ' ↻'}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading maintenance board…" />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No maintenance tasks yet"
          message="Create your first task to start tracking equipment maintenance."
          action={canManage ? <Button onClick={openCreate}><FaPlus /> New task</Button> : null}
        />
      ) : (
        <div className="maint-kanban">
          {COLUMNS.map((col, colIdx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.06 }}
              className="maint-column"
            >
              <div className={`maint-column-head ${col.head}`}>
                <div className="maint-column-title">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                  {col.label}
                </div>
                <span className="maint-column-count">{grouped[col.id]?.length || 0}</span>
              </div>

              <ul className="maint-column-body">
                {(grouped[col.id] || []).length === 0 ? (
                  <li className="maint-empty-col">
                    <FaWrench className="text-slate-600 text-lg mb-2" />
                    <p className="text-xs text-slate-500">No {col.label.toLowerCase()} tasks</p>
                  </li>
                ) : (
                  (grouped[col.id] || []).map((task) => renderTaskCard(task, col.id))
                )}
              </ul>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit task' : 'New maintenance task'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <FormField label="Task name">
            <input className="input-field" placeholder="e.g. Gas detector calibration" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} required />
          </FormField>
          <FormField label="Description">
            <textarea className="input-field" rows={3} placeholder="Details, location, safety notes…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Priority">
              <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>P{p} — {p <= 1 ? 'Critical' : p <= 2 ? 'High' : p <= 3 ? 'Medium' : 'Low'}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </FormField>
            <FormField label="Due date">
              <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </FormField>
            <FormField label="Category">
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['preventive', 'corrective', 'predictive', 'emergency'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Equipment ID">
              <input className="input-field" placeholder="EQ-001" value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })} />
            </FormField>
            <FormField label="Equipment name">
              <input className="input-field" placeholder="Ventilation fan" value={form.equipmentName} onChange={(e) => setForm({ ...form, equipmentName: e.target.value })} />
            </FormField>
          </div>
          {users.length > 0 && (
            <FormField label="Assigned to">
              <select className="input-field" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </FormField>
          )}
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} className="rounded border-slate-600" />
            Recurring maintenance task
          </label>
          {form.isRecurring && (
            <FormField label="Repeat interval">
              <select className="input-field" value={form.recurringInterval} onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </FormField>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editing ? 'Save changes' : 'Create task'}</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

export default MaintenancePage;
