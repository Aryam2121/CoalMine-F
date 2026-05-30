import api from '../services/axios';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import {
  FaUserCheck,
  FaUserTimes,
  FaUsers,
  FaSearch,
  FaSyncAlt,
  FaCalendarCheck,
} from 'react-icons/fa';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

ChartJS.register(ArcElement, Tooltip, Legend);

const ROLE_OPTIONS = ['worker', 'Inspector', 'Safety Manager', 'Shift Incharge'];

const toDateStr = (d) => {
  const x = Array.isArray(d) ? d[0] : d instanceof Date ? d : new Date(d);
  if (!(x instanceof Date) || Number.isNaN(x.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const userIdStr = (u) => {
  const raw = u?._id ?? u?.id ?? u?.userId;
  if (raw == null) return '';
  if (typeof raw === 'object' && typeof raw.toHexString === 'function') return raw.toHexString();
  return String(raw).trim();
};

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

const KPI_STYLES = {
  total: 'border-slate-700/70 bg-slate-800/80',
  present: 'border-emerald-500/25 bg-emerald-950/40',
  absent: 'border-red-500/25 bg-red-950/40',
  rate: 'border-amber-500/25 bg-amber-950/30',
};

const AttendancePage = () => {
  const { can, user } = usePermissions();
  const canManageAll = can(PERMISSIONS.ATTENDANCE_MANAGE_ALL);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRole, setSelectedRole] = useState('worker');
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [view, setView] = useState('all');
  const [loadError, setLoadError] = useState('');

  const dateStr = toDateStr(selectedDate);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.get('/attendance', {
        params: {
          date: dateStr,
          ...(canManageAll ? { role: selectedRole } : {}),
        },
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list);
      const map = {};
      list.forEach((u) => {
        map[userIdStr(u)] = u.status === 'Present' ? 'Present' : 'Absent';
      });
      setStatusMap(map);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Could not load attendance. Check login and backend.';
      setLoadError(msg);
      setUsers([]);
      setStatusMap({});
    } finally {
      setLoading(false);
    }
  }, [selectedRole, dateStr, canManageAll]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (row) => {
    const id = userIdStr(row);
    if (!id) {
      toast.error('Invalid user record — refresh and try again');
      return;
    }
    const nextStatus = statusMap[id] === 'Present' ? 'Absent' : 'Present';
    const prevStatus = statusMap[id];
    setStatusMap((prev) => ({ ...prev, [id]: nextStatus }));
    setSavingId(id);
    try {
      await api.put('/attendance', { userId: id, date: dateStr, status: nextStatus });
      toast.success(`${row.name} → ${nextStatus}`, { autoClose: 1800 });
    } catch (err) {
      setStatusMap((prev) => ({ ...prev, [id]: prevStatus }));
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.response?.status === 429 ? 'Too many requests — wait a moment' : 'Failed to save');
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  const markAllPresent = async () => {
    const targets = filtered;
    if (!targets.length) return;
    if (!window.confirm(`Mark all ${targets.length} visible staff as Present for ${dateStr}?`)) return;

    setBulkSaving(true);
    try {
      if (canManageAll) {
        await api.put('/attendance/bulk', {
          date: dateStr,
          status: 'Present',
          userIds: targets.map((u) => userIdStr(u)),
        });
      }
      toast.success(`Marked ${targets.length} as present`);
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bulk update failed');
    } finally {
      setBulkSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const id = userIdStr(u);
      const matchSearch =
        !searchTerm ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (view === 'present') return statusMap[id] === 'Present';
      if (view === 'absent') return statusMap[id] !== 'Present';
      return true;
    });
  }, [users, searchTerm, view, statusMap]);

  const present = useMemo(
    () => Object.values(statusMap).filter((s) => s === 'Present').length,
    [statusMap]
  );
  const total = users.length;
  const absent = total - present;
  const rate = total ? Math.round((present / total) * 100) : 0;

  const chartData = useMemo(
    () => ({
      labels: ['Present', 'Absent'],
      datasets: [
        {
          data: total ? [present, absent] : [1, 0],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    }),
    [present, absent, total]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 12, usePointStyle: true, boxWidth: 8 },
      },
    },
  };

  return (
    <PageShell
      variant="dark"
      title="Attendance"
      subtitle={
        canManageAll
          ? `Daily roll call · ${dateStr}`
          : `Your attendance · ${dateStr}`
      }
      action={
        canManageAll ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
              <FaSyncAlt /> Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={markAllPresent}
              disabled={loading || bulkSaving || !filtered.length}
            >
              <FaUserCheck /> {bulkSaving ? 'Saving…' : 'Mark all present'}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="ops-kpi-grid">
        {[
          { key: 'total', label: 'Total staff', value: total, icon: <FaUsers className="text-slate-400" /> },
          { key: 'present', label: 'Present', value: present, icon: <FaUserCheck className="text-emerald-400" /> },
          { key: 'absent', label: 'Absent', value: absent, icon: <FaUserTimes className="text-red-400" /> },
          { key: 'rate', label: 'Attendance rate', value: `${rate}%`, icon: <FaCalendarCheck className="text-amber-400" /> },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`ops-kpi ${KPI_STYLES[kpi.key]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="ops-kpi-label">{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className="ops-kpi-value text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center p-4 rounded-xl mb-0 bg-slate-900/50 border border-slate-700">
            {canManageAll ? (
              <select
                className="input-field !w-full sm:!w-auto min-w-[140px] !bg-slate-800 !border-slate-600 !text-slate-100"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-slate-400 self-center px-2">
                Viewing: <span className="text-white font-medium">{user?.name || 'You'}</span>
              </span>
            )}
            <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
              <input
                className="input-field w-full !pl-9 !bg-slate-800 !border-slate-600 !text-slate-100"
                placeholder="Search name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="ops-tabs w-full sm:w-auto !mb-0 !p-1 !bg-slate-800/80 !border-slate-700">
              {[
                { id: 'all', label: 'All' },
                { id: 'present', label: 'Present' },
                { id: 'absent', label: 'Absent' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={view === t.id ? 'ops-tab--active' : 'ops-tab'}
                  onClick={() => setView(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loadError && !loading && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200 flex flex-wrap items-center justify-between gap-2">
              <span>{loadError}</span>
              <Button variant="secondary" onClick={fetchUsers}>
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <LoadingBlock label="Loading attendance…" />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No records"
              message={
                total === 0
                  ? `No users with role "${selectedRole}" found. Try another role or date.`
                  : 'No users match your search or filter.'
              }
            />
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto scrollbar-hidden pr-1">
              {filtered.map((u, i) => {
                const id = userIdStr(u);
                const isPresent = statusMap[id] === 'Present';
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    className="ops-person-row !bg-slate-800/40 !border-slate-700"
                  >
                    <div className="ops-avatar">{initials(u.name)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{u.name}</p>
                      <p className="text-sm text-slate-400 truncate">{u.email || u.role}</p>
                    </div>
                    <span className={isPresent ? 'status-pill--reviewed' : 'risk-pill--high'}>
                      {isPresent ? 'Present' : 'Absent'}
                    </span>
                    <Button
                      variant={isPresent ? 'secondary' : 'success'}
                      className="!py-2 !text-xs shrink-0 min-w-[110px]"
                      disabled={savingId === id || bulkSaving}
                      onClick={() => toggleStatus(u)}
                    >
                      {savingId === id ? 'Saving…' : isPresent ? 'Mark absent' : 'Mark present'}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="ops-panel !bg-slate-900/70 !border-slate-700">
            <div className="ops-panel-head !border-slate-800">
              <h3 className="ops-panel-title">Distribution</h3>
              <span className="text-xs text-slate-500">{present} / {total}</span>
            </div>
            <div className="ops-panel-body h-[220px]">
              {total > 0 ? (
                <Doughnut data={chartData} options={chartOptions} />
              ) : (
                <p className="text-sm text-slate-500 text-center py-16">No data for chart</p>
              )}
            </div>
          </div>
          <div className="ops-panel !bg-slate-900/70 !border-slate-700">
            <div className="ops-panel-head !border-slate-800">
              <h3 className="ops-panel-title">
                <FaCalendarCheck className="text-amber-500" /> Select date
              </h3>
            </div>
            <div className="ops-panel-body">
              <Calendar
                value={selectedDate}
                onChange={(d) => setSelectedDate(d)}
                className="attendance-calendar !border-0 !w-full !bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
    </PageShell>
  );
};

export default AttendancePage;
