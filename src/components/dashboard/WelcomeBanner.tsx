import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { useDataStatus } from '../../hooks/useDataStatus';
import { DataSourceBadge } from '../DataSourceBadge';

export function WelcomeBanner() {
  const feed = useDataStatus();
  const last = feed.status?.lastCycleAt ? new Date(feed.status.lastCycleAt) : null;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[#0A0C13] border border-white/[0.08] shadow-lg p-6 sm:p-7 hover-lift">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-950/15 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            <DataSourceBadge showAge />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
            India Airfare <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence</span>
          </h1>

          <p className="text-sm text-zinc-400 max-w-xl">
            Analytical view of India&apos;s domestic airfare market for CPI augmentation.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Data last refreshed</span>
          <span className="text-[13px] font-mono text-zinc-300 tabular-nums">
            {last ? format(last, 'dd MMMM yyyy · hh:mm:ss a') : 'Waiting for first update…'}
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-cyan-400/90 font-mono" title={feed.detail}>
            <Activity size={12} className={feed.state === 'live' ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>{feed.status ? feed.status.provider : feed.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
