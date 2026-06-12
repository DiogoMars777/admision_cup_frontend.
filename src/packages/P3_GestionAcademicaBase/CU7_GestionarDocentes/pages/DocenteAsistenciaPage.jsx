import { useState, useEffect } from 'react';
import { FileCheck, Users, Clock, MapPin, ChevronRight, AlertCircle, ArrowLeft, Calendar, Trash2, Edit, Eye, Save } from 'lucide-react';
import { docentePortalService } from '../services/docentePortalService';
import toast from 'react-hot-toast';

export default function DocenteAsistenciaPage() {
  const [view, setView] = useState('grupos'); // 'grupos', 'historial', 'form', 'detail'
  const [grupos, setGrupos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Historial y Asistencia actual
  const [historial, setHistorial] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [currentAsistencia, setCurrentAsistencia] = useState(null); // { id, fecha } o null para nuevo
  const [attendanceState, setAttendanceState] = useState({}); // { id_postulante: 'Presente' }

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { id: 1 };

  // Helper para obtener la fecha local correcta (Bolivia) en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const data = await docentePortalService.getDashboardData(user.id);
      setGrupos(data.grupos || []);
    } catch (e) {
      toast.error('Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (grupo) => {
    setSelectedGroup(grupo);
    await loadHistorial(grupo.id);
    setView('historial');
  };

  const loadHistorial = async (grupoMateriaId) => {
    try {
      setLoading(true);
      const data = await docentePortalService.getHistorialAsistencia(grupoMateriaId);
      setHistorial(data);
    } catch (e) {
      toast.error('Error al cargar historial de asistencias');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearAsistencia = async () => {
    // Validar si ya existe para hoy local
    const hoy = getLocalDateString();
    const existe = historial.find(h => h.fecha === hoy);
    
    if (existe) {
      toast.error('Ya existe una asistencia registrada para este grupo en la fecha seleccionada.');
      return;
    }

    try {
      setLoading(true);
      const data = await docentePortalService.getEstudiantesPorGrupo(selectedGroup.id);
      const ests = Array.isArray(data) ? data : (data.estudiantes || []);
      setEstudiantes(ests);
      
      // Default a todos presentes
      const initialState = {};
      ests.forEach(e => initialState[e.id] = 'Presente');
      setAttendanceState(initialState);
      
      setCurrentAsistencia(null);
      setView('form');
    } catch (e) {
      toast.error('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = async (asistencia) => {
    try {
      setLoading(true);
      const detalle = await docentePortalService.getDetalleAsistencia(asistencia.id);
      setEstudiantes(detalle.estudiantes);
      
      const state = {};
      detalle.estudiantes.forEach(e => state[e.id_postulante] = e.estado);
      setAttendanceState(state);
      
      setCurrentAsistencia(asistencia);
      setView('form');
    } catch (e) {
      toast.error('Error al cargar detalle');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (asistencia) => {
    try {
      setLoading(true);
      const detalle = await docentePortalService.getDetalleAsistencia(asistencia.id);
      setEstudiantes(detalle.estudiantes);
      
      const state = {};
      detalle.estudiantes.forEach(e => state[e.id_postulante] = e.estado);
      setAttendanceState(state);
      
      setCurrentAsistencia(asistencia);
      setView('detail');
    } catch (e) {
      toast.error('Error al cargar detalle');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta asistencia?')) return;
    try {
      setLoading(true);
      await docentePortalService.deleteAsistencia(id);
      toast.success('Asistencia eliminada');
      await loadHistorial(selectedGroup.id);
    } catch (e) {
      toast.error('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    try {
      setLoading(true);
      const payload = {
        fecha: currentAsistencia ? currentAsistencia.fecha : getLocalDateString(),
        estudiantes: estudiantes.map(e => ({
          id_postulante: e.id || e.id_postulante,
          estado: attendanceState[e.id || e.id_postulante]
        }))
      };

      if (currentAsistencia) {
        await docentePortalService.updateAsistencia(currentAsistencia.id, payload);
        toast.success('Asistencia actualizada correctamente');
      } else {
        await docentePortalService.createAsistencia(selectedGroup.id, payload);
        toast.success('Asistencia registrada correctamente');
      }
      
      await loadHistorial(selectedGroup.id);
      setView('historial');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al guardar asistencia');
    } finally {
      setLoading(false);
    }
  };

  // VISTAS
  if (loading && view === 'grupos') return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      {/* HEADER DINÁMICO */}
      {view === 'grupos' ? (
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-blue-600" />
            Mis grupos para asistencia
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Seleccione un grupo para registrar o revisar la asistencia.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('grupos')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Asistencia - {selectedGroup?.nombre.split(' - ')[0]}
            </h2>
            <p className="text-gray-500 text-sm">Gestione la asistencia del grupo seleccionado.</p>
          </div>
        </div>
      )}

      {/* VISTA 1: LISTA DE GRUPOS */}
      {view === 'grupos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.length === 0 ? (
            <p className="text-gray-500">No tienes grupos asignados.</p>
          ) : (
            grupos.map((grupo) => (
              <div 
                key={grupo.id} 
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-gray-800">{grupo.nombre}</h4>
                </div>
                
                <div className="space-y-4 mb-6 flex-1">
                  <div className="flex items-center text-sm font-medium bg-gray-50 rounded-lg p-3">
                    <Users className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{grupo.estudiantes} Estudiantes inscritos</span>
                  </div>
                  <div className="flex items-center text-sm font-medium bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                    <Clock className="w-5 h-5 mr-3 shrink-0 text-gray-400" />
                    <span className="text-gray-700 leading-tight">{grupo.horario}</span>
                  </div>
                  <div className="flex items-center text-sm font-medium bg-gray-50 rounded-lg p-3">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{grupo.aula}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleSelectGroup(grupo)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-bold transition-colors border border-blue-100 hover:border-blue-600"
                >
                  Ver asistencia <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* VISTA 2: DETALLE DEL GRUPO (HISTORIAL) */}
      {view === 'historial' && selectedGroup && (
        <div className="space-y-6">
          {/* Info del Grupo Seleccionado */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 font-medium">
                📚 {selectedGroup.nombre}
              </span>
              <span className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 font-medium">
                👥 {selectedGroup.estudiantes} inscritos
              </span>
              <span className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 font-medium">
                📍 {selectedGroup.aula}
              </span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCrearAsistencia}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-blue-200 transition-colors"
              >
                <Calendar className="w-5 h-5" /> Crear asistencia de hoy
              </button>
            </div>
          </div>

          {/* Historial Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Historial de Asistencias Registradas</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando historial...</div>
            ) : historial.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                No hay asistencias registradas para este grupo.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 font-bold">Fecha</th>
                    <th className="px-6 py-4 font-bold text-center">Total</th>
                    <th className="px-6 py-4 font-bold text-center text-emerald-600">Presentes</th>
                    <th className="px-6 py-4 font-bold text-center text-amber-600">Tardes</th>
                    <th className="px-6 py-4 font-bold text-center text-red-600">Faltas</th>
                    <th className="px-6 py-4 font-bold text-center">Estado</th>
                    <th className="px-6 py-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {historial.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {new Date(h.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{h.total_estudiantes}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-600">{h.presentes}</td>
                      <td className="px-6 py-4 text-center font-bold text-amber-600">{h.tardes}</td>
                      <td className="px-6 py-4 text-center font-bold text-red-600">{h.faltas}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                          {h.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleVerDetalle(h)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalle">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleEditar(h)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleEliminar(h.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VISTA 3: FORMULARIO (CREAR / EDITAR / DETALLE) */}
      {(view === 'form' || view === 'detail') && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {view === 'detail' ? 'Detalle de Asistencia' : currentAsistencia ? 'Editar Asistencia' : 'Nueva Asistencia'}
              </h3>
              <p className="text-sm text-gray-500">
                Fecha: {currentAsistencia ? currentAsistencia.fecha : getLocalDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setView('historial')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              {view === 'form' && (
                <button 
                  onClick={handleGuardar}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-blue-200 transition-colors"
                >
                  <Save className="w-5 h-5" /> Guardar Asistencia
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando estudiantes...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 font-bold">Estudiante</th>
                    <th className="px-6 py-4 font-bold text-center">Carnet (CI)</th>
                    <th className="px-6 py-4 font-bold text-center">Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {estudiantes.length === 0 ? (
                    <tr><td colSpan="3" className="p-8 text-center text-gray-500">No hay estudiantes en este grupo.</td></tr>
                  ) : (
                    estudiantes.map((e) => {
                      const id = e.id || e.id_postulante;
                      const status = attendanceState[id];
                      return (
                        <tr key={id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs shadow-sm">
                                {e.nombre.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-800">{e.nombre}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-500">
                            {e.ci}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {view === 'detail' ? (
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                                  status === 'Presente' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  status === 'Tarde' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {status}
                                </span>
                              ) : (
                                <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
                                  <button
                                    onClick={() => setAttendanceState(prev => ({...prev, [id]: 'Presente'}))}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                      status === 'Presente' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    Presente
                                  </button>
                                  <button
                                    onClick={() => setAttendanceState(prev => ({...prev, [id]: 'Tarde'}))}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                      status === 'Tarde' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    Tarde
                                  </button>
                                  <button
                                    onClick={() => setAttendanceState(prev => ({...prev, [id]: 'Falta'}))}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                      status === 'Falta' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    Falta
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
