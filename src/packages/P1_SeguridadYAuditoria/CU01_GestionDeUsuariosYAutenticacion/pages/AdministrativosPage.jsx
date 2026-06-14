import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Plus, Edit, Trash2, ShieldAlert, BadgeInfo, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const PERMISSION_GROUPS = [
  {
    id: 'panel_group', title: 'Panel Principal',
    permissions: [ { id: 'panel', label: 'Ver Panel (Gráficos)' } ]
  },
  {
    id: 'seguridad_group', title: 'Módulo de Seguridad',
    permissions: [
      { id: 'seguridad_usuarios', label: 'Gestión de Usuarios' },
      { id: 'seguridad_administrativos', label: 'Personal Administrativo' },
      { id: 'seguridad_roles', label: 'Gestión de Roles' },
      { id: 'seguridad_bitacora', label: 'Ver Bitácora' }
    ]
  },
  {
    id: 'postulantes_group', title: 'Módulo de Postulantes',
    permissions: [
      { id: 'postulantes_lista', label: 'Postulantes (Estudiantes)' },
      { id: 'postulantes_docente', label: 'Postulantes a Docente' },
      { id: 'postulantes_requisitos', label: 'Gestión de Requisitos' },
      { id: 'postulantes_documentos', label: 'Verificación de Documentos' },
      { id: 'postulantes_pagos', label: 'Registro de Pagos' }
    ]
  },
  {
    id: 'academico_group', title: 'Módulo Académico',
    permissions: [
      { id: 'academico_gestiones', label: 'Gestiones Académicas' },
      { id: 'academico_carreras', label: 'Carreras' },
      { id: 'academico_materias', label: 'Materias' },
      { id: 'academico_docentes', label: 'Docentes' }
    ]
  },
  {
    id: 'planificacion_group', title: 'Planificación Académica',
    permissions: [
      { id: 'planificacion_grupos', label: 'Asignación de Grupos' },
      { id: 'planificacion_aulas', label: 'Gestión de Aulas' }
    ]
  },
  {
    id: 'herramientas_group', title: 'Herramientas y Reportes IA',
    permissions: [
      { id: 'herramientas_carga', label: 'Carga Masiva (Excel)' },
      { id: 'herramientas_reportes', label: 'Reportes Avanzados IA' }
    ]
  }
];

export default function AdministrativosPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [data, setData] = useState({ super_admins: [], administrativos: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Administrativo'); // 'SuperAdmin' o 'Administrativo'
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const [form, setForm] = useState({
    ci: '', nombre: '', correo: '', telefono: '', tipo: 'Administrativo', cargo: '', area: '', password: '', permisos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      let parsedPermisos = [];
      try {
        parsedPermisos = typeof person.permisos === 'string' ? JSON.parse(person.permisos) : (person.permisos || []);
      } catch(e) {}

      setForm({
        id_persona: person.id_persona,
        ci: person.ci,
        nombre: person.nombre,
        correo: person.correo || person.usuario_email || '',
        telefono: person.telefono || '',
        tipo: person.rol_nombre || (person.area !== undefined ? 'Administrador' : 'Super Admin'),
        cargo: person.cargo || '',
        area: person.area || '',
        password: '', // Vacio para no cambiar si edita
        permisos: parsedPermisos
      });
    } else {
      setEditing(null);
      // Default type based on tab
      const defaultTipo = activeTab === 'SuperAdmin' ? 'Super Admin' : (data.roles?.filter(r => r.nombre !== 'Super Admin')[0]?.nombre || 'Administrador');
      setForm({ ci: '', nombre: '', correo: '', telefono: '', tipo: defaultTipo, cargo: '', area: '', password: '', permisos: [] });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
        {!isCoordinador && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Personal
          </button>
        )}
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
                {!isCoordinador && <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>}
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
                  {!isCoordinador && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(person)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(person.id_persona, person.rol_nombre || (activeTab === 'SuperAdmin' ? 'Super Admin' : 'Administrador'))} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white rounded-2xl w-full ${form.tipo !== 'Super Admin' ? 'max-w-4xl' : 'max-w-lg'} shadow-xl overflow-hidden animate-in zoom-in-95 duration-200`}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{editing ? 'Editar Personal' : 'Nuevo Personal'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col h-full">
              <div className={form.tipo !== 'Super Admin' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-4'}>
                {/* Columna Izquierda: Datos del Usuario */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">CI *</label>
                      <input required disabled={!!editing} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={form.ci} onChange={e => setForm({...form, ci: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Rol *</label>
                      <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={!!editing} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
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
                    <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico *</label>
                      <input required type="email" name="new-email-admin" autoComplete="off" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Cargo *</label>
                      <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej. Secretario" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} />
                    </div>
                    {form.tipo !== 'Super Admin' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Área</label>
                        <input type="text" name="new-area-admin" autoComplete="off" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej. Finanzas" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña {editing ? '(Dejar vacío)' : '*'}</label>
                    <input required={!editing} type="password" name="new-password-admin" autoComplete="new-password" minLength="6" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                  </div>
                </div>

                {/* Columna Derecha: Permisos */}
                {form.tipo !== 'Super Admin' && (
                  <div className="md:border-l md:border-gray-100 md:pl-6 flex flex-col max-h-[400px]">
                    <label className="block text-sm font-bold text-gray-800 mb-1">Permisos de Acceso</label>
                    <p className="text-xs text-gray-500 mb-4">Selecciona los módulos a los que este usuario tendrá acceso.</p>
                    <div className="space-y-2 overflow-y-auto pr-2 flex-1 pb-2">
                      {PERMISSION_GROUPS.map((group) => {
                        const isExpanded = !!expandedGroups[group.id];
                        const groupPermissions = group.permissions.map(p => p.id);
                        const hasAll = groupPermissions.every(id => form.permisos.includes(id));
                        const hasSome = groupPermissions.some(id => form.permisos.includes(id));

                        return (
                          <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div 
                              className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => setExpandedGroups({ ...expandedGroups, [group.id]: !isExpanded })}
                            >
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                  checked={hasAll}
                                  ref={input => { if (input) input.indeterminate = hasSome && !hasAll; }}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const newPerms = new Set([...form.permisos, ...groupPermissions]);
                                      setForm({ ...form, permisos: Array.from(newPerms) });
                                    } else {
                                      const newPerms = form.permisos.filter(id => !groupPermissions.includes(id));
                                      setForm({ ...form, permisos: newPerms });
                                    }
                                  }}
                                />
                                <span className="text-sm font-bold text-gray-700">{group.title}</span>
                              </div>
                              <span className="text-gray-400 text-[10px]">
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>
                            
                            {isExpanded && (
                              <div className="px-3 py-1.5 bg-white border-t border-gray-100 space-y-1">
                                {group.permissions.map((perm) => (
                                  <label key={perm.id} className="flex items-center gap-2 py-1 pl-6 cursor-pointer hover:bg-gray-50 rounded transition-colors">
                                    <input
                                      type="checkbox"
                                      className="w-3.5 h-3.5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                                      checked={form.permisos.includes(perm.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setForm({ ...form, permisos: [...form.permisos, perm.id] });
                                        } else {
                                          setForm({ ...form, permisos: form.permisos.filter(p => p !== perm.id) });
                                        }
                                      }}
                                    />
                                    <span className="text-xs text-gray-600">{perm.label}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
