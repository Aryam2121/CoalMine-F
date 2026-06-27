import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, useMap } from 'react-leaflet';

import L from 'leaflet';

import { toast } from 'react-toastify';

import 'leaflet/dist/leaflet.css';

import 'leaflet.heat';

import PageShell from '../components/ui/PageShell';

import LoadingBlock from '../components/ui/LoadingBlock';

import Button from '../components/ui/Button';

import api from '../services/axios';

import { useSocketContext } from '../context/SocketContext';

import usePermissions from '../hooks/usePermissions';

import markerIcon from 'leaflet/dist/images/marker-icon.png';

import markerShadow from 'leaflet/dist/images/marker-shadow.png';



const mapIcon = L.icon({

  iconUrl: markerIcon,

  shadowUrl: markerShadow,

  iconSize: [25, 41],

  iconAnchor: [12, 41],

});



function HeatLayer({ points }) {

  const map = useMap();

  useEffect(() => {

    if (!points?.length || !L.heatLayer) return undefined;

    const heat = L.heatLayer(

      points.map((p) => [p.lat, p.lng, p.intensity || 0.5]),

      { radius: 28, blur: 18, maxZoom: 12 }

    );

    heat.addTo(map);

    return () => map.removeLayer(heat);

  }, [map, points]);

  return null;

}



const SensorWidget = ({ label, value, unit, status }) => {

  const colors = {

    normal: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',

    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',

    danger: 'border-red-500/30 bg-red-500/10 text-red-400',

  };

  return (

    <div className={`rounded-xl border p-4 ${colors[status] || colors.normal}`}>

      <p className="text-xs uppercase tracking-widest opacity-80">{label}</p>

      <p className="text-2xl font-bold mt-1">{value}{unit && <span className="text-sm ml-1">{unit}</span>}</p>

    </div>

  );

};



const EQUIPMENT_STATUSES = ['operational', 'warning', 'malfunction', 'offline', 'maintenance'];



