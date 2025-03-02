// src/services/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: `https://${import.meta.env.VITE_BACKEND}/api`, // Replace with your backend API base URL
  // Add headers or interceptors if needed
});

export default instance;
