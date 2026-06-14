import { useState, useEffect } from 'react';
import {
  BookOpen, Calendar, ChevronDown, ChevronRight, ChevronUp, AlertCircle, Loader2
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const MATERIA_COLORS = [
  { badge: 'bg-blue-600',    light: 'bg-blue-50',    text: 'text-blue-700',    icon: 'text-blue-500',    evalBg: 'bg-blue-50/70'   },
  { badge: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500', evalBg: 'bg-emerald-50/70'},
  { badge: 'bg-violet-600',  light: 'bg-violet-50',  text: 'text-violet-700',  icon: 'text-violet-500',  evalBg: 'bg-violet-50/70' },
  { badge: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-700',  icon: 'text-orange-500',  evalBg: 'bg-orange-50/70' },
  { badge: 'bg-cyan-600',    light: 'bg-cyan-50',    text: 'text-cyan-700',    icon: 'text-cyan-500',    evalBg: 'bg-cyan-50/70'   },
];

function MateriaRow({ materia, idx, isExpanded, onToggle }) {
  const color = MATERIA_COLORS[idx % MATERIA_COLORS.length];

  return (
    <>
      <tr
        className={`cursor-pointer transition-colors hover:bg-gray-50/80 ${isExpanded ? 'bg-gray-50' : ''}`}
        onClick={onToggle}
      >
        <td className="py-4 pl-6 pr-2 w-8">
          {isExpanded
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </td>

        <td className="py-4 pr-6 w-full">
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

        <td className="py-4 pr-6 text-right">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Activa
          </span>
        </td>

        <td className="py-4 pr-6 w-8 text-right">
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" />
            : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />}
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={4} className="p-0">
            <div className={`mx-6 mb-5 rounded-xl border border-gray-100 overflow-hidden`}>
              <div className={`px-5 py-3 ${color.evalBg} border-b border-gray-100`}>
                <h4 className={`text-sm font-bold ${color.text} flex items-center gap-2`}>
                  <Calendar className="w-4 h-4" /> Evaluaciones Asignadas
                </h4>
              </div>

              {materia.evaluaciones && materia.evaluaciones.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white">
                      <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Evaluación</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
                      <th className="text-right py-2.5 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {materia.evaluaciones.map((ev, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-5 text-sm font-medium text-gray-700 w-1/3">{ev.nombre}</td>
                        <td className="py-3 px-4 w-1/3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {ev.fecha || 'Sin fecha asignada'}
                          </div>
                        </td>
                        <td className="py-3 px-5 text-right w-1/3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block ${
                            ev.fecha
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {ev.fecha ? 'Programada' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="bg-white px-5 py-6 text-center text-sm text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No hay evaluaciones registradas para esta materia aún.
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function MateriasPostulantePage() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/postulante-portal/mi-grupo`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Error al cargar datos');
        const data = await res.json();
        setMaterias(data.materias || []);
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
        <span className="ml-3 text-gray-500 text-sm">Cargando materias...</span>
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Materias</h1>
        <p className="text-sm text-gray-500 mt-1">
          Revisa las materias de tu grupo y sus fechas de evaluación.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Evaluaciones por Materia</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Haz clic en una materia para desplegar sus exámenes.
              </p>
            </div>
          </div>
        </div>

        {materias.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tienes materias asignadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
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
