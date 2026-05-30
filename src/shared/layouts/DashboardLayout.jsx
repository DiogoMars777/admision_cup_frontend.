import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileClock, 
  UserPlus, 
  ClipboardList, 
  BookOpen, 
  GraduationCap, 
  UsersRound, 
  School,
  Menu,
  Bell,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { nombre: 'Usuario', email: 'admin@cup.edu.bo' };
  
  const userName = user?.nombre || 'Usuario';
  const userEmail = user?.email || 'admin@cup.edu.bo';
  const userInitial = userName.charAt(0).toUpperCase();
  const userFirstName = userName.split(' ')[0];
  const userRole = user?.rol || 'Administrador';

  const handleLogout = async () => {
    // Importamos authService dinámicamente para evitar dependencias circulares complejas aquí si las hubiera, o simplemente usamos localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Llamar al endpoint de logout (usando fetch directo para no complicar importaciones si no está a mano)
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
    } catch(e) {}
    
    navigate('/');
  };

  const isActive = (path) => location.pathname.includes(path);

  const menuItems = [
    { section: 'DASHBOARD', items: [{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }] },
    { 
      section: 'P1 SEGURIDAD', 
      items: [
        { name: 'Usuarios', icon: Users, path: '/p1/usuarios' },
        { name: 'Roles', icon: ShieldAlert, path: '/p1/roles' },
        { name: 'Bitácora', icon: FileClock, path: '/p1/bitacora' }
      ] 
    },
    { 
      section: 'P2 POSTULANTES', 
      items: [
        { name: 'Registrar Postulante', icon: UserPlus, path: '/p2/postulantes' },
        { name: 'Requisitos', icon: ClipboardList, path: '/p2/requisitos' }
      ] 
    },
    { 
      section: 'P3 ACADÉMICO', 
      items: [
        { name: 'Materias', icon: BookOpen, path: '/p3/materias' },
        { name: 'Docentes', icon: GraduationCap, path: '/p3/docentes' },
        { name: 'Grupos', icon: UsersRound, path: '/p3/grupos' },
        { name: 'Aulas', icon: School, path: '/p3/aulas' }
      ] 
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className={`bg-[#111827] text-white transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center px-4 border-b border-gray-800">
          <div className="bg-primary p-1.5 rounded-lg mr-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="text-sm font-bold leading-tight">Sistema CUP</h1>
              <p className="text-[10px] text-gray-400">Universidad Autónoma</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {menuItems.map((group, idx) => (
            <div key={idx} className="mb-6">
              {sidebarOpen && (
                <p className="px-5 text-xs font-semibold text-gray-500 mb-2 tracking-wider">
                  {group.section}
                </p>
              )}
              <ul>
                {group.items.map((item, i) => {
                  const active = isActive(item.path);
                  return (
                    <li key={i}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-5 py-2.5 mx-2 rounded-lg mb-1 transition-colors ${
                          active ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                        title={!sidebarOpen ? item.name : ''}
                      >
                        <item.icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'} ${active ? 'text-white' : 'text-gray-400'}`} />
                        {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="ml-4 text-xl font-semibold text-gray-800 hidden sm:block">
              Panel de Control
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 hidden md:block">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer border-l pl-4 ml-2 hover:bg-gray-50 p-1 rounded"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm mr-2">
                  {userInitial}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-700 leading-tight">{userFirstName}</p>
                  <p className="text-[10px] text-gray-500">{userRole}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
              </div>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
