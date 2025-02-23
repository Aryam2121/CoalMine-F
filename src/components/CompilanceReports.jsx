import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdCheckCircle, MdPending, MdCancel } from "react-icons/md";
import axios from "axios";

const statusColors = {
  Approved: "bg-green-500/20 text-green-600 dark:bg-green-700/30 dark:text-green-300",
  Pending: "bg-yellow-500/20 text-yellow-600 dark:bg-yellow-700/30 dark:text-yellow-300",
  Rejected: "bg-red-500/20 text-red-600 dark:bg-red-700/30 dark:text-red-300",
};

const statusIcons = {
  Approved: <MdCheckCircle className="text-green-600 dark:text-green-300 text-lg" />,
  Pending: <MdPending className="text-yellow-600 dark:text-yellow-300 text-lg" />,
  Rejected: <MdCancel className="text-red-600 dark:text-red-300 text-lg" />,
};

export default function ComplianceReports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [totalReports, setTotalReports] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    date: '',
    status: '',
    details: '',
  });
  const [selectedReport, setSelectedReport] = useState(null); // Selected report for update
  const [showModal, setShowModal] = useState(false); // Modal visibility

  const filteredReports = (reports || []).filter(
    (report) =>
      report.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "" || report.status === statusFilter) &&
      (dateFilter === "" || report.date >= dateFilter)
  );

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getreports`, {
          params: {
            search,
            status: statusFilter,
            page,
            limit: 10,
          },
        });
        setReports(data.reports || []);
        setTotalReports(data.total || 0);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
      setLoading(false);
    };
    fetchReports();
  }, [search, statusFilter, dateFilter, page]);

  const handleAddReport = async () => {
    try {
      const { data } = await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/addreports`, newReport);
      setReports([data.report, ...reports]);
      alert("Report added successfully!");
      setNewReport({
        name: '',
        date: '',
        status: '',
        details: '',
      });
    } catch (error) {
      console.error("Error adding report:", error);
      alert("Failed to add report.");
    }
  };

  const handleUpdateReport = async (updatedReport) => {
    try {
      const { data } = await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/${updatedReport.id}`, updatedReport);
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === updatedReport.id ? data.report : report
        )
      );
      setShowModal(false); // Close modal after update
      alert("Report updated successfully!");
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report.");
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`https://${import.meta.env.VITE_BACKEND}/api/${reportId}`);
      setReports(reports.filter((report) => report.id !== reportId));
      alert("Report deleted successfully!");
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report.");
    }
  };

  const exportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Report Name,Date,Status,Details", ...reports.map((r) => `${r.name},${r.date},${r.status},${r.details}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "compliance_reports.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-6  bg-gray-900 text-white">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">📋 Compliance Reports</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          <FiDownload />
          Export CSV
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        >
          <option value="">All Statuses</option>
          <option value="Approved">✅ Approved</option>
          <option value="Pending">⏳ Pending</option>
          <option value="Rejected">❌ Rejected</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
      </div>

      {/* Add Report Form */}
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Report</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Report Name"
            value={newReport.name}
            onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
            className="p-3 border rounded-lg w-full bg-gray-700 text-white"
          />
        </div>
        <div className="mb-4">
          <input
            type="date"
            value={newReport.date}
            onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
            className="p-3 border rounded-lg w-full bg-gray-700 text-white"
          />
        </div>
        <div className="mb-4">
          <select
            value={newReport.status}
            onChange={(e) => setNewReport({ ...newReport, status: e.target.value })}
            className="p-3 border rounded-lg w-full bg-gray-700 text-white"
          >
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Details"
            value={newReport.details}
            onChange={(e) => setNewReport({ ...newReport, details: e.target.value })}
            className="p-3 border rounded-lg w-full bg-gray-700 text-white"
          />
        </div>
        <button
          onClick={handleAddReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Report
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden backdrop-blur-md bg-opacity-80 border border-gray-300 dark:border-gray-700">
        {loading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 sticky top-0">
              <tr>
                <th className="p-4">Report Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <>
                    <motion.tr
                      key={report.id}
                      whileHover={{ scale: 1.02 }}
                      className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === report.id ? null : report.id)}
                    >
                      <td className="p-4 flex items-center gap-2">{statusIcons[report.status]} {report.name}</td>
                      <td className="p-4">{report.date}</td>
                      <td className="p-4">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[report.status]}`}>
                          {statusIcons[report.status]} {report.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {expandedRow === report.id ? <FiChevronUp /> : <FiChevronDown />}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedReport(report); setShowModal(true); }}
                          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                          Update Report
                        </button>
                      </td>
                    </motion.tr>
                    {expandedRow === report.id && (
                      <tr>
                        <td colSpan="4" className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {report.details}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No reports found 😞
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Update Report Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-1/3">
            <h2 className="text-xl font-semibold text-white mb-4">Update Report</h2>
            <div className="mb-4">
              <input
                type="text"
                value={selectedReport.name}
                onChange={(e) => setSelectedReport({ ...selectedReport, name: e.target.value })}
                className="p-3 border rounded-lg w-full bg-gray-700 text-white"
              />
            </div>
            <div className="mb-4">
              <input
                type="date"
                value={selectedReport.date}
                onChange={(e) => setSelectedReport({ ...selectedReport, date: e.target.value })}
                className="p-3 border rounded-lg w-full bg-gray-700 text-white"
              />
            </div>
            <div className="mb-4">
              <select
                value={selectedReport.status}
                onChange={(e) => setSelectedReport({ ...selectedReport, status: e.target.value })}
                className="p-3 border rounded-lg w-full bg-gray-700 text-white"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="mb-4">
              <textarea
                value={selectedReport.details}
                onChange={(e) => setSelectedReport({ ...selectedReport, details: e.target.value })}
                className="p-3 border rounded-lg w-full bg-gray-700 text-white"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => handleUpdateReport(selectedReport)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Update
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
