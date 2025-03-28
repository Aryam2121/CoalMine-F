import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  InputAdornment,
  Modal,
  Box,
  Typography,
  createTheme,
 
 
  ThemeProvider,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { CSVLink } from "react-csv";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
// Define Material-UI dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212", paper: "#1E1E1E" },
    text: { primary: "#fff" },
  },
});

const Inventory = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const inventoryRef = useRef(null);

  useEffect(() => {
    axios
      .get(`https://${import.meta.env.VITE_BACKEND}/api/getAllRes`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setResources(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching resources:", error));
  }, []);

  const filteredResources = resources?.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedResources = [...filteredResources].sort((a, b) => {
    const comparison =
      sortOrder === "asc" ? a.available - b.available : b.available - a.available;
    return comparison !== 0 ? comparison : a.name.localeCompare(b.name);
  });

  const totalQuantity = sortedResources.reduce((total, item) => total + item.available, 0);

  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleOpenModal = (resource) => {
    setSelectedResource(resource);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedResource(null);
  };

  const handleDeleteResource = (id) => {
    axios
      .delete(`https://${import.meta.env.VITE_BACKEND}/api/${id}`)
      .then(() => {
        setResources(resources.filter((resource) => resource.id !== id));
      })
      .catch((error) => console.error("Error deleting resource:", error));
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">📦 Inventory Management</h2>

        {/* Search Bar */}
        <Box className="mb-4 w-full">
  <Typography variant="subtitle1" sx={{ color: "white", mb: 1 }}>
    Search Resources
  </Typography>
  <TextField
    variant="outlined"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full transition-all duration-300"
    sx={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism effect
      backdropFilter: "blur(10px)",
      borderRadius: "10px",
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "rgba(255, 255, 255, 0.2)", // Soft border
        },
        "&:hover fieldset": {
          borderColor: "#4F46E5", // Glow effect on hover
        },
        "&.Mui-focused fieldset": {
          borderColor: "#4F46E5", // Focus effect
          boxShadow: "0px 0px 10px rgba(79, 70, 229, 0.5)", // Glow effect on focus
        },
      },
    }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{ color: "#A0AEC0" }} />
        </InputAdornment>
      ),
    }}
  />
</Box>;

        {/* Actions */}
        <div className="flex justify-between mb-4">
          <Tooltip title="Sort by Available Quantity" arrow>
            <Button onClick={handleSortToggle} variant="contained" startIcon={<SortIcon />}>
              Sort ({sortOrder === "asc" ? "Ascending" : "Descending"})
            </Button>
          </Tooltip>

          <CSVLink data={sortedResources} filename="inventory.csv">
            <Button variant="contained" color="secondary" startIcon={<DownloadIcon />}>
              Export CSV
            </Button>
          </CSVLink>
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedResources.map((item) => (
            <motion.div
              key={item.id}
              className="relative p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 bg-opacity-80 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Glow Effect */}
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full opacity-30 blur-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full opacity-30 blur-lg"></div>

              <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
              <p className="text-sm text-gray-400 mb-3">Available: {item.available}</p>
              
              {/* Enhanced Progress Bar */}
              <div className="w-full bg-gray-600 rounded-full h-3 relative">
                <motion.div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${item.available}%`,
                    background: `linear-gradient(to right, #10B981, #3B82F6)`,
                  }}
                  animate={{ width: `${item.available}%` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => handleOpenModal(item)}
                  variant="outlined"
                  size="small"
                  className="border-gray-400 text-gray-300 hover:border-white hover:text-white transition-all"
                >
                  View Details
                </Button>

                <IconButton onClick={() => handleDeleteResource(item._id)} className="hover:text-red-500 transition-all">
                  <DeleteIcon className="text-red-400" />
                </IconButton>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resource Detail Modal */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box className="bg-gray-800 p-6 rounded shadow-md w-96 mx-auto mt-24 text-white">
            <Typography variant="h6">{selectedResource?.name}</Typography>
            <Typography variant="body1">
              <strong>Available Quantity:</strong> {selectedResource?.available}
            </Typography>
            <Button onClick={handleCloseModal} variant="contained" color="primary" fullWidth className="mt-4">
              Close
            </Button>
          </Box>
        </Modal>
      </motion.div>
    </div>
  );
};

export default Inventory;