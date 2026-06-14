import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldAlert, Clock, Ban } from 'lucide-react';
import { authService } from '../services/authService';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lockout state
  const [locked, setLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const timerRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (locked && lockoutSeconds > 0) {
      timerRef.current = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setLocked(false);
            setAttemptsRemaining(5);
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
      const response = await authService.login(data);
      if (response?.user?.rol === 'Docente') {
        navigate('/docente/dashboard');
      } else if (response?.user?.rol === 'Postulante') {
        navigate('/postulante/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const res = error.response?.data;
      if (res) {
        setErrorMsg(res.message || 'Credenciales incorrectas.');
        if (res.locked) {
          setLocked(true);
          setLockoutSeconds(res.lockout_seconds || 300);
          setAttemptsRemaining(0);
        } else if (res.remaining !== undefined) {
          setAttemptsRemaining(res.remaining);
        }
      } else {
        setErrorMsg('Error de conexión. Verifica tu red.');
      }
    }
  };

  const isFormDisabled = isSubmitting || locked;

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
              <p className="text-sm font-bold text-red-800">Cuenta bloqueada temporalmente</p>
              <p className="text-xs text-red-600 mt-0.5">Has superado el máximo de 5 intentos fallidos</p>
            </div>
          </div>
          <div className="bg-red-100/60 rounded-lg p-3 flex items-center justify-center gap-3">
            <Clock className="h-5 w-5 text-red-600 animate-pulse" />
            <span className="text-2xl font-mono font-bold text-red-700 tracking-wider">{formatTime(lockoutSeconds)}</span>
            <span className="text-xs text-red-600">para volver a intentar</span>
          </div>
          <p className="text-[11px] text-red-500 mt-2 text-center">
            La recuperación de contraseña también está deshabilitada durante el bloqueo.
          </p>
        </div>
      )}

      {/* Error message (non-lockout) */}
      {errorMsg && !locked && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error de autenticación</p>
            <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Attempts remaining warning */}
      {!locked && attemptsRemaining < 5 && attemptsRemaining > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 animate-in fade-in">
          <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-amber-800">
              <span className="font-bold">Intentos restantes: {attemptsRemaining} de 5.</span>
              {attemptsRemaining <= 2 && ' ¡Tu cuenta será bloqueada temporalmente!'}
            </p>
            {/* Progress bar of attempts */}
            <div className="w-full h-1.5 bg-amber-100 rounded-full mt-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((5 - attemptsRemaining) / 5) * 100}%`,
                  background: attemptsRemaining <= 2 ? '#dc2626' : '#f59e0b'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Campo Email */}
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
            disabled={isFormDisabled}
            className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="usuario@correo.com"
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>}
      </div>

      {/* Campo Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            id="password"
            {...register('password', { required: 'La contraseña es obligatoria' })}
            type={showPassword ? "text" : "password"}
            disabled={isFormDisabled}
            className="block w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password.message}</p>}
      </div>

      {/* Recordarme + Recuperar */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            {...register('remember')}
            type="checkbox"
            disabled={isFormDisabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Recordarme</span>
        </label>
        {locked ? (
          <span className="text-sm font-medium text-gray-400 cursor-not-allowed flex items-center gap-1" title="Recuperación bloqueada durante el bloqueo temporal">
            <Ban className="h-3.5 w-3.5" />
            Recuperar bloqueado
          </span>
        ) : (
          <Link 
            to="/forgot-password" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        )}
      </div>

      {/* Botón Ingresar */}
      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: isFormDisabled 
            ? '#64748b' 
            : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0a4a8e 100%)',
        }}
        onMouseEnter={(e) => { if (!isFormDisabled) e.target.style.opacity = '0.9'; }}
        onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Ingresando...
          </>
        ) : locked ? (
          <>
            <Ban className="h-4 w-4 mr-2" />
            Bloqueado ({formatTime(lockoutSeconds)})
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Ingresar al Sistema
          </>
        )}
      </button>

      {/* Credenciales de prueba */}
      <div className="mt-4 bg-blue-50/60 rounded-xl p-4 border border-blue-100">
        <p className="text-xs font-semibold text-blue-800 mb-2">Credenciales de prueba:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <div>
            <span className="text-blue-500 font-medium">Usuario:</span>
            <p className="font-mono text-blue-800">diogomars2020@gmail.com</p>
          </div>
          <div>
            <span className="text-blue-500 font-medium">Contraseña:</span>
            <p className="font-mono text-blue-800">admin123</p>
          </div>
        </div>
      </div>
    </form>
  );
}
