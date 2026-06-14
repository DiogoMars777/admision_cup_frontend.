import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import UsuarioTable from '../components/UsuarioTable';
import { usuarioService } from '../services/usuarioService';
import { toast } from 'react-hot-toast';

export default function UsuariosPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Administrativo');
  
  // Estados para Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ ci: '', nombre: '', email: '', password: '', id_rol: '' });

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, [searchTerm]);

  const fetchRoles = async () => {
    try {
      const res = await usuarioService.getRoles();
      setRoles(res);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usuarioService.getAll(searchTerm);
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ci: '', nombre: '', email: '', password: '', id_rol: '' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ 
      ci: user.ci, 
      nombre: user.nombre, 
      email: user.email, 
      password: '', // Vacío por seguridad, solo se manda si lo cambia
      id_rol: user.id_rol || '' 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await usuarioService.update(editing.id, form);
      } else {
        await usuarioService.create(form);
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (error) {
      // toast.error(error.response?.data?.message || 'Error al guardar el usuario'); (Manejado globalmente)
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await usuarioService.toggleStatus(id);
      fetchUsuarios();
    } catch (error) {
      console.error("Error al cambiar estado", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este usuario permanentemente?')) {
      try {
        await usuarioService.delete(id);
        fetchUsuarios();
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500">Administra los accesos y roles del sistema.</p>
        </div>
        {!isCoordinador && (
          <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Pestañas de filtrado por Rol */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('Administrativo')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'Administrativo' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Administrativo
        </button>
        <button 
          onClick={() => setActiveTab('Postulantes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'Postulantes' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Postulantes
        </button>
        <button 
          onClick={() => setActiveTab('Docentes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'Docentes' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Docentes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o CI..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary sm:text-sm bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center text-gray-600 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
        ) : (
          <UsuarioTable 
            usuarios={usuarios.filter(u => {
              if (activeTab === 'Postulantes') return u.rol === 'Postulante';
              if (activeTab === 'Docentes') return u.rol === 'Docente';
              return u.rol !== 'Postulante' && u.rol !== 'Docente';
            })} 
            searchTerm={searchTerm} 
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onEdit={openEdit}
            isCoordinador={isCoordinador}
          />
        )}
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CI</label>
                  <input required disabled={!!editing} className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm disabled:bg-gray-100" value={form.ci} onChange={e => setForm({...form, ci: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input required className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input required type="email" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{editing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                  <input type="password" required={!editing} className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editing ? 'Dejar vacío para no cambiar' : ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select required className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.id_rol} onChange={e => setForm({...form, id_rol: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.nombre.replace('_', ' ')}</option>)}
                  </select>
                </div>
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
