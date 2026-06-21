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
    
    // Check if the request is for an authentication endpoint
    const isAuthEndpoint = originalRequest.url && (
      originalRequest.url.endsWith('/login') ||
      originalRequest.url.endsWith('/adminLogin') ||
      originalRequest.url.endsWith('/refresh')
    );

    // If the error is 401 and we haven't retried yet, and it's not an auth endpoint
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g. refresh token expired)
        // Only redirect to login if we are not already on a public route to prevent redirect loops
        const publicRoutes = ['/', '/login', '/adminLogin', '/register', '/forgot-password'];
        const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
        
        if (!publicRoutes.includes(currentPath)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
