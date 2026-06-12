import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Calendar, Clock, BookOpen, MapPin, ChevronRight, FileText, UsersRound } from 'lucide-react';
import { docentePortalService } from '../services/docentePortalService';
import toast from 'react-hot-toast';

export default function InicioDocentePage() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { id: 1, nombre: 'Docente' };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await docentePortalService.getDashboardData(user.id);
      setDashboardData(data);
    } catch (e) {
      toast.error('Error al cargar datos del portal docente');
    } finally {
      setLoading(false);
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
      <p className="mt-4 text-gray-500 font-medium">Cargando tu portal docente...</p>
    </div>
  );

  if (!dashboardData) return null;

  const { stats, grupos, horario_semanal } = dashboardData;
  
  const getHorarioDeDia = (dia) => {
    return horario_semanal.filter(h => h.dia === dia);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Panel Docente</h2>
        <p className="text-gray-500 mt-1">Gestiona tus grupos y estudiantes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Estudiantes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:-translate-y-1">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Estudiantes</p>
            <p className="text-4xl font-bold text-gray-800 mt-2">{stats.total}</p>
          </div>
          <div className="w-14 h-14 bg-blue-800 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Aprobados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:-translate-y-1">
          <div>
            <p className="text-sm font-medium text-gray-500">Aprobados</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-bold text-gray-800">{stats.aprobados}</p>
              <p className="text-sm font-semibold text-emerald-500">{stats.aprobadosPerc}%</p>
            </div>
          </div>
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <UserCheck className="w-7 h-7" />
          </div>
        </div>

        {/* Reprobados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:-translate-y-1">
          <div>
            <p className="text-sm font-medium text-gray-500">Reprobados</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-bold text-gray-800">{stats.reprobados}</p>
              <p className="text-sm font-semibold text-red-500">{stats.reprobadosPerc}%</p>
            </div>
          </div>
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-red-200">
            <UserX className="w-7 h-7" />
          </div>
        </div>

        {/* Asistencia */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:-translate-y-1">
          <div>
            <p className="text-sm font-medium text-gray-500">Asistencia Promedio</p>
            <p className="text-4xl font-bold text-gray-800 mt-2">{stats.asistencia}%</p>
          </div>
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-purple-200">
            <Calendar className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Mis Grupos Asignados (Resumen) */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600"/>
          Mis Grupos Asignados
        </h3>
        
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
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-gray-800">
                    {grupo.nombre}
                  </h4>
                </div>
                
                <div className="space-y-4">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Horario Semanal */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600"/>
          Horario Semanal
        </h3>
        {horario_semanal.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tienes horarios asignados para esta semana.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(dia => {
              const clasesDelDia = getHorarioDeDia(dia);
              return (
                <div key={dia}>
                  <div className={`text-center py-2 rounded-t-lg font-bold text-sm text-gray-700 mb-3 border-b-2 ${clasesDelDia.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200'}`}>
                    {dia}
                  </div>
                  {clasesDelDia.length === 0 ? (
                    <div className="text-center p-3 text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      Sin clases
                    </div>
                  ) : (
                    clasesDelDia.map((clase, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-200 mb-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <p className="font-bold text-gray-800 text-sm mb-1 text-center bg-white border border-gray-100 rounded py-1 shadow-sm">{clase.hora}</p>
                        <p className="text-sm font-bold text-blue-700 mt-2">{clase.materia}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-1">
                          <Users className="w-3 h-3 text-gray-400"/>
                          {clase.grupo}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-1">
                          <MapPin className="w-3 h-3 text-gray-400"/>
                          Aula {clase.aula}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
