import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '../services/api';
import { fmtINR } from '../hooks/useMarket';
import { LoadingBlock, ErrorBlock } from './StateViews';
import { FreshnessChip } from './SearchStatus';

/**
 * Route intelligence from the stored scrape of the route (median/cheapest/average, airlines, departure times,
 * stops, trend). Every figure is derived from collected fares; where there is not enough data it says so.
 */
export function RouteIntelligence({ from, to }: { from: string; to: string }) {
  const q = useQuery({
    queryKey: ['routeIntel', from, to],
    queryFn: () => api.getRouteIntel(from, to),
    staleTime: 20_000,
    refetchInterval: 30_000,
    retry: 1,
  });

  if (q.isPending) return <LoadingBlock label="Reading collected fares…" />;
  if (q.isError) return <ErrorBlock error={q.error} onRetry={() => q.refetch()} title="Route data unavailable" />;

  const r = q.data.data;
  if (r.insufficientData || !r.stats) {
    return (
      <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
        <strong>Insufficient recent data.</strong> {r.reason ?? 'No fares have been collected for this route yet.'} Searching for this route in Flight Search collects a fresh sample.
      </p>
    );
  }
  const { stats, trend } = r;
  const times = r.departureTimes ?? { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const maxTimes = Math.max(1, ...Object.values(times));
  const TrendIcon = !trend || trend.direction === null || trend.direction === 'flat' ? Minus : trend.direction === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <FreshnessChip freshness={r.freshness ?? 'unavailable'} ageSec={r.ageSec ?? null} />
        <span>
          Sample: departures on <strong className="text-zinc-200">{r.travelDate}</strong> (about {r.windowDays} days ahead) · {stats.flightCount} flights · {stats.airlineCount} airlines
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Cell label="Cheapest" value={fmtINR(stats.cheapest)} />
        <Cell label="Cheapest non-stop" value={stats.cheapestNonstop != null ? fmtINR(stats.cheapestNonstop) : 'None listed'} />
        <Cell label="Median" value={fmtINR(stats.median)} />
        <Cell label="Average" value={fmtINR(Math.round(stats.average))} />
        <Cell label="Highest" value={fmtINR(stats.highest)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Airlines (cheapest first)</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 text-left">
                <th className="font-medium pb-1">Airline</th>
                <th className="font-medium pb-1 text-right">Flights</th>
                <th className="font-medium pb-1 text-right">Cheapest</th>
              </tr>
            </thead>
            <tbody>
              {(r.airlines ?? []).map(a => (
                <tr key={a.airline} className="border-t border-white/[0.05] text-zinc-200">
                  <td className="py-1">{a.airline}</td>
                  <td className="py-1 text-right font-mono">{a.flights}</td>
                  <td className="py-1 text-right font-mono">{fmtINR(a.cheapest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">Departure times (IST)</div>
            {(['morning', 'afternoon', 'evening', 'night'] as const).map(k => (
              <div key={k} className="flex items-center gap-2 text-xs mb-1">
                <span className="w-20 capitalize text-zinc-400">{k}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-cyan-500/70" style={{ width: `${(times[k] / maxTimes) * 100}%` }} />
                </div>
                <span className="w-7 text-right font-mono text-zinc-300">{times[k]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <MiniCell label="Non-stop" value={r.stops?.nonstop ?? 0} />
            <MiniCell label="1 stop" value={r.stops?.oneStop ?? 0} />
            <MiniCell label="2+ stops" value={r.stops?.twoPlus ?? 0} />
          </div>
          <p className="text-[11px] text-zinc-500">Cabins collected: {(r.cabins ?? ['economy']).join(', ')} (other cabins are not collected yet).</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-300 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
        <TrendIcon size={15} className={trend?.direction === 'up' ? 'text-rose-400' : trend?.direction === 'down' ? 'text-emerald-400' : 'text-zinc-500'} />
        {trend && !trend.insufficientData ? (
          <span>
            Typical fare is <strong>{trend.direction === 'flat' ? 'flat' : trend.direction === 'up' ? 'up' : 'down'}</strong> ({trend.changePct! > 0 ? '+' : ''}{trend.changePct}%) across {trend.points} scrapes since{' '}
            {trend.since ? new Date(trend.since).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'the first one'}.
          </span>
        ) : (
          <span>Insufficient recent data for a trend: it needs at least two scrapes of this route (so far {trend?.points ?? 0}).</span>
        )}
      </div>
    </div>
  );
}

const Cell = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
    <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
    <div className="mt-1 font-mono font-bold text-white text-sm">{value}</div>
  </div>
);

const MiniCell = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg bg-white/[0.04] py-1.5">
    <div className="font-mono font-bold text-white">{value}</div>
    <div className="text-[10px] text-zinc-500">{label}</div>
  </div>
);
