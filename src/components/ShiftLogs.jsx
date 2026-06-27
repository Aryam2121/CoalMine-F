import api from '../services/axios';
import { useState, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import {
  FaClipboardList,
  FaFileUpload,
  FaClock,
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
import { usePermissions } from '../hooks/usePermissions';
import { isManager } from '../utils/roles';

const emptyLog = {
  shiftDetails: '',
  shiftStartTime: '',
  shiftEndTime: '',
  status: 'pending',
  notes: '',
};

const statusClass = (s) => {
  const v = (s || '').toLowerCase();
  if (v === 'completed') return 'status-pill--completed';
  if (v === 'in-progress') return 'status-pill--in-progress';
  return 'status-pill--pending';
};

const normalizeTime = (value) => {
  if (!value) return '';
  const str = String(value);
  if (/^\d{2}:\d{2}$/.test(str)) return str;
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
  return str;
};

const ShiftHandoverLog = () => {
  const { role } = usePermissions();
  const canDelete = isManager(role);
  const [logData, setLogData] = useState(emptyLog);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [previousLogs, setPreviousLogs] = useState([]);
  const [editLogId, setEditLogId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchLogs = async () => {
    setListLoading(true);
    try {
      const { data } = await api.get('/getAllLogs', { params: { limit: 100, page: 1 } });
      setPreviousLogs(data?.shiftLogs || []);
    } catch {
      toast.error('Failed to load shift logs');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleInputChange = (e) => {
    setLogData({ ...logData, [e.target.name]: e.target.value });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files[0]) {
        setFile(files[0]);
        setFilePreview(URL.createObjectURL(files[0]));
      }
    },
  });

  const resetForm = () => {
    setLogData(emptyLog);
    setFile(null);
    setFilePreview(null);
    setEditLogId(null);
    setShowForm(false);
    setEditModalOpen(false);
  };

  const submitLog = async (e) => {
    e.preventDefault();
    if (!logData.shiftDetails?.trim() || !logData.shiftStartTime || !logData.shiftEndTime) {
      toast.error('Shift details, start time, and end time are required');
      return;
    }
    if (!file) {
      toast.error('Please attach a photo or PDF for handover documentation');
      return;
    }

    const formData = new FormData();
    formData.append('shiftDetails', logData.shiftDetails);
    formData.append('shiftStartTime', logData.shiftStartTime);
    formData.append('shiftEndTime', logData.shiftEndTime);
    formData.append('status', logData.status || 'pending');
    formData.append('notes', logData.notes || '');
    formData.append('file', file);

    setLoading(true);
    try {
      const { data } = await api.post('/createLogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const saved = data?.shiftLog || data;
      setPreviousLogs((prev) => [saved, ...prev].filter(Boolean));
      toast.success('Shift log submitted');
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit log');
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm('Delete this shift log?')) return;
    try {
      await api.delete(`/deleteLog/${id}`);
      setPreviousLogs((prev) => prev.filter((l) => l._id !== id));
      toast.success('Log deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (log) => {
    setLogData({
      shiftDetails: log.shiftDetails || '',
      shiftStartTime: normalizeTime(log.shiftStartTime),
      shiftEndTime: normalizeTime(log.shiftEndTime),
      status: log.status || 'pending',
      notes: log.notes || '',
    });
    setEditLogId(log._id);
    setEditModalOpen(true);
  };

  const updateLog = async () => {
    if (!editLogId) return;
    if (!logData.shiftDetails?.trim() || !logData.shiftStartTime || !logData.shiftEndTime) {
      toast.error('Shift details, start time, and end time are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.put(`/updateLog/${editLogId}`, {
        shiftDetails: logData.shiftDetails,
        shiftStartTime: logData.shiftStartTime,
        shiftEndTime: logData.shiftEndTime,
        status: logData.status,
        notes: logData.notes,
      });
      const updated = data?.shiftLog || data;
      setPreviousLogs((prev) => prev.map((l) => (l._id === editLogId ? updated : l)));
      toast.success('Log updated');
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      previousLogs.filter((log) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          log.shiftDetails?.toLowerCase().includes(q) ||
          log.notes?.toLowerCase().includes(q);
        const matchStatus = !filterStatus || log.status === filterStatus;
        return matchSearch && matchStatus;
      }),
    [previousLogs, search, filterStatus]
  );

  const stats = useMemo(
    () => ({
      total: previousLogs.length,
      pending: previousLogs.filter((l) => l.status === 'pending').length,
      completed: previousLogs.filter((l) => l.status === 'completed').length,
    }),
    [previousLogs]
  );

  return (
    <PageShell
      title="Shift logs"
      subtitle="Handover documentation, timing, and shift status"
      variant="dark"
      action={
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> New log
        </Button>
      }
    >
      <div className="ops-kpi-grid !grid-cols-3 mb-8">
        {[
          { label: 'Total logs', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'Completed', value: stats.completed },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="ops-kpi border-slate-700/70 bg-slate-900/50">
            <span className="ops-kpi-label">{s.label}</span>
            <p className="ops-kpi-value">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={submitLog} className="ops-panel mb-8 border-amber-500/20">
          <div className="ops-panel-head">
            <h3 className="ops-panel-title"><FaClipboardList className="text-amber-500" /> Submit handover log</h3>
            <button type="button" onClick={resetForm} className="btn-ghost !p-2 text-slate-400">✕</button>
          </div>
          <div className="ops-panel-body grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FormField label="Shift details" className="lg:col-span-2">
              <textarea name="shiftDetails" value={logData.shiftDetails} onChange={handleInputChange} rows={3} className="input-field" placeholder="Summary of shift activities…" />
            </FormField>
            <FormField label="Start time">
              <input type="time" name="shiftStartTime" value={logData.shiftStartTime} onChange={handleInputChange} className="input-field" />
            </FormField>
            <FormField label="End time">
              <input type="time" name="shiftEndTime" value={logData.shiftEndTime} onChange={handleInputChange} className="input-field" />
            </FormField>
            <FormField label="Status">
              <select name="status" value={logData.status} onChange={handleInputChange} className="input-field">
                <option value="pending">Pending</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>
            <FormField label="Notes">
              <textarea name="notes" value={logData.notes} onChange={handleInputChange} rows={2} className="input-field" placeholder="Optional notes…" />
            </FormField>
            <div className="lg:col-span-2">
              <div {...getRootProps()} className={`dropzone-modern ${isDragActive ? 'border-amber-500 bg-amber-500/10' : ''}`}>
                <input {...getInputProps()} />
                <FaFileUpload className="mx-auto text-2xl text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">Attach handover photo or PDF (required)</p>
              </div>
              {filePreview && <img src={filePreview} alt="Preview" className="mt-3 max-h-40 rounded-lg border border-slate-700" />}
            </div>
          </div>
          <div className="px-5 pb-5">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Submitting…' : 'Submit log'}
            </Button>
          </div>
        </motion.form>
      )}

      <div className="toolbar !bg-slate-800/50 !border-slate-700 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input className="input-field !pl-9" placeholder="Search logs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field !w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {listLoading ? (
        <LoadingBlock label="Loading shift logs…" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No shift logs" message="Submit your first handover log to get started." action={<Button onClick={() => setShowForm(true)}><FaPlus /> Create log</Button>} />
      ) : (
        <div className="space-y-4">
          {filtered.map((log, i) => (
            <motion.div key={log._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="shift-log-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white mb-1">{log.shiftDetails}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><FaClock /> {log.shiftStartTime} – {log.shiftEndTime}</span>
                    <span className={statusClass(log.status)}>{log.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {log.file && (
                    <a href={log.file} target="_blank" rel="noopener noreferrer" className="btn-ghost !text-xs !text-amber-400">
                      <FaExternalLinkAlt /> Attachment
                    </a>
                  )}
                  <button type="button" onClick={() => openEdit(log)} className="btn-ghost !text-xs !text-blue-400"><FaEdit /> Edit</button>
                  {canDelete && (
                    <button type="button" onClick={() => deleteLog(log._id)} className="btn-ghost !text-xs !text-red-400"><FaTrash /></button>
                  )}
                </div>
              </div>
              {log.notes && <p className="text-sm text-slate-500 border-t border-slate-800 pt-3">{log.notes}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={editModalOpen}
        onClose={resetForm}
        title="Edit shift log"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={updateLog} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <FormField label="Shift details">
            <textarea name="shiftDetails" value={logData.shiftDetails} onChange={handleInputChange} rows={3} className="input-field" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start"><input type="time" name="shiftStartTime" value={logData.shiftStartTime} onChange={handleInputChange} className="input-field" /></FormField>
            <FormField label="End"><input type="time" name="shiftEndTime" value={logData.shiftEndTime} onChange={handleInputChange} className="input-field" /></FormField>
          </div>
          <FormField label="Status">
            <select name="status" value={logData.status} onChange={handleInputChange} className="input-field">
              <option value="pending">Pending</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </FormField>
          <FormField label="Notes">
            <textarea name="notes" value={logData.notes} onChange={handleInputChange} rows={2} className="input-field" />
          </FormField>
        </div>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </PageShell>
  );
};

export default ShiftHandoverLog;
