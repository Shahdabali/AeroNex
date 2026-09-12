import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, LineChart, TrendingUp, 
  Map, Plane, Calculator, Settings,
  BookOpen, ShieldAlert, CheckCircle2,
  Bookmark, FileText, Database, Layers,
  Compass, PieChart, Activity
} from 'lucide-react';
import { AeroNexLogo } from '../AeroNexLogo';

interface NavSection {
  title: string;
  items: {
    icon: any;
    label: string;
    path: string;
    badgeText?: string;
    badge?: number;
  }[];
}

export function Sidebar() {
  const location = useLocation();

  const navigationSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { icon: BarChart3, label: 'National Dashboard', path: '/dashboard' },
      ]
    },
    {
      title: 'AIRFARE INTELLIGENCE',
      items: [
        { icon: Activity, label: 'Live Fare Monitor', path: '/fare-monitor', badgeText: 'SYNC' },
        { icon: LineChart, label: 'Airfare Price Index', path: '/airfare-index' },
        { icon: TrendingUp, label: 'Price Trends', path: '/price-trends' },
        { icon: Map, label: 'Route Intelligence', path: '/routes' },
        { icon: Plane, label: 'Airline Market Monitor', path: '/airlines' },
        { icon: ShieldAlert, label: 'Anomaly Detection', path: '/anomalies', badge: 2 },
      ]
    },
    {
      title: 'CPI & ECONOMIC ANALYTICS',
      items: [
        { icon: Calculator, label: 'CPI Analytics', path: '/cpi-analytics' },
        { icon: PieChart, label: 'Regional Analysis', path: '/regional-analysis' },
      ]
    },
    {
      title: 'RESEARCH',
      items: [
        { icon: FileText, label: 'Research Reports', path: '/reports' },
        { icon: Compass, label: 'AI Analytical Insights', path: '/predictions' },
        { icon: Bookmark, label: 'Saved Analysis', path: '/saved-analysis' },
      ]
    },
    {
      title: 'DATA & GOVERNANCE',
      items: [
        { icon: Database, label: 'Data Sources & Provenance', path: '/data-sources' },
        { icon: Layers, label: 'Data Quality & Coverage', path: '/data-quality' },
        { icon: BookOpen, label: 'Methodology & Formulae', path: '/methodology' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { icon: Settings, label: 'Settings & Audit', path: '/settings' },
      ]
    }
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#0F1E36] dark:bg-[#080D1A] border-r border-slate-700/60 dark:border-slate-800/80 flex flex-col fixed left-0 top-0 overflow-y-auto z-40 transition-colors shadow-sm select-none">
      {/* Brand Header */}
      <div className="p-4 pb-3 border-b border-slate-700/50 dark:border-slate-800">
        <AeroNexLogo size={32} showTagline={false} />
        <div className="mt-2 text-[10px] font-extrabold text-amber-400 tracking-[0.15em] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Airfare Intelligence Platform
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-4 text-xs">
        {navigationSections.map((sec, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            <div className="px-3 py-1 text-[9.5px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/dashboard' && location.pathname === '/') ||
                (item.path === '/fare-monitor' && (location.pathname === '/search' || location.pathname === '/flights')) ||
                (item.path === '/saved-analysis' && (location.pathname === '/my-flights' || location.pathname === '/saved-flights'));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                      : 'text-slate-300 dark:text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon 
                      size={15} 
                      className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} 
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[9px] font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeText && (
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[9px] font-bold font-mono">
                      {item.badgeText}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* SYSTEM STATUS FOOTER */}
      <div className="p-3.5 mt-auto border-t border-slate-700/60 dark:border-slate-800 bg-[#0A1526] dark:bg-[#060A14]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Pipeline</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold font-mono">
              OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            <span className="truncate">Automated Scraping Active</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-1">
            <span>Base: 2024 = 100</span>
            <span className="text-amber-400 font-semibold">DEMO MODE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
