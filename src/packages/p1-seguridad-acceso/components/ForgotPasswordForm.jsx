import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Send, ArrowLeft, AlertCircle, Ban, Clock } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPasswordForm() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  // Lockout state
  const [locked, setLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const timerRef = useRef(null);

  const emailValue = watch('email');

  // Countdown timer
  useEffect(() => {
    if (locked && lockoutSeconds > 0) {
      timerRef.current = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setLocked(false);
            setErrorMsg('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [locked]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const onSubmit = async (data) => {
    if (locked) return;
    setErrorMsg('');
    try {
      await authService.forgotPassword(data);
      navigate('/verify-code', { state: { email: data.email } });
    } catch (error) {
      const res = error.response?.data;
      if (res?.locked) {
        setLocked(true);
        setLockoutSeconds(res.lockout_seconds || 300);
        setErrorMsg('');
      } else {
        setErrorMsg(res?.message || 'No se pudo enviar el código. Verifica el correo ingresado.');
      }
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Lockout Banner */}
      {locked && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 animate-in fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">Acción bloqueada</p>
              <p className="text-xs text-red-600 mt-0.5">
                Se detectaron múltiples intentos fallidos de inicio de sesión con este correo.
              </p>
            </div>
          </div>
          <div className="bg-red-100/60 rounded-lg p-3 flex items-center justify-center gap-3">
            <Clock className="h-5 w-5 text-red-600 animate-pulse" />
            <span className="text-2xl font-mono font-bold text-red-700 tracking-wider">{formatTime(lockoutSeconds)}</span>
            <span className="text-xs text-red-600">para poder continuar</span>
          </div>
          <p className="text-[11px] text-red-500 mt-2 text-center">
            Debes esperar a que expire el bloqueo temporal antes de recuperar tu contraseña.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Correo electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            id="email"
            {...register('email', { required: 'El correo es obligatorio' })}
            type="email"
            disabled={locked}
            className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="tu-correo@gmail.com"
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || locked}
        className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ 
          background: (isSubmitting || locked) 
            ? '#64748b'
            : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0a4a8e 100%)' 
        }}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </>
        ) : locked ? (
          <>
            <Ban className="h-4 w-4 mr-2" />
            Bloqueado ({formatTime(lockoutSeconds)})
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Enviar Código de Verificación
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
