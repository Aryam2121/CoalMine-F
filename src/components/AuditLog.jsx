import api from '../services/axios';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiDownload } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import FormField from './ui/FormField';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';
import AccessDenied from './AccessDenied';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const AuditLog = () => {
  const { can, user } = usePermissions();
  const canRead = can(PERMISSIONS.AUDIT_READ);

  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [newLog, setNewLog] = useState({ user: '', action: '', details: '' });
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/getAudit');
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view audit logs');
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) fetchAuditLogs();
    else setLoading(false);
  }, [canRead]);

  const handleCreateLog = async () => {
    if (!newLog.user?.trim() || !newLog.action?.trim()) {
      toast.error('User and action are required');
      return;
    }
    try {
      await api.post('/addAudit', newLog);
      setNewLog({ user: user?.name || '', action: '', details: '' });
      toast.success('Log entry added');
      fetchAuditLogs();
    } catch {
      toast.error('Failed to create log');
    }
  };

  const actionTypes = useMemo(() => {
    const set = new Set(logs.map((l) => l.action).filter(Boolean));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    const matchUser = (log.user || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = !actionFilter || log.action === actionFilter;
    return matchUser && matchAction;
  });

  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));
  const paged = filteredLogs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const exportCSV = () => {
    const rows = [
      'User,Action,Timestamp,Details',
      ...filteredLogs.map((l) =>
        `"${l.user}","${l.action}","${l.timestamp ? new Date(l.timestamp).toISOString() : ''}","${(l.details || '').replace(/"/g, '""')}"`
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!canRead) {
    return <AccessDenied message="Audit logs are available to Mine Admin and Super Admin only." />;
  }

  return (
    <PageShell
      title="Audit logs"
      subtitle="Immutable trail of user actions and system events"
      variant="dark"
      action={
        <Button variant="secondary" onClick={exportCSV} disabled={!filteredLogs.length}>
          <FiDownload className="inline mr-1" /> Export CSV
        </Button>
      }
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ops-kpi-grid mb-6">
        {[
          { label: 'Total entries', value: logs.length },
          { label: 'Filtered', value: filteredLogs.length },
          { label: 'Action types', value: actionTypes.length },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ops-kpi border-slate-700/70 bg-slate-900/50"
          >
            <span className="ops-kpi-label">{kpi.label}</span>
            <p className="ops-kpi-value">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="toolbar flex-wrap mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-field !pl-10"
            placeholder="Search by user…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input-field !w-auto"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        >
          <option value="">All actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="ops-panel mb-6">
        <div className="ops-panel-header">
          <h3 className="font-semibold text-white text-sm">Log system event</h3>
        </div>
        <div className="ops-panel-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="User">
              <input
                className="input-field"
                value={newLog.user}
                onChange={(e) => setNewLog({ ...newLog, user: e.target.value })}
                placeholder={user?.name || 'Username'}
              />
            </FormField>
            <FormField label="Action">
              <input
                className="input-field"
                value={newLog.action}
                onChange={(e) => setNewLog({ ...newLog, action: e.target.value })}
                placeholder="e.g. LOGIN, UPDATE_REPORT"
              />
            </FormField>
            <FormField label="Details">
              <input
                className="input-field"
                value={newLog.details}
                onChange={(e) => setNewLog({ ...newLog, details: e.target.value })}
              />
            </FormField>
          </div>
          <Button className="mt-4" onClick={handleCreateLog}>Add entry</Button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : filteredLogs.length === 0 ? (
        <EmptyState title="No audit logs" message="Create an entry or adjust filters." />
      ) : (
        <>
          <div className="ops-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Action</th>
                    <th className="text-left p-3">Timestamp</th>
                    <th className="text-left p-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((log) => (
                    <tr key={log._id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                      <td className="p-3 font-medium text-white">{log.user}</td>
                      <td className="p-3"><span className="status-pill--in-progress">{log.action}</span></td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 text-slate-400 max-w-md truncate">{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="self-center text-sm text-slate-500">Page {page} of {pageCount}</span>
              <Button variant="secondary" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
};

export default AuditLog;
