import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FiUser, FiMail, FiLock, FiSun, FiMoon } from "react-icons/fi";

const Settings = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ ...res.data, password: "" });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/users/${user._id}`, user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating profile");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className=" p-8 bg-white/10 backdrop-blur-lg dark:bg-gray-900 text-white rounded-2xl shadow-xl border border-white/20 min-h-screen"
    >
      <h2 className="text-3xl font-bold text-center mb-6 text-white">
        Profile Settings
      </h2>

      <div className="space-y-5">
        {/* Name Input */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Name</label>
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FiUser className="text-blue-400 mr-2" />
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full bg-transparent text-white outline-none"
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Email</label>
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FiMail className="text-blue-400 mr-2" />
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full bg-transparent text-white outline-none"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FiLock className="text-blue-400 mr-2" />
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full bg-transparent text-white outline-none"
            />
          </div>
        </div>

        {/* Theme Selector */}
        <div>
          <label className="block text-sm font-medium mb-1">Theme</label>
          <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            {theme === "light" ? (
              <FiSun className="text-yellow-400" />
            ) : (
              <FiMoon className="text-blue-400" />
            )}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="light" className="text-black">
                Light
              </option>
              <option value="dark" className="text-black">
                Dark
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition px-5 py-2 text-white font-semibold rounded-lg shadow-md"
        >
          Save Changes
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-700 hover:bg-gray-800 transition px-5 py-2 text-white font-semibold rounded-lg shadow-md"
        >
          Cancel
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Settings;