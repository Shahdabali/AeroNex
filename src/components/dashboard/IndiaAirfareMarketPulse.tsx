import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { RegionalMap } from './RegionalMap';
import { ArrowRight, Activity, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function IndiaAirfareMarketPulse() {
  const navigate = useNavigate();
  const { data: routeChanges, isLoading } = useQuery({
    queryKey: ['routeChanges'],
    queryFn: api.getRouteChanges,
    staleTime: 6000,
  });

  const routes = Array.isArray(routeChanges) ? routeChanges.slice(0, 8) : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <RegionalMap />
      </div>
      
      <div className="bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-full max-h-[500px] shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Activity size={15} className="text-blue-600" />
            Active Route Price Swings
          </h3>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            30s Refresh
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-xs">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 py-12">
              Loading active corridor feeds...
            </div>
          ) : (
            routes.map((route: any, i: number) => {
              const isIncrease = route.change > 0;
              return (
                <div 
                  key={i} 
                  onClick={() => navigate('/routes')}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 transition-colors cursor-pointer flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                      <Plane size={13} className="text-blue-600" />
                      {route.route}
                    </span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      isIncrease ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    }`}>
                      {isIncrease ? '+' : ''}{route.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Observed: <strong className="text-slate-800 dark:text-slate-200 font-mono">₹{route.currentFare?.toLocaleString('en-IN')}</strong></span>
                    <span>Prev: ₹{route.previousFare?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button 
          onClick={() => navigate('/routes')}
          className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          View All 184 Routes <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
