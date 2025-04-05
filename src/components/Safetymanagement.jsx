import React, { useState, useEffect } from "react";
import axios from "../services/axios";
import { useDropzone } from "react-dropzone";
import { CircularProgress } from "@mui/material";

const SafetyManagementPlan = () => {
  const [smpData, setSmpData] = useState({
    hazardDetails: "",
    mitigationMeasures: "",
    riskLevel: "",
    status: ["draft", "approved", "rejected"],
    createdBy: "Admin", 
    file: null,
  });
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [safetyPlans, setSafetyPlans] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  useEffect(() => {
    fetchSafetyPlans();
  }, []);

  const fetchSafetyPlans = async () => {
    try {
      const { data } = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getAllSafety`);
      setSafetyPlans(data);
    } catch (error) {
      console.error("Error fetching safety plans:", error);
    }
  };

  const handleInputChange = (e) => {
    setSmpData({ ...smpData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 5000000) {
        setErrorMessage("File size exceeds 5MB");
        return;
      }
      setSmpData({ ...smpData, file });
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*,application/pdf",
    onDrop: handleFileUpload,
  });

  const validateForm = () => {
    return smpData.hazardDetails && smpData.mitigationMeasures && smpData.riskLevel && smpData.createdBy;
  };

  const submitSMP = async () => {
    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("hazardDetails", smpData.hazardDetails);
    formData.append("mitigationMeasures", smpData.mitigationMeasures);
    formData.append("riskLevel", smpData.riskLevel);
    formData.append("status", smpData.status);
    formData.append("createdBy", smpData.createdBy);

    if (smpData.file) {
      formData.append("file", smpData.file);
    }

    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/${editingId}`, formData);
        setSuccessMessage("Safety Management Plan updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/createSafety`, formData);
        setSuccessMessage("Safety Management Plan submitted successfully!");
      }
      fetchSafetyPlans();
    } catch (error) {
      setErrorMessage("Error submitting Safety Management Plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const editSafetyPlan = (plan) => {
    setSmpData({
      hazardDetails: plan.hazardDetails,
      mitigationMeasures: plan.mitigationMeasures,
      riskLevel: plan.riskLevel,
      status: plan.status,
      createdBy: plan.createdBy,
      file: null,
    });
    setEditingId(plan._id);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
  };
  const updateSafetyPlan = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("hazardDetails", smpData.hazardDetails);
      formData.append("mitigationMeasures", smpData.mitigationMeasures);
      formData.append("riskLevel", smpData.riskLevel);
      formData.append("status", smpData.status);
      formData.append("updatedBy", "Admin");
      if (smpData.file) {
        formData.append("file", smpData.file);
      }

      const { data } = await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setSuccessMessage("Safety plan updated successfully");
      fetchSafetyPlans();
      closeEditModal();
    } catch (error) {
      setErrorMessage("Error updating safety plan");
      console.error("Error updating safety plan:", error);
    } finally {
      setLoading(false);
    }
  };
  const deleteSafetyPlan = async (id) => {
    try {
      await axios.delete(`https://${import.meta.env.VITE_BACKEND}/api/safety/${id}`);
      setSuccessMessage("Safety Plan deleted successfully.");
      fetchSafetyPlans();
    } catch (error) {
      setErrorMessage("Error deleting safety plan.");
    }
  };

  return (
    <div className="p-12 bg-gray-900 rounded-lg shadow-lg w-full min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-6 text-blue-600">Safety Management Plan</h2>

      {successMessage && <div className="bg-green-100 text-green-800 p-4 rounded mb-4">{successMessage}</div>}
      {errorMessage && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{errorMessage}</div>}

      <form onSubmit={(e) => { e.preventDefault(); submitSMP(); }}>
        <div className="mb-6 p-6 border border-gray-700 rounded-lg shadow-md bg-gray-800">
          <h3 className="text-2xl font-semibold mb-4 text-white">Hazard Assessment</h3>

          <label className="block text-lg font-medium text-white mb-2">Hazard Details</label>
          <textarea
            name="hazardDetails"
            value={smpData.hazardDetails}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 mb-4"
            rows="4"
          />

          <label className="block text-lg font-medium text-white mb-2">Mitigation Measures</label>
          <textarea
            name="mitigationMeasures"
            value={smpData.mitigationMeasures}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 mb-4"
            rows="4"
          />

          <label className="block text-lg font-medium text-white mb-2">Risk Level</label>
          <select
            name="riskLevel"
            value={smpData.riskLevel}
            onChange={handleInputChange}
            className="block w-full p-3 border rounded-lg mb-4 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Risk Level</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <label className="block text-lg font-medium text-white">Status</label>
        <select
          name="status"
          value={smpData.status}
          onChange={handleInputChange}
          className="block w-full p-3 border rounded-lg bg-gray-700 text-white mb-4"
        >
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

          <div {...getRootProps()} className="border-2 border-dashed border-gray-500 p-6 text-center cursor-pointer bg-gray-700 text-white mb-4">
            <input {...getInputProps()} />
            <p>Drag & drop an image or PDF, or click to select a file</p>
          </div>
          {filePreview && <img src={filePreview} alt="Preview" className="max-w-xs mx-auto mt-4" />}

          <button type="submit" disabled={loading} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h3 className="text-2xl font-bold text-white">Existing Safety Plans</h3>
        {safetyPlans.length === 0 ? (
          <p className="text-gray-400 mt-4">No safety plans found.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {safetyPlans.map((plan) => (
              <li key={plan._id} className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <h4 className="text-xl font-semibold text-white">{plan.hazardDetails}</h4>
                <p className="text-gray-400 mt-2"><strong>Risk Level:</strong> {plan.riskLevel}</p>
                <p className="text-gray-400"><strong>Status:</strong> {plan.status}</p>
                {plan.file && (
                  <a 
                 href={`${plan.file}`} 
                    target="_blank" 
                      rel="noopener noreferrer" 
                           className="text-blue-400 hover:underline block mt-2"
                         >
                   View Attachment
                  </a>
                    )}

                  <button onClick={() => editSafetyPlan(plan)} className="bg-blue-500 text-white px-4 py-2 rounded mt-4 mr-2">
                  Update
                </button>
                <button onClick={() => deleteSafetyPlan(plan._id)} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-2xl font-semibold text-white mb-4">Edit Safety Plan</h3>
            <label className="block text-lg font-medium text-white mb-2">Hazard Details</label>
            <textarea
              name="hazardDetails"
              value={smpData.hazardDetails}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg bg-gray-700 text-white mb-4"
              rows="3"
            />
            <label className="block text-lg font-medium text-white mb-2">Mitigation Measures</label>
            <textarea
              name="mitigationMeasures"
              value={smpData.mitigationMeasures}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg bg-gray-700 text-white mb-4"
              rows="3"
            />
            <label className="block text-lg font-medium text-white mb-2">Risk Level</label>
            <select
              name="riskLevel"
              value={smpData.riskLevel}
              onChange={handleInputChange}
              className="block w-full p-3 border rounded-lg mb-4 bg-gray-700 text-white"
            >
              <option value="">Select Risk Level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <label className="block text-lg font-medium text-white">Status</label>
            <select
              name="status"
              value={smpData.status}
              onChange={handleInputChange}
              className="block w-full p-3 border rounded-lg bg-gray-700 text-white mb-4"
            >
              <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
            </select>
            <div
  {...getRootProps()}
  className="border-2 border-dashed border-gray-500 p-6 text-center cursor-pointer bg-gray-700 text-white mb-4"
>
  <input
    {...getInputProps()}
    name="file"
    onChange={handleInputChange} // You might not need this if react-dropzone handles it
  />
  <p>Drag & drop an image or PDF, or click to select a file</p>
</div>
            <button onClick={updateSafetyPlan} className="bg-green-500 text-white px-4 py-2 rounded w-full mb-2">
              {loading ? <CircularProgress size={24} /> : "Update"}
            </button>
            <button onClick={closeEditModal} className="bg-gray-500 text-white px-4 py-2 rounded w-full">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyManagementPlan;
