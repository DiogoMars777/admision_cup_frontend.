import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Phone, Hash, ChevronDown, ChevronUp, Edit3, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function GestionAcademicaPostulantesTab({ gestionId }) {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGrupoId, setExpandedGrupoId] = useState(null);
  const [postulantesByGrupo, setPostulantesByGrupo] = useState({});
  const [loadingPostulantes, setLoadingPostulantes] = useState(false);

  // Modal State
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [materiasNotas, setMateriasNotas] = useState([]);
  const [selectedMateriaTab, setSelectedMateriaTab] = useState(null);
  const [formNotas, setFormNotas] = useState({});
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [savingNotas, setSavingNotas] = useState(false);

  useEffect(() => {
    fetchGrupos();
  }, [gestionId]);

  const fetchGrupos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/gestiones-academicas/${gestionId}/postulantes/grupos`, { headers: getHeaders() });
      setGrupos(data);
    } catch (error) {
      toast.error('Error al cargar grupos de la gestión.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGrupo = async (grupoId) => {
    if (expandedGrupoId === grupoId) {
      setExpandedGrupoId(null);
      return;
    }

    setExpandedGrupoId(grupoId);

    if (!postulantesByGrupo[grupoId]) {
      fetchPostulantesDelGrupo(grupoId);
    }
  };

  const fetchPostulantesDelGrupo = async (grupoId) => {
    setLoadingPostulantes(true);
    try {
      const { data } = await axios.get(`${API}/gestiones-academicas/grupos/${grupoId}/postulantes`, { headers: getHeaders() });
      setPostulantesByGrupo(prev => ({ ...prev, [grupoId]: data }));
    } catch (error) {
      toast.error('Error al cargar postulantes del grupo.');
      console.error(error);
    } finally {
      setLoadingPostulantes(false);
    }
  };

  const getDynamicSubjects = (postulantes) => {
    if (!postulantes || postulantes.length === 0) return [];
    return Object.keys(postulantes[0].notas || {});
  };

  const openEditModal = async (postulante, grupoId) => {
    setSelectedPostulante({ ...postulante, grupoId });
    setLoadingDetalle(true);
    setMateriasNotas([]);
    setFormNotas({});
    
    try {
      const { data } = await axios.get(`${API}/gestiones-academicas/${gestionId}/postulantes/${postulante.id}/notas`, { headers: getHeaders() });
      setMateriasNotas(data);
      if (data.length > 0) {
        setSelectedMateriaTab(data[0].id_materia);
        
        // Inicializar formNotas con todas las notas traidas
        let initForm = {};
        data.forEach(mat => {
          mat.evaluaciones.forEach(ev => {
            initForm[ev.id_programacion] = ev.nota !== null ? ev.nota : '';
          });
        });
        setFormNotas(initForm);
      }
    } catch (error) {
      toast.error('Error al cargar las notas detalladas.');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const closeEditModal = () => {
    setSelectedPostulante(null);
    setMateriasNotas([]);
    setSelectedMateriaTab(null);
    setFormNotas({});
  };

  const handleNotaChange = (id_programacion, val) => {
    // Validar rango 0-100
    if (val !== '') {
      let num = parseFloat(val);
      if (num < 0) val = '0';
      if (num > 100) val = '100';
    }
    setFormNotas(prev => ({ ...prev, [id_programacion]: val }));
  };

  const handleSaveNotas = async () => {
    setSavingNotas(true);
    try {
      // Armar payload
      const payload = Object.keys(formNotas).map(id_prog => ({
        id_programacion: parseInt(id_prog),
        nota: formNotas[id_prog]
      }));

      await axios.put(`${API}/gestiones-academicas/${gestionId}/postulantes/${selectedPostulante.id}/notas`, { notas: payload }, { headers: getHeaders() });
      toast.success('Notas guardadas exitosamente.');
      
      // Recargar postulantes del grupo para actualizar el promedio final y estado en la tabla
      fetchPostulantesDelGrupo(selectedPostulante.grupoId);
      closeEditModal();
    } catch (error) {
      toast.error('Ocurrió un error al guardar las notas.');
      console.error(error);
    } finally {
      setSavingNotas(false);
    }
  };

  // Calcula promedio dinamico en el modal para la materia seleccionada
  const calcularPromedioModal = () => {
    const materiaActual = materiasNotas.find(m => m.id_materia === selectedMateriaTab);
    if (!materiaActual) return null;
    
    let suma = 0;
    let ingresadas = 0;
    materiaActual.evaluaciones.forEach(ev => {
      const val = formNotas[ev.id_programacion];
      if (val !== '' && val !== null && val !== undefined) {
        suma += parseFloat(val);
        ingresadas++;
      }
    });

    if (ingresadas === 3) {
      return (suma / 3).toFixed(1);
    }
    return null;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando grupos...</div>;
  }

  if (grupos.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
        No se encontraron grupos para esta gestión académica. Genere los grupos primero.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 relative">
      {grupos.map((grupo) => {
        const isExpanded = expandedGrupoId === grupo.id;
        const postulantes = postulantesByGrupo[grupo.id];
        const dynamicSubjects = getDynamicSubjects(postulantes);

        return (
          <div key={grupo.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleGrupo(grupo.id)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                isExpanded ? 'bg-blue-50 border-b border-blue-100' : 'hover:bg-gray-50'
              }`}
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {grupo.nombre}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Turno: <span className="font-medium text-gray-700">{grupo.turno}</span> | Modalidad: <span className="font-medium text-gray-700">{grupo.modalidad || 'N/A'}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                {postulantes && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-full shadow-sm">
                    {postulantes.length} alumnos
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 bg-white">
                {loadingPostulantes && !postulantes ? (
                  <div className="text-center py-4 text-gray-500 text-sm">Cargando postulantes...</div>
                ) : postulantes && postulantes.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Nombre Completo</th>
                          <th className="px-4 py-3 font-semibold">CI</th>
                          <th className="px-4 py-3 font-semibold">Correo Electrónico</th>
                          <th className="px-4 py-3 font-semibold">Teléfono</th>
                          {dynamicSubjects.map((sub, i) => (
                            <th key={i} className="px-4 py-3 font-semibold text-center">{sub}</th>
                          ))}
                          <th className="px-4 py-3 font-semibold text-center">Promedio</th>
                          <th className="px-4 py-3 font-semibold text-center">Estado</th>
                          <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {postulantes.map((postulante, idx) => (
                          <tr key={postulante.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                              <span className="text-gray-400 text-xs w-4">{idx + 1}.</span>
                              {postulante.nombre}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                              <div className="flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5 text-gray-400" />
                                {postulante.ci}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                {postulante.correo || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {postulante.telefono || '-'}
                              </div>
                            </td>
                            {dynamicSubjects.map((sub, i) => (
                              <td key={i} className="px-4 py-3 text-gray-600 text-center font-bold">
                                {postulante.notas?.[sub] ?? '-'}
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                              <span className="font-bold text-gray-800 text-base">{postulante.promedio_final ?? '-'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                                postulante.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' :
                                postulante.estado === 'Reprobado' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {postulante.estado || 'En Proceso'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openEditModal(postulante, grupo.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 text-xs font-bold rounded-full transition-colors shadow-sm"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Editar notas
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No hay postulantes asignados a este grupo.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal Editar Notas */}
      {selectedPostulante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Editar notas</h2>
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span className="font-bold text-gray-700">{selectedPostulante.nombre}</span>
                  <span>•</span>
                  <span className="font-mono text-xs">CI: {selectedPostulante.ci}</span>
                  <span>•</span>
                  <span>{grupos.find(g => g.id === selectedPostulante.grupoId)?.nombre}</span>
                </div>
              </div>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {loadingDetalle ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : materiasNotas.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No se encontraron materias asignadas.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Píldoras de Materia */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Selecciona la materia</label>
                    <div className="flex flex-wrap gap-2">
                      {materiasNotas.map(m => (
                        <button
                          key={m.id_materia}
                          onClick={() => setSelectedMateriaTab(m.id_materia)}
                          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors border ${
                            selectedMateriaTab === m.id_materia
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          {m.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inputs de Evaluaciones */}
                  {selectedMateriaTab && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-800 mb-4">
                        Notas de {materiasNotas.find(m => m.id_materia === selectedMateriaTab)?.nombre}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {materiasNotas.find(m => m.id_materia === selectedMateriaTab)?.evaluaciones.map(ev => (
                          <div key={ev.id_programacion}>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{ev.evaluacion}</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={formNotas[ev.id_programacion]}
                              onChange={(e) => handleNotaChange(ev.id_programacion, e.target.value)}
                              placeholder="Sin nota"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 font-bold bg-white"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Info de Promedio */}
                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200/60">
                        <span className="text-xs text-gray-500 font-medium">Promedio calculado automáticamente (suma de las 3 notas / 3)</span>
                        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border border-blue-100 font-bold text-sm">
                          Promedio: {calcularPromedioModal() ?? '-'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={closeEditModal}
                disabled={savingNotas}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNotas}
                disabled={savingNotas || loadingDetalle}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {savingNotas ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
                ) : (
                  <><Check className="w-4 h-4" /> Guardar notas</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
