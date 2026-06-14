import VerifyCodeForm from '../components/VerifyCodeForm';
import { ShieldCheck } from 'lucide-react';

export default function VerifyCodePage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  return (
    <div>
      <div className="flex flex-col items-center mb-6">
        <div className="bg-emerald-50 p-3 rounded-xl mb-4">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Verificar código</h2>
        <p className="text-sm text-gray-500 mt-1 text-center">
          Ingresa el código de 6 dígitos que enviamos a tu correo
        </p>
      </div>
      <VerifyCodeForm />
    </div>
  );
}
