import { useState, useEffect } from 'react';
import { Users, FileText, UserCheck, Activity, LogOut } from 'lucide-react';
import { bitacoraService } from '../services/bitacoraService';
import { postulanteService } from '../../p2-postulantes/services/postulanteService';

export default function DashboardPage() {
  const [statsData, setStatsData] = useState({ total_mes: 0, hoy: 0, usuarios_activos: 0 });
  const [postulantesTotal, setPostulantesTotal] = useState(0);
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const userName = user?.nombre || 'Usuario';
  const userFirstName = userName.split(' ')[0];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const bStats = await bitacoraService.getStats();
      setStatsData(bStats);
      
      const pData = await postulanteService.getAll('');
      setPostulantesTotal(pData.length);
    } catch (e) {
      console.error(e);
    }
  };

  const stats = [
    { name: 'Usuarios Activos', value: statsData.usuarios_activos, icon: Users, color: 'bg-emerald-500' },
    { name: 'Postulantes', value: postulantesTotal, icon: UserCheck, color: 'bg-blue-500' },
    { name: 'Grupos (Estático)', value: '12', icon: FileText, color: 'bg-amber-500' },
    { name: 'Acciones Hoy', value: statsData.hoy, icon: Activity, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Alert */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-emerald-500 rounded-full p-1 mr-3">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium">¡Bienvenido al sistema, {userName}!</span>
        </div>
        <button className="text-emerald-600 hover:text-emerald-800">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800">¡Hola, {userFirstName}! 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Resumen de tu sistema - {new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-xl shadow-sm p-6 text-white relative overflow-hidden`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-white/20 rounded-lg p-2 inline-block mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-white/80 text-sm font-medium">{stat.name}</p>
                <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
              </div>
              <span className="bg-white/20 text-xs font-semibold px-2 py-1 rounded">HOY</span>
            </div>
            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <stat.icon className="h-32 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Actividad - Últimos 7 días</h3>
              <p className="text-xs text-gray-500">Evolución de acciones diarias</p>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
              En tiempo real
            </span>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2 pb-6 border-b border-gray-100">
            {/* Simple CSS bars for mock chart */}
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} className="w-full bg-gray-100 rounded-t-sm relative group">
                <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-500" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Distribución por Rol</h3>
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 rounded-full border-[16px] border-emerald-400 relative">
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-blue-500 border-l-transparent border-b-transparent transform rotate-45"></div>
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-amber-400 border-r-transparent border-t-transparent border-l-transparent transform -rotate-12"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-400 mr-2"></span>Postulantes</div>
              <span className="font-semibold">65%</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Docentes</div>
              <span className="font-semibold">25%</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-400 mr-2"></span>Administrativos</div>
              <span className="font-semibold">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
