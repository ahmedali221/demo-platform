import { api } from "../lib/axios";
import i18n from "../lib/i18n";

type Theme = "light" | "dark" | "system";

interface ProfilePrefs {
  language: string;
}

const getProfilePrefs = () => api.get<ProfilePrefs>("/me/profile");
const getThemePrefs   = () => api.get<{ theme: Theme }>("/me/theme");

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", theme);
}

function applyLanguage(language: string) {
  const lang = language === "ar" || language === "en" ? language : "ar";
  localStorage.setItem("language", lang);
  i18n.changeLanguage(lang);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}

export async function applyUserPreferences(): Promise<void> {
  try {
    const [profileRes, themeRes] = await Promise.allSettled([
      getProfilePrefs(),
      getThemePrefs(),
    ]);

    if (profileRes.status === "fulfilled") {
      applyLanguage(profileRes.value.data.language);
    }

    if (themeRes.status === "fulfilled") {
      applyTheme(themeRes.value.data.theme);
    }
  } catch {
    // Non-critical — silently ignore, defaults remain in place
  }
}
