// import React, { useState, useEffect } from 'react';
// import axios from '../services/axios';
// import { useDropzone } from 'react-dropzone';
// import ProgressBar from 'react-bootstrap/ProgressBar';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FaFileUpload } from 'react-icons/fa';

// const ShiftHandoverLog = () => {
//   const [logData, setLogData] = useState({
//     shiftDetails: '',
//     safetyIssues: '',
//     nextShiftTasks: '',
//   });
//   const [file, setFile] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);
//   const [additionalNotes, setAdditionalNotes] = useState('');
//   const [previousLogs, setPreviousLogs] = useState([]);
//   const [autoSaveStatus, setAutoSaveStatus] = useState('Auto-saving every minute...');
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploading, setUploading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     const storedLogs = JSON.parse(localStorage.getItem('shiftHandoverLogs')) || [];
//     setPreviousLogs(storedLogs);
//   }, []);
  

//   useEffect(() => {
//     const autoSave = setInterval(() => {
//       localStorage.setItem('shiftHandoverLogData', JSON.stringify(logData));
//       setAutoSaveStatus('Auto-saved at ' + new Date().toLocaleTimeString());
//     }, 60000); // Auto-save every minute

//     return () => clearInterval(autoSave);
//   }, [logData]);

//   const handleInputChange = (e) => {
//     setLogData({ ...logData, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (acceptedFiles) => {
//     if (acceptedFiles.length > 0) {
//       setFile(acceptedFiles[0]);
//       setFilePreview(URL.createObjectURL(acceptedFiles[0])); // To show the preview
//     }
//   };
  

//   const { getRootProps, getInputProps } = useDropzone({
//     accept: 'image/*,application/pdf',
//     onDrop: handleFileChange,
//   });

//   const handleNotesChange = (e) => {
//     setAdditionalNotes(e.target.value);
//   };

//   const submitLog = () => {
//     const formData = {
//       shiftDetails: logData.shiftDetails,
//       safetyIssues: logData.safetyIssues,
//       nextShiftTasks: logData.nextShiftTasks,
//       additionalNotes: additionalNotes,
//       file: file ? file.name : null, // Just storing the file name for now
//     };
  
//     console.log('Form Data:', formData); // Log form data to the console
  
//     setLoading(true);
//     setErrorMessage('');
//     setUploadProgress(0);
//     setUploading(true);
  
//     // Simulate a delay to mimic a real API call
//     setTimeout(() => {
//       // Simulate a successful submission (randomly)
//       const isSuccess = Math.random() > 0.1; // 90% chance of success, 10% failure
  
//       if (isSuccess) {
//         alert('Log submitted successfully!');
        
//         // Simulate saving the data to localStorage
//         const storedLogs = JSON.parse(localStorage.getItem('shiftHandoverLogs')) || [];
//         storedLogs.push(formData);
//         localStorage.setItem('shiftHandoverLogs', JSON.stringify(storedLogs));
  
//         // Update the previous logs state
//         setPreviousLogs(storedLogs);
  
//         // Reset form state
//         setLogData({ shiftDetails: '', safetyIssues: '', nextShiftTasks: '' });
//         setFile(null);
//         setFilePreview(null);
//         setAdditionalNotes('');
//         setUploadProgress(0);
//       } else {
//         setErrorMessage('Failed to submit log. Please try again.');
//       }
  
