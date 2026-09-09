import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { User, Bell, Globe, Moon, Sun, Shield, LogOut, Check, Lock, CheckCircle2 } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';
import type { Language } from '../i18n/translations';

export function Settings() {
  usePageTitle('Settings');
  const navigate = useNavigate();
  const { user, logout, login, theme, setTheme, language, setLanguage, currency, setCurrency, t } = useAppContext();

  const [fullName, setFullName] = useState(user?.name || 'Shadab Ali');
  const [email] = useState(user?.email || 'shadab@aeronex.com');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      login({
        ...user,
        name: fullName,
      });
    }
    setCurrency('INR (₹)');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{t.settingsTitle}</h1>
            <p className="text-sm text-slate-400">{t.settingsSubtitle}</p>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium animate-in fade-in">
              <Check size={16} /> {t.savedSuccess}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Profile Information */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <User className="w-5 h-5 text-[#1788FF]" /> {t.profileInfo}
              </h2>
              
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 ring-4 ring-blue-500/20 shrink-0">
                  <img 
                    src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                    alt={user?.name || "User"} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">{user?.name || 'Shadab Ali'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1788FF]/15 border border-[#1788FF]/30 text-blue-400 text-xs font-semibold">
                      {user?.role || 'Passenger'} {t.accountType}
                    </span>
                    <span className="text-xs text-slate-400">ID: {user?.id || 'usr_default'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">{t.fullName}</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-[#1788FF] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">{t.emailAddress}</label>
                  <input 
                    type="email" 
                    value={email} 
                    readOnly 
                    className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-slate-400 px-4 py-3 cursor-not-allowed" 
                  />
                </div>
              </div>
            </div>

            {/* Display & Regional Preferences */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <Globe className="w-5 h-5 text-[#1788FF]" /> {t.regionalPreferences}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Preferred Currency (Kept on INR - ₹) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-400 text-sm font-medium">{t.preferredCurrency}</label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                      <Lock size={10} /> {t.currencyLockedBadge}
                    </span>
                  </div>
                  <div className="relative">
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      disabled
                      className="w-full bg-[#0A1838]/90 border border-cyan-500/40 rounded-xl text-white px-4 py-3 appearance-none focus:outline-none cursor-not-allowed opacity-90 shadow-sm"
                    >
                      <option value="INR (₹)">🇮🇳 INR (₹) — Indian Rupee</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                    {t.currencyLockedDesc}
                  </p>
                </div>

                {/* 2. Language Selector (Instant Whole Webpage Update) */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">{t.language}</label>
                  {/* Interactive Button Switcher */}
                  <div className="flex bg-[#0A1838] border border-slate-700 rounded-xl overflow-hidden p-1">
                    <button 
                      type="button"
                      onClick={() => handleLanguageChange('English')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        language === 'English' 
                          ? 'bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white shadow-md' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>🇮🇳</span> English
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleLanguageChange('Hindi')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        language === 'Hindi' 
                          ? 'bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white shadow-md' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>🇮🇳</span> हिन्दी
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                    {t.languageDesc}
                  </p>
                </div>

                {/* 3. Appearance Theme */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">{t.appearanceTheme}</label>
                  <div className="flex bg-[#0A1838] border border-slate-700 rounded-xl overflow-hidden p-1">
                    <button 
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                        theme === 'dark' 
                          ? 'bg-[#1788FF] text-white shadow-md' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Moon className="w-4 h-4" /> {t.dark}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                        theme === 'light' 
                          ? 'bg-white text-blue-600 shadow-md font-bold' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sun className="w-4 h-4" /> {t.light}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-8 py-3 font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer"
              >
                {t.savePreferences}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Notification Preferences */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <Bell className="w-5 h-5 text-[#1788FF]" /> {t.alertNotifications}
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-0.5 text-sm">{t.emailFlightAlerts}</h4>
                    <p className="text-xs text-slate-400">{t.emailAlertsDesc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1788FF]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div>
                    <h4 className="text-white font-medium mb-0.5 text-sm">{t.pushFareDrops}</h4>
                    <p className="text-xs text-slate-400">{t.pushDropsDesc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={pushAlerts}
                      onChange={(e) => setPushAlerts(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1788FF]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Account & Security */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1788FF]" /> {t.accountSession}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t.signedInAs} <span className="text-slate-200 font-semibold">{user?.email || email}</span>.
              </p>
              <button 
                type="button"
                onClick={handleSignOut}
                className="w-full bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all rounded-xl text-red-400 px-4 py-3 font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogOut size={16} />
                {t.signOutBtn}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
