import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight } from 'lucide-react';

export function AirfareVsCPI() {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Calculator size={16} className="text-emerald-600" />
            <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
              CPI Augmentation Signal
            </h3>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold font-mono">
            Research Metric
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            High-frequency price quotes captured by AeroNex serve as an advance analytical proxy for official CPI Transport & Communication inflation trends.
          </p>

          <div className="space-y-2 p-3 bg-slate-50 dark:bg-[#0B101D] rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">AeroNex Airfare Index:</span>
              <span className="font-mono font-bold text-[#0F2A4A] dark:text-white">124.8 (Base 2024=100)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Official CPI Transport:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">118.2 (Ref: 2024=100)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Index Divergence / Spread:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+6.6 pts (Airfare Lead)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          Independent research indicator
        </span>
        <button 
          onClick={() => navigate('/cpi-analytics')}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          Explore CPI Analytics <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
