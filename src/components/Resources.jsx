import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from "recharts";

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
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const getRandomColor = (index) => COLORS[index % COLORS.length];

const Resource = ({ id, name, used, available, onDelete, onEdit, color }) => {
  const data = [
    { name: "Used", value: isNaN(used) ? 0 : used },
    { name: "Available", value: isNaN(available) ? 0 : available },
  ];

  return (
    <motion.div
      className="border p-5 rounded-xl shadow-xl bg-opacity-70 backdrop-blur-lg 
                 hover:shadow-2xl transition duration-300 flex justify-between items-center 
                 relative overflow-hidden transform hover:scale-[1.03] hover:rotate-1"
      style={{
        background: `linear-gradient(135deg, ${color}40, #ffffff20)`,
        borderColor: `${color}70`,
        boxShadow: `0px 4px 20px ${color}30`,
      }}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Glow Effect */}
      <div
        className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-xl opacity-30"
        style={{ backgroundColor: `${color}` }}
      />

      {/* Left Content */}
      <div className="w-2/3">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{name}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Used: <span className="font-semibold">{used}%</span>
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Available: <span className="font-semibold">{available}%</span>
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5 mt-2 relative overflow-hidden">
          <motion.div
            className="h-2.5 rounded-full absolute left-0 top-0"
            style={{
              width: `${used}%`,
              background: `linear-gradient(90deg, ${color}, #ffffff60)`,
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${used}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Pie Chart */}
      <PieChart width={90} height={90} className="transform hover:scale-105 transition">
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={35} animationDuration={500}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? color : "#d3d3d3"} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: "#1E293B", color: "#fff", borderRadius: "8px" }} />
      </PieChart>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-3">
        <button
          onClick={() => onEdit(id)}
          className="text-blue-500 hover:text-blue-700 transition transform hover:scale-110"
        >
          <AiOutlineEdit size={22} />
        </button>
        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700 transition transform hover:scale-110"
        >
          <AiOutlineDelete size={22} />
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
          <h2 className="text-2xl font-bold text-white">Manage Resources</h2>
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
            <span>Resource  {deletedResource.name} deleted.</span>
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
    <div 
      {...provided.droppableProps} 
      ref={provided.innerRef} 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {filteredResources.map((resource, index) =>
        resource && resource._id ? (
          <Draggable key={resource._id} draggableId={resource._id.toString()} index={index}>
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.draggableProps} 
                {...provided.dragHandleProps}
              >
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
        ) : console.error("Invalid resource:", resource) 
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
