import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { NavItemId } from "./Sidebar";

function getActiveItem(pathname: string): NavItemId {
  if (pathname.startsWith("/data-import")) return "data-import";
  if (pathname.startsWith("/import-logs")) return "import-logs";
  if (pathname.startsWith("/couriers")) return "couriers";
  if (pathname.startsWith("/reports/couriers")) return "reports-couriers";
  if (pathname.startsWith("/reports/companies")) return "reports-companies";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/settings/security"))      return "settings-security";
  if (pathname.startsWith("/settings/notifications")) return "settings-notifications";
  if (pathname.startsWith("/settings/appearances"))   return "settings-appearances";
  if (pathname.startsWith("/settings/team"))          return "settings-team";
  if (pathname.startsWith("/settings/activity"))      return "settings-activity";
  if (pathname.startsWith("/settings/danger"))        return "settings-danger";
  if (pathname.startsWith("/settings/sla"))           return "settings-sla";
  if (pathname.startsWith("/settings/profile"))       return "settings-profile";
  if (pathname.startsWith("/settings"))               return "settings-profile";
  return "dashboard";
}

interface Props {
  children: React.ReactNode;
  logoSrc?: string;
  onLogout?: () => void;
}

export default function ProtectedLayout({ children, logoSrc, onLogout }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = getActiveItem(pathname);

  const handleNavigate = (id: NavItemId) => {
    setSidebarOpen(false);
    switch (id) {
      case "dashboard": navigate("/dashboard"); break;
      case "data-import": navigate("/data-import"); break;
      case "import-logs": navigate("/import-logs"); break;
      case "couriers": navigate("/couriers"); break;
      case "reports": navigate("/reports"); break;
      case "reports-couriers": navigate("/reports/couriers"); break;
      case "reports-companies": navigate("/reports/companies"); break;
      case "settings": navigate("/settings/profile"); break;
      case "settings-profile": navigate("/settings/profile"); break;
      case "settings-security":      navigate("/settings/security"); break;
      case "settings-notifications": navigate("/settings/notifications"); break;
      case "settings-appearances":   navigate("/settings/appearances"); break;
      case "settings-team":          navigate("/settings/team"); break;
      case "settings-activity":      navigate("/settings/activity"); break;
      case "settings-danger":        navigate("/settings/danger"); break;
      case "settings-sla":           navigate("/settings/sla"); break;
      default: break;
    }
  };

  return (
    <div className="flex flex-col h-screen" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header — full width */}
      <Header logoSrc={logoSrc} onMenuClick={() => setSidebarOpen(true)} />

      {/* Body row: sidebar + page content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — desktop */}
        <div className="max-md:hidden shrink-0 h-full">
          <Sidebar activeItem={activeItem} onNavigate={handleNavigate} onLogout={onLogout} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 start-0 z-10">
              <Sidebar activeItem={activeItem} onNavigate={handleNavigate} onLogout={onLogout} />
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 overflow-auto bg-[#F3F3F3] min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
