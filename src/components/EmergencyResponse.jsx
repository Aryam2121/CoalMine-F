import api from '../services/axios';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Radio,
  Shield,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from './ui/Button';
import Modal from './ui/Modal';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const EMERGENCY_TYPES = [
  { value: 'fire', label: 'Fire', icon: '🔥' },
  { value: 'explosion', label: 'Explosion', icon: '💥' },
  { value: 'gas_leak', label: 'Gas leak', icon: '☁️' },
  { value: 'collapse', label: 'Structural collapse', icon: '🏗️' },
  { value: 'flooding', label: 'Flooding', icon: '🌊' },
  { value: 'equipment_failure', label: 'Equipment failure', icon: '⚙️' },
  { value: 'injury', label: 'Injury', icon: '🩹' },
  { value: 'entrapment', label: 'Entrapment', icon: '⛏️' },
  { value: 'power_failure', label: 'Power failure', icon: '⚡' },
  { value: 'other', label: 'Other', icon: '⚠️' },
];

const SEVERITIES = ['minor', 'moderate', 'major', 'critical', 'catastrophic'];

const severityClass = (s) => {
  const map = {
    catastrophic: 'risk-pill--high',
    critical: 'risk-pill--high',
    major: 'risk-pill--medium',
    moderate: 'risk-pill--medium',
    minor: 'risk-pill--low',
  };
  return map[s] || 'risk-pill--low';
};

const statusClass = (s) => {
  const map = {
    active: 'status-pill--pending',
    responding: 'status-pill--in-progress',
    contained: 'status-pill--draft',
    resolved: 'status-pill--reviewed',
    false_alarm: 'status-pill--completed',
  };
  return map[s] || 'status-pill--pending';
};

const formatLabel = (s) => (s || '').replace(/_/g, ' ');

