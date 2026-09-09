import { BarChart3, TrendingUp, Plane, Map } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export function KPIGrid() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 10000,
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
      label: 'Airfare Index',
      value: data.airfareIndex.value,
      change: data.airfareIndex.change,
      prefix: '',
      path: '/airfare-index'
    },
    {
      icon: TrendingUp,
      label: 'Average Fare',
      value: data.averageFare.value.toLocaleString(),
      change: data.averageFare.change,
      prefix: '₹ ',
      path: '/price-trends'
    },
    {
      icon: Plane,
      label: 'Flights Tracked',
      value: data.flightsTracked.value.toLocaleString(),
      change: data.flightsTracked.change,
      prefix: '',
      path: '/search'
    },
    {
      icon: Map,
      label: 'Routes Tracked',
      value: data.routesTracked.value.toLocaleString(),
      change: data.routesTracked.change,
      prefix: '',
      path: '/routes'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          onClick={() => navigate(kpi.path)}
          className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/50 hover:bg-[#0C1F4A] hover:scale-[1.01] transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#1788FF]/5 rounded-bl-full pointer-events-none group-hover:bg-[#1788FF]/15 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#132A60] flex items-center justify-center border border-blue-500/30 text-[#1788FF] group-hover:bg-[#1788FF] group-hover:text-white transition-all">
              <kpi.icon size={24} />
            </div>
            <span className="text-slate-400 font-medium text-[15px] group-hover:text-slate-200 transition-colors">{kpi.label}</span>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <h3 className="text-white text-[32px] font-bold leading-none tracking-tight">
              {kpi.prefix}{kpi.value}
            </h3>
            <div className="flex flex-col items-end">
              <span className={`text-[13px] font-bold flex items-center gap-1 ${kpi.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}%
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">vs. last week</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
