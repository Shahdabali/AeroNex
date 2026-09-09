import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { PlaneTakeoff, PlaneLanding, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

export function SecondaryMetrics() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 10000,
  });

  const { data: freshness } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    refetchInterval: 15000,
  });

  if (isLoading || !data) return null;

  const metrics = [
    {
      icon: PlaneLanding,
      label: 'Lowest Fare',
      value: `₹ ${data.secondary?.lowestFare?.fare?.toLocaleString() ?? '1,899'}`,
      subtext: data.secondary?.lowestFare?.route ?? 'BLR → CCU',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/30',
      path: '/search'
    },
    {
      icon: PlaneTakeoff,
      label: 'Highest Fare',
      value: `₹ ${data.secondary?.highestFare?.fare?.toLocaleString() ?? '24,500'}`,
      subtext: data.secondary?.highestFare?.route ?? 'DEL → BOM',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      path: '/routes'
    },
    {
      icon: ArrowUpRight,
      label: 'Biggest Increase',
      value: `+${data.secondary?.biggestIncrease?.change ?? 32.4}%`,
      subtext: data.secondary?.biggestIncrease?.route ?? 'DEL → GOI',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      path: '/price-trends'
    },
    {
      icon: ArrowDownRight,
      label: 'Biggest Decrease',
      value: `${data.secondary?.biggestDecrease?.change ?? -18.7}%`,
      subtext: data.secondary?.biggestDecrease?.route ?? 'BOM → HYD',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/30',
      path: '/price-trends'
    },
    {
      icon: Clock,
      label: 'Data Freshness',
      value: freshness?.status === 'live' ? 'Just now' : '2 min ago',
      subtext: 'Live stream active',
      color: 'text-[#1788FF]',
      bg: 'bg-[#1788FF]/10 border-[#1788FF]/30',
      path: '/routes'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((m, i) => (
        <div 
          key={i} 
          onClick={() => navigate(m.path)}
          className="bg-[#0A1838]/80 border border-slate-700/50 rounded-xl p-4 flex flex-col hover:border-blue-500/40 hover:bg-[#0D1F48] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${m.bg} ${m.color} group-hover:scale-110 transition-transform`}>
              <m.icon size={16} />
            </div>
            <span className="text-[12px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">{m.label}</span>
          </div>
          <span className={`text-[18px] font-bold ${m.color} leading-none mb-1`}>{m.value}</span>
          <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase group-hover:text-slate-400 transition-colors">{m.subtext}</span>
        </div>
      ))}
    </div>
  );
}
