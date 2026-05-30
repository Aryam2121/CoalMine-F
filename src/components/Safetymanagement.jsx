import api from '../services/axios';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaShieldAlt,
  FaFileUpload,
  FaEdit,
  FaTrash,
  FaExternalLinkAlt,
  FaPlus,
  FaSearch,
} from 'react-icons/fa';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import EmptyState from './ui/EmptyState';
import LoadingBlock from './ui/LoadingBlock';
import { AuthContext } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const riskClass = (level) => {
  const l = (level || '').toLowerCase();
  if (l === 'high') return 'risk-pill--high';
  if (l === 'medium') return 'risk-pill--medium';
  return 'risk-pill--low';
};

const statusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return 'status-pill--approved';
  if (s === 'draft') return 'status-pill--draft';
  return 'status-pill--pending';
};

const emptyForm = (createdBy) => ({
  hazardDetails: '',
  mitigationMeasures: '',
  riskLevel: '',
  status: 'draft',
  createdBy: createdBy || 'Admin',
  file: null,
});

const SafetyManagementPlan = () => {
  const { can } = usePermissions();
  const canCreate = can(PERMISSIONS.SAFETY_PLAN_CREATE);
  const canDelete = can(PERMISSIONS.SAFETY_PLAN_DELETE);
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState(emptyForm(user?.name));
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [safetyPlans, setSafetyPlans] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');

  useEffect(() => {
    fetchSafetyPlans();
  }, []);

  const fetchSafetyPlans = async () => {
    setListLoading(true);
    try {
      const { data } = await api.get('/getAllSafety');
      setSafetyPlans(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load safety plans');
    } finally {
      setListLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    if (file.size > 5_000_000) {
      toast.error('File must be under 5MB');
      return;
    }
    setForm({ ...form, file });
    setFilePreview(URL.createObjectURL(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    onDrop: handleFileUpload,
    maxFiles: 1,
  });

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('hazardDetails', form.hazardDetails);
    fd.append('mitigationMeasures', form.mitigationMeasures);
    fd.append('riskLevel', form.riskLevel);
    fd.append('status', form.status);
    fd.append('createdBy', form.createdBy || user?.name || 'Admin');
    if (form.file) fd.append('file', form.file);
    return fd;
  };

  const validate = () =>
    form.hazardDetails?.trim() &&
    form.mitigationMeasures?.trim() &&
    form.riskLevel;

  const submitPlan = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      toast.error('Fill hazard details, mitigation, and risk level');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/updateSafety/${editingId}`, buildFormData());
        toast.success('Plan updated');
      } else {
        await api.post('/createSafety', buildFormData());
        toast.success('Plan submitted');
      }
      closeForm();
      fetchSafetyPlans();
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm(user?.name));
    setFilePreview(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(user?.name));
    setFilePreview(null);
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setForm({
      hazardDetails: plan.hazardDetails || '',
      mitigationMeasures: plan.mitigationMeasures || '',
      riskLevel: plan.riskLevel || '',
      status: plan.status || 'draft',
      createdBy: plan.createdBy || user?.name,
      file: null,
    });
    setEditingId(plan._id);
    setFilePreview(null);
    setModalOpen(true);
  };

  const deleteSafetyPlan = async (id) => {
    if (!window.confirm('Delete this safety plan?')) return;
    try {
      await api.delete(`/safety/${id}`);
      toast.success('Plan deleted');
      fetchSafetyPlans();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = useMemo(
    () =>
      safetyPlans.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          p.hazardDetails?.toLowerCase().includes(q) ||
          p.mitigationMeasures?.toLowerCase().includes(q);
        const matchRisk = !filterRisk || p.riskLevel === filterRisk;
        return matchSearch && matchRisk;
      }),
    [safetyPlans, search, filterRisk]
  );

  const stats = useMemo(
    () => ({
      total: safetyPlans.length,
      high: safetyPlans.filter((p) => p.riskLevel === 'High').length,
      approved: safetyPlans.filter((p) => p.status === 'approved').length,
    }),
    [safetyPlans]
  );

  return (
    <PageShell
      title="Safety plan"
      subtitle="Hazard assessments, mitigation measures, and compliance documents"
      variant="dark"
      action={
        canCreate ? (
          <Button onClick={openCreate}>
            <FaPlus /> New plan
          </Button>
        ) : null
      }
    >
      <div className="ops-kpi-grid !grid-cols-3 mb-8">
        {[
          { label: 'Total plans', value: stats.total },
          { label: 'High risk', value: stats.high },
          { label: 'Approved', value: stats.approved },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ops-kpi border-slate-700/70 bg-slate-900/50"
          >
            <span className="ops-kpi-label">{s.label}</span>
            <p className="ops-kpi-value">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submitPlan}
          className="ops-panel mb-8 border-amber-500/20"
        >
          <div className="ops-panel-head">
            <h3 className="ops-panel-title"><FaShieldAlt className="text-amber-500" /> New safety plan</h3>
            <button type="button" onClick={closeForm} className="btn-ghost !p-2 text-slate-400">✕</button>
          </div>
          <div className="ops-panel-body grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FormField label="Hazard details">
              <textarea name="hazardDetails" value={form.hazardDetails} onChange={handleInputChange} rows={4} className="input-field" placeholder="Describe the hazard…" />
            </FormField>
            <FormField label="Mitigation measures">
              <textarea name="mitigationMeasures" value={form.mitigationMeasures} onChange={handleInputChange} rows={4} className="input-field" placeholder="Control measures and procedures…" />
            </FormField>
            <FormField label="Risk level">
              <select name="riskLevel" value={form.riskLevel} onChange={handleInputChange} className="input-field">
                <option value="">Select level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select name="status" value={form.status} onChange={handleInputChange} className="input-field">
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </FormField>
            <div className="lg:col-span-2">
              <div {...getRootProps()} className={`dropzone-modern ${isDragActive ? 'border-amber-500 bg-amber-500/10' : ''}`}>
                <input {...getInputProps()} />
                <FaFileUpload className="mx-auto text-2xl text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">Drop image or PDF (max 5MB), or click to browse</p>
              </div>
              {filePreview && <img src={filePreview} alt="Preview" className="mt-3 max-h-32 rounded-lg border border-slate-700" />}
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Submit plan'}</Button>
            <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
          </div>
        </motion.form>
      )}

      <div className="toolbar !bg-slate-800/50 !border-slate-700 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input className="input-field !pl-9" placeholder="Search plans…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field !w-auto" value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
          <option value="">All risk levels</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {listLoading ? (
        <LoadingBlock label="Loading safety plans…" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No safety plans" message="Create your first hazard assessment plan." action={<Button onClick={openCreate}><FaPlus /> Create plan</Button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="ops-panel hover:border-amber-500/25 transition-colors"
            >
              <div className="ops-panel-body space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="font-semibold text-white line-clamp-2 flex-1">{plan.hazardDetails}</h4>
                  <div className="flex gap-2 shrink-0">
                    <span className={riskClass(plan.riskLevel)}>{plan.riskLevel}</span>
                    <span className={statusClass(plan.status)}>{plan.status}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{plan.mitigationMeasures}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-500">By {plan.createdBy}</span>
                  <div className="flex gap-2">
                    {plan.file && (
                      <a href={plan.file} target="_blank" rel="noopener noreferrer" className="btn-ghost !text-xs !text-amber-400">
                        <FaExternalLinkAlt /> File
                      </a>
                    )}
                    {canCreate && (
                      <button type="button" onClick={() => openEdit(plan)} className="btn-ghost !text-xs !text-blue-400">
                        <FaEdit /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button type="button" onClick={() => deleteSafetyPlan(plan._id)} className="btn-ghost !text-xs !text-red-400">
                        <FaTrash /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeForm}
        title="Edit safety plan"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button onClick={submitPlan} disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <FormField label="Hazard details">
            <textarea name="hazardDetails" value={form.hazardDetails} onChange={handleInputChange} rows={3} className="input-field" />
          </FormField>
          <FormField label="Mitigation measures">
            <textarea name="mitigationMeasures" value={form.mitigationMeasures} onChange={handleInputChange} rows={3} className="input-field" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Risk level">
              <select name="riskLevel" value={form.riskLevel} onChange={handleInputChange} className="input-field">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select name="status" value={form.status} onChange={handleInputChange} className="input-field">
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </FormField>
          </div>
          <div {...getRootProps()} className="dropzone-modern">
            <input {...getInputProps()} />
            <p className="text-sm text-slate-500">Replace attachment (optional)</p>
          </div>
        </div>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </PageShell>
  );
};

export default SafetyManagementPlan;
