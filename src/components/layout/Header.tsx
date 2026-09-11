import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, Settings, LogOut, Bookmark, Check, TrendingUp, Plane, BarChart3, Calculator, Sparkles, MapPin, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSelector } from '../LanguageSelector';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../../context/AppProvider';
import { INDIAN_AIRPORTS } from '../../data/indianAviation';

export function Header() {
  const navigate = useNavigate();
  const { user, logout, t } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Recommended Quick Routes
  const trendingRoutes = [
    { label: 'Delhi to Mumbai (DEL → BOM)', from: 'DEL', to: 'BOM', fare: '₹5,420', trend: '+4.8%' },
    { label: 'Mumbai to Bengaluru (BOM → BLR)', from: 'BOM', to: 'BLR', fare: '₹4,280', trend: '-3.2%' },
    { label: 'Delhi to Bengaluru (DEL → BLR)', from: 'DEL', to: 'BLR', fare: '₹6,850', trend: '+1.5%' },
    { label: 'Delhi to Goa (DEL → GOI)', from: 'DEL', to: 'GOI', fare: '₹5,800', trend: '+2.1%' },
    { label: 'Kolkata to Delhi (CCU → DEL)', from: 'CCU', to: 'DEL', fare: '₹5,120', trend: '+2.4%' },
  ];

  // Quick Feature Links
  const quickLinks = [
    { label: 'Airfare Index', path: '/airfare-index', icon: BarChart3, desc: 'Live benchmark & regional map' },
    { label: 'Flight Search', path: '/search', icon: Search, desc: 'Real-time fare lookup & comparison' },
    { label: 'Price Trends', path: '/price-trends', icon: TrendingUp, desc: 'Corridor analytics & historical swings' },
    { label: 'CPI Analytics', path: '/cpi-analytics', icon: Calculator, desc: 'Aviation vs CPI inflation benchmarks' },
  ];

  // Filtered results when user types
  const query = searchTerm.trim().toLowerCase();

  const filteredRoutes = trendingRoutes.filter(r => 
    r.label.toLowerCase().includes(query) || r.from.toLowerCase().includes(query) || r.to.toLowerCase().includes(query)
  );

  const filteredAirports = INDIAN_AIRPORTS.filter(a => 
    a.city.toLowerCase().includes(query) || a.code.toLowerCase().includes(query) || a.name.toLowerCase().includes(query)
  ).slice(0, 5);

  const filteredAirlines = [
    { name: 'IndiGo (6E)', path: '/airlines', desc: '104 Monitored Routes' },
    { name: 'Air India (AI)', path: '/airlines', desc: '85 Monitored Routes' },
    { name: 'Vistara (UK)', path: '/airlines', desc: '42 Monitored Routes' },
    { name: 'Akasa Air (QP)', path: '/airlines', desc: '24 Monitored Routes' },
  ].filter(a => a.name.toLowerCase().includes(query));

  const handleRouteSelect = (from: string, to: string) => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    navigate(`/search?from=${from}&to=${to}`);
  };

  const handleAirportSelect = (code: string) => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    navigate(`/search?from=${code}&to=BOM`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setShowSearchDropdown(false);
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  // Close dropdowns on outside click
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
    <header className="h-[80px] w-full px-8 flex items-center justify-between sticky top-0 bg-[#090A0F]/85 backdrop-blur-xl border-b border-white/[0.08] z-30 transition-colors">
      {/* Search Bar */}
      <div className="flex-1 max-w-[460px] relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            onClick={() => setShowSearchDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={t.searchPlaceholder}
            className="w-full h-[42px] bg-[#12141C] border border-white/[0.08] rounded-full pl-11 pr-10 text-[14px] text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-400/50 focus:bg-[#161824] transition-all shadow-inner"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 p-1 text-zinc-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Recommendations Popover */}
        {showSearchDropdown && (
          <div className="absolute top-[50px] left-0 w-[500px] max-w-[90vw] bg-[#0E1017]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[480px] overflow-y-auto divide-y divide-white/[0.06]">
            
            {/* Blank State Recommendations */}
            {!searchTerm.trim() ? (
              <div className="p-3 space-y-4">
                {/* Section 1: Trending Routes */}
                <div>
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1788FF] flex items-center gap-1.5">
                      <TrendingUp size={12} /> Trending Domestic Routes
                    </span>
                    <span className="text-[10px] text-slate-400">Live 5s Feed</span>
                  </div>
                  <div className="space-y-1">
                    {trendingRoutes.map((r, i) => (
                      <div
                        key={i}
                        onClick={() => handleRouteSelect(r.from, r.to)}
                        className="px-3 py-2 rounded-xl hover:bg-blue-500/15 cursor-pointer transition-all flex items-center justify-between group border border-transparent hover:border-blue-500/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#1788FF] group-hover:scale-110 transition-transform">
                            <Plane size={14} />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#1788FF] dark:group-hover:text-white block">
                              {r.label}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {r.from} ➔ {r.to}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">{r.fare}</span>
                          <span className={`text-[10px] font-medium ${r.trend.startsWith('+') ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {r.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Quick Features Navigation */}
                <div>
                  <div className="px-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400" /> Platform Direct Access
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLinks.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate(item.path);
                          }}
                          className="p-2.5 rounded-xl bg-[#0B1A3D]/70 border border-slate-700/60 hover:border-blue-500/40 hover:bg-blue-500/10 cursor-pointer transition-all flex items-start gap-2.5 group"
                        >
                          <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400 group-hover:bg-[#1788FF] group-hover:text-white transition-colors mt-0.5">
                            <Icon size={14} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#1788FF] dark:group-hover:text-white block truncate">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Major Hub Airports */}
                <div>
                  <div className="px-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin size={12} /> Popular Indian Hubs
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {INDIAN_AIRPORTS.filter(a => a.popular).slice(0, 7).map((airport) => (
                      <button
                        key={airport.code}
                        onClick={() => handleAirportSelect(airport.code)}
                        className="px-2.5 py-1 rounded-lg bg-[#0C1E47] hover:bg-blue-500/15 border border-slate-700/70 hover:border-[#1788FF]/50 text-xs text-slate-800 dark:text-slate-200 hover:text-[#1788FF] dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{airport.code}</span>
                        <span>{airport.city}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Filtered Search Results */
              <div className="p-3 space-y-3">
                {/* Route matches */}
                {filteredRoutes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1788FF] px-2 block mb-1">
                      Routes
                    </span>
                    {filteredRoutes.map((r, i) => (
                      <div
                        key={i}
                        onClick={() => handleRouteSelect(r.from, r.to)}
                        className="px-3 py-2 rounded-xl hover:bg-blue-500/15 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Plane size={14} className="text-blue-400" />
                          <span className="text-xs text-white">{r.label}</span>
                        </div>
                        <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                          Search Flights <ArrowRight size={12} />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Airport matches */}
                {filteredAirports.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 block mb-1">
                      Airports
                    </span>
                    {filteredAirports.map((a, i) => (
                      <div
                        key={i}
                        onClick={() => handleAirportSelect(a.code)}
                        className="px-3 py-2 rounded-xl hover:bg-blue-500/15 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400 px-1.5 py-0.5 bg-cyan-500/10 rounded">
                            {a.code}
                          </span>
                          <div>
                            <span className="text-xs text-white font-medium block">{a.city} — {a.name}</span>
                            <span className="text-[10px] text-slate-400">{a.region} India • {a.tag}</span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">Select →</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Airline matches */}
                {filteredAirlines.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 block mb-1">
                      Airlines
                    </span>
                    {filteredAirlines.map((al, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(al.path);
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-blue-500/15 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs text-white font-medium block">{al.name}</span>
                          <span className="text-[10px] text-slate-400">{al.desc}</span>
                        </div>
                        <span className="text-xs text-purple-400">View Fleet →</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredRoutes.length === 0 && filteredAirports.length === 0 && filteredAirlines.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs text-slate-400">No exact match for "{searchTerm}".</p>
                    <button
                      onClick={() => {
                        navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
                        setShowSearchDropdown(false);
                      }}
                      className="mt-2 text-xs text-[#1788FF] hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Search size={12} /> Search all flights for "{searchTerm}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        
        {/* Data Status Indicator */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#12141C] shadow-sm select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live Data</span>
          </div>
          <div className="w-px h-3 bg-white/[0.1]" />
          <span className="text-[10px] font-mono text-zinc-400 tracking-wider">DEMO DATA STREAM</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <Bell size={20} className="text-slate-500 dark:text-slate-300 hover:text-[#1788FF] dark:hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-[#020A1D] flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
                {unreadCount}
              </div>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 top-[50px] w-80 bg-[#0A1838] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-900 dark:text-white font-bold text-sm">{t.notifications}</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => setUnreadCount(0)} 
                    className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={12} /> {t.markRead}
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2 mt-3 max-h-60 overflow-y-auto">
                {notifications.map((notif: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#040D24]/80 border border-slate-800/60 hover:border-blue-500/30 transition-all">
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">{notif.message || notif.title}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
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
            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-[#1788FF] to-[#00A3FF] flex items-center justify-center ring-2 ring-blue-500/30 text-white text-xs font-bold shrink-0">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name || "User"} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <span>{user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : (user?.isGuest ? 'G' : 'AN')}</span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">{user?.name || (user?.isGuest ? 'Guest' : 'AeroNex Member')}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[140px]">{user?.isGuest ? 'Guest Passenger' : (user?.role || 'Passenger')}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 ml-1 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 top-[55px] w-60 bg-[#0A1838] border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 flex flex-col gap-1">
              {/* Active User Card */}
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'AeroNex Member'}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || 'Active Session'}</div>
                {user?.isGuest && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-semibold">
                    Guest Account
                  </span>
                )}
              </div>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-[#1788FF] dark:hover:text-white hover:bg-blue-500/15 rounded-xl transition-all text-left cursor-pointer"
              >
                <User size={16} className="text-[#1788FF]" />
                {t.profileAccount}
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/my-flights'); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-[#1788FF] dark:hover:text-white hover:bg-blue-500/15 rounded-xl transition-all text-left cursor-pointer"
              >
                <Bookmark size={16} className="text-purple-400" />
                {t.mySavedFlights}
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-[#1788FF] dark:hover:text-white hover:bg-blue-500/15 rounded-xl transition-all text-left cursor-pointer"
              >
                <Settings size={16} className="text-emerald-400" />
                {t.headerSettings}
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
              <button 
                onClick={async () => {
                  setShowProfileMenu(false);
                  await logout();
                  navigate('/login', { replace: true });
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
              >
                <LogOut size={16} />
                {t.signOut}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
