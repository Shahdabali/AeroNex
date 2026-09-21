import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Plane, Bell, Search, Sparkles, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { INDIAN_AIRPORTS } from '../data/indianAviation';
import { useAppContext } from '../context/AppProvider';
import { useRoutes, splitRoute, fmtINR } from '../hooks/useMarket';
import { LoadingBlock, ErrorBlock } from './StateViews';
import { DataSourceBadge } from './DataSourceBadge';

const airport = (code: string) => INDIAN_AIRPORTS.find(a => a.code === code);

interface Props {
  /** Route key such as "DEL-BOM" (arrows are accepted too). */
  route: string;
  onClose: () => void;
}

/**
 * Detail view behind any route element: observed fare + change, price history with an
 * inspectable chart, airport facts, and a data-grounded AI read that explains its reasoning.
 */
export function RouteDetailModal({ route, onClose }: Props) {
  const navigate = useNavigate();
  const { theme } = useAppContext();
  const isLight = theme === 'light';
  const [from, to] = splitRoute(route);
  const key = `${from}-${to}`;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const { data: routes = [] } = useRoutes();
  const fare = (routes as any[]).find(r => r.route === key);
  const change = fare?.previousFare ? ((fare.currentFare - fare.previousFare) / fare.previousFare) * 100 : null;

  const history = useQuery({
    queryKey: ['routeHistory', key],
    queryFn: () => api.getRouteHistory(key),
    staleTime: 15_000,
    retry: 1,
  });
  const points = ((history.data as any[]) || []).map(h => ({
    at: new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    fare: h.fare,
  }));

  const analysis = useQuery({
    queryKey: ['routeAnalysis', key],
    queryFn: () => api.routeAnalysis(key),
    staleTime: 60_000,
    retry: false,
  });
  const prediction = useQuery({
    queryKey: ['routePrediction', key],
    queryFn: () => api.predict({ route: key }),
    staleTime: 60_000,
    retry: false,
  });

  const o = airport(from);
  const d = airport(to);
  const TrendIcon = change === null || Math.abs(change) < 0.05 ? Minus : change > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={`Route details ${from} to ${to}`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0A0C13] border border-white/[0.12] rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-5 bg-[#0A0C13] border-b border-white/[0.08]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <Plane size={18} className="text-cyan-400 shrink-0" />
              <span className="font-mono">{from}</span>
              <span className="text-zinc-500">→</span>
              <span className="font-mono">{to}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 truncate">
              {(o?.city ?? from)} to {(d?.city ?? to)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DataSourceBadge />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close route details"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Fare summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Current fare" value={fmtINR(fare?.currentFare)} />
            <Stat label="Previous" value={fmtINR(fare?.previousFare)} />
            <Stat
              label="Last change"
              value={change === null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
              icon={<TrendIcon size={14} className={change === null ? 'text-zinc-500' : change > 0 ? 'text-rose-400' : 'text-emerald-400'} />}
            />
            <Stat label="Updated" value={fare?.lastUpdated ? new Date(fare.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'} />
          </div>
          {!fare && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              AeroNex has not observed any fares on this corridor yet, so price data and analysis are unavailable.
            </p>
          )}

          {/* History */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Observed fare history</h3>
            {history.isPending ? (
              <LoadingBlock label="Loading history…" />
            ) : history.isError ? (
              <ErrorBlock error={history.error} onRetry={() => history.refetch()} title="Couldn't load history" />
            ) : points.length < 2 ? (
              <p className="text-xs text-zinc-400 py-4">Not enough observations yet to draw a history. Points are added at every data refresh.</p>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)'} vertical={false} />
                    <XAxis dataKey="at" hide />
                    <YAxis domain={['auto', 'auto']} width={52} tickFormatter={v => `₹${v}`} stroke={isLight ? '#64748B' : '#71717a'} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isLight ? '#fff' : '#090A0F', border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: isLight ? '#475569' : '#a1a1aa', fontSize: 11 }}
                      itemStyle={{ color: isLight ? '#0F172A' : '#fff', fontWeight: 700 }}
                      formatter={(v: any) => [fmtINR(Number(v)), `${from}→${to}`]}
                    />
                    <Line type="monotone" dataKey="fare" stroke={isLight ? '#0284C7' : '#22d3ee'} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Airports */}
          <section className="grid sm:grid-cols-2 gap-3">
            {[o, d].map((a, i) => (
              <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                  <MapPin size={11} /> {i === 0 ? 'Departure' : 'Arrival'}
                </div>
                <div className="text-sm font-semibold text-white">
                  {a ? `${a.city} (${a.code})` : (i === 0 ? from : to)}
                </div>
                <div className="text-xs text-zinc-400">{a ? `${a.name} · ${a.state} · ${a.region} India` : 'Airport details unavailable'}</div>
              </div>
            ))}
          </section>

          {/* AI read with reasoning */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
              <Sparkles size={12} className="text-cyan-400" /> AeroNex analysis
            </h3>
            {analysis.isPending || prediction.isPending ? (
              <LoadingBlock label="Analysing observed fares…" />
            ) : analysis.isError && prediction.isError ? (
              <ErrorBlock
                error={analysis.error}
                title="Analysis unavailable"
                onRetry={() => {
                  analysis.refetch();
                  prediction.refetch();
                }}
              />
            ) : (
              <div className="space-y-3 text-sm">
                {analysis.data && (
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
                    <p className="text-zinc-200 leading-relaxed">{(analysis.data as any).currentSituation}</p>
                    <p className="text-zinc-400 text-xs"><strong className="text-zinc-300">Trend:</strong> {(analysis.data as any).priceTrend}</p>
                    <p className="text-zinc-400 text-xs"><strong className="text-zinc-300">Volatility:</strong> {(analysis.data as any).volatilityRisk}</p>
                    <p className="text-zinc-300 text-xs"><strong>Suggestion:</strong> {(analysis.data as any).recommendation}</p>
                  </div>
                )}
                {prediction.data && <ReasoningPanel data={prediction.data as any} />}
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => { onClose(); navigate(`/search?from=${from}&to=${to}`); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              <Search size={13} /> Search flights
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/price-alerts?from=${from}&to=${to}${fare ? `&target=${Math.round(fare.currentFare * 0.93)}` : ''}`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white text-xs font-bold cursor-pointer"
            >
              <Bell size={13} /> Set price alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-1 flex items-center gap-1.5 text-lg font-mono font-bold text-white tabular-nums">
        {icon}
        {value}
      </div>
    </div>
  );
}

/** Explains *why* a recommendation was produced: price/timing/route reasoning, data used and caveats. */
export function ReasoningPanel({ data }: { data: any }) {
  const actionLabel: Record<string, string> = { book_now: 'Book now', book_soon: 'Book soon', wait: 'Wait', monitor: 'Keep monitoring' };
  return (
    <details className="group rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4" open>
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">
          {actionLabel[data.recommendedAction] ?? 'Outlook'}: {data.direction}
          {data.predictedChangePercent ? ` ~${data.predictedChangePercent}%` : ''}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-cyan-400">Why this? ▾</span>
      </summary>
      <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{data.reason}</p>
      {data.explanation && (
        <dl className="mt-3 space-y-2 text-xs">
          <div><dt className="text-zinc-500 uppercase tracking-widest text-[10px]">Price reasoning</dt><dd className="text-zinc-300">{data.explanation.price}</dd></div>
          <div><dt className="text-zinc-500 uppercase tracking-widest text-[10px]">Timing reasoning</dt><dd className="text-zinc-300">{data.explanation.timing}</dd></div>
          <div><dt className="text-zinc-500 uppercase tracking-widest text-[10px]">Route reasoning</dt><dd className="text-zinc-300">{data.explanation.route}</dd></div>
        </dl>
      )}
      {Array.isArray(data.dataUsed) && data.dataUsed.length > 0 && (
        <div className="mt-3 text-xs">
          <div className="text-zinc-500 uppercase tracking-widest text-[10px] mb-1">Data used</div>
          <ul className="list-disc pl-4 text-zinc-300 space-y-0.5">{data.dataUsed.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
        </div>
      )}
      {Array.isArray(data.caveats) && data.caveats.length > 0 && (
        <div className="mt-3 text-xs">
          <div className="text-amber-400 uppercase tracking-widest text-[10px] mb-1">Caveats</div>
          <ul className="list-disc pl-4 text-zinc-400 space-y-0.5">{data.caveats.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
        </div>
      )}
      <p className="mt-3 text-[10px] text-zinc-500">
        Confidence {Math.round((data.confidence ?? 0) * 100)}% (reflects how much history is stored, not a statistical probability) · source: {data.source === 'gemini' ? 'Gemini, grounded in the data above' : 'AeroNex rule-based analytics'}
      </p>
    </details>
  );
}
