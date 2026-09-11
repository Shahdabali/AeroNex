import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export function WelcomeBanner() {
  const { data: freshness } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    refetchInterval: 5000,
  });

  const now = new Date();
  
  return (
    <div className="relative w-full rounded-[16px] overflow-hidden bg-[#0A0C13] border border-white/[0.08] shadow-lg p-7">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-900/10 to-transparent pointer-events-none" />
      <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
      
      {/* Topology overlay SVG (Subtle) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83v58.34h-58.34l-.83-.83V0h58.34zM29.5 29.5L30 30l-.5.5-.5-.5.5-.5z\' fill=\'%231788FF\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Data Streaming
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
            India Airfare <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence</span>
          </h1>
          
          <p className="text-sm text-zinc-400 max-w-xl">
            Real-time analytical view of India's evolving airfare market for macroeconomic monitoring.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Last Updated
          </span>
          <span className="text-[13px] font-mono text-zinc-300">
            {format(now, "dd MMMM yyyy · hh:mm a 'IST'")}
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-cyan-500/80 font-mono">
            <Activity size={12} />
            {freshness?.status === 'live' ? 'Connected to Aggregators' : 'Syncing...'}
          </div>
        </div>

      </div>
    </div>
  );
}
