import { applyGlobalInterceptor } from '../../../../utils/apiInterceptor.js';
import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:8000/api', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
applyGlobalInterceptor(api);
api.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

export const aulaService = {
  getAll: async (search = '') => (await api.get(`/aulas?search=${search}`)).data,
  create: async (data) => (await api.post('/aulas', data)).data,
  update: async (id, data) => (await api.put(`/aulas/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/aulas/${id}`)).data,
};
