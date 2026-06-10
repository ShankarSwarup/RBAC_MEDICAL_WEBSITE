import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the JWT token securely
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Graceful 401/403 Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized: Token expired or invalid
      console.error("Unauthorized: Redirecting to login...");
      localStorage.removeItem('access_token');
      window.location.href = '/login'; 
    } else if (error.response && error.response.status === 403) {
      // Forbidden: Wrong Role
      console.error("Forbidden: You lack permissions for this action.");
      alert("Access Denied: You do not have permission to view this.");
    }
    return Promise.reject(error);
  }
);

export default api;
