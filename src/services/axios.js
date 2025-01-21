// src/services/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your backend API base URL
  // Add headers or interceptors if needed
});

export default instance;
