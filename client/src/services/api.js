import axios from 'axios';

const defaultUrl = `http://${window.location.hostname}:5000/api`;
const API_URL = import.meta.env.VITE_API_URL || defaultUrl;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
