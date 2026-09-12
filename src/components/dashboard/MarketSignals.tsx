import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

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
    <div className="bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B101D] flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-wider text-[#0F2A4A] dark:text-white uppercase">
          Key Market Observations & Corridor Extremes
        </h3>
        <span className="text-[10px] font-mono text-slate-400">Continuous 24h Window</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        {signals.map((signal, idx) => (
          <div key={idx} className="p-4 flex flex-col hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors h-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {signal.label}
            </span>
            
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{signal.route}</span>
              <span className="text-base font-mono font-extrabold text-[#0F2A4A] dark:text-white tabular-nums">{signal.value}</span>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
              <span className="text-[11px] text-slate-400">{signal.time}</span>
              <span className={`text-xs font-bold flex items-center gap-0.5 tabular-nums ${signal.isIncrease ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {signal.isIncrease ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {signal.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
