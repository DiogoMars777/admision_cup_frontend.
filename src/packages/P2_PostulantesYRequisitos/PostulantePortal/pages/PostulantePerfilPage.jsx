import { User, Mail, Shield, BookOpen, GraduationCap, Building, Phone, CreditCard } from 'lucide-react';

export default function PostulantePerfilPage() {
  const userString = localStorage.getItem('user');
  const user = userString
    ? JSON.parse(userString)
    : { nombre: 'Postulante', email: 'correo@ejemplo.com', rol: 'Postulante' };
  const isCoordinador = user?.rol === 'Coordinador';

  const initial = (user.nombre || 'P').charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-6">

      {/* Encabezado del Perfil */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner degradado */}
        <div className="h-32 bg-gradient-to-r from-slate-700 to-blue-700" />

        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white rounded-2xl shadow-md p-1.5 flex items-center justify-center">
              <div className="w-full h-full bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 text-3xl font-bold">
                {initial}
              </div>
            </div>
            {/* Badge de rol */}
            <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-200 shadow-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> Postulante
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

      {/* Tarjetas de información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Información de la cuenta */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <User className="w-5 h-5 text-blue-600" />
            Datos Personales
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Nombre Completo
              </span>
              <span className="font-bold text-gray-800 text-right max-w-[55%] truncate">
                {user.nombre || '—'}
              </span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> Correo Electrónico
              </span>
              <span className="font-bold text-gray-800 text-right max-w-[55%] truncate">
                {user.email || '—'}
              </span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" /> Carnet (CI)
              </span>
              <span className="font-bold text-gray-800">
                {user.ci || '—'}
              </span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Teléfono
              </span>
              <span className="font-bold text-gray-800">
                {user.telefono || '—'}
              </span>
            </li>
          </ul>
        </div>

        {/* Información del proceso */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Información Académica
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" /> Rol del Sistema
              </span>
              <span className="font-bold text-blue-700">{user.rol || 'Postulante'}</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-400" /> Gestión Activa
              </span>
              <span className="font-bold text-gray-800">2026</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-400" /> Institución
              </span>
              <span className="font-bold text-gray-800">CUP - Universidad Autónoma</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Estado
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Activo
              </span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
