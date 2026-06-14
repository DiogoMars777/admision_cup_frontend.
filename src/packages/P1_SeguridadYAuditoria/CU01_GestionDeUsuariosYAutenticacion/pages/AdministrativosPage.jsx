import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Plus, Edit, Trash2, ShieldAlert, BadgeInfo, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function AdministrativosPage() {
  const [data, setData] = useState({ super_admins: [], administrativos: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Administrativo'); // 'SuperAdmin' o 'Administrativo'
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    ci: '', nombre: '', correo: '', telefono: '', tipo: 'Administrativo', cargo: '', area: '', password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/administrativos`, { headers: getHeaders() });
      setData(res.data);
    } catch (error) {
      toast.error('Error al cargar personal');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (person = null) => {
    if (person) {
      setEditing(person);
      setForm({
        id_persona: person.id_persona,
        ci: person.ci,
        nombre: person.nombre,
        correo: person.correo || person.usuario_email || '',
        telefono: person.telefono || '',
        tipo: person.rol_nombre || (person.area !== undefined ? 'Administrador' : 'Super Admin'),
        cargo: person.cargo || '',
        area: person.area || '',
        password: '' // Vacio para no cambiar si edita
      });
    } else {
      setEditing(null);
      // Default type based on tab
      const defaultTipo = activeTab === 'SuperAdmin' ? 'Super Admin' : (data.roles?.filter(r => r.nombre !== 'Super Admin')[0]?.nombre || 'Administrador');
      setForm({ ci: '', nombre: '', correo: '', telefono: '', tipo: defaultTipo, cargo: '', area: '', password: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/administrativos/${editing.id_persona}`, form, { headers: getHeaders() });
        toast.success('Personal actualizado');
      } else {
        await axios.post(`${API}/administrativos`, form, { headers: getHeaders() });
        toast.success('Personal registrado');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ocurrió un error');
    }
  };

  const handleDelete = async (id_persona, tipo) => {
    if (window.confirm('¿Eliminar este registro permanentemente?')) {
      try {
        await axios.delete(`${API}/administrativos/${id_persona}?tipo=${tipo === 'Super Admin' ? 'SuperAdmin' : 'Administrativo'}`, { headers: getHeaders() });
        toast.success('Eliminado correctamente');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const currentData = activeTab === 'SuperAdmin' ? data.super_admins : data.administrativos;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Personal Administrativo
          </h2>
          <p className="text-sm text-gray-500">Gestión de super administradores y administrativos del sistema.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Personal
        </button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('Administrativo')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === 'Administrativo' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="w-4 h-4" /> Administrativos ({data.administrativos?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('SuperAdmin')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === 'SuperAdmin' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Super Admins ({data.super_admins?.length || 0})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : !currentData || currentData.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <BadgeInfo className="w-12 h-12 mb-3 opacity-20" />
            No hay registros para mostrar.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nombre y CI</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cargo</th>
                {activeTab === 'Administrativo' && (
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Área / Rol</th>
                )}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Contacto</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentData.map((person) => (
                <tr key={person.id_persona} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800">{person.nombre}</p>
                    <p className="text-xs text-gray-500 font-mono">CI: {person.ci}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700">{person.cargo || '-'}</span>
                  </td>
                  {activeTab === 'Administrativo' && (
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-200">
                          {person.rol_nombre || 'Administrador'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold border border-gray-200">
                          Área: {person.area || 'General'}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <p className="text-sm text-blue-600">{person.usuario_email || person.correo || '-'}</p>
                    <p className="text-xs text-gray-500">{person.telefono || 'Sin telf.'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(person)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(person.id_persona, person.rol_nombre || (activeTab === 'SuperAdmin' ? 'Super Admin' : 'Administrador'))} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{editing ? 'Editar Personal' : 'Nuevo Personal'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">CI *</label>
                  <input required disabled={!!editing} type="text" className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100" value={form.ci} onChange={e => setForm({...form, ci: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Rol *</label>
                  <select required className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100" disabled={!!editing} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                    {data.roles && data.roles.length > 0 ? (
                      data.roles.map(r => (
                        <option key={r.id} value={r.nombre}>{r.nombre}</option>
                      ))
                    ) : (
                      <>
                        <option value="Administrador">Administrador</option>
                        <option value="Coordinador">Coordinador</option>
                        <option value="Super Admin">Super Administrador</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nombre Completo *</label>
                <input required type="text" className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico * (Para Login)</label>
                  <input required type="email" className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                  <input type="text" className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Cargo *</label>
                  <input required type="text" className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej. Secretario" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} />
                </div>
                {form.tipo !== 'Super Admin' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Área</label>
                    <input type="text" className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej. Finanzas" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña {editing ? '(Dejar vacío para no cambiar)' : '*'}</label>
                <input required={!editing} type="password" minLength="6" className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
