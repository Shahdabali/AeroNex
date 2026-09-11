import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function AirfareVsCPI() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] hover:border-cyan-500/30 p-6 h-full flex flex-col transition-colors group">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-zinc-400 text-[12px] font-bold uppercase tracking-widest">CPI Intelligence</h3>
      </div>

      <div className="flex-1">
        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          Airfare is a dynamic component of consumer travel expenditure. AeroNex provides high-frequency airfare observations that can potentially support analytical augmentation of CPI-related price monitoring.
        </p>

        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-white/[0.04] pb-2">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Airfare Index</span>
            <span className="text-lg font-mono font-bold text-white">140.2</span>
          </div>
          <div className="flex items-end justify-between border-b border-white/[0.04] pb-2">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Monthly Movement</span>
            <span className="text-sm font-mono font-bold text-rose-400">+5.6%</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Observed Volatility</span>
            <span className="text-sm font-bold text-amber-500">Moderate</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => navigate('/cpi-analytics')}
        className="mt-6 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-500 hover:text-cyan-300 transition-colors w-fit"
      >
        Explore CPI Analytics <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
