import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Phone, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function GestionAcademicaPostulantesTab({ gestionId }) {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGrupoId, setExpandedGrupoId] = useState(null);
  const [postulantesByGrupo, setPostulantesByGrupo] = useState({});
  const [loadingPostulantes, setLoadingPostulantes] = useState(false);

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
    }
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
    <div className="space-y-4 mt-4">
      {grupos.map((grupo) => {
        const isExpanded = expandedGrupoId === grupo.id;
        const postulantes = postulantesByGrupo[grupo.id];

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
                          <th className="px-4 py-3 font-semibold text-center">Matemática</th>
                          <th className="px-4 py-3 font-semibold text-center">Inglés</th>
                          <th className="px-4 py-3 font-semibold text-center">Física</th>
                          <th className="px-4 py-3 font-semibold text-center">Computación</th>
                          <th className="px-4 py-3 font-semibold text-center">Promedio</th>
                          <th className="px-4 py-3 font-semibold text-center">Estado</th>
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
                            <td className="px-4 py-3 text-gray-600 text-center font-bold">
                              {postulante.notas?.['Matemática'] ?? '-'}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-center font-bold">
                              {postulante.notas?.['Inglés'] ?? '-'}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-center font-bold">
                              {postulante.notas?.['Física'] ?? '-'}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-center font-bold">
                              {postulante.notas?.['Computación'] ?? '-'}
                            </td>
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
    </div>
  );
}
