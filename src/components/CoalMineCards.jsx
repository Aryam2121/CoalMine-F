// import React, { useState } from 'react';
// // // Modal Component for creating a coal mine
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
//       await api.post('http://localhost:5000/api/createMines', coalMine);
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
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/axios";
import PageShell from "./ui/PageShell";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import { XCircle, PlusCircle } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/roles";

const CoalMineCards = () => {
  const { can } = usePermissions();
  const canWrite = can(PERMISSIONS.COAL_MINE_WRITE);
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
  }, [showWorkerModal, selectedMine]);
  
  
  useEffect(() => {
    fetchMines();
  }, []);

  const fetchMines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/getallMines');
      setMines(response.data?.data ?? response.data ?? []);
    } catch (err) {
      const msg =
        err.code === 'ERR_NETWORK'
          ? 'Cannot reach the server. Start the backend (port 3000) or check VITE_BACKEND in .env.'
          : err.response?.data?.message || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/updateMine/${selectedMine._id}`, mineForm);
        alert("Coal Mine Updated Successfully");
      } else {
        await api.post('/createMines', mineForm);
        alert("Coal Mine Created Successfully");
      }
      setShowModal(false);
      fetchMines(); // Latest mines list fetch karo
    } catch (_error) {
      alert("Error processing request");
    }
  };
  

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this mine?")) {
      try {
        await api.delete(`/deleteMine/${id}`);
        alert("Coal Mine Deleted Successfully");
        fetchMines();
      } catch (_error) {
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
  
    if (!mineToUpdate || !mineToUpdate._id) {
      alert("⚠️ No mine selected for adding a worker.");
      return;
    }
  
    try {
      const updatedMine = { 
        ...mineToUpdate, 
        workers: [...(mineToUpdate.workers || []), workerForm] 
      };
  
      await api.put(`/updateMine/${mineToUpdate._id}`, updatedMine);
  
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
    <PageShell
      title="Coal Mines"
      subtitle="Manage mine sites, locations, and assigned workers"
      action={
        canWrite ? (
          <Button variant="success" onClick={() => {
              setShowModal(true);
              setEditMode(false);
              setMineForm({ name: "", location: { latitude: "", longitude: "" }, workers: [] });
            }}>
            <PlusCircle size={18} /> New mine
          </Button>
        ) : null
      }
    >
      {loading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner" /></div>
      ) : error ? (
        <EmptyState icon="⚠️" title="Could not load mines" message={error} />
      ) : mines.length === 0 ? (
        <EmptyState icon="⛏" title="No coal mines yet" message={canWrite ? 'Create your first mine to get started.' : 'No mines registered yet.'} action={
          canWrite ? <Button onClick={() => setShowModal(true)}>Create mine</Button> : null
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mines.map((mine) => (
            <Card
              key={mine._id}
              className="!p-0 overflow-hidden border-slate-200 dark:border-slate-700"
            >
              <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
              <div className="p-5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{mine.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                📍 {mine.location?.latitude}, {mine.location?.longitude}
              </p>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Workers</h3>
              {(mine.workers?.length ?? 0) > 0 ? (
                (mine.workers ?? []).map((worker, index) => (
                  <div key={index} className="mb-2 border-b border-gray-700 pb-2">
                    <p>Name: {worker.name}</p>
                    <p>Role: {worker.role}</p>
                    <p>Contact: {worker.contact}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No workers assigned.</p>
              )}
            {canWrite && (
              <button
                type="button"
                className="mt-2 btn-primary !py-1.5 !px-3 !text-xs"
                onClick={() => {
                  setSelectedMine(mine);
                  localStorage.setItem("selectedMine", JSON.stringify(mine));
                  setTimeout(() => setShowWorkerModal(true), 50);
                }}
              >
                + Add Worker
              </button>
            )}

              {canWrite && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Button variant="secondary" className="flex-1 !py-2" onClick={() => handleEdit(mine)}>Edit</Button>
                <Button variant="danger" className="flex-1 !py-2" onClick={() => handleDelete(mine._id)}>Delete</Button>
              </div>
              )}
              </div>
            </Card>
          ))}
        </div>
      )}


      {/* Modal for Creating/Editing Mine */}
      {showModal && (
  <div className="modal-overlay">
    <motion.div
      className="modal-panel !max-w-md relative dark:bg-slate-900"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-red-400 transition-transform transform hover:scale-110"
        onClick={() => setShowModal(false)}
      >
        <XCircle size={24} />
      </button>

      <h2 className="text-2xl font-semibold text-white mb-5">
        {editMode ? "Edit Mine" : "Create Mine"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Mine Name"
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-yellow-400 outline-none"
          value={mineForm.name}
          onChange={(e) => setMineForm({ ...mineForm, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Latitude"
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-yellow-400 outline-none"
          value={mineForm.location.latitude}
          onChange={(e) =>
            setMineForm({ ...mineForm, location: { ...mineForm.location, latitude: e.target.value } })
          }
        />
        <input
          type="text"
          placeholder="Longitude"
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-yellow-400 outline-none"
          value={mineForm.location.longitude}
          onChange={(e) =>
            setMineForm({ ...mineForm, location: { ...mineForm.location, longitude: e.target.value } })
          }
        />
        <button
          type="submit"
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-green-400"
        >
          Save
        </button>
      </form>
    </motion.div>
  </div>
)}

{/* Modal for Adding Worker */}
{showWorkerModal && (
  <div className="modal-overlay">
    <motion.div
      className="modal-panel !max-w-md relative dark:bg-slate-900"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-red-400 transition-transform transform hover:scale-110"
        onClick={() => setShowWorkerModal(false)}
      >
        <XCircle size={24} />
      </button>

      <h2 className="text-2xl font-semibold text-white mb-5">Add Worker</h2>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Worker Name"
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400 outline-none"
          value={workerForm.name}
          onChange={(e) => handleWorkerChange("name", e.target.value)}
        />
        <input
          type="text"
          placeholder="Role"
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400 outline-none"
          value={workerForm.role}
          onChange={(e) => handleWorkerChange("role", e.target.value)}
        />
        <input
          type="text"
          placeholder="Contact"
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400 outline-none"
          value={workerForm.contact}
          onChange={(e) => handleWorkerChange("contact", e.target.value)}
        />
        <button
          type="button"
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-green-400"
          onClick={(e) => {
            e.preventDefault();
            handleAddWorker();
          }}
        >
          Add Worker
        </button>
      </form>
    </motion.div>
  </div>
)}
    </PageShell>
  );
}
export default CoalMineCards;
