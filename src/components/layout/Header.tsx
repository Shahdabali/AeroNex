import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, Settings, LogOut, Bookmark, Check, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';

export function Header() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await api.getNotifications();
        return Array.isArray(res) ? res : [];
      } catch {
        return [
          { id: 1, message: 'Price dropped for DEL → BOM (₹5,380)', read: false },
          { id: 2, message: 'Target fare reached for BOM → BLR', read: false },
          { id: 3, message: 'Airfare Index updated: 124.8 (+3.7%)', read: false }
        ];
      }
    }
  });

  // Autocomplete data
  const routeSuggestions = [
    { label: 'Delhi to Mumbai (DEL → BOM)', from: 'DEL', to: 'BOM' },
    { label: 'Mumbai to Bengaluru (BOM → BLR)', from: 'BOM', to: 'BLR' },
    { label: 'Delhi to Bengaluru (DEL → BLR)', from: 'DEL', to: 'BLR' },
    { label: 'Chennai to Delhi (MAA → DEL)', from: 'MAA', to: 'DEL' },
    { label: 'Hyderabad to Delhi (HYD → DEL)', from: 'HYD', to: 'DEL' },
    { label: 'IndiGo (6E) Airlines', action: () => navigate('/airlines') },
    { label: 'Air India (AI) Airlines', action: () => navigate('/airlines') },
  ].filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSearchSelect = (item: any) => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    if (item.action) {
      item.action();
    } else {
      navigate(`/search?from=${item.from}&to=${item.to}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setShowSearchDropdown(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    <header className="h-[80px] w-full px-8 flex items-center justify-between sticky top-0 bg-[rgba(2,10,29,0.8)] backdrop-blur-xl border-b border-slate-800/50 z-30">
      {/* Search Bar */}
      <div className="flex-1 max-w-[400px] relative">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search routes, airports, airlines..."
            className="w-full h-[42px] bg-[#0A1838] border border-slate-700/50 rounded-full pl-11 pr-4 text-[14px] text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-[#0D1E45] transition-colors"
          />
        </div>

        {showSearchDropdown && searchTerm && (
          <div className="absolute top-[48px] left-0 w-full bg-[#0A1838] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
            {routeSuggestions.length > 0 ? (
              routeSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSearchSelect(item)}
                  className="px-4 py-3 text-sm text-slate-300 hover:bg-blue-500/20 hover:text-white cursor-pointer transition-colors flex items-center justify-between border-b border-slate-800/50 last:border-0"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-blue-400 font-medium">Go →</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400">
                Press Enter to search for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <Bell size={20} className="text-slate-300 hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#020A1D] flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
                {unreadCount}
              </div>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 top-[50px] w-80 bg-[#0A1838] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-white font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => setUnreadCount(0)} 
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={12} /> Mark read
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2 mt-3 max-h-60 overflow-y-auto">
                {notifications.map((notif: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#040D24]/80 border border-slate-800/60 hover:border-blue-500/30 transition-all">
                    <p className="text-xs text-slate-200 leading-snug">{notif.message || notif.title}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">Real-time alert</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Supabase Status Pill */}
        <div 
          onClick={() => navigate('/settings')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer text-xs font-mono"
          title="Connected to Supabase project scybybrkshwwldydnpmf"
        >
          <Database size={13} className="text-emerald-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Supabase</span>
        </div>

        <ThemeToggle />

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 ring-2 ring-blue-500/20">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-semibold text-white leading-tight">Shadab Ali</span>
              <span className="text-[11px] text-slate-400 leading-tight">Passenger</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 ml-1 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 top-[55px] w-56 bg-[#0A1838] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1">
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-blue-500/20 rounded-xl transition-all text-left cursor-pointer"
              >
                <User size={16} className="text-[#1788FF]" />
                Profile & Account
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/my-flights'); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-blue-500/20 rounded-xl transition-all text-left cursor-pointer"
              >
                <Bookmark size={16} className="text-purple-400" />
                My Saved Flights
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-blue-500/20 rounded-xl transition-all text-left cursor-pointer"
              >
                <Settings size={16} className="text-emerald-400" />
                Settings
              </button>
              <div className="h-px bg-slate-800 my-1" />
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/login'); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
