// import React, { useState, useEffect } from 'react';
// import { Transition } from '@headlessui/react';

// const AttendancePage = () => {
//   const [workers, setWorkers] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [workersPerPage] = useState(5);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     const fetchWorkers = async () => {
//       const mockWorkers = Array.from({ length: 50 }, (_, i) => ({
//         id: i + 1,
//         name: `Worker ${i + 1}`,
//         department: i % 2 === 0 ? 'Mining' : 'Maintenance',
//       }));
//       setWorkers(mockWorkers);
//     };
//     fetchWorkers();
//   }, []);

//   const handleAttendanceChange = (workerId) => {
//     setAttendance((prev) => ({
//       ...prev,
//       [workerId]: !prev[workerId],
//     }));
//   };

//   const handleSubmit = () => {
//     setShowModal(false);
//     setIsSubmitting(true);
//     setTimeout(() => {
//       setIsSubmitting(false);
//       alert('Attendance submitted successfully!');
//     }, 2000);
//   };

//   const filteredWorkers = workers.filter((worker) =>
//     worker.name.toLowerCase().includes(searchTerm) ||
//     worker.id.toString().includes(searchTerm)
//   );

//   const indexOfLastWorker = currentPage * workersPerPage;
//   const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
//   const currentWorkers = filteredWorkers.slice(indexOfFirstWorker, indexOfLastWorker);

//   const totalPages = Math.ceil(filteredWorkers.length / workersPerPage);

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
//         <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700 animate-bounce">
//           Worker Attendance
//         </h1>
//         <div className="flex justify-between items-center mb-4">
//           <input
//             type="text"
//             placeholder="Search by name or ID"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
//             className="border border-gray-300 rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//           <span className="text-gray-500 text-sm">{new Date().toLocaleString()}</span>
//         </div>
//         <table className="w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-indigo-200">
//               <th className="border border-gray-300 px-4 py-2">Worker ID</th>
//               <th className="border border-gray-300 px-4 py-2">Name</th>
//               <th className="border border-gray-300 px-4 py-2">Department</th>
//               <th className="border border-gray-300 px-4 py-2">Present</th>
//             </tr>
//           </thead>
//           <Transition
//             show={true}
//             enter="transition-opacity duration-700"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="transition-opacity duration-700"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <tbody>
//               {currentWorkers.map((worker) => (
//                 <tr key={worker.id} className="hover:bg-indigo-100">
//                   <td className="border border-gray-300 px-4 py-2">{worker.id}</td>
//                   <td className="border border-gray-300 px-4 py-2">{worker.name}</td>
//                   <td className="border border-gray-300 px-4 py-2">{worker.department}</td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">
//                     <input
//                       type="checkbox"
//                       checked={attendance[worker.id] || false}
//                       onChange={() => handleAttendanceChange(worker.id)}
//                       className="form-checkbox"
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Transition>
//         </table>
//         <div className="flex justify-between items-center mt-4">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
//           >
//             Previous
//           </button>
//           <span>
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
//           >
//             Next
//           </button>
//         </div>
//         <button
//           onClick={() => setShowModal(true)}
//           className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
//         >
//           Submit Attendance
//         </button>
//         {isSubmitting && (
//           <div className="mt-4 text-center text-green-500 font-bold animate-pulse">
//             Submitting attendance...
//           </div>
//         )}
//       </div>

//       {/* Confirmation Modal */}
//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-96">
//             <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
//             <p>Are you sure you want to submit the attendance?</p>
//             <div className="flex justify-between mt-6">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendancePage;
// import React, { useState, useEffect } from "react";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
// import { Bar } from "react-chartjs-2";
// import { motion } from "framer-motion";

