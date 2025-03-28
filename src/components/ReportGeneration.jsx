import React, { useState, useEffect } from 'react';
import axios from '../services/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CircularProgress, Snackbar, Alert, TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid, Paper } from '@mui/material';

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
    <div className="p-12 bg-gray-900 text-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-400">Report Generation</h2>
      
      <Paper elevation={8} className="p-6 bg-gray-800 rounded-lg">
        <Grid container spacing={3}>
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

        <Button
          variant="contained"
          color="primary"
          onClick={generatePDF}
          fullWidth
          disabled={loading}
          className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg shadow-md"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate PDF'}
        </Button>
      </Paper>

      <div id="report-content" className="p-6 bg-gray-800 rounded-lg mt-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-blue-300">Report Preview</h3>
        {loading ? (
          <CircularProgress color="secondary" />
        ) : reportData.length > 0 ? (
          <div>
            {reportData.map((data, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg shadow-md border border-blue-400">
                <p><strong className="text-blue-300">Date:</strong> {data.date}</p>
                <p><strong className="text-blue-300">Details:</strong> {data.details}</p>
                <p><strong className="text-blue-300">Comments:</strong> {data.comments}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No data available for the selected date range.</p>
        )}
      </div>

      <Snackbar open={Boolean(successMessage)} autoHideDuration={6000} onClose={handleSuccessClose}>
        <Alert onClose={handleSuccessClose} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReportGeneration;