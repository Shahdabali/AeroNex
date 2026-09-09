import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, LineChart, TrendingUp, Lightbulb, 
  Bell, Map, Plane, Calculator, Trophy, Ticket, Settings
} from 'lucide-react';
import { AeroNexLogo } from '../AeroNexLogo';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Search, label: 'Flight Search', path: '/search' },
  { icon: LineChart, label: 'Airfare Index', path: '/airfare-index' },
  { icon: TrendingUp, label: 'Price Trends', path: '/price-trends' },
  { icon: Lightbulb, label: 'Predictions', path: '/predictions' },
  { icon: Bell, label: 'Price Alerts', path: '/price-alerts', badge: 2 },
  { icon: Map, label: 'Routes', path: '/routes' },
  { icon: Plane, label: 'Airlines', path: '/airlines' },
  { icon: Calculator, label: 'CPI Analytics', path: '/cpi-analytics' },
  { icon: Trophy, label: 'Gamification', path: '/gamification' },
  { icon: Ticket, label: 'My Flights', path: '/my-flights' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

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
                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="text-[14px] font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {item.badge}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="w-full rounded-2xl bg-gradient-to-br from-[#132A60] to-[#0B1A42] p-5 border border-blue-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen group-hover:opacity-20 transition-opacity" />
          <div className="relative z-10 flex flex-col gap-2">
            <h4 className="text-white font-bold text-[15px] flex items-center gap-2">
              <span className="text-yellow-400 text-lg leading-none">👑</span> Earn Rewards
            </h4>
            <p className="text-slate-300 text-[12px] leading-snug">
              Check prices, set alerts, complete quests & earn points!
            </p>
            <Link 
              to="/gamification" 
              className="mt-2 w-full py-2 rounded-lg bg-gradient-to-r from-[#4E55F5] to-[#1788FF] text-white text-[13px] font-medium shadow-lg hover:shadow-[0_0_15px_rgba(23,136,255,0.4)] transition-all text-center block cursor-pointer"
            >
              View Rewards
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
