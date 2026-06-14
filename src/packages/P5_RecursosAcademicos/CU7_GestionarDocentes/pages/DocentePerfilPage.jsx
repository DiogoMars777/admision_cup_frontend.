import { User, Mail, Shield, BookOpen, Clock, Building } from 'lucide-react';

export default function DocentePerfilPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { nombre: 'Docente Desconocido', email: 'correo@ejemplo.com', rol: 'Docente' };
  const isCoordinador = user?.rol === 'Coordinador';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-6">
      {/* Encabezado del Perfil */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-md p-1.5 flex items-center justify-center">
              <div className="w-full h-full bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-3xl font-bold">
                {user.nombre.charAt(0)}
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-200 shadow-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> Docente Oficial
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user.nombre}</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-2 font-medium">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Académica */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Información Académica
          </h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium">Departamento</span>
              <span className="font-bold text-gray-800">CUP Admisión</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium">Gestión Activa</span>
              <span className="font-bold text-gray-800">2026</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium">Estado</span>
              <span className="font-bold text-emerald-600">Activo</span>
            </li>
          </ul>
        </div>

        {/* Detalles de la Cuenta */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <User className="w-5 h-5 text-blue-600" />
            Detalles de la Cuenta
          </h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium">Nombre Completo</span>
              <span className="font-bold text-gray-800">{user.nombre}</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium">Carnet de Identidad (CI)</span>
              <span className="font-bold text-gray-800">{user.ci || 'Re-ingresa para ver'}</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium">Teléfono</span>
              <span className="font-bold text-gray-800">{user.telefono || 'Re-ingresa para ver'}</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium">Rol del Sistema</span>
              <span className="font-bold text-gray-800">{user.rol}</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium">Sede</span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Building className="w-4 h-4 text-gray-400" /> Campus Central
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
