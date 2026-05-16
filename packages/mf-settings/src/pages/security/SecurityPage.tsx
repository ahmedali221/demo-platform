import { useTranslation } from "react-i18next";
import "../../lib/i18n";
import ChangePasswordSection from "./components/ChangePasswordSection";
import TwoFactorSection from "./components/TwoFactorSection";
import ActiveSessionsSection from "./components/ActiveSessionsSection";
import "../../index.css";
import Breadcrumb from "../../shared/Breadcrumb";

export default function SecurityPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <div className=" flex flex-col p-6 overflow-hidden">
      {/* Breadcrumb */}
      <div className="mb-4 shrink-0">
        <Breadcrumb pageTitleKey="settings.security" />
      </div>

      {/* Page title */}
      <div className="mb-4 shrink-0">
        <h1 className="text-xl font-bold text-gray-800">{t("settings.security")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t("settings.securitySubtitle")}</p>
      </div>

      {/* Content grid — fills remaining height, no overflow */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 ">
        <div className="flex flex-col  h-[96]vh">
          <ChangePasswordSection />
        </div>
        <div className="flex flex-col gap-4 ">
          <TwoFactorSection  />
          <ActiveSessionsSection />
        </div>
      </div>
    </div>
  );
}
