import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Button, Select, MenuItem, Switch, FormControlLabel, InputLabel, Grid, Card, CardContent, CircularProgress, Snackbar, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const DataVisualization = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartType, setChartType] = useState('line');
  const [theme, setTheme] = useState('dark'); // Default to dark mode
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', date: dayjs(), value: '', description: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/prod/getData`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          page,
          limit: 10,
          sortBy: 'date',
          order: 'asc',
        },
      });

      const { data, metadata } = response.data;
      setData(data);
      setTotalPages(metadata.totalPages);
      setChartData({
        labels: data.map((item) => item.date),
        datasets: [
          {
            label: 'Real-Time Productivity',
            data: data.map((item) => item.value),
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      setSnackbarMessage('Error fetching data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, page]);

  const handleFormChange = (field, value) => {
    if (field === "value") {
      value = value.split(",").map(num => parseFloat(num.trim())); // Convert string to array of numbers
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSaveRecord = async () => {
    try {
      const { id, date, value, description } = formData;
      
      // Ensure value is an array of numbers
      const formattedValue = Array.isArray(value) ? value : value.split(",").map(num => parseFloat(num.trim()));
  
      if (isEdit) {
        await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/prod/${id}`, { date, value: formattedValue, description });
        setSnackbarMessage('Record updated successfully');
      } else {
        await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/prod/createData`, { date, value: formattedValue, description });
        setSnackbarMessage('Record added successfully');
      }
      setSnackbarOpen(true);
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      setSnackbarMessage('Error saving record');
      setSnackbarOpen(true);
    }
  };
  
  const handleDeleteRecord = async (id) => {
    try {
      await axios.delete(`https://${import.meta.env.VITE_BACKEND}/api/prod/${id}`);
      setSnackbarMessage('Record deleted successfully');
      setSnackbarOpen(true);
      fetchData();
    } catch (error) {
      setSnackbarMessage('Error deleting record');
      setSnackbarOpen(true);
    }
  };


  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const ChartComponent = chartType === 'line' ? Line : chartType === 'bar' ? Bar : Pie;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="p-10 rounded-xl shadow-lg bg-gray-900 text-white transition-all duration-300 min-h-screen">
        <h2 className="text-4xl font-bold mb-6 text-center tracking-wide">📊 Real-Time Productivity Data</h2>
  
        <div className="flex justify-between items-center mb-8">
          <FormControlLabel
            control={
              <Switch
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="scale-110"
              />
            }
            label="Dark Mode"
            className="text-lg"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
            className="px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all"
          >
            ➕ Add New Record
          </Button>
        </div>
  
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6}>
            <Card className="p-4 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-md">
              <CardContent>
                <InputLabel className="font-medium text-lg mb-2">📉 Chart Type</InputLabel>
                <Select
                  value={chartType}
                  onChange={handleChartTypeChange}
                  fullWidth
                  className="bg-gray-700 text-white p-2 rounded-md"
                >
                  <MenuItem value="line">📈 Line Chart</MenuItem>
                  <MenuItem value="bar">📊 Bar Chart</MenuItem>
                  <MenuItem value="pie">🥧 Pie Chart</MenuItem>
                </Select>
              </CardContent>
            </Card>
          </Grid>
  
          <Grid item xs={12} sm={6}>
            <Card className="p-4 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-md">
              <CardContent>
                <InputLabel className="font-medium text-lg mb-2">📆 Date Range</InputLabel>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker label="Start Date" value={startDate} onChange={(newValue) => setStartDate(newValue)} />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker label="End Date" value={endDate} onChange={(date) => setEndDate(date)} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
  
        <Card className="p-6 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg">
          <CardContent>
            <h3 className="text-2xl font-semibold mb-4">📋 Data Records</h3>
            {data.length === 0 ? (
              <p className="text-gray-400 text-center text-lg">🚫 No records available</p>
            ) : (
              <table className="w-full text-left border-collapse rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700 text-white text-lg">
                    <th className="p-3 border">📅 Date</th>
                    <th className="p-3 border">📊 Value</th>
                    <th className="p-3 border">📝 Description</th>
                    <th className="p-3 border text-center">⚙️ Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((record) => (
                    <tr
                      key={record.id}
                      className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800 transition-all"
                    >
                      <td className="p-3 border">{record.date}</td>
                      <td className="p-3 border">{record.value}</td>
                      <td className="p-3 border">{record.description}</td>
                      <td className="p-3 border flex gap-3 justify-center">
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="px-4 py-1 rounded-md shadow-md hover:bg-red-600 transition-all"
                        >
                          🗑 Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
  
        <div className="chart-container mb-8 h-[400px] flex justify-center items-center">
          {loading ? (
            <CircularProgress size={50} />
          ) : chartData.labels.length > 0 && chartData.datasets.length > 0 ? (
            <ChartComponent data={chartData} options={{ maintainAspectRatio: false }} />
          ) : (
            <p className="text-center text-gray-400 text-lg">🚀 No data available for the selected chart type.</p>
          )}
        </div>
  
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? '✏️ Edit Record' : '➕ Add New Record'}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="📅 Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleFormChange('date', e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="📊 Value"
              value={formData.value}
              onChange={(e) => handleFormChange('value', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="📝 Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">
              ❌ Cancel
            </Button>
            <Button onClick={handleSaveRecord} color="primary">
              {isEdit ? '💾 Update Record' : '✅ Add Record'}
            </Button>
          </DialogActions>
        </Dialog>
  
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </div>
    </LocalizationProvider>
  );
  
};

export default DataVisualization;
