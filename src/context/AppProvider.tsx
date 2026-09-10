import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { translations, getSafeTranslations } from '../i18n/translations';
import type { Language } from '../i18n/translations';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';

export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  organization?: string;
  phone?: string;
  bio?: string;
}

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  t: typeof translations['English'] | typeof translations['Hindi'];
  user: User | null;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  authLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
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

  const [authLoading, setAuthLoading] = useState(true);

  // Sync Supabase authentication session on mount and subscribe to real-time auth events
  useEffect(() => {
    let isMounted = true;

    // 1. Verify active session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        const supaUser = session.user;
        const meta = supaUser.user_metadata || {};
        const mappedUser: User = {
          id: supaUser.id,
          name: meta.full_name || meta.name || supaUser.email?.split('@')[0] || 'AeroNex Member',
          email: supaUser.email || '',
          role: meta.role || 'Passenger',
          avatarUrl: meta.avatar_url || meta.picture,
        };
        setUser(mappedUser);
        localStorage.setItem('aeronex_user', JSON.stringify(mappedUser));
        localStorage.setItem('aeronex_token', session.access_token);
      }
      setAuthLoading(false);
    }).catch(() => {
      if (isMounted) setAuthLoading(false);
    });

    // 2. Real-time auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const supaUser = session.user;
          const meta = supaUser.user_metadata || {};
          const mappedUser: User = {
            id: supaUser.id,
            name: meta.full_name || meta.name || supaUser.email?.split('@')[0] || 'AeroNex Member',
            email: supaUser.email || '',
            role: meta.role || 'Passenger',
            avatarUrl: meta.avatar_url || meta.picture,
          };
          setUser(mappedUser);
          localStorage.setItem('aeronex_user', JSON.stringify(mappedUser));
          localStorage.setItem('aeronex_token', session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('aeronex_user');
        localStorage.removeItem('aeronex_token');
      }
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'English' || saved === 'Hindi') return saved;
    }
    return 'English';
  });

  // Apply Theme reactively (supports 'light', 'dark', 'system')
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    const applyTheme = () => {
      let effectiveTheme: 'light' | 'dark' = 'dark';
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = prefersDark ? 'dark' : 'light';
      } else {
        effectiveTheme = theme;
      }

      if (effectiveTheme === 'light') {
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
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const [accentColor, setAccentColorState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aeronex_accent_color');
      if (saved) return saved;
    }
    return '#1788FF';
  });

  // Apply Accent Color reactively
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-brand-blue', accentColor);
      document.documentElement.style.setProperty('--accent-color', accentColor);
    }
    localStorage.setItem('aeronex_accent_color', accentColor);
  }, [accentColor]);

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };

  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aeronex_font_size') as any;
      if (saved === 'small' || saved === 'medium' || saved === 'large') return saved;
    }
    return 'medium';
  });

  // Apply Font Size scaling reactively to root document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-size', fontSize);
      if (fontSize === 'small') {
        document.documentElement.style.fontSize = '14.5px';
      } else if (fontSize === 'large') {
        document.documentElement.style.fontSize = '17.5px';
      } else {
        document.documentElement.style.fontSize = '16px';
      }
    }
    localStorage.setItem('aeronex_font_size', fontSize);
  }, [fontSize]);

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size);
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
    authService.logout().catch(() => {});
    setUser(null);
    localStorage.removeItem('aeronex_user');
    localStorage.removeItem('aeronex_token');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('aeronex_user', JSON.stringify(updated));
      return updated;
    });
  };

  const t = getSafeTranslations(language);

  return (
    <AppContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        toggleTheme, 
        accentColor,
        setAccentColor,
        fontSize,
        setFontSize,
        language, 
        setLanguage, 
        currency,
        setCurrency,
        t, 
        user, 
        login, 
        logout, 
        updateUser,
        isAuthenticated: !!user,
        authLoading
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
