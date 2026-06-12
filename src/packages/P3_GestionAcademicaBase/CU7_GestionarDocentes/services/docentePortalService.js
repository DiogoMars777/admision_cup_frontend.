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

export const docentePortalService = {
  getDashboardData,
  getEstudiantesPorGrupo,
  getMateriasHabilitadas
};
