import React, { useState, useEffect } from 'react';
import axios from '../services/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CircularProgress, Snackbar, Alert, TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';

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
          const response = await axios.get(`/reports/${reportType}`, {
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
      const imgWidth = 190; // width of A4 page in mm
      const pageHeight = 290; // height of A4 page in mm
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
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Report Generation</h2>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
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
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={generatePDF}
        fullWidth
        disabled={loading}
        style={{ marginTop: '20px' }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate PDF'}
      </Button>

      <div id="report-content" className="p-4 bg-gray-100 rounded mt-4">
        <h3 className="text-xl font-bold mb-2">Report Preview</h3>
        {loading ? (
          <CircularProgress color="primary" />
        ) : reportData.length > 0 ? (
          <div>
            {reportData.map((data, index) => (
              <div key={index} className="mb-2 p-2 border-b">
                <p><strong>Date:</strong> {data.date}</p>
                <p><strong>Details:</strong> {data.details}</p>
                <p><strong>Comments:</strong> {data.comments}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No data available for the selected date range.</p>
        )}
      </div>

      {/* Success Snackbar */}
      {successMessage && (
        <Snackbar
          open={Boolean(successMessage)}
          autoHideDuration={6000}
          onClose={handleSuccessClose}
        >
          <Alert onClose={handleSuccessClose} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReportGeneration;
