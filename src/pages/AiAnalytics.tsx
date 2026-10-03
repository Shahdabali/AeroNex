import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, Send, BrainCircuit, Activity, Plane, Search, Settings as SettingsIcon } from 'lucide-react';
import { api } from '../services/api';
import { Layout } from '../components/Layout';
import { LoadingBlock } from '../components/StateViews';
import { toast } from 'react-hot-toast';

export function AiAnalytics() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am AeroNex AI, powered by Google Gemini. I have real-time access to the live DGCA dataset and all currently tracked flights. Ask me to analyze a route, summarize pricing trends, or find booking recommendations!' }
  ]);

  const { data: status } = useQuery({
    queryKey: ['aiStatus'],
    queryFn: api.getAIStatus,
    refetchInterval: 10000,
  });

  const chatMutation = useMutation({
    mutationFn: (msg: string) => api.askAI(msg),
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, { role: 'ai', text: data?.data?.answer || data?.answer || (typeof data === 'string' ? data : JSON.stringify(data)) }]);
    },
    onError: (err: any) => {
      toast.error(err.message || 'AI request failed');
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message || 'Failed to connect to AI server.'}` }]);
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || chatMutation.isPending) return;
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    chatMutation.mutate(prompt);
    setPrompt('');
  };

  const isLive = status?.configured && status?.status === 'healthy';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-purple-400" />
              AI Market Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time econometric intelligence powered by Google Gemini</p>
          </div>
          
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${isLive ? 'bg-purple-900/20 border-purple-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-purple-400 animate-pulse' : 'bg-orange-400'}`} />
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLive ? 'text-purple-400' : 'text-orange-400'}`}>
                {isLive ? 'System Online' : 'Fallback Mode'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isLive ? `Using ${status.model || 'Gemini'}` : 'Missing GEMINI_API_KEY'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Quick Tools */}
          <div className="space-y-4">
            <div className="bg-[#0A0C13] border border-white/[0.08] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" /> System Capabilities
              </h2>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-3"><Plane className="text-slate-500 shrink-0" size={18} /> Deep dive into specific O&D pairs (Origin-Destination) with predictive regression.</li>
                <li className="flex gap-3"><Search className="text-slate-500 shrink-0" size={18} /> Ask for the cheapest times to fly based on historical scraping data.</li>
                <li className="flex gap-3"><Sparkles className="text-slate-500 shrink-0" size={18} /> Real-time synthesis of DGCA reports and current basket capacity.</li>
              </ul>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-[#0A0C13] border border-white/[0.08] rounded-xl flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600/20 text-cyan-50 border border-cyan-500/30' 
                      : 'bg-white/5 text-slate-200 border border-white/10'
                  }`}>
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-purple-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">AeroNex AI</span>
                      </div>
                    )}
                    {msg.text.split('\\n').map((line, j) => <p key={j} className="mb-2 last:mb-0">{line}</p>)}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <LoadingBlock label="Analyzing market data..." />
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/[0.08] flex gap-3">
              <input 
                type="text" 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ask about live flight prices or trends..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                disabled={chatMutation.isPending}
              />
              <button 
                type="submit" 
                disabled={!prompt.trim() || chatMutation.isPending}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={16} /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
