import ForgotPasswordForm from '../components/ForgotPasswordForm';
import { KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  return (
    <div>
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-50 p-3 rounded-xl mb-4">
          <KeyRound className="h-7 w-7 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recuperar contraseña</h2>
        <p className="text-sm text-gray-500 mt-1 text-center">
          Ingresa tu correo y te enviaremos un código de verificación
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
