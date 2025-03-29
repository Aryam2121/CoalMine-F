import React, { useState, useEffect } from 'react';
import axios from '../services/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CircularProgress, Snackbar, Alert, TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid, Paper } from '@mui/material';

import { motion } from "framer-motion";
const ReportGeneration = () => {
  const [reportType, setReportType] = useState('shiftLogs');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      if (startDate && endDate) {
        setLoading(true);
        try {
          const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/getAllReports/${reportType}`, {
            params: { startDate, endDate },
          });
          setReportData(response.data);
        } catch (error) {
          setError('Error fetching report data.');
          setOpenSnackbar(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReportData();
  }, [reportType, startDate, endDate]);

  const generatePDF = async () => {
    const input = document.getElementById('report-content');
    if (input) {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const pageHeight = 290;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('report.pdf');
      setSuccessMessage('Report generated successfully!');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSuccessClose = () => {
    setSuccessMessage('');
  };

  return (
    <motion.div
      className="p-12 bg-gray-900 text-white rounded-xl shadow-2xl min-h-screen"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-4xl font-extrabold mb-6 text-center text-blue-400">Report Generation</h2>

      <motion.div
        className="p-6 bg-gray-800 rounded-xl shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel className="text-blue-300">Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-gray-700 text-white rounded-lg border border-blue-400"
              >
                <MenuItem value="shiftLogs">Shift Logs</MenuItem>
                <MenuItem value="safetyPlans">Safety Management Plans</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              className="bg-gray-700 text-white rounded-lg border border-blue-400"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              className="bg-gray-700 text-white rounded-lg border border-blue-400"
            />
          </Grid>
        </Grid>

        <motion.button
          onClick={generatePDF}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Generate PDF"}
        </motion.button>
      </motion.div>

      <motion.div
        className="p-6 bg-gray-800 rounded-xl mt-6 shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-3 text-blue-300">Report Preview</h3>
        {loading ? (
          <CircularProgress color="secondary" />
        ) : reportData.length > 0 ? (
          <div className="space-y-4">
            {reportData.map((data, index) => (
              <motion.div
                key={index}
                className="p-4 bg-gray-700 rounded-lg shadow-md border border-blue-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <p><strong className="text-blue-300">Date:</strong> {data.date}</p>
                <p><strong className="text-blue-300">Details:</strong> {data.details}</p>
                <p><strong className="text-blue-300">Comments:</strong> {data.comments}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No data available for the selected date range.</p>
        )}
      </motion.div>

      <Snackbar open={Boolean(successMessage)} autoHideDuration={6000} onClose={() => setSuccessMessage("")}>
        <Alert onClose={() => setSuccessMessage("")} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default ReportGeneration;