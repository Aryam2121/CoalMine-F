import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';  // Import axios
import { Button, TextField, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Pagination, InputAdornment, Modal, Box, Typography } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import DownloadIcon from '@mui/icons-material/Download';
import { CSVLink } from "react-csv";
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';

const Inventory = () => {
  const [resources, setResources] = useState([]);  // Store resources data
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const inventoryRef = useRef(null); // Reference to the inventory table

  // Fetch resources data from the backend
  useEffect(() => {
    axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getRes`)
      .then((response) => {
        // Make sure response.data is an array
        if (Array.isArray(response.data)) {
          setResources(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching resources:', error);
      });
  }, []);
  
  const filteredResources = resources?.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedResources = [...filteredResources].sort((a, b) => {
    const comparison = sortOrder === 'asc' ? a.available - b.available : b.available - a.available;
    return comparison !== 0 ? comparison : a.name.localeCompare(b.name);
  });

  const totalQuantity = sortedResources.reduce((total, item) => total + item.available, 0);

  const handleSortToggle = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleConvertToImage = () => {
    html2canvas(inventoryRef.current).then(canvas => {
      const link = document.createElement('a');
      link.download = 'inventory.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page when rows per page is changed
  };

  const displayedResources = sortedResources.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleOpenModal = (resource) => {
    setSelectedResource(resource);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedResource(null);
  };

  // Handle deleting a resource
  const handleDeleteResource = (id) => {
    axios.delete(`/api/${id}`)
      .then(() => {
        setResources(resources.filter(resource => resource.id !== id));  // Update local state
      })
      .catch(error => {
        console.error('Error deleting resource:', error);
      });
  };

  return (
    <motion.div
      className="p-6 bg-white rounded shadow-md"
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

      {/* Sort and Convert Buttons */}
      <div className="mb-4 flex space-x-4">
        <Tooltip title={`Sort by Available Quantity (${sortOrder === 'asc' ? 'Ascending' : 'Descending'})`} arrow>
          <Button
            onClick={handleSortToggle}
            variant="contained"
            color="primary"
            startIcon={<SortIcon />}
            fullWidth
          >
            Sort by Quantity ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
          </Button>
        </Tooltip>

        <Tooltip title="Convert Inventory to Image" arrow>
          <Button
            onClick={handleConvertToImage}
            variant="contained"
            color="success"
            fullWidth
          >
            Convert to Image
          </Button>
        </Tooltip>

        {/* CSV Export Button */}
        <CSVLink
          data={sortedResources}
          filename="inventory.csv"
          className="w-full"
        >
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            fullWidth
          >
            Export to CSV
          </Button>
        </CSVLink>
      </div>

      {/* Inventory Table */}
      <div ref={inventoryRef}>
        <TableContainer component={Paper} className="mb-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Resource</TableCell>
                <TableCell align="right">Available Quantity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {displayedResources.map((item) => (
    <TableRow key={item.id || item.name}> {/* Ensure unique key */}
      <TableCell>{item.name}</TableCell>
      <TableCell align="right">{item.available}</TableCell>
      <TableCell align="right">
        <IconButton onClick={() => handleDeleteResource(item.id)}>
          <DeleteIcon />
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
        <Pagination
          count={Math.ceil(sortedResources.length / rowsPerPage)}
          page={currentPage}
          onChange={handleChangePage}
          color="primary"
        />
        <div>
          <label htmlFor="rows-per-page" className="mr-2">Rows per page:</label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border rounded p-2"
          >
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
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="resource-detail-modal"
        aria-describedby="resource-detail-modal-description"
      >
        <Box className="bg-white p-6 rounded shadow-md w-96 mx-auto mt-24">
          <Typography variant="h6" id="resource-detail-modal" className="font-bold mb-2">
            {selectedResource?.name}
          </Typography>
          <Typography variant="body1" id="resource-detail-modal-description">
            <strong>Available Quantity:</strong> {selectedResource?.available}
          </Typography>
          <Typography variant="body1" className="mt-2">
            {/* Add any other resource details here */}
            <strong>Description:</strong> {selectedResource?.description || 'No description available'}
          </Typography>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            color="primary"
            className="mt-4"
            fullWidth
          >
            Close
          </Button>
        </Box>
      </Modal>
    </motion.div>
  );
};

export default Inventory;
