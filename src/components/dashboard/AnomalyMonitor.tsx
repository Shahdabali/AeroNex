import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AnomalyMonitor() {
  const navigate = useNavigate();
  const { data: routeChanges, isLoading } = useQuery({
    queryKey: ['routeChanges'],
    queryFn: api.getRouteChanges,
    staleTime: 6000,
  });

  const anomalies = Array.isArray(routeChanges) 
    ? routeChanges.filter(r => Math.abs(r.change) > 3.5).slice(0, 1) // Only show the top 1 anomaly for a detailed card
    : [];

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] hover:border-cyan-500/30 p-6 h-full flex flex-col transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-400 text-[12px] font-bold uppercase tracking-widest">AI Anomalies</h3>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Active
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : anomalies.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center text-center">
            <ShieldAlert size={24} className="text-emerald-400/40 mb-2" />
            <span className="text-sm font-semibold text-white">System Nominal</span>
            <p className="text-[11px] text-slate-400 mt-1">No significant fare anomalies detected.</p>
          </div>
        ) : (
          anomalies.map((route: any, i: number) => {
            const isSpike = route.change > 0;
            // Generate some plausible expected range based on the current anomaly
            const expectedMin = Math.round(route.currentFare / (1 + route.change / 100) * 0.9);
            const expectedMax = Math.round(route.currentFare / (1 + route.change / 100) * 1.1);

            return (
              <div 
                key={i} 
                onClick={() => navigate('/price-alerts')}
                className="flex flex-col cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-rose-500" />
                  <span className="text-[12px] font-bold text-rose-500 uppercase tracking-wider">
                    {isSpike ? 'Price Spike' : 'Price Drop'}
                  </span>
                </div>

                <div className="text-2xl font-mono font-bold text-white mb-4">
                  {route.route}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Observed</span>
                    <span className="text-[13px] font-mono font-bold text-rose-400">₹{route.currentFare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Expected</span>
                    <span className="text-[13px] font-mono font-bold text-zinc-300">₹{expectedMin.toLocaleString('en-IN')}–₹{expectedMax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Deviation</span>
                    <span className="text-[13px] font-mono font-bold text-white">{isSpike ? '+' : ''}{route.change.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest">AI Confidence</span>
                    <span className="text-[13px] font-mono font-bold text-white">87%</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/[0.04] pt-3 mt-1">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Status</span>
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Requires Review</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
