import React from "react";
import { useTranslation } from "react-i18next";

interface ForbiddenPageProps {
  onGoBack?: () => void;
  dir?: "rtl" | "ltr";
}

const LockIcon = () => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onGoBack, dir }) => {
  const { t, i18n } = useTranslation();
  const resolvedDir = dir ?? (i18n.language === "ar" ? "rtl" : "ltr");

  return (
    <div
      className="flex flex-1 items-center justify-center min-h-[60vh] p-6"
      dir={resolvedDir}
    >
      <div className="flex flex-col items-center gap-5 bg-white border border-gray-200 rounded-2xl shadow-sm px-10 py-12 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-400">
          <LockIcon />
        </div>

        {/* 403 badge */}
        <span className="text-5xl font-black text-gray-200 leading-none select-none">
          403
        </span>

        {/* Title */}
        <h2 className="text-lg font-bold text-[#191C1E]">
          {t("forbidden.title")}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed">
          {t("forbidden.desc")}
        </p>

        {/* Go Back button */}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="mt-2 px-6 py-2.5 bg-[#2E75B6] text-white text-sm font-semibold rounded-xl hover:bg-[#245E91] transition-colors shadow-sm"
          >
            {t("forbidden.goBack")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ForbiddenPage;
