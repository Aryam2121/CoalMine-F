import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AiOutlineWarning, AiOutlineExclamationCircle } from 'react-icons/ai';
import { FiCheckCircle } from 'react-icons/fi';
import { MdDeleteForever } from 'react-icons/md';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('warning');
    const [createdBy, setCreatedBy] = useState('60d5f84f5b5f5c4d7b8f5d1b');
    const [resolved, setResolved] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/alerts/getallalerts`, {
                    params: {
                        type,
                        resolved,
                        page,
                        limit: 10,
                        sort: '-timestamp',
                    }
                });
                setAlerts(res.data.alerts);
                setTotalPages(res.data.totalPages);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setToast({ type: 'error', message: 'Failed to fetch alerts. Please try again later.' });
                console.error('Error fetching alerts:', error);
            }
        };
        fetchAlerts();
    }, [type, resolved, page]);

    const handleAddAlert = async () => {
        try {
            const newAlert = { message, type, createdBy };
            const res = await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/alerts/addAlert`, newAlert);
            setAlerts([res.data, ...alerts]);
            setMessage('');
            setType('warning');
            setShowModal(false);
            setToast({ type: 'success', message: 'Alert added successfully!' });
        } catch (error) {
            setToast({ type: 'error', message: 'Error adding alert. Please try again.' });
            console.error('Error adding alert:', error);
        }
    };

    const handleResolveAlert = async (Id, resolvedBy) => {
        try {
            const response = await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/alerts/resolveAlert/${Id}`, { resolvedBy });
            console.log('Alert resolved:', response.data);
            setAlerts(alerts.map(alert => alert._id === Id ? { ...alert, resolved: true } : alert));
        } catch (error) {
            console.error('Error resolving alert:', error);
            setToast({ type: 'error', message: 'Failed to resolve alert. Please try again.' });
        }
    };

    const handleDeleteAlert = async (id) => {
        try {
            await axios.delete(`https://${import.meta.env.VITE_BACKEND}/api/alerts/deleteAlert/${id}`);
            setAlerts(alerts.filter(alert => alert._id !== id));
            setToast({ type: 'success', message: 'Alert deleted successfully!' });
        } catch (error) {
            setToast({ type: 'error', message: 'Error deleting alert. Please try again.' });
            console.error('Error deleting alert:', error);
        }
    };

    const handleMarkAllResolved = async () => {
        try {
            await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/alerts/resolveAllAlerts`);
            setAlerts(alerts.map(alert => ({ ...alert, resolved: true })));
            setToast({ type: 'success', message: 'All alerts resolved successfully!' });
        } catch (error) {
            setToast({ type: 'error', message: 'Error resolving all alerts.' });
            console.error('Error resolving all alerts:', error);
        }
    };

    return (
        <div className="w-full min-h-screen px-10 py-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-200">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 px-4 py-3 rounded-md text-white shadow-lg transition-all duration-300 transform ${
                        toast.type === "success" ? "bg-green-600 scale-100" : "bg-red-600 scale-105"
                    }`}
                >
                    {toast.message}
                </div>
            )}
      <h2 className="text-4xl font-extrabold  text-left text-teal-400">Real-time Safety Alerts</h2>
            {/* Buttons in the upper-right corner */}
            <div className="flex justify-end space-x-4 mt-4">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg hover:scale-105 transform transition duration-200"
                >
                    Add New Alert
                </button>
                <button
                    onClick={handleMarkAllResolved}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-lg hover:scale-105 transform transition duration-200"
                >
                    Mark All as Resolved
                </button>
            </div>
    
          
    
            {/* Add New Alert Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-96 text-gray-200 animate-scale">
                        <h3 className="text-2xl font-semibold mb-6 text-center">Add New Alert</h3>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter alert message"
                            className="border p-3 mb-4 w-full rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="border p-3 mb-4 w-full rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="warning">Warning</option>
                            <option value="critical">Critical</option>
                        </select>
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleAddAlert}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:scale-105 transform transition duration-200"
                            >
                                Add Alert
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:scale-105 transform transition duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
    
           {/* Alert List */}
{loading ? (
    <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
    </div>
) : (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {alerts.map((alert) => (
            <li
                key={alert._id}
                className={`relative p-6 bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.07] hover:shadow-2xl ${
                    alert.resolved ? "opacity-70" : "opacity-100"
                }`}
            >
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl ${
                    alert.type === 'critical' ? 'bg-red-500' : 'bg-yellow-400'
                }"></div>

                <div className="flex items-start space-x-4 mb-6">
                    <div
                        className={`text-5xl flex-shrink-0 ${
                            alert.type === "critical" ? "text-red-500" : "text-yellow-400"
                        }`}
                    >
                        {alert.type === "critical" ? (
                            <AiOutlineExclamationCircle />
                        ) : (
                            <AiOutlineWarning />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-2xl font-bold tracking-wide">{alert.type.toUpperCase()}</p>
                        <p className="mt-2 text-gray-300 text-lg">{alert.message}</p>
                        <p className="text-sm text-gray-400 mt-3">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-400">Created By: <span className="text-gray-200 font-medium">{alert.createdBy}</span></p>
                        {alert.resolved && (
                            <p className="text-sm text-green-400 mt-2">
                                Resolved at: {new Date(alert.resolvedAt).toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-4">
                    {!alert.resolved && (
                        <button
                            onClick={() => handleResolveAlert(alert._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:scale-110 transform transition duration-200 flex items-center space-x-2"
                        >
                            <FiCheckCircle className="text-lg" />
                            <span>Resolve</span>
                        </button>
                    )}
                    <button
                        onClick={() => handleDeleteAlert(alert._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:scale-110 transform transition duration-200 flex items-center space-x-2"
                    >
                        <MdDeleteForever className="text-lg" />
                        <span>Delete</span>
                    </button>
                </div>
            </li>
        ))}
    </ul>
)}

    </div>
);
    
    
};

export default Alerts;