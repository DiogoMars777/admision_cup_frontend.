import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileClock, UserPlus, ClipboardList, 
  BookOpen, GraduationCap, UsersRound, School, Menu, Bell,
  ChevronDown, ShieldAlert, X, ChevronRight, FileCheck, CreditCard, Calendar, PieChart, Mic
} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      if (userRole === 'Docente') {
        const hasActiveGestion = user?.has_active_gestion ?? true;
        if (hasActiveGestion) {
            navigate('/docente/dashboard', { replace: true });
        } else {
            navigate('/docente/perfil', { replace: true });
        }
      } else if (userRole === 'Postulante') {
        navigate('/postulante/mi-grupo', { replace: true });
      }
    }
  }, [userRole, location.pathname, navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
      }
    } catch(e) { console.error(e); }
    finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  const isActiveItem = (item) => isActive(item.path) || (item.extraPaths || []).includes(location.pathname);

  const hasActiveGestion = user?.has_active_gestion ?? true;

  const menuItems = userRole === 'Docente' ? [
    { section: 'DOCENTE', items: hasActiveGestion ? [
      { name: 'Inicio', icon: LayoutDashboard, path: '/docente/dashboard' },
      { name: 'Mis Grupos', icon: UsersRound, path: '/docente/grupos' },
      { name: 'Materias', icon: BookOpen, path: '/docente/materias' },
      { name: 'Asistencia', icon: FileCheck, path: '/docente/asistencia' },
      { name: 'Perfil', icon: UserPlus, path: '/docente/perfil' }
    ] : [
      { name: 'Materias', icon: BookOpen, path: '/docente/materias' },
      { name: 'Perfil', icon: UserPlus, path: '/docente/perfil' }
    ]}
  ] : userRole === 'Postulante' ? [
    { section: 'NAVEGACIÓN', items: [
      { name: 'Panel',    icon: LayoutDashboard, path: '/postulante/dashboard' },
      { name: 'Grupo',    icon: UsersRound,       path: '/postulante/mi-grupo'  },
      { name: 'Perfil',   icon: UserPlus,          path: '/postulante/perfil'    }
    ]}
  ] : [
    { section: 'PANEL', items: [{ name: 'Panel', icon: LayoutDashboard, path: '/dashboard' }] },
    { section: 'SEGURIDAD', items: [
      { name: 'Usuarios', icon: Users, path: '/p1/usuarios' },
      { name: 'Administrativos', icon: ShieldAlert, path: '/p1/administrativos' },
      { name: 'Roles', icon: ShieldAlert, path: '/p1/roles' },
      { name: 'Bitácora', icon: FileClock, path: '/p1/bitacora' }
    ]},
    { section: 'POSTULANTES', items: [
      { name: 'Postulantes', icon: UserPlus, path: '/p2/postulantes' },
      { name: 'Postulante Docente', icon: GraduationCap, path: '/p2/postulante-docente' },
      { name: 'Requisitos', icon: ClipboardList, path: '/p2/requisitos' },
      { name: 'Documentos', icon: FileCheck, path: '/p2/documentos' },
      { name: 'Pagos', icon: CreditCard, path: '/p2/pagos' }
    ]},
    { section: 'ACADÉMICO', items: [
      { name: 'Gestiones Académicas', icon: Calendar, path: '/p3/gestiones-academicas' },
      { name: 'Carreras', icon: BookOpen, path: '/p3/carreras' },
      { name: 'Materias', icon: BookOpen, path: '/p3/materias' },
      { name: 'Docentes', icon: GraduationCap, path: '/p3/docentes' },
      { name: 'Grupos', icon: UsersRound, path: '/p3/grupos' },
      { name: 'Aulas', icon: School, path: '/p3/aulas' }
    ]},
    { section: 'HERRAMIENTAS', items: [
      { name: 'Carga Masiva', icon: FileCheck, path: '/p3/carga-masiva' }
    ]},
    { section: 'INTELIGENCIA ARTIFICIAL', items: [
      { name: 'Reportes IA', icon: PieChart, path: '/reportes' }
    ]}
  ];

  // Breadcrumb generation
  const getBreadcrumbs = () => {
    const pathMap = {
      '/dashboard': 'Panel',
      '/p1/usuarios': 'Usuarios',
      '/p1/administrativos': 'Administrativos',
      '/p1/roles': 'Roles',
      '/p1/bitacora': 'Bitácora',
      '/p2/postulantes': 'Postulantes',
      '/p2/postulante-docente': 'Postulante Docente',
      '/p2/requisitos': 'Requisitos',
      '/p2/documentos': 'Documentos',
      '/p2/pagos': 'Pagos',
      '/p3/gestiones-academicas': 'Gestiones Académicas',
      '/p3/carreras': 'Carreras',
      '/p3/materias': 'Materias',
      '/p3/docentes': 'Docentes',
      '/p3/grupos': 'Grupos',
      '/p3/aulas': 'Aulas',
      '/p3/carga-masiva': 'Carga Masiva (Excel)',
      '/docente/dashboard': 'Inicio',
      '/docente/grupos': 'Mis Grupos',
      '/docente/materias': 'Materias Habilitadas',
      '/docente/asistencia': 'Control de Asistencia',
      '/docente/perfil': 'Mi Perfil',
      '/postulante/dashboard': 'Panel',
      '/postulante/mi-grupo':  'Grupo',
      '/postulante/perfil':    'Mi Perfil',
    };
    return pathMap[location.pathname] || 'Panel';
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
        <div className="bg-white/10 p-2 rounded-lg mr-3">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <h1 className="text-sm font-bold leading-tight text-white">Sistema CUP</h1>
            <p className="text-[10px] text-blue-300/60">Universidad Autónoma</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((group, idx) => (
          <div key={idx} className="mb-5">
            {sidebarOpen && (
              <p className="px-5 text-[10px] font-bold text-blue-300/40 mb-2 tracking-[0.15em] uppercase">
                {group.section}
              </p>
            )}
            <ul>
              {group.items.map((item, i) => {
                const active = isActiveItem(item);
                return (
                  <li key={i}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center px-4 py-2 mx-2 rounded-lg mb-0.5 text-[13px] font-medium transition-all duration-200 ${
                        active 
                          ? 'bg-white/15 text-white shadow-sm' 
                          : 'text-blue-200/70 hover:bg-white/5 hover:text-white'
                      }`}
                      title={!sidebarOpen ? item.name : ''}
                    >
                      <item.icon className={`h-[18px] w-[18px] ${sidebarOpen ? 'mr-3' : 'mx-auto'} ${active ? 'text-white' : 'text-blue-300/50'}`} />
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User info at bottom of sidebar */}
      {sidebarOpen && (
        <div className="border-t border-white/10 p-4 flex-shrink-0">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-white mr-3">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{userFirstName}</p>
              <p className="text-[10px] text-blue-300/50 truncate">{userRole}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-[68px]'}`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside 
            className="relative w-60 flex flex-col"
            style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
          >
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Navbar */}
        <header className="h-14 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 lg:px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileSidebarOpen(true)} 
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Desktop collapse button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="hidden lg:block text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center text-sm text-gray-400 gap-1.5">
              <span>Panel</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-gray-700 font-medium">{getBreadcrumbs()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:block">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button className="text-gray-400 hover:text-gray-600 relative p-1.5 rounded-md hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button 
                className="flex items-center gap-2 pl-3 border-l border-gray-200 hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ background: 'linear-gradient(135deg, #0f172a, #0a4a8e)' }}>
                  {userInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-700 leading-tight">{userFirstName}</p>
                  <p className="text-[10px] text-gray-400">{userRole}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{userName}</p>
                      <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
