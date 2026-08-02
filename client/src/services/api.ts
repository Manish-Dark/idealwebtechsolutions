import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://idealwebtechsolutions.onrender.com';

const api = axios.create({
  baseURL: rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
