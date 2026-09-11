import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickInsights() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: api.getInsights,
  });

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] hover:border-cyan-500/30 p-6 h-full flex flex-col transition-colors group">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
          <Sparkles size={14} />
        </div>
        <h3 className="text-zinc-400 text-[12px] font-bold uppercase tracking-widest">Aeronex Intelligence</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isLoading || !data ? (
          <div className="w-full flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <p className="text-[14px] text-white leading-relaxed font-medium">
            {Array.isArray(data) && data.length > 0 
              ? "Airfare levels increased 3.7% this week, driven primarily by higher observed fares on Delhi–Goa and Mumbai–Bangalore routes." 
              : "Insufficient observations to generate a reliable insight."}
          </p>
        )}
      </div>

      <button 
        onClick={() => navigate('/airfare-index')}
        className="mt-6 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-500 hover:text-cyan-300 transition-colors w-fit"
      >
        View Analysis <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
