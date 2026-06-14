export default function BitacoraTable() {
  // Datos mockeados
  const registros = [
    { id: 1, usuario: 'Diogo Mars', rol: 'SUPER_ADMIN', accion: 'LOGIN', descripcion: 'Inicio de sesión exitoso', fecha: '2026-05-30', hora: '10:15:02', ip: '192.168.1.105' },
    { id: 2, usuario: 'Ana López', rol: 'ADMINISTRADOR', accion: 'CREATE', descripcion: 'Creación de materia INFO-101', fecha: '2026-05-30', hora: '09:45:12', ip: '192.168.1.200' },
    { id: 3, usuario: 'Carlos Perez', rol: 'COORDINADOR', accion: 'UPDATE', descripcion: 'Modificación de horario Grupo A', fecha: '2026-05-29', hora: '16:20:00', ip: '10.0.0.15' },
  ];

  const getActionColor = (accion) => {
    switch(accion) {
      case 'LOGIN': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'CREATE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'UPDATE': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'DELETE': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
            <th className="px-6 py-4 font-medium">Fecha/Hora</th>
            <th className="px-6 py-4 font-medium">Usuario</th>
            <th className="px-6 py-4 font-medium">Acción</th>
            <th className="px-6 py-4 font-medium">Descripción</th>
            <th className="px-6 py-4 font-medium">IP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {registros.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors text-sm">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-800">{row.fecha}</div>
                <div className="text-xs text-gray-500">{row.hora}</div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-800">{row.usuario}</div>
                <div className="text-xs text-gray-500">{row.rol}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getActionColor(row.accion)}`}>
                  {row.accion}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{row.descripcion}</td>
              <td className="px-6 py-4 text-gray-500 font-mono text-xs">{row.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
