import axios from 'axios';

// The backend runs on port 5000 based on .env, but we use environment variables for deployment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
