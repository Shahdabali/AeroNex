import { useState } from 'react';
import { RegionalMap } from './RegionalMap';
import { ArrowRight, Activity, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRouteChanges, fmtINR } from '../../hooks/useMarket';
import { DataSourceBadge } from '../DataSourceBadge';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../StateViews';
import { RouteDetailModal } from '../RouteDetailModal';

export function IndiaAirfareMarketPulse() {
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useRouteChanges();
  const [open, setOpen] = useState<string | null>(null);
  const routes = Array.isArray(data) ? data.slice(0, 8) : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <RegionalMap />
      </div>

      <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 flex flex-col h-full max-h-[460px]">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="text-zinc-400 text-[12px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            Biggest Route Moves
          </h3>
          <DataSourceBadge />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {isPending ? (
            <LoadingBlock />
          ) : isError ? (
            <ErrorBlock error={error} onRetry={() => refetch()} />
          ) : routes.length === 0 ? (
            <EmptyBlock title="No route movements yet" description="Routes appear after the data feed records observations." />
          ) : (
            routes.map((route: any) => {
              const isIncrease = route.change > 0;
              return (
                <button
                  type="button"
                  key={route.route}
                  onClick={() => setOpen(route.route)}
                  aria-label={`${route.route}, ${route.change}% change. Open route details`}
                  className="w-full text-left p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer flex flex-col gap-2 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Plane size={12} className="text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                      {route.route}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        route.change === 0 ? 'text-zinc-400 bg-white/[0.04]' : isIncrease ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                      }`}
                    >
                      {isIncrease ? '+' : ''}
                      {route.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 uppercase tracking-widest">Current Fare</span>
                    <span className="text-zinc-300 font-mono">{fmtINR(route.currentFare)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/routes')}
          className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors w-full group cursor-pointer"
        >
          View all routes <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      {open && <RouteDetailModal route={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
