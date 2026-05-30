import api from '../services/axios';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FiPlus, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8' } },
  },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,0.1)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,0.1)' } },
  },
};

const DataVisualization = () => {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', value: '', description: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/prod/getData', {
        params: {
          startDate,
          endDate,
          page,
          limit: 20,
          sortBy: 'date',
          order: 'asc',
        },
      });
      const rows = response.data?.data ?? [];
      setData(rows);
      setTotalPages(response.data?.metadata?.totalPages ?? 1);
    } catch {
      toast.error('Failed to load productivity data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, page]);

  const chartData = useMemo(() => {
    const values = data.map((item) => {
      const v = item.value;
      if (Array.isArray(v)) return v[0] ?? 0;
      return Number(v) || 0;
    });
    return {
      labels: data.map((item) => item.date),
      datasets: [
        {
          label: 'Productivity index',
          data: values,
          borderColor: '#f59e0b',
          backgroundColor: chartType === 'line' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.6)',
          fill: chartType === 'line',
          tension: 0.35,
        },
      ],
    };
  }, [data, chartType]);

  const stats = useMemo(() => {
    const values = data.map((item) => {
      const v = item.value;
      return Array.isArray(v) ? v[0] : Number(v) || 0;
    });
    const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
    const max = values.length ? Math.max(...values) : 0;
    return { count: data.length, avg, max };
  }, [data]);

  const handleSaveRecord = async () => {
    try {
      const formattedValue = formData.value
        .split(',')
        .map((n) => parseFloat(n.trim()))
        .filter((n) => !Number.isNaN(n));
      await api.post('/prod/createData', {
        date: formData.date,
        value: formattedValue.length ? formattedValue : [parseFloat(formData.value) || 0],
        description: formData.description,
      });
      toast.success('Record added');
      setModalOpen(false);
      setFormData({ date: '', value: '', description: '' });
      fetchData();
    } catch {
      toast.error('Failed to save record');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/prod/${id}`);
      toast.success('Record deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const ChartComponent = chartType === 'bar' ? Bar : Line;

  return (
    <PageShell title="Analytics" subtitle="Productivity trends and operational metrics" variant="dark">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ops-kpi-grid mb-6">
        {[
          { label: 'Data points', value: stats.count, icon: <FiTrendingUp className="text-amber-400" /> },
          { label: 'Average', value: stats.avg, icon: null },
          { label: 'Peak', value: stats.max, icon: null },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ops-kpi border-slate-700/70 bg-slate-900/50"
          >
            <div className="flex justify-between mb-1">
              {kpi.icon}
              <span className="ops-kpi-label">{kpi.label}</span>
            </div>
            <p className="ops-kpi-value">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="toolbar flex-wrap mb-4">
        <select className="input-field !w-auto" value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="line">Line chart</option>
          <option value="bar">Bar chart</option>
        </select>
        <input type="date" className="input-field !w-auto" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" className="input-field !w-auto" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button onClick={() => setModalOpen(true)}>
          <FiPlus className="inline mr-1" /> Add record
        </Button>
      </div>

      <div className="ops-panel mb-6">
        <div className="ops-panel-body h-[320px]">
          {loading ? (
            <LoadingBlock label="Loading chart…" />
          ) : data.length === 0 ? (
            <EmptyState title="No data" message="Add productivity records or widen the date range." />
          ) : (
            <ChartComponent data={chartData} options={defaultChartOptions} />
          )}
        </div>
      </div>

      <div className="ops-panel">
        <div className="ops-panel-header">
          <h3 className="font-semibold text-white text-sm">Records</h3>
        </div>
        <div className="ops-panel-body p-0 overflow-x-auto">
          {data.length === 0 ? null : (
            <table className="w-full text-sm">
              <thead className="text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Value</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((record) => (
                  <tr key={record.id || record._id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                    <td className="p-3 text-white">{record.date}</td>
                    <td className="p-3 text-amber-300">{Array.isArray(record.value) ? record.value.join(', ') : record.value}</td>
                    <td className="p-3 text-slate-400">{record.description || '—'}</td>
                    <td className="p-3 text-right">
                      <button type="button" className="btn-ghost !text-red-400 !p-2" onClick={() => handleDeleteRecord(record.id || record._id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-800">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="self-center text-xs text-slate-500">Page {page} / {totalPages}</span>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add productivity record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRecord}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Date">
            <input type="date" className="input-field" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </FormField>
          <FormField label="Value" hint="Single number or comma-separated">
            <input className="input-field" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="e.g. 85 or 80,90,88" />
          </FormField>
          <FormField label="Description">
            <input className="input-field" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </FormField>
        </div>
      </Modal>
    </PageShell>
  );
};

export default DataVisualization;
