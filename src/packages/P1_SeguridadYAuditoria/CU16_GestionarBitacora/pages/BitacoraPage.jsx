import { useState, useEffect } from 'react';
import { Search, Filter, Activity, Clock, ShieldCheck, Database, LogIn, LogOut, Edit, Plus, Trash2 } from 'lucide-react';
import { bitacoraService } from '../services/bitacoraService';

export default function BitacoraPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [searchTerm, setSearchTerm] = useState('');
  const [registros, setRegistros] = useState([]);
  const [stats, setStats] = useState({ total_mes: 0, hoy: 0, usuarios_activos: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sesiones'); // 'sesiones' o 'crud'

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        bitacoraService.getAll({ search: searchTerm }),
        bitacoraService.getStats()
      ]);
      setRegistros(data);
      setStats(statsData);
    } catch (error) {
      console.error("Error al cargar bitácora", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar los datos en el frontend dependiendo de la pestaña
  const logsSesiones = registros.filter(r => r.accion === 'Login' || r.accion === 'Logout');
  const logsCRUD = registros.filter(r => r.accion !== 'Login' && r.accion !== 'Logout');

  const getActionColor = (accion) => {
    switch (accion) {
      case 'Crear': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Actualizar': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Eliminar': return 'bg-red-50 text-red-700 border-red-200';
      case 'Login': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Logout': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getActionIcon = (accion) => {
    switch (accion) {
      case 'Crear': return <Plus className="h-3 w-3 mr-1" />;
      case 'Actualizar': return <Edit className="h-3 w-3 mr-1" />;
      case 'Eliminar': return <Trash2 className="h-3 w-3 mr-1" />;
      case 'Login': return <LogIn className="h-3 w-3 mr-1" />;
      case 'Logout': return <LogOut className="h-3 w-3 mr-1" />;
      default: return <Activity className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bitácora del Sistema</h2>
          <p className="text-sm text-gray-500">Auditoría completa de sesiones y movimientos en la base de datos.</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm">
            <Filter className="h-4 w-4 mr-2" /> Exportar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Acciones Hoy</p>
            <p className="text-2xl font-bold text-gray-800">{stats.hoy}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Mes</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_mes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mr-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Usuarios Activos</p>
            <p className="text-2xl font-bold text-gray-800">{stats.usuarios_activos}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('sesiones')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'sesiones' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LogIn className="h-4 w-4 mr-2" /> Inicios de Sesión
        </button>
        <button 
          onClick={() => setActiveTab('crud')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'crud' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Database className="h-4 w-4 mr-2" /> Acciones CRUD (POST, PUT, DELETE)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por usuario o detalle..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary sm:text-sm bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando registros...</div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'sesiones' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-medium">Usuario</th>
                    <th className="px-6 py-4 font-medium">Rol</th>
                    <th className="px-6 py-4 font-medium">Acción</th>
                    <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                    <th className="px-6 py-4 font-medium">Dirección IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logsSesiones.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800 text-sm">{log.usuario}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.rol.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getActionColor(log.accion)}`}>
                          {getActionIcon(log.accion)}{log.accion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.fecha} <span className="text-gray-400 ml-1">{log.hora}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">{log.ip}</td>
                    </tr>
                  ))}
                  {logsSesiones.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">No hay registros de sesiones recientes.</td></tr>}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-medium">Usuario</th>
                    <th className="px-6 py-4 font-medium">Módulo</th>
                    <th className="px-6 py-4 font-medium">Acción CRUD</th>
                    <th className="px-6 py-4 font-medium">Detalle (Endpoint)</th>
                    <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logsCRUD.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800 text-sm">{log.usuario}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.modulo || 'General'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getActionColor(log.accion)}`}>
                          {getActionIcon(log.accion)}{log.accion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{log.descripcion}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.fecha} <span className="text-gray-400 ml-1">{log.hora}</span>
                      </td>
                    </tr>
                  ))}
                  {logsCRUD.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">No hay registros de movimientos CRUD.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
