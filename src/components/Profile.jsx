import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiShield } from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState(null);
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="w-16 h-16 border-4 border-white border-dashed rounded-full animate-spin"></div>
      </div>
    );

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0].toUpperCase())
          .join("")
      : "";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white/10 backdrop-blur-lg dark:bg-gray-900/70 p-8 rounded-2xl shadow-2xl text-center border border-white/20"
      >
        {/* Profile Avatar */}
        <motion.div
          className="relative w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold uppercase mx-auto shadow-lg border-4 border-white dark:border-gray-700"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {getInitials(user?.name)}
        </motion.div>

        {/* User Name */}
        <h2 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white tracking-wide">
          {user?.name}
        </h2>

        {/* Email */}
        <p className="text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 mt-3 text-lg">
          <FiMail className="text-blue-400" /> {user?.email}
        </p>

        {/* Role Badge */}
        <motion.span
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          className="mt-3 inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition rounded-full shadow-md"
        >
          <FiShield className="text-white" /> {user?.role}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default Profile;