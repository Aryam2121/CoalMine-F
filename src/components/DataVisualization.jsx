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
  const [theme, setTheme] = useState('light');
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [closeDialog, openDialog] = useState(false);
  const [formData, setFormData] = useState({ id: '', date: dayjs(), value: '', description: '' });
  const [isEdit, setIsEdit] = useState(false);
const [data, setData] = useState([]);
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/prod/getData`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
        },
      });

      const { data } = response.data;

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

  // Fetch data initially and on dependency change
  useEffect(() => {
    fetchData();
  }, [startDate, endDate]); 
  
  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add or Update Record
  const handleSaveRecord = async () => {
    try {
      const { id, date, value, description } = formData;

      if (isEdit) {
        await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/prod/${id}`, { date, value, description });
        setSnackbarMessage('Record updated successfully');
      } else {
        await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/prod/createData`, { date, value, description });
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

  // Delete Record
  const handleDeleteRecord = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/Productivity/${id}`);
      setSnackbarMessage('Record deleted successfully');
      setSnackbarOpen(true);
      fetchData();
    } catch (error) {
      setSnackbarMessage('Error deleting record');
      setSnackbarOpen(true);
    }
  };

  // Fetch data initially and periodically
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const ChartComponent = chartType === 'line' ? Line : chartType === 'bar' ? Bar : Pie;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} transition-all duration-300`}>
        <h2 className="text-3xl font-semibold mb-6">Real-Time Productivity Data</h2>
            {/* Button to Add New Record */}
            <Button
    variant="contained"
    color="primary"
    onClick={() => setDialogOpen(true)}
    className="absolute top-4 right-4" // Position the button at the top-right corner
  >
    Add New Record
  </Button>
        <FormControlLabel
          control={<Switch checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />}
          label="Dark Mode"
        />

        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6}>
            <Card className="p-4">
              <CardContent>
                <InputLabel className="font-medium">Chart Type</InputLabel>
                <Select value={chartType} onChange={handleChartTypeChange} fullWidth className="mb-2">
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                </Select>
              </CardContent>
            </Card>
          </Grid>
          {/* Data Display */}
          <div className="h-96 overflow-y-scroll">
  <Grid container spacing={3}>
    {data.map((item) => (
      <Grid item xs={12} sm={6} key={item.id}>
        <Card className="p-4">
          <CardContent>
            <h3>{item.date}</h3>
            <p>{item.value}</p>
            <p>{item.description}</p>
            <Button variant="contained" color="primary" onClick={() => openDialog(item)}>Edit</Button>
            <Button variant="outlined" color="secondary" onClick={() => handleDeleteRecord(item.id)} className="ml-2">
              Delete
            </Button>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
</div>


          <Grid item xs={12} sm={6}>
            <Card className="p-4">
              <CardContent>
                <InputLabel className="font-medium">Date Range</InputLabel>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
  <DatePicker
    label="Start Date"
    value={startDate}
    onChange={(newValue) => setStartDate(newValue)}
    renderInput={(params) => <TextField {...params} fullWidth />}
  />
</LocalizationProvider>

                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(date) => setEndDate(date)}
                      renderInput={(props) => <TextField {...props} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <div className="chart-container mb-6" style={{ width: '100%', height: '400px' }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <CircularProgress size={50} />
            </div>
          ) : chartData.labels.length > 0 && chartData.datasets.length > 0 ? (
            <ChartComponent data={chartData} options={{ maintainAspectRatio: false }} />
          ) : (
            <p className="text-center text-gray-500">No data available for the selected chart type.</p>
          )}
        </div>

  


        {/* Dialog for Adding/Editing Record */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
  <DialogTitle>{isEdit ? 'Edit Record' : 'Add New Record'}</DialogTitle>
  <DialogContent>
    <TextField
      label="Date"
      type="date"
      value={formData.date}
      onChange={(e) => handleFormChange('date', e.target.value)}
      fullWidth
      margin="normal"
      InputLabelProps={{
        shrink: true,
      }}
    />
    <TextField
      label="Value"
      value={formData.value}
      onChange={(e) => handleFormChange('value', e.target.value)}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Description"
      value={formData.description}
      onChange={(e) => handleFormChange('description', e.target.value)}
      fullWidth
      margin="normal"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDialogOpen(false)} color="secondary"> {/* Close dialog */}
      Cancel
    </Button>
    <Button onClick={handleSaveRecord} color="primary">
      {isEdit ? 'Update Record' : 'Add Record'}
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
