import { BarChart3, TrendingUp, Plane, Map } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppProvider';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ScrollReveal } from '../ui/ScrollReveal';

export function KPIGrid() {
  const navigate = useNavigate();
  const { t } = useAppContext();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 5000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[120px] animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="bg-[#0A1838] rounded-xl border border-slate-800" />)}
      </div>
    );
  }

  const kpis = [
    {
      icon: BarChart3,
      label: t.airfareIndexKpi,
      value: data.airfareIndex.value,
      change: data.airfareIndex.change,
      prefix: '',
      path: '/airfare-index',
      format: (v: number) => v.toFixed(1)
    },
    {
      icon: TrendingUp,
      label: t.todaysChangeKpi,
      value: data.averageFare.value,
      change: data.averageFare.change,
      prefix: '₹ ',
      path: '/price-trends',
      format: (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })
    },
    {
      icon: Plane,
      label: t.activeFlightsKpi,
      value: data.flightsTracked.value,
      change: data.flightsTracked.change,
      prefix: '',
      path: '/search',
      format: (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })
    },
    {
      icon: Map,
      label: t.monitoredRoutesKpi,
      value: data.routesTracked.value,
      change: data.routesTracked.change,
      prefix: '',
      path: '/routes',
      format: (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <ScrollReveal key={index} delay={index * 0.1}>
          <div 
            onClick={() => navigate(kpi.path)}
            className="bg-[#12141C]/80 backdrop-blur-md rounded-[16px] border border-white/[0.08] p-6 flex flex-col relative overflow-hidden group hover:border-white/[0.18] hover:bg-[#161824] hover:scale-[1.01] transition-all cursor-pointer shadow-sm hover:shadow-lg"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-full pointer-events-none group-hover:bg-cyan-500/[0.05] transition-colors" />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08] text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40 group-hover:text-cyan-300 transition-all">
                <kpi.icon size={22} />
              </div>
              <span className="text-zinc-400 font-medium text-[14px] group-hover:text-zinc-200 transition-colors">{kpi.label}</span>
            </div>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="text-slate-900 dark:text-white text-[32px] font-bold leading-none tracking-tight flex items-center">
                {kpi.prefix}
                <AnimatedNumber value={kpi.value} format={kpi.format} />
              </h3>
              <div className="flex flex-col items-end">
                <span className={`text-[13px] font-bold flex items-center gap-1 ${kpi.change >= 0 ? 'text-emerald-600 dark:text-green-400' : 'text-rose-600 dark:text-red-400'}`}>
                  {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">vs. last week</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

