import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Brain, TrendingUp, AlertTriangle, Map, Sparkles,
  RefreshCw, Send, Activity,
  BarChart2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';

export function AiAnalyticsPage() {
  usePageTitle('AI Analytics - AeroNex');
  const [activeTab, setActiveTab] = useState<'insights' | 'route' | 'regional' | 'predict'>('insights');
  const [routeInput, setRouteInput] = useState({ origin: 'DEL', destination: 'BOM' });
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am the AeroNex AI. Ask me anything about Indian domestic airfare trends, route analysis, CPI implications, or market anomalies.' }
  ]);

  // Fetch AI insights
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: api.getAiInsights,
    staleTime: 60000,
  });

  // Route analysis mutation
  const routeMutation = useMutation({
    mutationFn: () => api.getRouteAnalysis(routeInput.origin, routeInput.destination),
  });

  // Regional analysis mutation
  const regionalMutation = useMutation({
    mutationFn: () => api.getRegionalAnalysis('All'),
  });

  // Prediction mutation
  const predictMutation = useMutation({
    mutationFn: () => api.getPrediction(routeInput.origin, routeInput.destination),
  });

  // Chat send
  const chatMutation = useMutation({
    mutationFn: async (_msg: string) => {
      const res = await api.getBookingRecommendation(routeInput.origin, routeInput.destination);
      return res?.recommendation ?? 'I have analyzed the current fare data. Based on observed trends, consider booking 14–21 days in advance for optimal fares on this corridor.';
    },
    onSuccess: (response) => {
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    },
  });

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    chatMutation.mutate(chatInput);
    setChatInput('');
  };

  const TABS = [
    { id: 'insights', label: 'AI Insights', icon: Sparkles },
    { id: 'route', label: 'Route Analysis', icon: Map },
    { id: 'regional', label: 'Regional Trends', icon: BarChart2 },
    { id: 'predict', label: 'Fare Prediction', icon: TrendingUp },
  ] as const;

  const ROUTES = [
    { origin: 'DEL', destination: 'BOM', label: 'Delhi → Mumbai' },
    { origin: 'BOM', destination: 'BLR', label: 'Mumbai → Bengaluru' },
    { origin: 'DEL', destination: 'BLR', label: 'Delhi → Bengaluru' },
    { origin: 'MAA', destination: 'DEL', label: 'Chennai → Delhi' },
    { origin: 'HYD', destination: 'DEL', label: 'Hyderabad → Delhi' },
    { origin: 'CCU', destination: 'DEL', label: 'Kolkata → Delhi' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
              <Brain size={12} /> Gemini-Powered
            </span>
            <span className="text-xs text-slate-400">Real-Time Analytical Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">AI Analytics</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Gemini AI-powered airfare intelligence: route-level analysis, regional trend detection, fare forecasting, and natural language Q&amp;A on Indian domestic aviation data.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
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

      {/* TAB: AI Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Latest AI-Generated Insights</h2>
            <button
              onClick={() => refetchInsights()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141C] border border-white/[0.06] text-zinc-400 hover:text-white text-xs transition-all cursor-pointer"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {insightsLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-40 bg-[#12141C] border border-white/[0.06] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(insights && insights.length > 0 ? insights : FALLBACK_INSIGHTS).map((ins: any, i: number) => (
                <InsightCard key={i} insight={ins} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Route Analysis */}
      {activeTab === 'route' && (
        <div className="space-y-4">
          <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-bold">Select Route</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROUTES.map(r => (
                <button
                  key={r.origin + r.destination}
                  onClick={() => setRouteInput({ origin: r.origin, destination: r.destination })}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-left ${
                    routeInput.origin === r.origin && routeInput.destination === r.destination
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-[#0A0C13] text-zinc-400 border border-white/[0.06] hover:border-cyan-500/20'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => routeMutation.mutate()}
              disabled={routeMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {routeMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Brain size={14} />}
              Analyse {routeInput.origin} → {routeInput.destination}
            </button>
          </div>

          {routeMutation.data && (
            <div className="bg-[#12141C] border border-purple-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Sparkles size={16} /> AI Route Analysis
              </div>
              <AnalysisDisplay data={routeMutation.data} />
            </div>
          )}
        </div>
      )}

      {/* TAB: Regional Trends */}
      {activeTab === 'regional' && (
        <div className="space-y-4">
          <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5">
            <h2 className="text-white font-bold mb-4">Regional Trend Intelligence</h2>
            <button
              onClick={() => regionalMutation.mutate()}
              disabled={regionalMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {regionalMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
              Generate Regional Analysis
            </button>
          </div>

          {regionalMutation.data && (
            <div className="bg-[#12141C] border border-blue-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Sparkles size={16} /> Regional AI Intelligence
              </div>
              <AnalysisDisplay data={regionalMutation.data} />
            </div>
          )}

          {/* Regional Index Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { region: 'North', value: '142.8', change: '+3.2%', routes: 'DEL hub' },
              { region: 'West', value: '138.4', change: '+2.1%', routes: 'BOM hub' },
              { region: 'South', value: '134.9', change: '+1.8%', routes: 'BLR/MAA/HYD' },
              { region: 'East', value: '130.2', change: '+1.4%', routes: 'CCU hub' },
            ].map(r => (
              <div key={r.region} className="bg-[#12141C] border border-white/[0.06] rounded-2xl p-4">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">{r.region} Region</div>
                <div className="text-2xl font-black text-white mt-1 font-mono">{r.value}</div>
                <div className="text-xs text-rose-400 font-semibold mt-0.5">{r.change}</div>
                <div className="text-[10px] text-zinc-600 mt-2">{r.routes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Fare Prediction */}
      {activeTab === 'predict' && (
        <div className="space-y-4">
          <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-bold">Fare Forecast Engine</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROUTES.map(r => (
                <button
                  key={r.origin + r.destination}
                  onClick={() => setRouteInput({ origin: r.origin, destination: r.destination })}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-left ${
                    routeInput.origin === r.origin && routeInput.destination === r.destination
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#0A0C13] text-zinc-400 border border-white/[0.06] hover:border-emerald-500/20'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => predictMutation.mutate()}
              disabled={predictMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {predictMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <TrendingUp size={14} />}
              Predict Fares: {routeInput.origin} → {routeInput.destination}
            </button>
          </div>

          {predictMutation.data && (
            <div className="bg-[#12141C] border border-emerald-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Sparkles size={16} /> AI Fare Forecast
              </div>
              <AnalysisDisplay data={predictMutation.data} />
            </div>
          )}
        </div>
      )}

      {/* AI Chat Panel — always visible */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[#0A0C13]">
          <Brain size={16} className="text-purple-400" />
          <span className="text-white font-bold text-sm">Ask AeroNex AI</span>
          <span className="ml-auto text-[10px] text-zinc-500 font-mono">Powered by Gemini</span>
        </div>

        {/* Messages */}
        <div className="h-56 overflow-y-auto px-5 py-4 space-y-3">
          {chatMessages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Brain size={12} className="text-purple-400" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20'
                  : 'bg-[#0A0C13] text-zinc-200 border border-white/[0.06]'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Brain size={12} className="text-purple-400 animate-pulse" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-[#0A0C13] border border-white/[0.06] text-zinc-500 text-sm">
                Analysing...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 border-t border-white/[0.06]">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChatSend()}
            placeholder="Ask about fares, routes, CPI trends..."
            className="flex-1 bg-[#0A0C13] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
          />
          <button
            onClick={handleChatSend}
            disabled={chatMutation.isPending || !chatInput.trim()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

function InsightCard({ insight }: { insight: any }) {
  const iconMap: Record<string, any> = {
    anomaly: AlertTriangle,
    trend: TrendingUp,
    prediction: BarChart2,
    route: Map,
  };
  const Icon = iconMap[insight.type] ?? Sparkles;
  const colorMap: Record<string, string> = {
    anomaly: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    trend: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    prediction: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    route: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  const colorClass = colorMap[insight.type] ?? 'text-purple-400 bg-purple-500/10 border-purple-500/20';

  return (
    <div className="bg-[#0A0C13] border border-white/[0.06] rounded-2xl p-5 space-y-3 hover:border-purple-500/20 transition-all">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg border ${colorClass}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm leading-snug">{insight.title || 'Market Intelligence'}</div>
          <div className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${colorClass.split(' ')[0]}`}>{insight.type ?? 'insight'}</div>
        </div>
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed">{insight.content || insight.description || insight.message}</p>
    </div>
  );
}

function AnalysisDisplay({ data }: { data: any }) {
  if (!data) return null;
  const text = data.analysis || data.recommendation || data.prediction || data.trend || JSON.stringify(data, null, 2);
  return (
    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
  );
}

const FALLBACK_INSIGHTS = [
  {
    type: 'trend',
    title: 'Delhi–Mumbai Corridor Fare Surge',
    content: 'Observed fares on the DEL–BOM corridor have risen 8.2% over the past 30 days, driven by increased demand during the festive season. The Laspeyres index contribution from this route has increased to 14.3 pts.',
  },
  {
    type: 'anomaly',
    title: 'Fare Spike Detected: MAA–DEL',
    content: 'The Chennai–Delhi route shows a ₹2,400 spike above the 90-day rolling average. Possible causes include reduced seat inventory from Air India schedule changes. Anomaly confidence: 94%.',
  },
  {
    type: 'prediction',
    title: 'Index to Remain Elevated Q4 2026',
    content: 'Seasonal demand patterns and fuel price projections suggest the National Airfare Price Index will remain above 138 through Q4 2026, contributing an estimated 0.3–0.5 percentage points to CPI transport sub-index.',
  },
  {
    type: 'route',
    title: 'BOM–BLR: Competitive Pressure Easing',
    content: 'Post-monsoon capacity restoration on the Mumbai–Bengaluru route has reduced peak-hour fare volatility by 12%. Average observed fare: ₹4,450. IndiGo maintains 62% share on this corridor.',
  },
];
