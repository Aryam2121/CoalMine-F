import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, CheckCircle, Bell, RefreshCw } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/axios';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const Notifications = () => {
  const { can } = usePermissions();
  const canResolve = can(PERMISSIONS.ALERT_RESOLVE);

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/alerts/getallalerts', {
        params: { limit: 50, page: 1, sort: '-timestamp' },
      });
      setNotifications(
        (data.alerts || []).map((a) => ({
          id: a._id,
          message: a.message,
          read: a.resolved,
          type: a.type,
          timestamp: a.timestamp,
        }))
      );
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const markResolved = async (id) => {
    try {
      await api.put(`/alerts/resolveAlert/${id}`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      toast.success('Marked resolved');
    } catch {
      toast.error('Could not resolve');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/alerts/deleteAlert/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Could not delete');
    }
  };

  const handleBulkResolve = () => {
    selectedNotifications.forEach((id) => markResolved(id));
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach((id) => deleteNotification(id));
    setSelectedNotifications([]);
  };

  const toggleSelect = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'read' && !n.read) return false;
      if (filter === 'unread' && n.read) return false;
      if (searchQuery && !n.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [notifications, filter, searchQuery]);

  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      critical: notifications.filter((n) => !n.read && n.type === 'critical').length,
    }),
    [notifications]
  );

  return (
    <PageShell
      title="Notifications"
      subtitle="Safety alerts and system messages from your mine"
      variant="dark"
      action={
        <Button variant="secondary" onClick={fetchAlerts}>
          <RefreshCw className="w-4 h-4 inline mr-1" /> Refresh
        </Button>
      }
    >
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="ops-kpi-grid mb-6">
        {[
          { label: 'Total', value: stats.total, icon: <Bell className="text-slate-400" /> },
          { label: 'Unread', value: stats.unread, icon: <Bell className="text-amber-400" /> },
          { label: 'Critical open', value: stats.critical, icon: <Bell className="text-red-400" /> },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ops-kpi border-slate-700/70 bg-slate-900/50"
          >
            <div className="flex justify-between mb-1">{kpi.icon}<span className="ops-kpi-label">{kpi.label}</span></div>
            <p className="ops-kpi-value">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="toolbar flex-wrap">
        {['all', 'unread', 'read'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === type
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="input-field !pl-10"
            placeholder="Search notifications…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {canResolve && selectedNotifications.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="success" onClick={handleBulkResolve}>
            <CheckCircle className="w-4 h-4" /> Resolve selected
          </Button>
          <Button variant="danger" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4" /> Delete selected
          </Button>
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading notifications…" />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState title="No notifications" message="You're all caught up — or try another filter." />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, i) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`ops-panel ${!notification.read ? 'ring-1 ring-amber-500/30 border-l-4 border-l-amber-500' : ''}`}
            >
              <div className="ops-panel-body flex items-start gap-3">
                {canResolve && (
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelect(notification.id)}
                    className="mt-1 rounded border-slate-600"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2 items-center">
                    {new Date(notification.timestamp).toLocaleString()}
                    {notification.type === 'critical' && (
                      <span className="risk-pill--high text-[10px]">Critical</span>
                    )}
                    {notification.read && (
                      <span className="status-pill--reviewed text-[10px]">Resolved</span>
                    )}
                  </p>
                </div>
                {canResolve && (
                  <div className="flex gap-1 shrink-0">
                    {!notification.read && (
                      <button
                        type="button"
                        className="btn-ghost !p-2 text-emerald-400"
                        onClick={() => markResolved(notification.id)}
                        title="Mark resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-ghost !p-2 text-red-400"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default Notifications;
