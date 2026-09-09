import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { User, Bell, Globe, Moon, Shield, Database, CheckCircle, RefreshCw, ExternalLink, Terminal } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { checkSupabaseConnection, SUPABASE_URL } from '../lib/supabase';

export function Settings() {
  usePageTitle('Settings');
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected?: boolean; message?: string } | null>(null);

  const handleTestSupabase = async () => {
    setTestingDb(true);
    try {
      const res = await checkSupabaseConnection();
      setDbStatus({
        connected: res.connected,
        message: res.error || 'Connection to Supabase project active and verified!',
      });
    } catch (e: any) {
      setDbStatus({ connected: false, message: e.message || 'Connection test failed' });
    } finally {
      setTestingDb(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Supabase Database Settings Card */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-emerald-500/30 rounded-[16px] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-0"></div>
              
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" /> Supabase Database & Realtime
                </h2>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Configured
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Supabase Project URL</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={SUPABASE_URL} 
                      className="w-full bg-[#0A1838] border border-slate-700/80 rounded-xl text-slate-300 font-mono text-xs px-3.5 py-2.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">API Key Status</label>
                    <div className="flex items-center h-[38px] px-3.5 bg-[#0A1838] border border-slate-700/80 rounded-xl text-slate-300 font-mono text-xs">
                      <CheckCircle size={14} className="text-emerald-400 mr-2" />
                      sb_publishable_...92 (Active)
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040D24]/80 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Terminal size={13} className="text-blue-400" /> Migration Script Available
                    </span>
                    <span className="text-[11px] text-blue-400 font-mono">server/supabase/migrations/000_complete_aeronex_schema.sql</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    To create all tables in your Supabase project (<code className="text-emerald-300">airports</code>, <code className="text-emerald-300">fare_prices</code>, <code className="text-emerald-300">airfare_indices</code>, <code className="text-emerald-300">ai_insights</code>), paste and run the SQL migration script in your Supabase SQL Editor.
                  </p>
                </div>

                {dbStatus && (
                  <div className={`p-3 rounded-xl border text-xs ${dbStatus.connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                    <div className="font-bold mb-0.5">{dbStatus.connected ? 'Status: Connected' : 'Status: Notice'}</div>
                    <div>{dbStatus.message}</div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <a 
                    href="https://supabase.com/dashboard/project/scybybrkshwwldydnpmf/editor" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                  >
                    Open Supabase SQL Editor <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={handleTestSupabase}
                    disabled={testingDb}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                  >
                    <RefreshCw size={13} className={testingDb ? 'animate-spin' : ''} />
                    {testingDb ? 'Testing Connection...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <User className="w-5 h-5 text-[#1788FF]" /> Profile Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Full Name</label>
                  <input type="text" defaultValue="Aviation Enthusiast" className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Email Address</label>
                  <input type="email" defaultValue="user@aeronex.com" readOnly className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-slate-500 px-4 py-3 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <Globe className="w-5 h-5 text-[#1788FF]" /> Preferences
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Currency</label>
                  <select className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3 appearance-none">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Language</label>
                  <select className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3 appearance-none">
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Theme</label>
                  <div className="flex bg-[#0A1838] border border-slate-700 rounded-xl overflow-hidden p-1">
                    <button className="flex-1 py-2 text-white bg-blue-500/20 rounded-lg flex items-center justify-center gap-2">
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                    <button className="flex-1 py-2 text-slate-400 hover:text-white transition-colors rounded-lg flex items-center justify-center gap-2">
                      <Sun className="w-4 h-4" /> Light
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-8 py-3 font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Save Changes
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <Bell className="w-5 h-5 text-[#1788FF]" /> Notifications
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">Email Alerts</h4>
                    <p className="text-sm text-slate-400">Receive daily summary emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1788FF]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div>
                    <h4 className="text-white font-medium mb-1">Push Notifications</h4>
                    <p className="text-sm text-slate-400">Real-time price drop alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1788FF]"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1788FF]" /> Security
              </h2>
              <button className="w-full bg-[#0A1838] border border-slate-700 hover:border-slate-500 transition-colors rounded-xl text-white px-4 py-3 font-medium mb-3">
                Change Password
              </button>
              <button className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors rounded-xl text-red-400 px-4 py-3 font-medium">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Simple mock component since we didn't import Sun from lucide-react
function Sun(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
