import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import carreraService from '../services/carreraService';
import { toast } from 'react-hot-toast';

export default function CarrerasPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [carreras, setCarreras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'Activo',
    cupo_max: 50
  });

  const fetchCarreras = async (search = '') => {
    try {
      setLoading(true);
      const data = await carreraService.getAll(search);
      setCarreras(data);
    } catch (error) {
      console.error('Error fetching carreras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCarreras(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCarrera) {
        await carreraService.update(editingCarrera.id, formData);
      } else {
        await carreraService.create(formData);
      }
      setShowModal(false);
      setFormData({ nombre: '', descripcion: '', estado: 'Activo', cupo_max: 50 });
      setEditingCarrera(null);
      setError('');
      fetchCarreras();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la carrera');
    }
  };

  const handleEdit = (carrera) => {
    setEditingCarrera(carrera);
    setFormData({
      nombre: carrera.nombre,
      descripcion: carrera.descripcion || '',
      estado: carrera.estado || 'Activo',
      cupo_max: carrera.cupo_max || 50
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta carrera?')) {
      try {
        await carreraService.delete(id);
        fetchCarreras();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al eliminar la carrera');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Carreras</h2>
          <p className="text-sm text-gray-500 mt-1">Administra las carreras académicas del sistema</p>
        </div>
        {!isCoordinador && (
          <button
          onClick={() => {
            setEditingCarrera(null);
            setFormData({ nombre: '', descripcion: '', estado: 'Activo', cupo_max: 50 });
            setError('');
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center shadow-sm transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Carrera
        </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar carreras..."
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
                <th className="px-6 py-4">Carrera</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Cupo Max.</th>
                <th className="px-6 py-4">Cupo Disp.</th>
                <th className="px-6 py-4">Estado</th>
                {!isCoordinador && <th className="px-6 py-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
                      Cargando carreras...
                    </div>
                  </td>
                </tr>
              ) : carreras.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-600">No se encontraron carreras</p>
                    <p className="text-sm">Intenta con otro término de búsqueda o agrega una nueva.</p>
                  </td>
                </tr>
              ) : (
                carreras.map((carrera) => (
                  <tr key={carrera.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{carrera.nombre}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {carrera.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{carrera.cupo_max || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${carrera.cupo_disp > 0 ? 'text-blue-600' : 'text-red-600'}`}>{carrera.cupo_disp ?? '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${carrera.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {carrera.estado || 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(carrera)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar carrera"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(carrera.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar carrera"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCarrera ? 'Editar Carrera' : 'Nueva Carrera'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Carrera</label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Ingeniería de Sistemas"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none h-24"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción opcional de la carrera..."
                  maxLength={255}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cupo Máximo (Postulantes)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  value={formData.cupo_max}
                  onChange={(e) => setFormData({...formData, cupo_max: parseInt(e.target.value) || 1})}
                  placeholder="Ej: 50"
                />
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
                  {editingCarrera ? 'Actualizar Carrera' : 'Crear Carrera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
