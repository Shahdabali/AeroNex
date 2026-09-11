import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

export function MarketSignals() {
  const signals = [
    {
      label: 'LOWEST OBSERVED FARE',
      route: 'BOM → BLR',
      value: '₹4,280',
      trend: '-3.2%',
      time: 'Last 24 hours',
      isIncrease: false,
    },
    {
      label: 'HIGHEST OBSERVED FARE',
      route: 'DEL → GOI',
      value: '₹14,800',
      trend: '+96.0%',
      time: 'Last 24 hours',
      isIncrease: true,
    },
    {
      label: 'BIGGEST INCREASE',
      route: 'DEL → MAA',
      value: '₹8,240',
      trend: '+14.2%',
      time: 'Last 24 hours',
      isIncrease: true,
    },
    {
      label: 'BIGGEST DECREASE',
      route: 'CCU → DEL',
      value: '₹5,120',
      trend: '-8.4%',
      time: 'Last 24 hours',
      isIncrease: false,
    }
  ];

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] overflow-hidden">
      <div className="p-4 border-b border-white/[0.08] bg-[#0E1017]">
        <h3 className="text-[12px] font-bold tracking-widest text-zinc-400 uppercase">Market Signals</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {signals.map((signal, idx) => (
          <ScrollReveal key={idx} delay={idx * 0.1}>
            <div className="p-5 flex flex-col hover:bg-white/[0.02] transition-colors h-full">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
                {signal.label}
              </span>
              
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{signal.route}</span>
                <span className="text-lg font-mono font-bold text-white">{signal.value}</span>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-[11px] text-zinc-500">{signal.time}</span>
                <span className={`text-[12px] font-bold flex items-center gap-0.5 ${signal.isIncrease ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {signal.isIncrease ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {signal.trend}
                </span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
