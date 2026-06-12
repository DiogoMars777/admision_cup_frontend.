import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { Eye, EyeOff, Lock, ShieldCheck, CheckCircle2, Circle, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ResetPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const code = location.state?.code;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await authService.resetPassword({ ...data, email, code });
      toast.success('Contraseña actualizada correctamente');
      navigate('/');
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al restablecer la contraseña. Intenta de nuevo.');
    }
  };

  const password = watch('password') || '';

  // Reglas de validación
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const allValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

  const RequirementItem = ({ label, isValid }) => (
    <div className={`flex items-center gap-2 text-xs font-medium transition-all duration-300 ${isValid ? 'text-emerald-600' : 'text-gray-400'}`}>
      {isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </div>
  );

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            {...register('password', { 
              required: 'La contraseña es obligatoria',
              validate: () => allValid || 'No cumple los requisitos mínimos'
            })}
            type={showPassword ? 'text' : 'password'}
            className="block w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
        {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
      </div>

      {/* Confirmar */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <ShieldCheck className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            {...register('confirmPassword', { 
              required: 'Confirma tu contraseña',
              validate: value => value === password || 'Las contraseñas no coinciden'
            })}
            type={showConfirmPassword ? 'text' : 'password'}
            className="block w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
      </div>

      {/* Indicadores de seguridad */}
      <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Requisitos de seguridad</p>
        <div className="grid grid-cols-2 gap-2.5">
          <RequirementItem label="8+ caracteres" isValid={hasMinLength} />
          <RequirementItem label="Una mayúscula" isValid={hasUppercase} />
          <RequirementItem label="Una minúscula" isValid={hasLowercase} />
          <RequirementItem label="Un número" isValid={hasNumber} />
          <RequirementItem label="Un símbolo" isValid={hasSymbol} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !allValid}
        className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: allValid ? 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0a4a8e 100%)' : '#94a3b8' }}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Restablecer Contraseña
          </>
        )}
      </button>
    </form>
  );
}
