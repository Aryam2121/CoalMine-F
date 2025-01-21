import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import { motion } from "framer-motion";
import Modal from "react-modal";// Ensure react-modal is installed

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', role: 'Worker', email: '' });
  const [editUser, setEditUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleBulkAction = async () => {
    try {
      // Example: Bulk activation/deactivation
      await axios.post('/users/bulk-action', { action: bulkAction, userIds: users.map(user => user.id) });
      // Refresh users list
      const response = await axios.get('/users');
      setUsers(response.data);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const addUser = async () => {
    try {
      await axios.post('/users', newUser);
      setNewUser({ username: '', role: 'Worker', email: '' });
      // Refresh users list
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUser = async (id) => {
    try {
      await axios.put(`/users/${id}`, editUser);
      setEditUser(null);
      // Refresh users list
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`/users/${id}`);
      // Refresh users list
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setUserDetailModalOpen(true);
  };

  const closeUserDetailModal = () => {
    setUserDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <motion.div
      className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-3xl font-extrabold mb-6 text-gray-800 tracking-wide"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        User Management
      </motion.h2>

      <div className="mb-6">
        {/* Search Bar */}
        <motion.input
          type="text"
          placeholder="🔍 Search by username"
          className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm mb-4 focus:ring-2 focus:ring-blue-300 transition duration-300"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        
        {/* Add User Form */}
        {["Username", "Email"].map((placeholder, idx) => (
          <motion.input
            key={placeholder}
            type={placeholder === "Email" ? "email" : "text"}
            placeholder={placeholder}
            className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm mb-3 focus:ring-2 focus:ring-green-300 transition duration-300"
            initial={{ x: 50 * (idx + 1), opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
          />
        ))}
        <motion.select
          className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm mb-3 focus:ring-2 focus:ring-purple-300 transition duration-300"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <option value="Admin">Admin</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Worker">Worker</option>
        </motion.select>
        <motion.button
          onClick={() => {}}
          className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300"
        >
          + Add User
        </motion.button>
      </div>

      {/* Existing Users */}
      <motion.div className="mt-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-700">Existing Users</h3>
        <ul>
          {["John Doe", "Jane Smith"].map((user, idx) => (
            <motion.li
              key={user}
              className="mb-3 p-4 bg-white rounded-lg shadow-lg flex justify-between items-center hover:bg-gray-50 transition duration-300"
              initial={{ x: -50 * (idx + 1), opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            >
              <span className="font-medium">{user}</span>
              <div>
                <motion.button
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg mx-1 shadow-md hover:bg-blue-600 transition duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  View
                </motion.button>
                <motion.button
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg mx-1 shadow-md hover:bg-yellow-600 transition duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  Edit
                </motion.button>
                <motion.button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg mx-1 shadow-md hover:bg-red-600 transition duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Pagination */}
      <Pagination usersPerPage={5} totalUsers={20} currentPage={1} paginate={() => {}} />

      {/* User Details Modal */}
      <Modal isOpen={false} onRequestClose={() => {}}>
        <motion.div
          className="p-6 bg-white rounded-lg shadow-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">User Details</h3>
          {/* User Details Content */}
        </motion.div>
      </Modal>
    </motion.div>
  );
};

const Pagination = ({ usersPerPage, totalUsers, paginate, currentPage }) => {
  const pageNumbers = Array.from(
    { length: Math.ceil(totalUsers / usersPerPage) },
    (_, i) => i + 1
  );

  return (
    <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <ul className="flex justify-center space-x-2 mt-4">
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded-full border ${
                currentPage === number ? "bg-blue-500 text-white" : "bg-white text-blue-500"
              } shadow-md hover:shadow-lg hover:bg-blue-100 transition duration-300`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
};

export default UserManagement;