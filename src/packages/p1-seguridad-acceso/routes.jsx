import { Routes, Route } from 'react-router-dom';
import AuthLayout from '../../shared/layouts/AuthLayout';
import DashboardLayout from '../../shared/layouts/DashboardLayout';

// P1
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyCodePage from './pages/VerifyCodePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/UsuariosPage';
import BitacoraPage from './pages/BitacoraPage';
import RolesPage from './pages/RolesPage';

// P2
import ListaPostulantesPage from '../p2-postulantes/pages/ListaPostulantesPage';
import RequisitosPage from '../p2-postulantes/pages/RequisitosPage';
import DocumentosPage from '../p2-postulantes/pages/DocumentosPage';

// P3
import MateriasPage from '../p3-academico/pages/MateriasPage';
import DocentesPage from '../p3-academico/pages/DocentesPage';
import GruposPage from '../p3-academico/pages/GruposPage';
import AulasPage from '../p3-academico/pages/AulasPage';

export default function SeguridadAccesoRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* P1 */}
        <Route path="/p1/usuarios" element={<UsuariosPage />} />
        <Route path="/p1/roles" element={<RolesPage />} />
        <Route path="/p1/bitacora" element={<BitacoraPage />} />
        {/* P2 */}
        <Route path="/p2/postulantes" element={<ListaPostulantesPage />} />
        <Route path="/p2/requisitos" element={<RequisitosPage />} />
        <Route path="/p2/documentos" element={<DocumentosPage />} />
        {/* P3 */}
        <Route path="/p3/materias" element={<MateriasPage />} />
        <Route path="/p3/docentes" element={<DocentesPage />} />
        <Route path="/p3/grupos" element={<GruposPage />} />
        <Route path="/p3/aulas" element={<AulasPage />} />
      </Route>
    </Routes>
  );
}
