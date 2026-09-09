import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { User, Bell, Globe, Moon, Sun, Shield, LogOut, Check } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';

export function Settings() {
  usePageTitle('Settings');
  const navigate = useNavigate();
  const { user, logout, login, theme, setTheme } = useAppContext();

  const [fullName, setFullName] = useState(user?.name || 'Shadab Ali');
  const [email] = useState(user?.email || 'shadab@aeronex.com');
  const [currency, setCurrency] = useState('INR (₹)');
  const [language, setLanguageChoice] = useState('English');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      login({
        ...user,
        name: fullName,
      });
    }
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
            <h1 className="text-2xl font-bold text-white mb-1">Account & Preferences</h1>
            <p className="text-sm text-slate-400">Manage your profile, theme settings, and flight alert notifications</p>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium">
              <Check size={16} /> Changes saved successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Profile Information */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <User className="w-5 h-5 text-[#1788FF]" /> Profile Information
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
                      {user?.role || 'Passenger'} Account
                    </span>
                    <span className="text-xs text-slate-400">ID: {user?.id || 'usr_default'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-[#1788FF] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">Email Address</label>
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
                <Globe className="w-5 h-5 text-[#1788FF]" /> Display & Regional Preferences
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">Preferred Currency</label>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3 appearance-none focus:outline-none focus:border-[#1788FF]"
                  >
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguageChoice(e.target.value)}
                    className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3 appearance-none focus:outline-none focus:border-[#1788FF]"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-medium">Appearance Theme</label>
                  <div className="flex bg-[#0A1838] border border-slate-700 rounded-xl overflow-hidden p-1">
                    <button 
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                        theme === 'dark' 
                          ? 'bg-[#1788FF] text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                        theme === 'light' 
                          ? 'bg-white text-blue-600 shadow-md font-bold' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-4 h-4" /> Light
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
                Save Preferences
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Notification Preferences */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <Bell className="w-5 h-5 text-[#1788FF]" /> Alert Notifications
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-0.5 text-sm">Email Flight Alerts</h4>
                    <p className="text-xs text-slate-400">Daily price changes & index summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1788FF]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div>
                    <h4 className="text-white font-medium mb-0.5 text-sm">Push Fare Drops</h4>
                    <p className="text-xs text-slate-400">Real-time alerts when tracked fares fall</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={pushAlerts}
                      onChange={(e) => setPushAlerts(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1788FF]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Account & Security */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1788FF]" /> Account Session
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                You are currently signed in as <span className="text-slate-200 font-semibold">{user?.email || email}</span>.
              </p>
              <button 
                type="button"
                onClick={handleSignOut}
                className="w-full bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all rounded-xl text-red-400 px-4 py-3 font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogOut size={16} />
                Sign Out of AeroNex
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