//       setLoading(false);
//       setUploading(false);
//     }, 1500); // Simulate a 1.5-second delay
//   };
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (window.confirm('Are you sure you want to submit this log?')) {
//       submitLog();
//     }
//   };
//   const deleteLog = (index) => {
//     const updatedLogs = [...previousLogs];
//     updatedLogs.splice(index, 1); // Remove the log at the given index
//     setPreviousLogs(updatedLogs);
//     localStorage.setItem('shiftHandoverLogs', JSON.stringify(updatedLogs)); // Update localStorage
//   };
//   return (
//     <div className="p-8 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
//       <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Shift Handover Log</h2>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label htmlFor="shiftDetails" className="text-lg font-medium text-gray-700">Shift Details</label>
//           <textarea
//             id="shiftDetails"
//             name="shiftDetails"
//             value={logData.shiftDetails}
//             onChange={handleInputChange}
//             rows="4"
//             className="block w-full p-4 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
//             placeholder="Enter shift details..."
//           ></textarea>
//         </div>

//         <div>
//           <label htmlFor="safetyIssues" className="text-lg font-medium text-gray-700">Safety Issues</label>
//           <textarea
//             id="safetyIssues"
//             name="safetyIssues"
//             value={logData.safetyIssues}
//             onChange={handleInputChange}
//             rows="4"
//             className="block w-full p-4 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
//             placeholder="Enter safety issues..."
//           ></textarea>
//         </div>

//         <div>
//           <label htmlFor="nextShiftTasks" className="text-lg font-medium text-gray-700">Next Shift Tasks</label>
//           <textarea
//             id="nextShiftTasks"
//             name="nextShiftTasks"
//             value={logData.nextShiftTasks}
//             onChange={handleInputChange}
//             rows="4"
//             className="block w-full p-4 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
//             placeholder="Enter tasks for the next shift..."
//           ></textarea>
//         </div>

//         <div>
//           <label htmlFor="additionalNotes" className="text-lg font-medium text-gray-700">Additional Notes</label>
//           <textarea
//             id="additionalNotes"
//             name="additionalNotes"
//             value={additionalNotes}
//             onChange={handleNotesChange}
//             rows="4"
//             className="block w-full p-4 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
//             placeholder="Add any additional notes (optional)..."
//           ></textarea>
//         </div>

//         {/* File Upload */}
//         <div className="space-y-4">
//           <div {...getRootProps()} className="p-6 border-dashed border-2 border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-100">
//             <input {...getInputProps()} />
//             <p className="text-gray-600">Drag & drop a file here, or click to select one (Image/PDF)</p>
//             {filePreview && <img src={filePreview} alt="Preview" className="mt-4 max-w-full h-auto" />}
//             {!filePreview && <FaFileUpload className="text-3xl text-gray-600 mt-4" />}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <button
//           type="submit"
//           className={`w-full py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${loading ? 'bg-gray-500' : 'bg-blue-600'}`}
//           disabled={loading}
//         >
//           {loading ? 'Submitting...' : 'Submit Log'}
//         </button>

//         {/* Error Message */}
//         {errorMessage && <p className="text-red-600 mt-4 text-center">{errorMessage}</p>}

//         {/* Upload Progress */}
//         {uploading && (
//           <div className="mt-4">
//             <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
//           </div>
//         )}
//       </form>

//       {/* Auto-Save Status */}
//       <div className="mt-6 text-sm text-gray-600 text-center">{autoSaveStatus}</div>

//       {/* Previous Logs Section */}
//       <div className="mt-6 space-y-4">
//         <h3 className="text-xl font-semibold text-gray-800">Previous Shift Logs</h3>
//         {previousLogs.length > 0 ? (
//           <ul>
//             {previousLogs.map((log, index) => (
//               <li key={index} className="p-4 border border-gray-300 rounded-lg shadow-sm">
//                 <p><strong>Shift Details:</strong> {log.shiftDetails}</p>
//                 <p><strong>Safety Issues:</strong> {log.safetyIssues}</p>
//                 <p><strong>Next Shift Tasks:</strong> {log.nextShiftTasks}</p>
//                 <p><strong>Additional Notes:</strong> {log.additionalNotes}</p>
//                 {log.file && <a href={log.file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Attached File</a>}
//                 {/* Delete Button */}
//                 <button
//                   onClick={() => deleteLog(index)}
//                   className="mt-4 text-red-500 hover:text-red-700"
//                 >
//                   Delete Log
//                 </button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No previous logs available.</p>
//         )}
//       </div>
//     </div>
//   );
// };
// export default ShiftHandoverLog;
import React, { useState, useEffect } from 'react';
import axios from '../services/axios'; // Import your axios instance
import { useDropzone } from 'react-dropzone';
import ProgressBar from 'react-bootstrap/ProgressBar';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFileUpload } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'; // Speech Recognition
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

