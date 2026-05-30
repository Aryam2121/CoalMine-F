import React, { useEffect, useState, useContext, useCallback } from 'react';
import api from '../services/axios';
import { AuthContext } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';
import { AiOutlineWarning, AiOutlineExclamationCircle } from 'react-icons/ai';
import { FiCheckCircle } from 'react-icons/fi';
import { MdDeleteForever } from 'react-icons/md';

const Alerts = () => {
  const { user } = useContext(AuthContext);
  const { can } = usePermissions();
  const canCreate = can(PERMISSIONS.ALERT_CREATE);
  const canResolve = can(PERMISSIONS.ALERT_RESOLVE);
  const canResolveAll = can(PERMISSIONS.ALERT_RESOLVE_ALL);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('warning');
  const [filterType, setFilterType] = useState('');
  const [resolved, setResolved] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts/getallalerts', {
        params: {
          type: filterType || undefined,
          resolved,
          page,
          limit: 12,
          sort: '-timestamp',
        },
      });
      setAlerts(res.data.alerts || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      showToast('error', 'Failed to fetch alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filterType, resolved, page]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAddAlert = async () => {
    if (!message.trim()) {
      showToast('error', 'Please enter an alert message.');
      return;
    }
    try {
      const payload = {
        message: message.trim(),
        type,
        ...(user?._id ? { createdBy: user._id } : {}),
      };
      const res = await api.post('/alerts/addAlert', payload);
      setAlerts((prev) => [res.data, ...prev]);
      setMessage('');
      setType('warning');
      setShowModal(false);
      showToast('success', 'Alert added successfully.');
    } catch {
      showToast('error', 'Error adding alert. Please try again.');
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await api.put(`/alerts/resolveAlert/${id}`, {
        resolvedBy: user?._id,
      });
      setAlerts((prev) =>
        prev.map((alert) => (alert._id === id ? { ...alert, resolved: true } : alert))
      );
      showToast('success', 'Alert resolved.');
    } catch {
      showToast('error', 'Failed to resolve alert.');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/deleteAlert/${id}`);
      setAlerts((prev) => prev.filter((alert) => alert._id !== id));
      showToast('success', 'Alert deleted.');
    } catch {
      showToast('error', 'Error deleting alert.');
    }
  };

  const handleMarkAllResolved = async () => {
    try {
      await api.put('/alerts/resolveAllAlerts', { resolvedBy: user?._id });
      await fetchAlerts();
      showToast('success', 'All alerts resolved.');
    } catch {
      showToast('error', 'Error resolving all alerts.');
    }
  };

  return (
    <PageShell
      variant="dark"
      title="Real-time Safety Alerts"
      subtitle="Monitor, resolve, and track critical mine safety events"
      action={
        <div className="flex flex-wrap gap-2">
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="input-field !w-auto !py-2 !bg-slate-800 !border-slate-600 !text-slate-100">
            <option value="">All types</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <select value={resolved === null ? '' : String(resolved)} onChange={(e) => { const v = e.target.value; setResolved(v === '' ? null : v === 'true'); setPage(1); }} className="input-field !w-auto !py-2 !bg-slate-800 !border-slate-600 !text-slate-100">
            <option value="">All status</option>
            <option value="false">Open</option>
            <option value="true">Resolved</option>
          </select>
          {canCreate && <Button onClick={() => setShowModal(true)}>Add alert</Button>}
          {canResolveAll && <Button variant="success" onClick={handleMarkAllResolved}>Resolve all</Button>}
        </div>
      }
    >
      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-4 py-3 rounded-xl text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`} role="status">
          {toast.message}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel dark:bg-slate-900 !max-w-md">
            <h3 className="text-xl font-semibold mb-4">New alert</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the safety issue…"
              rows={3}
              className="w-full rounded-lg bg-gray-700 border border-gray-600 p-3 mb-4 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg bg-gray-700 border border-gray-600 p-3 mb-6 text-gray-100"
            >
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
              <button type="button" onClick={handleAddAlert} className="btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="loading-spinner border-t-teal-400" />
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState icon="✓" title="No alerts" message="No alerts match your filters." />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <li
              key={alert._id}
              className={`relative rounded-2xl bg-gray-800/90 p-5 shadow-xl border-t-4 ${
                alert.type === 'critical' ? 'border-red-500' : 'border-amber-400'
              } ${alert.resolved ? 'opacity-75' : ''}`}
            >
              <div className="flex gap-4">
                <span
                  className={`text-4xl ${
                    alert.type === 'critical' ? 'text-red-500' : 'text-amber-400'
                  }`}
                >
                  {alert.type === 'critical' ? <AiOutlineExclamationCircle /> : <AiOutlineWarning />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    {alert.type}
                    {alert.resolved && (
                      <span className="ml-2 text-green-400">· Resolved</span>
                    )}
                  </p>
                  <p className="mt-2 text-gray-100">{alert.message}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              {canResolve && (
                <div className="flex justify-end gap-2 mt-4">
                  {canResolve && !alert.resolved && (
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert._id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-sm hover:bg-green-700"
                    >
                      <FiCheckCircle /> Resolve
                    </button>
                  )}
                  {canResolve && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAlert(alert._id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-sm hover:bg-red-700"
                    >
                      <MdDeleteForever /> Delete
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-gray-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-gray-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </PageShell>
  );
};

export default Alerts;
