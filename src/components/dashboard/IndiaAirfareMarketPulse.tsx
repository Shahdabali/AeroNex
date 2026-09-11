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
    refetchInterval: 5000,
  });

  const routes = Array.isArray(routeChanges) ? routeChanges.slice(0, 8) : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <RegionalMap />
      </div>
      
      <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 flex flex-col h-full max-h-[460px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-zinc-400 text-[12px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            Live Route Telemetry
          </h3>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Polling
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            routes.map((route: any, i: number) => {
              const isIncrease = route.change > 0;
              return (
                <div 
                  key={i} 
                  onClick={() => navigate('/routes')}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer flex flex-col gap-2 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Plane size={12} className="text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                      {route.route}
                    </span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      isIncrease ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {isIncrease ? '+' : ''}{route.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 uppercase tracking-widest">Current Fare</span>
                    <span className="text-zinc-300 font-mono">₹{route.currentFare.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <button 
          onClick={() => navigate('/routes')}
          className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors w-full group"
        >
          View Complete Telemetry <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
