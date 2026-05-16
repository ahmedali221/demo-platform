import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProfilePage from "./pages/profile/ProfilePage";
import SecurityPage from "./pages/security/SecurityPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import AppearancesPage from "./pages/appearances/AppearancesPage";
import TeamPage from "./pages/team/TeamPage";
import ActivityPage from "./pages/activity/ActivityPage";
import DangerZonePage from "./pages/danger/DangerZonePage";
import SLAPage from "./pages/sla/SLAPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings/profile"       element={<ProfilePage />} />
        <Route path="/settings/security"      element={<SecurityPage />} />
        <Route path="/settings/notifications" element={<NotificationsPage />} />
        <Route path="/settings/appearances"   element={<AppearancesPage />} />
        <Route path="/settings/team"          element={<TeamPage />} />
        <Route path="/settings/activity"      element={<ActivityPage />} />
        <Route path="/settings/danger"        element={<DangerZonePage />} />
        <Route path="/settings/sla"           element={<SLAPage />} />
        <Route path="*" element={<Navigate to="/settings/profile" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
