import { Check, Loader2, RefreshCw, AlertTriangle, Clock, WifiOff } from 'lucide-react';
import type { SearchMeta, Freshness } from '../services/api';
import type { SearchPhase } from '../hooks/useFlightSearch';
import { formatAge } from '../hooks/useDataStatus';

const FRESH_STYLE: Record<Freshness, string> = {
  live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  delayed: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  stale: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  unavailable: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
};

/** "Updated 12 min ago" with an honest label. Old data is never called "live". */
export function FreshnessChip({ freshness, ageSec }: { freshness: Freshness; ageSec: number | null }) {
  const label = freshness === 'live' ? 'Live' : freshness === 'delayed' ? 'Delayed' : freshness === 'stale' ? 'Stale' : 'No data';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${FRESH_STYLE[freshness]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${freshness === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
      {label}
      {ageSec !== null && <span className="normal-case font-semibold opacity-90">· updated {formatAge(ageSec)}</span>}
    </span>
  );
}

const STEPS: { stage: string[]; label: string }[] = [
  { stage: ['queued'], label: 'Search queued' },
  { stage: ['fetching'], label: 'Collecting fares from the airline marketplace' },
  { stage: ['parsing'], label: 'Reading and normalising results' },
  { stage: ['validating'], label: 'Checking data quality' },
  { stage: ['storing'], label: 'Saving fares and price history' },
];

/** Real progress of the scrape job (stage comes from the backend job record, not a timer). */
export function SearchProgress({ meta }: { meta?: SearchMeta }) {
  const stage = meta?.job?.stage ?? 'queued';
  const current = Math.max(0, STEPS.findIndex(s => s.stage.includes(stage)));
  return (
    <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-6" role="status" aria-live="polite">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="w-5 h-5 text-[#1788FF] animate-spin" />
        <div>
          <p className="text-sm font-semibold text-white">Searching live fares…</p>
          <p className="text-xs text-slate-400">
            Fares are collected on demand, so this can take several seconds
            {meta?.job && meta.job.attempts > 1 ? ` (attempt ${meta.job.attempts})` : ''}. You can keep using AeroNex meanwhile.
          </p>
        </div>
      </div>
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li key={s.label} className={`flex items-center gap-2 text-xs ${i < current ? 'text-emerald-400' : i === current ? 'text-white font-medium' : 'text-slate-500'}`}>
            {i < current ? <Check size={14} /> : i === current ? <Loader2 size={14} className="animate-spin" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />}
            {s.label}
          </li>
        ))}
      </ol>
      <div className="mt-5 space-y-3" aria-hidden>
        {[0, 1, 2].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-slate-800/40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

interface BannerProps {
  phase: SearchPhase;
  meta?: SearchMeta;
  onRefresh: () => void;
  refreshing: boolean;
}

/** One place that explains where the numbers came from and how old they are. */
export function SearchBanner({ phase, meta, onRefresh, refreshing }: BannerProps) {
  if (phase === 'idle' || phase === 'searching' || !meta) return null;

  if (phase === 'failed' || phase === 'timeout') {
    const message =
      phase === 'timeout'
        ? 'The search is taking longer than expected. Live airfare data may be temporarily unavailable.'
        : meta.errorMessage || 'Live airfare data is temporarily unavailable.';
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-xl p-3" role="alert">
        <span className="flex items-start gap-2">
          <WifiOff size={14} className="shrink-0 mt-0.5" />
          <span>
            <strong className="text-rose-200">No fares to show for this search.</strong> {message}
            {meta.retryAfterSec ? ` You can retry in about ${meta.retryAfterSec}s.` : ''}
          </span>
        </span>
        <button onClick={onRefresh} disabled={refreshing} className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Try again
        </button>
      </div>
    );
  }

  const note =
    phase === 'refreshing'
      ? 'A newer scrape is running - these are the last stored fares.'
      : phase === 'stale'
        ? meta.errorMessage
          ? `${meta.errorMessage} Showing the last stored fares.`
          : 'These are older stored fares; a refresh has not completed.'
        : meta.noFlights
          ? 'No flights were found for this route and date.'
          : meta.servedFrom === 'cache'
            ? 'Served from a recent scrape (no new request was needed).'
            : 'Freshly collected for this search.';
  const tone = phase === 'ready' ? 'text-slate-300 bg-[rgba(10,24,56,0.5)] border-slate-700/60' : 'text-amber-200 bg-amber-500/10 border-amber-500/25';
  const Icon = phase === 'ready' ? Clock : phase === 'refreshing' ? Loader2 : AlertTriangle;
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border rounded-xl p-3 ${tone}`}>
      <span className="flex flex-wrap items-center gap-2">
        <Icon size={14} className={`shrink-0 ${phase === 'refreshing' ? 'animate-spin' : ''}`} />
        <FreshnessChip freshness={meta.freshness} ageSec={meta.ageSec} />
        <span>
          Source: <strong>{meta.sources[0]?.name ?? 'EaseMyTrip'}</strong> · {note}
        </span>
      </span>
      <button onClick={onRefresh} disabled={refreshing || phase === 'refreshing'} className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-100 font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
        <RefreshCw size={12} className={refreshing || phase === 'refreshing' ? 'animate-spin' : ''} /> Refresh fares
      </button>
    </div>
  );
}
