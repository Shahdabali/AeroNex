import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, LineChart, TrendingUp, 
  Map, Plane, Calculator, Settings, Activity,
  BookOpen, Database, ShieldAlert, FileText, Brain
} from 'lucide-react';
import { AeroNexLogo } from '../AeroNexLogo';
import { motion } from 'framer-motion';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Overview', path: '/dashboard' },
    { icon: LineChart, label: 'Airfare Index', path: '/airfare-index', badgeText: 'LIVE' },
    { icon: Activity, label: 'Live Intelligence', path: '/data-scraping', badgeText: 'SYNC' },
    { icon: Map, label: 'Routes', path: '/routes' },
    { icon: Plane, label: 'Airlines', path: '/airlines' },
    { icon: Search, label: 'Regions', path: '/search' },
    { icon: TrendingUp, label: 'Price Trends', path: '/price-trends' },
    { icon: ShieldAlert, label: 'Anomalies', path: '/price-alerts', badge: 3 },
    { icon: Database, label: 'Data Quality', path: '/data-scraping' },
    { icon: Calculator, label: 'CPI Analytics', path: '/cpi-analytics' },
    { icon: Brain, label: 'AI Analytics', path: '/ai-analytics', badgeText: 'NEW' },
    { icon: BookOpen, label: 'Methodology', path: '/methodology' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-[64px] lg:w-[260px] h-screen bg-[#090A0F] border-r border-white/[0.08] flex flex-col overflow-y-auto transition-all duration-300">
      <div className="p-3 lg:p-5 lg:pb-4 flex flex-col items-center lg:items-start justify-center lg:justify-between">
        <div className="flex flex-col items-center lg:items-start">
          <AeroNexLogo size={32} showTagline={false} />
          <div className="hidden lg:block mt-1.5 text-[10px] font-bold text-cyan-500 tracking-[0.2em] uppercase ml-1">
            Airfare Intelligence
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 lg:px-3 flex flex-col gap-1 lg:gap-0.5 pb-6">
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
                  className="absolute inset-0 bg-[#161822] border border-white/[0.08] rounded-lg"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <div className="relative z-10 flex items-center lg:gap-3">
                <item.icon 
                  size={18} 
                  className={`transition-colors lg:w-[15px] lg:h-[15px] ${
                    isActive 
                      ? 'text-cyan-400' 
                      : 'text-zinc-500 group-hover:text-zinc-400'
                  }`} 
                />
                <span className="hidden lg:block text-[13px] tracking-tight">{item.label}</span>
              </div>
              
              {/* Badges - Hidden on mobile */}
              {item.badge && (
                <div className="hidden lg:flex relative z-10 w-4 h-4 rounded bg-rose-500/20 border border-rose-500/30 items-center justify-center text-[9px] font-bold text-rose-400 shadow-sm">
                  {item.badge}
                </div>
              )}
              {item.badgeText && (
                <div className="hidden lg:block relative z-10 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[9px] font-bold font-mono tracking-wider">
                  {item.badgeText}
                </div>
              )}

              {/* Mobile notification dot if item has badge */}
              {(item.badge || item.badgeText) && (
                <div className="lg:hidden absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
