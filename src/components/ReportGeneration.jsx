import api from '../services/axios';
import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiCalendar } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import LoadingBlock from './ui/LoadingBlock';
import EmptyState from './ui/EmptyState';

const inDateRange = (value, startDate, endDate) => {
  if (!value) return false;
  const d = new Date(value);
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
};

const REPORT_TYPES = [
  { value: 'shiftLogs', label: 'Shift handover logs' },
  { value: 'safetyPlans', label: 'Safety plans' },
  { value: 'safetyReports', label: 'Safety incident reports' },
];

const ReportGeneration = () => {
  const [reportType, setReportType] = useState('shiftLogs');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!startDate || !endDate) {
        setReportData([]);
        return;
      }
      setLoading(true);
      try {
        let rows = [];
        if (reportType === 'shiftLogs') {
          const { data } = await api.get('/getAllLogs', { params: { limit: 500, page: 1 } });
          rows = (data?.shiftLogs || [])
            .filter((log) => inDateRange(log.createdAt, startDate, endDate))
            .map((log) => ({
              date: new Date(log.createdAt).toLocaleDateString(),
              title: log.shiftDetails?.slice(0, 60) || 'Shift log',
              details: log.shiftDetails || '—',
              meta: log.status || log.notes || '—',
            }));
        } else if (reportType === 'safetyPlans') {
          const { data } = await api.get('/getAllSafety');
          const plans = Array.isArray(data) ? data : [];
          rows = plans
            .filter((plan) => inDateRange(plan.createdAt, startDate, endDate))
            .map((plan) => ({
              date: new Date(plan.createdAt).toLocaleDateString(),
              title: plan.hazardDetails?.slice(0, 60) || 'Safety plan',
              details: plan.hazardDetails || '—',
              meta: `${plan.riskLevel || ''} · ${plan.status || ''}`,
            }));
        } else {
          const { data } = await api.get('/getAllReports');
          const reports = Array.isArray(data) ? data : [];
          rows = reports
            .filter((r) => inDateRange(r.incidentDate || r.createdAt, startDate, endDate))
            .map((r) => ({
              date: new Date(r.incidentDate || r.createdAt).toLocaleDateString(),
              title: r.reportTitle || 'Report',
              details: r.description || '—',
              meta: `${r.riskLevel || ''} · ${r.status || 'Pending'}`,
            }));
        }
        setReportData(rows);
      } catch {
        toast.error('Failed to load report data');
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [reportType, startDate, endDate]);

  const exportCSV = () => {
    const header = 'Date,Title,Details,Meta\n';
    const body = reportData
      .map((r) => `"${r.date}","${r.title}","${r.details.replace(/"/g, '""')}","${r.meta}"`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mine_report_${reportType}_${startDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const generatePDF = async () => {
    const input = document.getElementById('report-content');
    if (!input || !reportData.length) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#0f172a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgWidth = 520;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 40, 40, imgWidth, Math.min(imgHeight, 700));
      pdf.save(`mine_report_${reportType}.pdf`);
      toast.success('PDF generated');
    } catch {
      toast.error('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  const typeLabel = REPORT_TYPES.find((t) => t.value === reportType)?.label || reportType;

  return (
    <PageShell
      title="Report generation"
      subtitle="Export operational and safety data for audits and management"
      variant="dark"
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportCSV} disabled={!reportData.length}>
            <FiDownload /> CSV
          </Button>
          <Button onClick={generatePDF} disabled={exporting || !reportData.length}>
            <FiFileText /> {exporting ? 'Exporting…' : 'PDF'}
          </Button>
        </div>
      }
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ops-kpi-grid mb-6">
        {[
          { label: 'Records in range', value: reportData.length, icon: <FiFileText className="text-amber-400" /> },
          { label: 'Report type', value: typeLabel, icon: <FiCalendar className="text-blue-400" /> },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="ops-kpi border-slate-700/70 bg-slate-900/50 col-span-full sm:col-span-1"
          >
            <div className="flex justify-between mb-1">{kpi.icon}<span className="ops-kpi-label">{kpi.label}</span></div>
            <p className="ops-kpi-value !text-lg truncate">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="ops-panel mb-6">
        <div className="ops-panel-body grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Report type</label>
            <select className="input-field" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Start date</label>
            <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label-field">End date</label>
            <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div id="report-content" className="ops-panel">
        <div className="ops-panel-header">
          <h3 className="font-semibold text-white">Preview — {typeLabel}</h3>
          <span className="text-xs text-slate-500">{startDate} → {endDate}</span>
        </div>
        <div className="ops-panel-body">
          {loading ? (
            <LoadingBlock label="Loading records…" />
          ) : reportData.length === 0 ? (
            <EmptyState title="No records" message="Adjust the date range or report type." />
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto">
              {reportData.map((row, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="rounded-xl border border-slate-700 bg-slate-800/40 p-4"
                >
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="font-medium text-white">{row.title}</span>
                    <span className="text-xs text-slate-500 shrink-0">{row.date}</span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{row.details}</p>
                  <p className="text-xs text-amber-500/80 mt-2">{row.meta}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default ReportGeneration;
