import { Database, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export function DataIngestionMonitor() {
  const { data: freshness } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    refetchInterval: 5000,
  });

  const isLive = freshness?.status === 'live';

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
          <Database size={14} className="text-cyan-400" />
          Data Pipeline
        </h3>
        {isLive ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Operational
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
            <AlertTriangle size={10} />
            Degraded
          </span>
        )}
      </div>

      <div className="space-y-3 flex-1">
        {/* Source Statuses */}
        <div className="grid grid-cols-3 gap-2">
          {['Airline Sources', 'OTA Sources', 'API Sources'].map((src, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 flex flex-col items-center justify-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider text-center">{src}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/[0.08] space-y-2 mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-500">Last successful collection</span>
            <span className="text-[11px] text-white font-mono flex items-center gap-1">
              <Activity size={10} className="text-cyan-500" /> 12 sec ago
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-500">Records processed</span>
            <span className="text-[11px] text-white font-mono">2.4M</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-500">Success rate</span>
            <span className="text-[11px] text-emerald-400 font-bold font-mono">98.7%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
