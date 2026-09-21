import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Brain, TrendingUp, AlertTriangle, Map, Sparkles, RefreshCw, Send, Activity, BarChart2, ChevronDown } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { INDIAN_AIRPORTS } from '../data/indianAviation';
import { useAiInsights, useRegionalIndex, useRoutes, fmtINR } from '../hooks/useMarket';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../components/StateViews';
import { ReasoningPanel } from '../components/RouteDetailModal';
import { DataSourceBadge } from '../components/DataSourceBadge';

type Tab = 'insights' | 'route' | 'regional' | 'predict';
interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  meta?: string;
  error?: boolean;
  retry?: string;
}

const city = (code: string) => INDIAN_AIRPORTS.find(a => a.code === code)?.city ?? code;

export function AiAnalyticsPage() {
  usePageTitle('AI Analytics - AeroNex');
  const [activeTab, setActiveTab] = useState<Tab>('insights');
  const [route, setRoute] = useState('DEL-BOM');
  const [region, setRegion] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Ask about the fares AeroNex has observed: a corridor (for example "Delhi to Mumbai"), the airfare index, the cheapest route or the biggest recent moves. I answer only from observed data.',
    },
  ]);

  const status = useQuery({ queryKey: ['aiStatus'], queryFn: api.getAIStatus, staleTime: 60_000, retry: 1 });
  const insights = useAiInsights();
  const routes = useRoutes();
  const regional = useRegionalIndex();

  const routeOptions = useMemo(
    () =>
      ((routes.data as any[]) || [])
        .map(r => r.route as string)
        .sort()
        .map(r => {
          const [o, d] = r.split('-');
          return { value: r, label: `${city(o)} → ${city(d)} (${r})` };
        }),
    [routes.data],
  );

  const routeAnalysis = useMutation({ mutationFn: () => api.routeAnalysis(route) });
  const prediction = useMutation({ mutationFn: () => api.predict({ route }) });
  const regionAnalysis = useMutation({ mutationFn: (r: string) => api.regionalAnalysis(r) });

  const chat = useMutation({
    mutationFn: (message: string) => api.askAI(message),
    onSuccess: (res: any) =>
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: res.answer, meta: `${res.source === 'gemini' ? 'Gemini, grounded in observed data' : 'AeroNex rule-based analytics'}${res.dataUsed?.length ? ` · Data: ${res.dataUsed.join('; ')}` : ''}` },
      ]),
    onError: (err: any, message) =>
      setChatMessages(prev => [...prev, { role: 'ai', text: err?.message || 'The AI service is unavailable right now.', error: true, retry: message }]),
  });

  const send = (text: string) => {
    const message = text.trim();
    if (!message || chat.isPending) return;
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    chat.mutate(message);
  };

  const TABS = [
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'route', label: 'Route Analysis', icon: Map },
    { id: 'regional', label: 'Regional Trends', icon: BarChart2 },
    { id: 'predict', label: 'Fare Outlook', icon: TrendingUp },
  ] as const;

  const RoutePicker = (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-400" htmlFor="ai-route">
        Corridor
      </label>
      {routes.isPending ? (
        <LoadingBlock label="Loading tracked corridors…" className="py-2" />
      ) : routes.isError ? (
        <ErrorBlock error={routes.error} onRetry={() => routes.refetch()} title="Couldn't load corridors" />
      ) : routeOptions.length === 0 ? (
        <EmptyBlock title="No corridors tracked yet" description="Corridors appear once the data feed records fares." />
      ) : (
        <select
          id="ai-route"
          value={route}
          onChange={e => {
            setRoute(e.target.value);
            routeAnalysis.reset();
            prediction.reset();
          }}
          className="w-full sm:w-80 bg-[#0A0C13] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {routeOptions.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                <Brain size={12} />
                {status.data?.configured ? 'Gemini-powered' : 'Rule-based analytics'}
              </span>
              <DataSourceBadge />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">AI Analytics</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Route analysis, regional trends and fare outlooks built only from fares AeroNex has observed. Every answer lists the data it used and its caveats.
              {status.data && !status.data.configured && ' Gemini is not configured on this server, so answers come from deterministic analytics.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-[#12141C] text-zinc-400 border border-white/[0.06] hover:text-white hover:border-white/[0.12]'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Latest insights</h2>
              <button
                onClick={() => insights.refetch()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141C] border border-white/[0.06] text-zinc-400 hover:text-white text-xs transition-all cursor-pointer"
              >
                <RefreshCw size={12} className={insights.isFetching ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
            {insights.isPending ? (
              <LoadingBlock label="Analysing observed fares…" />
            ) : insights.isError ? (
              <ErrorBlock error={insights.error} onRetry={() => insights.refetch()} title="Couldn't load insights" />
            ) : !Array.isArray(insights.data) || insights.data.length === 0 ? (
              <EmptyBlock title="Not enough data for insights yet" description="Insights are generated from observed fares. Check back after the next data refresh." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.data.map((ins: any) => (
                  <InsightCard key={ins.id} insight={ins} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROUTE */}
        {activeTab === 'route' && (
          <div className="space-y-4">
            <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-4">
              {RoutePicker}
              <button
                onClick={() => routeAnalysis.mutate()}
                disabled={routeAnalysis.isPending || routeOptions.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {routeAnalysis.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Brain size={14} />}
                Analyse {route}
              </button>
            </div>
            {routeAnalysis.isError && <ErrorBlock error={routeAnalysis.error} onRetry={() => routeAnalysis.mutate()} title="Analysis failed" />}
            {routeAnalysis.data && <RouteAnalysisCard data={routeAnalysis.data as any} />}
          </div>
        )}

        {/* REGIONAL */}
        {activeTab === 'regional' && (
          <div className="space-y-4">
            {regional.isPending ? (
              <LoadingBlock label="Loading regional indices…" />
            ) : regional.isError ? (
              <ErrorBlock error={regional.error} onRetry={() => regional.refetch()} title="Couldn't load regional indices" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {((regional.data as any[]) || []).map(r => (
                  <button
                    key={r.region}
                    type="button"
                    onClick={() => {
                      setRegion(r.region);
                      regionAnalysis.mutate(r.region);
                    }}
                    aria-pressed={region === r.region}
                    className={`text-left bg-[#12141C] border rounded-2xl p-4 cursor-pointer transition-colors ${region === r.region ? 'border-blue-500/50' : 'border-white/[0.06] hover:border-white/[0.16]'}`}
                  >
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">{r.region} region</div>
                    <div className="text-2xl font-black text-white mt-1 font-mono">{r.value || '—'}</div>
                    <div className={`text-xs font-semibold mt-0.5 ${r.change >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {r.change >= 0 ? '+' : ''}
                      {r.change}%
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-2">Click for analysis</div>
                  </button>
                ))}
              </div>
            )}
            {regionAnalysis.isPending && <LoadingBlock label={`Analysing ${region}…`} />}
            {regionAnalysis.isError && <ErrorBlock error={regionAnalysis.error} onRetry={() => region && regionAnalysis.mutate(region)} title="Analysis failed" />}
            {regionAnalysis.data && (
              <div className="bg-[#12141C] border border-blue-500/20 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Activity size={16} /> {(regionAnalysis.data as any).region} region
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{(regionAnalysis.data as any).analysis}</p>
              </div>
            )}
          </div>
        )}

        {/* PREDICT */}
        {activeTab === 'predict' && (
          <div className="space-y-4">
            <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-4">
              {RoutePicker}
              <button
                onClick={() => prediction.mutate()}
                disabled={prediction.isPending || routeOptions.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {prediction.isPending ? <RefreshCw size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                Outlook for {route}
              </button>
            </div>
            {prediction.isError && <ErrorBlock error={prediction.error} onRetry={() => prediction.mutate()} title="Outlook failed" />}
            {prediction.data && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Mini label="Current fare" value={fmtINR((prediction.data as any).currentFare)} />
                  <Mini label="Projected fare" value={fmtINR((prediction.data as any).predictedFare)} />
                  <Mini label="Direction" value={(prediction.data as any).direction} />
                </div>
                <ReasoningPanel data={prediction.data} />
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[#0A0C13]">
            <Brain size={16} className="text-purple-400" />
            <span className="text-white font-bold text-sm">Ask AeroNex AI</span>
            <span className="ml-auto text-[10px] text-zinc-500 font-mono">Answers from observed data only</span>
          </div>

          <div className="h-64 overflow-y-auto px-5 py-4 space-y-3" aria-live="polite">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain size={12} className="text-purple-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20'
                      : m.error
                        ? 'bg-rose-500/10 text-rose-200 border border-rose-500/30'
                        : 'bg-[#0A0C13] text-zinc-200 border border-white/[0.06]'
                  }`}
                >
                  {m.text}
                  {m.meta && <div className="mt-1.5 text-[10px] text-zinc-500">{m.meta}</div>}
                  {m.retry && (
                    <button onClick={() => send(m.retry!)} className="mt-2 text-[11px] font-semibold text-cyan-300 hover:underline cursor-pointer">
                      Try again
                    </button>
                  )}
                </div>
              </div>
            ))}
            {chat.isPending && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Brain size={12} className="text-purple-400 animate-pulse" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-[#0A0C13] border border-white/[0.06] text-zinc-500 text-sm">Analysing…</div>
              </div>
            )}
          </div>

          <form
            className="flex gap-2 px-4 py-3 border-t border-white/[0.06]"
            onSubmit={e => {
              e.preventDefault();
              send(chatInput);
              setChatInput('');
            }}
          >
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              maxLength={500}
              aria-label="Ask a question"
              placeholder="Ask about a corridor, the index, cheapest route…"
              className="flex-1 bg-[#0A0C13] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
            />
            <button
              type="submit"
              aria-label="Send question"
              disabled={chat.isPending || chatInput.trim().length < 2}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#12141C] p-3">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-mono font-bold text-white capitalize">{value}</div>
    </div>
  );
}

function InsightCard({ insight }: { insight: any }) {
  const [open, setOpen] = useState(false);
  const iconMap: Record<string, any> = { alert: AlertTriangle, insight: TrendingUp, recommendation: Sparkles, summary: BarChart2 };
  const colorMap: Record<string, string> = {
    alert: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    insight: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    recommendation: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    summary: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  const Icon = iconMap[insight.type] ?? Sparkles;
  const colorClass = colorMap[insight.type] ?? 'text-purple-400 bg-purple-500/10 border-purple-500/20';

  return (
    <button
      type="button"
      onClick={() => setOpen(o => !o)}
      aria-expanded={open}
      className="text-left bg-[#0A0C13] border border-white/[0.06] rounded-2xl p-5 space-y-3 hover:border-purple-500/20 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg border ${colorClass}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm leading-snug">{insight.title}</div>
          <div className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${colorClass.split(' ')[0]}`}>{insight.type}</div>
        </div>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed">{insight.content}</p>
      {open && (
        <p className="text-[12px] text-zinc-500 border-t border-white/[0.06] pt-2 leading-relaxed">
          Why this? Generated {insight.timestamp ? new Date(insight.timestamp).toLocaleString('en-IN') : 'just now'} from the fares AeroNex has observed and the latest index
          calculation ({insight.source === 'gemini' ? 'phrased by Gemini using only that data' : 'rule-based'}). It describes what was observed and is not a prediction or purchase advice.
        </p>
      )}
    </button>
  );
}

function RouteAnalysisCard({ data }: { data: any }) {
  return (
    <div className="bg-[#12141C] border border-purple-500/20 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-purple-400 font-bold">
        <Sparkles size={16} /> {data.route}
      </div>
      <p className="text-zinc-200 text-sm leading-relaxed">{data.currentSituation}</p>
      <dl className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-zinc-500">Price trend</dt>
          <dd className="text-zinc-300">{data.priceTrend}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-zinc-500">Volatility</dt>
          <dd className="text-zinc-300">{data.volatilityRisk}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[10px] uppercase tracking-widest text-zinc-500">Suggestion</dt>
          <dd className="text-zinc-300">{data.recommendation}</dd>
        </div>
      </dl>
      {data.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Mini label="Observations" value={String(data.stats.observations)} />
          <Mini label="Min" value={fmtINR(data.stats.minFare)} />
          <Mini label="Average" value={fmtINR(data.stats.averageFare)} />
          <Mini label="Max" value={fmtINR(data.stats.maxFare)} />
        </div>
      )}
      <p className="text-[12px] text-zinc-500 leading-relaxed border-t border-white/[0.06] pt-3">
        <strong className="text-zinc-400">Why:</strong> {data.explanation}
      </p>
    </div>
  );
}
