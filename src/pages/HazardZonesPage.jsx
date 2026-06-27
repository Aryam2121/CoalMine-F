import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMapEvents } from 'react-leaflet';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import PageShell from '../components/ui/PageShell';
import LoadingBlock from '../components/ui/LoadingBlock';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const ZONE_TYPES = ['restricted', 'gas_prone', 'blasting', 'unstable_roof', 'evacuation_route', 'muster_point'];
const STATUS_STYLES = {
  clear: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  restricted: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  evacuation: 'bg-red-500/15 text-red-300 border-red-500/30',
  closed: 'bg-slate-500/15 text-slate-400 border-slate-600',
};
const CIRCLE_COLORS = { evacuation: '#ef4444', restricted: '#f59e0b', clear: '#10b981', closed: '#64748b' };

const MapClickHandler = ({ onClick }) => {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

const HazardZonesPage = () => {
  const { activeMineId, setActiveMineId, mines, socket } = useSocketContext();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.DASHBOARD_MAINTENANCE);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [form, setForm] = useState({ name: '', zoneType: 'restricted', radiusMeters: 100, center: { latitude: 23.6, longitude: 87.1 }, alertMessage: '' });
  const [violations, setViolations] = useState([]);

  const mineId = activeMineId || mines[0]?._id;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/hazard-zones', { params: mineId ? { mineId } : {} });
      setZones(res.data?.items || []);
    } catch {
      toast.error('Failed to load zones');
    } finally {
      setLoading(false);
    }
  }, [mineId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!socket) return undefined;
    const handler = (payload) => setViolations((prev) => [payload, ...prev].slice(0, 20));
    socket.on('geofence:violation', handler);
    return () => socket.off('geofence:violation', handler);
  }, [socket]);

  const stats = useMemo(() => ({
    total: zones.length,
    restricted: zones.filter((z) => z.status === 'restricted').length,
    evacuation: zones.filter((z) => z.status === 'evacuation').length,
    clear: zones.filter((z) => z.status === 'clear').length,
  }), [zones]);

  const submit = async () => {
    try {
      await api.post('/hazard-zones', { ...form, mineId, requiresAuthorization: true });
      toast.success('Hazard zone created');
      setModalOpen(false);
      load();
    } catch {
      toast.error('Failed to create zone');
    }
  };

  const activeMine = mines.find((m) => m._id === mineId);
  const center = selectedZone?.center || zones[0]?.center || activeMine || form.center;
  const mapCenter = [center.latitude ?? center.lat ?? 23.6, center.longitude ?? center.lng ?? 87.1];

  return (
    <PageShell
      title="Geofenced Hazard Zones"
      subtitle="Restricted areas with real-time entry violation alerts"
      variant="dark"
      action={
        <div className="flex flex-wrap gap-2">
          {mines.length > 0 && (
            <select className="input-field !w-auto !py-2 !min-w-[180px]" value={mineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          {canManage && <Button variant="primary" onClick={() => setModalOpen(true)}>Add zone</Button>}
        </div>
      }
    >
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total zones', value: stats.total },
            { label: 'Restricted', value: stats.restricted },
            { label: 'Evacuation', value: stats.evacuation, alert: stats.evacuation > 0 },
            { label: 'Clear', value: stats.clear },
          ].map((s) => (
            <div key={s.label} className={`maint-kpi ${s.alert ? 'border-red-500/40' : ''}`}>
              <span className="maint-kpi-label">{s.label}</span>
              <p className={`maint-kpi-value ${s.alert ? 'text-red-400' : ''}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading hazard zones…" />
      ) : zones.length === 0 ? (
        <EmptyState title="No hazard zones" message="Add geofenced areas to monitor restricted zones and trigger alerts." action={canManage ? <Button onClick={() => setModalOpen(true)}>Add zone</Button> : null} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-5">
          <div className="xl:col-span-3 min-h-[520px] rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
            <MapContainer center={mapCenter} zoom={13} className="h-full min-h-[520px] w-full z-0">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              {canManage && modalOpen && <MapClickHandler onClick={(lat, lng) => setForm((f) => ({ ...f, center: { latitude: lat, longitude: lng } }))} />}
              {zones.map((z) => (
                <Circle
                  key={z._id}
                  center={[z.center.latitude, z.center.longitude]}
                  radius={z.radiusMeters || 100}
                  pathOptions={{
                    color: CIRCLE_COLORS[z.status] || '#f59e0b',
                    fillColor: CIRCLE_COLORS[z.status] || '#f59e0b',
                    fillOpacity: selectedZone?._id === z._id ? 0.35 : 0.2,
                    weight: selectedZone?._id === z._id ? 3 : 2,
                  }}
                  eventHandlers={{ click: () => setSelectedZone(z) }}
                >
                  <Popup>
                    <strong>{z.name}</strong><br />
                    {z.zoneType?.replace(/_/g, ' ')} · {z.radiusMeters}m<br />
                    Status: {z.status}
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>

          <div className="xl:col-span-2 flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FaMapMarkerAlt className="text-amber-400" /> Active zones ({zones.length})
              </h3>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[520px] scrollbar-hidden pr-1">
              {zones.map((z, i) => (
                <motion.button
                  key={z._id}
                  type="button"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedZone(z)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedZone?._id === z._id
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white text-sm">{z.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize shrink-0 ${STATUS_STYLES[z.status] || STATUS_STYLES.restricted}`}>
                      {z.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 capitalize">{z.zoneType?.replace(/_/g, ' ')} · {z.radiusMeters}m radius</p>
                  {z.alertMessage && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{z.alertMessage}</p>}
                </motion.button>
              ))}
            </div>

            {violations.length > 0 && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 shrink-0">
                <h3 className="font-semibold text-sm text-red-300 flex items-center gap-2 mb-2">
                  <FaExclamationTriangle /> Recent violations
                </h3>
                {violations.slice(0, 3).map((v, i) => (
                  <p key={i} className="text-xs text-red-200/80">{v.violations?.[0]?.message || 'Geofence violation detected'}</p>
                ))}
              </div>
            )}

            {selectedZone && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shrink-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Selected zone</p>
                <p className="font-semibold text-white">{selectedZone.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedZone.center.latitude.toFixed(4)}, {selectedZone.center.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add hazard zone">
        <div className="space-y-3">
          <input className="input-field w-full" placeholder="Zone name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="input-field w-full" value={form.zoneType} onChange={(e) => setForm({ ...form, zoneType: e.target.value })}>
            {ZONE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <input type="number" className="input-field w-full" placeholder="Radius (meters)" value={form.radiusMeters} onChange={(e) => setForm({ ...form, radiusMeters: Number(e.target.value) })} />
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <FaShieldAlt /> Click map to set center: {form.center.latitude.toFixed(4)}, {form.center.longitude.toFixed(4)}
          </p>
          <input className="input-field w-full" placeholder="Alert message" value={form.alertMessage} onChange={(e) => setForm({ ...form, alertMessage: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>Create</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default HazardZonesPage;
