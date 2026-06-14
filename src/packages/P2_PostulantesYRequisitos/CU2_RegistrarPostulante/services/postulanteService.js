import { applyGlobalInterceptor } from '../../../../utils/apiInterceptor.js';
import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
applyGlobalInterceptor(api);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const postulanteService = {
  getAll: async (search = '') => {
    const res = await api.get(`/postulantes?search=${search}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/postulantes', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/postulantes/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/postulantes/${id}`);
    return res.data;
  }
};
