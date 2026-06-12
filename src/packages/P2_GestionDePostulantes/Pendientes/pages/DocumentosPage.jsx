import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, ChevronRight, CheckCircle2, X, ShieldCheck, User as UserIcon, Building, Edit } from 'lucide-react';
import { postulanteService } from '../../CU2_RegistrarPostulante/services/postulanteService';
import { requisitoService } from '../../CU3_GestionarRequisitos/services/requisitoService';
import { toast } from 'react-hot-toast';

export default function DocumentosPage() {
  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const location = useLocation();
  const autoOpenId = location.state?.autoOpenPostulanteId;

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!loading && postulantes.length > 0 && autoOpenId && !hasAutoOpened) {
      const pToOpen = postulantes.find(p => p.id === autoOpenId);
      if (pToOpen) {
        handleOpenModal(pToOpen);
        setHasAutoOpened(true);
      }
    }
  }, [loading, postulantes, autoOpenId, hasAutoOpened]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postulantesData, requisitosData] = await Promise.all([
        postulanteService.getAll(),
        requisitoService.getAll()
      ]);
      const mapped = postulantesData.map((p) => {
        const reqs = requisitosData.filter(r => r.id_postulante === p.id);
        const docs = reqs.map(r => ({
          ...r,
          entregado: r.estado === 'Entregado' || r.estado === 'Validado',
          observacion: r.observacion || ''
        }));
        const entregados = docs.filter(d => d.entregado).length;
        const total = docs.length;
        const porcentaje = total > 0 ? Math.round((entregados / total) * 100) : 0;
        let estado = 'Pendiente';
        if (total > 0 && entregados === total) estado = 'Completo';
        else if (entregados > 0) estado = 'Parcial';
        return { ...p, documentos: docs, progress: { entregados, total, porcentaje, estado } };
      });
      setPostulantes(mapped);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Completo': return 'bg-green-50 text-green-600 border-green-200';
      case 'Parcial': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Pendiente': return 'bg-red-50 text-red-500 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getProgressColor = (porcentaje) => {
    if (porcentaje === 100) return '#22c55e';
    if (porcentaje > 0) return '#f59e0b';
    return '#ef4444';
  };

  const total = postulantes.length;
  const completos = postulantes.filter(p => p.progress.estado === 'Completo').length;
  const parciales = postulantes.filter(p => p.progress.estado === 'Parcial').length;
  const pendientes = postulantes.filter(p => p.progress.estado === 'Pendiente').length;

  const filteredData = postulantes.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ci.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.colegio && p.colegio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (postulante) => {
    setSelectedPostulante(JSON.parse(JSON.stringify(postulante)));
    setIsEditing(postulante.progress.estado !== 'Completo');
  };

  const handleDocChange = (index, field, value) => {
    const updated = { ...selectedPostulante };
    updated.documentos[index][field] = value;
    const entregados = updated.documentos.filter(d => d.entregado).length;
    const porcentaje = updated.documentos.length > 0 ? Math.round((entregados / updated.documentos.length) * 100) : 0;
    updated.progress.entregados = entregados;
    updated.progress.porcentaje = porcentaje;
    if (updated.documentos.length > 0 && entregados === updated.documentos.length) updated.progress.estado = 'Completo';
    else if (entregados > 0) updated.progress.estado = 'Parcial';
    else updated.progress.estado = 'Pendiente';
    setSelectedPostulante(updated);
  };

  const handleSave = async (markComplete = false) => {
    setSaving(true);
    try {
      const postulanteToSave = { ...selectedPostulante };
      if (markComplete) {
        postulanteToSave.documentos.forEach(d => d.entregado = true);
        postulanteToSave.progress.entregados = postulanteToSave.documentos.length;
        postulanteToSave.progress.porcentaje = 100;
        postulanteToSave.progress.estado = 'Completo';
      }
      const promises = postulanteToSave.documentos.map(doc => {
        const estadoFinal = doc.entregado ? 'Entregado' : 'Pendiente';
        return requisitoService.updateEstado(doc.id, estadoFinal, doc.observacion);
      });
      await Promise.all(promises);
      setPostulantes(prev => prev.map(p => p.id === postulanteToSave.id ? postulanteToSave : p));
      setSelectedPostulante(postulanteToSave);
      setIsEditing(postulanteToSave.progress.estado !== 'Completo');
    } catch (error) {
      console.error('Error al guardar las validaciones:', error);
      toast.error('Error al guardar cambios. Por favor intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total postulantes</p>
          <p className="text-3xl font-bold text-gray-800">{total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8"></div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Completos</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-800">{completos}</p>
            <span className="text-sm font-medium text-green-500 bg-green-50 px-2 py-0.5 rounded">
              {total > 0 ? Math.round((completos/total)*100) : 0}%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8"></div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Parciales</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-800">{parciales}</p>
            <span className="text-sm font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
              {total > 0 ? Math.round((parciales/total)*100) : 0}%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8"></div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pendientes</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-800">{pendientes}</p>
            <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">
              {total > 0 ? Math.round((pendientes/total)*100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, CI o colegio..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Más Filtros
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Cargando postulantes y documentos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Postulante</th>
                  <th className="px-6 py-4">Progreso</th>
                  <th className="px-6 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((p) => {
                  const initial = p.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleOpenModal(p)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-4 border border-blue-200">
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">{p.nombre}</p>
                            <p className="text-xs text-gray-500 mt-0.5">CI: {p.ci}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.colegio || 'Colegio no especificado'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                              <circle
                                cx="24" cy="24" r="20"
                                stroke={getProgressColor(p.progress.porcentaje)}
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={20 * 2 * Math.PI}
                                strokeDashoffset={(20 * 2 * Math.PI) - ((p.progress.porcentaje / 100) * (20 * 2 * Math.PI))}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                              <span className="text-[10px] font-bold text-gray-700">{p.progress.porcentaje}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{p.progress.entregados}/{p.progress.total}</p>
                            <p className="text-[11px] text-gray-500">documentos</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-md border ${getStatusColor(p.progress.estado)}`}>
                            {p.progress.estado}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron postulantes con esos criterios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {selectedPostulante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold border-2 border-blue-200">
                  {selectedPostulante.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{selectedPostulante.nombre}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><UserIcon className="h-4 w-4 text-gray-400" /> CI: {selectedPostulante.ci}</span>
                    <span className="flex items-center gap-1.5"><Building className="h-4 w-4 text-gray-400" /> {selectedPostulante.colegio || 'Sin colegio'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPostulante(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                disabled={saving}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Progreso de documentos</p>
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                        <circle
                          cx="40" cy="40" r="36"
                          stroke={getProgressColor(selectedPostulante.progress.porcentaje)}
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={36 * 2 * Math.PI}
                          strokeDashoffset={(36 * 2 * Math.PI) - ((selectedPostulante.progress.porcentaje / 100) * (36 * 2 * Math.PI))}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-800">{selectedPostulante.progress.porcentaje}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{selectedPostulante.progress.entregados} de {selectedPostulante.progress.total}</p>
                      <p className="text-sm text-gray-500">documentos entregados</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Estado del postulante</p>
                  <div className="space-y-3">
                    <span className={`inline-flex px-4 py-1.5 text-sm font-bold rounded-lg border ${getStatusColor(selectedPostulante.progress.estado)}`}>
                      {selectedPostulante.progress.estado}
                    </span>
                    {selectedPostulante.progress.estado === 'Completo' && (
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 p-3 rounded-xl border border-green-100">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ¡Documentación completa! Ve a la sección <strong className="ml-1">Pagos</strong> para procesar su matrícula.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents List */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="grid grid-cols-[1fr_120px_2fr] gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div>Documentos requeridos</div>
                  <div className="text-center">Estado</div>
                  <div>Observaciones</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {selectedPostulante.documentos.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      Este postulante no tiene documentos asignados en el sistema.
                    </div>
                  ) : (
                    selectedPostulante.documentos.map((doc, idx) => (
                      <div key={doc.id} className={`grid grid-cols-1 sm:grid-cols-[1fr_120px_2fr] gap-4 p-4 items-start transition-colors ${doc.entregado ? 'bg-white' : 'bg-red-50/20'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.entregado ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{doc.nombre}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{doc.descripcion}</p>
                          </div>
                        </div>

                        <div className="flex sm:justify-center pt-2">
                          <label className="flex items-center cursor-pointer group">
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={doc.entregado}
                                onChange={(e) => handleDocChange(idx, 'entregado', e.target.checked)}
                                disabled={saving || !isEditing}
                              />
                              <div className={`w-5 h-5 rounded border ${doc.entregado ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white group-hover:border-gray-400'} flex items-center justify-center transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {doc.entregado && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </div>
                            <span className={`ml-2 text-sm font-medium ${doc.entregado ? 'text-gray-700' : 'text-gray-400'}`}>
                              {doc.entregado ? 'Entregado' : 'Pendiente'}
                            </span>
                          </label>
                        </div>

                        <div>
                          <div className="relative">
                            <textarea
                              className={`w-full h-16 resize-none rounded-lg border border-gray-200 p-3 text-sm transition-colors bg-gray-50 focus:bg-white ${!isEditing ? 'opacity-70 cursor-not-allowed text-gray-500' : 'text-gray-700 focus:ring-primary focus:border-primary'}`}
                              placeholder="Añadir observación..."
                              value={doc.observacion}
                              onChange={(e) => handleDocChange(idx, 'observacion', e.target.value)}
                              maxLength={200}
                              disabled={saving || !isEditing}
                            ></textarea>
                            <span className="absolute bottom-2 right-2 text-[10px] text-gray-400 font-medium">
                              {doc.observacion.length}/200
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0">
              <button
                onClick={() => setSelectedPostulante(null)}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cerrar
              </button>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Validación
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSave(false)}
                      disabled={saving || selectedPostulante.documentos.length === 0}
                      className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        : <ShieldCheck className="w-4 h-4" />
                      }
                      {saving ? 'Guardando...' : 'Guardar Validación'}
                    </button>

                    {selectedPostulante.progress.estado !== 'Completo' && (
                      <button
                        onClick={() => handleSave(true)}
                        disabled={saving || selectedPostulante.documentos.length === 0}
                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Marcar todo completo
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
