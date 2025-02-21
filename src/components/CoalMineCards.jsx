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
import axios from "axios";

const CoalMineCards = () => {
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newMine, setNewMine] = useState({
    name: "",
    location: { latitude: 0, longitude: 0 }, // Initialize location as an object
    workers: [],
  });

  // Fetch existing coal mines
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getallMines`);
        console.log(response.data); // Inspect the structure of the data
        setMines(response.data.data); // Accessing the 'data' property which contains the array of mines
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleCreateMine = async (coalMine) => {
    try {
      await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/createMines`, coalMine);
      alert('Coal Mine Created Successfully');
      setShowModal(false); // Close the modal after successful submission
    } catch (error) {
      console.error('Error creating coal mine', error);
      alert('Error creating coal mine');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setNewMine((prevState) => ({
      ...prevState,
      location: {
        ...prevState.location,
        [name]: value,
      },
    }));
  };

  const handleWorkerChange = (index, e) => {
    const { name, value } = e.target;
    const newWorkers = [...newMine.workers];
    newWorkers[index] = { ...newWorkers[index], [name]: value };
    setNewMine((prev) => ({ ...prev, workers: newWorkers }));
  };

  const addWorker = () => {
    setNewMine((prev) => ({
      ...prev,
      workers: [...prev.workers, { name: '', role: 'miner', contact: '' }],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
          onClick={() => setShowModal(true)}
        >
          Create New Mine
        </button>
        <input
          type="text"
          placeholder="Search mine..."
          className="p-2 bg-gray-800 text-white rounded-lg"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(mines) && mines.map((mine) => (
          <div key={mine._id} className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{mine.name}</h2>
              <span className="px-2 py-1 text-sm bg-green-500 rounded-full">
                {mine.deleted ? "Inactive" : "Active"}
              </span>
            </div>
            <p className="mb-2 text-sm">
              <span className="font-semibold">Location:</span> Latitude: {mine.location.latitude}, Longitude: {mine.location.longitude}
            </p>
            <p className="mb-2 text-sm">
              <span className="font-semibold">Created At:</span> {new Date(mine.createdAt).toLocaleDateString()}
            </p>
            <p className="mb-2 text-sm">
              <span className="font-semibold">Updated At:</span> {new Date(mine.updatedAt).toLocaleDateString()}
            </p>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Workers:</h3>
              {mine.workers.map((worker, index) => (
                <div key={index} className="mb-2">
                  <p><span className="font-semibold">Name:</span> {worker.name}</p>
                  <p><span className="font-semibold">Role:</span> {worker.role}</p>
                  <p><span className="font-semibold">Contact:</span> {worker.contact}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Modal for creating a new mine */}
      {showModal && (
        <div className="opacity-100 fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg w-96">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-100"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Create a New Coal Mine</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateMine(newMine);
            }}>
              <div className="mb-4">
                <label className="block text-gray-300">Coal Mine Name</label>
                <input
                  type="text"
                  name="name"
                  value={newMine.name}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={newMine.location.latitude}
                  onChange={handleLocationChange}
                  className="w-full p-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
                  required
                />
                <label className="block text-gray-300 mt-2">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={newMine.location.longitude}
                  onChange={handleLocationChange}
                  className="w-full p-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Workers</h3>
                {newMine.workers.map((worker, index) => (
                  <div key={index} className="mb-4">
                    <input
                      type="text"
                      name="name"
                      value={worker.name}
                      onChange={(e) => handleWorkerChange(index, e)}
                      placeholder="Worker Name"
                      className="w-full p-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
                    />
                    <select
                      name="role"
                      value={worker.role}
                      onChange={(e) => handleWorkerChange(index, e)}
                      className="w-full p-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
                    >
                      <option value="miner">Miner</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="engineer">Engineer</option>
                    </select>
                    <input
                      type="text"
                      name="contact"
                      value={worker.contact}
                      onChange={(e) => handleWorkerChange(index, e)}
                      placeholder="Contact (Phone/Email)"
                      className="w-full p-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
                      required
                    />
                  </div>
                ))}
                <button type="button" onClick={addWorker} className="mt-2 text-blue-600 hover:text-blue-400">
                  Add Another Worker
                </button>
              </div>
              <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
                Create Coal Mine
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoalMineCards;
