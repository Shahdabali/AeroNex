import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Plane, Clock, Bell, ExternalLink, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { api, type LiveFlight } from '../services/api';
import { INDIAN_AIRPORTS } from '../data/indianAviation';
import { fmtINR } from '../hooks/useMarket';
import { formatAge } from '../hooks/useDataStatus';
import { ReasoningPanel } from './RouteDetailModal';
import { LoadingBlock, ErrorBlock } from './StateViews';
import { clock, dayOf, durationLabel, dateLabel } from '../utils/flightTime';

const city = (code: string) => INDIAN_AIRPORTS.find(a => a.code === code)?.city ?? code;

export function FlightDetailModal({ flight, onClose }: { flight: LiveFlight; onClose: () => void }) {
  const navigate = useNavigate();
  const closeRef = useRef<HTMLButtonElement>(null);
  const key = flight.route;
  const [openedAt] = useState(() => Date.now());

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

  // The list already carries everything needed to render; this adds the stored price history for THIS flight.
  const detail = useQuery({ queryKey: ['flightDetail', flight.id], queryFn: () => api.getFlightDetail(flight.id), staleTime: 30_000, retry: 1 });
  const prediction = useQuery({ queryKey: ['routePrediction', key], queryFn: () => api.predict({ route: key }), staleTime: 60_000, retry: false });

  const history = (detail.data?.data.history ?? []).map(h => ({
    at: new Date(h.t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    price: h.price,
  }));
  const changes = detail.data?.data.priceChanges ?? [];
  const next = dayOf(flight.arrivalAt) !== dayOf(flight.departureAt);
  const ageSec = Math.max(0, Math.round((openedAt - new Date(flight.lastSeenAt).getTime()) / 1000));
  const legs = flight.legs.length > 1 ? flight.legs : [];
  const listed = flight.availability !== 'not_listed';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={`Flight ${flight.flightNumber} details`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0A0C13] border border-white/[0.12] rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-5 bg-[#0A0C13] border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="w-9 h-9 rounded-xl bg-[#081533] border border-slate-700 flex items-center justify-center font-mono text-sm text-cyan-400">{flight.airlineCode}</span>
              {flight.airline} <span className="font-mono text-zinc-400 text-sm">{flight.flightNumber}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {city(flight.origin)} → {city(flight.destination)} · {dateLabel(flight.departureAt)} · <span className="capitalize">{flight.cabin}</span>
            </p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close flight details" className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!listed && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-lg p-3" role="alert">
              This flight was listed in an earlier scrape but is <strong>no longer offered</strong> in the latest one - it may have sold out or been withdrawn. The fare shown is the last one seen.
            </p>
          )}

          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{clock(flight.departureAt)}</div>
              <div className="font-mono text-cyan-400 text-sm">{flight.origin}</div>
            </div>
            <div className="flex-1 flex flex-col items-center text-xs text-zinc-400">
              <span className="flex items-center gap-1"><Clock size={11} /> {durationLabel(flight.durationMin)}</span>
              <div className="w-full h-px bg-gradient-to-r from-cyan-500 to-purple-500 my-1.5 relative">
                <Plane size={13} className="absolute left-1/2 -translate-x-1/2 -top-[6px] rotate-90 text-purple-400" />
              </div>
              <span className="text-emerald-400">{flight.stopsLabel}</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">
                {clock(flight.arrivalAt)}
                {next && <sup className="text-xs text-amber-400 ml-0.5">+1</sup>}
              </div>
              <div className="font-mono text-purple-400 text-sm">{flight.destination}</div>
            </div>
          </div>

          {legs.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Itinerary</h3>
              <ol className="space-y-2">
                {legs.map(l => (
                  <li key={l.flightNumber + l.departureAt} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-zinc-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-mono text-white font-semibold">{l.flightNumber}</span>
                    <span>{l.airline}</span>
                    <span className="font-mono">{l.origin} {clock(l.departureAt)} → {l.destination} {clock(l.arrivalAt)}</span>
                    {l.aircraft && <span className="text-zinc-500">{l.aircraft}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Cell label="Fare (per adult)" value={fmtINR(flight.price)} />
            <Cell label="Base fare" value={flight.baseFare != null ? fmtINR(flight.baseFare) : 'Not reported'} />
            <Cell label="Taxes & fees" value={flight.taxes != null ? fmtINR(flight.taxes) : 'Not reported'} />
            <Cell label="Baggage" value={flight.baggage ?? 'Not reported'} />
            <Cell label="Aircraft" value={flight.aircraft ?? 'Not reported'} />
            <Cell label="Seats" value={flight.seatsLeft ? `${flight.seatsLeft} left (source-reported)` : listed ? 'Available' : 'Not listed'} />
            <Cell label="Lowest seen" value={fmtINR(flight.lowestSeen)} />
            <Cell label="Highest seen" value={fmtINR(flight.highestSeen)} />
            <Cell label="Last checked" value={formatAge(ageSec)} />
          </div>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Price history for this flight</h3>
            {detail.isPending ? (
              <LoadingBlock label="Loading stored observations…" />
            ) : detail.isError ? (
              <ErrorBlock error={detail.error} onRetry={() => detail.refetch()} title="History unavailable" />
            ) : history.length < 2 ? (
              <p className="text-xs text-zinc-400 bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                Only {history.length} observation{history.length === 1 ? '' : 's'} so far. A trend needs at least two checks; AeroNex has not seen this fare move yet.
              </p>
            ) : (
              <>
                <div className="h-40 rounded-xl border border-white/[0.08] bg-white/[0.02] p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="at" tick={{ fontSize: 10, fill: '#a1a1aa' }} minTickGap={40} />
                      <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} domain={['dataMin - 200', 'dataMax + 200']} width={52} tickFormatter={v => `₹${Math.round(v / 100) / 10}k`} />
                      <Tooltip formatter={(v: any) => [fmtINR(Number(v)), 'Fare']} contentStyle={{ background: '#0A0C13', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12 }} />
                      <Line type="stepAfter" dataKey="price" stroke="#22d3ee" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {changes.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs">
                    {changes.slice(0, 5).map(c => (
                      <li key={c.at} className="flex items-center gap-2 text-zinc-300">
                        {c.diff < 0 ? <TrendingDown size={13} className="text-emerald-400" /> : <TrendingUp size={13} className="text-rose-400" />}
                        {fmtINR(c.oldPrice)} → {fmtINR(c.newPrice)} ({c.pct > 0 ? '+' : ''}{c.pct}%)
                        <span className="text-zinc-500">{new Date(c.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-zinc-400">The fare has been checked {history.length} times without changing.</p>
                )}
              </>
            )}
          </section>

          <p className="flex gap-2 text-xs text-zinc-300 bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
            <Info size={14} className="shrink-0 mt-0.5 text-cyan-400" />
            <span>
              Observed on <strong>{flight.source}</strong> at {new Date(flight.lastSeenAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}. AeroNex does not sell tickets:
              fares can change or sell out at any moment, so confirm the price on the booking site.
            </span>
          </p>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Route outlook (AI analysis of observed fares)</h3>
            {prediction.isPending ? (
              <LoadingBlock label="Reading observed fares…" />
            ) : prediction.isError ? (
              <ErrorBlock error={prediction.error} onRetry={() => prediction.refetch()} title="Outlook unavailable" />
            ) : (
              <ReasoningPanel data={prediction.data} />
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/price-alerts?from=${flight.origin}&to=${flight.destination}&target=${Math.round(flight.price * 0.9)}`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              <Bell size={13} /> Alert me below {fmtINR(Math.round(flight.price * 0.9))}
            </button>
            {flight.sourceUrl && (
              <a
                href={flight.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white text-xs font-bold"
              >
                <ExternalLink size={13} /> View on {flight.source}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-1 font-mono font-bold text-white text-sm break-words">{value}</div>
    </div>
  );
}
