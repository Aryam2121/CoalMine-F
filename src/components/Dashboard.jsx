import api from '../services/axios';
import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import {
  FaIndustry,
  FaUsers,
  FaExclamationTriangle,
  FaTools,
  FaChartLine,
  FaMapMarkedAlt,
  FaHardHat,
  FaBell,
  FaClipboardList,
  FaFileAlt,
  FaSyncAlt,
  FaPlus,
  FaArrowRight,
  FaShieldAlt,
} from 'react-icons/fa';
import Button from './ui/Button';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';
import Modal from './ui/Modal';
import { useSocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { canAccessPath, hasPermission, PERMISSIONS } from '../utils/roles';
import { toast } from 'react-toastify';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const mapIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const chartColors = {
  text: '#94a3b8',
  grid: 'rgba(148, 163, 184, 0.15)',
  tooltip: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    titleColor: '#f8fafc',
    bodyColor: '#cbd5e1',
    padding: 12,
    cornerRadius: 10,
    displayColors: true,
  },
};

const DOUGHNUT_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#64748b'];

/** API returns datasets without colors — Chart.js then draws invisible segments on dark UI */
function styleLineChart(chart) {
  const ds = chart?.datasets?.[0];
  if (!ds) return chart;
  return {
    ...chart,
    datasets: [
      {
        ...ds,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.25)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#1e293b',
        pointBorderWidth: 2,
      },
    ],
  };
}