const LiveOperationsPage = () => {

  const { activeMineId, setActiveMineId, mines, connected, socket, sendLocationUpdate } = useSocketContext();

  const { isManager } = usePermissions();

  const [monitoring, setMonitoring] = useState(null);

  const [heatmap, setHeatmap] = useState([]);

  const [loading, setLoading] = useState(true);

  const [tracking, setTracking] = useState(false);

  const [envForm, setEnvForm] = useState({

    methane: '',

    carbonMonoxide: '',

    ambient: '',

    airflow: '',

  });

  const [updatingEq, setUpdatingEq] = useState(null);
  const [hazardZones, setHazardZones] = useState([]);
  const [opsSummary, setOpsSummary] = useState({ contractors: 0, permits: 0, evacuations: 0 });
  const [geofenceAlerts, setGeofenceAlerts] = useState([]);



  const loadData = useCallback(async () => {

    if (!activeMineId) return;

    setLoading(true);

    try {

      const [monRes, heatRes, zoneRes, contractorRes, permitRes, evacRes] = await Promise.all([

        api.get(`/monitoring/${activeMineId}`),

        api.get('/monitoring/heatmap/alerts', { params: { mineId: activeMineId } }),

        api.get('/hazard-zones', { params: { mineId: activeMineId } }).catch(() => ({ data: { items: [] } })),

        api.get('/contractors', { params: { mineId: activeMineId, status: 'checked_in' } }).catch(() => ({ data: { items: [] } })),

        api.get('/work-permits', { params: { mineId: activeMineId, status: 'active' } }).catch(() => ({ data: { items: [] } })),

        api.get('/emergencies/active').catch(() => ({ data: { emergencies: [] } })),

      ]);

      const mon = monRes.data?.monitoring;

      setMonitoring(mon);

      setHeatmap(heatRes.data?.points || []);

      setHazardZones(zoneRes.data?.items || []);

      setOpsSummary({

        contractors: contractorRes.data?.items?.length || 0,

        permits: permitRes.data?.items?.length || 0,

        evacuations: (evacRes.data?.emergencies || []).filter((e) => e.evacuationStatus?.initiated && !e.evacuationStatus?.completedAt).length,

      });

      const gas = mon?.environmentalConditions?.gasLevels || {};

      const env = mon?.environmentalConditions || {};

      setEnvForm({

        methane: gas.methane ?? '',

        carbonMonoxide: gas.carbonMonoxide ?? '',

        ambient: env.temperature?.ambient ?? '',

        airflow: env.ventilation?.airflow ?? '',

      });

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }, [activeMineId]);



  useEffect(() => {

    loadData();

  }, [loadData]);



  useEffect(() => {

    if (!socket) return undefined;



    const onLocation = (data) => {

      setMonitoring((prev) => {

        if (!prev) return prev;

        const personnel = [...(prev.activePersonnel || [])];

        const idx = personnel.findIndex((p) => String(p.userId) === String(data.userId));

        if (idx >= 0) {

          personnel[idx] = { ...personnel[idx], location: data.location, lastUpdate: data.timestamp };

        } else {

          personnel.push({ userId: data.userId, location: data.location, status: 'active', lastUpdate: data.timestamp });

        }

        return { ...prev, activePersonnel: personnel };

      });

    };



    const onEquipment = (data) => {

      setMonitoring((prev) => {

        if (!prev) return prev;

        const equipment = (prev.equipmentStatus || []).map((eq) =>

          eq.equipmentId === data.equipmentId ? { ...eq, status: data.status, metrics: { ...eq.metrics, ...data.metrics } } : eq

        );

        return { ...prev, equipmentStatus: equipment };

      });

    };



    const onEnvironment = (data) => {

      setMonitoring((prev) => ({

        ...prev,

        environmentalConditions: { ...prev?.environmentalConditions, ...data.conditions },

      }));

    };



    socket.on('location:updated', onLocation);

    socket.on('equipment:updated', onEquipment);

    socket.on('environment:updated', onEnvironment);

    const onGeofence = (payload) => {

      setGeofenceAlerts((prev) => [payload, ...prev].slice(0, 8));

      toast.warn(payload.violations?.[0]?.message || 'Geofence violation', { autoClose: 6000 });

    };

    socket.on('geofence:violation', onGeofence);



    return () => {

      socket.off('location:updated', onLocation);

      socket.off('equipment:updated', onEquipment);

      socket.off('environment:updated', onEnvironment);

      socket.off('geofence:violation', onGeofence);

    };

  }, [socket]);



  useEffect(() => {

    if (!tracking) return undefined;

    const id = navigator.geolocation.watchPosition(

      (pos) => {

        sendLocationUpdate({

          latitude: pos.coords.latitude,

          longitude: pos.coords.longitude,

          area: 'Field',

        });

      },

      () => {},

      { enableHighAccuracy: true, maximumAge: 10000 }

    );

    return () => navigator.geolocation.clearWatch(id);

  }, [tracking, sendLocationUpdate]);



  const updateEquipmentStatus = async (equipmentId, status) => {

    if (!activeMineId) return;

    setUpdatingEq(equipmentId);

    try {

      const { data } = await api.patch(`/monitoring/${activeMineId}/equipment/${equipmentId}`, { status });

      if (data.monitoring) setMonitoring(data.monitoring);

      toast.success('Equipment status updated');

    } catch (err) {

      toast.error(err.response?.data?.message || 'Failed to update equipment');

    } finally {

      setUpdatingEq(null);

    }

  };



  const saveEnvironment = async (e) => {

    e.preventDefault();

    if (!activeMineId) return;

    try {

      const conditions = {

        gasLevels: {

          methane: envForm.methane !== '' ? Number(envForm.methane) : undefined,

          carbonMonoxide: envForm.carbonMonoxide !== '' ? Number(envForm.carbonMonoxide) : undefined,

        },

        temperature: { ambient: envForm.ambient !== '' ? Number(envForm.ambient) : undefined },

        ventilation: { airflow: envForm.airflow !== '' ? Number(envForm.airflow) : undefined },

      };

      const { data } = await api.patch(`/monitoring/${activeMineId}/environment`, { conditions });

      if (data.monitoring) setMonitoring(data.monitoring);

      toast.success('Environmental readings saved');

    } catch (err) {

      toast.error(err.response?.data?.message || 'Failed to save environment data');

    }

  };



  const env = monitoring?.environmentalConditions || {};

  const gas = env.gasLevels || {};

  const center = mines.find((m) => String(m._id) === String(activeMineId));

  const mapCenter = center?.location

    ? [center.location.latitude, center.location.longitude]

    : [22.5, 82];



  const methaneStatus = gas.methane > 1.5 ? 'danger' : gas.methane > 1 ? 'warning' : 'normal';

  const coStatus = gas.carbonMonoxide > 50 ? 'danger' : gas.carbonMonoxide > 35 ? 'warning' : 'normal';



  return (

    <PageShell

      title="Live Operations Center"

      subtitle="Real-time personnel, equipment, environmental sensors, and alert heatmap"

      variant="dark"

      action={

        <div className="flex flex-wrap items-center gap-2">

          <span className={`text-xs font-semibold uppercase ${connected ? 'text-emerald-400' : 'text-slate-500'}`}>

            {connected ? '● Live' : '○ Reconnecting'}

          </span>

          {mines.length > 1 && (

            <select

              className="input-field !w-auto !py-2 !bg-slate-800 !border-slate-600"

              value={activeMineId || ''}

              onChange={(e) => setActiveMineId(e.target.value)}

            >

              {mines.map((m) => (

                <option key={m._id} value={m._id}>{m.name}</option>

              ))}

            </select>

          )}

          <Button variant="secondary" onClick={() => setTracking((t) => !t)}>

            {tracking ? 'Stop GPS' : 'Share my location'}

          </Button>

          <Button variant="secondary" onClick={loadData}>Refresh</Button>

        </div>

      }

    >

      {loading ? (

        <LoadingBlock />

      ) : (

        <div className="space-y-6">
          {(opsSummary.evacuations > 0 || opsSummary.contractors > 0 || geofenceAlerts.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {opsSummary.evacuations > 0 && (
                <Link to="/evacuation" className="text-xs px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  {opsSummary.evacuations} active evacuation(s)
                </Link>
              )}
              {opsSummary.contractors > 0 && (
                <Link to="/contractors" className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {opsSummary.contractors} on-site visitor(s)
                </Link>
              )}
              {opsSummary.permits > 0 && (
                <Link to="/work-permits" className="text-xs px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {opsSummary.permits} active permit(s)
                </Link>
              )}
              {geofenceAlerts.length > 0 && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  {geofenceAlerts.length} geofence alert(s)
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <SensorWidget label="Methane (CH₄)" value={gas.methane ?? '—'} unit="%" status={methaneStatus} />

            <SensorWidget label="Carbon Monoxide" value={gas.carbonMonoxide ?? '—'} unit="ppm" status={coStatus} />

            <SensorWidget label="Ambient Temp" value={env.temperature?.ambient ?? '—'} unit="°C" status="normal" />

            <SensorWidget label="Airflow" value={env.ventilation?.airflow ?? '—'} unit="%" status="normal" />

          </div>



          <div className="grid lg:grid-cols-3 gap-4">

            <div className="lg:col-span-2 h-[420px] rounded-xl overflow-hidden border border-slate-700">

              <MapContainer center={mapCenter} zoom={6} className="h-full w-full">

                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <HeatLayer points={heatmap} />

                {center?.location && (

                  <Marker position={[center.location.latitude, center.location.longitude]} icon={mapIcon}>

                    <Popup>{center.name}</Popup>

                  </Marker>

                )}

                {(monitoring?.activePersonnel || []).map((p) =>

                  p.location?.latitude ? (

                    <CircleMarker

                      key={p.userId || p._id}

                      center={[p.location.latitude, p.location.longitude]}

                      radius={8}

                      pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.8 }}

                    >

                      <Popup>{p.name || 'Worker'} — {p.status || 'active'}</Popup>

                    </CircleMarker>

                  ) : null

                )}

                {(monitoring?.equipmentStatus || []).map((eq) =>

                  eq.metrics?.latitude && eq.metrics?.longitude ? (

                    <CircleMarker

                      key={`eq-${eq.equipmentId}`}

                      center={[eq.metrics.latitude, eq.metrics.longitude]}

                      radius={6}

                      pathOptions={{

                        color: eq.status === 'operational' ? '#3b82f6' : '#f59e0b',

                        fillColor: eq.status === 'operational' ? '#3b82f6' : '#f59e0b',

                        fillOpacity: 0.7,

                      }}

                    >

                      <Popup>{eq.name} — {eq.status}</Popup>

                    </CircleMarker>

                  ) : null

                )}

                {hazardZones.filter((z) => z.active !== false).map((z) => (

                  <Circle

                    key={z._id}

                    center={[z.center.latitude, z.center.longitude]}

                    radius={z.radiusMeters || 100}

                    pathOptions={{

                      color: z.status === 'evacuation' ? '#ef4444' : '#f97316',

                      fillOpacity: 0.12,

                    }}

                  >

                    <Popup>{z.name} — {z.zoneType?.replace(/_/g, ' ')}</Popup>

                  </Circle>

                ))}

              </MapContainer>

            </div>



            <div className="space-y-4">

              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">

                <h3 className="font-semibold text-white mb-3">Equipment status</h3>

                <ul className="space-y-2 max-h-48 overflow-y-auto">

                  {(monitoring?.equipmentStatus || []).length === 0 && (

                    <li className="text-sm text-slate-500">

                      No equipment — <Link to="/equipment-registry" className="text-amber-400 hover:underline">register assets</Link>

                    </li>

                  )}

                  {(monitoring?.equipmentStatus || []).map((eq) => (

                    <li key={eq.equipmentId} className="flex justify-between items-center gap-2 text-sm">

                      <span className="text-slate-300 truncate">{eq.name}</span>

                      {isManager ? (

                        <select

                          className="input-field !w-auto !py-1 !text-xs !bg-slate-900"

                          value={eq.status}

                          disabled={updatingEq === eq.equipmentId}

                          onChange={(e) => updateEquipmentStatus(eq.equipmentId, e.target.value)}

                        >

                          {EQUIPMENT_STATUSES.map((s) => (

                            <option key={s} value={s}>{s}</option>

                          ))}

                        </select>

                      ) : (

                        <span className={

                          eq.status === 'operational' ? 'text-emerald-400' :

                          eq.status === 'warning' ? 'text-amber-400' : 'text-red-400'

                        }>{eq.status}</span>

                      )}

                    </li>

                  ))}

                </ul>

              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">

                <h3 className="font-semibold text-white mb-3">Active personnel ({monitoring?.activePersonnel?.length || 0})</h3>

                <ul className="space-y-2 max-h-48 overflow-y-auto text-sm text-slate-400">

                  {(monitoring?.activePersonnel || []).length === 0 && <li>No live positions — enable GPS sharing</li>}

                  {(monitoring?.activePersonnel || []).map((p) => (

                    <li key={p.userId}>{p.name || p.userId} — {p.status || 'active'}</li>

                  ))}

                </ul>

              </div>

            </div>

          </div>



          {isManager && (

            <form onSubmit={saveEnvironment} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">

              <h3 className="font-semibold text-white mb-3">Update environmental sensors</h3>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">

                <input

                  type="number"

                  step="0.01"

                  className="input-field"

                  placeholder="Methane %"

                  value={envForm.methane}

                  onChange={(e) => setEnvForm({ ...envForm, methane: e.target.value })}

                />

                <input

                  type="number"

                  step="0.1"

                  className="input-field"

                  placeholder="CO ppm"

                  value={envForm.carbonMonoxide}

                  onChange={(e) => setEnvForm({ ...envForm, carbonMonoxide: e.target.value })}

                />

                <input

                  type="number"

                  step="0.1"

                  className="input-field"

                  placeholder="Ambient °C"

                  value={envForm.ambient}

                  onChange={(e) => setEnvForm({ ...envForm, ambient: e.target.value })}

                />

                <input

                  type="number"

                  step="0.1"

                  className="input-field"

                  placeholder="Airflow %"

                  value={envForm.airflow}

                  onChange={(e) => setEnvForm({ ...envForm, airflow: e.target.value })}

                />

              </div>

              <div className="mt-3 flex justify-end">

                <Button type="submit" variant="primary">Save readings</Button>

              </div>

            </form>

          )}

        </div>

      )}

    </PageShell>

  );

};



export default LiveOperationsPage;