const ShiftHandoverLog = () => {
  const [logData, setLogData] = useState({
    shiftDetails: '',
    safetyIssues: '',
    nextShiftTasks: '',
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [previousLogs, setPreviousLogs] = useState([]);
  const [editLogId, setEditLogId] = useState(null); // Track the log being edited
  const [autoSaveStatus, setAutoSaveStatus] = useState('Auto-saving every minute...');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    shiftDetails: "",
    shiftStartTime: "",
    shiftEndTime: "",
    status: "",
    notes: "",
    file: null,
  });

  // Fetch previous shift logs on load
  useEffect(() => {
    const fetchShiftLogs = async () => {
      try {
        const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getAllLogs`);
        setPreviousLogs(response.data.shiftLogs);
      } catch (error) {
        console.error('Error fetching shift logs:', error);
        setErrorMessage('Error fetching previous shift logs');
      }
    };

    fetchShiftLogs();
  }, []);

  const handleInputChange = (e) => {
    setLogData({ ...logData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setFilePreview(URL.createObjectURL(acceptedFiles[0]));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*,application/pdf',
    onDrop: handleFileChange,
  });

  const handleNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const submitLog = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    if (!logData.shiftDetails || !logData.shiftStartTime || !logData.shiftEndTime) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
  
    const formData = new FormData();
    formData.append('shiftDetails', logData.shiftDetails);
    formData.append('shiftStartTime', logData.shiftStartTime);
    formData.append('shiftEndTime', logData.shiftEndTime);
    formData.append('status', logData.status || 'pending');
    formData.append('notes', additionalNotes);
  
    if (file) {
      formData.append('file', file);
    }
  
    try {
      setLoading(true);
      const response = await axios.post(
        `https://${import.meta.env.VITE_BACKEND}/api/createLogs`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      setPreviousLogs([...previousLogs, response.data]);
      resetForm();
      alert('Log submitted successfully!');
    } catch (error) {
      console.error('Error submitting shift log:', error);
      
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setLogData({ shiftDetails: '', safetyIssues: '', nextShiftTasks: '' });
    setFile(null);
    setFilePreview(null);
    setAdditionalNotes('');
    setUploadProgress(0);
  };

  const deleteLog = async (id) => {
    try {
      await axios.delete(`https://${import.meta.env.VITE_BACKEND}/api/deleteLog/${id}`);
      setPreviousLogs(previousLogs.filter((log) => log._id !== id));
      alert('Log deleted successfully!');
    } catch (error) {
      console.error('Error deleting shift log:', error);
      setErrorMessage('Failed to delete log. Please try again.');
    }
  };
  

  const editLog = (id) => {
    console.log("Editing log ID:", id);
    const logToEdit = previousLogs.find((log) => log._id === id);
    setLogData({
      shiftDetails: logToEdit.shiftDetails,
      safetyIssues: logToEdit.safetyIssues,
      nextShiftTasks: logToEdit.nextShiftTasks,
      shiftStartTime: logToEdit.shiftStartTime,
      shiftEndTime: logToEdit.shiftEndTime,
      status: logToEdit.status,
    });
    setAdditionalNotes(logToEdit.notes || '');
    setEditLogId(id);
    setShowEditModal(true); // Show modal
  };
  

  const updateLog = async () => {
    try {
      const updatedLog = {
        shiftDetails: logData.shiftDetails,
       
        shiftStartTime: logData.shiftStartTime,
        shiftEndTime: logData.shiftEndTime,
        status: logData.status,
        notes: additionalNotes,
      };
  
      const response = await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/updateLog/${editLogId}`, updatedLog);
  
      setPreviousLogs(previousLogs.map((log) => (log._id === editLogId ? response.data : log)));
      resetForm();
      setEditLogId(null);
      alert('Log updated successfully!');
    } catch (error) {
      console.error('Error updating shift log:', error);
      setErrorMessage('Failed to update log. Please try again.');
    }
  };
  

  const startVoiceRecognition = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopVoiceRecognition = () => {
    SpeechRecognition.stopListening();
    setLogData((prevState) => ({
      ...prevState,
      shiftDetails: transcript,
    }));
  };

  return (
    <div className="p-12 bg-gray-900 rounded-lg shadow-lg w-full min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-6 text-white">Shift Handover Log</h2>
      <form onSubmit={submitLog} className="space-y-6">
        {/* Shift Details */}
        <div>
          <label htmlFor="shiftDetails" className="text-lg font-medium text-white">Shift Details</label>
          <textarea
            id="shiftDetails"
            name="shiftDetails"
            value={logData.shiftDetails}
            onChange={handleInputChange}
            rows="4"
            className="block w-full p-4 mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter shift details..."
          ></textarea>
        </div>
    
        {/* Safety Issues */}
        <div>
          <label htmlFor="safetyIssues" className="text-lg font-medium text-white">Safety Issues</label>
          <textarea
            id="safetyIssues"
            name="safetyIssues"
            value={logData.safetyIssues}
            onChange={handleInputChange}
            rows="4"
            className="block w-full p-4 mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter safety issues..."
          ></textarea>
        </div>
        <div>
  <label htmlFor="status" className="text-lg font-medium text-white">Status</label>
  <select
    id="status"
    name="status"
    value={logData.status}
    onChange={handleInputChange}
    className="block w-full p-3 mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
  >
    <option value="pending">Pending</option>
    <option value="in-progress">In Progress</option>
    <option value="completed">Completed</option>
  </select>
</div>
        {/* <div>
  <label htmlFor="shiftDate" className="text-lg font-medium text-white">Shift Date</label>
  <input
    type="date"
    id="shiftDate"
    name="shiftDate"
    value={logData.shiftDate}
    onChange={handleInputChange}
    className="block w-full p-2 mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
  />
</div> */}

<div>
  <label htmlFor="shiftStartTime" className="text-lg font-medium text-white">Shift Start Time</label>
  <input
    type="time"
    id="shiftStartTime"
    name="shiftStartTime"
    value={logData.shiftStartTime}
    onChange={handleInputChange}
    className="block w-full p-2 mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
  />
</div>

<div>
  <label htmlFor="shiftEndTime" className="text-lg font-medium text-white">Shift End Time</label>
  <input
    type="time"
    id="shiftEndTime"
    name="shiftEndTime"
    value={logData.shiftEndTime}
    onChange={handleInputChange}
    className="block w-full p-2 mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
  />
</div>
    
        {/* Next Shift Tasks */}
        <div>
          <label htmlFor="nextShiftTasks" className="text-lg font-medium text-white">Next Shift Tasks</label>
          <textarea
            id="nextShiftTasks"
            name="nextShiftTasks"
            value={logData.nextShiftTasks}
            onChange={handleInputChange}
            rows="4"
            className="block w-full p-4 mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter tasks for the next shift..."
          ></textarea>
        </div>
    
        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="text-lg font-medium text-white">Additional Notes</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={additionalNotes}
            onChange={handleNotesChange}
            rows="4"
            className="block w-full p-4 mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Add any additional notes (optional)..."
          ></textarea>
        </div>
    
        {/* File Upload */}
        <div className="space-y-4">
          <div {...getRootProps()} className="p-6 border-dashed border-2 border-gray-600 rounded-lg text-center cursor-pointer hover:bg-gray-700 transition-all duration-300">
            <input {...getInputProps()} />
            <p className="text-gray-400">Drag & drop a file here, or click to select one (Image/PDF)</p>
            {filePreview && <img src={filePreview} alt="Preview" className="mt-4 max-w-full h-auto rounded-lg shadow-lg" />}
            {!filePreview && <FaFileUpload className="text-3xl text-gray-400 mt-4" />}
          </div>
        </div>
    
        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${loading ? 'bg-gray-500' : 'bg-blue-600'}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Log'}
        </button>
    
        {/* Error Message */}
        {errorMessage && <p className="text-red-600 mt-4 text-center">{errorMessage}</p>}
    
        {/* Voice Control */}
        <div className="mt-4 text-center">
          <button onClick={startVoiceRecognition} className="bg-green-600 text-white p-2 rounded-lg">Start Voice</button>
          <button onClick={stopVoiceRecognition} className="bg-red-600 text-white p-2 rounded-lg ml-2">Stop Voice</button>
        </div>
    
        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
          </div>
        )}
      </form>
      {showEditModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gray-900 p-4 rounded-lg w-full max-w-md shadow-lg relative">
      <button
        onClick={() => {
          setEditLogId(null);
          resetForm();
        }}
        className="absolute top-2 right-2 text-white text-xl hover:text-red-500"
      >
        &times;
      </button>

      <h3 className="text-white text-lg font-semibold mb-3">Edit Shift Log</h3>

      <div className="space-y-3 text-sm">
        <textarea
          name="shiftDetails"
          value={logData.shiftDetails}
          onChange={handleInputChange}
          placeholder="Shift details"
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <textarea
          name="safetyIssues"
          value={logData.safetyIssues}
          onChange={handleInputChange}
          placeholder="Safety issues"
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <textarea
          name="nextShiftTasks"
          value={logData.nextShiftTasks}
          onChange={handleInputChange}
          placeholder="Next shift tasks"
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="time"
          name="shiftStartTime"
          value={logData.shiftStartTime}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="time"
          name="shiftEndTime"
          value={logData.shiftEndTime}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <select
          name="status"
          value={logData.status}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
        >
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>
        <textarea
          placeholder="Additional notes..."
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />

        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={updateLog}
            className="bg-green-600 px-4 py-2 rounded text-white text-sm"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditLogId(null);
              resetForm();
            }}
            className="bg-red-600 px-4 py-2 rounded text-white text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Auto-Save Status */}
      <div className="mt-6 text-sm text-gray-400 text-center">{autoSaveStatus}</div>
    
      {/* Previous Logs Section */}
      <h3 className="text-2xl font-bold text-blue-400 mt-8">📜 Previous Shift Logs</h3>
      {previousLogs.length > 0 ? (
  <div className="space-y-6 mt-4">
    {previousLogs.map((log) => (
      <div key={log._id} className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
        <p><strong>Shift Details:</strong> {log.shiftDetails}</p>
        <p><strong>Safety Issues:</strong> {log.safetyIssues}</p>
        <p><strong>Next Shift Tasks:</strong> {log.nextShiftTasks}</p>
        <p><strong>Status:</strong> {log.status}</p>
        <p><strong>Start Time:</strong> {log.shiftStartTime}</p>
        <p><strong>End Time:</strong> {log.shiftEndTime}</p>
        <p><strong>Notes:</strong> {log.notes}</p>

        {/* Optional file preview */}
        {log.fileUrl && (
          <div className="mt-2">
            <a
              href={log.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              View Attached File
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-4">
          <button
            onClick={() => editLog(log._id)}
            className="bg-yellow-600 px-3 py-1 rounded-lg hover:bg-yellow-700"
          >
            Edit
          </button>
          <button
            onClick={() => deleteLog(log._id)}
            className="bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-400 mt-4">No previous logs found.</p>
)}

    </div>
  );
    
};

export default ShiftHandoverLog;
