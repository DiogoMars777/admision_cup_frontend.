import { applyGlobalInterceptor } from '../../../../utils/apiInterceptor.js';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
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

export const usuarioService = {
  getAll: async (search = '') => {
    const res = await api.get(`/usuarios?search=${search}`);
    return res.data;
  },
  getRoles: async () => {
    const res = await api.get('/roles');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/usuarios', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/usuarios/${id}`, data);
    return res.data;
  },
  toggleStatus: async (id) => {
    const res = await api.patch(`/usuarios/${id}/status`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/usuarios/${id}`);
    return res.data;
  }
};
