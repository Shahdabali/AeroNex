import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ScrollReveal } from '../ui/ScrollReveal';

export function KPIGrid() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: api.getDashboardMetrics,
    staleTime: 6000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between h-[120px] animate-pulse">
            <div className="h-2.5 w-28 bg-white/[0.06] rounded" />
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="h-7 w-24 bg-white/[0.08] rounded" />
                <div className="h-3 w-16 bg-white/[0.05] rounded" />
              </div>
              <div className="h-6 w-16 bg-white/[0.04] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Pre-generate SVG points string for ultra-lightweight sparklines without Recharts overhead
  const getSparklinePoints = (change: number, width = 70, height = 30) => {
    const isUp = change >= 0;
    const points: [number, number][] = [
      [0, isUp ? height - 6 : 6],
      [14, isUp ? height - 10 : 10],
      [28, isUp ? height - 16 : 14],
      [42, isUp ? height - 12 : 18],
      [56, isUp ? height - 22 : 24],
      [width, isUp ? 4 : height - 4],
    ];
    return points.map(([x, y]) => `${x},${y}`).join(' ');
  };

  const kpis = [
    {
      label: 'AIRFARE PRICE INDEX',
      value: data.airfareIndex.value,
      change: data.airfareIndex.change,
      prefix: '',
      suffix: '',
      comparison: 'vs previous period',
      path: '/airfare-index',
      format: (v: number) => v.toFixed(1),
      points: getSparklinePoints(data.airfareIndex.change),
    },
    {
      label: 'DAILY AIRFARE MOVEMENT',
      value: data.averageFare.value,
      change: data.averageFare.change,
      prefix: '₹',
      suffix: '',
      comparison: 'average observed fare',
      path: '/price-trends',
      format: (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      points: getSparklinePoints(data.averageFare.change),
    },
    {
      label: 'OBSERVATIONS',
      value: data.flightsTracked.value,
      change: data.flightsTracked.change,
      prefix: '',
      suffix: '',
      comparison: 'today',
      path: '/search',
      format: (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      points: getSparklinePoints(data.flightsTracked.change),
    },
    {
      label: 'MONITORED ROUTES',
      value: data.routesTracked.value,
      change: data.routesTracked.change,
      prefix: '',
      suffix: '',
      comparison: 'active routes',
      path: '/routes',
      format: (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      points: getSparklinePoints(data.routesTracked.change),
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const isPositive = kpi.change >= 0;
        
        let colorClass = 'text-cyan-400';
        let strokeColor = '#22d3ee'; // cyan-400
        
        if (kpi.label === 'AIRFARE PRICE INDEX' || kpi.label === 'DAILY AIRFARE MOVEMENT') {
          colorClass = isPositive ? 'text-rose-500' : 'text-emerald-500';
          strokeColor = isPositive ? '#f43f5e' : '#10b981';
        } else {
          colorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';
          strokeColor = isPositive ? '#10b981' : '#f43f5e';
        }

        return (
          <ScrollReveal key={index} delay={index * 0.05}>
            <div 
              onClick={() => navigate(kpi.path)}
              className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 flex flex-col relative overflow-hidden group hover:border-white/[0.25] transition-ui hover-lift cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{kpi.label}</span>
              </div>
              
              <div className="flex items-end justify-between mt-1 relative z-10">
                <div className="flex flex-col">
                  <h3 className="text-white text-[28px] font-mono font-medium leading-none tracking-tight flex items-baseline tabular-nums">
                    <span className="text-[20px] text-zinc-400 mr-1">{kpi.prefix}</span>
                    <AnimatedNumber value={kpi.value} format={kpi.format} />
                    {kpi.suffix && <span className="text-[16px] text-zinc-500 ml-1">{kpi.suffix}</span>}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[12px] font-bold font-mono tabular-nums px-1.5 py-0.5 rounded-sm bg-opacity-10 ${isPositive ? 'bg-current ' + colorClass : 'bg-current ' + colorClass}`}>
                      {isPositive ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{kpi.comparison}</span>
                  </div>
                </div>

                <div className="w-[70px] h-[30px] opacity-80 group-hover:opacity-100 transition-opacity">
                  <svg viewBox="0 0 70 30" className="w-full h-full overflow-visible">
                    <polyline
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={kpi.points}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}

