import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Info, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { postulanteService } from '../services/postulanteService';

export default function ListaPostulantesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal para crear y editar
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // Estado del formulario
  const [form, setForm] = useState({ 
    ci: '', nombre: '', email: '', fecha_nac: '', sexo: '', telefono: '', direccion: '', colegio: '',
    carrera1: '', modalidad1: '', carrera2: '', modalidad2: '', turno: 'Mañana', modalidad_preferida: 'Presencial'
  });
  const [showCarrera2, setShowCarrera2] = useState(false);

  const carrerasDisponibles = ['Ingeniería de Sistemas', 'Ingeniería Informática', 'Medicina', 'Derecho', 'Arquitectura', 'Contaduría Pública'];
  const modalidades = ['Presencial', 'Virtual', 'Semi-Presencial'];

  useEffect(() => {
    fetchPostulantes();
  }, [searchTerm]);

  const fetchPostulantes = async () => {
    try {
      const data = await postulanteService.getAll(searchTerm);
      setPostulantes(data);
    } catch (error) {
      console.error("Error al cargar postulantes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este postulante?")) {
      try {
        await postulanteService.delete(id);
        fetchPostulantes();
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ci: '', nombre: '', email: '', fecha_nac: '', sexo: '', telefono: '', direccion: '', colegio: '' });
    setShowModal(true);
  };

  const openEdit = (postulante) => {
    setEditing(postulante);
    setForm({
      ci: postulante.ci || '',
      nombre: postulante.nombre,
      email: postulante.email || '',
      fecha_nac: postulante.fecha_nac || '',
      sexo: postulante.sexo || '',
      telefono: postulante.telefono || '',
      direccion: postulante.direccion || '',
      colegio: postulante.colegio || '',
      carrera1: postulante.carrera1 || '',
      modalidad1: postulante.modalidad1 || '',
      carrera2: postulante.carrera2 || '',
      modalidad2: postulante.modalidad2 || '',
      turno: postulante.turno || 'Mañana',
      modalidad_preferida: postulante.modalidad_preferida || 'Presencial'
    });
    setShowCarrera2(!!postulante.carrera2);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await postulanteService.update(editing.id, form);
      } else {
        await postulanteService.create(form);
      }
      setShowModal(false);
      fetchPostulantes();
    } catch (error) {
      alert(error.response?.data?.message || "Error al procesar la solicitud");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Postulantes</h2>
          <p className="text-sm text-gray-500">Lista completa de estudiantes postulados al sistema.</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Postulante
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
              placeholder="Buscar por nombre o CI..."
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
          <div className="p-8 text-center text-gray-500">Cargando postulantes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Postulante</th>
                  <th className="px-6 py-4 font-medium">Documento</th>
                  <th className="px-6 py-4 font-medium">Contacto</th>
                  <th className="px-6 py-4 font-medium">Colegio</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {postulantes.map((postulante) => (
                  <tr key={postulante.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">{postulante.nombre}</p>
                      <p className="text-xs text-gray-500">{postulante.sexo === 'M' ? 'Masculino' : postulante.sexo === 'F' ? 'Femenino' : 'N/E'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {postulante.ci}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {postulante.telefono || 'Sin teléfono'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {postulante.colegio || 'No especificado'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => navigate('/p2/documentos', { state: { autoOpenPostulanteId: postulante.id } })} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Ver Documentos">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(postulante)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(postulante.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {postulantes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                      No se encontraron postulantes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800">{editing ? 'Editar Postulante' : 'Registrar Nuevo Postulante'}</h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="postulanteForm" onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div>
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-1 rounded-md"><Eye className="w-4 h-4"/></span> 
                    Datos Personales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carnet de Identidad (CI)</label>
                  <input required disabled={!!editing} className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm disabled:bg-gray-100" placeholder="Ej. 12345678" value={form.ci} onChange={e => setForm({...form, ci: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input required className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" placeholder="Nombres y Apellidos" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (Para creación de cuenta auto)</label>
                  <input required type="email" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" placeholder="ejemplo@correo.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input type="date" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.fecha_nac} onChange={e => setForm({...form, fecha_nac: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                    <option value="">Seleccione...</option><option value="M">Masculino</option><option value="F">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" placeholder="Ej. 70000000" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colegio de Egreso</label>
                  <input className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" placeholder="Nombre del Colegio" value={form.colegio} onChange={e => setForm({...form, colegio: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Domicilio</label>
                  <input className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" placeholder="Barrio, Calle, Número" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
                </div>
              </div>
              
                </div>

                {/* SECCIÓN 2: SELECCIÓN ACADÉMICA */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-4 border-b border-emerald-100 pb-2 flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-600 p-1 rounded-md"><BookOpen className="w-4 h-4"/></span> 
                    Selección Académica
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Columna Izquierda: Formulario Académico */}
                    <div className="md:col-span-7 space-y-5">
                      
                      {/* Turno y Modalidad General */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Turno */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-bold text-gray-800">Turno de Preferencia</label>
                              <div className="group relative cursor-help">
                                <Info className="w-4 h-4 text-gray-400" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                  Turno principal para las clases.
                                </div>
                              </div>
                            </div>
                            <select 
                              required
                              className="w-full border-gray-300 rounded-lg px-3 py-2.5 border sm:text-sm bg-white focus:ring-primary focus:border-primary" 
                              value={form.turno} 
                              onChange={e => setForm({...form, turno: e.target.value})}
                            >
                              <option value="Mañana">Mañana (Por defecto)</option>
                              <option value="Tarde">Tarde</option>
                              <option value="Noche">Noche</option>
                            </select>
                            {form.turno === 'Mañana' && (
                              <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Turno asignado automáticamente.
                              </p>
                            )}
                          </div>

                          {/* Modalidad Preferida */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-bold text-gray-800">Modalidad Preferida</label>
                              <div className="group relative cursor-help">
                                <Info className="w-4 h-4 text-gray-400" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                  Modalidad de estudio general de preferencia.
                                </div>
                              </div>
                            </div>
                            <select 
                              required
                              className="w-full border-gray-300 rounded-lg px-3 py-2.5 border sm:text-sm bg-white focus:ring-primary focus:border-primary" 
                              value={form.modalidad_preferida} 
                              onChange={e => setForm({...form, modalidad_preferida: e.target.value})}
                            >
                              <option value="Presencial">Presencial (Por defecto)</option>
                              <option value="Virtual">Virtual</option>
                              <option value="Semi-Presencial">Semi-Presencial</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Carrera 1 */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-800 border-b border-gray-100 pb-1">Preferencia 1 (Obligatoria)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Carrera</label>
                            <select 
                              required
                              className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm focus:ring-primary focus:border-primary" 
                              value={form.carrera1} 
                              onChange={e => setForm({...form, carrera1: e.target.value})}
                            >
                              <option value="">Selecciona una carrera...</option>
                              {carrerasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Modalidad</label>
                            <select 
                              required={!!form.carrera1}
                              className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm focus:ring-primary focus:border-primary disabled:bg-gray-100" 
                              value={form.modalidad1} 
                              onChange={e => setForm({...form, modalidad1: e.target.value})}
                              disabled={!form.carrera1}
                            >
                              <option value="">Modalidad...</option>
                              {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Carrera 2 */}
                      {showCarrera2 ? (
                        <div className="space-y-3 pt-3 border-t border-gray-100 relative">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                            <label className="block text-sm font-bold text-gray-800">Preferencia 2 (Opcional)</label>
                            <button 
                              type="button" 
                              onClick={() => {
                                setShowCarrera2(false);
                                setForm({...form, carrera2: '', modalidad2: ''});
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              Quitar
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Carrera</label>
                              <select 
                                required={showCarrera2}
                                className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm focus:ring-primary focus:border-primary" 
                                value={form.carrera2} 
                                onChange={e => setForm({...form, carrera2: e.target.value})}
                              >
                                <option value="">Selecciona una carrera...</option>
                                {carrerasDisponibles.filter(c => c !== form.carrera1).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Modalidad</label>
                              <select 
                                required={!!form.carrera2}
                                className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm focus:ring-primary focus:border-primary disabled:bg-gray-100" 
                                value={form.modalidad2} 
                                onChange={e => setForm({...form, modalidad2: e.target.value})}
                                disabled={!form.carrera2}
                              >
                                <option value="">Modalidad...</option>
                                {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2">
                          <button 
                            type="button"
                            onClick={() => setShowCarrera2(true)}
                            className="text-sm font-medium text-primary hover:text-primary-dark flex items-center border border-dashed border-blue-300 rounded-lg px-4 py-2 w-full justify-center bg-blue-50/50 hover:bg-blue-50 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Agregar una segunda opción de carrera
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Columna Derecha: Resumen Dinámico */}
                    <div className="md:col-span-5">
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 h-full">
                        <h5 className="font-bold text-emerald-800 mb-4 text-sm flex items-center"><Eye className="w-4 h-4 mr-2" /> Resumen de Selección</h5>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase">Turno</p>
                              <p className="font-medium text-gray-800">{form.turno || 'Mañana'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase">Modalidad Gral.</p>
                              <p className="font-medium text-gray-800">{form.modalidad_preferida || 'Presencial'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Opción 1</p>
                            {form.carrera1 ? (
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{form.carrera1}</p>
                                <p className="text-xs text-emerald-600 font-medium bg-emerald-100/50 inline-block px-2 py-0.5 rounded mt-1">
                                  {form.modalidad1 || 'Modalidad pendiente'}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No seleccionada</p>
                            )}
                          </div>

                          {showCarrera2 && (
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase">Opción 2</p>
                              {form.carrera2 ? (
                                <div>
                                  <p className="font-bold text-gray-800 text-sm">{form.carrera2}</p>
                                  <p className="text-xs text-emerald-600 font-medium bg-emerald-100/50 inline-block px-2 py-0.5 rounded mt-1">
                                    {form.modalidad2 || 'Modalidad pendiente'}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 italic">No seleccionada</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            {/* FOOTER */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end space-x-3 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">Cancelar</button>
              <button type="submit" form="postulanteForm" className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm">{editing ? 'Actualizar Postulante' : 'Guardar Postulante'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
