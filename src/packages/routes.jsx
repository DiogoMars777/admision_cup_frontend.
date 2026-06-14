import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthLayout from '../shared/layouts/AuthLayout';
import DashboardLayout from '../shared/layouts/DashboardLayout';

// P1
const LoginPage = lazy(() => import('./P1_SeguridadYAuditoria/CU01_GestionDeUsuariosYAutenticacion/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./P1_SeguridadYAuditoria/CU01_GestionDeUsuariosYAutenticacion/pages/ForgotPasswordPage'));
const VerifyCodePage = lazy(() => import('./P1_SeguridadYAuditoria/CU01_GestionDeUsuariosYAutenticacion/pages/VerifyCodePage'));
const ResetPasswordPage = lazy(() => import('./P1_SeguridadYAuditoria/CU01_GestionDeUsuariosYAutenticacion/pages/ResetPasswordPage'));
const UsuariosPage = lazy(() => import('./P1_SeguridadYAuditoria/CU01_GestionDeUsuariosYAutenticacion/pages/UsuariosPage'));
const RolesPage = lazy(() => import('./P1_SeguridadYAuditoria/CU01_GestionDeUsuariosYAutenticacion/pages/RolesPage'));
const AdministrativosPage = lazy(() => import('./P1_SeguridadYAuditoria/CU01_GestionDeUsuariosYAutenticacion/pages/AdministrativosPage'));
const BitacoraPage = lazy(() => import('./P1_SeguridadYAuditoria/CU16_GestionarBitacora/pages/BitacoraPage'));
const DashboardPage = lazy(() => import('./P1_SeguridadYAuditoria/Dashboard/pages/DashboardPage'));

// P2
const ListaPostulantesPage = lazy(() => import('./P2_PostulantesYRequisitos/CU2_RegistrarPostulante/pages/ListaPostulantesPage'));
const PostulanteDocentePage = lazy(() => import('./P2_PostulantesYRequisitos/CU2_RegistrarPostulante/pages/PostulanteDocentePage'));
const RequisitosPage = lazy(() => import('./P2_PostulantesYRequisitos/CU3_GestionarRequisitos/pages/RequisitosPage'));
const DocumentosPage = lazy(() => import('./P2_PostulantesYRequisitos/CU3_GestionarRequisitos/pages/DocumentosPage'));
const PagosPage = lazy(() => import('./P3_GestionDePagos/CU4_GestionarPagos/pages/PagosPage'));
const InicioPostulantePage = lazy(() => import('./P2_PostulantesYRequisitos/CU2_RegistrarPostulante/pages/InicioPostulantePage'));
const MiGrupoPage = lazy(() => import('./P2_PostulantesYRequisitos/PostulantePortal/pages/MiGrupoPage'));
const PostulantePerfilPage = lazy(() => import('./P2_PostulantesYRequisitos/PostulantePortal/pages/PostulantePerfilPage'));

// P3
const GestionAcademicaPage = lazy(() => import('./P7_EvaluacionesYAdmision/CU12_CalcularAdmision/pages/GestionAcademicaPage'));
const CarrerasPage = lazy(() => import('./P4_OfertaAcademica/CU5_GestionarCarreras/pages/CarrerasPage'));
const MateriasPage = lazy(() => import('./P4_OfertaAcademica/CU6_GestionarMaterias/pages/MateriasPage'));
const DocentesPage = lazy(() => import('./P5_RecursosAcademicos/CU7_GestionarDocentes/pages/DocentesPage'));
const GruposPage = lazy(() => import('./P6_PlanificacionAcademica/CU8_GestionarGrupos/pages/GruposPage'));
const AulasPage = lazy(() => import('./P5_RecursosAcademicos/CU9_GestionarAulas/pages/AulasPage'));
const InicioDocentePage = lazy(() => import('./P5_RecursosAcademicos/CU7_GestionarDocentes/pages/InicioDocentePage'));
const DocenteMateriasPage = lazy(() => import('./P5_RecursosAcademicos/CU7_GestionarDocentes/pages/DocenteMateriasPage'));
const DocenteGruposPage = lazy(() => import('./P5_RecursosAcademicos/CU7_GestionarDocentes/pages/DocenteGruposPage'));
const DocentePerfilPage = lazy(() => import('./P5_RecursosAcademicos/CU7_GestionarDocentes/pages/DocentePerfilPage'));
const DocenteAsistenciaPage = lazy(() => import('./P5_RecursosAcademicos/CU7_GestionarDocentes/pages/DocenteAsistenciaPage'));

// Herramientas
const CargaMasivaPage = lazy(() => import('./P8_Reportes/Herramientas/pages/CargaMasivaPage'));

// Inteligencia Artificial
const ReportesPage = lazy(() => import('./P8_Reportes/Reportes/pages/ReportesPage'));

export default function SeguridadAccesoRoutes() {
  const LoadingFallback = () => (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-gray-500 font-medium">Cargando módulo...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
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
          <Route path="/p1/administrativos" element={<AdministrativosPage />} />
          <Route path="/p1/roles" element={<RolesPage />} />
          <Route path="/p1/bitacora" element={<BitacoraPage />} />
          {/* P2 */}
          <Route path="/p2/postulantes" element={<ListaPostulantesPage />} />
          <Route path="/p2/postulante-docente" element={<PostulanteDocentePage />} />
          <Route path="/p2/requisitos" element={<RequisitosPage />} />
          <Route path="/p2/documentos" element={<DocumentosPage />} />
          <Route path="/p2/pagos" element={<PagosPage />} />
          {/* P3 */}
          <Route path="/p3/gestiones-academicas" element={<GestionAcademicaPage />} />
          <Route path="/p3/carreras" element={<CarrerasPage />} />
          <Route path="/p3/materias" element={<MateriasPage />} />
          <Route path="/p3/docentes" element={<DocentesPage />} />
          <Route path="/p3/grupos" element={<GruposPage />} />
          <Route path="/p3/aulas" element={<AulasPage />} />
          <Route path="/p3/carga-masiva" element={<CargaMasivaPage />} />
          <Route path="/docente/dashboard" element={<InicioDocentePage />} />
          <Route path="/docente/materias" element={<DocenteMateriasPage />} />
          <Route path="/docente/grupos" element={<DocenteGruposPage />} />
          <Route path="/docente/asistencia" element={<DocenteAsistenciaPage />} />
          <Route path="/docente/perfil" element={<DocentePerfilPage />} />
          <Route path="/postulante/dashboard" element={<InicioPostulantePage />} />
          <Route path="/postulante/mi-grupo" element={<MiGrupoPage />} />
          <Route path="/postulante/perfil" element={<PostulantePerfilPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
