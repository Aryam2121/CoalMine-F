import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Clock, MapPin, Users, Activity } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const EmergencyResponsePanel = ({ mineId }) => {
  const [emergencies, setEmergencies] = useState([]);
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [showSOSForm, setShowSOSForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const [sosForm, setSosForm] = useState({
    emergencyType: 'fire',
    severity: 'critical',
    description: '',
    location: {
      area: '',
      level: '',
      latitude: '',
      longitude: ''
    }
  });

  useEffect(() => {
    fetchActiveEmergencies();
    fetchEmergencies();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchActiveEmergencies, 10000);
    return () => clearInterval(interval);
  }, [mineId]);

  const fetchActiveEmergencies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/emergencies/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveEmergencies(response.data.emergencies);
    } catch (error) {
      console.error('Error fetching active emergencies:', error);
    }
  };

  const fetchEmergencies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/emergencies?mineId=${mineId}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmergencies(response.data.emergencies);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    }
  };

  const handleSOSSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/emergency`, {
        mineId,
        ...sosForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('🚨 Emergency response initiated!');
      setShowSOSForm(false);
      setSosForm({
        emergencyType: 'fire',
        severity: 'critical',
        description: '',
        location: { area: '', level: '', latitude: '', longitude: '' }
      });
      fetchActiveEmergencies();
      fetchEmergencies();
    } catch (error) {
      console.error('Error creating emergency:', error);
      toast.error('Failed to create emergency');
    } finally {
      setLoading(false);
    }
  };

  const updateEmergencyStatus = async (emergencyId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/emergency/${emergencyId}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Emergency status updated');
      fetchActiveEmergencies();
      fetchEmergencies();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'catastrophic': return 'bg-red-900 text-white';
      case 'critical': return 'bg-red-600 text-white';
      case 'major': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      case 'minor': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'responding': return 'text-orange-600 bg-orange-100';
      case 'contained': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'false_alarm': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🚨 Emergency Response Center
          {activeEmergencies.length > 0 && (
            <span className="animate-pulse text-red-600">
              ({activeEmergencies.length} Active)
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowSOSForm(!showSOSForm)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2 animate-pulse"
        >
          <AlertCircle size={20} />
          SOS - EMERGENCY ALERT
        </button>
      </div>

      {/* Active Emergency Alert Banner */}
      {activeEmergencies.length > 0 && (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg border-4 border-red-700 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertCircle size={32} className="flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold">ACTIVE EMERGENCY IN PROGRESS</h3>
              <p className="text-sm opacity-90">
                {activeEmergencies.length} emergency situation(s) require immediate attention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SOS Form */}
      {showSOSForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-red-500">
          <h3 className="text-xl font-bold mb-4 text-red-600">Report Emergency</h3>
          <form onSubmit={handleSOSSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Emergency Type*</label>
                <select
                  value={sosForm.emergencyType}
                  onChange={(e) => setSosForm({ ...sosForm, emergencyType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="fire">Fire</option>
                  <option value="explosion">Explosion</option>
                  <option value="gas_leak">Gas Leak</option>
                  <option value="collapse">Structural Collapse</option>
                  <option value="flooding">Flooding</option>
                  <option value="equipment_failure">Equipment Failure</option>
                  <option value="injury">Injury</option>
                  <option value="entrapment">Personnel Entrapment</option>
                  <option value="power_failure">Power Failure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Severity*</label>
                <select
                  value={sosForm.severity}
                  onChange={(e) => setSosForm({ ...sosForm, severity: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="catastrophic">Catastrophic</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="moderate">Moderate</option>
                  <option value="minor">Minor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Area</label>
                <input
                  type="text"
                  value={sosForm.location.area}
                  onChange={(e) => setSosForm({ 
                    ...sosForm, 
                    location: { ...sosForm.location, area: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Section A, Level 3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Level/Floor</label>
                <input
                  type="text"
                  value={sosForm.location.level}
                  onChange={(e) => setSosForm({ 
                    ...sosForm, 
                    location: { ...sosForm.location, level: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Underground Level 2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description*</label>
              <textarea
                value={sosForm.description}
                onChange={(e) => setSosForm({ ...sosForm, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows="4"
                placeholder="Provide detailed information about the emergency..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'SEND SOS ALERT'}
              </button>
              <button
                type="button"
                onClick={() => setShowSOSForm(false)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Emergencies */}
      {activeEmergencies.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="text-red-600" />
            Active Emergencies
          </h3>
          <div className="space-y-4">
            {activeEmergencies.map((emergency) => (
              <div key={emergency._id} className="border-l-4 border-red-600 bg-red-50 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(emergency.severity)}`}>
                        {emergency.severity.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(emergency.status)}`}>
                        {emergency.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg capitalize">
                      {emergency.emergencyType.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-700 mt-1">{emergency.description}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(emergency.createdAt).toLocaleString()}
                    </p>
                    {emergency.location?.area && (
                      <p className="flex items-center gap-1 mt-1">
                        <MapPin size={14} />
                        {emergency.location.area}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => updateEmergencyStatus(emergency._id, 'responding')}
                    className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                  >
                    Mark Responding
                  </button>
                  <button
                    onClick={() => updateEmergencyStatus(emergency._id, 'contained')}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    Mark Contained
                  </button>
                  <button
                    onClick={() => updateEmergencyStatus(emergency._id, 'resolved')}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => setSelectedEmergency(emergency)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Emergencies */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Recent Emergency History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Severity</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {emergencies.map((emergency) => (
                <tr key={emergency._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-sm">{emergency.emergencyId}</td>
                  <td className="px-4 py-2 capitalize">{emergency.emergencyType.replace('_', ' ')}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityColor(emergency.severity)}`}>
                      {emergency.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(emergency.status)}`}>
                      {emergency.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{new Date(emergency.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedEmergency(emergency)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponsePanel;
