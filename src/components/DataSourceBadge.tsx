import { useDataStatus, type FeedState } from '../hooks/useDataStatus';

const STYLES: Record<FeedState, { dot: string; wrap: string }> = {
  live: { dot: 'bg-emerald-400', wrap: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  simulated: { dot: 'bg-amber-400', wrap: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  delayed: { dot: 'bg-orange-400', wrap: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  offline: { dot: 'bg-rose-400', wrap: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  loading: { dot: 'bg-zinc-500', wrap: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' },
};

interface Props {
  className?: string;
  /** Show the age of the last update next to the label. */
  showAge?: boolean;
}

/** Honest feed indicator: pulses only when data really is live and fresh. */
export function DataSourceBadge({ className = '', showAge = false }: Props) {
  const feed = useDataStatus();
  const s = STYLES[feed.state];
  const age = showAge && feed.status?.ageSec != null ? ` · ${feed.status.ageSec < 90 ? `${feed.status.ageSec}s` : `${Math.round(feed.status.ageSec / 60)}m`} ago` : '';
  return (
    <span
      title={feed.detail}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${s.wrap} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${feed.state === 'live' ? 'animate-pulse' : ''}`} />
      {feed.label}
      {age}
    </span>
  );
}
