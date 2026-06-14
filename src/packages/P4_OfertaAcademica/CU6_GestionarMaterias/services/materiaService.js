import { applyGlobalInterceptor } from '../../../../utils/apiInterceptor.js';
import axios from 'axios';
const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api'), headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
applyGlobalInterceptor(api);
api.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

export const materiaService = {
  getAll: async (search = '') => (await api.get(`/materias?search=${search}`)).data,
  create: async (data) => (await api.post('/materias', data)).data,
  update: async (id, data) => (await api.put(`/materias/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/materias/${id}`)).data,
};
