import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, LineChart, TrendingUp, 
  Map, Settings, Activity, BookOpen
} from 'lucide-react';
import { AeroNexLogo } from '../AeroNexLogo';
import { motion } from 'framer-motion';
import { useDataStatus } from '../../hooks/useDataStatus';

export function Sidebar() {
  const location = useLocation();
  const feed = useDataStatus();
  const feedBadge = feed.state === 'live' ? 'LIVE' : undefined;

  const navItems = [
    { icon: Home, label: 'Overview', path: '/dashboard' },
    { icon: LineChart, label: 'Airfare Index', path: '/airfare-index', badgeText: feedBadge },
    { icon: Activity, label: 'Data Pipeline', path: '/data-scraping' },
    { icon: Map, label: 'Routes', path: '/routes' },
    { icon: Search, label: 'Flight Search', path: '/search' },
    { icon: TrendingUp, label: 'Price Trends', path: '/price-trends' },
    { icon: BookOpen, label: 'Methodology', path: '/methodology' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-[64px] lg:w-[260px] h-screen bg-[#090A0F] border-r border-white/[0.08] flex flex-col overflow-y-auto transition-all duration-300">
      <div className="p-3 lg:p-5 lg:pb-4 flex flex-col items-center lg:items-start justify-center lg:justify-between">
        <div className="flex flex-col items-center lg:items-start">
          <AeroNexLogo size={32} variant="icon" className="lg:hidden" />
          <AeroNexLogo size={32} showTagline={false} className="hidden lg:inline-flex" />
          <div className="hidden lg:block mt-1.5 text-[10px] font-bold text-cyan-500 tracking-[0.2em] uppercase ml-1">
            Airfare Intelligence
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 lg:px-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.label}
              to={item.path}
              title={item.label}
              className={`relative flex items-center justify-center lg:justify-between p-3 lg:px-3 lg:py-2 rounded-lg transition-all select-none group ${
                isActive 
                  ? 'text-white font-medium' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className="flex items-center gap-3 relative z-10">
                <item.icon size={18} className={isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-cyan-400 transition-colors'} />
                <span className="hidden lg:block text-[13px]">{item.label}</span>
              </div>
              
              {item.badgeText && (
                <div className="hidden lg:flex items-center relative z-10">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    item.badgeText === 'LIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {item.badgeText}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom Profile/Status Area */}
      <div className="p-4 border-t border-white/[0.05] hidden lg:block">
        <div className="flex items-center gap-3 bg-[#03091B]/80 p-2.5 rounded-xl border border-cyan-500/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">OP</span>
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">Operations</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 truncate">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
