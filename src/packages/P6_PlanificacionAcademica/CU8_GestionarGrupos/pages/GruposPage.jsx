import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { grupoService } from '../services/grupoService';
import { toast } from 'react-hot-toast';

export default function GruposPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [gestiones, setGestiones] = useState([]);
  const [form, setForm] = useState({ id_gestionacademica: '', nombre: '', cupo_max: '', modalidad: '', turno: '', estado: 'Activo' });

  useEffect(() => { fetchData(); }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try { setItems(await grupoService.getAll(search)); } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = async () => {
    setEditing(null);
    setForm({ id_gestionacademica: '', nombre: '', cupo_max: '', modalidad: '', turno: '', estado: 'Activo' });
    try { setGestiones(await grupoService.getGestiones()); } catch(e) { console.error(e); }
    setShowModal(true);
  };

  const openEdit = async (item) => {
    setEditing(item);
    setForm({ nombre: item.nombre, cupo_max: item.cupo_max, modalidad: item.modalidad || '', turno: item.turno || '', estado: item.estado });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await grupoService.update(editing.id, form);
      else await grupoService.create(form);
      setShowModal(false); fetchData();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este grupo?')) {
      try { await grupoService.delete(id); fetchData(); } catch(e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Grupos</h2>
          <p className="text-sm text-gray-500">Administra los grupos académicos del sistema.</p>
        </div>
        {!isCoordinador && (
          <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Grupo
        </button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
            <input type="text" placeholder="Buscar grupo..." className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg sm:text-sm bg-gray-50" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="p-8 text-center text-gray-500">Cargando...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Gestión</th>
                <th className="px-6 py-4 font-medium">Cupo</th>
                <th className="px-6 py-4 font-medium">Modalidad</th>
                <th className="px-6 py-4 font-medium">Turno</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                {!isCoordinador && <th className="px-6 py-4 font-medium text-right">Acciones</th>}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{item.gestion || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{item.cant_estudiante}/{item.cupo_max}</td>
                    <td className="px-6 py-4 text-gray-600">{item.modalidad || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{item.turno || '-'}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{item.estado}</span></td>
                    {!isCoordinador && (<td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>)}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500 text-sm">Sin registros.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Editar Grupo' : 'Nuevo Grupo'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Gestión Académica</label>
                  <select required className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.id_gestionacademica} onChange={e => setForm({...form, id_gestionacademica: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {gestiones.map(g => <option key={g.id} value={g.id}>{g.nombre} - {g.periodo} {g.año}</option>)}
                  </select>
                </div>
              )}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input required className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo</label><input required type="number" min="1" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.cupo_max} onChange={e => setForm({...form, cupo_max: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label><input className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" placeholder="Presencial, Virtual..." value={form.modalidad} onChange={e => setForm({...form, modalidad: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Turno</label><input className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" placeholder="Mañana, Tarde..." value={form.turno} onChange={e => setForm({...form, turno: e.target.value})} /></div>
                {editing && <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                    <option value="Activo">Activo</option><option value="Inactivo">Inactivo</option>
                  </select></div>}
              </div>
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
