import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

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
    { id: 1, name: "Slip Hazard", completed: false, timestamp: null },
    { id: 2, name: "Fire Risk", completed: false, timestamp: null },
    { id: 3, name: "Electrical Risk", completed: false, timestamp: null },
  ]);
  const [userLocation, setUserLocation] = useState(null);
  const [gpsHistory, setGpsHistory] = useState([]);
  const [signature, setSignature] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [user, setUser] = useState(null);
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetchedLocation = useRef(false);
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  useEffect(() => {
    if (!hasFetchedLocation.current) {
      hasFetchedLocation.current = true;
      setIsLoadingLocation(true);
      getUserLocation()
        .then((position) => {
          setUserLocation(position.coords);
          setGpsHistory((prevHistory) => [...prevHistory, position.coords]);
          setIsLoadingLocation(false);
        })
        .catch((error) => {
          console.error("Error fetching location:", error);
          setIsLoadingLocation(false);
        });
    }

    const userData = authenticateUser();
    setUser(userData);
  }, []);

  const completionProgress =
    (hazards.filter((hazard) => hazard.completed).length / hazards.length) *
    100;

  const toggleTaskCompletion = (id) => {
    const currentTime = new Date().toISOString();
    setHazards((hazards) =>
      hazards.map((hazard) =>
        hazard.id === id
          ? { ...hazard, completed: !hazard.completed, timestamp: currentTime }
          : hazard
      )
    );
  };

  const clearSignature = () => setSignature("");

  const handleSubmit = () => {
    if (hazards.every((hazard) => hazard.completed) && signature) {
      const formData = {
        userId: user.id,
        tasks: hazards.map((hazard) => ({
          taskName: hazard.name,
          completed: hazard.completed,
          timestamp: hazard.timestamp,
        })),
        gpsHistory,
        signature,
      };

      axios
        .post(`https://${import.meta.env.VITE_BACKEND}/api/safety-check`, formData)
        .then(() => setIsModalOpen(true))
        .catch((error) =>
          console.error("Error submitting safety check", error)
        );
    }
  };

  return (
    <div className="p-20 bg-gray-900 shadow-xl rounded-lg  border">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        Safety Protocol Checklist
      </h2>

      {user && (
        <div className="text-center mb-6">
          <p className="font-medium text-blue-400">Signed in as: {user?.name}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="my-4">
        <p className="font-semibold text-white">
          Completion Progress: {Math.round(completionProgress)}%
        </p>
        <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
          <div
            style={{ width: `${completionProgress}%` }}
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Hazard checklist */}
<div className="space-y-4 mb-6">
  {hazards.map((hazard) => (
    <div
      key={hazard.id}
      className={`flex items-center p-4 rounded-lg shadow-md transition-all duration-300 ${
        hazard.completed
          ? "bg-green-100 border-l-4 border-green-500"
          : "bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-300"
      }`}
    >
      <input
        type="checkbox"
        checked={hazard.completed}
        onChange={() => toggleTaskCompletion(hazard.id)}
        className="w-6 h-6 text-blue-600 focus:ring-2 focus:ring-blue-500 accent-blue-600 cursor-pointer"
      />
      <label
        className={`ml-4 font-medium text-gray-800 text-lg ${
          hazard.completed ? "line-through text-gray-500" : ""
        }`}
      >
        {hazard.name}
      </label>
      {hazard.timestamp && (
        <span className="text-xs text-gray-600 ml-auto italic">
          {new Date(hazard.timestamp).toLocaleString()}
        </span>
      )}
    </div>
  ))}
</div>


    {/* Signature Section */}
<div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
  <label className="block text-lg font-semibold text-gray-800 mb-2">
    Sign Off:
  </label>
  <input
    type="text"
    value={user?.name || signature}
    onChange={(e) => setSignature(e.target.value)}
    placeholder="Enter your name"
    className="w-full p-3 border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <button
    onClick={clearSignature}
    className="mt-2 text-sm text-red-600 font-medium hover:text-red-700 transition"
  >
    Clear Signature
  </button>
</div>

{/* GPS Tracking Section */}
<div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
  {isLoadingLocation ? (
    <p className="text-sm text-gray-500 flex items-center">
      <svg
        className="animate-spin h-4 w-4 text-blue-600 mr-2"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      Fetching GPS location...
    </p>
  ) : userLocation ? (
    <div>
      <p className="text-lg font-semibold text-gray-800">GPS Location:</p>
      <p className="text-gray-600">
        <span className="font-medium">Latitude:</span> {userLocation.latitude}
      </p>
      <p className="text-gray-600">
        <span className="font-medium">Longitude:</span> {userLocation.longitude}
      </p>

      <p className="text-sm text-gray-500 mt-2 font-semibold">Location History:</p>
      <div className="max-h-32 overflow-y-auto mt-2 bg-gray-100 p-2 rounded-md shadow-inner">
        {gpsHistory.map((loc, index) => (
          <p key={index} className="text-xs text-gray-600">
            Lat: {loc.latitude} | Long: {loc.longitude}
          </p>
        ))}
      </div>
    </div>
  ) : (
    <p className="text-red-500 font-medium">Location not available.</p>
  )}
</div>


      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="mt-6 px-6 py-3 w-full bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
        disabled={!hazards.every((hazard) => hazard.completed) || !signature}
      >
        Submit Safety Check
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              Safety Checklist Submitted
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Your safety checklist has been successfully submitted.
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
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
