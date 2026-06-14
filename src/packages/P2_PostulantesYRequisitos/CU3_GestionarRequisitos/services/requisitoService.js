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

export const requisitoService = {
  // --- Catálogo ---
  getCatalogo: async () => {
    const res = await api.get(`/catalogo-requisitos`);
    return res.data;
  },
  createCatalogo: async (data) => {
    const res = await api.post('/catalogo-requisitos', data);
    return res.data;
  },
  updateCatalogo: async (id, data) => {
    const res = await api.put(`/catalogo-requisitos/${id}`, data);
    return res.data;
  },
  deleteCatalogo: async (id) => {
    const res = await api.delete(`/catalogo-requisitos/${id}`);
    return res.data;
  },

  // --- Asignaciones a Materias ---
  getMateriaRequisitos: async (materiaId) => {
    const res = await api.get(`/materias/${materiaId}/requisitos`);
    return res.data;
  },
  syncMateriaRequisitos: async (materiaId, asignaciones) => {
    const res = await api.post(`/materias/${materiaId}/requisitos`, { asignaciones });
    return res.data;
  },

  // --- Enlaces a Postulantes ---
  getAll: async (search = '') => {
    const res = await api.get(`/requisitos?search=${search}`);
    return res.data;
  },
  enlazar: async (data) => {
    const res = await api.post('/requisitos', data);
    return res.data;
  },
  updateEstado: async (id, estado, observacion = '') => {
    const res = await api.patch(`/requisitos/${id}/estado`, { estado, observacion });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/requisitos/${id}`);
    return res.data;
  }
};
