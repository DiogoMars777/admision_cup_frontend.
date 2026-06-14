import React, { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, FileText, Users, Clock, ClipboardCheck, Info, CheckCircle2, AlertTriangle, Play, Save, UsersRound, School, BookOpen, UserCheck, Download, Printer, FilterX, Calculator, Beaker, Terminal, Globe, Plus, Minus, Repeat, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import gestionAcademicaService from '../services/gestionAcademicaService';
import GestionAcademicaDocentesTab from './GestionAcademicaDocentesTab';
import GestionAcademicaPostulantesTab from './GestionAcademicaPostulantesTab';

export default function GestionAcademicaDetailPage({ gestion, onBack }) {
  const [activeTab, setActiveTab] = useState('Grupos');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Detalle de Gestión Académica: {gestion.nombre}</h2>
        <button 
          onClick={onBack}
          className="inline-flex items-center text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Datos Generales de la Gestión</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
          <div>
            <p className="text-gray-500 font-semibold mb-1">Nombre:</p>
            <p className="text-gray-800 font-medium">{gestion.nombre}</p>
          </div>
          <div>
            <p className="text-gray-500 font-semibold mb-1">Año:</p>
            <p className="text-gray-800 font-medium">{gestion.año}</p>
          </div>
          <div>
            <p className="text-gray-500 font-semibold mb-1">CUP:</p>
            <p className="text-gray-800 font-medium">{gestion.cup_nombre || 'CUP 1'}</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-gray-500 font-semibold mb-1">Fechas:</p>
            <p className="text-gray-800 font-medium flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-gray-400"/> {gestion.fecha_ini} al {gestion.fecha_fin}</p>
          </div>
          <div>
            <p className="text-gray-500 font-semibold mb-1">Estado:</p>
            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${gestion.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
              {gestion.estado || 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['Resumen', 'Evaluaciones', 'Grupos', 'Horarios', 'Docentes', 'Postulantes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'Resumen' && <ResumenTab gestion={gestion} />}
        {activeTab === 'Grupos' && <GruposTab gestion={gestion} />}
        {activeTab === 'Evaluaciones' && <EvaluacionesTab gestion={gestion} />}
        {activeTab === 'Horarios' && <HorariosTab gestion={gestion} />}
        {activeTab === 'Docentes' && (
          <GestionAcademicaDocentesTab gestionId={gestion.id} />
        )}
        {activeTab === 'Postulantes' && (
          <GestionAcademicaPostulantesTab gestionId={gestion.id} />
        )}
      </div>
    </div>
  );
}

function GruposTab({ gestion }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [simulacion, setSimulacion] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [gestion.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await gestionAcademicaService.getGruposResumen(gestion.id);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimular = async () => {
    try {
      setIsSimulating(true);
      const res = await gestionAcademicaService.simularGrupos(gestion.id);
      setSimulacion(res);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error en simulación');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerar = async () => {
    if (!window.confirm("¿Estás seguro de generar definitivamente estos grupos? Esta acción no se puede deshacer.")) return;
    try {
      setIsGenerating(true);
      await gestionAcademicaService.generarGrupos(gestion.id);
      toast.success('Grupos generados exitosamente.');
      setSimulacion(null);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al generar grupos');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos de grupos...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Resumen Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resumen General */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
          <h4 className="text-sm font-bold text-blue-800 mb-4 uppercase tracking-wider">Resumen General</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">Total inscritos</p>
              <p className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                <Users className="w-5 h-5"/> {data.total_inscritos}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">Grupos a habilitar</p>
              <p className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-2">
                <Users className="w-5 h-5"/> {data.cantidad_grupos}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">Capacidad / grupo</p>
              <p className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-2">
                <Users className="w-5 h-5"/> {data.capacidad}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">Total asignados</p>
              <p className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5"/> {data.total_asignados}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-600 font-semibold mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5"/> {data.pendientes_asignacion}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex gap-2 items-start border border-blue-100">
            <Info className="w-5 h-5 shrink-0" />
            <p>La cantidad de grupos se calcula únicamente con el total de inscritos.<br/>
            Fórmula: <code>cantidad_grupos = redondear_hacia_arriba(total_inscritos / 70)</code></p>
          </div>
        </div>

        {/* Informative Stats */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Por Modalidad</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Presencial</span><span className="font-semibold">{data.modalidades.Presencial}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Virtual</span><span className="font-semibold">{data.modalidades.Virtual}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Sin modalidad</span><span className="font-semibold">{data.modalidades['Sin modalidad']}</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Por Turno Preferido</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Mañana</span><span className="font-semibold">{data.turnos['Mañana']}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tarde</span><span className="font-semibold">{data.turnos.Tarde}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Noche</span><span className="font-semibold">{data.turnos.Noche}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Sin preferencia</span><span className="font-semibold">{data.turnos['Sin preferencia']}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={handleSimular}
          disabled={data.total_inscritos === 0 || data.ya_generados || isSimulating}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" /> Simular asignación
        </button>
        <button 
          onClick={handleGenerar}
          disabled={!simulacion || isGenerating || data.ya_generados}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" /> Generar grupos
        </button>
      </div>

      {data.total_inscritos === 0 && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 text-sm">
          No existen postulantes inscritos para esta gestión académica.
        </div>
      )}

      {data.ya_generados && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-sm flex gap-2 items-center">
          <CheckCircle2 className="w-5 h-5" />
          Los grupos ya fueron generados para esta gestión académica.
        </div>
      )}

      {/* Tabla de Simulación o Datos Reales */}
      {(simulacion || data.grupos.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h4 className="font-bold text-gray-800">
              Grupos Generados {simulacion ? '(Simulación)' : ''}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-3 font-medium">Nombre del grupo</th>
                  <th className="px-6 py-3 font-medium">Modalidad</th>
                  <th className="px-6 py-3 font-medium">Turno</th>
                  <th className="px-6 py-3 font-medium text-center">Cupo máximo</th>
                  <th className="px-6 py-3 font-medium text-center">Cupo actual</th>
                  <th className="px-6 py-3 font-medium">Porcentaje</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(simulacion ? simulacion.grupos : data.grupos).map((g, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{g.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{g.modalidad}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{g.turno}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{g.cupo_max}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600 text-center">{g.cupo_actual || g.cant_estudiante}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: `${g.porcentaje || Math.round(((g.cant_estudiante||0)/g.cupo_max)*100)}%`}}></div>
                        </div>
                        <span className="text-xs text-gray-500 font-mono w-8">{g.porcentaje || Math.round(((g.cant_estudiante||0)/g.cupo_max)*100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {g.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de Pendientes */}
      {simulacion?.pendientes?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="p-5 border-b border-red-100 bg-red-50">
            <h4 className="font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Postulantes Pendientes de Asignación (Simulación)
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-3 font-medium">N°</th>
                  <th className="px-6 py-3 font-medium">Nombre del postulante</th>
                  <th className="px-6 py-3 font-medium">Modalidad registrada</th>
                  <th className="px-6 py-3 font-medium">Turno preferido</th>
                  <th className="px-6 py-3 font-medium">Motivo</th>
                  <th className="px-6 py-3 font-medium">Acción sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {simulacion.pendientes.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{p.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.modalidad_registrada}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.turno_preferido}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{p.motivo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.accion_sugerida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-orange-50 border-t border-orange-100 text-orange-800 text-sm flex gap-2">
            <Info className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Algunos postulantes no pudieron ser asignados automáticamente.</p>
              <p>Se generará una notificación para que se apersonen a Dirección Académica y elijan un horario disponible.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function EvaluacionesTab({ gestion }) {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvaluaciones(gestion.id);
  }, [gestion.id]);

  const fetchEvaluaciones = async (id) => {
    try {
      setLoading(true);
      const evals = await gestionAcademicaService.getEvaluaciones(id);
      setEvaluaciones(evals);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluacion = async (nombre_eva, fecha) => {
    if (!fecha) {
      toast.error("Por favor ingrese una fecha.");
      return;
    }
    try {
      await gestionAcademicaService.updateEvaluacion(gestion.id, { nombre_eva, fecha });
      fetchEvaluaciones(gestion.id);
    } catch (error) {
      // El error ya es manejado por el interceptor global
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-1">Evaluaciones definidas</h4>
      <p className="text-sm text-gray-500 mb-4">Configura las fechas de las 3 evaluaciones de la gestión.</p>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Cargando evaluaciones...</div>
      ) : (
        <div className="space-y-3">
          {evaluaciones.map((eva, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-50">
                  <ClipboardCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-800 text-lg">{eva.nombre_eva}</h5>
                </div>
              </div>
              
              <div className="flex items-end gap-3 shrink-0">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 mb-1">Fecha programada</label>
                  <div className="relative">
                    <input 
                      type="date"
                      className="pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 w-40"
                      value={eva.fecha || ''}
                      onChange={(e) => {
                        const newEvals = [...evaluaciones];
                        newEvals[idx].fecha = e.target.value;
                        setEvaluaciones(newEvals);
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSaveEvaluacion(eva.nombre_eva, eva.fecha)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HorariosTab({ gestion }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [simulacion, setSimulacion] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [filtroTurno, setFiltroTurno] = useState('Todos');
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');
  const [filtroMateria, setFiltroMateria] = useState('Todas');
  const [filtroDocente, setFiltroDocente] = useState('Todos');
  const [filtroAula, setFiltroAula] = useState('Todas');
  
  const [diaActivo, setDiaActivo] = useState('Lunes');

  useEffect(() => {
    loadData();
  }, [gestion.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await gestionAcademicaService.getHorariosResumen(gestion.id);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimular = async () => {
    try {
      setIsSimulating(true);
      const res = await gestionAcademicaService.simularHorarios(gestion.id);
      if (res.error) {
        toast.success(res.message);
        return;
      }
      setSimulacion(res.horarios);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error en simulación');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerar = async () => {
    if (!window.confirm("¿Estás seguro de generar definitivamente estos horarios?")) return;
    try {
      setIsGenerating(true);
      const res = await gestionAcademicaService.generarHorarios(gestion.id);
      if (res.error) {
        toast.success(res.message);
        return;
      }
      toast.success('Horarios generados correctamente.');
      setSimulacion(null);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al generar horarios');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos de horarios...</div>;
  if (!data) return null;

  // Render variables
  const horariosAMostrar = simulacion || data.horarios_guardados || [];
  
  // Listas dinámicas para los selects
  const allGrupos = Array.from(new Set(horariosAMostrar.map(h => h.grupo_nombre))).sort();
  const allMaterias = Array.from(new Set(horariosAMostrar.map(h => h.materia_nombre))).sort();
  const allDocentes = Array.from(new Set(horariosAMostrar.filter(h=>h.docente_nombre).map(h => h.docente_nombre))).sort();
  const allAulas = Array.from(new Set(horariosAMostrar.filter(h=>h.aula_nro).map(h => h.aula_nro))).sort();

  // Agrupar por grupo para la tabla (solo si hay horarios)
  let gruposUnicos = [];
  let bloquesDeTiempo = [];
  if (horariosAMostrar.length > 0) {
    const horariosDelDia = horariosAMostrar.filter(h => 
      h.dia === diaActivo && 
      (filtroTurno === 'Todos' || h.turno === filtroTurno) &&
      (filtroGrupo === 'Todos' || h.grupo_nombre === filtroGrupo) &&
      (filtroMateria === 'Todas' || h.materia_nombre === filtroMateria) &&
      (filtroDocente === 'Todos' || h.docente_nombre === filtroDocente) &&
      (filtroAula === 'Todas' || h.aula_nro === filtroAula)
    );
    const gruposSet = new Set();
    const bloquesSet = new Set();
    
    horariosDelDia.forEach(h => {
      gruposSet.add(h.grupo_nombre);
      bloquesSet.add(`${h.hora_ini} - ${h.hora_fin}`);
    });
    
    gruposUnicos = Array.from(gruposSet).sort();
    bloquesDeTiempo = Array.from(bloquesSet).sort();
  }

  const getCellData = (grupo, bloque) => {
    return horariosAMostrar.find(h => 
      h.dia === diaActivo && 
      h.grupo_nombre === grupo && 
      `${h.hora_ini} - ${h.hora_fin}` === bloque
    );
  };

  const handleExportExcel = () => {
    if (gruposUnicos.length === 0 || bloquesDeTiempo.length === 0) return;

    const aoa = [];
    const header = ['Grupo / Hora', ...bloquesDeTiempo];
    aoa.push([`Día: ${diaActivo} - Turno: ${filtroTurno}`]);
    aoa.push([]); // fila vacía
    aoa.push(header);

    gruposUnicos.forEach(g => {
        const row = [g];
        bloquesDeTiempo.forEach(b => {
            const celda = getCellData(g, b);
            if (celda) {
                row.push(`${celda.materia_nombre}\n${celda.docente_nombre || 'Sin docente'}\n${celda.aula_nro || 'Sin aula'}`);
            } else {
                row.push('');
            }
        });
        aoa.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, diaActivo);

    const wscols = [{wch: 15}, ...bloquesDeTiempo.map(() => ({wch: 30}))];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Horario_Filtrado_${diaActivo}_${gestion.nombre.replace(/\s+/g, '_')}.xlsx`);
  };

  const handlePrint = () => {
    if (gruposUnicos.length === 0 || bloquesDeTiempo.length === 0) return;

    let html = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #f3f4f6; color: #1f2937; }
        .materia { font-weight: bold; font-size: 13px; margin-bottom: 3px; color: #1e40af; }
        .docente { color: #4b5563; font-size: 11px; }
        .aula { font-size: 11px; color: #6b7280; font-weight: bold; margin-top: 2px; }
        .header { margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .grupo { font-weight: bold; color: #1f2937; background-color: #f9fafb; text-align: left; padding-left: 10px; }
      </style>
      <div class="header">
        <h2 style="margin:0 0 5px 0;">Horario: ${gestion.nombre}</h2>
        <p style="margin:0;color:#4b5563;"><strong>Día:</strong> ${diaActivo} | <strong>Turno Filtro:</strong> ${filtroTurno}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th style="text-align: left; padding-left: 10px;">Grupo / Hora</th>
            ${bloquesDeTiempo.map(b => `<th>${b}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${gruposUnicos.map(g => `
            <tr>
              <td class="grupo">${g}</td>
              ${bloquesDeTiempo.map(b => {
                const celda = getCellData(g, b);
                if(!celda) return '<td></td>';
                return `<td>
                  <div class="materia">${celda.materia_nombre}</div>
                  <div class="docente">${celda.docente_nombre || 'Sin docente'}</div>
                  <div class="aula">${celda.aula_nro || 'Sin aula'}</div>
                </td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    const win = window.open('', '', 'width=1000,height=700');
    win.document.write('<html><head><title>Imprimir Horario</title></head><body>' + html + '</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);
  };

  const getMateriaIcon = (materia) => {
    switch(materia) {
      case 'Matemáticas': return <Calculator className="w-5 h-5" />;
      case 'Física': return <Beaker className="w-5 h-5" />;
      case 'Computación': return <Terminal className="w-5 h-5" />;
      case 'Inglés': return <Globe className="w-5 h-5" />;
      default: return <UsersRound className="w-5 h-5" />;
    }
  };

  const getMateriaColor = (materia) => {
    switch(materia) {
      case 'Matemáticas': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Física': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Computación': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Inglés': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas resumen */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600"><School className="w-6 h-6"/></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{gestion.cup_nombre || 'CUP 1'} - {gestion.año}</h4>
            <p className="text-xs text-gray-500">Gestión Académica</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><UsersRound className="w-6 h-6"/></div>
          <div>
            <h4 className="text-xl font-bold text-gray-800">{data.total_grupos}</h4>
            <p className="text-xs text-gray-500">Total de Grupos</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full text-purple-600"><UserCheck className="w-6 h-6"/></div>
          <div>
            <h4 className="text-xl font-bold text-gray-800">{data.docentes_disponibles}</h4>
            <p className="text-xs text-gray-500">Docentes Disponibles</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600"><School className="w-6 h-6"/></div>
          <div>
            <h4 className="text-xl font-bold text-gray-800">{data.aulas_disponibles}</h4>
            <p className="text-xs text-gray-500">Aulas Disponibles</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-cyan-100 rounded-full text-cyan-600"><BookOpen className="w-6 h-6"/></div>
          <div>
            <h4 className="text-xl font-bold text-gray-800">{data.total_materias}</h4>
            <p className="text-xs text-gray-500">Materias</p>
          </div>
        </div>
      </div>

      {/* 2. Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Turno</label>
          <select 
            className="w-full border-gray-200 rounded-lg text-sm focus:ring-blue-500"
            value={filtroTurno}
            onChange={(e) => setFiltroTurno(e.target.value)}
          >
            <option value="Todos">Todos los turnos</option>
            <option value="Mañana">Mañana (08:00 - 12:00)</option>
            <option value="Tarde">Tarde (13:00 - 17:00)</option>
            <option value="Noche">Noche (18:00 - 22:00)</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Grupo</label>
          <select 
            className="w-full border-gray-200 rounded-lg text-sm focus:ring-blue-500"
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {allGrupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Materia</label>
          <select 
            className="w-full border-gray-200 rounded-lg text-sm focus:ring-blue-500"
            value={filtroMateria}
            onChange={(e) => setFiltroMateria(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {allMaterias.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Docente</label>
          <select 
            className="w-full border-gray-200 rounded-lg text-sm focus:ring-blue-500"
            value={filtroDocente}
            onChange={(e) => setFiltroDocente(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {allDocentes.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Aula</label>
          <select 
            className="w-full border-gray-200 rounded-lg text-sm focus:ring-blue-500"
            value={filtroAula}
            onChange={(e) => setFiltroAula(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {allAulas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <button 
          onClick={() => {
            setFiltroTurno('Todos');
            setFiltroGrupo('Todos');
            setFiltroMateria('Todas');
            setFiltroDocente('Todos');
            setFiltroAula('Todas');
          }}
          className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 flex items-center gap-2"
        >
          <FilterX className="w-4 h-4"/> Limpiar filtros
        </button>
      </div>

      {/* 3. Botones de acción */}
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={handleSimular}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Play className="w-4 h-4"/> Simular horarios
        </button>
        <button 
          onClick={handleGenerar}
          disabled={!simulacion || isGenerating || data.ya_generados}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 shadow-sm transition-colors disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4"/> Generar horarios
        </button>
        
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition-colors ml-auto"
        >
          <Download className="w-4 h-4"/> Exportar Excel
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4"/> Imprimir
        </button>
      </div>

      <div className="flex gap-2 items-center text-sm text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <Info className="w-5 h-5 shrink-0"/>
        El horario final puede repetirse o rotarse por día según configuración del sistema.
      </div>

      {data.ya_generados && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-sm flex gap-2 items-center">
          <CheckCircle2 className="w-5 h-5" />
          Los horarios ya fueron generados en la base de datos para esta gestión académica.
        </div>
      )}

      {/* 4. Vista principal Matriz */}
      {horariosAMostrar.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gray-500" />
              Horario - {filtroTurno === 'Todos' ? 'Todos los Turnos' : `Turno ${filtroTurno}`}
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs ml-2">{diaActivo}</span>
            </h3>
            <div className="flex gap-2">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(dia => (
                <button 
                  key={dia}
                  onClick={() => setDiaActivo(dia)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${diaActivo === dia ? 'bg-white border-gray-300 text-gray-800 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100'}`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-gray-600 font-semibold border-b border-r border-gray-200 w-32 relative">
                    <span className="absolute top-2 right-2 text-xs text-gray-400">Hora</span>
                    <span className="absolute bottom-2 left-2 text-xs text-gray-400">Grupo</span>
                    <svg className="absolute inset-0 w-full h-full text-gray-200" preserveAspectRatio="none" viewBox="0 0 100 100"><line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1"></line></svg>
                  </th>
                  {bloquesDeTiempo.map((bloque, i) => (
                    <th key={bloque} className="px-4 py-3 bg-blue-50/50 text-blue-900 font-bold border-b border-gray-200 text-center min-w-[160px]">
                      {bloque}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gruposUnicos.map(grupo => (
                  <tr key={grupo} className="hover:bg-gray-50/50">
                    <td className="px-4 py-4 font-bold text-gray-800 border-r border-gray-200 bg-gray-50/30 flex items-center gap-2">
                      <UsersRound className="w-4 h-4 text-gray-400" /> {grupo}
                    </td>
                    {bloquesDeTiempo.map(bloque => {
                      const celda = getCellData(grupo, bloque);
                      if (!celda) return <td key={bloque} className="p-2 border-r border-gray-100"></td>;
                      
                      const colorClass = getMateriaColor(celda.materia_nombre);
                      
                      return (
                        <td key={bloque} className="p-2 border-r border-gray-100 last:border-r-0">
                          <div className={`p-3 rounded-xl border ${colorClass} h-full flex items-start gap-3 transition-transform hover:scale-[1.02] cursor-default`}>
                            <div className="mt-0.5 opacity-80">
                              {getMateriaIcon(celda.materia_nombre)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{celda.materia_nombre}</p>
                              <p className="text-[11px] font-medium opacity-80 truncate flex items-center gap-1 mt-1">
                                {celda.docente_nombre}
                              </p>
                              <p className="text-[10px] font-semibold opacity-70 mt-0.5">
                                {celda.aula_nro}
                              </p>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {horariosAMostrar.length > 0 && (
        <div className="flex gap-2 items-center text-sm text-blue-800 mt-2">
          <Info className="w-4 h-4 shrink-0"/>
          El horario se genera automáticamente con distribución intercalada para optimizar la asignación de docentes y aulas sin conflictos de horario.
        </div>
      )}
    </div>
  );
}

function ResumenTab({ gestion }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [expandedCarrera, setExpandedCarrera] = useState(null);

  useEffect(() => {
    loadData();
  }, [gestion.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await gestionAcademicaService.getResumenAdmision(gestion.id);
      setData(res);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar el resumen de admisión');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!window.confirm("¿Estás seguro de ejecutar la asignación a carreras? Esta operación calculará el promedio y acomodará a los estudiantes basados en sus notas y cupos disponibles.")) return;
    try {
      setIsAssigning(true);
      await gestionAcademicaService.asignarCarreras(gestion.id);
      await loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al asignar carreras');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleExportPDF = () => {
    if (!data?.resultados) return;
    
    const doc = new jsPDF();
    doc.text(`Resultados de Admisión - ${gestion.nombre}`, 14, 15);
    
    let y = 25;
    data.resultados.forEach(carrera => {
      doc.setFontSize(12);
      doc.text(`${carrera.carrera} (${carrera.alumnos.length} admitidos)`, 14, y);
      y += 5;
      
      const tableData = carrera.alumnos.map((a, i) => [
        i + 1,
        a.ci,
        a.nombre,
        `${a.promedio} pts`
      ]);
      
      autoTable(doc, {
        startY: y,
        head: [['N°', 'Carnet', 'Nombre Completo', 'Promedio Final']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] }
      });
      
      y = doc.lastAutoTable.finalY + 10;
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
    });
    
    doc.save(`Admision_${gestion.nombre.replace(/\s+/g, '_')}.pdf`);
  };

  const handleExportExcel = () => {
    if (!data?.resultados) return;
    
    const wb = XLSX.utils.book_new();
    
    data.resultados.forEach(carrera => {
      const sheetData = [
        ['N°', 'Carnet', 'Nombre Completo', 'Promedio Final']
      ];
      
      carrera.alumnos.forEach((a, i) => {
        sheetData.push([
          i + 1,
          a.ci,
          a.nombre,
          a.promedio
        ]);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 15 }];
      
      let sheetName = carrera.carrera.substring(0, 31).replace(/[\\/?*[\]]/g, '');
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    XLSX.writeFile(wb, `Admision_${gestion.nombre.replace(/\s+/g, '_')}.xlsx`);
  };

  const toggleExpand = (id) => {
    setExpandedCarrera(expandedCarrera === id ? null : id);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando resumen de admisión...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-600" />
            Asignación Final a Carreras
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Módulo inteligente para asignación meritocrática según notas y prioridades.
          </p>
        </div>
        
        {!data.ya_asignados && (
          <button 
            onClick={handleAsignar}
            disabled={isAssigning}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
          >
            {isAssigning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
            {isAssigning ? 'Procesando...' : 'Asignar a Carreras Automáticamente'}
          </button>
        )}
      </div>

      {data.ya_asignados && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold">¡Asignación Completada Exitosamente!</p>
              <p className="text-sm">Todos los postulantes aprobados ya fueron distribuidos en sus carreras.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-green-700 border border-green-200 hover:bg-green-100 rounded-lg text-sm font-bold transition-colors shadow-sm"
              title="Descargar reporte en Excel"
            >
              <Download className="w-4 h-4" /> Excel
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors shadow-sm"
              title="Descargar PDF"
            >
              <Printer className="w-4 h-4" /> PDF
            </button>
            <div className="w-px h-6 bg-emerald-200 mx-1"></div>
            <button 
              onClick={handleAsignar}
              disabled={isAssigning}
              className="text-emerald-700 text-sm font-bold hover:underline flex gap-1 items-center"
            >
              Re-calcular
            </button>
          </div>
        </div>
      )}

      {/* Tarjetas de Estadística de Excluidos */}
      {data.ya_asignados && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-red-100 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="w-6 h-6"/>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">{data.stats?.reprobados || 0}</h4>
              <p className="text-sm text-gray-500 font-semibold">Reprobados (&lt; 60 en alguna materia)</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-orange-100 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <UsersRound className="w-6 h-6"/>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">{data.stats?.sin_cupo || 0}</h4>
              <p className="text-sm text-gray-500 font-semibold">Aprobados sin cupo</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista por Carreras */}
      {data.ya_asignados && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-700 uppercase tracking-wider text-sm mt-4">Resultados de la asignación por carrera</h4>
          
          {data.resultados.map((res) => {
            const isExpanded = expandedCarrera === res.id_carrera;
            const porcentaje = Math.round((res.inscritos / res.cupo_maximo) * 100) || 0;
            
            return (
              <div key={res.id_carrera} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div 
                  className="p-5 flex flex-wrap justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(res.id_carrera)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{res.carrera}</h4>
                      <p className="text-sm text-gray-500 font-semibold mt-0.5">Cupos Totales: {res.cupo_maximo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-black text-indigo-600 text-2xl">{res.inscritos}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admitidos</p>
                    </div>
                    
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                        <span>Ocupación</span>
                        <span>{porcentaje}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${porcentaje >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{width: `${Math.min(porcentaje, 100)}%`}}
                        ></div>
                      </div>
                    </div>

                    <div className="text-gray-400 bg-gray-100 p-2 rounded-full">
                      {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                    {res.alumnos.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                              <th className="px-5 py-4 font-bold">N°</th>
                              <th className="px-5 py-4 font-bold">Carnet (CI)</th>
                              <th className="px-5 py-4 font-bold">Nombre Completo del Postulante</th>
                              <th className="px-5 py-4 font-bold text-right">Promedio Final</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {res.alumnos.map((alum, idx) => (
                              <tr key={alum.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-5 py-4 text-sm text-gray-500 font-mono">{idx + 1}</td>
                                <td className="px-5 py-4 text-sm font-semibold text-gray-700">{alum.ci}</td>
                                <td className="px-5 py-4 text-sm font-bold text-gray-900">
                                  {alum.nombre}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                                    {alum.promedio} pts.
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                        <School className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Ningún alumno ha sido asignado a esta carrera.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
