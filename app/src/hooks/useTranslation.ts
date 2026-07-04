import { useSettingsStore } from '../context/useSettingsStore';
import { TRANSLATIONS } from '../constants/translations';

export type TranslationKey = keyof typeof TRANSLATIONS['en'];

export const useTranslation = () => {
  const language = useSettingsStore((s) => s.language) || 'en';

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || String(key);
  };

  return { t, language };
};
