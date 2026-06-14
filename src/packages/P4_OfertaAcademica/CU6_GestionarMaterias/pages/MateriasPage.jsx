import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { materiaService } from '../services/materiaService';
import { toast } from 'react-hot-toast';

export default function MateriasPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', estado: 'Activo' });

  useEffect(() => { fetch(); }, [search]);

  const fetch = async () => {
    setLoading(true);
    try { setItems(await materiaService.getAll(search)); } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '', estado: 'Activo' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ nombre: item.nombre, descripcion: item.descripcion || '', estado: item.estado }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await materiaService.update(editing.id, form); }
      else { await materiaService.create(form); }
      setShowModal(false); fetch();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta materia?')) {
      try { await materiaService.delete(id); fetch(); } catch(e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Materias</h2>
          <p className="text-sm text-gray-500">Administra las materias del sistema académico.</p>
        </div>
        {!isCoordinador && (
          <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" /> Nueva Materia
        </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
            <input type="text" placeholder="Buscar materia..." className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg sm:text-sm bg-gray-50" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="p-8 text-center text-gray-500">Cargando...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Nombre</th><th className="px-6 py-4 font-medium">Descripción</th><th className="px-6 py-4 font-medium">Estado</th>{!isCoordinador && <th className="px-6 py-4 font-medium text-right">Acciones</th>}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{item.descripcion || '-'}</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{item.estado}</span></td>
                    {!isCoordinador && (<td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>)}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">Sin registros.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Editar Materia' : 'Nueva Materia'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input required className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" rows="2" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} /></div>
              {editing && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                    <option value="Activo">Activo</option><option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
