import React, { useEffect, useState } from "react";
import axios from "../services/axios";
import { motion } from "framer-motion";
import { FaUserEdit, FaTrashAlt, FaEye, FaPlus, FaMoon, FaSun, FaTimes } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", role: "Worker", email: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default Dark Mode

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getworkers`);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };
    fetchWorkers();
  }, []);

  const handleAddOrUpdateWorker = async () => {
    try {
      if (isEditMode) {
        const response = await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/addworkers/${selectedUser._id}`, newUser);
        setUsers(users.map((user) => (user._id === selectedUser._id ? response.data : user)));
      } else {
        const response = await axios.post("/api/workers", newUser);
        setUsers([...users, response.data]);
      }
      setNewUser({ username: "", role: "Worker", email: "" });
      setIsEditMode(false);
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving worker:", error);
    }
  };

  const handleDeleteWorker = async (id) => {
    try {
      await axios.delete(`https://${import.meta.env.VITE_BACKEND}/api/workers/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting worker:", error);
    }
  };

  const handleEditUser = (user) => {
    setNewUser(user);
    setSelectedUser(user);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <motion.div
      className={`p-6 py-12 rounded-xl shadow-lg min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight">User Management</h2>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full shadow-lg flex items-center gap-2 text-lg transition-all 
            bg-gray-700 text-white hover:bg-gray-600 dark:bg-gray-200 dark:text-black"
        >
          {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search by username"
          className="flex-1 p-3 border rounded-lg shadow-md focus:ring-2 focus:ring-blue-400 transition outline-none bg-gray-800 text-white"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 shadow-md hover:bg-green-600 transition"
          onClick={() => {
            setNewUser({ username: "", role: "Worker", email: "" });
            setIsEditMode(false);
            setModalOpen(true);
          }}
        >
          <FaPlus /> Add User
        </button>
      </div>

      <table className="w-full mt-4 border-collapse rounded-lg shadow-lg overflow-hidden">
        <thead>
          <tr className="bg-blue-500 text-white text-left">
            <th className="p-3">Username</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={user._id} className={`border-b ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}`}>
              <td className="p-3">{user.username}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3 flex space-x-3">
                <button className="text-blue-400 hover:text-blue-600" onClick={() => setSelectedUser(user)}>
                  <FaEye size={18} />
                </button>
                <button className="text-yellow-400 hover:text-yellow-600" onClick={() => handleEditUser(user)}>
                  <FaUserEdit size={18} />
                </button>
                <button className="text-red-400 hover:text-red-600" onClick={() => handleDeleteWorker(user._id)}>
                  <FaTrashAlt size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL - Centered with Dark Mode */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
          <motion.div
            className="p-6 bg-gray-900 text-white rounded-lg shadow-xl w-96"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{isEditMode ? "Edit User" : "Add User"}</h3>
              <button className="text-red-400 hover:text-red-600" onClick={() => setModalOpen(false)}>
                <FaTimes size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="w-full p-2 border bg-gray-800 text-white mb-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full p-2 border bg-gray-800 text-white mb-2 rounded"
            />
            <button
              onClick={handleAddOrUpdateWorker}
              className="mt-4 px-4 py-2 w-full bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              {isEditMode ? "Update" : "Add"} User
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement;
