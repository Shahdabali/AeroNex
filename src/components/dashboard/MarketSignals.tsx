import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';
import { useMetrics, fmtINR, splitRoute } from '../../hooks/useMarket';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../StateViews';
import { RouteDetailModal } from '../RouteDetailModal';

export function MarketSignals() {
  const { data, isPending, isError, error, refetch } = useMetrics();
  const [open, setOpen] = useState<string | null>(null);

  let body;
  if (isPending) body = <LoadingBlock label="Loading market signals…" />;
  else if (isError) body = <ErrorBlock error={error} onRetry={() => refetch()} title="Couldn't load market signals" />;
  else if (!data?.secondary || data.hasData === false) {
    body = <EmptyBlock title="No fares observed yet" description="Signals appear as soon as the data feed records its first observations." />;
  } else {
    const s = data.secondary;
    const signals = [
      { label: 'LOWEST OBSERVED FARE', route: s.lowestFare.route, value: fmtINR(s.lowestFare.fare), trend: null as number | null },
      { label: 'HIGHEST OBSERVED FARE', route: s.highestFare.route, value: fmtINR(s.highestFare.fare), trend: null as number | null },
      { label: 'BIGGEST INCREASE', route: s.biggestIncrease.route, value: `${s.biggestIncrease.change >= 0 ? '+' : ''}${s.biggestIncrease.change}%`, trend: s.biggestIncrease.change as number | null },
      { label: 'BIGGEST DECREASE', route: s.biggestDecrease.route, value: `${s.biggestDecrease.change >= 0 ? '+' : ''}${s.biggestDecrease.change}%`, trend: s.biggestDecrease.change as number | null },
    ];
    body = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {signals.map((signal, idx) => {
          const [from, to] = splitRoute(signal.route);
          return (
            <ScrollReveal key={idx} delay={idx * 0.1}>
              <button
                type="button"
                disabled={!signal.route}
                onClick={() => setOpen(signal.route)}
                aria-label={`${signal.label}: ${signal.route}. Open route details`}
                className="w-full text-left p-5 flex flex-col hover:bg-white/[0.02] transition-colors h-full cursor-pointer disabled:cursor-default"
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">{signal.label}</span>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-sm font-medium text-white font-mono">{from && to ? `${from} → ${to}` : '—'}</span>
                  <span className="text-lg font-mono font-bold text-white">{signal.value}</span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-[11px] text-zinc-500">{signal.trend === null ? 'Latest observation' : 'Change on latest refresh'}</span>
                  {signal.trend !== null && (
                    <span className={`flex items-center ${signal.trend >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {signal.trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </span>
                  )}
                </div>
              </button>
            </ScrollReveal>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] overflow-hidden">
      <div className="p-4 border-b border-white/[0.08] bg-[#0E1017]">
        <h3 className="text-[12px] font-bold tracking-widest text-zinc-400 uppercase">Market Signals</h3>
      </div>
      {body}
      {open && <RouteDetailModal route={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
