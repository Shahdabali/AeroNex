import { useState } from 'react';
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAiInsights } from '../../hooks/useMarket';
import { LoadingBlock, ErrorBlock } from '../StateViews';

export function QuickInsights() {
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useAiInsights();
  const [expanded, setExpanded] = useState<string | null>(null);
  const insights: any[] = Array.isArray(data) ? data : [];
  const top = insights[0];

  return (
    <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] hover:border-cyan-500/30 p-6 h-full flex flex-col transition-colors group">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
          <Sparkles size={14} />
        </div>
        <h3 className="text-zinc-400 text-[12px] font-bold uppercase tracking-widest">AeroNex Intelligence</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isPending ? (
          <LoadingBlock label="Analysing observed fares…" />
        ) : isError ? (
          <ErrorBlock error={error} onRetry={() => refetch()} title="Insights unavailable" />
        ) : !top ? (
          <p className="text-[13px] text-zinc-400 leading-relaxed">Not enough observations yet to generate an insight.</p>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(expanded === top.id ? null : top.id)}
            aria-expanded={expanded === top.id}
            className="text-left cursor-pointer"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1">{top.title}</p>
            <p className="text-[14px] text-white leading-relaxed font-medium">{top.content}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-zinc-400">
              Why this? <ChevronDown size={12} className={expanded === top.id ? 'rotate-180' : ''} />
            </span>
            {expanded === top.id && (
              <p className="mt-2 text-[12px] text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-2">
                Generated from the fares observed by the AeroNex pipeline and the latest index calculation
                {top.source === 'gemini' ? ', then phrased by Gemini using only that data' : ' using rule-based analytics'}.
                Insights describe what was observed; they are not predictions or purchase advice.
              </p>
            )}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/ai-analytics')}
        className="mt-6 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-500 hover:text-cyan-300 transition-colors w-fit cursor-pointer"
      >
        More AI analysis <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
