import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { translations, getSafeTranslations } from '../i18n/translations';
import type { Language } from '../i18n/translations';

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  t: typeof translations['English'] | typeof translations['Hindi'];
  user: User | null;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aeronex_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
      return null;
    }
    return null;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'English' || saved === 'Hindi') return saved;
    }
    return 'English';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      body.classList.remove('light');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const [currency, setCurrencyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currency');
      if (saved) return saved;
    }
    return 'INR (₹)';
  });

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'Hindi' ? 'hi' : 'en';
    }
  };

  const login = (userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('aeronex_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('aeronex_token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aeronex_user');
    localStorage.removeItem('aeronex_token');
  };

  const t = getSafeTranslations(language);

  return (
    <AppContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        toggleTheme, 
        language, 
        setLanguage, 
        currency,
        setCurrency,
        t, 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
