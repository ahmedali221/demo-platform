/**
 * Registers this module's translations into the shared i18next singleton.
 * Called at module load time (not inside a React effect) so translations are
 * available on the very first render — whether running standalone or via MF.
 *
 * i18next's addResourceBundle with deep=true, overwrite=false means:
 *  - Keys already set by the host are NOT overridden.
 *  - Only keys missing from the host are added.
 */
import i18n from 'i18next';
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

if (!i18n.exists('dataImport.pageTitle')) {
  i18n.addResourceBundle('ar', 'translation', arTranslations, true, false);
  i18n.addResourceBundle('en', 'translation', enTranslations, true, false);
}
