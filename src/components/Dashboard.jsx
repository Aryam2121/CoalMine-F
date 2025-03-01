import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  Filler,
} from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet.heat";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import Chatbot from './chatbot';
import axios from 'axios'; // Added import for axios
import 'leaflet/dist/leaflet.css';

ChartJS.register(Filler,Title, Tooltip, Legend, LineElement, BarElement, CategoryScale, LinearScale, PointElement, ArcElement);

 
const Dashboard = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const { id } = useParams();
  const [coalMine, setCoalMine] = useState(null);
  const [mineLocations, setMineLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState([12.9716, 77.5946]); 
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [filteredMaintenance, setFilteredMaintenance] = useState([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task: '',
    date: '',
    description: '',
    priority: 3,
    status: 'pending',
  });

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Productivity Over the Week',
        data: [70, 75, 80, 85, 90, 85, 80],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: ['Safe', 'Warning', 'Critical'],
    datasets: [
      {
        label: 'Safety Compliance Breakdown',
        data: [70, 20, 10],
        backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336'],
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: ['Dept A', 'Dept B', 'Dept C', 'Dept D'],
    datasets: [
      {
        label: 'Department Performance',
        data: [60, 80, 70, 90],
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        borderWidth: 1,
      },
    ],
  };
  const Heatmap = ({ data }) => {
    const map = useMap();
  
    useEffect(() => {
      if (!map || heatmapData.length === 0) return;
    
      const heatLayer = L.heatLayer(
        heatmapData.map(({ lat, lng, intensity }) => [lat, lng, intensity]),
        { radius: 25, blur: 15, maxZoom: 17 }
      );
    
      heatLayer.addTo(map);
    
      return () => map.removeLayer(heatLayer);
    }, [map, heatmapData]);
  }; 
const notifications = [
    { message: 'Safety gear check overdue', type: 'warning' },
    { message: 'Gas leakage detected in Mine 2', type: 'critical' },
  ];

  useEffect(() => {
    const darkModeSetting = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModeSetting);
  }, []);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };
  

  const generateToast = () => {
    const alert = notifications[Math.floor(Math.random() * notifications.length)];
    if (alert.type === 'critical') {
      toast.error(alert.message);
    } else {
      toast.warning(alert.message);
    }
  };

  useEffect(() => {
    const interval = setInterval(generateToast, 5000);
    return () => clearInterval(interval);
  }, [notifications]);

  const addActiveAlert = () => {
    const alert = notifications[Math.floor(Math.random() * notifications.length)];
    const newAlert = { ...alert, id: Date.now() };
    setActiveAlerts(prev => [newAlert, ...prev]);

    setTimeout(() => {
      setActiveAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
    }, 5000);
  };

  useEffect(() => {
    const interval = setInterval(addActiveAlert, 5000);
    return () => clearInterval(interval);
  }, [notifications]);

  useEffect(() => {
    const fetchMaintenanceTasks = async () => {
      try {
        const { data } = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getallTask`);

        if (data && data.length) {
          setMaintenanceTasks(data);
          setFilteredMaintenance(data);
        } else {
          console.log('No tasks found');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchMaintenanceTasks();
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  // Filter maintenance tasks based on search term
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/createTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Error creating maintenance task');
      }

      const data = await response.json();
      setMaintenanceTasks((prevData) => [data, ...prevData]);
      setNewTask({ task: '', date: '', description: '', priority: 3, status: 'pending' });
      alert('Maintenance task created successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating maintenance task:', error);
    }
  };


 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getallloc`);
        console.log("Fetched Locations:", response.data);
        setLocations(response.data);
      } catch (error) {
        setError("Error fetching locations");
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLocations();
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User Location:", position.coords);
        setUserLocation([position.coords.latitude, position.coords.longitude]); // ✅ Update state
      },
      (error) => console.error("Error fetching user location:", error),
      { enableHighAccuracy: true } // ✅ Improve accuracy
    );
  }, []);
  
  const fetchLocations = async () => {
    try {
      const response = await  axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getallloc`);

      console.log("Fetched Locations:", response.data);
      setLocations(response.data);
    } catch (error) {
      setError("Error fetching locations");
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitloc = async (e) => {
    e.preventDefault();
    
    // Ensure values are valid
    if (!name || !lat || !lng) {
      alert("Please fill all fields!");
      return;
    }
  
    // Convert input to correct format
    const formattedLat = parseFloat(lat);
    const formattedLng = parseFloat(lng);
  
    if (isNaN(formattedLat) || isNaN(formattedLng)) {
      alert("Invalid latitude or longitude values.");
      return;
    }
  
    try {
      const locationData = {
        name,
        coordinates: {
          type: "Point",
          coordinates: [formattedLng, formattedLat], // Longitude first, then Latitude
        },
      };
  
      console.log("Sending locationData:", locationData);
  
      const response = await axios.post(
        `https://${import.meta.env.VITE_BACKEND}/api/createloc`,
        locationData
      );
  
      alert(`Location added: ${response.data.name}`);
  
      // Clear input fields
      setName("");
      setLat("");
      setLng("");
  
      // Refresh location list
      fetchLocations();
  
    } catch (error) {
      console.error("Error adding location:", error.response?.data || error.message);
      alert("Failed to add location.");
    }
  };
  

  return (
    <div className={`${isDarkMode ? "dark" : "light"} min-h-screen transition-all`}>
  
    <ToastContainer />
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
          Dashboard
        </h1>
        <button
          onClick={toggleDarkMode}
          className={`px-6 py-2 rounded-full text-lg font-semibold transition-all transform hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Date Picker */}
      <div className="flex space-x-4">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className={`w-full max-w-xs border rounded-lg p-3 transition ${
            isDarkMode
              ? 'bg-gray-800 text-gray-300 border-gray-700'
              : 'bg-white text-gray-900 border-gray-300'
          }`}
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          className={`w-full max-w-xs border rounded-lg p-3 transition ${
            isDarkMode
              ? 'bg-gray-800 text-gray-300 border-gray-700'
              : 'bg-white text-gray-900 border-gray-300'
          }`}
        />
      </div>

       {/* Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Weekly Productivity',
            bg: 'from-teal-500 to-teal-600',
            chart: <Line data={lineChartData} />,
          },
          {
            title: 'Safety Compliance',
            bg: 'from-green-400 to-green-600',
            chart: <Pie data={pieChartData} />,
          },
          {
            title: 'Department Performance',
            bg: 'from-blue-500 to-blue-600',
            chart: <Bar data={barChartData} />,
          },
        ].map(({ title, bg, chart }, index) => (
          <motion.div
            key={index}
            className={`bg-gradient-to-r ${bg} p-6 rounded-xl shadow-xl hover:shadow-lg transition-all transform hover:scale-105`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-100 mb-3">{title}</h3>
            <div className="h-48">{chart}</div>
          </motion.div>
        ))}
      </div>


        {/* Alerts Section */}
      <motion.div
       className="bg-gray-800 p-6 rounded-xl shadow-lg text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
          <h2 className="font-bold text-lg mb-4 text-blue-400">⚠️ Alerts</h2>

        <ul className="space-y-4">
          {activeAlerts.map(alert => (
            <motion.li
              key={alert.id}
              className={`p-4 rounded-lg shadow-md ${
                alert.type === 'critical'
                  ? "bg-red-600 text-white"
            : "bg-yellow-500 text-gray-900"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {alert.message}
            </motion.li>
          ))}
        </ul>
      </motion.div>
        {/* Header & Add Location Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">🗺️ Mine Locations & Hazard Zones</h3>
        <button
          onClick={() => setIsMapModalOpen(true)}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
        >
          ➕ Add Location
        </button>
      </div>

      {/* Map Section */}
      <div className="h-[400px] lg:h-96 rounded-lg overflow-hidden border border-gray-600">
      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <MapContainer center={userLocation} zoom={10} key={userLocation.toString()} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User Location Marker */}
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>

          {/* Database Locations */}
          {locations.map((loc, index) => (
            <Marker key={index} position={[loc.coordinates.coordinates[1], loc.coordinates.coordinates[0]]}>
              <Popup className="text-gray-800 font-semibold">{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
      </div>

      {/* Modal for Adding Location */}
      {isMapModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white transform scale-105">
            <h2 className="text-xl font-semibold mb-4">➕ Add New Location</h2>
            <form onSubmit={handleSubmitloc} className="flex flex-col gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Location Name"
                className="p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitude"
                className="p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Longitude"
                className="p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button type="submit" className="w-full py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200">
                ✅ Add Location
              </button>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="w-full py-2 bg-gray-600 rounded-md hover:bg-gray-700 transition duration-200"
              >
                ❌ Cancel
              </button>
            </form>
          </div>
        </div>
      )}

{/* Maintenance Search */}
<div className="mt-8">
  <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
  <input
  type="text"
  placeholder="Search tasks"
  className="w-full max-w-md bg-gray-800 text-white border border-gray-600 rounded-lg p-3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

    <button
      onClick={() => {
        const fetchMaintenanceTasks = async () => {
          try {
            const { data } = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getallTask`);

            if (data && data.length) {
              setMaintenanceTasks(data);
              setFilteredMaintenance(data);
            } else {
              console.log('No tasks found');
            }
          } catch (error) {
            console.error('Error fetching tasks:', error);
          }
        };
        fetchMaintenanceTasks();
      }}
      className="ml-4 bg-blue-500 text-white rounded-lg py-2 px-6 shadow-md hover:bg-blue-600 transition duration-200 ease-in-out"
    >
      Get All Tasks
    </button>
    
  </div>
  {/* Button to Open Modal */}
<button
  onClick={() => setIsModalOpen(true)}
  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-3 px-8 shadow-lg hover:scale-105 transition-transform duration-300"
>
  + Create Task
</button>

{/* Modal */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-300">
    <div className="bg-gray-800/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-96 text-white">
      <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="task"
          value={newTask.task}
          onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
          placeholder="Task Name"
          required
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 transition-all"
        />
        
        <input
          type="date"
          name="date"
          value={newTask.date}
          onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
          required
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 transition-all"
        />
        
        <textarea
          name="description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          placeholder="Description"
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
        />
        
        <select
          name="priority"
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value={1}>Low Priority</option>
          <option value={2}>Medium Priority</option>
          <option value={3}>High Priority</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-3 shadow-lg hover:scale-105 transition-transform duration-300"
        >
          ✅ Create Task
        </button>
      </form>

      {/* Close Button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="block mx-auto mt-4 text-gray-400 hover:text-white transition"
      >
        ❌ Close
      </button>
    </div>
  </div>
)}

  {/* Task List */}
  <ul>
          {filteredMaintenance.map((task) => (
            <motion.li
              key={task._id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg mb-4  shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex flex-col">
                <h2 className="font-semibold text-lg">{task.task}</h2>
                <p className="text-gray-500 text-sm">Date: {new Date(task.date).toLocaleDateString()}</p>
                <p className="text-gray-700 text-sm">{task.description}</p>
              </div>
              <span className={`text-sm font-medium ${task.priority === 3 ? 'text-red-500' : task.priority === 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
              </span>
            </motion.li>
          ))}
</ul>

</div>



</div>
  <Chatbot/>
      </div>
   
  );
};

export default Dashboard;
