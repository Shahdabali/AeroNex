import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, LineChart, TrendingUp, Lightbulb, 
  Bell, Map, Plane, Calculator, Ticket, Settings, Activity, Sparkles
} from 'lucide-react';
import { AeroNexLogo } from '../AeroNexLogo';
import { useAppContext } from '../../context/AppProvider';

export function Sidebar() {
  const location = useLocation();
  const { t } = useAppContext();

  const navItems = [
    { icon: Home, label: t.navDashboard, path: '/dashboard' },
    { icon: Sparkles, label: t.navTripSuggester, path: '/ai-trip-suggester', badgeText: 'India' },
    { icon: Search, label: t.navFlightSearch, path: '/search' },
    { icon: LineChart, label: t.navAirfareIndex, path: '/airfare-index' },
    { icon: TrendingUp, label: t.navPriceTrends, path: '/price-trends' },
    { icon: Lightbulb, label: t.navPredictions, path: '/predictions' },
    { icon: Bell, label: t.navPriceAlerts, path: '/price-alerts', badge: 2 },
    { icon: Map, label: t.navRoutes, path: '/routes' },
    { icon: Plane, label: t.navAirlines, path: '/airlines' },
    { icon: Calculator, label: t.navCPIAnalytics, path: '/cpi-analytics' },
    { icon: Ticket, label: t.navMyFlights, path: '/my-flights' },
    { icon: Settings, label: t.navSettings, path: '/settings' },
  ];

  return (
    <aside className="w-[280px] h-screen bg-[#040D24] border-r border-slate-800 flex flex-col fixed left-0 top-0 overflow-y-auto z-40">
      <div className="p-5 pb-3">
        <AeroNexLogo size={44} showTagline={true} />
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1 pb-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-[#1788FF] text-white shadow-[0_0_15px_rgba(23,136,255,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={isActive ? 'text-white' : item.label.includes('AI') ? 'text-cyan-400' : 'text-slate-400'} />
                <span className="text-[14px] font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {item.badge}
                </div>
              )}
              {item.badgeText && (
                <div className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold font-mono">
                  {item.badgeText}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="w-full rounded-2xl bg-gradient-to-br from-[#061B42] to-[#030E26] p-4 border border-blue-500/25 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {t.sidebarLiveStream}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">5s</span>
          </div>
          <h4 className="text-white font-bold text-[13px] flex items-center gap-1.5">
            <Activity size={14} className="text-[#1788FF]" /> {t.sidebarRealtimeFeed}
          </h4>
          <p className="text-slate-400 text-[11px] mt-1 leading-snug">
            {t.sidebarFeedDesc}
          </p>
        </div>
      </div>
    </aside>
  );
}