const EmergencyResponsePanel = ({ mineId }) => {
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.EMERGENCY_MANAGE);
  const canSOS = can(PERMISSIONS.EMERGENCY_SOS);

  const [emergencies, setEmergencies] = useState([]);
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [showSOSForm, setShowSOSForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [filter, setFilter] = useState('all');

  const [sosForm, setSosForm] = useState({
    emergencyType: 'fire',
    severity: 'critical',
    description: '',
    location: { area: '', level: '' },
  });

  const loadData = useCallback(async () => {
    if (!mineId) return;
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/emergencies/active'),
        api.get('/emergencies', { params: { mineId, limit: 20 } }),
      ]);
      setActiveEmergencies(activeRes.data?.emergencies ?? []);
      setEmergencies(historyRes.data?.emergencies ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  }, [mineId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const stats = useMemo(() => ({
    active: activeEmergencies.length,
    total: emergencies.length,
    resolved: emergencies.filter((e) => e.status === 'resolved').length,
    critical: activeEmergencies.filter((e) => ['critical', 'catastrophic'].includes(e.severity)).length,
  }), [activeEmergencies, emergencies]);

  const filteredHistory = useMemo(() => {
    if (filter === 'active') return emergencies.filter((e) => !['resolved', 'false_alarm'].includes(e.status));
    if (filter === 'resolved') return emergencies.filter((e) => e.status === 'resolved');
    return emergencies;
  }, [emergencies, filter]);

  const handleSOSSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/emergency', { mineId, ...sosForm });
      toast.success('SOS alert sent — response teams notified');
      setShowSOSForm(false);
      setSosForm({
        emergencyType: 'fire',
        severity: 'critical',
        description: '',
        location: { area: '', level: '' },
      });
      loadData();
    } catch {
      toast.error('Failed to send SOS');
    } finally {
      setSubmitting(false);
    }
  };

  const updateEmergencyStatus = async (emergencyId, newStatus) => {
    try {
      await api.patch(`/emergency/${emergencyId}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
      });
      toast.success(`Marked as ${formatLabel(newStatus)}`);
      loadData();
      if (selectedEmergency?._id === emergencyId) {
        setSelectedEmergency((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingBlock label="Loading emergency center…" />;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ops-kpi-grid">
        {[
          { label: 'Active incidents', value: stats.active, icon: <AlertTriangle className="text-red-500" />, alert: stats.active > 0 },
          { label: 'Critical active', value: stats.critical, icon: <Flame className="text-orange-500" /> },
          { label: 'Resolved (recent)', value: stats.resolved, icon: <CheckCircle2 className="text-emerald-500" /> },
          { label: 'Total logged', value: stats.total, icon: <Shield className="text-amber-500" /> },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`ops-kpi border-slate-700/70 bg-slate-900/50 ${kpi.alert ? 'ring-2 ring-red-500/40' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="ops-kpi-label">{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className={`ops-kpi-value ${kpi.alert ? 'text-red-400' : ''}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {canSOS && (
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <p className="text-sm text-slate-400">
            {canManage ? 'Report incidents or update response status' : 'Report an emergency — managers will coordinate response'}
          </p>
          <Button
            variant="danger"
            onClick={() => setShowSOSForm(true)}
            className="!bg-red-600 hover:!bg-red-700 animate-pulse"
          >
            <Radio className="w-4 h-4" /> SOS — Report emergency
          </Button>
        </div>
      )}

      <AnimatePresence>
        {stats.active > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border-2 border-red-500/50 bg-red-950/40 p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-8 h-8 text-red-400 shrink-0 animate-pulse" />
            <div>
              <h3 className="font-bold text-red-200">Active emergency in progress</h3>
              <p className="text-sm text-red-300/80">{stats.active} incident(s) require attention</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeEmergencies.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="text-red-400" /> Live incidents
          </h3>
          {activeEmergencies.map((emergency) => (
            <motion.div
              key={emergency._id}
              layout
              className="ops-panel border-l-4 border-l-red-500"
            >
              <div className="ops-panel-body">
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={severityClass(emergency.severity)}>{emergency.severity}</span>
                      <span className={statusClass(emergency.status)}>{formatLabel(emergency.status)}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white capitalize">
                      {formatLabel(emergency.emergencyType)}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">{emergency.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(emergency.createdAt).toLocaleString()}</span>
                      {emergency.location?.area && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{emergency.location.area}{emergency.location.level ? ` · ${emergency.location.level}` : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => setSelectedEmergency(emergency)}>Details</Button>
                    {canManage && emergency.status === 'active' && (
                      <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => updateEmergencyStatus(emergency._id, 'responding')}>Responding</Button>
                    )}
                    {canManage && ['active', 'responding'].includes(emergency.status) && (
                      <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => updateEmergencyStatus(emergency._id, 'contained')}>Contained</Button>
                    )}
                    {canManage && (
                      <Button variant="success" className="!py-1.5 !text-xs" onClick={() => updateEmergencyStatus(emergency._id, 'resolved')}>Resolve</Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      <section className="ops-panel">
        <div className="ops-panel-header flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-semibold text-white">Incident history</h3>
          <select className="input-field !w-auto !py-1.5 !text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="ops-panel-body p-0 overflow-x-auto">
          {filteredHistory.length === 0 ? (
            <EmptyState title="No incidents" message="No emergencies match this filter." />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Severity</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((emergency) => (
                  <tr key={emergency._id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-xs text-slate-400">{emergency.emergencyId || emergency._id?.slice(-6)}</td>
                    <td className="p-3 text-slate-200 capitalize">{formatLabel(emergency.emergencyType)}</td>
                    <td className="p-3"><span className={severityClass(emergency.severity)}>{emergency.severity}</span></td>
                    <td className="p-3"><span className={statusClass(emergency.status)}>{formatLabel(emergency.status)}</span></td>
                    <td className="p-3 text-slate-400">{new Date(emergency.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button type="button" className="text-amber-400 hover:underline text-xs" onClick={() => setSelectedEmergency(emergency)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Modal open={showSOSForm} onClose={() => setShowSOSForm(false)} title="Report emergency" size="lg">
        <form onSubmit={handleSOSSubmit} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {EMERGENCY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSosForm({ ...sosForm, emergencyType: t.value })}
                className={`rounded-xl border p-2 text-center text-xs transition ${
                  sosForm.emergencyType === t.value
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="text-lg block">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Severity</label>
              <select
                className="input-field"
                value={sosForm.severity}
                onChange={(e) => setSosForm({ ...sosForm, severity: e.target.value })}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Area / section</label>
              <input
                className="input-field"
                value={sosForm.location.area}
                onChange={(e) => setSosForm({ ...sosForm, location: { ...sosForm.location, area: e.target.value } })}
                placeholder="Section A, Level 3"
              />
            </div>
          </div>
          <div>
            <label className="label-field">Description *</label>
            <textarea
              className="input-field min-h-[100px]"
              value={sosForm.description}
              onChange={(e) => setSosForm({ ...sosForm, description: e.target.value })}
              required
              placeholder="What happened? Who is affected?"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowSOSForm(false)}>Cancel</Button>
            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send SOS alert'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(selectedEmergency)}
        onClose={() => setSelectedEmergency(null)}
        title="Incident details"
        size="md"
      >
        {selectedEmergency && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className={severityClass(selectedEmergency.severity)}>{selectedEmergency.severity}</span>
              <span className={statusClass(selectedEmergency.status)}>{formatLabel(selectedEmergency.status)}</span>
            </div>
            <p className="text-slate-300">{selectedEmergency.description}</p>
            <dl className="grid grid-cols-2 gap-2 text-slate-400">
              <dt>Type</dt><dd className="text-white capitalize">{formatLabel(selectedEmergency.emergencyType)}</dd>
              <dt>Reported</dt><dd className="text-white">{new Date(selectedEmergency.createdAt).toLocaleString()}</dd>
              {selectedEmergency.location?.area && (
                <>
                  <dt>Location</dt>
                  <dd className="text-white">{selectedEmergency.location.area}</dd>
                </>
              )}
            </dl>
            {canManage && !['resolved', 'false_alarm'].includes(selectedEmergency.status) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
                <Button variant="success" className="!text-xs" onClick={() => updateEmergencyStatus(selectedEmergency._id, 'resolved')}>Mark resolved</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmergencyResponsePanel;
