// components/ProtectedRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';  // Assuming you're storing login state here

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext); // This should come from your context

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;  // If authenticated, render the children (protected components)
};

export default ProtectedRoute;
