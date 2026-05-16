import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

interface BreadcrumbProps {
  pageTitleKey: string;
}

export default function Breadcrumb({ pageTitleKey }: BreadcrumbProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 text-sm" dir={isRtl ? "rtl" : "ltr"}>
      <button
        onClick={() => navigate("/settings/profile")}
        className="flex items-center gap-1.5 text-gray-400 hover:text-[#2E75B6] transition-colors font-medium me-1"
      >
        <ArrowLeft
          size={15}
          style={{ transform: isRtl ? "scaleX(-1)" : "none" }}
        />
        {t("settings.back")}
      </button>

      <span className="text-gray-300">/</span>

      <button
        onClick={() => navigate("/settings/profile")}
        className="text-gray-400 hover:text-[#2E75B6] transition-colors"
      >
        {t("sidebar.settings")}
      </button>

      <span className="text-gray-300">/</span>

      <span className="font-semibold text-gray-800">{t(pageTitleKey)}</span>
    </div>
  );
}
