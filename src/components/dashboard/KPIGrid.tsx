import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ScrollReveal } from '../ui/ScrollReveal';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export function KPIGrid() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 5000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[110px] animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="bg-[#12141C] rounded-xl border border-white/[0.08]" />)}
      </div>
    );
  }

  // Generate some dummy sparkline data based on the trend direction
  const generateSparkline = (change: number, length = 10) => {
    let current = 100;
    return Array.from({ length }).map((_, i) => {
      const step = change > 0 ? (i * change) / length : (i * Math.abs(change)) / length;
      const noise = (Math.random() - 0.5) * 2;
      return { value: change > 0 ? current + step + noise : current - step + noise };
    });
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
      sparkline: generateSparkline(data.airfareIndex.change)
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
      sparkline: generateSparkline(data.averageFare.change)
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
      sparkline: generateSparkline(data.flightsTracked.change)
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
      sparkline: generateSparkline(data.routesTracked.change)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const isPositive = kpi.change >= 0;
        // In economics/fares, an increase in price might be considered 'negative' for consumers, 
        // but typically index increase is shown green or red depending on context. 
        // User asked: "Use green only for Positive movement, Healthy systems, Price decreases. 
        // Use red only for Price increases, Anomalies"
        // Since it's airfare, INCREASE = RED, DECREASE = GREEN
        // EXCEPT for "Observations" and "Routes" which are healthy systems (INCREASE = GREEN)
        
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
          <ScrollReveal key={index} delay={index * 0.1}>
            <div 
              onClick={() => navigate(kpi.path)}
              className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 flex flex-col relative overflow-hidden group hover:border-white/[0.2] transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{kpi.label}</span>
              </div>
              
              <div className="flex items-end justify-between mt-1 relative z-10">
                <div className="flex flex-col">
                  <h3 className="text-white text-[28px] font-mono font-medium leading-none tracking-tight flex items-baseline">
                    <span className="text-[20px] text-zinc-400 mr-1">{kpi.prefix}</span>
                    <AnimatedNumber value={kpi.value} format={kpi.format} />
                    {kpi.suffix && <span className="text-[16px] text-zinc-500 ml-1">{kpi.suffix}</span>}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[12px] font-bold font-mono px-1.5 py-0.5 rounded-sm bg-opacity-10 ${isPositive ? 'bg-current ' + colorClass : 'bg-current ' + colorClass}`}>
                      {isPositive ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{kpi.comparison}</span>
                  </div>
                </div>

                <div className="w-[70px] h-[35px] opacity-80 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.sparkline}>
                      <Line type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}

