import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings2, Moon, Cloud, Check } from "lucide-react";
import Breadcrumb from "../../shared/Breadcrumb";
import "../../lib/i18n";
import "../../index.css";
import { type Theme, getTheme, updateTheme } from "./appearances.service";


interface ThemeCardProps {
  id: Theme;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function SystemIcon() {
  return (
    <Settings2 size={52} strokeWidth={1.4} className="text-[#2E75B6]" />
  );
}

function DarkIcon() {
  return (
    <Moon size={52} strokeWidth={1.4} className="text-yellow-400" fill="#facc15" />
  );
}

function LightIcon() {
  return (
    <Cloud size={52} strokeWidth={1.4} className="text-sky-300" fill="#bae6fd" />
  );
}

const ICONS: Record<Theme, React.ReactNode> = {
  system: <SystemIcon />,
  dark:   <DarkIcon />,
  light:  <LightIcon />,
};

function ThemeCard({ id, label, selected, onSelect }: ThemeCardProps) {
  const isDark = id === "dark";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 px-10 py-6 transition-all duration-200 cursor-pointer focus:outline-none",
        isDark
          ? "bg-[#1e1e1e] border-[#1e1e1e]"
          : "bg-white border-gray-100 hover:border-[#2E75B6]/30",
        selected && !isDark ? "border-[#2E75B6] shadow-md" : "",
        selected && isDark  ? "border-[#2E75B6]" : "",
      ].join(" ")}
    >
      {/* Checkmark */}
      {selected && (
        <span className="absolute top-2.5 end-2.5 w-6 h-6 rounded-full bg-[#2E75B6] flex items-center justify-center shadow-sm">
          <Check size={13} strokeWidth={3} className="text-white" />
        </span>
      )}

      {/* Icon */}
      <div className="flex items-center justify-center h-16">
        {ICONS[id]}
      </div>

      {/* Label */}
      <span
        className={[
          "text-sm font-bold font-['Cairo']",
          isDark ? "text-white" : "text-zinc-800",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

export default function AppearancesPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [theme, setTheme] = useState<Theme>("system");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTheme()
      .then(({ data }) => setTheme(data.theme))
      .catch(() => {/* keep default */})
      .finally(() => setLoading(false));
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = t === "dark" || (t === "system" && prefersDark);
    root.classList.toggle("dark", isDark);
    root.setAttribute("data-theme", t);
  };

  const handleSelect = (selected: Theme) => {
    setTheme(selected);
    applyTheme(selected);
    updateTheme(selected).catch(() => {/* silently ignore */});
  };

  return (
    <div className="p-6 mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Breadcrumb ── */}
      <div className="mb-6">
        <Breadcrumb pageTitleKey="appearances.pageTitle" />
      </div>

      {/* ── Page title ── */}
      <div className=" mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          {t("appearances.heading")}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {t("appearances.subheading")}
        </p>
      </div>

      {/* ── Theme selector card ── */}
      <div className="p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col  gap-6">
          <span className="text-zinc-900 text-xl font-bold font-['Cairo']">
            {t("appearances.themeTitle")}
          </span>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-4 h-4 border-2 border-gray-200 border-t-[#2E75B6] rounded-full animate-spin" />
              {t("activity.loading")}
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <ThemeCard
                id="light"
                label={t("appearances.light")}
                selected={theme === "light"}
                onSelect={() => handleSelect("light")}
              />
              <ThemeCard
                id="dark"
                label={t("appearances.dark")}
                selected={theme === "dark"}
                onSelect={() => handleSelect("dark")}
              />
              <ThemeCard
                id="system"
                label={t("appearances.system")}
                selected={theme === "system"}
                onSelect={() => handleSelect("system")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
