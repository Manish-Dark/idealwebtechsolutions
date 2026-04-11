import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Add a request interceptor to automatically add the auth token if available
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('userInfo');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
    }
  }
  return config;
});

export default api;
