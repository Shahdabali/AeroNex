import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AnomalyMonitor() {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={16} className="text-rose-600" />
            <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
              Airfare Anomaly Monitor
            </h3>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[9px] font-bold font-mono border border-rose-200">
            Z ≥ 2.5 Active
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-white text-sm">Delhi → Mumbai (DEL–BOM)</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
              HIGH ANOMALY (+58%)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-50 dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-sans">Normal Range</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">₹3,800 – ₹6,200</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-sans">Observed Fare</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">₹9,850</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
            <span className="font-bold block mb-0.5">Statistical Note:</span>
            Potential demand/capacity/booking-horizon driven movement. Requires secondary regulatory validation under DGCA Rule 135.
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          Evaluated against rolling 30d median
        </span>
        <button 
          onClick={() => navigate('/anomalies')}
          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
        >
          View Anomaly Register <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
