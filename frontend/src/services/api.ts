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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet, and it's not the /login or /refresh endpoints
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      originalRequest.url !== '/login' && 
      originalRequest.url !== '/refresh'
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g. refresh token expired), redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
