// src/context/ResourceContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ResourceContext = createContext();

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([
    { id: 1, name: 'Coal', quantity: 50 },
    { id: 2, name: 'Water', quantity: 30 },
    { id: 3, name: 'Electricity', quantity: 15 },
    { id: 4, name: 'Labor', quantity: 5 },
  ]);

  return (
    <ResourceContext.Provider value={{ resources, setResources }}>
      {children}
    </ResourceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useResources = () => {
  return useContext(ResourceContext);
};
