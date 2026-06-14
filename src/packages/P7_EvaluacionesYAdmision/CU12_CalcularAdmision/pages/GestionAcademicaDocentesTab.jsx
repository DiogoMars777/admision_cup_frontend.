import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UsersRound, BookOpen, Clock, CalendarDays, CheckCircle2, ShieldCheck, Info, X, MapPin, Search, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API = 'http://localhost:8000/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function GestionAcademicaDocentesTab({ gestionId }) {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [stats, setStats] = useState({
    total_disponibles: 0,
    docentes_asignados: 0,
    grupos_habilitados: 0,
    materias_programadas: 0,
    asignaciones_activas: 0
  });
  
  const [asignaciones, setAsignaciones] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedDocente, setSelectedDocente] = useState('');
  const [horarioInfo, setHorarioInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  useEffect(() => {
    fetchData();
    fetchGrupos();
  }, [gestionId]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API}/gestiones-academicas/${gestionId}/asignaciones-docentes/resumen`, { headers: getHeaders() });
      setStats(data.stats);
      setAsignaciones(data.asignaciones);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar datos de asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupos = async () => {
    try {
      const { data } = await axios.get(`${API}/gestiones-academicas/${gestionId}/asignaciones-docentes/grupos`, { headers: getHeaders() });
      setGrupos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGrupoChange = async (e) => {
    const grupoId = e.target.value;
    setSelectedGrupo(grupoId);
    setSelectedMateria('');
    setSelectedDocente('');
    setHorarioInfo(null);
    setMaterias([]);
    setDocentes([]);

    if (grupoId) {
      try {
        const { data } = await axios.get(`${API}/gestiones-academicas/asignaciones-docentes/grupos/${grupoId}/materias`, { headers: getHeaders() });
        setMaterias(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleMateriaChange = async (e) => {
    const gmId = e.target.value;
    setSelectedMateria(gmId);
    setSelectedDocente('');
    setDocentes([]);
    
    if (gmId) {
      const materiaSelect = materias.find(m => m.id_grupo_materia == gmId);
      setHorarioInfo(materiaSelect);
      
      try {
        const { data } = await axios.get(`${API}/gestiones-academicas/asignaciones-docentes/materias/${materiaSelect.id_materia}/docentes`, { headers: getHeaders() });
        setDocentes(data);
      } catch (e) {
        console.error(e);
      }
    } else {
      setHorarioInfo(null);
    }
  };

  const handleAsignar = async () => {
    if (!selectedGrupo || !selectedMateria || !selectedDocente) {
      return toast.error('Por favor complete todos los campos');
    }

    setProcesando(true);
    try {
      await axios.post(`${API}/gestiones-academicas/${gestionId}/grupo-materia/${selectedMateria}/asignar-docente`, {
        id_docente: selectedDocente
      }, { headers: getHeaders() });
      
      toast.success('Docente asignado correctamente.');
      
      // Limpiar formulario y recargar
      setSelectedGrupo('');
      setSelectedMateria('');
      setSelectedDocente('');
      setHorarioInfo(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al asignar docente');
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (gmId) => {
    if (!window.confirm('¿Seguro que desea quitar la asignación del docente para esta materia?')) return;
    
    try {
      await axios.delete(`${API}/gestiones-academicas/${gestionId}/grupo-materia/${gmId}/quitar-docente`, { headers: getHeaders() });
      toast.success('Docente quitado correctamente.');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al quitar docente');
    }
  };

  const handleAsignacionAutomatica = async () => {
    if (!window.confirm('¿Está seguro de ejecutar la asignación automática? Esto asignará docentes a todas las materias pendientes siguiendo las reglas establecidas.')) return;
    
    setIsAutoAssigning(true);
    try {
      const { data } = await axios.post(`${API}/gestiones-academicas/${gestionId}/asignaciones-docentes/automatica`, {}, { headers: getHeaders() });
      toast.success(data.message || 'Asignación automática exitosa');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error en asignación automática');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Cargando datos...</div>;

  return (
    <div className="space-y-6">
      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center items-center text-center">
          <UsersRound className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-xs text-gray-500 font-semibold mb-1">Total docentes disponibles</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total_disponibles}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center items-center text-center">
          <UserCheck className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-xs text-gray-500 font-semibold mb-1">Docentes asignados</p>
          <p className="text-2xl font-bold text-gray-800">{stats.docentes_asignados}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center items-center text-center">
          <Users className="w-8 h-8 text-orange-500 mb-2" />
          <p className="text-xs text-gray-500 font-semibold mb-1">Grupos habilitados</p>
          <p className="text-2xl font-bold text-gray-800">{stats.grupos_habilitados}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center items-center text-center">
          <BookOpen className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-xs text-gray-500 font-semibold mb-1">Materias programadas</p>
          <p className="text-2xl font-bold text-gray-800">{stats.materias_programadas}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-teal-50 rounded-bl-full" />
          <CheckCircle2 className="w-8 h-8 text-teal-500 mb-2" />
          <p className="text-xs text-gray-500 font-semibold mb-1">Asignaciones activas</p>
          <p className="text-2xl font-bold text-gray-800">{stats.asignaciones_activas}</p>
        </div>
      </div>

      {!isCoordinador && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulario y Tabla */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Asignación de docentes a materias de grupo</h3>
              <p className="text-sm text-gray-500 mb-6">Asigne docentes a materias ya programadas dentro de la gestión académica seleccionada.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full border-gray-300 rounded-lg px-3 py-2 border text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={selectedGrupo}
                    onChange={handleGrupoChange}
                  >
                    <option value="">Seleccione grupo...</option>
                    {grupos.map(g => (
                      <option key={g.id} value={g.id}>{g.nombre} - {g.turno} ({g.modalidad})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Materia del grupo <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full border-gray-300 rounded-lg px-3 py-2 border text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={selectedMateria}
                    onChange={handleMateriaChange}
                    disabled={!selectedGrupo}
                  >
                    <option value="">Seleccione materia...</option>
                    {materias.map(m => (
                      <option key={m.id_grupo_materia} value={m.id_grupo_materia}>
                        {m.nombre} {m.id_docente ? '(Ya tiene docente)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Programación configurada */}
              <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 mb-4">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Información de la programación (configurada)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2">
                    <div className="bg-white p-1.5 rounded text-blue-600 shadow-sm border border-blue-100"><MapPin className="w-4 h-4"/></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Aula</p>
                      <p className="text-sm font-medium text-gray-800">{horarioInfo?.nro_aula || '--'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-white p-1.5 rounded text-blue-600 shadow-sm border border-blue-100"><CalendarDays className="w-4 h-4"/></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Día</p>
                      <p className="text-sm font-medium text-gray-800">{horarioInfo?.dia || '--'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-white p-1.5 rounded text-blue-600 shadow-sm border border-blue-100"><Clock className="w-4 h-4"/></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Hora</p>
                      <p className="text-sm font-medium text-gray-800">{horarioInfo?.hora || '--'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-white p-1.5 rounded text-blue-600 shadow-sm border border-blue-100"><ShieldCheck className="w-4 h-4"/></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Modalidad</p>
                      <p className="text-sm font-medium text-gray-800">{horarioInfo?.modalidad || '--'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Docente habilitado <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full border-gray-300 rounded-lg px-3 py-2 border text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={selectedDocente}
                    onChange={e => setSelectedDocente(e.target.value)}
                    disabled={!selectedMateria}
                  >
                    <option value="">Seleccione docente...</option>
                    {docentes.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAsignacionAutomatica}
                    disabled={isAutoAssigning || procesando}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center h-10 shadow-sm"
                    title="Asignar automáticamente todos los docentes posibles a las materias pendientes"
                  >
                    {isAutoAssigning ? 'Procesando...' : 'Asignación Automática'}
                  </button>
                  <button
                    onClick={handleAsignar}
                    disabled={!selectedDocente || procesando || isAutoAssigning}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center h-10 shadow-sm"
                  >
                    {procesando ? 'Asignando...' : 'Asignar docente'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Paneles Informativos Laterales (Información) */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="flex items-center gap-2 font-bold text-blue-700 mb-3">
                <Info className="w-5 h-5" /> Información
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Primero seleccione el grupo y luego la materia del grupo.</p>
                <p>La información de aula, día, hora y modalidad se muestra automáticamente porque ya está configurada.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asignaciones actuales a ancho completo */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Asignaciones actuales</h3>
            </div>
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-3">Grupo</th>
                    <th className="px-4 py-3">Materia</th>
                    <th className="px-4 py-3">Docente</th>
                    <th className="px-4 py-3">Aula</th>
                    <th className="px-4 py-3">Día</th>
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Modalidad</th>
                    <th className="px-4 py-3">Estado</th>
                    {!isCoordinador && <th className="px-4 py-3 text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {asignaciones.length > 0 ? (
                    asignaciones.map((a, index) => (
                      <tr key={index} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800">{a.grupo_nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{a.materia_nombre}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{a.docente_nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{a.aula_nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{a.dia}</td>
                        <td className="px-4 py-3 text-gray-600">{a.hora}</td>
                        <td className="px-4 py-3 text-gray-600">{a.modalidad}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                            Activo
                          </span>
                        </td>
                        {!isCoordinador && (
                          <td className="px-4 py-3 text-center flex justify-center gap-2">
                            <button 
                              title="Editar asignación" 
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              onClick={() => {
                                setSelectedGrupo('');
                                setSelectedMateria('');
                                toast('Para editar, seleccione el grupo y materia en el formulario superior', { icon: 'ℹ️' });
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              title="Quitar asignación" 
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              onClick={() => handleEliminar(a.id_grupo_materia)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-400">
                        No hay docentes asignados en esta gestión
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-gray-100 text-xs text-gray-500 bg-gray-50/50">
              Mostrando {asignaciones.length} asignaciones
            </div>
          </div>
    </div>
  );
}
