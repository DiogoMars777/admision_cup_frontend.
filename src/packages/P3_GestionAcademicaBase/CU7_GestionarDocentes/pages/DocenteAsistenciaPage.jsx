import { FileCheck, AlertCircle } from 'lucide-react';

export default function DocenteAsistenciaPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-blue-600" />
          Control de Asistencia
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Gestiona y registra la asistencia diaria de tus estudiantes.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-10 text-center flex flex-col items-center shadow-sm">
        <AlertCircle className="w-16 h-16 text-blue-300 mb-4" />
        <h3 className="text-xl font-bold text-blue-900 mb-2">Módulo en Construcción</h3>
        <p className="text-blue-700 max-w-md">
          El sistema de control de asistencia detallado estará disponible próximamente. Por ahora, puedes visualizar el porcentaje de asistencia general en la sección "Mis Grupos".
        </p>
      </div>
    </div>
  );
}
