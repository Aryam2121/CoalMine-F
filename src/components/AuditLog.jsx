// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Container,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TextField,
//   Button,
//   TableSortLabel,
//   IconButton,
//   Grid,
//   Pagination,
//   Chip,
//   Collapse,
//   Tooltip,
//   Box,
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
// } from "@mui/icons-material";
// import { motion } from "framer-motion";

// const AuditLog = () => {
//   const [logs, setLogs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortDirection, setSortDirection] = useState('asc');
//   const [page, setPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [newLog, setNewLog] = useState({ user: '', action: '', details: '' });

//   useEffect(() => {
//     fetchAuditLogs();
//   }, []);

//   const fetchAuditLogs = async () => {
//     try {
//       const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getAudit`);
//       setLogs(response.data);
//     } catch (error) {
//       console.error('Error fetching audit logs:', error);
//     }
//   };

//   const handleCreateLog = async () => {
//     try {
//       await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/addAudit`, newLog);
//       setNewLog({ user: '', action: '', details: '' });
//       fetchAuditLogs();
//     } catch (error) {
//       console.error('Error creating audit log:', error);
//     }
//   };

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleClearSearch = () => {
//     setSearchTerm('');
//   };

//   const handleSort = (field) => {
//     const direction = sortDirection === 'asc' ? 'desc' : 'asc';
//     setSortDirection(direction);
//     setLogs([...logs].sort((a, b) => (a[field] < b[field] ? (direction === 'asc' ? -1 : 1) : (a[field] > b[field] ? (direction === 'asc' ? 1 : -1) : 0))));
//   };

//   const filteredLogs = logs.filter((log) =>
//     log.user.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const toggleRowExpand = (id) => {
//     setExpandedRows(expandedRows.includes(id) ? expandedRows.filter((rowId) => rowId !== id) : [...expandedRows, id]);
//   };

//   return (
//     <Container maxWidth="lg py-6">
//       <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}>
//         Audit Log
//       </Typography>

//       {/* Search Bar */}
//       <Paper sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2, borderRadius: 2, boxShadow: 3 }}>
//         <TextField
//           label="Search User"
//           variant="outlined"
//           size="small"
//           fullWidth
//           value={searchTerm}
//           onChange={handleSearch}
//           InputProps={{
//             endAdornment: searchTerm ? (
//               <IconButton onClick={handleClearSearch}>
//                 <ClearIcon />
//               </IconButton>
//             ) : (
//               <SearchIcon />
//             ),
//           }}
//         />
//       </Paper>

//       {/* Add New Log Section */}
//       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//         <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={4}>
//               <TextField label="User" variant="outlined" fullWidth value={newLog.user} onChange={(e) => setNewLog({ ...newLog, user: e.target.value })} />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField label="Action" variant="outlined" fullWidth value={newLog.action} onChange={(e) => setNewLog({ ...newLog, action: e.target.value })} />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField label="Details" variant="outlined" fullWidth value={newLog.details} onChange={(e) => setNewLog({ ...newLog, details: e.target.value })} />
//             </Grid>
//             <Grid item xs={12} textAlign="right">
//               <Button variant="contained" color="primary" onClick={handleCreateLog}>
//                 Create Log
//               </Button>
//             </Grid>
//           </Grid>
//         </Paper>
//       </motion.div>

//       {/* Audit Log Table */}
//       <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>
//                 <TableSortLabel active direction={sortDirection} onClick={() => handleSort("user")}>
//                   User
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell>Action</TableCell>
//               <TableCell>
//                 <TableSortLabel active direction={sortDirection} onClick={() => handleSort("timestamp")}>
//                   Timestamp
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell>Details</TableCell>
//               <TableCell>Expand</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredLogs.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((log) => (
//               <React.Fragment key={log._id}>
//                 <motion.tr
//                   layout
//                   whileHover={{ scale: 1.02 }}
//                   transition={{ duration: 0.2 }}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <TableRow>
//                     <TableCell>{log.user}</TableCell>
//                     <TableCell>
//                       <Chip label={log.action} color="primary" />
//                     </TableCell>
//                     <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
//                     <TableCell>{log.details}</TableCell>
//                     <TableCell>
//                       <Tooltip title="Expand Details">
//                         <IconButton onClick={() => toggleRowExpand(log._id)}>
//                           {expandedRows.includes(log._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//                         </IconButton>
//                       </Tooltip>
//                     </TableCell>
//                   </TableRow>
//                 </motion.tr>
//                 <TableRow>
//                   <TableCell colSpan={5}>
//                     <Collapse in={expandedRows.includes(log._id)} timeout="auto" unmountOnExit>
//                       <Box p={2} sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}>
//                         <Typography variant="body2">Additional Details: {log.details}</Typography>
//                       </Box>
//                     </Collapse>
//                   </TableCell>
//                 </TableRow>
//               </React.Fragment>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Pagination */}
//       <Grid container justifyContent="center" sx={{ mt: 3 }}>
//         <Pagination
//           count={Math.ceil(filteredLogs.length / rowsPerPage)}
//           page={page}
//           onChange={(event, newPage) => setPage(newPage)}
//           color="primary"
//         />
//       </Grid>
//     </Container>
//   );
// };

// export default AuditLog;
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Grid,
  Pagination,
  Chip,
  Collapse,
  Tooltip,
  Box,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [expandedRows, setExpandedRows] = useState([]);
  const [newLog, setNewLog] = useState({ user: "", action: "", details: "" });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get(
        `https://${import.meta.env.VITE_BACKEND}/api/getAudit`
      );
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const handleCreateLog = async () => {
    try {
      await axios.post(
        `https://${import.meta.env.VITE_BACKEND}/api/addAudit`,
        newLog
      );
      setNewLog({ user: "", action: "", details: "" });
      fetchAuditLogs();
    } catch (error) {
      console.error("Error creating audit log:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredLogs = logs.filter((log) =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRowExpand = (id) => {
    setExpandedRows(
      expandedRows.includes(id)
        ? expandedRows.filter((rowId) => rowId !== id)
        : [...expandedRows, id]
    );
  };

  return (
    <div className=" p-6 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center mb-4">Audit Log</h2>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg mb-4">
        <TextField
          label="Search User"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            className: "text-white",
            endAdornment: searchTerm ? (
              <IconButton onClick={handleClearSearch} className="text-white">
                <ClearIcon />
              </IconButton>
            ) : (
              <SearchIcon className="text-white" />
            ),
          }}
        />
      </div>

      {/* Add New Log Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="User"
                variant="outlined"
                fullWidth
                value={newLog.user}
                onChange={(e) =>
                  setNewLog({ ...newLog, user: e.target.value })
                }
                className="text-white"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Action"
                variant="outlined"
                fullWidth
                value={newLog.action}
                onChange={(e) =>
                  setNewLog({ ...newLog, action: e.target.value })
                }
                className="text-white"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Details"
                variant="outlined"
                fullWidth
                value={newLog.details}
                onChange={(e) =>
                  setNewLog({ ...newLog, details: e.target.value })
                }
                className="text-white"
              />
            </Grid>
            <Grid item xs={12} textAlign="right">
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateLog}
              >
                Create Log
              </Button>
            </Grid>
          </Grid>
        </div>
      </motion.div>

      <TableContainer
  component={Paper}
  className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg overflow-hidden"
>
  <Table>
    {/* Table Header */}
    <TableHead>
      <TableRow className="bg-gray-700 text-gray-300">
        {["User", "Action", "Timestamp", "Details", "Expand"].map((header) => (
          <TableCell key={header} className="text-lg font-semibold text-white px-6 py-4 text-center">
            {header}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>

    {/* Table Body */}
    <TableBody>
      {filteredLogs
        .slice((page - 1) * rowsPerPage, page * rowsPerPage)
        .map((log) => (
          <React.Fragment key={log._id}>
            <motion.tr
              layout
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer"
            >
              {/* TableRow ke andar hi saare TableCell hone chahiye */}
              <TableRow className="even:bg-gray-800 odd:bg-gray-850 hover:bg-gray-700 transition-all">
                <TableCell className="px-6 py-4 text-center font-medium">
                  {log.user}
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <Chip
                    label={log.action}
                    className="bg-blue-600 text-white font-medium px-3 py-1 rounded-lg"
                  />
                </TableCell>
                <TableCell className="px-6 py-4 text-center text-gray-300">
                  {new Date(log.timestamp).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  })}
                </TableCell>
                <TableCell className="px-6 py-4 text-center text-gray-300">
                  {log.details}
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <Tooltip title="Expand Details">
                    <IconButton
                      onClick={() => toggleRowExpand(log._id)}
                      className="text-blue-400 hover:text-blue-500 transition"
                    >
                      {expandedRows.includes(log._id) ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </motion.tr>

            {/* Expanded Details Row */}
            <TableRow>
              <TableCell colSpan={5} className="px-6 py-4">
                <Collapse in={expandedRows.includes(log._id)} timeout="auto" unmountOnExit>
                  <Box p={3} className="bg-gray-750 text-gray-300 rounded-lg shadow-md border border-gray-600">
                    <p className="font-medium text-gray-200">
                      Additional Details: {log.details}
                    </p>
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
    </TableBody>
  </Table>
</TableContainer>



      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination
          count={Math.ceil(filteredLogs.length / rowsPerPage)}
          page={page}
          onChange={(event, newPage) => setPage(newPage)}
          color="primary"
        />
      </div>
    </div>
  );
};

export default AuditLog;
