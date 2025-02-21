// import React, { useState } from 'react';
// import axios from 'axios';

// // Modal Component for creating a coal mine
// const CreateCoalMineModal = ({ showModal, setShowModal }) => {
//   const [coalMine, setCoalMine] = useState({
//     name: '',
//     location: { latitude: '', longitude: '' },
//     workers: [{ name: '', role: 'miner', contact: '' }],
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCoalMine((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleLocationChange = (e) => {
//     const { name, value } = e.target;
//     setCoalMine((prev) => ({
//       ...prev,
//       location: { ...prev.location, [name]: value },
//     }));
//   };

//   const handleWorkerChange = (index, e) => {
//     const { name, value } = e.target;
//     const newWorkers = [...coalMine.workers];
//     newWorkers[index] = { ...newWorkers[index], [name]: value };
//     setCoalMine((prev) => ({ ...prev, workers: newWorkers }));
//   };

//   const addWorker = () => {
//     setCoalMine((prev) => ({
//       ...prev,
//       workers: [...prev.workers, { name: '', role: 'miner', contact: '' }],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('http://localhost:5000/api/createMines', coalMine);
//       alert('Coal Mine Created Successfully');
//       setShowModal(false); // Close the modal after successful submission
//     } catch (error) {
//       console.error('Error creating coal mine', error);
//       alert('Error creating coal mine');
//     }
//   };

//   return (
//     <div
//       className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center transition-opacity ${
//         showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'
//       }`}
//     >
//       <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//         <button
//           onClick={() => setShowModal(false)}
//           className="absolute top-4 right-4 text-gray-500"
//         >
//           &times;
//         </button>
//         <h2 className="text-2xl font-bold mb-4">Create a New Coal Mine</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700">Coal Mine Name</label>
//             <input
//               type="text"
//               name="name"
//               value={coalMine.name}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700">Latitude</label>
//             <input
//               type="number"
//               name="latitude"
//               value={coalMine.location.latitude}
//               onChange={handleLocationChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//               min="-90"
//               max="90"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700">Longitude</label>
//             <input
//               type="number"
//               name="longitude"
//               value={coalMine.location.longitude}
//               onChange={handleLocationChange}
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               required
//               min="-180"
//               max="180"
//             />
//           </div>
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold">Workers</h3>
//             {coalMine.workers.map((worker, index) => (
//               <div key={index} className="mb-4">
//                 <input
//                   type="text"
//                   name="name"
//                   value={worker.name}
//                   onChange={(e) => handleWorkerChange(index, e)}
//                   placeholder="Worker Name"
//                   className="w-full p-2 border border-gray-300 rounded-lg"
//                 />
//                 <select
//                   name="role"
//                   value={worker.role}
//                   onChange={(e) => handleWorkerChange(index, e)}
//                   className="w-full p-2 mt-2 border border-gray-300 rounded-lg"
//                 >
//                   <option value="miner">Miner</option>
//                   <option value="supervisor">Supervisor</option>
//                   <option value="engineer">Engineer</option>
//                 </select>
//                 <input
//                   type="text"
//                   name="contact"
//                   value={worker.contact}
//                   onChange={(e) => handleWorkerChange(index, e)}
//                   placeholder="Contact (Phone/Email)"
//                   className="w-full p-2 mt-2 border border-gray-300 rounded-lg"
//                   required
//                 />
//               </div>
//             ))}
//             <button type="button" onClick={addWorker} className="mt-2 text-blue-600">
//               Add Another Worker
//             </button>
//           </div>
//           <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg">
//             Create Coal Mine
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Main component that triggers the modal
// const CreateCoalMines = () => {
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <div>
//       <button
//         onClick={() => setShowModal(true)}
//         className="px-4 py-2 bg-green-600 text-white rounded-lg"
//       >
//         Create Coal Mine
//       </button>

//       {/* Modal */}
//       <CreateCoalMineModal showModal={showModal} setShowModal={setShowModal} />
//     </div>
//   );
// };

// export default CreateCoalMines;
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { XCircle, PlusCircle } from "lucide-react";

const CoalMineCards = () => {
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [selectedMine, setSelectedMine] = useState(null);
  const [mineForm, setMineForm] = useState({ name: "", location: { latitude: "", longitude: "" }, workers: [] });
  const [workerForm, setWorkerForm] = useState({ name: "", role: "", contact: "" });
  useEffect(() => {
    if (showWorkerModal && !selectedMine) {
      const storedMine = localStorage.getItem("selectedMine");
      if (storedMine) {
        setSelectedMine(JSON.parse(storedMine));
      }
    }
  }, [showWorkerModal]);
  
  
  useEffect(() => {
    fetchMines();
  }, []);

  const fetchMines = async () => {
    try {
      const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getallMines`);
      setMines(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/updateMine/${selectedMine._id}`, mineForm);
        alert("Coal Mine Updated Successfully");
      } else {
        await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/createMines`, mineForm);
        alert("Coal Mine Created Successfully");
      }
      setShowModal(false);
      fetchMines(); // Latest mines list fetch karo
    } catch (error) {
      alert("Error processing request");
    }
  };
  

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this mine?")) {
      try {
        await axios.delete(`https://${import.meta.env.VITE_BACKEND}/api/deleteMine/${id}`);
        alert("Coal Mine Deleted Successfully");
        fetchMines();
      } catch (error) {
        alert("Error deleting coal mine");
      }
    }
  };

  const handleEdit = (mine) => {
    setMineForm(mine);
    setSelectedMine(mine);
    setEditMode(true);
    setShowModal(true);
  };

  const handleWorkerChange = (field, value) => {
    setWorkerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddWorker = async () => {
    let mineToUpdate = selectedMine;
  
    if (!mineToUpdate) {
      const storedMine = localStorage.getItem("selectedMine");
      if (storedMine) {
        mineToUpdate = JSON.parse(storedMine);
        setSelectedMine(mineToUpdate);  // Ensure React state is updated
      }
    }
  
    console.log("🔍 Selected Mine before adding worker:", mineToUpdate);
  
    if (!mineToUpdate || !mineToUpdate._id) {
      alert("⚠️ No mine selected for adding a worker.");
      return;
    }
  
    try {
      const updatedMine = { 
        ...mineToUpdate, 
        workers: [...(mineToUpdate.workers || []), workerForm] 
      };
  
      console.log("🚀 Updated Mine Data before API call:", updatedMine);
  
      await axios.put(`https://${import.meta.env.VITE_BACKEND}/api/updateMine/${mineToUpdate._id}`, updatedMine);
  
      alert("✅ Worker added successfully!");
      setShowWorkerModal(false);
      setWorkerForm({ name: "", role: "", contact: "" });
  
      fetchMines();
    } catch (error) {
      alert("❌ Error adding worker: " + error.message);
      console.error(error);
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setMineForm({ name: "", location: { latitude: "", longitude: "" }, workers: [] });
          }}
        >
          <PlusCircle size={18} /> Create New Mine
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mines.map((mine) => (
            <motion.div
              key={mine._id}
              className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold mb-2">{mine.name}</h2>
              <p className="text-sm mb-2">
                Location: {mine.location.latitude}, {mine.location.longitude}
              </p>
              <h3 className="text-lg font-semibold text-gray-300">Workers:</h3>
              {mine.workers.length > 0 ? (
                mine.workers.map((worker, index) => (
                  <div key={index} className="mb-2 border-b border-gray-700 pb-2">
                    <p>Name: {worker.name}</p>
                    <p>Role: {worker.role}</p>
                    <p>Contact: {worker.contact}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No workers assigned.</p>
              )}
            <button 
  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg" 
  onClick={() => {
    setSelectedMine(mine);  
    localStorage.setItem("selectedMine", JSON.stringify(mine));

    setTimeout(() => {  // Delay opening modal to ensure state updates
      setShowWorkerModal(true);
    }, 50);
  }}
>
  + Add Worker
</button>


              <div className="flex gap-2 mt-4">
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg" onClick={() => handleEdit(mine)}>
                  Edit
                </button>
                <button className="w-full py-2 px-4 bg-red-600 text-white rounded-lg" onClick={() => handleDelete(mine._id)}>
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
{/* Modal for Adding Worker */}
{showWorkerModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <motion.div
      className="bg-gray-800 p-6 rounded-lg w-96 relative"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowWorkerModal(false)}>
        <XCircle size={20} />
      </button>
      <h2 className="text-xl font-bold mb-4">Add Worker</h2>
      <input
        type="text"
        placeholder="Worker Name"
        className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        value={workerForm.name}
        onChange={(e) => handleWorkerChange("name", e.target.value)}
      />
      <input
        type="text"
        placeholder="Role"
        className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        value={workerForm.role}
        onChange={(e) => handleWorkerChange("role", e.target.value)}
      />
      <input
        type="text"
        placeholder="Contact"
        className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
        value={workerForm.contact}
        onChange={(e) => handleWorkerChange("contact", e.target.value)}
      />
      <button className="w-full py-2 bg-green-600 text-white rounded-lg" onClick={handleAddWorker}>
        Add Worker
      </button>
    </motion.div>
  </div>
)}

      {/* Modal for Creating/Editing Mine */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 p-6 rounded-lg w-96 relative"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowModal(false)}>
              <XCircle size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">{editMode ? "Edit Mine" : "Create Mine"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Mine Name"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                value={mineForm.name}
                onChange={(e) => setMineForm({ ...mineForm, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Latitude"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                value={mineForm.location.latitude}
                onChange={(e) => setMineForm({ ...mineForm, location: { ...mineForm.location, latitude: e.target.value } })}
              />
              <input
                type="text"
                placeholder="Longitude"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                value={mineForm.location.longitude}
                onChange={(e) => setMineForm({ ...mineForm, location: { ...mineForm.location, longitude: e.target.value } })}
              />
              <button type="submit" className="w-full py-2 mt-2 bg-green-600 text-white rounded-lg">
                Save
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CoalMineCards;
