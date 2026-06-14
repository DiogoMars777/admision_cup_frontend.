import { Search, Filter, Download } from 'lucide-react';

export default function BitacoraFilters() {
  return (
    <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuario o descripción..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary sm:text-sm bg-white"
          />
        </div>
        
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-primary focus:border-primary w-full sm:w-auto">
          <option value="">Todas las acciones</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        
        <input 
          type="date" 
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-primary focus:border-primary w-full sm:w-auto"
        />
      </div>

      <div className="flex gap-2">
        <button className="flex items-center text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
          <Filter className="h-4 w-4 mr-2" />
          Más Filtros
        </button>
        <button className="flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </button>
      </div>
    </div>
  );
}
