import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RemoteErrorBoundary from "./components/RemoteErrorBoundary";
import { Layout } from "@ops-brain/shared";
import type { NavItemId } from "@ops-brain/shared";
import GuestRoute from "./guards/GuestRoute";
import ProtectedRoute from "./guards/ProtectedGaurd";
import { useUserStore } from "./store/auth.store";
import { logout as logoutRequest } from "./api/auth.service";
import Logo from "./assets/logo.svg";

const RemoteDataImportPage = lazy(() => import("mfDataExport/DataImportPage"));
const RemoteImportLogsPage = lazy(() => import("mfDataExport/ImportLogsPage"));
const RemoteCourierPage = lazy(() => import("mfCouriers/CouriersPage"));
const RemoteCourierProfile = lazy(() => import("mfCouriers/CouriersProfile"));
const RemoteAddCourierPage = lazy(() => import("mfCouriers/AddCourierPage"));
const RemoteReportsPage          = lazy(() => import("mfReports/ReportsPage"));
const RemoteAddReportPage        = lazy(() => import("mfReports/AddReportPage"));
const RemoteCouriersReportPage   = lazy(() => import("mfReports/CouriersReportPage"));
const RemoteCompaniesReportPage  = lazy(() => import("mfReports/CompaniesReportPage"));
const RemoteProfilePage          = lazy(() => import("mfSettings/ProfilePage"));
const RemoteSecurityPage         = lazy(() => import("mfSettings/SecurityPage"));
const RemoteNotificationsPage    = lazy(() => import("mfSettings/NotificationsPage"));
const RemoteAppearancesPage      = lazy(() => import("mfSettings/AppearancesPage"));
const RemoteTeamPage             = lazy(() => import("mfSettings/TeamPage"));
const RemoteActivityPage         = lazy(() => import("mfSettings/ActivityPage"));
const RemoteDangerZonePage       = lazy(() => import("mfSettings/DangerZonePage"));
const RemoteSLAPage              = lazy(() => import("mfSettings/SLAPage"));
const RemoteFallback = (
  <div className="flex items-center justify-center min-h-screen ">
    <div className="w-8 h-8 border-4 border-[#2E75B6] border-t-transparent rounded-full animate-spin" />
  </div>
);

function useMfNavigate() {
  const navigate = useNavigate();
  return (id: NavItemId) => {
    switch (id) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "data-import":
        navigate("/data-import");
        break;
      case "import-logs":
        navigate("/import-logs");
        break;
      case "couriers":
        navigate("/couriers");
        break;
      case "reports":
        navigate("/reports");
        break;
      case "reports-couriers":
        navigate("/reports/couriers");
        break;
      case "reports-companies":
        navigate("/reports/companies");
        break;
      case "settings":
        navigate("/settings/profile");
        break;
      case "settings-profile":
        navigate("/settings/profile");
        break;
      case "settings-security":
        navigate("/settings/security");
        break;
      case "settings-notifications":
        navigate("/settings/notifications");
        break;
      case "settings-appearances":
        navigate("/settings/appearances");
        break;
      case "settings-team":
        navigate("/settings/team");
        break;
      case "settings-activity":
        navigate("/settings/activity");
        break;
      case "settings-danger":
        navigate("/settings/danger");
        break;
      case "settings-sla":
        navigate("/settings/sla");
        break;
      default:
        break;
    }
  };
}

