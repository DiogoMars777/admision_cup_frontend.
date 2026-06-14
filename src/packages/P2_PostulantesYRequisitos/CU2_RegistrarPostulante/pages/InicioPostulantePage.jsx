import { useState, useEffect, useMemo } from 'react';
import {
  Calendar, AlertCircle, Loader2, Clock, MapPin, BookOpen, ChevronRight, FileText
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const MATERIA_COLORS = [
  { cell: 'bg-blue-100 text-blue-800', border: 'border-l-blue-500', icon: 'text-blue-500', light: 'bg-blue-50' },
  { cell: 'bg-indigo-100 text-indigo-800', border: 'border-l-indigo-500', icon: 'text-indigo-500', light: 'bg-indigo-50' },
  { cell: 'bg-emerald-100 text-emerald-800', border: 'border-l-emerald-500', icon: 'text-emerald-500', light: 'bg-emerald-50' },
  { cell: 'bg-orange-100 text-orange-800', border: 'border-l-orange-500', icon: 'text-orange-500', light: 'bg-orange-50' },
  { cell: 'bg-violet-100 text-violet-800', border: 'border-l-violet-500', icon: 'text-violet-500', light: 'bg-violet-50' },
];

// Genera lista única de franjas horarias de todos los horarios
function buildTimeSlots(materias) {
  const slotsSet = new Set();
  materias.forEach(m => {
    (m.horarios || []).forEach(h => {
      slotsSet.add(`${h.hora_ini}-${h.hora_fin}`);
    });
  });
  return Array.from(slotsSet).sort();
}

// Construye la celda para un día + franja
function buildScheduleMap(materias) {
  const map = {};
  materias.forEach((m, idx) => {
    (m.horarios || []).forEach(h => {
      const key = `${h.dia}|${h.hora_ini}-${h.hora_fin}`;
      map[key] = {
        materia_nombre: m.materia_nombre,
        docente_nombre: m.docente_nombre,
        colorIdx: idx,
      };
    });
  });
  return map;
}

// Obtener evaluaciones únicas (ya que las fechas son generales para el ciclo)
function getAllExams(materias) {
  const examsMap = new Map();
  materias.forEach((m) => {
    (m.evaluaciones || []).forEach(ev => {
      // Filtrar las que no tienen fecha
      if (ev.fecha && !examsMap.has(ev.nombre)) {
        examsMap.set(ev.nombre, {
          nombre: ev.nombre,
          fecha: ev.fecha,
        });
      }
    });
  });
  // Ordenar alfabéticamente por nombre de evaluación
  return Array.from(examsMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export default function InicioPostulantePage() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setMaterias(data.materias || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const timeSlots = useMemo(() => buildTimeSlots(materias), [materias]);
  const scheduleMap = useMemo(() => buildScheduleMap(materias), [materias]);
  const allExams = useMemo(() => getAllExams(materias), [materias]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-500 text-sm">Cargando panel...</span>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Saludo ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola, {firstName}! <span>👋</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Panel principal de tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Columna Izquierda: Horario (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Mi horario semanal</h2>
                <p className="text-xs text-gray-400 mt-0.5">Consulta tus clases programadas.</p>
              </div>
            </div>

            {timeSlots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400 text-center">
                <Calendar className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Aún no tienes un horario asignado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-28">
                        Hora
                      </th>
                      {DIAS_SEMANA.map(dia => (
                        <th key={dia} className="py-2.5 px-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {timeSlots.map(slot => {
                      const [horaIni, horaFin] = slot.split('-');
                      return (
                        <tr key={slot} className="hover:bg-gray-50/40 transition-colors">
                          <td className="py-3 px-3 text-xs text-gray-500 font-medium whitespace-nowrap">
                            {horaIni} - {horaFin}
                          </td>

                          {DIAS_SEMANA.map(dia => {
                            const key = `${dia}|${slot}`;
                            const entry = scheduleMap[key];
                            const color = entry ? MATERIA_COLORS[entry.colorIdx % MATERIA_COLORS.length] : null;

                            return (
                              <td key={dia} className="py-2 px-1 text-center align-middle">
                                {entry ? (
                                  <div className={`rounded-xl px-2 py-2 mx-auto w-full min-w-[100px] h-full flex flex-col justify-center items-center ${color.cell}`}>
                                    <p className="font-bold text-[11px] uppercase tracking-wide leading-tight mb-1">{entry.materia_nombre}</p>
                                    <p className="text-[10px] opacity-80 leading-tight truncate w-full px-1">{entry.docente_nombre}</p>
                                  </div>
                                ) : (
                                  <span className="text-gray-200 text-sm">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna Derecha: Exámenes (1/3) ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Próximos Exámenes</h2>
                <p className="text-xs text-gray-400 mt-0.5">Fechas de evaluación programadas.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {allExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center h-full">
                  <FileText className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No hay evaluaciones programadas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Encontrar el índice del próximo examen
                    let nextExamIndex = -1;
                    for (let i = 0; i < allExams.length; i++) {
                      const [d, m, y] = allExams[i].fecha.split('/');
                      const examDate = new Date(y, m - 1, d);
                      if (examDate >= today) {
                        nextExamIndex = i;
                        break;
                      }
                    }

                    return allExams.map((exam, i) => {
                      const color = MATERIA_COLORS[i % MATERIA_COLORS.length];
                      const isNext = i === nextExamIndex;
                      
                      const [d, m, y] = exam.fecha.split('/');
                      const isPast = new Date(y, m - 1, d) < today;

                      return (
                        <div 
                          key={i} 
                          className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                            isNext 
                              ? 'border-blue-200 bg-blue-50/50 shadow-sm' 
                              : isPast 
                                ? 'border-gray-100 bg-gray-50/50 opacity-60' 
                                : 'border-gray-100 hover:bg-gray-50'
                          } border-l-4 ${isNext ? 'border-l-blue-500' : isPast ? 'border-l-gray-300' : color.border}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isNext ? 'bg-blue-100' : isPast ? 'bg-gray-100' : color.light
                          }`}>
                            <Calendar className={`w-4 h-4 ${isNext ? 'text-blue-600' : isPast ? 'text-gray-400' : color.icon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isNext ? 'text-blue-900' : isPast ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-800'}`}>
                              {exam.nombre}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs font-medium flex items-center gap-1 ${isNext ? 'text-blue-700' : 'text-gray-500'}`}>
                                <Clock className="w-3 h-3" /> {exam.fecha}
                              </span>
                            </div>
                          </div>
                          {isNext && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Próximo
                            </span>
                          )}
                          {isPast && (
                            <span className="text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 uppercase tracking-wide">
                              Pasado
                            </span>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
