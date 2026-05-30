import api from '../services/axios';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiSearch, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MdCheckCircle, MdPending, MdCancel } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const statusConfig = {
  Approved: { pill: 'status-pill--reviewed', icon: MdCheckCircle },
  Pending: { pill: 'status-pill--pending', icon: MdPending },
  Rejected: { pill: 'risk-pill--high', icon: MdCancel },
};

const emptyForm = { name: '', date: '', status: 'Pending', details: '' };

export default function ComplianceReports() {
  const { can } = usePermissions();
  const canWrite = can(PERMISSIONS.COMPLIANCE_WRITE);

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editReport, setEditReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/getReports', {
        params: { search, status: statusFilter || undefined, page, limit: 12 },
      });
      setReports(data.reports || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load compliance reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search, statusFilter, page]);

  const stats = useMemo(() => ({
    total: reports.length,
    approved: reports.filter((r) => r.status === 'Approved').length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    rejected: reports.filter((r) => r.status === 'Rejected').length,
  }), [reports]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchDate = !dateFilter || (r.date && r.date >= dateFilter);
      const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase());
      return matchDate && matchSearch;
    });
  }, [reports, search, dateFilter]);

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error('Report name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editReport) {
        const id = editReport._id || editReport.id;
        const { data } = await api.put(`/updateReport/${id}`, form);
        setReports((prev) => prev.map((r) => ((r._id || r.id) === id ? data : r)));
        toast.success('Report updated');
      } else {
        const { data } = await api.post('/addReports', form);
        setReports((prev) => [data, ...prev]);
        toast.success('Report added');
      }
      setForm(emptyForm);
      setEditReport(null);
      setModalOpen(false);
      fetchReports();
    } catch {
      toast.error('Failed to save report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Delete this compliance report?')) return;
    try {
      await api.delete(`/deleteReport/${reportId}`);
      setReports((prev) => prev.filter((r) => (r._id || r.id) !== reportId));
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (report) => {
    setEditReport(report);
    setForm({
      name: report.name || '',
      date: report.date || '',
      status: report.status || 'Pending',
      details: report.details || '',
    });
    setModalOpen(true);
  };

  const exportCSV = () => {
    const rows = [
      'Report Name,Date,Status,Details',
      ...filtered.map((r) => `"${r.name}","${r.date}","${r.status}","${(r.details || '').replace(/"/g, '""')}"`),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compliance_reports.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <PageShell
      title="Compliance reports"
      subtitle="Regulatory submissions, audits, and approval tracking"
      variant="dark"
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportCSV}>
            <FiDownload className="inline mr-1" /> Export
          </Button>
          {canWrite && (
            <Button onClick={() => { setEditReport(null); setForm(emptyForm); setModalOpen(true); }}>
              <FiPlus className="inline mr-1" /> New report
            </Button>
          )}
        </div>
      }
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ops-kpi-grid mb-6">
        {[
          { label: 'Total reports', value: stats.total },
          { label: 'Approved', value: stats.approved, cls: 'text-emerald-400' },
          { label: 'Pending review', value: stats.pending, cls: 'text-amber-400' },
          { label: 'Rejected', value: stats.rejected, cls: 'text-red-400' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ops-kpi border-slate-700/70 bg-slate-900/50"
          >
            <span className="ops-kpi-label">{kpi.label}</span>
            <p className={`ops-kpi-value ${kpi.cls || ''}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="toolbar mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search reports…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field !pl-10"
          />
        </div>
        <select className="input-field !w-auto" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
        <input type="date" className="input-field !w-auto" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </div>

      {loading ? (
        <LoadingBlock label="Loading compliance reports…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No compliance reports"
          message={canWrite ? 'Create your first regulatory submission.' : 'No reports match your filters.'}
          action={canWrite ? <Button onClick={() => setModalOpen(true)}><FiPlus /> Add report</Button> : null}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report, i) => {
            const cfg = statusConfig[report.status] || statusConfig.Pending;
            const Icon = cfg.icon;
            const rowId = report._id || report.id;
            return (
              <motion.div
                key={rowId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="ops-panel hover:border-amber-500/20 transition-colors"
              >
                <div className="ops-panel-body space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white line-clamp-2">{report.name}</h3>
                    <span className={`${cfg.pill} flex items-center gap-1 shrink-0`}>
                      <Icon className="text-sm" /> {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{report.date ? new Date(report.date).toLocaleDateString() : '—'}</p>
                  <p className="text-sm text-slate-400 line-clamp-3">{report.details || 'No details'}</p>
                  {canWrite && (
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <button type="button" className="btn-ghost !text-xs !text-blue-400" onClick={() => openEdit(report)}>
                        <FiEdit2 /> Edit
                      </button>
                      <button type="button" className="btn-ghost !text-xs !text-red-400" onClick={() => handleDelete(rowId)}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="self-center text-sm text-slate-400">Page {page} of {totalPages}</span>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditReport(null); setForm(emptyForm); }}
        title={editReport ? 'Edit compliance report' : 'New compliance report'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Report name *">
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Date">
            <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </FormField>
          <FormField label="Status">
            <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </FormField>
          <FormField label="Details">
            <textarea className="input-field min-h-[100px]" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
          </FormField>
        </div>
      </Modal>
    </PageShell>
  );
}
