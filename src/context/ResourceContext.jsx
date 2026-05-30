import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/axios';

const ResourceContext = createContext();

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const { data } = await api.get('/getAllRes');
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('ResourceContext fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <ResourceContext.Provider value={{ resources, setResources, loading, refreshResources: fetchResources }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => useContext(ResourceContext);
