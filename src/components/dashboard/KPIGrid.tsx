import { useNavigate } from 'react-router-dom';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ScrollReveal } from '../ui/ScrollReveal';
import { useMetrics, useChartData } from '../../hooks/useMarket';
import { ErrorBlock, EmptyBlock } from '../StateViews';

/** Builds an SVG polyline from real index history (returns null when there are too few points). */
function sparkline(values: number[], width = 70, height = 30): string | null {
  if (values.length < 3) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => `${((i / (values.length - 1)) * width).toFixed(1)},${(height - 3 - ((v - min) / span) * (height - 6)).toFixed(1)}`)
    .join(' ');
}

export function KPIGrid() {
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useMetrics();
  const { data: chart } = useChartData('24h');

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between h-[120px] animate-pulse">
            <div className="h-2.5 w-28 bg-white/[0.06] rounded" />
            <div className="space-y-2">
              <div className="h-7 w-24 bg-white/[0.08] rounded" />
              <div className="h-3 w-16 bg-white/[0.05] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08]">
        <ErrorBlock error={error} onRetry={() => refetch()} title="Couldn't load key metrics" />
      </div>
    );
  }

  if (data.hasData === false) {
    return (
      <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08]">
        <EmptyBlock title="Waiting for the first data refresh" description="Metrics appear as soon as the pipeline records its first observations." />
      </div>
    );
  }

  const indexPoints = sparkline(Array.isArray(chart) ? chart.map((p: any) => p.value) : []);

  const kpis = [
    {
      label: 'AIRFARE PRICE INDEX',
      value: data.airfareIndex.value,
      change: data.airfareIndex.change,
      prefix: '',
      comparison: 'vs previous refresh',
      path: '/airfare-index',
      format: (v: number) => v.toFixed(1),
      points: indexPoints,
      higherIsBad: true,
    },
    {
      label: 'AVERAGE OBSERVED FARE',
      value: data.averageFare.value,
      change: data.averageFare.change,
      prefix: '₹',
      comparison: 'vs previous refresh',
      path: '/price-trends',
      format: (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
      points: null,
      higherIsBad: true,
    },
    {
      label: 'OBSERVATIONS',
      value: data.flightsTracked.value,
      change: 0,
      prefix: '',
      comparison: 'collected since start',
      path: '/data-scraping',
      format: (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
      points: null,
      higherIsBad: false,
    },
    {
      label: 'MONITORED ROUTES',
      value: data.routesTracked.value,
      change: 0,
      prefix: '',
      comparison: 'active corridors',
      path: '/routes',
      format: (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
      points: null,
      higherIsBad: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const isPositive = kpi.change >= 0;
        const showChange = kpi.change !== 0 || kpi.higherIsBad;
        const bad = kpi.higherIsBad ? isPositive : !isPositive;
        const colorClass = bad ? 'text-rose-500' : 'text-emerald-500';
        const strokeColor = bad ? '#f43f5e' : '#10b981';

        return (
          <ScrollReveal key={index} delay={index * 0.05}>
            <button
              type="button"
              onClick={() => navigate(kpi.path)}
              aria-label={`${kpi.label}: ${kpi.prefix}${kpi.format(kpi.value)}. Open details`}
              className="w-full text-left bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 flex flex-col relative overflow-hidden group hover:border-white/[0.25] transition-ui hover-lift cursor-pointer"
            >
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">{kpi.label}</span>

              <div className="flex items-end justify-between mt-1 relative z-10">
                <div className="flex flex-col">
                  <span className="text-white text-[28px] font-mono font-medium leading-none tracking-tight flex items-baseline tabular-nums">
                    <span className="text-[20px] text-zinc-400 mr-1">{kpi.prefix}</span>
                    <AnimatedNumber value={kpi.value} format={kpi.format} />
                  </span>

                  <div className="flex items-center gap-2 mt-2">
                    {showChange && (
                      <span className={`text-[12px] font-bold font-mono tabular-nums ${colorClass}`}>
                        {isPositive ? '+' : ''}
                        {kpi.change}%
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{kpi.comparison}</span>
                  </div>
                </div>

                {kpi.points && (
                  <div className="w-[70px] h-[30px] opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                    <svg viewBox="0 0 70 30" className="w-full h-full overflow-visible">
                      <polyline fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={kpi.points} />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
