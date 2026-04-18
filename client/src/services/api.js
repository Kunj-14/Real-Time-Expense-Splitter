import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.');
const defaultUrl = isLocal ? `http://${window.location.hostname}:5000/api` : '/api';
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
