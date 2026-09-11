import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, LineChart, TrendingUp, 
  Map, Plane, Calculator, Settings, Activity,
  BookOpen, Database, ShieldAlert, FileText, CheckCircle2
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
    { icon: Database, label: 'Data Quality', path: '/gamification' },
    { icon: Calculator, label: 'CPI Analytics', path: '/cpi-analytics' },
    { icon: BookOpen, label: 'Methodology', path: '/methodology' },
    { icon: FileText, label: 'Reports', path: '/my-flights' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#090A0F] border-r border-white/[0.08] flex flex-col fixed left-0 top-0 overflow-y-auto z-40 transition-colors">
      <div className="p-5 pb-4">
        <AeroNexLogo size={36} showTagline={false} />
        <div className="mt-1.5 text-[10px] font-bold text-cyan-500 tracking-[0.2em] uppercase ml-1">
          Airfare Intelligence
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-0.5 pb-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center justify-between px-3 py-2 rounded-lg transition-all select-none group ${
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
              <div className="relative z-10 flex items-center gap-3">
                <item.icon 
                  size={15} 
                  className={`transition-colors ${
                    isActive 
                      ? 'text-cyan-400' 
                      : 'text-zinc-500 group-hover:text-zinc-400'
                  }`} 
                />
                <span className="text-[13px] tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <div className="relative z-10 w-4 h-4 rounded bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-[9px] font-bold text-rose-400 shadow-sm">
                  {item.badge}
                </div>
              )}
              {item.badgeText && (
                <div className="relative z-10 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[9px] font-bold font-mono tracking-wider">
                  {item.badgeText}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* SYSTEM STATUS */}
      <div className="p-4 mt-auto border-t border-white/[0.04] bg-[#0B0C13]">
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold text-zinc-500 tracking-wider">SYSTEM STATUS</div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>Data pipeline operational</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse ml-0.5" />
            <span>Last sync: 12 sec ago</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
