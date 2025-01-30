import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Mock function for GPS tracking
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const authenticateUser = () => {
  return { id: 1, name: "John Doe" };
};

const SafetyProtocol = () => {
  const [hazards, setHazards] = useState([
    { id: 1, name: 'Slip Hazard', completed: false, timestamp: null },
    { id: 2, name: 'Fire Risk', completed: false, timestamp: null },
    { id: 3, name: 'Electrical Risk', completed: false, timestamp: null },
  ]);
  const [userLocation, setUserLocation] = useState(null);
  const [gpsHistory, setGpsHistory] = useState([]);
  const [signature, setSignature] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [user, setUser] = useState(null);

  // Prevent multiple fetches
  const hasFetchedLocation = useRef(false);

  // Fetch GPS location only once
  useEffect(() => {
    if (!hasFetchedLocation.current) {
      hasFetchedLocation.current = true;
      setIsLoadingLocation(true);
      getUserLocation()
        .then((position) => {
          setUserLocation(position.coords);
          setGpsHistory(prevHistory => [...prevHistory, position.coords]); // Record location history
          setIsLoadingLocation(false);
        })
        .catch((error) => {
          console.error('Error fetching location:', error);
          setIsLoadingLocation(false);
        });
    }

    const userData = authenticateUser();
    setUser(userData);
  }, []);

  // Calculate progress
  const completionProgress = (hazards.filter(hazard => hazard.completed).length / hazards.length) * 100;

  const toggleTaskCompletion = (id) => {
    const currentTime = new Date().toISOString();
    setHazards(hazards.map(hazard =>
      hazard.id === id ? { ...hazard, completed: !hazard.completed, timestamp: currentTime } : hazard
    ));
  };

  const clearSignature = () => setSignature('');

  const handleSubmit = () => {
    if (hazards.every(hazard => hazard.completed) && signature) {
      const formData = {
        userId: user.id,
        tasks: hazards.map(hazard => ({
          taskName: hazard.name,
          completed: hazard.completed,
          timestamp: hazard.timestamp,
        })),
        gpsHistory,
        signature,
      };

      axios.post('http://localhost:5000/api/safety-check', formData)
        .then(() => setIsModalOpen(true))
        .catch((error) => console.error("Error submitting safety check", error));
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Safety Protocol Checklist</h2>

      {user && (
        <div className="text-center mb-6">
          <p className="font-medium">Signed in as: {user.name}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="my-4">
        <p className="font-semibold">Completion Progress: {Math.round(completionProgress)}%</p>
        <div className="w-full bg-gray-200 rounded-full">
        <div
  style={{ width: `${completionProgress}%` }}
  className="bg-blue-600 text-xs font-semibold text-center p-1 leading-none text-white rounded-full"
>
  {Math.round(completionProgress)}%
</div>

        </div>
      </div>

      {/* Hazard checklist */}
      <div className="space-y-4 mb-6">
        {hazards.map((hazard) => (
          <div key={hazard.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={hazard.completed}
              onChange={() => toggleTaskCompletion(hazard.id)}
              className="w-5 h-5 text-blue-600"
            />
            <label className={hazard.completed ? 'line-through text-gray-500' : ''}>
              {hazard.name}
            </label>
            {hazard.timestamp && (
              <span className="text-xs text-gray-400">Completed at: {new Date(hazard.timestamp).toLocaleString()}</span>
            )}
          </div>
        ))}
      </div>

      {/* Signature */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Sign off:</label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={clearSignature}
          className="mt-2 text-xs text-red-500 hover:text-red-700"
        >
          Clear Signature
        </button>
      </div>

      {/* GPS Tracking */}
      <div className="mt-6">
        {isLoadingLocation ? (
          <p className="text-sm text-gray-500">Fetching GPS location...</p>
        ) : userLocation ? (
          <div>
            <p className="font-semibold">GPS Location:</p>
            <p>Latitude: {userLocation.latitude}</p>
            <p>Longitude: {userLocation.longitude}</p>
            <p className="text-sm text-gray-500">Location History:</p>
            {gpsHistory.map((loc, index) => (
              <div key={index} className="text-xs text-gray-400">
                <p>Latitude: {loc.latitude} | Longitude: {loc.longitude}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-500">Location not available.</p>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="mt-6 px-6 py-3 w-full bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!hazards.every(hazard => hazard.completed) || !signature}
      >
        Submit Safety Check
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-semibold mb-4">Safety Checklist Submitted</h3>
            <p className="text-sm mb-4">Your safety checklist has been successfully submitted. Thank you for ensuring safety protocols.</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyProtocol;