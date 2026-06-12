import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getDashboardData = async (idDocente) => {
  try {
    const response = await api.get('/docente-portal/dashboard', {
      params: { id_docente: idDocente }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getEstudiantesPorGrupo = async (grupoId) => {
  try {
    const response = await api.get(`/docente-portal/grupos/${grupoId}/estudiantes`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getMateriasHabilitadas = async () => {
  try {
    const response = await api.get('/docente-portal/materias');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getHistorialAsistencia = async (grupoMateriaId) => {
  try {
    const response = await api.get(`/docente-portal/grupos/${grupoMateriaId}/asistencias`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createAsistencia = async (grupoMateriaId, payload) => {
  try {
    const response = await api.post(`/docente-portal/grupos/${grupoMateriaId}/asistencias`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getDetalleAsistencia = async (asistenciaId) => {
  try {
    const response = await api.get(`/docente-portal/asistencias/${asistenciaId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateAsistencia = async (asistenciaId, payload) => {
  try {
    const response = await api.put(`/docente-portal/asistencias/${asistenciaId}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteAsistencia = async (asistenciaId) => {
  try {
    const response = await api.delete(`/docente-portal/asistencias/${asistenciaId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const guardarNotas = async (idGrupoMateria, notasData) => {
  try {
    const response = await api.post(`/docente-portal/grupos/${idGrupoMateria}/notas`, { notas: notasData });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const docentePortalService = {
  getDashboardData,
  getEstudiantesPorGrupo,
  getMateriasHabilitadas,
  getHistorialAsistencia,
  createAsistencia,
  getDetalleAsistencia,
  updateAsistencia,
  deleteAsistencia,
  guardarNotas
};
