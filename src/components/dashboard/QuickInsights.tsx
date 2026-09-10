import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickInsights() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: api.getInsights,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="text-red-400" size={16} />;
      case 'recommendation': return <Lightbulb className="text-yellow-400" size={16} />;
      case 'insight': return <TrendingUp className="text-purple-400" size={16} />;
      default: return <Info className="text-cyan-400" size={16} />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-500/10 border-red-500/20';
      case 'recommendation': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'insight': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="bg-[#12141C]/80 backdrop-blur-md rounded-[16px] border border-white/[0.08] hover:border-white/[0.14] p-6 h-[320px] flex flex-col transition-all shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Sparkles size={18} />
          </div>
          <h3 className="text-white text-[16px] font-bold">AeroNex Market Insights</h3>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Live Realtime
        </span>
      </div>

      <div className="flex-1 overflow-auto pr-2 custom-scrollbar flex flex-col gap-3">
        {isLoading || !data ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          (Array.isArray(data) ? data : []).map((insight: any, i: number) => (
            <div 
              key={i} 
              onClick={() => navigate('/airfare-index')}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#161824]/60 border border-white/[0.06] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all cursor-pointer group"
            >
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${getBg(insight.type)}`}>
                {getIcon(insight.type)}
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[13px] text-slate-200 leading-snug">{insight.content}</span>
              </div>
              <div className="text-slate-600 group-hover:text-cyan-400 transition-colors">
                <span className="text-lg">›</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
