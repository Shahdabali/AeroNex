import { Database, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataStatus, formatInterval } from '../../hooks/useDataStatus';
import { LoadingBlock } from '../StateViews';

export function DataIngestionMonitor() {
  const feed = useDataStatus();
  const navigate = useNavigate();
  const s = feed.status;
  const healthy = feed.state === 'live';

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
          <Database size={14} className="text-cyan-400" />
          Data Pipeline
        </h3>
        {feed.state === 'loading' ? null : healthy ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={10} /> Running
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
            <AlertTriangle size={10} /> {feed.state === 'offline' ? 'Unreachable' : 'Delayed'}
          </span>
        )}
      </div>

      {feed.state === 'loading' ? (
        <LoadingBlock label="Checking feed…" />
      ) : (
        <div className="space-y-2 flex-1 text-[11px]">
          <Row label="Source" value={s ? s.provider : 'Unavailable'} />
          <Row label="Mode" value={s ? (s.mode === 'live' ? 'Live market data' : 'Simulated (not real fares)') : '—'} />
          <Row
            label="Last successful refresh"
            value={s?.ageSec != null ? (s.ageSec < 90 ? `${s.ageSec}s ago` : `${Math.round(s.ageSec / 60)} min ago`) : '—'}
            icon={<Activity size={10} className="text-cyan-500" />}
          />
          <Row label="Refresh interval" value={s ? formatInterval(s.refreshIntervalSec) : '—'} />
          {s?.lastError && <p className="text-amber-400 pt-1">Last error: {s.lastError}</p>}
          {feed.state === 'offline' && <p className="text-rose-400 pt-1">{feed.detail}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate('/data-scraping')}
        className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-bold uppercase tracking-widest text-cyan-500 hover:text-cyan-300 text-left cursor-pointer"
      >
        Inspect pipeline →
      </button>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-zinc-500 shrink-0">{label}</span>
      <span className="text-white font-mono flex items-center gap-1 text-right min-w-0 truncate">
        {icon}
        {value}
      </span>
    </div>
  );
}
