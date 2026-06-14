import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">¡Bienvenido!</h2>
        <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para acceder al sistema</p>
      </div>
      <LoginForm />
    </div>
  );
}
