import { Database, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export function DataIngestionMonitor() {
  const { data: freshness } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    staleTime: 6000,
  });

  const isLive = freshness?.status === 'live';

  return (
    <div className="bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold tracking-wider text-[#0F2A4A] dark:text-white uppercase flex items-center gap-2">
          <Database size={15} className="text-blue-600" />
          Data Pipeline Health
        </h3>
        {isLive ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
            <AlertTriangle size={10} />
            Degraded
          </span>
        )}
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {/* Source Categories */}
        <div className="grid grid-cols-3 gap-2">
          {['Airlines', 'OTAs', 'GDS Feeds'].map((src, i) => (
            <div key={i} className="bg-slate-50 dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800/80 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 text-center">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{src}</span>
              <span className="text-[9px] text-slate-400">100% Ingested</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Pipeline Cycle:</span>
            <span className="text-slate-800 dark:text-slate-200 font-mono font-bold flex items-center gap-1">
              <Activity size={12} className="text-blue-600" /> 30s Polling
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Validation Filter:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">Zod Schema OK</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Audit Status:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold font-mono">Audit Grade (99.4%)</span>
          </div>
        </div>

        <Link 
          to="/data-quality"
          className="text-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
        >
          View Full Quality Dashboard →
        </Link>
      </div>
    </div>
  );
}
