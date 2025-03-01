import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = `https://${import.meta.env.VITE_BACKEND}/api`;

const SafetyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [modal, setModal] = useState({ show: false, action: null, id: null });
  const [searchId, setSearchId] = useState("");
  const [searchedReport, setSearchedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/getAllReports`);
      setReports(data);
    } catch (error) {
      toast.error("Error fetching reports");
    }
    setLoading(false);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
  
      // Append non-file fields
      formData.append("reportTitle", data.reportTitle);
      formData.append("description", data.description);
      formData.append("riskLevel", data.riskLevel);
      formData.append("incidentDate", data.incidentDate);
      formData.append("location", data.location);
  
      // Append file attachments correctly
      if (data.attachments && data.attachments.length > 0) {
        for (let i = 0; i < data.attachments.length; i++) {
          formData.append("attachments", data.attachments[i]);
        }
      }
  
      // Debugging: Log formData contents
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      // Send POST request
      await axios.post(`${API_URL}/createReports`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      toast.success("Report created successfully");
      reset();
      loadReports();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error creating report");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAction = async () => {
    if (!modal.id) return;
    try {
      setLoading(true);
      if (modal.action === "approve") {
        await axios.put(`${API_URL}/${modal.id}/approve`, { approvedBy: "adminUser123" });
        toast.success("Report approved");
      } else if (modal.action === "delete") {
        await axios.delete(`${API_URL}/${modal.id}`);
        toast.success("Report deleted");
      }
      loadReports();
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setModal({ show: false, action: null, id: null });
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error("Please enter a report ID");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/${searchId}`);
      setSearchedReport(data);
    } catch (error) {
      toast.error("Report not found");
      setSearchedReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Safety Reports Management</h1>

      {/* Search Report by ID */}
      <div className="p-4 bg-white shadow-md rounded mb-6 flex gap-2">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter Report ID"
          className="p-2 border rounded w-full"
        />
        <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Search
        </button>
      </div>

      {searchedReport && (
        <div className="p-4 bg-white shadow-md rounded mb-6">
          <h3 className="text-lg font-semibold">{searchedReport.reportTitle}</h3>
          <p className="text-gray-700">{searchedReport.description}</p>
          <p className={`text-sm font-medium ${searchedReport.riskLevel === "High" ? "text-red-600" : "text-gray-500"}`}>
            Risk Level: {searchedReport.riskLevel}
          </p>
        </div>
      )}

      {/* Safety Report Form */}
      <div className="p-6 bg-white shadow-md rounded mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Safety Report</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <input {...register("reportTitle", { required: true })} placeholder="Report Title" className="p-2 border rounded" />
          <textarea {...register("description", { required: true })} placeholder="Description" className="p-2 border rounded" />
          <select {...register("riskLevel", { required: true })} className="p-2 border rounded">
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
          <input type="date" {...register("incidentDate", { required: true })} className="p-2 border rounded" />
          <input {...register("location", { required: true })} placeholder="Location" className="p-2 border rounded" />
          <input type="file" {...register("attachments")} multiple className="p-2 border rounded" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
      {/* Action Confirmation Modal */}
{modal.show && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-md w-96">
      <h3 className="text-lg font-semibold text-gray-800">
        Are you sure you want to {modal.action} this report?
      </h3>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setModal({ show: false, action: null, id: null })}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleAction} // Call the function here
          className={`px-4 py-2 rounded ${
            modal.action === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
          } text-white`}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

      {/* Safety Reports List */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Safety Reports</h2>
      {loading ? (
        <p className="text-center text-blue-500">Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-500">No reports available</p>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report._id} className="p-4 bg-white shadow-md rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{report.reportTitle}</h3>
                <p className="text-gray-700">{report.description}</p>
                <p className={`text-sm font-medium ${report.riskLevel === "High" ? "text-red-600" : "text-gray-500"}`}>
                  Risk Level: {report.riskLevel}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setModal({ show: true, action: "approve", id: report._id })}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => setModal({ show: true, action: "delete", id: report._id })}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SafetyReportsPage;
