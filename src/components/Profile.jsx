import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaIdBadge, FaUserShield } from "react-icons/fa";

const Profile = () => {
  const { user } = useContext(AuthContext); // User details from context

  if (!user) {
    return <div className="text-center text-xl mt-10">Loading....</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white bg-opacity-10 backdrop-blur-md shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-500"
      >
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <img
            src={user.profileImage || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-blue-400 shadow-lg transform hover:scale-110 transition"
          />
          <h2 className="mt-4 text-2xl font-semibold text-white">{user.name || "Guest User"}</h2>
          <p className="text-gray-300">@{user.username || "username"}</p>
          <p className="text-gray-400 text-sm mt-1">{user.email || "example@example.com"}</p>
        </div>

        {/* Profile Details */}
        <div className="mt-6 space-y-4">
          <ProfileDetail icon={<FaIdBadge />} label="User ID" value={user.id || "N/A"} />
          <ProfileDetail icon={<FaUser />} label="Full Name" value={user.name || "N/A"} />
          <ProfileDetail icon={<FaEnvelope />} label="Email" value={user.email || "N/A"} />
          <ProfileDetail icon={<FaUserShield />} label="Role" value={user.role || "User"} />
        </div>

        {/* Edit Profile Button */}
        <div className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
          >
            Edit Profile
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// Profile Detail Row Component
const ProfileDetail = ({ icon, label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-600 pb-2">
    <div className="flex items-center space-x-2 text-gray-300">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <span className="text-white">{value}</span>
  </div>
);

export default Profile;
