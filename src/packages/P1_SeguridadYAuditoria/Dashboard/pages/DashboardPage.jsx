import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, BookOpen, GraduationCap, UsersRound, School, Activity, ArrowUpRight, Clock } from 'lucide-react';
import { bitacoraService } from '../../CU16_GestionarBitacora/services/bitacoraService';
import { postulanteService } from '../../../P2_PostulantesYRequisitos/CU2_RegistrarPostulante/services/postulanteService';
import { docenteService } from '../../../P5_RecursosAcademicos/CU7_GestionarDocentes/services/docenteService';
import { grupoService } from '../../../P6_PlanificacionAcademica/CU8_GestionarGrupos/services/grupoService';

export default function DashboardPage() {
  const [statsData, setStatsData] = useState({ total_mes: 0, hoy: 0, usuarios_activos: 0 });
  const [postulantesTotal, setPostulantesTotal] = useState(0);
  const [docentesTotal, setDocentesTotal] = useState(0);
  const [gruposTotal, setGruposTotal] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';
  const userName = user?.nombre || 'Usuario';
  const userFirstName = userName.split(' ')[0];

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [bStats, pData, logs, dData, gData] = await Promise.all([
        bitacoraService.getStats(),
        postulanteService.getAll(''),
        bitacoraService.getAll({}),
        docenteService.getAll(''),
        grupoService.getAll('')
      ]);
      setStatsData(bStats);
      setPostulantesTotal(pData.length);
      setRecentLogs(logs.slice(0, 8));
      setDocentesTotal(dData.length);
      setGruposTotal(gData.length);
    } catch (e) { console.error(e); }
  };

  const stats = [
    { name: 'Usuarios Activos', value: statsData.usuarios_activos, icon: Users, gradient: 'from-blue-600 to-blue-800', light: 'bg-blue-50 text-blue-700', path: '/p1/usuarios' },
    { name: 'Postulantes', value: postulantesTotal, icon: UserCheck, gradient: 'from-emerald-600 to-emerald-800', light: 'bg-emerald-50 text-emerald-700', path: '/p2/postulantes' },
    { name: 'Docentes', value: docentesTotal, icon: GraduationCap, gradient: 'from-violet-600 to-violet-800', light: 'bg-violet-50 text-violet-700', path: '/p3/docentes' },
    { name: 'Grupos', value: gruposTotal, icon: UsersRound, gradient: 'from-amber-500 to-amber-700', light: 'bg-amber-50 text-amber-700', path: '/p3/grupos' },
  ];

  // Cálculos reales para el gráfico
  const totalReal = statsData.usuarios_activos || 1;
  const numAdmin = Math.max(0, totalReal - postulantesTotal - docentesTotal);
  
  const pctAdmin = Math.round((numAdmin / totalReal) * 100) || 0;
  const pctPostulantes = Math.round((postulantesTotal / totalReal) * 100) || 0;
  const pctDocentes = Math.round((docentesTotal / totalReal) * 100) || 0;

  const getActionColor = (accion) => {
    switch (accion) {
      case 'Crear': return 'bg-emerald-50 text-emerald-700';
      case 'Actualizar': return 'bg-blue-50 text-blue-700';
      case 'Eliminar': return 'bg-red-50 text-red-700';
      case 'Login': return 'bg-indigo-50 text-indigo-700';
      case 'Logout': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const userPermisos = user?.permisos || [];
  const userRole = user?.rol || 'Administrador';
  const isSuperAdmin = userRole === 'Super Admin' || userRole === 'Super Administrador';
  const hasPanelAccess = isSuperAdmin || userPermisos.includes('panel');

  if (userRole === 'Administrador' || userRole === 'Coordinador') {
    if (!hasPanelAccess) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Bienvenido, {userFirstName}</h2>
            <p className="text-sm text-gray-500">
              Tu cuenta está activa, pero no tienes permisos para ver el resumen general del sistema. Usa el menú lateral para navegar a los módulos que tienes asignados.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido, {userFirstName}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Resumen general del sistema — {new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link to={stat.path} key={i} className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md transition-shadow group block cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.light}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{stat.name}</p>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Actividad — Últimos 7 días</h3>
              <p className="text-xs text-gray-400 mt-0.5">Evolución de acciones diarias</p>
            </div>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              En vivo
            </span>
          </div>
          <div className="h-56 flex items-end justify-between gap-2 pb-4 border-b border-gray-100">
            {[35, 65, 45, 80, 55, 75, 90].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-gray-100 rounded-t-md relative min-h-[4px] group" style={{ height: '100%' }}>
                  <div 
                    className="absolute bottom-0 w-full rounded-t-md transition-all duration-500 group-hover:opacity-80"
                    style={{ height: `${h}%`, background: 'linear-gradient(180deg, #0a4a8e 0%, #1e3a5f 100%)' }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats / Distribution */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-6">Distribución de Usuarios</h3>
          
          {/* Simple donut-like visualization */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#0a4a8e" strokeWidth="4" 
                  pathLength="100" strokeDasharray={`${pctAdmin} ${100 - pctAdmin}`} strokeDashoffset="0" strokeLinecap="round" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#059669" strokeWidth="4" 
                  pathLength="100" strokeDasharray={`${pctPostulantes} ${100 - pctPostulantes}`} strokeDashoffset={`-${pctAdmin}`} strokeLinecap="round" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#d97706" strokeWidth="4" 
                  pathLength="100" strokeDasharray={`${pctDocentes} ${100 - pctDocentes}`} strokeDashoffset={`-${pctAdmin + pctPostulantes}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{statsData.usuarios_activos}</p>
                  <p className="text-[10px] text-gray-400">Total</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0a4a8e]" />
                <span className="text-xs text-gray-600">Administrativos</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{pctAdmin}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-xs text-gray-600">Postulantes</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{pctPostulantes}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-gray-600">Docentes</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{pctDocentes}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Actividad Reciente</h3>
            <p className="text-xs text-gray-400 mt-0.5">Últimos movimientos registrados en el sistema</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3 text-left font-medium">Usuario</th>
                <th className="px-6 py-3 text-left font-medium">Acción</th>
                <th className="px-6 py-3 text-left font-medium">Módulo</th>
                <th className="px-6 py-3 text-left font-medium">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="text-sm font-medium text-gray-800">{log.usuario}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${getActionColor(log.accion)}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">{log.modulo || '—'}</td>
                  <td className="px-6 py-3 text-xs text-gray-500">
                    {log.fecha} <span className="text-gray-300 ml-1">{log.hora}</span>
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-400">Sin actividad reciente</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
