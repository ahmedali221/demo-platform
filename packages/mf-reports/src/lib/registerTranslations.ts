/**
 * Registers this module's translations into the shared i18next singleton.
 * Called at module load time so translations are available on the first render.
 */
import i18n from 'i18next';
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

i18n.addResourceBundle('ar', 'translation', arTranslations, true, true);
i18n.addResourceBundle('en', 'translation', enTranslations, true, true);
