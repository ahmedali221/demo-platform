import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
type Theme = "light" | "dark";

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export interface HeaderProps {
  logoSrc?: string;
  onMenuClick?: () => void;
}

export default function Header({ logoSrc, onMenuClick }: HeaderProps = {}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) ?? "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  const toggleLanguage = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
    localStorage.setItem("language", next);
  };

  const langLabel =
    i18n.language === "ar" ? t("header.langArabic") : t("header.langEnglish");

  return (
    <header
      className="w-full h-16 bg-white flex items-center justify-between px-5 md:px-10 shrink-0 z-40 shadow-[2px_4px_8px_0px_rgba(0,0,0,0.25)]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Mobile hamburger */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Logo */}
      {logoSrc && (
        <img src={logoSrc} alt="Logo" className="h-9 w-auto" />
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 h-8 px-3 bg-white rounded-lg shadow-[2px_4px_8px_0px_rgba(0,0,0,0.25)] border border-neutral-300 text-xs font-bold text-gray-900 hover:border-[#C9A44C] transition-colors"
        >
          <GlobeIcon />
          {langLabel}
        </button>

        {/* Light / Dark toggle */}
        <div className="flex items-center gap-1 h-8 p-1 bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-medium transition-all ${
              theme === "light"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <SunIcon />
            {t("header.light")}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-medium transition-all ${
              theme === "dark"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MoonIcon />
            {t("header.dark")}
          </button>
        </div>
      </div>
    </header>
  );
}
