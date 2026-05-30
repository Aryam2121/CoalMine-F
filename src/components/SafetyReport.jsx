import { useEffect, useState, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '../services/axios';
import { AuthContext } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaFileAlt,
  FaSearch,
  FaCheck,
  FaTrash,
  FaPlus,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from 'react-icons/fa';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';

const riskClass = (level) => {
  const l = (level || '').toLowerCase();
  if (l === 'critical' || l === 'high') return 'risk-pill--high';
  if (l === 'medium') return 'risk-pill--medium';
  return 'risk-pill--low';
};

const statusClass = (status) => {
  const s = (status || 'Pending').toLowerCase();
  if (s === 'reviewed' || s === 'resolved') return 'status-pill--reviewed';
  return 'status-pill--pending';
};

const SafetyReportsPage = () => {
  const { user } = useContext(AuthContext);
  const { can } = usePermissions();
  const canApprove = can(PERMISSIONS.SAFETY_REPORT_APPROVE);
  const canDelete = can(PERMISSIONS.SAFETY_PLAN_DELETE);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('list');
  const [filterRisk, setFilterRisk] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({ show: false, action: null, id: null, title: '' });
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { createdBy: user?.name || '' },
  });

  useEffect(() => {
    if (user?.name) setValue('createdBy', user.name);
  }, [user, setValue]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/getAllReports');
      setReports(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reportTitle', data.reportTitle);
      formData.append('description', data.description);
      formData.append('riskLevel', data.riskLevel);
      formData.append('incidentDate', data.incidentDate);
      formData.append('createdBy', data.createdBy || user?.name || user?._id);
      formData.append('location', data.location);
      if (data.attachments?.length) {
        Array.from(data.attachments).forEach((f) => formData.append('attachments', f));
      }
      await api.post('/createReports', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Report submitted');
      reset({ createdBy: user?.name || '' });
      setTab('list');
      loadReports();
    } catch {
      toast.error('Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async () => {
    if (!modal.id) return;
    setSubmitting(true);
    try {
      if (modal.action === 'approve') {
        await api.put(`/reports/${modal.id}/approve`, { approvedBy: user?._id || user?.id });
        toast.success('Report approved');
      } else {
        await api.delete(`/reports/${modal.id}`);
        toast.success('Report deleted');
      }
      loadReports();
    } catch {
      toast.error('Action failed');
    } finally {
      setModal({ show: false, action: null, id: null, title: '' });
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return reports.filter((r) => {
      const matchSearch =
        !q ||
        r.reportTitle?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r._id?.includes(q) ||
        r.location?.toLowerCase().includes(q);
      const matchRisk = !filterRisk || r.riskLevel === filterRisk;
      return matchSearch && matchRisk;
    });
  }, [reports, searchQuery, filterRisk]);

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === 'Pending').length,
      high: reports.filter((r) => ['High', 'Critical'].includes(r.riskLevel)).length,
    }),
    [reports]
  );

  return (
    <PageShell
      title="Safety reports"
      subtitle="Incident documentation, risk classification, and approval workflow"
      variant="dark"
      action={
        <Button onClick={() => setTab('create')}>
          <FaPlus /> New report
        </Button>
      }
    >
      <div className="ops-kpi-grid !grid-cols-3 mb-6">
        {[
          { label: 'Total reports', value: stats.total },
          { label: 'Pending review', value: stats.pending },
          { label: 'High / critical', value: stats.high },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="ops-kpi border-slate-700/70 bg-slate-900/50">
            <span className="ops-kpi-label">{s.label}</span>
            <p className="ops-kpi-value">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="ops-tabs mb-6 w-fit">
        <button type="button" className={tab === 'list' ? 'ops-tab--active' : 'ops-tab'} onClick={() => setTab('list')}>
          All reports
        </button>
        <button type="button" className={tab === 'create' ? 'ops-tab--active' : 'ops-tab'} onClick={() => setTab('create')}>
          Create report
        </button>
      </div>

      {tab === 'create' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ops-panel max-w-3xl">
          <div className="ops-panel-head">
            <h3 className="ops-panel-title"><FaFileAlt className="text-amber-500" /> Incident report</h3>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="ops-panel-body grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Report title" className="md:col-span-2">
              <input {...register('reportTitle', { required: true })} className="input-field" placeholder="Brief incident title" />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <textarea {...register('description', { required: true })} rows={4} className="input-field" placeholder="What happened, witnesses, immediate actions…" />
            </FormField>
            <FormField label="Risk level">
              <select {...register('riskLevel', { required: true })} className="input-field">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </FormField>
            <FormField label="Incident date">
              <input type="date" {...register('incidentDate', { required: true })} className="input-field" />
            </FormField>
            <FormField label="Location">
              <input {...register('location', { required: true })} className="input-field" placeholder="Mine section / level" />
            </FormField>
            <FormField label="Reported by">
              <input {...register('createdBy', { required: true })} className="input-field" readOnly />
            </FormField>
            <FormField label="Attachments" className="md:col-span-2" hint="Images or PDFs (max 5 files)">
              <input type="file" {...register('attachments')} multiple accept="image/*,.pdf" className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-500/20 file:text-amber-300" />
            </FormField>
            <div className="md:col-span-2 flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit report'}</Button>
              <Button type="button" variant="secondary" onClick={() => setTab('list')}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <>
          <div className="toolbar !bg-slate-800/50 !border-slate-700 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input
                className="input-field !pl-9"
                placeholder="Search title, location, or ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="input-field !w-auto" value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
              <option value="">All risk levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {loading ? (
            <LoadingBlock label="Loading reports…" />
          ) : filtered.length === 0 ? (
            <EmptyState title="No reports found" message="Create a safety incident report to begin." action={<Button onClick={() => setTab('create')}><FaPlus /> Create report</Button>} />
          ) : (
            <div className="space-y-4">
              {filtered.map((report, i) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="ops-panel hover:border-amber-500/20 transition-colors"
                >
                  <div className="ops-panel-body">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white text-lg">{report.reportTitle}</h3>
                          <span className={riskClass(report.riskLevel)}>{report.riskLevel}</span>
                          <span className={statusClass(report.status)}>{report.status || 'Pending'}</span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{report.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><FaMapMarkerAlt /> {report.location}</span>
                          <span className="flex items-center gap-1"><FaCalendarAlt /> {report.incidentDate ? new Date(report.incidentDate).toLocaleDateString() : '—'}</span>
                          <span>By {report.createdBy}</span>
                        </div>
                      </div>
                      {(canApprove || canDelete) && (
                        <div className="flex gap-2 shrink-0">
                          {canApprove && report.status !== 'Reviewed' && (
                            <Button
                              variant="success"
                              className="!py-2 !text-xs"
                              onClick={() => setModal({ show: true, action: 'approve', id: report._id, title: report.reportTitle })}
                            >
                              <FaCheck /> Approve
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="danger"
                              className="!py-2 !text-xs"
                              onClick={() => setModal({ show: true, action: 'delete', id: report._id, title: report.reportTitle })}
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={modal.show}
        onClose={() => setModal({ show: false, action: null, id: null, title: '' })}
        title={modal.action === 'approve' ? 'Approve report' : 'Delete report'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal({ show: false, action: null, id: null, title: '' })}>Cancel</Button>
            <Button variant={modal.action === 'approve' ? 'success' : 'danger'} onClick={handleAction} disabled={submitting}>
              {submitting ? 'Processing…' : 'Confirm'}
            </Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">
          {modal.action === 'approve'
            ? `Mark "${modal.title}" as reviewed and approved?`
            : `Permanently delete "${modal.title}"? This cannot be undone.`}
        </p>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </PageShell>
  );
};

export default SafetyReportsPage;
