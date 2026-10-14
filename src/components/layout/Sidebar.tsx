import { Link, useLocation } from 'react-router-dom';
import {
  Home, Search, LineChart, TrendingUp,
  Map, Settings, Activity, BookOpen, Calculator,
} from 'lucide-react';
import { AeroNexLogo } from '../AeroNexLogo';
import { motion } from 'framer-motion';
import { useDataStatus } from '../../hooks/useDataStatus';
import { useAppContext } from '../../context/AppProvider';

type NavItem = { icon: any; label: string; path: string; badgeText?: string };

const FEED_DOT: Record<string, string> = {
  live: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse',
  simulated: 'bg-amber-400',
  delayed: 'bg-orange-400',
  offline: 'bg-rose-400',
  loading: 'bg-zinc-500',
};

export function Sidebar() {
  const location = useLocation();
  const feed = useDataStatus();
  const { user } = useAppContext();
  const feedBadge = feed.state === 'live' ? 'LIVE' : undefined;

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Analytics',
      items: [
        { icon: Home, label: 'Overview', path: '/dashboard' },
        { icon: LineChart, label: 'Airfare Index', path: '/airfare-index', badgeText: feedBadge },
        { icon: TrendingUp, label: 'Price Trends', path: '/price-trends' },
        { icon: Map, label: 'Routes', path: '/routes' },
        { icon: Calculator, label: 'CPI Analytics', path: '/cpi-analytics', badgeText: 'DGCA' },
      ],
    },
    {
      title: 'Tools',
      items: [{ icon: Search, label: 'Flight Search', path: '/search' }],
    },
    {
      title: 'System',
      items: [
        { icon: Activity, label: 'Data Pipeline', path: '/data-scraping' },
        { icon: BookOpen, label: 'Methodology', path: '/methodology' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ],
    },
  ];

  const name = user?.name || (user?.isGuest ? 'Guest' : 'AeroNex user');
  const initials = name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="relative w-[64px] lg:w-[260px] h-screen bg-gradient-to-b from-[#0B0D14] via-[#090A0F] to-[#07080C] border-r border-white/[0.08] flex flex-col overflow-hidden transition-all duration-300">
      {/* soft brand glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative p-3 lg:px-5 lg:pt-6 lg:pb-5 flex flex-col items-center lg:items-start border-b border-white/[0.05]">
        <AeroNexLogo size={32} variant="icon" className="lg:hidden" />
        <AeroNexLogo size={32} showTagline={false} className="hidden lg:inline-flex" />
        <div className="hidden lg:block mt-2 text-[10px] font-bold text-cyan-500/90 tracking-[0.22em] uppercase ml-1">
          Airfare Intelligence
        </div>
      </div>

      <nav className="relative flex-1 px-2 lg:px-3 py-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
        {sections.map(section => (
          <div key={section.title} className="flex flex-col gap-1">
            <div className="hidden lg:block px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              {section.title}
            </div>
            <div className="lg:hidden mx-auto mb-1 w-6 h-px bg-white/[0.06]" />
            {section.items.map(item => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  title={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center justify-center lg:justify-between p-3 lg:px-3 lg:py-2.5 rounded-xl transition-all select-none group ${
                    isActive ? 'text-white font-medium' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border border-cyan-500/25 shadow-[0_0_20px_-6px_rgba(34,211,238,0.45)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-to-b from-cyan-300 to-blue-500" />
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3 relative z-10">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                        isActive ? 'bg-cyan-500/15 text-cyan-300' : 'bg-white/[0.03] text-zinc-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10'
                      }`}
                    >
                      <item.icon size={16} />
                    </span>
                    <span className="hidden lg:block text-[13px]">{item.label}</span>
                  </div>

                  {item.badgeText && (
                    <span
                      className={`hidden lg:inline-flex relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        item.badgeText === 'LIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25'
                      }`}
                    >
                      {item.badgeText}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Signed-in user + real data-feed status (from useDataStatus, never hard-coded) */}
      <div className="relative p-3 border-t border-white/[0.06]">
        <Link
          to="/settings"
          title={`${name} — ${feed.detail}`}
          className="flex items-center justify-center lg:justify-start gap-3 lg:bg-white/[0.03] lg:hover:bg-white/[0.06] lg:p-2.5 rounded-xl lg:border lg:border-white/[0.06] transition-colors"
        >
          <div className="relative shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/30" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center ring-2 ring-cyan-500/20">
                <span className="text-xs font-bold text-white">{initials || 'AN'}</span>
              </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#090A0F] ${FEED_DOT[feed.state] ?? FEED_DOT.loading}`} />
          </div>
          <div className="hidden lg:block overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{name}</p>
            <p className="text-[10px] text-zinc-500 truncate">Data feed: {feed.label}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
