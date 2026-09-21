import { useState } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useRouteChanges, fmtINR } from '../../hooks/useMarket';
import { LoadingBlock, ErrorBlock } from '../StateViews';
import { RouteDetailModal } from '../RouteDetailModal';

/** Routes whose latest fare moved more than this vs. the previous observation are flagged. */
const ANOMALY_THRESHOLD_PCT = 3.5;

export function AnomalyMonitor() {
  const { data, isPending, isError, error, refetch } = useRouteChanges();
  const [open, setOpen] = useState<string | null>(null);
  const flagged = Array.isArray(data) ? data.filter((r: any) => Math.abs(r.change) > ANOMALY_THRESHOLD_PCT) : [];
  const top: any = flagged[0];

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] hover:border-cyan-500/30 p-6 h-full flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-400 text-[12px] font-bold uppercase tracking-widest">Fare Anomalies</h3>
        {flagged.length > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-wider">
            {flagged.length} flagged
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isPending ? (
          <LoadingBlock />
        ) : isError ? (
          <ErrorBlock error={error} onRetry={() => refetch()} />
        ) : !top ? (
          <div className="w-full flex flex-col items-center justify-center text-center">
            <ShieldAlert size={24} className="text-emerald-400/40 mb-2" />
            <span className="text-sm font-semibold text-white">No anomalies</span>
            <p className="text-[11px] text-slate-400 mt-1">No route moved more than {ANOMALY_THRESHOLD_PCT}% on the latest refresh.</p>
          </div>
        ) : (
          <button type="button" onClick={() => setOpen(top.route)} className="flex flex-col text-left cursor-pointer" aria-label={`Open details for ${top.route}`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-rose-500" />
              <span className="text-[12px] font-bold text-rose-500 uppercase tracking-wider">{top.change > 0 ? 'Price spike' : 'Price drop'}</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white mb-4">{top.route}</div>
            <div className="space-y-2.5">
              <Row label="Observed" value={fmtINR(top.currentFare)} />
              <Row label="Previous" value={fmtINR(Math.round(top.currentFare / (1 + top.change / 100)))} />
              <Row label="Change" value={`${top.change > 0 ? '+' : ''}${top.change.toFixed(1)}%`} />
              <p className="text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                Flagged by a fixed {ANOMALY_THRESHOLD_PCT}% move threshold on consecutive observations. Click for details.
              </p>
            </div>
          </button>
        )}
      </div>
      {open && <RouteDetailModal route={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className="text-[13px] font-mono font-bold text-white">{value}</span>
    </div>
  );
}
