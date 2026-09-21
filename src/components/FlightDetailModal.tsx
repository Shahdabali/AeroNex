import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Plane, Clock, Bell, ExternalLink, Info } from 'lucide-react';
import { api } from '../services/api';
import { INDIAN_AIRPORTS, type FlightItem } from '../data/indianAviation';
import { useRoutes, fmtINR } from '../hooks/useMarket';
import { ReasoningPanel } from './RouteDetailModal';
import { LoadingBlock, ErrorBlock } from './StateViews';

// Official airline sites (homepages only; AeroNex does not sell tickets).
const AIRLINE_SITES: Record<string, string> = {
  '6E': 'https://www.goindigo.in',
  AI: 'https://www.airindia.com',
  IX: 'https://www.airindiaexpress.com',
  QP: 'https://www.akasaair.com',
  SG: 'https://www.spicejet.com',
};

const city = (code: string) => INDIAN_AIRPORTS.find(a => a.code === code)?.city ?? code;

export function FlightDetailModal({ flight, onClose }: { flight: FlightItem; onClose: () => void }) {
  const navigate = useNavigate();
  const closeRef = useRef<HTMLButtonElement>(null);
  const key = `${flight.from}-${flight.to}`;

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
  const tracked = (routes as any[]).find(r => r.route === key);
  const prediction = useQuery({ queryKey: ['routePrediction', key], queryFn: () => api.predict({ route: key }), staleTime: 60_000, retry: false });

  const vsObserved = tracked ? ((flight.price - tracked.currentFare) / tracked.currentFare) * 100 : null;
  const site = AIRLINE_SITES[flight.airlineCode];

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
              {city(flight.from)} → {city(flight.to)}
              {flight.date ? ` · ${new Date(flight.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''} · {flight.cabinClass}
            </p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close flight details" className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{flight.departureTime}</div>
              <div className="font-mono text-cyan-400 text-sm">{flight.from}</div>
            </div>
            <div className="flex-1 flex flex-col items-center text-xs text-zinc-400">
              <span className="flex items-center gap-1"><Clock size={11} /> {flight.duration}</span>
              <div className="w-full h-px bg-gradient-to-r from-cyan-500 to-purple-500 my-1.5 relative">
                <Plane size={13} className="absolute left-1/2 -translate-x-1/2 -top-[6px] rotate-90 text-purple-400" />
              </div>
              <span className="text-emerald-400">{flight.stops}</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white">{flight.arrivalTime}</div>
              <div className="font-mono text-purple-400 text-sm">{flight.to}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Cell label="Indicative fare" value={fmtINR(flight.price)} />
            <Cell label="Observed corridor fare" value={tracked ? fmtINR(tracked.currentFare) : 'Not tracked'} />
            <Cell label="Versus observed" value={vsObserved === null ? '—' : `${vsObserved > 0 ? '+' : ''}${vsObserved.toFixed(1)}%`} />
            <Cell label="Price basis" value={flight.priceBasis === 'observed' ? 'Scaled to observed fare' : 'Model estimate'} />
            <Cell label="Cabin" value={flight.cabinClass} />
            <Cell label="Baggage" value="Not available" />
          </div>

          <p className="flex gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              This schedule and fare are an indicative model built around the fares AeroNex has observed on {key}. They are not live availability, seat counts or a bookable offer. Confirm the
              real timetable and price with the airline.
            </span>
          </p>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Should you wait?</h3>
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
                navigate(`/price-alerts?from=${flight.from}&to=${flight.to}&target=${Math.round(flight.price * 0.9)}`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              <Bell size={13} /> Alert me below {fmtINR(Math.round(flight.price * 0.9))}
            </button>
            {site && (
              <a
                href={site}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white text-xs font-bold"
              >
                <ExternalLink size={13} /> {flight.airline} website
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
      <div className="mt-1 font-mono font-bold text-white text-sm">{value}</div>
    </div>
  );
}
