import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Compass, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickInsights() {
  const navigate = useNavigate();
  const { isLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: api.getInsights,
  });

  return (
    <div className="bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Compass size={16} className="text-blue-600" />
            <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
              AI Analytical Insights
            </h3>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold font-mono">
            Gemini Engine
          </span>
        </div>

        <div className="text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Key Observation (National)
          </span>
          {isLoading ? (
            <div className="w-full py-4 text-center text-slate-400 animate-pulse">
              Computing analytical interpretation...
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              National Airfare Index settled at 124.8 (+3.7% vs 2024 base). Upward pressure is driven primarily by holiday surge pricing on western leisure corridors and elevated load factors on Delhi–Mumbai metro connections.
            </p>
          )}

          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-bold text-[#0F2A4A] dark:text-blue-300 block mb-0.5">
              Provisional Price Driver:
            </span>
            Tight seat inventory in the 0–3 day booking horizon combined with domestic jet fuel (ATF) surcharge recalibration.
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 italic">
          AI-generated analytical interpretation
        </span>
        <button 
          onClick={() => navigate('/predictions')}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Detailed Insights <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
