import { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { docentePortalService } from '../services/docentePortalService';
import toast from 'react-hot-toast';

export default function DocenteMateriasPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterias();
  }, []);

  const loadMaterias = async () => {
    try {
      setLoading(true);
      const data = await docentePortalService.getMateriasHabilitadas();
      setMaterias(data);
    } catch (e) {
      toast.error('Error al cargar materias habilitadas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Cargando materias habilitadas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Materias Habilitadas
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Estas son las materias que has acreditado y estás autorizado para enseñar en el sistema.
        </p>
      </div>

      {materias.length === 0 ? (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-10 text-center flex flex-col items-center shadow-sm">
          <AlertCircle className="w-16 h-16 text-blue-300 mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2">Aún no tienes materias habilitadas</h3>
          <p className="text-blue-700 max-w-md">
            Parece que tu perfil de docente oficial aún no tiene materias asignadas permanentemente. Comunícate con la administración académica.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map((materia) => (
            <div 
              key={materia.id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-emerald-400"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" /> Habilitado
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                  {materia.nombre}
                </h3>
                
                {materia.sigla && (
                  <p className="text-sm font-semibold text-blue-600 mb-3 bg-blue-50 inline-block px-2 py-0.5 rounded">
                    {materia.sigla}
                  </p>
                )}
                
                <p className="text-gray-500 text-sm line-clamp-3 mb-6">
                  {materia.descripcion || 'Sin descripción detallada. Materia fundamental del área de conocimiento.'}
                </p>
                
                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-xs font-medium text-gray-400">
                  <FileText className="w-4 h-4" /> Acreditado por Gestión Académica
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
