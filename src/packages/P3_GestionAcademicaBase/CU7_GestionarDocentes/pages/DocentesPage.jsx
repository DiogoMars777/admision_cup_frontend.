import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { docenteService } from '../services/docenteService';
import { toast } from 'react-hot-toast';

export default function DocentesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ci: '', nombre: '', email: '', telefono: '', sexo: '', grado_academico: '', experiencia_docente: '' });

  useEffect(() => { fetchData(); }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try { setItems(await docenteService.getAll(search)); } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ ci: '', nombre: '', email: '', telefono: '', sexo: '', grado_academico: '', experiencia_docente: '' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ci: item.ci, nombre: item.nombre, email: item.email || '', telefono: item.telefono || '', sexo: item.sexo || '', grado_academico: item.grado_academico || '', experiencia_docente: item.experiencia_docente || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await docenteService.update(editing.id, form); }
      else { await docenteService.create(form); }
      setShowModal(false); fetchData();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este docente?')) {
      try { await docenteService.delete(id); fetchData(); } catch(e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Docentes</h2>
          <p className="text-sm text-gray-500">Administra el plantel docente del sistema.</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Docente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
            <input type="text" placeholder="Buscar por nombre o CI..." className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg sm:text-sm bg-gray-50" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="p-8 text-center text-gray-500">Cargando...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Docente</th><th className="px-6 py-4 font-medium">CI</th><th className="px-6 py-4 font-medium">Teléfono</th><th className="px-6 py-4 font-medium">Grado Académico</th><th className="px-6 py-4 font-medium">Experiencia</th><th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm mr-3">{item.nombre.charAt(0)}</div>
                        <p className="text-sm font-semibold text-gray-800">{item.nombre}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{item.ci}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.telefono || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.grado_academico || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.experiencia_docente ? `${item.experiencia_docente} años` : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">Sin registros.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Editar Docente' : 'Nuevo Docente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">CI</label><input required disabled={!!editing} className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm disabled:bg-gray-100" value={form.ci} onChange={e => setForm({...form, ci: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label><input required className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico { !editing && '(Creará usuario auto)' }</label><input required={!editing} type="email" disabled={!!editing} className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm disabled:bg-gray-100" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label><input className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                    <option value="">Seleccione...</option><option value="M">Masculino</option><option value="F">Femenino</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Grado Académico</label><input className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" placeholder="Ej: Licenciatura, Maestría" value={form.grado_academico} onChange={e => setForm({...form, grado_academico: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Años Experiencia</label><input type="number" min="0" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.experiencia_docente} onChange={e => setForm({...form, experiencia_docente: e.target.value})} /></div>
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
