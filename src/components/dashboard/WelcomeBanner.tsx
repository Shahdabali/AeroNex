import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { useDataStatus } from '../../hooks/useDataStatus';
import { DataSourceBadge } from '../DataSourceBadge';
import { useAppContext } from '../../context/AppProvider';

export function WelcomeBanner() {
  const feed = useDataStatus();
  const last = feed.status?.lastCycleAt ? new Date(feed.status.lastCycleAt) : null;
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  return (
    <div className={`relative w-full rounded-xl overflow-hidden shadow-xl p-6 sm:p-7 hover-lift transition-all duration-500 border ${
      isLight 
        ? 'bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/50 border-blue-200/60 animate-fluid-gradient' 
        : 'bg-[#0A0C13] border-white/[0.08]'
    }`}>
      {/* Animated Light Orbs for Dark Mode / Soft Glows for Light Mode */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none transition-colors duration-1000 -translate-y-1/2 translate-x-1/3 animate-float ${
        isLight ? 'bg-gradient-to-bl from-cyan-200/40 to-blue-300/40 opacity-70' : 'bg-gradient-to-bl from-cyan-900/40 to-blue-900/20 opacity-30'
      }`} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none transition-colors duration-1000 translate-y-1/3 -translate-x-1/4 animate-float-delayed ${
        isLight ? 'bg-gradient-to-tr from-indigo-200/40 to-purple-200/30 opacity-70' : 'bg-gradient-to-tr from-indigo-900/30 to-purple-900/20 opacity-20'
      }`} />

      {/* Grid Pattern Overlay */}
      <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjEuNSIgY3k9IjEuNSIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-${isLight ? '0' : '100'} pointer-events-none`} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            <DataSourceBadge showAge />
          </div>

          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
            India Airfare <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-fluid-gradient">Intelligence</span>
          </h1>

          <p className={`text-sm max-w-xl ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Analytical view of India&apos;s domestic airfare market for CPI augmentation.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Data last refreshed</span>
          <span className={`text-[13px] font-mono tabular-nums ${isLight ? 'text-slate-700 font-semibold' : 'text-zinc-300'}`}>
            {last ? format(last, 'dd MMMM yyyy \u00B7 hh:mm:ss a') : 'Waiting for first update?'}
          </span>
          <div className={`mt-1 flex items-center gap-1.5 text-[10px] font-mono ${isLight ? 'text-blue-600 font-semibold' : 'text-cyan-400/90'}`} title={feed.detail}>
            <Activity size={12} className={feed.state === 'live' ? 'text-emerald-500' : (isLight ? 'text-slate-400' : 'text-zinc-500')} />
            <span>{feed.status ? feed.status.provider : feed.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
