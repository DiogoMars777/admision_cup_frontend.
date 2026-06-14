import { useState, useEffect } from 'react';
import {
  Users, BookOpen, Clock, MapPin, User, AlertCircle, Loader2,
  Layers, Sun, CheckCircle2, Calendar, ChevronDown, ChevronRight,
  ChevronUp
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const MATERIA_COLORS = [
  { badge: 'bg-blue-600',    light: 'bg-blue-50',    text: 'text-blue-700',    icon: 'text-blue-500',    evalBg: 'bg-blue-50/70'   },
  { badge: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500', evalBg: 'bg-emerald-50/70'},
  { badge: 'bg-violet-600',  light: 'bg-violet-50',  text: 'text-violet-700',  icon: 'text-violet-500',  evalBg: 'bg-violet-50/70' },
  { badge: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-700',  icon: 'text-orange-500',  evalBg: 'bg-orange-50/70' },
  { badge: 'bg-cyan-600',    light: 'bg-cyan-50',    text: 'text-cyan-700',    icon: 'text-cyan-500',    evalBg: 'bg-cyan-50/70'   },
];

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';
}

function ScoreBadge({ obtenido, max }) {
  if (obtenido === null || obtenido === undefined) return <span className="text-xs text-gray-400 italic">Pendiente</span>;
  const pct = max > 0 ? (obtenido / max) * 100 : 0;
  const colorClass = pct >= 70 ? 'text-blue-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';
  return (
    <span className={`text-sm font-bold ${colorClass}`}>
      {Number(obtenido).toFixed(1)} / {Number(max).toFixed(0)}
    </span>
  );
}

function MateriaRow({ materia, idx, isExpanded, onToggle }) {
  const color = MATERIA_COLORS[idx % MATERIA_COLORS.length];
  const diasStr = (materia.dias || []).join(' - ') || '—';
  const horaStr = materia.hora_ini && materia.hora_fin
    ? `${materia.hora_ini} - ${materia.hora_fin}`
    : '';

  return (
    <>
      {/* Fila principal */}
      <tr
        className={`cursor-pointer transition-colors hover:bg-gray-50/80 ${isExpanded ? 'bg-gray-50' : ''}`}
        onClick={onToggle}
      >
        <td className="py-4 pl-4 pr-2 w-8">
          {isExpanded
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </td>

        <td className="py-4 pr-6">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color.light}`}>
              <BookOpen className={`w-4 h-4 ${color.icon}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{materia.materia_nombre}</p>
              {materia.materia_descripcion && (
                <p className="text-xs text-gray-400">{materia.materia_descripcion}</p>
              )}
            </div>
          </div>
        </td>

        <td className="py-4 pr-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
              {materia.docente_nombre !== 'Sin docente asignado'
                ? getInitials(materia.docente_nombre)
                : <User className="w-3.5 h-3.5 text-gray-400" />}
            </div>
            <span className={`text-sm ${materia.docente_nombre !== 'Sin docente asignado' ? 'font-medium text-gray-700' : 'italic text-gray-400'}`}>
              {materia.docente_nombre}
            </span>
          </div>
        </td>

        <td className="py-4 pr-6">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-medium">
              {materia.aula && materia.aula !== 'Sin aula' ? `Aula ${materia.aula}` : '—'}
            </span>
          </div>
        </td>

        <td className="py-4 pr-6">
          {diasStr !== '—' ? (
            <div className="flex items-start gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700">{diasStr}</p>
                {horaStr && <p className="text-xs text-gray-400">{horaStr}</p>}
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Sin horario</span>
          )}
        </td>

        <td className="py-4 pr-4 w-8 text-right">
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" />
            : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />}
        </td>
      </tr>

      {/* Panel de Evaluaciones */}
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className={`mx-4 mb-4 rounded-xl border border-gray-100 overflow-hidden`}>
              <div className={`px-5 py-3 ${color.evalBg} border-b border-gray-100`}>
                <h4 className={`text-sm font-bold ${color.text} flex items-center gap-2`}>
                  <Calendar className="w-4 h-4" /> Evaluaciones de {materia.materia_nombre}
                </h4>
              </div>

              {materia.evaluaciones && materia.evaluaciones.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white">
                      <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Evaluación</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
                      <th className="text-right py-2.5 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nota</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {materia.evaluaciones.map((ev, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-5 text-sm font-medium text-gray-700">{ev.nombre}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {ev.fecha || 'Sin fecha'}
                          </div>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <ScoreBadge obtenido={ev.puntaje_obtenido} max={ev.puntaje_max} />
                        </td>
                      </tr>
                    ))}
                    {/* Fila de Promedio Final de la Materia */}
                    <tr className="bg-gray-50/50 border-t-2 border-gray-100">
                      <td colSpan={2} className="py-3 px-5 text-sm font-bold text-gray-700 text-right uppercase tracking-wider">
                        Promedio de la materia:
                      </td>
                      <td className="py-3 px-5 text-right flex flex-col items-end gap-1">
                        <span className={`text-base font-bold ${materia.estado === 'Aprobado' ? 'text-emerald-600' : materia.estado === 'Reprobado' ? 'text-red-600' : 'text-gray-700'}`}>
                          {materia.promedio ? materia.promedio.toFixed(1) : '0.0'} / 100
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="bg-white px-5 py-4 text-sm text-gray-400 italic">
                  No hay evaluaciones registradas para esta materia.
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function MiGrupoPage() {
  const [grupo, setGrupo] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [admision, setAdmision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const firstName = (user.nombre || 'Postulante').split(' ')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/postulante-portal/mi-grupo`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Error al cargar datos');
        const data = await res.json();
        setGrupo(data.grupo);
        setMaterias(data.materias || []);
        setAdmision(data.admision || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleRow = (idx) => setExpandedIdx(prev => prev === idx ? null : idx);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-500 text-sm">Cargando información del grupo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">Sin grupo asignado</h3>
        <p className="text-sm text-gray-400 max-w-sm">
          Aún no tienes un grupo asignado en este ciclo. Comunícate con la administración.
        </p>
      </div>
    );
  }

  const ciclo = grupo.gestion_nombre || (grupo.gestion_año ? `Gestión ${grupo.gestion_año}` : '—');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">¡Hola, {firstName}! <span>👋</span></h1>
        <p className="text-sm text-gray-500 mt-1">Consulta aquí la información de tu grupo y materias.</p>
      </div>

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tarjeta del Grupo (2/3 de ancho en pantallas grandes) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{grupo.nombre}</h2>
          </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide">
              <Layers className="w-3.5 h-3.5" /> Modalidad
            </div>
            <span className="text-sm font-semibold text-gray-800">{grupo.modalidad || '—'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5" /> Ciclo
            </div>
            <span className="text-sm font-semibold text-gray-800">{ciclo}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide">
              <Sun className="w-3.5 h-3.5" /> Turno
            </div>
            <span className="text-sm font-semibold text-gray-800">{grupo.turno || '—'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" /> Estado
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
              grupo.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${grupo.estado === 'Activo' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              {grupo.estado}
            </span>
          </div>
          </div>
        </div>

        {/* Tarjeta de Estado de Admisión (1/3 de ancho) */}
        {admision && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-sm border border-gray-700 p-6 flex flex-col justify-between text-white relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Estado de Admisión</h3>
              <p className="text-xs text-gray-500">Basado en promedio {'>='} 60 en cada materia</p>
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-end justify-between">
                <span className="text-gray-300 text-sm font-medium">Promedio Gral:</span>
                <span className="text-2xl font-bold text-white">{admision.promedio_final}</span>
              </div>
              
              <div className={`mt-2 py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-wide shadow-inner ${
                admision.estado === 'Aprobado' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : admision.estado === 'Reprobado'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {admision.estado === 'Aprobado' && <CheckCircle2 className="w-4 h-4" />}
                {admision.estado === 'Reprobado' && <AlertCircle className="w-4 h-4" />}
                {admision.estado === 'En Proceso' && <Clock className="w-4 h-4" />}
                {admision.estado.toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Materias con Evaluaciones Expandibles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Materias de mi grupo</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Consulta los docentes, aulas y evaluaciones. Haz clic para ver detalles.
              </p>
            </div>
            {materias.length > 0 && (
              <span className="ml-auto text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">
                {materias.length} {materias.length === 1 ? 'materia' : 'materias'}
              </span>
            )}
          </div>
        </div>

        {materias.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay materias registradas para este grupo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="py-3 pl-4 pr-2 w-8" />
                  <th className="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Materia</th>
                  <th className="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Docente</th>
                  <th className="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Aula</th>
                  <th className="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Horario</th>
                  <th className="py-3 pr-4 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {materias.map((m, idx) => (
                  <MateriaRow
                    key={m.id_materia}
                    materia={m}
                    idx={idx}
                    isExpanded={expandedIdx === idx}
                    onToggle={() => toggleRow(idx)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
