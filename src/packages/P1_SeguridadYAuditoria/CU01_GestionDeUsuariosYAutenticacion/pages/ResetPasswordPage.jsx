import ResetPasswordForm from '../components/ResetPasswordForm';
import { LockKeyhole } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="flex flex-col items-center mb-6">
        <div className="bg-amber-50 p-3 rounded-xl mb-4">
          <LockKeyhole className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nueva contraseña</h2>
        <p className="text-sm text-gray-500 mt-1 text-center">
          Establece una contraseña segura para tu cuenta
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
