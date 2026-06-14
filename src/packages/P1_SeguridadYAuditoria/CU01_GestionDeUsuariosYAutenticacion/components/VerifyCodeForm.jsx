import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Hash, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function VerifyCodeForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await authService.verifyCode({ ...data, email });
      navigate('/reset-password', { state: { email, code: data.code } });
    } catch (error) {
      console.error(error);
      setErrorMsg('El código ingresado es inválido o ha expirado.');
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {email && (
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-600">
            Código enviado a: <span className="font-semibold">{email}</span>
          </p>
        </div>
      )}

      <div>
        <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Código de verificación
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Hash className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            id="code"
            {...register('code', { required: 'El código es obligatorio', minLength: 6, maxLength: 6 })}
            type="text"
            maxLength={6}
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold tracking-[0.4em] text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            placeholder="000000"
          />
        </div>
        {errors.code && <p className="text-red-500 text-xs mt-1.5 text-center flex items-center justify-center gap-1"><AlertCircle className="h-3 w-3" />{errors.code.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0a4a8e 100%)' }}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verificando...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Verificar Código
          </>
        )}
      </button>
    </form>
  );
}
