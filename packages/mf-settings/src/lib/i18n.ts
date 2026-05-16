import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLang from "./locales/en.json";
import arLang from "./locales/ar.json";

if (i18n.isInitialized) {
  // Running inside host — shared i18next instance already initialized.
  // Just merge our translations into the existing namespace.
  i18n.addResourceBundle("en", "translation", enLang, true, true);
  i18n.addResourceBundle("ar", "translation", arLang, true, true);
} else {
  // Standalone dev mode — initialize from scratch.
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: enLang },
      ar: { translation: arLang },
    },
    lng: "ar",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
