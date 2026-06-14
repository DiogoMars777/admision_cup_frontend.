import { applyGlobalInterceptor } from '../../../../utils/apiInterceptor.js';
import axios from 'axios';
const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api'), headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
applyGlobalInterceptor(api);
api.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const carreraService = {
  getAll: async (search = '') => {
    const response = await api.get(`/carreras${search ? `?search=${search}` : ''}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/carreras', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/carreras/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/carreras/${id}`);
    return response.data;
  }
};

export default carreraService;