function DataImportRoute() {
  const handleNavigate = useMfNavigate();
  return (
    <RemoteErrorBoundary moduleName="mf-data-export">
      <Suspense fallback={RemoteFallback}>
        <RemoteDataImportPage onNavigate={handleNavigate} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function ImportLogsRoute() {
  const handleNavigate = useMfNavigate();
  return (
    <RemoteErrorBoundary moduleName="mf-data-export">
      <Suspense fallback={RemoteFallback}>
        <RemoteImportLogsPage onNavigate={handleNavigate} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function CourierRoute() {
  const handleNavigate = useMfNavigate();
  return (
    <RemoteErrorBoundary moduleName="mf-couriers">
      <Suspense fallback={RemoteFallback}>
        <RemoteCourierPage onNavigate={handleNavigate} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function CourierProfileRoute() {
  const handleNavigate = useMfNavigate();
  return (
    <RemoteErrorBoundary moduleName="mf-couriers">
      <Suspense fallback={RemoteFallback}>
        <RemoteCourierProfile onNavigate={handleNavigate} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function AddCourierRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-couriers">
      <Suspense fallback={RemoteFallback}>
        <RemoteAddCourierPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function ReportsRoute() {
  const handleNavigate = useMfNavigate();
  return (
    <RemoteErrorBoundary moduleName="mf-reports">
      <Suspense fallback={RemoteFallback}>
        <RemoteReportsPage onNavigate={handleNavigate} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function AddReportRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-reports">
      <Suspense fallback={RemoteFallback}>
        <RemoteAddReportPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function CouriersReportRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-reports">
      <Suspense fallback={RemoteFallback}>
        <RemoteCouriersReportPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function CompaniesReportRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-reports">
      <Suspense fallback={RemoteFallback}>
        <RemoteCompaniesReportPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function ProfileRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-settings">
      <Suspense fallback={RemoteFallback}>
        <RemoteProfilePage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function SecurityRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-settings">
      <Suspense fallback={RemoteFallback}>
        <RemoteSecurityPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function NotificationsRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-settings">
      <Suspense fallback={RemoteFallback}>
        <RemoteNotificationsPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function AppearancesRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-settings">
      <Suspense fallback={RemoteFallback}>
        <RemoteAppearancesPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function TeamRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-settings">
      <Suspense fallback={RemoteFallback}>
        <RemoteTeamPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function ActivityRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-settings">
      <Suspense fallback={RemoteFallback}>
        <RemoteActivityPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function DangerZoneRoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-settings">
      <Suspense fallback={RemoteFallback}>
        <RemoteDangerZonePage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function SLARoute() {
  return (
    <RemoteErrorBoundary moduleName="mf-settings">
      <Suspense fallback={RemoteFallback}>
        <RemoteSLAPage />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function useLogout() {
  const storeLogout = useUserStore((s) => s.logout);
  const navigate = useNavigate();
  return () => {
    storeLogout();
    navigate("/login", { replace: true });
    logoutRequest().catch(() => {});
  };
}

function AppRoutes() {
  const onLogout = useLogout();
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/data-import" element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><DataImportRoute /></Layout></ProtectedRoute>} />
      <Route path="/import-logs" element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><ImportLogsRoute /></Layout></ProtectedRoute>} />
      <Route path="/couriers" element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><CourierRoute /></Layout></ProtectedRoute>} />
      <Route path="/couriers/add" element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><AddCourierRoute /></Layout></ProtectedRoute>} />
      <Route path="/couriers/:id" element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><CourierProfileRoute /></Layout></ProtectedRoute>} />
      <Route path="/reports"           element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><ReportsRoute /></Layout></ProtectedRoute>} />
      <Route path="/reports/add"       element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><AddReportRoute /></Layout></ProtectedRoute>} />
      <Route path="/reports/couriers"  element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><CouriersReportRoute /></Layout></ProtectedRoute>} />
      <Route path="/reports/companies" element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><CompaniesReportRoute /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
      <Route path="/settings/profile"  element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><ProfileRoute /></Layout></ProtectedRoute>} />
      <Route path="/settings/security"      element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><SecurityRoute /></Layout></ProtectedRoute>} />
      <Route path="/settings/notifications" element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><NotificationsRoute /></Layout></ProtectedRoute>} />
      <Route path="/settings/appearances"   element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><AppearancesRoute /></Layout></ProtectedRoute>} />
      <Route path="/settings/team"          element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><TeamRoute /></Layout></ProtectedRoute>} />
      <Route path="/settings/activity"      element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><ActivityRoute /></Layout></ProtectedRoute>} />
      <Route path="/settings/danger"        element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><DangerZoneRoute /></Layout></ProtectedRoute>} />
      <Route path="/settings/sla"           element={<ProtectedRoute><Layout logoSrc={Logo} onLogout={onLogout}><SLARoute /></Layout></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  const initAuth = useUserStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
