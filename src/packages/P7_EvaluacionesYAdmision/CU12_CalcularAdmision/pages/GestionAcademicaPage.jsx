import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, CalendarDays, ArrowLeft, Save, FileText, ClipboardCheck, UserCheck, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import gestionAcademicaService from '../services/gestionAcademicaService';
import GestionAcademicaDetailPage from './GestionAcademicaDetailPage';

export default function GestionAcademicaPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [gestiones, setGestiones] = useState([]);
  const [cups, setCups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGestion, setEditingGestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedGestion, setSelectedGestion] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loadingEvals, setLoadingEvals] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    id_gestion_cup: '',
    fecha_ini: '',
    fecha_fin: '',
    estado: 'Inactivo'
  });

  const loadData = async (search = '') => {
    try {
      setLoading(true);
      const [gestionesData, cupsData] = await Promise.all([
        gestionAcademicaService.getAll(search),
        gestionAcademicaService.getCups()
      ]);
      setGestiones(gestionesData);
      setCups(cupsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!selectedGestion) {
        loadData(searchTerm);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedGestion]);

  const fetchEvaluaciones = async (id) => {
    try {
      setLoadingEvals(true);
      const evals = await gestionAcademicaService.getEvaluaciones(id);
      setEvaluaciones(evals);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
    } finally {
      setLoadingEvals(false);
    }
  };

  const handleSelectGestion = (gestion) => {
    setSelectedGestion(gestion);
    fetchEvaluaciones(gestion.id);
  };

  const handleSaveEvaluacion = async (nombre_eva, fecha) => {
    if (!fecha) {
      toast.error("Por favor ingrese una fecha.");
      return;
    }
    try {
      await gestionAcademicaService.updateEvaluacion(selectedGestion.id, { nombre_eva, fecha });
      fetchEvaluaciones(selectedGestion.id);
    } catch (error) {
      // Manejado por interceptor
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGestion) {
        await gestionAcademicaService.update(editingGestion.id, formData);
      } else {
        await gestionAcademicaService.create(formData);
      }
      setShowModal(false);
      setFormData({
        nombre: '',
        id_gestion_cup: cups.length > 0 ? cups[0].id : '',
        fecha_ini: '',
        fecha_fin: '',
        estado: 'Inactivo'
      });
      setEditingGestion(null);
      setError('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la gestión académica');
    }
  };

  const handleEdit = (gestion) => {
    setEditingGestion(gestion);
    setFormData({
      nombre: gestion.nombre,
      id_gestion_cup: gestion.id_gestion_cup || (cups.length > 0 ? cups[0].id : ''),
      fecha_ini: gestion.fecha_ini,
      fecha_fin: gestion.fecha_fin,
      estado: gestion.estado || 'Inactivo'
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta gestión académica?')) {
      try {
        await gestionAcademicaService.delete(id);
        loadData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al eliminar la gestión');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestiones Académicas</h2>
          <p className="text-sm text-gray-500 mt-1">Administra los periodos académicos del sistema</p>
        </div>
        {!selectedGestion && !isCoordinador && (
          <button
            onClick={() => {
              setEditingGestion(null);
              setFormData({
                nombre: '',
                id_gestion_cup: cups.length > 0 ? cups[0].id : '',
                fecha_ini: '',
                fecha_fin: '',
                estado: 'Inactivo'
              });
              setError('');
              setShowModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center shadow-sm transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Gestión
          </button>
        )}
      </div>

      {!selectedGestion ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar gestión (Ej: 2026)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Nombre / Año</th>
                <th className="px-6 py-4">CUP</th>
                <th className="px-6 py-4">Fechas</th>
                <th className="px-6 py-4">Estado</th>
                {!isCoordinador && <th className="px-6 py-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
                      Cargando gestiones...
                    </div>
                  </td>
                </tr>
              ) : gestiones.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-600">No se encontraron gestiones</p>
                    <p className="text-sm">Intenta con otro término de búsqueda o agrega una nueva.</p>
                  </td>
                </tr>
              ) : (
                gestiones.map((gestion) => (
                  <tr key={gestion.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleSelectGestion(gestion)}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{gestion.nombre}</div>
                      <div className="text-sm text-gray-500">Año: {gestion.año}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-700">{gestion.cup_nombre || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>Del: <span className="font-medium">{gestion.fecha_ini}</span></div>
                      <div>Al: <span className="font-medium">{gestion.fecha_fin}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${gestion.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                        {gestion.estado || 'Inactivo'}
                      </span>
                    </td>
                    {!isCoordinador && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(gestion); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar gestión"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(gestion.id); }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar gestión"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <GestionAcademicaDetailPage 
          gestion={selectedGestion} 
          onBack={() => setSelectedGestion(null)} 
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {editingGestion ? 'Editar Gestión Académica' : 'Nueva Gestión Académica'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Gestión 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CUP a gestionar</label>
                  <select
                    required
                    className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
                    value={formData.id_gestion_cup}
                    onChange={(e) => setFormData({...formData, id_gestion_cup: e.target.value})}
                  >
                    <option value="" disabled>Seleccione un CUP</option>
                    {cups.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    value={formData.fecha_ini}
                    onChange={(e) => setFormData({...formData, fecha_ini: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Fin</label>
                  <input
                    type="date"
                    required
                    className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                <select
                  className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                {formData.estado === 'Activo' && (
                  <p className="text-xs text-amber-600 mt-1">
                    Nota: Poner esta gestión como Activa desactivará cualquier otra gestión actualmente activa.
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-colors"
                >
                  {editingGestion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
