import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, User as UserIcon, CheckCircle2, AlertCircle, Save, Filter, ChevronRight } from 'lucide-react';
import { requisitoService } from '../services/requisitoService';
import { materiaService } from '../../../P4_OfertaAcademica/CU6_GestionarMaterias/services/materiaService';
import { toast } from 'react-hot-toast';

export default function RequisitosPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [searchTerm, setSearchTerm] = useState('');
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Postulante');

  // Modal Crear/Editar
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', tipo_requisito: 'Postulante', estado: 'Activo' });

  // Materias Section
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [materiaRequisitos, setMateriaRequisitos] = useState([]); // List of requirement objects with assignment state
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [savingAsignacion, setSavingAsignacion] = useState(false);

  useEffect(() => {
    fetchData();
    fetchMaterias();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await requisitoService.getCatalogo();
      setCatalogo(data);
    } catch (error) {
      console.error("Error al cargar catálogo", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterias = async () => {
    try {
      const data = await materiaService.getAll();
      setMaterias(data);
    } catch (error) {
      console.error("Error al cargar materias", error);
    }
  };

  const fetchMateriaRequisitos = async (materiaId) => {
    if (!materiaId) {
      setMateriaRequisitos([]);
      return;
    }
    setLoadingMaterias(true);
    try {
      const data = await requisitoService.getMateriaRequisitos(materiaId);
      // Map data to local state
      const mapped = data.map(r => ({
        requisito_id: r.requisito_id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        seleccionado: r.asignado === 1,
        obligatorio: r.asignado === 1 ? (r.obligatorio ? 'Sí' : 'No') : 'Sí',
        estado: r.asignado === 1 ? r.relacion_estado : 'Activo'
      }));
      setMateriaRequisitos(mapped);
    } catch (error) {
      console.error("Error al cargar requisitos de materia", error);
    } finally {
      setLoadingMaterias(false);
    }
  };

  const handleMateriaChange = (e) => {
    const val = e.target.value;
    setSelectedMateria(val);
    fetchMateriaRequisitos(val);
  };

  const handleReqMateriaChange = (reqId, field, value) => {
    setMateriaRequisitos(prev => prev.map(req => {
      if (req.requisito_id === reqId) {
        return { ...req, [field]: value };
      }
      return req;
    }));
  };

  const saveAsignacion = async () => {
    if (!selectedMateria) return;
    setSavingAsignacion(true);
    try {
      // Filter only selected
      const asignaciones = materiaRequisitos
        .filter(r => r.seleccionado)
        .map(r => ({
          requisito_id: r.requisito_id,
          obligatorio: r.obligatorio === 'Sí',
          estado: r.estado
        }));

      await requisitoService.syncMateriaRequisitos(selectedMateria, asignaciones);
      toast.success('Asignación guardada exitosamente');
      fetchMateriaRequisitos(selectedMateria); // refresh
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar asignación');
    } finally {
      setSavingAsignacion(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', descripcion: '', tipo_requisito: 'Postulante', estado: 'Activo' });
    setShowModal(true);
  };

  const openEdit = (req) => {
    setEditing(req);
    setForm({ 
      nombre: req.nombre, 
      descripcion: req.descripcion || '', 
      tipo_requisito: req.tipo_requisito || 'Postulante', 
      estado: req.estado || 'Activo' 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.tipo_requisito) {
      toast.error("Nombre y Tipo son obligatorios");
      return;
    }
    try {
      if (editing) {
        await requisitoService.updateCatalogo(editing.id, form);
      } else {
        await requisitoService.createCatalogo(form);
      }
      setShowModal(false);
      fetchData();
      if (selectedMateria) fetchMateriaRequisitos(selectedMateria);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al procesar el requisito");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este requisito?")) {
      try {
        await requisitoService.deleteCatalogo(id);
        fetchData();
        if (selectedMateria) fetchMateriaRequisitos(selectedMateria);
      } catch (error) {
        console.error("Error al eliminar", error);
        toast.error("No se pudo eliminar el requisito. Es posible que esté en uso.");
      }
    }
  };

  const filteredData = catalogo.filter(c => {
    const tipo = c.tipo_requisito || 'Postulante';
    return tipo === activeTab &&
      (c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (tipo.toLowerCase().includes(searchTerm.toLowerCase())));
  });

  const getTipoBadge = (tipo) => {
    if (tipo === 'Materia') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100">
          <BookOpen className="w-3.5 h-3.5" /> Materia
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
        <UserIcon className="w-3.5 h-3.5" /> Postulante
      </span>
    );
  };

  const getEstadoBadge = (estado) => {
    if (estado === 'Activo') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-green-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-600">
        <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Inactivo
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Catálogo de Requisitos</h2>
          <p className="text-sm text-gray-500">Gestiona los requisitos generales del sistema.</p>
        </div>
        {!isCoordinador && (
          <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl flex items-center shadow-sm transition-colors text-sm font-bold">
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Requisito
          </button>
        )}
      </div>

      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o tipo..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary text-sm bg-white shadow-sm transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* SECTION 1: CATÁLOGO */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 tracking-tight">1. Catálogo de Requisitos</h3>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button 
            onClick={() => setActiveTab('Postulante')}
            className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'Postulante' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <UserIcon className="w-4 h-4" /> Postulante
          </button>
          <button 
            onClick={() => setActiveTab('Materia')}
            className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'Materia' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <BookOpen className="w-4 h-4" /> Materia
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Cargando catálogo...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white text-gray-500 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-5">Nombre del Requisito</th>
                    <th className="px-6 py-5">Descripción General</th>
                    <th className="px-6 py-5 text-center">Tipo de Requisito</th>
                    <th className="px-6 py-5 text-center">Estado</th>
                    {!isCoordinador && <th className="px-6 py-5 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{cat.nombre}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500">{cat.descripcion || 'Sin descripción'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getTipoBadge(cat.tipo_requisito)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getEstadoBadge(cat.estado)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCoordinador && (
                          <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Editar">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Eliminar">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                        No se encontraron requisitos con esos criterios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                 <span className="text-xs text-gray-500">Mostrando {filteredData.length} registros</span>
                 {/* Pagination placeholder */}
                 <div className="flex items-center gap-1">
                    <button className="p-1 rounded text-gray-400 bg-white border border-gray-200"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                    <button className="px-2.5 py-1 rounded text-xs font-bold text-white bg-blue-500 border border-blue-500">1</button>
                    <button className="p-1 rounded text-gray-400 bg-white border border-gray-200"><ChevronRight className="w-4 h-4" /></button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: ASIGNACIÓN */}
      {activeTab === 'Materia' && (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-800 tracking-tight">2. Asignación de requisitos por materia</h3>
        <p className="text-sm text-gray-500 mb-6">Asigna requisitos tipo "Materia" a una materia específica.</p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <label className="text-sm font-bold text-gray-700">Materia:</label>
          <select 
            className="w-full sm:w-96 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-primary focus:border-primary transition-colors"
            value={selectedMateria}
            onChange={handleMateriaChange}
          >
            <option value="">Seleccionar materia...</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        {selectedMateria && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {loadingMaterias ? (
              <div className="py-8 text-center text-gray-500 text-sm">Cargando requisitos...</div>
            ) : materiaRequisitos.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                No hay requisitos tipo "Materia" registrados en el catálogo.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      <th className="px-6 py-4 text-center w-24">Seleccionar</th>
                      <th className="px-6 py-4">Requisito</th>
                      <th className="px-6 py-4">Descripción</th>
                      <th className="px-6 py-4 w-32">Obligatorio</th>
                      <th className="px-6 py-4 w-40">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {materiaRequisitos.map(req => (
                      <tr key={req.requisito_id} className={`transition-colors ${req.seleccionado ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={req.seleccionado}
                            onChange={(e) => handleReqMateriaChange(req.requisito_id, 'seleccionado', e.target.checked)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-800">{req.nombre}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-500">{req.descripcion || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            className={`w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-primary focus:border-primary transition-colors ${req.seleccionado ? 'bg-white' : 'bg-gray-50 opacity-50'}`}
                            value={req.obligatorio}
                            onChange={(e) => handleReqMateriaChange(req.requisito_id, 'obligatorio', e.target.value)}
                            disabled={!req.seleccionado}
                          >
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            className={`w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-primary focus:border-primary transition-colors ${req.seleccionado ? 'bg-white font-medium' : 'bg-gray-50 opacity-50'} ${req.estado === 'Activo' && req.seleccionado ? 'text-green-600' : 'text-amber-600'}`}
                            value={req.estado}
                            onChange={(e) => handleReqMateriaChange(req.requisito_id, 'estado', e.target.value)}
                            disabled={!req.seleccionado}
                          >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {materiaRequisitos.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-4 py-2.5 rounded-lg w-full sm:w-auto font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Solo se muestran requisitos de tipo "Materia".
                </div>
                {!isCoordinador && (
                  <button 
                    onClick={saveAsignacion}
                    disabled={savingAsignacion}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingAsignacion ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {savingAsignacion ? 'Guardando...' : 'Guardar asignación'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="text-lg font-bold text-gray-800">{editing ? 'Editar Requisito' : 'Nuevo Requisito'}</h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nombre del Requisito *</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:ring-primary focus:border-primary transition-colors"
                  value={form.nombre}
                  onChange={(e) => setForm({...form, nombre: e.target.value})}
                  placeholder="Ej: Fotocopia de CI"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Descripción General</label>
                <textarea 
                  className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:ring-primary focus:border-primary transition-colors resize-none"
                  rows="3"
                  value={form.descripcion}
                  onChange={(e) => setForm({...form, descripcion: e.target.value})}
                  placeholder="Añade detalles sobre el documento..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tipo de Requisito *</label>
                  <select 
                    required
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:ring-primary focus:border-primary transition-colors font-medium"
                    value={form.tipo_requisito}
                    onChange={(e) => setForm({...form, tipo_requisito: e.target.value})}
                  >
                    <option value="Postulante">Postulante</option>
                    <option value="Materia">Materia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Estado</label>
                  <select 
                    className={`w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:ring-primary focus:border-primary transition-colors font-medium ${form.estado === 'Activo' ? 'text-green-600' : 'text-amber-600'}`}
                    value={form.estado}
                    onChange={(e) => setForm({...form, estado: e.target.value})}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm">{editing ? 'Actualizar Cambios' : 'Guardar Requisito'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

