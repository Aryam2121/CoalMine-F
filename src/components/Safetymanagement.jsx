import React, { useState, useEffect } from "react";
import axios from "../services/axios";
import { useDropzone } from "react-dropzone";
import { Editor } from "@tinymce/tinymce-react";
import { CircularProgress } from "@mui/material";

const SafetyManagementPlan = () => {
  const [smpData, setSmpData] = useState([{ hazardDetails: "", mitigationMeasures: "", riskLevel: "", file: null }]);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [safetyPlans, setSafetyPlans] = useState([]);

  // Fetch all safety plans on mount
  useEffect(() => {
    const fetchSafetyPlans = async () => {
      try {
        const { data } = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getAllsafe`);
        setSafetyPlans(data);
      } catch (error) {
        console.error("Error fetching safety plans:", error);
      }
    };
    fetchSafetyPlans();
  }, []);

  // Handle Input Change
  const handleInputChange = (index, e) => {
    const newSmpData = [...smpData];
    newSmpData[index][e.target.name] = e.target.value;
    setSmpData(newSmpData);
  };

  // Handle File Upload
  const handleFileUpload = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 5000000) {
        setErrorMessage("File size exceeds 5MB");
        return;
      }
      const newSmpData = [...smpData];
      newSmpData[0].file = file;
      setSmpData(newSmpData);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Dropzone for file handling
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*,application/pdf",
    onDrop: handleFileUpload,
  });

  // Validate form before submission
  const validateForm = () => {
    return smpData.every((item) => item.hazardDetails && item.mitigationMeasures && item.riskLevel);
  };

  // Submit the form
  const submitSMP = async () => {
    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("hazardDetails", smpData[0].hazardDetails);
    formData.append("mitigationMeasures", smpData[0].mitigationMeasures);
    formData.append("riskLevel", smpData[0].riskLevel);
    if (smpData[0].file) {
      formData.append("file", smpData[0].file);
    }

    setLoading(true);
    try {
      await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/addsafe`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMessage("Safety Management Plan submitted successfully!");
    } catch (error) {
      setErrorMessage("Error submitting Safety Management Plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 rounded-lg shadow-lg w-full min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-6 text-blue-600">Safety Management Plan</h2>

      {successMessage && <div className="bg-green-100 text-green-800 p-4 rounded mb-4">{successMessage}</div>}
      {errorMessage && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{errorMessage}</div>}

      <form onSubmit={(e) => { e.preventDefault(); submitSMP(); }}>
        <div className="mb-6 p-6 border border-gray-700 rounded-lg shadow-md bg-gray-800">
          <h3 className="text-2xl font-semibold mb-4 text-white">Hazard Assessment</h3>

          <Editor
            apiKey="your-api-key"
            value={smpData[0].hazardDetails}
            init={{ height: 150 }}
            onEditorChange={(content) => handleInputChange(0, { target: { name: "hazardDetails", value: content } })}
            className="mb-4"
          />

          <Editor
            apiKey="your-api-key"
            value={smpData[0].mitigationMeasures}
            init={{ height: 150 }}
            onEditorChange={(content) => handleInputChange(0, { target: { name: "mitigationMeasures", value: content } })}
            className="mb-4"
          />

          <label className="block text-lg font-medium text-white mb-2">Risk Level</label>
          <select
            name="riskLevel"
            value={smpData[0].riskLevel}
            onChange={(e) => handleInputChange(0, e)}
            className="block w-full p-3 border rounded-lg mb-4 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Risk Level</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* File Upload */}
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

      {/* Display Existing Safety Plans */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-white">Existing Safety Plans</h3>
        {safetyPlans.length === 0 ? (
          <p className="text-gray-400 mt-4">No safety plans found.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {safetyPlans.map((plan) => (
              <li key={plan._id} className="p-4 bg-gray-800 rounded-lg shadow">
                <p className="text-white"><strong>Hazard:</strong> {plan.hazardDetails}</p>
                <p className="text-gray-400"><strong>Risk Level:</strong> {plan.riskLevel}</p>
                {plan.file && (
                  <a href={plan.file} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    View Attachment
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SafetyManagementPlan;
