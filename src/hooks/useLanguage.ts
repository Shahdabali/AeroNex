import { useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import type { Language } from '../i18n/translations';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'English' || saved === 'Hindi') {
        return saved;
      }
    }
    return 'English';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = translations[language];

  return { language, setLanguage, t };
}
