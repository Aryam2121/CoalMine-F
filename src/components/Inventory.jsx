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
      .get(`https://${import.meta.env.VITE_BACKEND}/api/getRes`)
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
      .delete(`/api/${id}`)
      .then(() => {
        setResources(resources.filter((resource) => resource.id !== id));
      })
      .catch((error) => console.error("Error deleting resource:", error));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <motion.div
        className="p-6 bg-gray-900 text-white rounded shadow-md dark:bg-gray-900 dark:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>

        {/* Search Bar */}
        <TextField
          label="Search Resources"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
          fullWidth
          InputProps={{
            startAdornment: <InputAdornment position="start">🔍</InputAdornment>,
          }}
        />

        {/* Sort & Export Buttons */}
        <div className="mb-4 flex space-x-4">
          <Tooltip title="Sort by Available Quantity" arrow>
            <Button
              onClick={handleSortToggle}
              variant="contained"
              color="primary"
              startIcon={<SortIcon />}
              fullWidth
            >
              Sort ({sortOrder === "asc" ? "Ascending" : "Descending"})
            </Button>
          </Tooltip>

          {/* CSV Export */}
          <CSVLink data={sortedResources} filename="inventory.csv" className="w-full">
            <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} fullWidth>
              Export CSV
            </Button>
          </CSVLink>
        </div>

        {/* Inventory Table */}
        <div ref={inventoryRef}>
          <TableContainer component={Paper} className="mb-4 bg-gray-800 dark:bg-gray-800">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-700 dark:bg-gray-700">
                  <TableCell className="text-white">Resource</TableCell>
                  <TableCell className="text-white" align="right">
                    Available Quantity
                  </TableCell>
                  <TableCell className="text-white" align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResources.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((item) => (
                  <TableRow key={item.id || item.name} className="hover:bg-gray-700">
                    <TableCell className="text-white">{item.name}</TableCell>
                    <TableCell className="text-white" align="right">
                      {item.available}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleDeleteResource(item.id)}>
                        <DeleteIcon className="text-red-500" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Pagination count={Math.ceil(sortedResources.length / rowsPerPage)} page={currentPage} onChange={handleChangePage} color="primary" />
          <div>
            <label htmlFor="rows-per-page" className="mr-2">
              Rows per page:
            </label>
            <select id="rows-per-page" value={rowsPerPage} onChange={handleRowsPerPageChange} className="border rounded p-2 bg-gray-800 text-white">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {/* Total Quantity */}
        <div className="mt-4">
          <strong>Total Quantity:</strong> {totalQuantity}
        </div>

        {/* Resource Detail Modal */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box className="bg-gray-800 p-6 rounded shadow-md w-96 mx-auto mt-24 text-white">
            <Typography variant="h6">{selectedResource?.name}</Typography>
            <Typography variant="body1">
              <strong>Available Quantity:</strong> {selectedResource?.available}
            </Typography>
            <Button onClick={handleCloseModal} variant="contained" color="primary" className="mt-4" fullWidth>
              Close
            </Button>
          </Box>
        </Modal>
      </motion.div>
    </div>
  );
};

export default Inventory;
