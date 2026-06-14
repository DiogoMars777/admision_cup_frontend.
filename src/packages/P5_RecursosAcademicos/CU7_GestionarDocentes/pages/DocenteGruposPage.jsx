import { useState, useEffect, useRef } from 'react';
import { Users, UserCheck, UserX, Clock, BookOpen, MapPin, ChevronRight, FileText, UsersRound } from 'lucide-react';
import { docentePortalService } from '../services/docentePortalService';
import toast from 'react-hot-toast';

export default function DocenteGruposPage() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const tableRef = useRef(null);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { id: 1, nombre: 'Docente' };

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const data = await docentePortalService.getDashboardData(user.id);
      setGrupos(data.grupos || []);
    } catch (e) {
      toast.error('Error al cargar los grupos asignados');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (groupId) => {
    if (selectedGroup === groupId) {
      setSelectedGroup(null);
      return;
    }
    
    setSelectedGroup(groupId);
    try {
      setLoadingEstudiantes(true);
      const res = await docentePortalService.getEstudiantesPorGrupo(groupId);
      setEstudiantes(res.estudiantes || []);
      
      // Auto-scroll to table after a short delay to allow DOM render
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e) {
      toast.error('Error al cargar estudiantes');
    } finally {
      setLoadingEstudiantes(false);
    }
  };



  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">Aprobado</span>;
      case 'Reprobado':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm">Reprobado</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-sm">Cursando</span>;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 font-medium">Cargando tus grupos...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Mis Grupos Asignados
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Selecciona un grupo para ver la lista de estudiantes inscritos y sus notas.
        </p>
      </div>

      <div>
        {grupos.length === 0 ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center text-blue-800 flex flex-col items-center">
            <FileText className="w-12 h-12 text-blue-300 mb-3"/>
            <p className="font-semibold text-lg">Aún no tienes grupos asignados</p>
            <p className="text-sm mt-1">El área de Gestión Académica te asignará tus materias próximamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grupos.map((grupo) => (
              <div 
                key={grupo.id} 
                onClick={() => handleSelectGroup(grupo.id)}
                className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer group hover:shadow-lg ${selectedGroup === grupo.id ? 'border-blue-600 shadow-md transform -translate-y-1 bg-gradient-to-b from-blue-50/50 to-white' : 'border-gray-100 shadow-sm hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className={`text-lg font-bold ${selectedGroup === grupo.id ? 'text-blue-800' : 'text-gray-800 group-hover:text-blue-700'}`}>
                    {grupo.nombre}
                  </h4>
                  <div className={`p-2 rounded-full ${selectedGroup === grupo.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-sm font-medium bg-gray-50 rounded-lg p-3">
                    <Users className={`w-5 h-5 mr-3 ${selectedGroup === grupo.id ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-gray-700">{grupo.estudiantes} Estudiantes inscritos</span>
                  </div>
                  <div className="flex items-center text-sm font-medium bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                    <Clock className={`w-5 h-5 mr-3 shrink-0 ${selectedGroup === grupo.id ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-gray-700 leading-tight">{grupo.horario}</span>
                  </div>
                  <div className="flex items-center text-sm font-medium bg-gray-50 rounded-lg p-3">
                    <MapPin className={`w-5 h-5 mr-3 ${selectedGroup === grupo.id ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-gray-700">{grupo.aula}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estudiantes Table */}
      {selectedGroup && (
      <div ref={tableRef} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mt-8 transition-all scroll-mt-20">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-blue-600"/>
            Listado de Estudiantes <span className="text-gray-400 font-normal">| {grupos.find(g => g.id === selectedGroup)?.nombre}</span>
          </h3>
        </div>
        <div className="overflow-x-auto relative min-h-[200px]">
          {loadingEstudiantes ? (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : null}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-600 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Estudiante</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Carnet (CI)</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Nota 1</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Nota 2</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Nota 3</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Promedio Final</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estudiantes.length === 0 && !loadingEstudiantes ? (
                <tr><td colSpan="7" className="text-center p-8 text-gray-500 italic">No hay estudiantes inscritos en este grupo todavía.</td></tr>
              ) : (
                estudiantes.map((est) => (
                  <tr key={est.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs shadow-sm shrink-0">
                          {est.nombre.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800">{est.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{est.ci}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-600">{est.nota1}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-600">{est.nota2}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-600">{est.nota3}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold w-7 text-center ${est.nota >= 60 ? 'text-emerald-600' : 'text-red-600'}`}>{est.nota}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner hidden md:block">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${est.nota >= 60 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.min(100, Math.max(0, est.nota))}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">{est.asistencia}%</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
