import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/online_school/api',
  timeout: 30000,
});

export const FILE_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : '/online_school';


// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/online_school/login') {
        window.location.href = '/online_school/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
