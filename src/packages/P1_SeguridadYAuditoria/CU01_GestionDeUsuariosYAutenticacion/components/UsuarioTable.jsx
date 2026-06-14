import { MoreVertical, Edit2, Trash2, Shield, ShieldOff } from 'lucide-react';

export default function UsuarioTable({ usuarios, searchTerm, onToggleStatus, onDelete, onEdit }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
            <th className="px-6 py-4 font-medium">Usuario</th>
            <th className="px-6 py-4 font-medium">Documento</th>
            <th className="px-6 py-4 font-medium">Rol</th>
            <th className="px-6 py-4 font-medium">Estado</th>
            <th className="px-6 py-4 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {usuarios.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm mr-3">
                    {user.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.nombre}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{user.ci}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {user.rol ? user.rol.replace('_', ' ') : 'S/R'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  user.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.estado === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {user.estado}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  <button onClick={() => onEdit(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onToggleStatus(user.id)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" 
                    title={user.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                  >
                    {user.estado === 'Activo' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => onDelete(user.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                No se encontraron resultados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
