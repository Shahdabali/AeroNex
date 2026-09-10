import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, LineChart, TrendingUp, 
  Bell, Map, Plane, Calculator, Settings, Activity
} from 'lucide-react';
import { AeroNexLogo } from '../AeroNexLogo';
import { useAppContext } from '../../context/AppProvider';
import { motion } from 'framer-motion';

export function Sidebar() {
  const location = useLocation();
  const { t } = useAppContext();

  const navItems = [
    { icon: Home, label: t.navDashboard, path: '/dashboard' },
    { icon: LineChart, label: t.navAirfareIndex, path: '/airfare-index', badgeText: 'Live' },
    { icon: Search, label: t.navFlightSearch, path: '/search' },
    { icon: TrendingUp, label: t.navPriceTrends, path: '/price-trends' },
    { icon: Bell, label: t.navPriceAlerts, path: '/price-alerts', badge: 2 },
    { icon: Map, label: t.navRoutes, path: '/routes' },
    { icon: Plane, label: t.navAirlines, path: '/airlines' },
    { icon: Calculator, label: t.navCPIAnalytics, path: '/cpi-analytics' },
    { icon: Settings, label: t.navSettings, path: '/settings' },
  ];

  return (
    <aside className="w-[280px] h-screen bg-[#090A0F] border-r border-white/[0.08] flex flex-col fixed left-0 top-0 overflow-y-auto z-40 transition-colors">
      <div className="p-5 pb-3">
        <AeroNexLogo size={44} showTagline={true} />
      </div>

      <nav className="flex-1 px-3.5 flex flex-col gap-1 pb-6 mt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all select-none group ${
                isActive 
                  ? 'text-white font-semibold' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-[#161822] border border-white/[0.12] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <item.icon 
                  size={17} 
                  className={`transition-colors ${
                    isActive 
                      ? 'text-cyan-400' 
                      : 'text-zinc-500 group-hover:text-zinc-300'
                  }`} 
                />
                <span className="text-[13.5px] tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <div className="relative z-10 w-4 h-4 rounded-full bg-rose-500/90 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                  {item.badge}
                </div>
              )}
              {item.badgeText && (
                <div className="relative z-10 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[9.5px] font-bold font-mono tracking-wider">
                  {item.badgeText}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="w-full rounded-2xl bg-[#12141C] p-4 border border-white/[0.08] relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {t.sidebarLiveStream}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">5s TICK</span>
          </div>
          <h4 className="text-white font-bold text-[13px] flex items-center gap-1.5">
            <Activity size={14} className="text-cyan-400" /> {t.sidebarRealtimeFeed}
          </h4>
          <p className="text-zinc-400 text-[11px] mt-1 leading-snug">
            {t.sidebarFeedDesc}
          </p>
        </div>
      </div>
    </aside>
  );
}
