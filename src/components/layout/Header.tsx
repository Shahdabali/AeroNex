import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Settings, LogOut, Bookmark, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSelector } from '../LanguageSelector';
import { useAppContext } from '../../context/AppProvider';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const timer = setInterval(updateTime, 15000);
    return () => clearInterval(timer);
  }, []);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'DEL → BOM Anomaly Flagged', message: 'Fare observed at ₹9,850 (+58% over rolling 30d median)', time: '2m ago' },
    { id: 2, title: 'National Airfare Index Computed', message: 'Index settled at 124.8 (+3.7%) against 2024 base', time: '14m ago' },
  ];

  const popularCorridors = [
    { code: 'DEL-BOM', label: 'Delhi ⇄ Mumbai', fare: '₹5,420' },
    { code: 'BOM-BLR', label: 'Mumbai ⇄ Bengaluru', fare: '₹4,280' },
    { code: 'DEL-BLR', label: 'Delhi ⇄ Bengaluru', fare: '₹6,850' },
    { code: 'CCU-DEL', label: 'Kolkata ⇄ Delhi', fare: '₹5,120' },
    { code: 'MAA-DEL', label: 'Chennai ⇄ Delhi', fare: '₹5,350' },
  ];

  const filteredCorridors = popularCorridors.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCorridor = (code: string) => {
    const [from, to] = code.split('-');
    setSearchTerm('');
    setShowSearchDropdown(false);
    navigate(`/fare-monitor?from=${from}&to=${to}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[70px] w-full px-6 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30 transition-colors">
      {/* Search Bar for Corridors / Routes */}
      <div className="flex-1 max-w-[420px] relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search route (e.g. DEL-BOM, Mumbai, BLR)..."
            className="w-full h-[38px] bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {showSearchDropdown && (
          <div className="absolute top-[44px] left-0 w-[380px] bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2.5 z-50 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Monitored Corridors
            </div>
            <div className="space-y-1 mt-1">
              {filteredCorridors.map((c) => (
                <div
                  key={c.code}
                  onClick={() => handleSelectCorridor(c.code)}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c.label}</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{c.fare}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Intelligence Controls */}
      <div className="flex items-center gap-4">
        {/* Pipeline Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#0E1726] text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">
            Data Pipeline: Operational
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400">
            {lastSyncTime}
          </span>
        </div>

        {/* DEMO MODE Badge */}
        <div className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] tracking-wider uppercase">
          DEMO MODE — Simulated
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-[45px] w-80 bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Surge & Intelligence Alerts
                </span>
                <button 
                  onClick={() => setUnreadCount(0)}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto text-xs">
                {notifications.map(n => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />
        <LanguageSelector />

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-[#0F2A4A] text-white flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || 'MoSPI Researcher'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                Statistical Analyst
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 top-[45px] w-52 bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Researcher Session'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || 'analyst@aeronex.gov.in'}</div>
              </div>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left"
              >
                <Settings size={14} /> System Settings
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/saved-analysis'); }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left"
              >
                <Bookmark size={14} /> Saved Analysis
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
              <button 
                onClick={async () => {
                  setShowProfileMenu(false);
                  await logout();
                  navigate('/login', { replace: true });
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 text-left"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
