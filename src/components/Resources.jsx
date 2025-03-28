import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineSortAscending,
  AiOutlineSortDescending,
  AiOutlineUndo,
  AiOutlineBulb,
} from 'react-icons/ai';
import axios from 'axios';
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const getRandomColor = (index) => COLORS[index % COLORS.length];

const Resource = ({ id, name, used, available, onDelete, onEdit, color }) => {
  const data = [
    { name: 'Used', value: isNaN(used) ? 0 : used },
    { name: 'Available', value: isNaN(available) ? 0 : available },
  ];
  

  return (
    <motion.div
      className="border p-4 mb-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 flex justify-between items-center bg-opacity-90"
      style={{ backgroundColor: `${color}20` }}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div>
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Used: {used}%</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">Available: {available}%</p>
        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5 mt-2">
          <div
            className="h-2.5 rounded-full"
            style={{ width: `${used}%`, backgroundColor: color }} 
          ></div>
        </div>
      </div>

      <PieChart width={80} height={80}>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={35}>
          {data.map((entry, index) => (
           <Cell key={`cell-${index}`} fill={index === 0 ? color : '#d3d3d3'} />
          ))}
        </Pie>
      </PieChart>

      <div className="flex gap-2">
        <button onClick={() => onEdit(id)} className="text-blue-500 hover:text-blue-700 transition">
          <AiOutlineEdit size={20} />
        </button>
        <button onClick={() => onDelete(id)} className="text-red-500 hover:text-red-700 transition">
          <AiOutlineDelete size={20} />
        </button>
      </div>
    </motion.div>
  );
};

// Main Resources Component
const Resources = () => {
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ name: '', used: '', available: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [darkMode, setDarkMode] = useState(false);
  const [deletedResource, setDeletedResource] = useState(null);

  useEffect(() => {
    axios.get(`https://${import.meta.env.VITE_BACKEND}/api/getAllRes`)
      .then((response) => {
        console.log('Fetched resources:', response.data); // Debugging
        if (Array.isArray(response.data)) {
          setResources(response.data);
        } else {
          console.error('Unexpected response format:', response);
        }
      })
      .catch((error) => {
        console.error('Error fetching resources:', error);
      });
  }, []);
  
  
  
  const handleAddResource = () => {
    const { name, used, available } = newResource;
    const usedValue = newResource.used ? parseFloat(newResource.used) : 0;
    const availableValue = newResource.available ? parseFloat(newResource.available) : 0;
    

    if (!name || isNaN(usedValue) || isNaN(availableValue) || usedValue < 0 || availableValue < 0 || Math.round(usedValue + availableValue) !== 100) {

        alert('Invalid input. Ensure Used + Available = 100.');
        return;
    }

    const resourceData = {
      name,
      used: parseInt(used),
      available: parseInt(available),
    };

    if (editingId) {
      axios.put(`https://${import.meta.env.VITE_BACKEND}/api/${editingId}`, resourceData)
        .then((response) => {
          setResources(resources.map((resource) =>
            resource._id === editingId ? response.data : resource
          ));
          setEditingId(null);
        })
        .catch((error) => console.error('Error updating resource:', error));
    } else {
      axios.post(`https://${import.meta.env.VITE_BACKEND}/api/addRes`, resourceData)
        .then((response) => {
          setResources([...resources, response.data]);
        })
        .catch((error) => console.error('Error adding resource:', error));
    }

    setNewResource({ name: '', used: '', available: '' });
  };

  const handleDeleteResource = (id) => {
    const resourceToDelete = resources.find((resource) => resource._id === id);
    setDeletedResource(resourceToDelete);
    axios.delete(`https://${import.meta.env.VITE_BACKEND}/api/${id}`)
      .then(() => {
        setResources(resources.filter((resource) => resource._id !== id));
      })
      .catch((error) => console.error('Error deleting resource:', error));
  };
  

  const handleUndoDelete = () => {
    if (deletedResource) {
      axios.post(`https://${import.meta.env.VITE_BACKEND}/api/addRes`, deletedResource)
        .then(() => {
          setResources([...resources, deletedResource]);
          setDeletedResource(null);
        })
        .catch((error) => console.error('Error undoing delete:', error));
    }
  };

  const handleEditResource = (id) => {
    const resourceToEdit = resources.find((resource) => resource._id === id);

    setNewResource(resourceToEdit);
    setEditingId(id);
  };

  const handleSortResources = () => {
    const sorted = [...resources].sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
    setResources(sorted);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredResources = resources.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(resources);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setResources(items);
  };


  return (
    <div className={`min-h-screen text-black`}>


    
      <motion.div
        className="w-full min-h-screen bg-gray-800  p-12 rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Resources</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-300 dark:bg-gray-700 p-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            <AiOutlineBulb size={20} />
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-3/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSortResources}
            className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition"
          >
            {sortOrder === 'asc' ? (
              <AiOutlineSortAscending size={20} />
            ) : (
              <AiOutlineSortDescending size={20} />
            )}
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Resource Name"
            value={newResource.name}
            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Used (%)"
            value={newResource.used}
            onChange={(e) => setNewResource({ ...newResource, used: e.target.value })}
            className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Available (%)"
            value={newResource.available}
            onChange={(e) => setNewResource({ ...newResource, available: e.target.value })}
            className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddResource}
            className="bg-blue-500 text-gray-100 px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {editingId ? 'Update' : 'Add'} <AiOutlinePlus className="inline" />
          </button>
        </div>

        {deletedResource && (
          <motion.div
            className="mb-4 p-4 bg-yellow-100 rounded-md shadow flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span>Resource "{deletedResource.name}" deleted.</span>
            <button
              onClick={handleUndoDelete}
              className="text-blue-500 hover:text-blue-700"
            >
              Undo <AiOutlineUndo className="inline" />
            </button>
          </motion.div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="resources">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
          {filteredResources.map((resource, index) =>
  resource && resource._id ? (
    <Draggable key={resource._id} draggableId={resource._id.toString()} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <Resource
            id={resource._id}
            name={resource.name}
            used={resource.used}
            available={resource.available}
            onDelete={handleDeleteResource}
            onEdit={handleEditResource}
            color={getRandomColor(index)}
          />
        </div>
      )}
    </Draggable>
  ) : console.error("Invalid resource:", resource) // Debugging
)}




                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </motion.div>
    </div>
  );
};

export default Resources;
