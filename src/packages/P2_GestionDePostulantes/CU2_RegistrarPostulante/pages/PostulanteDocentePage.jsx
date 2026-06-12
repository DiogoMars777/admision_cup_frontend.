import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Eye, ChevronRight, ArrowLeft, BookOpen, CheckCircle, FileText, Upload, UserPlus, Info, Pencil, Lock, ShieldCheck, CheckCircle2, Trash2 } from 'lucide-react';
import { aspiranteDocenteService } from '../services/aspiranteDocenteService';
import { materiaService } from '../../../P3_GestionAcademicaBase/CU6_GestionarMaterias/services/materiaService';
import { toast } from 'react-hot-toast';

export default function PostulanteDocentePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [aspirantes, setAspirantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAspirante, setSelectedAspirante] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [requisitos, setRequisitos] = useState([]);
  const [editMode, setEditMode] = useState(false); // controla si los checkboxes están bloqueados
  const [saving, setSaving] = useState(false);
  
  // Modals
  const [showNuevaPostulacion, setShowNuevaPostulacion] = useState(false);
  const [showNuevoAspirante, setShowNuevoAspirante] = useState(false);
  const [isEditingAspirante, setIsEditingAspirante] = useState(false);
  
  // Catalogs
  const [catalogoMaterias, setCatalogoMaterias] = useState([]);

  // Form states
  const [materiaASeleccionar, setMateriaASeleccionar] = useState('');
  const [formAspirante, setFormAspirante] = useState({ ci: '', nombre: '', email: '', telefono: '', sexo: 'M', grado_academico: '', experiencia: 0 });

  useEffect(() => {
    fetchAspirantes();
    fetchCatalogoMaterias();
  }, [searchTerm]);

  const fetchAspirantes = async () => {
    try {
      setLoading(true);
      const data = await aspiranteDocenteService.getAll(searchTerm);
      setAspirantes(data);
    } catch (error) {
      console.error("Error fetching aspirantes", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogoMaterias = async () => {
    try {
      const response = await materiaService.getAll();
      setCatalogoMaterias(response);
    } catch (error) {
      console.error("Error fetching materias catalog", error);
    }
  };

  const loadMaterias = async (idAspirante) => {
    try {
      const data = await aspiranteDocenteService.getMaterias(idAspirante);
      setMaterias(data);
      setSelectedMateria(null);
      setRequisitos([]);
    } catch (error) {
      console.error("Error fetching materias", error);
    }
  };

  const handleSelectAspirante = async (aspirante) => {
    setSelectedAspirante(aspirante);
    await loadMaterias(aspirante.id);
  };

  const handleSelectMateria = async (materia) => {
    setSelectedMateria(materia);
    setEditMode(false); // reset modo edición al cambiar materia
    try {
      const data = await aspiranteDocenteService.getRequisitosMateria(selectedAspirante.id, materia.id_materia);
      setRequisitos(data);
    } catch (error) {
      console.error("Error fetching requisitos", error);
    }
  };

  const handleToggleRequisito = useCallback((reqId, currentVal) => {
    const newVal = !currentVal;
    // Actualización local
    setRequisitos(prev => prev.map(r =>
      r.id_materia_requisito === reqId
        ? { ...r, cumplido: newVal, estado: newVal ? 'Cumplido' : 'Pendiente' }
        : r
    ));
  }, []);

  const handleSaveRequisitos = async (markComplete = false) => {
    setSaving(markComplete ? 'complete' : 'partial');
    try {
      const updatedReqs = markComplete ? requisitos.map(r => ({ ...r, cumplido: true, estado: 'Cumplido' })) : requisitos;
      if (markComplete) setRequisitos(updatedReqs);

      const promises = updatedReqs.map(req => 
        aspiranteDocenteService.toggleRequisito({
          id_aspirante: selectedAspirante.id,
          id_materia_requisito: req.id_materia_requisito,
          cumplido: req.cumplido
        })
      );
      await Promise.all(promises);

      // Actualiza materias y aspirantes en paralelo sin bloquear la UI
      await Promise.all([
        aspiranteDocenteService.getMaterias(selectedAspirante.id).then(setMaterias),
        aspiranteDocenteService.getAll(searchTerm).then(setAspirantes)
      ]);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving reqs", error);
      toast.error('Error al guardar validaciones');
    } finally {
      setSaving(false);
    }
  };

  const handlePostularMateria = async (e) => {
    e.preventDefault();
    if (!materiaASeleccionar) return;
    try {
      await aspiranteDocenteService.postularMateria({
        id_aspirante: selectedAspirante.id,
        id_materia: materiaASeleccionar
      });
      setShowNuevaPostulacion(false);
      setMateriaASeleccionar('');
      await loadMaterias(selectedAspirante.id);
      fetchAspirantes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al postular');
    }
  };

  const handleSubmitAspirante = async (e) => {
    e.preventDefault();
    try {
      if (isEditingAspirante) {
        await aspiranteDocenteService.update(formAspirante.id, formAspirante);
      } else {
        await aspiranteDocenteService.create(formAspirante);
      }
      setShowNuevoAspirante(false);
      setFormAspirante({ ci: '', nombre: '', email: '', telefono: '', sexo: 'M', grado_academico: '', experiencia: 0 });
      setIsEditingAspirante(false);
      fetchAspirantes();
    } catch (error) {
      toast.error(error.response?.data?.message || (isEditingAspirante ? 'Error al actualizar' : 'Error al crear'));
    }
  };

  const handleEditClick = (e, aspirante) => {
    e.stopPropagation();
    setFormAspirante({
      id: aspirante.id,
      ci: aspirante.ci || '',
      nombre: aspirante.nombre || '',
      email: aspirante.email || '',
      telefono: aspirante.telefono || '',
      sexo: aspirante.sexo || 'M',
      grado_academico: aspirante.grado_academico || '',
      experiencia: aspirante.experiencia || 0
    });
    setIsEditingAspirante(true);
    setShowNuevoAspirante(true);
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if(window.confirm('¿Está seguro de eliminar a este aspirante?')) {
      try {
        await aspiranteDocenteService.delete(id);
        fetchAspirantes();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error al eliminar');
      }
    }
  };

  const handleConvertirDocente = async () => {
    if(window.confirm('¿Desea aprobar y convertir a este aspirante en Docente oficial?\n\nSe realizará lo siguiente:\n• Se verificarán los requisitos automáticamente\n• Se creará un usuario con contraseña = su carnet de identidad\n• Se asignará el rol Docente\n• Se le enviará un correo con sus credenciales y materias')) {
      try {
        const response = await aspiranteDocenteService.convertirADocente(selectedAspirante.id);
        toast.success(`¡Conversión exitosa!\n\n• ${response.materias_aprobadas} materia(s) aprobadas\n• Usuario: ${response.email}\n• Contraseña: Su carnet (CI)\n• Correo enviado con credenciales`);
        setSelectedAspirante(null);
        fetchAspirantes();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error al convertir');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'activo':
      case 'aprobada':
      case 'cumplido':
      case 'docente oficial':
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap">Activo</span>;
      case 'en revisión':
      case 'en preparación':
      case 'pendiente':
        return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap">{status}</span>;
      case 'inactivo':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap">Inactivo</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap">{status || 'Activo'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Postulantes Docentes</h2>
          <p className="text-sm text-gray-500">Gestiona a los usuarios registrados como aspirantes a docente.</p>
        </div>
        {!selectedAspirante && (
          <button 
            onClick={() => {
              setFormAspirante({ ci: '', nombre: '', email: '', telefono: '', sexo: 'M', grado_academico: '', experiencia: 0 });
              setIsEditingAspirante(false);
              setShowNuevoAspirante(true);
            }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Aspirante
          </button>
        )}
      </div>

      {!selectedAspirante ? (
        // LIST VIEW
        <div className="flex gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o documento..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary sm:text-sm bg-gray-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando aspirantes...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-4 font-medium">Aspirante</th>
                      <th className="px-6 py-4 font-medium">Carnet</th>
                      <th className="px-6 py-4 font-medium text-center">Materias</th>
                      <th className="px-6 py-4 font-medium">Estado</th>
                      <th className="px-6 py-4 font-medium text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {aspirantes.map((aspirante) => (
                      <tr 
                        key={aspirante.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleSelectAspirante(aspirante)}
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                            {aspirante.nombre.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{aspirante.nombre}</p>
                            <p className="text-xs text-gray-500">{aspirante.email || 'sin@email.com'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                          {aspirante.ci}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-blue-600 font-medium bg-blue-50/30">
                          {aspirante.cantidad_materias} materias
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(aspirante.estado)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => handleEditClick(e, aspirante)} 
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" 
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(e, aspirante.id)} 
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {aspirantes.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                          No se encontraron aspirantes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // DETAIL VIEW
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setSelectedAspirante(null)}
            className="inline-flex items-center text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-2xl">
                {selectedAspirante.nombre.substring(0,2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-800">{selectedAspirante.nombre}</h3>
                  {getStatusBadge(selectedAspirante.estado)}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500">
                  <span className="flex items-center"><FileText className="h-4 w-4 mr-1 text-gray-400"/> {selectedAspirante.ci}</span>
                  <span className="flex items-center"><UserPlus className="h-4 w-4 mr-1 text-gray-400"/> {selectedAspirante.email || 'sin@email.com'}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center min-w-[150px]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Resumen</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-gray-800">{materias.length}</span>
                <span className="text-sm text-gray-500">materias postuladas</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-gray-800">Materias a las que está postulando</h4>
                  <p className="text-sm text-gray-500">Listado de materias en las que el aspirante se ha postulado.</p>
                </div>
                <button 
                  onClick={() => setShowNuevaPostulacion(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" /> Nueva Postulación
                </button>
              </div>

              <div className="space-y-3 mb-8">
                {materias.map(materia => (
                  <div 
                    key={materia.id_postulacion}
                    onClick={() => handleSelectMateria(materia)}
                    className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                      selectedMateria?.id_postulacion === materia.id_postulacion 
                        ? 'border-blue-400 bg-blue-50/30 shadow-sm' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        materia.estado === 'Aprobada' ? 'bg-emerald-100 text-emerald-600' : 
                        materia.estado === 'En revisión' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800">{materia.nombre}</h5>
                        <div className="flex items-center text-xs text-gray-500 gap-2 mt-1">
                          <span>Código: MAT-{materia.id_materia}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>Modalidad: Presencial</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        {getStatusBadge(materia.estado)}
                        <p className="text-xs text-gray-500 mt-1">Postulado: {new Date(materia.fecha_postulacion).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
                {materias.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm border border-dashed rounded-xl bg-gray-50">
                    Aún no tiene materias postuladas.
                  </div>
                )}
              </div>

              {selectedMateria && (() => {
                const bloqueado = selectedMateria.estado === 'Aprobada' && !editMode;

                return (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">Requisitos de: {selectedMateria.nombre}</h4>
                        <p className="text-sm text-gray-500">Revisa los requisitos solicitados para esta materia y cumple con cada uno.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {bloqueado && (
                          <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-100 text-sm font-semibold transition-colors"
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </button>
                        )}

                      </div>
                    </div>

                    {bloqueado && (
                      <div className="mb-3 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                        <Lock className="h-4 w-4 flex-shrink-0" />
                        <p>Todos los requisitos obligatorios están cumplidos. Haz clic en <b>Editar</b> para modificarlos.</p>
                      </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="grid grid-cols-[1fr_120px_2fr] gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div>Documentos requeridos</div>
                        <div className="text-center">Estado</div>
                        <div>Observaciones</div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {requisitos.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            Esta materia no tiene requisitos específicos asignados.
                          </div>
                        ) : (
                          requisitos.map(req => (
                            <div key={req.id_materia_requisito} className={`grid grid-cols-1 sm:grid-cols-[1fr_120px_2fr] gap-4 p-4 items-start transition-colors ${bloqueado ? 'bg-gray-50/50' : (req.cumplido ? 'bg-white' : 'bg-red-50/20')}`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${req.cumplido ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-800">
                                    {req.requisito_nombre}
                                    {req.obligatorio && <span className="ml-2 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">Obligatorio</span>}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{req.descripcion}</p>
                                </div>
                              </div>

                              <div className="flex sm:justify-center pt-2">
                                <label className="flex items-center cursor-pointer group">
                                  <div className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={!!req.cumplido}
                                      onChange={() => handleToggleRequisito(req.id_materia_requisito, req.cumplido)}
                                      disabled={bloqueado}
                                    />
                                    <div className={`w-5 h-5 rounded border ${req.cumplido ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white group-hover:border-gray-400'} flex items-center justify-center transition-colors ${bloqueado ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                      {req.cumplido && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                  </div>
                                  <span className={`ml-2 text-sm font-medium ${req.cumplido ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {req.cumplido ? 'Cumplido' : 'Pendiente'}
                                  </span>
                                </label>
                              </div>

                              <div>
                                <div className="relative">
                                  <textarea
                                    className={`w-full h-16 resize-none rounded-lg border border-gray-200 p-3 text-sm transition-colors bg-gray-50 focus:bg-white ${bloqueado ? 'opacity-70 cursor-not-allowed text-gray-500' : 'text-gray-700 focus:ring-primary focus:border-primary'}`}
                                    placeholder="Añadir observación..."
                                    maxLength={200}
                                    disabled={bloqueado}
                                  ></textarea>
                                  <span className="absolute bottom-2 right-2 text-[10px] text-gray-400 font-medium">
                                    0/200
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {!bloqueado && (
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => handleSaveRequisitos(false)}
                              disabled={!!saving}
                              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {saving === 'partial' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle2 className="w-4 h-4" />}
                              Guardar Validación
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
                );
              })()}
              
              {/* Botón de Aprobación Global del Aspirante */}
              {materias.length > 0 && materias.some(m => m.estado === 'Aprobada') && selectedAspirante.estado !== 'Docente Oficial' && (
                <div className="mt-8 border border-emerald-200 bg-emerald-50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" /> ¡Postulación Lista!
                    </h4>
                    <p className="text-sm text-emerald-800 mt-1">
                      El aspirante tiene {materias.filter(m => m.estado === 'Aprobada').length} materia(s) con todos los requisitos cumplidos. Se le creará un usuario (contraseña = su carnet) y se le enviará un correo con sus credenciales y materias asignadas.
                    </p>
                  </div>
                  <button 
                    onClick={handleConvertirDocente}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md font-bold whitespace-nowrap transition-colors"
                  >
                    Aprobar y Convertir a Docente
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Postulación */}
      {showNuevaPostulacion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Nueva Postulación</h3>
              <button onClick={() => setShowNuevaPostulacion(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            <form onSubmit={handlePostularMateria} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Materia</label>
                <select 
                  required
                  className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm focus:ring-primary focus:border-primary"
                  value={materiaASeleccionar}
                  onChange={e => setMateriaASeleccionar(e.target.value)}
                >
                  <option value="">Selecciona una materia...</option>
                  {catalogoMaterias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Al confirmar tu postulación, se registrará tu solicitud para esta materia y podrás comenzar a cumplir los requisitos.
                </p>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowNuevaPostulacion(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Aspirante */}
      {showNuevoAspirante && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">{isEditingAspirante ? 'Editar Aspirante' : 'Nuevo Aspirante'}</h3>
              <button onClick={() => setShowNuevoAspirante(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitAspirante} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Carnet de Identidad</label>
                  <input required type="text" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={formAspirante.ci} onChange={e => setFormAspirante({...formAspirante, ci: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Sexo</label>
                  <select className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={formAspirante.sexo} onChange={e => setFormAspirante({...formAspirante, sexo: e.target.value})}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input required type="text" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={formAspirante.nombre} onChange={e => setFormAspirante({...formAspirante, nombre: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                  <input required type="email" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={formAspirante.email} onChange={e => setFormAspirante({...formAspirante, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                  <input type="text" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={formAspirante.telefono} onChange={e => setFormAspirante({...formAspirante, telefono: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Grado Académico</label>
                  <select required className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={formAspirante.grado_academico} onChange={e => setFormAspirante({...formAspirante, grado_academico: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    <option value="Licenciatura">Licenciatura</option>
                    <option value="Maestría">Maestría</option>
                    <option value="Doctorado">Doctorado</option>
                    <option value="Técnico Superior">Técnico Superior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Experiencia (años)</label>
                  <input required type="number" min="0" className="w-full border-gray-300 rounded-lg px-3 py-2 border sm:text-sm" value={formAspirante.experiencia} onChange={e => setFormAspirante({...formAspirante, experiencia: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowNuevoAspirante(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm text-sm font-medium transition-colors">
                  {isEditingAspirante ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