// // Register the required components
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const AttendancePage = () => {
//   const [workers, setWorkers] = useState([]);
//   const [filteredWorkers, setFilteredWorkers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   // Mock data setup
//   useEffect(() => {
//     const mockWorkers = Array.from({ length: 50 }, (_, i) => ({
//       id: i + 1,
//       name: `Worker ${i + 1}`,
//       department: i % 2 === 0 ? "Mining" : "Maintenance",
//       checkIn: i % 2 === 0 ? "09:00" : "10:00",
//       checkOut: "18:00",
//       workHours: i % 2 === 0 ? "9h" : "8h",
//       status: i % 5 === 0 ? "Absent" : "Present",
//     }));
//     setWorkers(mockWorkers);
//     setFilteredWorkers(mockWorkers);
//   }, []);

//   // Filter workers by search term
//   useEffect(() => {
//     setFilteredWorkers(
//       workers.filter(
//         (worker) =>
//           worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           worker.id.toString().includes(searchTerm)
//       )
//     );
//   }, [searchTerm, workers]);

//   const handleDateChange = (date) => setSelectedDate(date);

//   // Attendance chart data
//   const attendanceChartData = {
//     labels: ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan"],
//     datasets: [
//       {
//         label: "Attendance Percentage",
//         data: [90, 85, 88, 92, 95],
//         backgroundColor: "rgba(75, 192, 192, 0.6)",
//         borderColor: "rgba(75, 192, 192, 1)",
//         borderWidth: 1,
//       },
//     ],
//   };

//   // Export to CSV
//   const exportToCSV = () => {
//     const csvData = [
//       ["ID", "Name", "Department", "Check-in", "Check-out", "Work Hours", "Status"],
//       ...filteredWorkers.map((worker) => [
//         worker.id,
//         worker.name,
//         worker.department,
//         worker.checkIn,
//         worker.checkOut,
//         worker.workHours,
//         worker.status,
//       ]),
//     ];
//     const csvContent = "data:text/csv;charset=utf-8," + csvData.map((e) => e.join(",")).join("\n");
//     const link = document.createElement("a");
//     link.setAttribute("href", encodeURI(csvContent));
//     link.setAttribute("download", "attendance_data.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <motion.div
//         className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-2xl font-bold mb-4 text-center">Attendance Dashboard</h1>
//         <div className="grid grid-cols-3 gap-6">
//           <motion.div className="col-span-2" whileHover={{ scale: 1.02 }}>
//             <Bar data={attendanceChartData} />
//           </motion.div>
//           <motion.div whileHover={{ scale: 1.02 }}>
//             <Calendar value={selectedDate} onChange={handleDateChange} />
//           </motion.div>
//         </div>

//         <div className="mt-6 flex justify-between items-center">
//           <input
//             type="text"
//             placeholder="Search by name or ID"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="border border-gray-300 rounded-lg p-2 w-1/3"
//           />
//           <div>
//             <button
//               className="bg-indigo-600 text-white px-4 py-2 rounded-lg mr-4"
//               onClick={exportToCSV}
//             >
//               Export to CSV
//             </button>
//             <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Advanced Filters</button>
//           </div>
//         </div>

//         <div className="mt-4">
//           <h2 className="text-lg font-bold mb-2">Worker Details</h2>
//           <motion.table
//             className="w-full border-collapse border border-gray-300"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <thead className="bg-gray-200">
//               <tr>
//                 <th className="border border-gray-300 px-4 py-2">ID</th>
//                 <th className="border border-gray-300 px-4 py-2">Name</th>
//                 <th className="border border-gray-300 px-4 py-2">Department</th>
//                 <th className="border border-gray-300 px-4 py-2">Check-in</th>
//                 <th className="border border-gray-300 px-4 py-2">Check-out</th>
//                 <th className="border border-gray-300 px-4 py-2">Work Hours</th>
//                 <th className="border border-gray-300 px-4 py-2">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredWorkers.map((worker) => (
//                 <motion.tr
//                   key={worker.id}
//                   className="hover:bg-gray-100"
//                   whileHover={{ scale: 1.02 }}
//                 >
//                   <td className="border border-gray-300 px-4 py-2">{worker.id}</td>
//                   <td className="border border-gray-300 px-4 py-2">{worker.name}</td>
//                   <td className="border border-gray-300 px-4 py-2">{worker.department}</td>
//                   <td className="border border-gray-300 px-4 py-2">{worker.checkIn}</td>
//                   <td className="border border-gray-300 px-4 py-2">{worker.checkOut}</td>
//                   <td className="border border-gray-300 px-4 py-2">{worker.workHours}</td>
//                   <td
//                     className={`border border-gray-300 px-4 py-2 ${
//                       worker.status === "Absent" ? "text-red-500" : "text-green-500"
//                     } font-bold`}
//                   >
//                     {worker.status}
//                   </td>
//                 </motion.tr>
//               ))}
//             </tbody>
//           </motion.table>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default AttendancePage;
import React, { useState, useEffect } from "react"; 
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AttendancePage = () => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedWorker, setSelectedWorker] = useState(null);
  const [attendanceChartData, setAttendanceChartData] = useState({
    labels: ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan"],
    datasets: [
      {
        label: "Attendance Percentage",
        data: [90, 85, 88, 92, 95],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.3)",
        fill: true,
      },
    ],
  });
  const openModal = (worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);
  useEffect(() => {
    const mockWorkers = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Worker ${i + 1}`,
      department: i % 2 === 0 ? "Mining" : "Maintenance",
      status: i % 5 === 0 ? "Absent" : "Present",
    }));
    setWorkers(mockWorkers);
    setFilteredWorkers(mockWorkers);
    updateStats(mockWorkers);
  }, []);

  useEffect(() => {
    setFilteredWorkers(
      workers.filter(
        (worker) =>
          worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.id.toString().includes(searchTerm)
      )
    );
  }, [searchTerm, workers]);

  const updateStats = (workers) => {
    const present = workers.filter((worker) => worker.status === "Present").length;
    const absent = workers.filter((worker) => worker.status === "Absent").length;
    setAttendanceStats({ present, absent });
  };

  const handleAttendanceChange = (id, status) => {
    const updatedWorkers = workers.map((worker) =>
      worker.id === id ? { ...worker, status } : worker
    );
    setWorkers(updatedWorkers);
    updateStats(updatedWorkers);
  };

  // Simulate Realistic Attendance Trends
  const generateDynamicAttendanceData = () => {
    const randomData = Array.from({ length: 5 }, (_, i) => {
      const fluctuation = Math.sin(i) * 20 + 75; // Adds sine wave fluctuation to simulate trends
      return Math.max(0, Math.min(100, fluctuation + Math.random() * 10)); // Ensure the percentage stays within 0-100
    });

    const present = randomData.filter((value) => value >= 50).length;
    const absent = 5 - present;
    setAttendanceStats({ present, absent });

    const chartData = {
      labels: ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan"],
      datasets: [
        {
          label: "Attendance Percentage",
          data: randomData,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.3)",
          fill: true,
        },
      ],
    };
    setAttendanceChartData(chartData);
  };

  useEffect(() => {
    generateDynamicAttendanceData();
  }, [selectedDate]);

  const exportToCSV = () => {
    const csvData = [
      ["ID", "Name", "Department", "Status"],
      ...workers.map((worker) => [worker.id, worker.name, worker.department, worker.status]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvData.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "attendance_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        className=" w-full min-h-screen bg-white shadow-lg rounded-lg p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Attendance Dashboard</h1>

        {/* Stats Cards with Hover Animation */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <motion.div
            className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow-md"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-bold">Total Workers</h2>
            <p className="text-2xl">{workers.length}</p>
          </motion.div>
          <motion.div
            className="bg-green-100 text-green-800 p-4 rounded-lg shadow-md"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-bold">Present</h2>
            <p className="text-2xl">{attendanceStats.present}</p>
          </motion.div>
          <motion.div
            className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-bold">Absent</h2>
            <p className="text-2xl">{attendanceStats.absent}</p>
          </motion.div>
        </div>

        {/* Attendance Chart and Calendar with Hover Effects */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <motion.div className="col-span-2" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <Line 
              data={attendanceChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => `${tooltipItem.raw.toFixed(2)}%`
                    }
                  }
                }
              }}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <Calendar value={selectedDate} onChange={(date) => setSelectedDate(date)} />
          </motion.div>
        </div>

        {/* Worker Cards with Dynamic Status Changes */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <motion.input
              type="text"
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-1/3"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
            <div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg mr-4"
                onClick={exportToCSV}
              >
                Export to CSV
              </button>
            </div>
          </div>

          {/* Worker Cards with Animation */}
          <div className="grid grid-cols-2 gap-6">
            {filteredWorkers.map((worker) => (
              <motion.div
                key={worker.id}
                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold">{worker.name}</h3>
                <p>{worker.department}</p>
                <div className="mt-2 flex justify-between items-center">
                 <button
  aria-label={`Mark ${worker.status === "Present" ? "Absent" : "Present"}`}
  onClick={() => handleAttendanceChange(worker.id, worker.status === "Present" ? "Absent" : "Present")}
  className={`px-4 py-2 rounded-lg text-white ${worker.status === "Present" ? "bg-green-600" : "bg-red-600"}`}
>
  {worker.status === "Present" ? "Mark Absent" : "Mark Present"}
</button>

                  <div className="text-sm">
                    Status: {worker.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <motion.div
          className="bg-white p-6 rounded-lg shadow-md w-1/3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold">Edit Worker Details</h2>
          <p>Name: {selectedWorker.name}</p>
          <p>Department: {selectedWorker.department}</p>
          <div>Status: {selectedWorker.status}</div>
          <button onClick={closeModal} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
            Close
          </button>
        </motion.div>
      </div>
    )}
        </div>
      </motion.div>
    </div>
  );
};

export default AttendancePage;