function styleDoughnutChart(chart) {
  const ds = chart?.datasets?.[0];
  if (!ds) return chart;
  const n = ds.data?.length || 3;
  return {
    ...chart,
    datasets: [
      {
        ...ds,
        backgroundColor: DOUGHNUT_COLORS.slice(0, n),
        borderColor: '#1e293b',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };
}

function styleBarChart(chart) {
  const ds = chart?.datasets?.[0];
  if (!ds) return chart;
  const n = ds.data?.length || 1;
  return {
    ...chart,
    datasets: [
      {
        ...ds,
        backgroundColor: BAR_COLORS.slice(0, n),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: chartColors.tooltip,
  },
  scales: {
    x: {
      ticks: { color: chartColors.text, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 },
      grid: { display: false },
    },
    y: {
      ticks: { color: chartColors.text },
      grid: { color: chartColors.grid },
      beginAtZero: true,
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: chartColors.text,
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 10,
        boxHeight: 10,
      },
    },
    tooltip: chartColors.tooltip,
  },
};

const barOptions = {
  ...lineOptions,
  indexAxis: 'y',
  plugins: { ...lineOptions.plugins, legend: { display: false } },
};

function buildChartsFromRaw({ productivity, alerts, resources }) {
  const prodRecords = (productivity || [])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);
  const prodLabels = prodRecords.map((r) =>
    new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
  );
  const prodData = prodRecords.map((r) => {
    const vals = Array.isArray(r.value) ? r.value : [r.value];
    return Math.round(vals.reduce((s, n) => s + Number(n), 0) / vals.length);
  });

  const resolved = (alerts || []).filter((a) => a.resolved).length;
  const warning = (alerts || []).filter((a) => !a.resolved && a.type === 'warning').length;
  const critical = (alerts || []).filter((a) => !a.resolved && a.type === 'critical').length;

  const byType = {};
  (resources || []).forEach((r) => {
    const k = r.type || 'other';
    if (!byType[k]) byType[k] = { sum: 0, n: 0 };
    byType[k].sum += r.used || 0;
    byType[k].n += 1;
  });
  const typeEntries = Object.entries(byType).slice(0, 6);

  return {
    productivity: {
      labels: prodLabels.length ? prodLabels : ['—'],
      datasets: [
        {
          label: 'Index',
          data: prodData.length ? prodData : [0],
          borderColor: '#f59e0b',
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
            g.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
            g.addColorStop(1, 'rgba(245, 158, 11, 0)');
            return g;
          },
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    },
    safety: {
      labels: ['Resolved', 'Warning', 'Critical'],
      datasets: [
        {
          data: [resolved, warning, critical],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    resources: {
      labels: typeEntries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [
        {
          data: typeEntries.map(([, v]) => Math.round(v.sum / v.n)),
          backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#64748b'],
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
  };
}

async function fetchDashboardFallback() {
  const [alertsRes, maintRes, prodRes, resRes, locRes] = await Promise.all([
    api.get('/alerts/getallalerts', { params: { limit: 50, page: 1 } }).catch(() => ({ data: { alerts: [] } })),
    api.get('/getallTask').catch(() => ({ data: [] })),
    api.get('/prod/getData', { params: { limit: 30, page: 1 } }).catch(() => ({ data: { data: [] } })),
    api.get('/getAllRes').catch(() => ({ data: [] })),
    api.get('/getallloc').catch(() => ({ data: [] })),
  ]);

  const alerts = alertsRes.data?.alerts || [];
  const productivity = prodRes.data?.data || [];
  const resources = Array.isArray(resRes.data) ? resRes.data : [];
  const maintenance = Array.isArray(maintRes.data) ? maintRes.data : [];
  const locations = Array.isArray(locRes.data) ? locRes.data : [];
  const openAlerts = alerts.filter((a) => !a.resolved);
  const charts = buildChartsFromRaw({ productivity, alerts, resources });
  const weekly = charts.productivity.datasets[0].data;

  return {
    stats: {
      activeMines: locations.length,
      coalMineSites: locations.length,
      totalWorkers: 0,
      openAlerts: openAlerts.length,
      criticalAlerts: openAlerts.filter((a) => a.type === 'critical').length,
      maintenanceOpen: maintenance.filter((m) => !['completed', 'cancelled'].includes(m.status)).length,
      avgProductivity: weekly.length ? Math.round(weekly.reduce((a, b) => a + b, 0) / weekly.length) : 0,
    },
    charts: {
      productivity: { labels: charts.productivity.labels, datasets: charts.productivity.datasets },
      safetyCompliance: { labels: charts.safety.labels, datasets: charts.safety.datasets },
      departmentPerformance: { labels: charts.resources.labels, datasets: charts.resources.datasets },
    },
    recentAlerts: openAlerts.slice(0, 10).map((a) => ({
      _id: a._id,
      message: a.message,
      type: a.type,
      timestamp: a.timestamp,
    })),
    maintenance,
    locations,
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

function KpiCard({ label, value, icon, variant, sub, index = 0 }) {
  return (
    <motion.div variants={fadeUp} custom={index} className={`dash-kpi dash-kpi--${variant}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`dash-kpi-icon bg-white/60 dark:bg-white/5`}>{icon}</div>
        {sub && <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{sub}</span>}
      </div>
      <p className="dash-kpi-value mt-3">{value}</p>
      <p className="dash-kpi-label mt-1">{label}</p>
    </motion.div>
  );
}

function Panel({ title, icon, action, children, className = '' }) {
  return (
    <motion.div variants={fadeUp} className={`dash-panel ${className}`}>
      <div className="dash-panel-header">
        <h3 className="dash-panel-title">
          {icon}
          {title}
        </h3>
        {action}
      </div>
      <div className="dash-panel-body">{children}</div>
    </motion.div>
  );
}

const QUICK_LINKS = [
  { to: '/live-operations', label: 'Live ops', icon: FaMapMarkedAlt },
  { to: '/evacuation', label: 'Evacuation', icon: FaShieldAlt },
  { to: '/near-miss', label: 'Near-miss', icon: FaExclamationTriangle },
  { to: '/incident-forecast', label: 'Risk forecast', icon: FaChartLine },
  { to: '/alerts', label: 'Alerts', icon: FaBell },
  { to: '/emergency', label: 'Emergency', icon: FaExclamationTriangle },
  { to: '/shift-logs', label: 'Shift logs', icon: FaClipboardList },
  { to: '/coal-mines', label: 'Mines', icon: FaHardHat },
  { to: '/report-generation', label: 'Reports', icon: FaFileAlt },
];

const Dashboard = () => {
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [lineChart, setLineChart] = useState(null);
  const [pieChart, setPieChart] = useState(null);
  const [barChart, setBarChart] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ task: '', date: '', description: '', priority: 3, status: 'pending' });

  const applyPayload = (data) => {
    setStats(data.stats);
    const prod = data.charts?.productivity;
    const safety = data.charts?.safetyCompliance;
    const dept = data.charts?.departmentPerformance;

    setLineChart(
      styleLineChart({
        labels: prod?.labels?.length ? prod.labels : ['—'],
        datasets: prod?.datasets?.length
          ? prod.datasets
          : [{ label: 'Index', data: [0] }],
      })
    );

    setPieChart(
      styleDoughnutChart({
        labels: safety?.labels || ['Resolved', 'Warning', 'Critical'],
        datasets: safety?.datasets?.length
          ? safety.datasets
          : [{ data: [0, 0, 0] }],
      })
    );

    setBarChart(
      styleBarChart({
        labels: dept?.labels?.length ? dept.labels : ['—'],
        datasets: dept?.datasets?.length
          ? dept.datasets
          : [{ data: [0] }],
      })
    );

    setActiveAlerts(
      (data.recentAlerts || []).map((a) => ({
        id: a._id,
        message: a.message,
        type: a.type,
        timestamp: a.timestamp,
      }))
    );
    setMaintenanceTasks(data.maintenance || []);
    if (data.locations) setLocations(data.locations);
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/dashboard/summary', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });
      applyPayload(data);
    } catch (err) {
      console.warn('Dashboard summary failed, using fallback', err);
      try {
        applyPayload(await fetchDashboardFallback());
      } catch (e2) {
        setError('Could not load dashboard. Start backend and run npm run seed:large');
        console.error(e2);
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    api.get('/getallloc').then((r) => setLocations(r.data || [])).catch(() => {});
  }, []);

  const { socket, connected: socketConnected } = useSocketContext();
  const { user } = useContext(AuthContext);
  const quickLinks = useMemo(
    () => QUICK_LINKS.filter((link) => canAccessPath(user?.role, link.to)),
    [user?.role]
  );
  const canCreateTask = hasPermission(user?.role, PERMISSIONS.DASHBOARD_MAINTENANCE);

  useEffect(() => {
    if (!socket) return undefined;

    const onNewAlert = (alert) => {
      if (!alert || alert.resolved) return;
      setActiveAlerts((prev) => {
        if (prev.some((a) => a.id === alert._id)) return prev;
        return [
          {
            id: alert._id,
            message: alert.message,
            type: alert.type,
            timestamp: alert.timestamp || new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 10);
      });
      setStats((prev) =>
        prev
          ? {
              ...prev,
              openAlerts: (prev.openAlerts || 0) + 1,
              criticalAlerts:
                alert.type === 'critical' ? (prev.criticalAlerts || 0) + 1 : prev.criticalAlerts,
            }
          : prev
      );
      setPieChart((prev) => {
        if (!prev?.datasets?.[0]) return prev;
        const data = [...prev.datasets[0].data];
        if (alert.type === 'critical') data[2] = (data[2] || 0) + 1;
        else data[1] = (data[1] || 0) + 1;
        return styleDoughnutChart({ labels: prev.labels, datasets: [{ data }] });
      });
      toast.info(`New ${alert.type} alert`, { autoClose: 3000 });
    };

    const onResolved = ({ alertId, alert }) => {
      const id = alertId || alert?._id;
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              openAlerts: Math.max(0, (prev.openAlerts || 0) - 1),
              criticalAlerts:
                alert?.type === 'critical'
                  ? Math.max(0, (prev.criticalAlerts || 0) - 1)
                  : prev.criticalAlerts,
            }
          : prev
      );
      setPieChart((prev) => {
        if (!prev?.datasets?.[0]) return prev;
        const data = [...prev.datasets[0].data];
        data[0] = (data[0] || 0) + 1;
        if (alert?.type === 'critical') data[2] = Math.max(0, (data[2] || 0) - 1);
        else data[1] = Math.max(0, (data[1] || 0) - 1);
        return styleDoughnutChart({ labels: prev.labels, datasets: [{ data }] });
      });
    };

    const onBulkResolved = () => {
      setActiveAlerts([]);
      loadDashboard();
    };

    const onDeleted = ({ alertId }) => {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    };

    socket.on('alert:new', onNewAlert);
    socket.on('alert:resolved', onResolved);
    socket.on('alert:bulk-resolved', onBulkResolved);
    socket.on('alert:deleted', onDeleted);

    return () => {
      socket.off('alert:new', onNewAlert);
      socket.off('alert:resolved', onResolved);
      socket.off('alert:bulk-resolved', onBulkResolved);
      socket.off('alert:deleted', onDeleted);
    };
  }, [socket, loadDashboard]);

  const filteredMaintenance = useMemo(() => {
    if (!searchTerm.trim()) return maintenanceTasks;
    const q = searchTerm.toLowerCase();
    return maintenanceTasks.filter(
      (t) => t.task?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
  }, [maintenanceTasks, searchTerm]);

  const maintPreview = filteredMaintenance.slice(0, 6);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/createTask', newTask);
      setMaintenanceTasks((prev) => [data, ...prev]);
      setIsModalOpen(false);
      setNewTask({ task: '', date: '', description: '', priority: 3, status: 'pending' });
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  if (loading) return <LoadingBlock label="Loading operations dashboard…" />;

  return (
    <div className="page-wrap min-h-full">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dash-hero"
      >
        <div className="dash-hero-glow" />
        <div className="dash-hero-glow-2" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`dash-live-dot ${socketConnected ? '' : 'opacity-40'}`} />
              <span className={`text-xs font-semibold uppercase tracking-widest ${socketConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                {socketConnected ? 'Live · connected' : 'Live · reconnecting…'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Operations Command Center
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl text-sm md:text-base">
              Real-time safety, productivity, and maintenance across all mine sites — powered by your database.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="dash-quick-link">
                  <Icon /> {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="secondary" onClick={loadDashboard} className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
              <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Refresh
            </Button>
            {canCreateTask && (
              <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-amber-500/25">
                <FaPlus /> New task
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="alert-banner-error mb-6 flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="secondary" onClick={loadDashboard}>Retry</Button>
        </div>
      )}

      {/* Filters */}
      <div className="dash-filter-bar">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Date range</span>
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="input-field !w-auto !py-2 !text-sm"
        />
        <span className="text-slate-400">→</span>
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          className="input-field !w-auto !py-2 !text-sm"
        />
        {stats && (
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            {stats.openAlerts} open alerts · {stats.maintenanceOpen} active work orders
          </span>
        )}
      </div>

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
        {/* KPIs */}
        {stats && (
          <div className="dash-kpi-grid">
            {[
              { variant: 'slate', label: 'Active mines', value: stats.activeMines, icon: <FaIndustry className="text-slate-600" /> },
              { variant: 'blue', label: 'Personnel', value: stats.totalWorkers, icon: <FaUsers className="text-blue-600" /> },
              { variant: 'amber', label: 'Open alerts', value: stats.openAlerts, icon: <FaExclamationTriangle className="text-amber-600" />, sub: 'Unresolved' },
              { variant: 'red', label: 'Critical', value: stats.criticalAlerts, icon: <FaShieldAlt className="text-red-600" />, sub: 'Needs action' },
              { variant: 'violet', label: 'Maintenance', value: stats.maintenanceOpen, icon: <FaTools className="text-violet-600" /> },
              { variant: 'emerald', label: 'Productivity', value: `${stats.avgProductivity}%`, icon: <FaChartLine className="text-emerald-600" />, sub: '7-day avg' },
            ].map((kpi, i) => (
              <KpiCard key={kpi.label} {...kpi} index={i} />
            ))}
          </div>
        )}

        {stats && (stats.activeEvacuations > 0 || stats.nearMissOpen > 0) && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-red-400">Safety operations status</p>
              <p className="text-sm text-slate-400">
                {stats.activeEvacuations > 0 && `${stats.activeEvacuations} active evacuation(s) · `}
                {stats.nearMissOpen} open near-miss reports · {stats.contractorsOnSite} on-site visitors
              </p>
            </div>
            <div className="flex gap-2">
              {stats.activeEvacuations > 0 && (
                <Link to="/evacuation" className="dash-quick-link !border-red-500/50">Open evacuation center</Link>
              )}
              <Link to="/near-miss" className="dash-quick-link">Review near-miss</Link>
            </div>
          </div>
        )}

        {/* Charts bento */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
          <Panel
            className="xl:col-span-8"
            title="Productivity trend"
            icon={<FaChartLine className="text-amber-500" />}
            action={<span className="text-xs text-slate-500">Last 7 periods</span>}
          >
            <div className="h-[300px]">
              {lineChart && <Line data={lineChart} options={lineOptions} />}
            </div>
          </Panel>

          <Panel
            className="xl:col-span-4"
            title="Alert breakdown"
            icon={<FaExclamationTriangle className="text-amber-500" />}
          >
            <div className="h-[300px] flex items-center justify-center">
              {pieChart && <Doughnut data={pieChart} options={doughnutOptions} />}
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Panel title="Resource utilization" icon={<FaIndustry className="text-blue-500" />}>
            <div className="h-[260px]">
              {barChart && <Bar data={barChart} options={barOptions} />}
            </div>
          </Panel>

          <Panel
            title="Live alert feed"
            icon={<FaBell className="text-red-500" />}
            action={
              <Link to="/alerts" className="text-xs font-semibold text-amber-600 hover:text-amber-500 flex items-center gap-1">
                View all <FaArrowRight className="text-[10px]" />
              </Link>
            }
          >
            {activeAlerts.length === 0 ? (
              <EmptyState title="All clear" message="No open alerts right now." />
            ) : (
              <ul className="dash-alert-feed">
                {activeAlerts.map((alert) => (
                  <li
                    key={alert.id}
                    className={
                      alert.type === 'critical' ? 'dash-alert-item--critical' : 'dash-alert-item--warning'
                    }
                  >
                    <div
                      className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                        alert.type === 'critical' ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'
                      }`}
                    >
                      <FaExclamationTriangle className="text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-800 dark:text-slate-100 font-medium leading-snug line-clamp-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{timeAgo(alert.timestamp)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Map */}
        <Panel
          className="mb-6"
          title="Mine map"
          icon={<FaMapMarkedAlt className="text-emerald-500" />}
          action={
            <Link to="/coal-mines" className="text-xs font-semibold text-amber-600 hover:underline">
              Manage sites
            </Link>
          }
        >
          <div className="h-[340px] rounded-xl overflow-hidden ring-1 ring-slate-200/80 dark:ring-slate-700">
            {locations.length > 0 ? (
              <MapContainer center={[22.5, 82]} zoom={5} className="h-full w-full z-0">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {locations.map((loc) => (
                  <Marker
                    key={loc._id}
                    position={[loc.coordinates.coordinates[1], loc.coordinates.coordinates[0]]}
                    icon={mapIcon}
                  >
                    <Popup>
                      <strong>{loc.name}</strong>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm">
                No locations — run <code className="text-amber-600">npm run seed:large</code>
              </div>
            )}
          </div>
        </Panel>

        {/* Maintenance */}
        <Panel
          title="Maintenance queue"
          icon={<FaTools className="text-violet-500" />}
          action={
            <div className="flex gap-2 items-center">
              <input
                className="input-field !py-1.5 !text-xs !w-36"
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="text-xs text-slate-500">{filteredMaintenance.length} total</span>
            </div>
          }
        >
          {maintPreview.length === 0 ? (
            <EmptyState title="No tasks" message="Create a work order or seed the database." />
          ) : (
            <div className="space-y-2">
              {maintPreview.map((task) => {
                const pct =
                  task.status === 'completed' ? 100 : task.status === 'in-progress' ? 55 : task.status === 'overdue' ? 90 : 15;
                return (
                  <div key={task._id} className="dash-maint-card">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                        task.priority === 3
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                          : task.priority === 2
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                          : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                      }`}
                    >
                      {task.priority === 3 ? '!' : task.priority === 2 ? '◆' : '✓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white truncate">{task.task}</p>
                      <p className="text-xs text-slate-500 truncate">{task.description}</p>
                      <div className="mt-2 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            task.status === 'completed'
                              ? 'bg-emerald-500'
                              : task.status === 'overdue'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="badge-warning text-[10px]">{task.status}</span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
              {filteredMaintenance.length > 6 && (
                <p className="text-center text-xs text-slate-500 pt-2">
                  +{filteredMaintenance.length - 6} more tasks in database
                </p>
              )}
            </div>
          )}
        </Panel>
      </motion.div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New maintenance task"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="dash-task-form">Create task</Button>
          </>
        }
      >
        <form id="dash-task-form" onSubmit={handleCreateTask} className="space-y-4">
          <input className="input-field" placeholder="Task name" value={newTask.task} onChange={(e) => setNewTask({ ...newTask, task: e.target.value })} required />
          <input type="date" className="input-field" value={newTask.date} onChange={(e) => setNewTask({ ...newTask, date: e.target.value })} required />
          <textarea className="input-field" rows={3} placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          <select className="input-field" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: Number(e.target.value) })}>
            <option value={1}>Low priority</option>
            <option value={2}>Medium priority</option>
            <option value={3}>High priority</option>
          </select>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
