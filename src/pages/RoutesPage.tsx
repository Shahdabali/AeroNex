import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Search, ArrowRight, TrendingUp, TrendingDown, Sparkles, X, ShieldAlert, Calendar, Lightbulb, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';

export function RoutesPage() {
  usePageTitle('Routes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);

  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      try {
        const live = await api.getRoutes();
        if (Array.isArray(live) && live.length > 0) {
          return live.map((r: any, idx: number) => {
            const [origin, destination] = r.route.split('-');
            const change = r.previousFare ? Math.round(((r.currentFare - r.previousFare) / r.previousFare) * 100) : 0;
            return {
              id: idx + 1,
              origin: origin || 'DEL',
              destination: destination || 'BOM',
              originName: origin || 'DEL',
              destName: destination || 'BOM',
              price: r.currentFare,
              change,
              airlines: 'IndiGo, Air India, Vistara'
            };
          });
        }
      } catch {}
      return [
        { id: 1, origin: 'DEL', destination: 'BOM', originName: 'New Delhi', destName: 'Mumbai', price: 5420, change: 12, airlines: 'IndiGo, Air India' },
        { id: 2, origin: 'BOM', destination: 'BLR', originName: 'Mumbai', destName: 'Bengaluru', price: 4860, change: 8, airlines: 'Vistara, IndiGo' },
        { id: 3, origin: 'DEL', destination: 'BLR', originName: 'New Delhi', destName: 'Bengaluru', price: 6230, change: 6, airlines: 'Air India, Akasa' },
        { id: 4, origin: 'MAA', destination: 'DEL', originName: 'Chennai', destName: 'New Delhi', price: 4150, change: -5, airlines: 'IndiGo, SpiceJet' },
        { id: 5, origin: 'HYD', destination: 'DEL', originName: 'Hyderabad', destName: 'New Delhi', price: 5780, change: -3, airlines: 'Vistara, IndiGo' }
      ];
    }
  });

  const aiAnalysisMutation = useMutation({
    mutationFn: async (routeKey: string) => {
      return api.routeAnalysis(routeKey);
    }
  });

  const handleOpenAIAnalysis = (route: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedRoute(route);
    const key = `${route.origin}-${route.destination}`;
    aiAnalysisMutation.mutate(key);
  };

  const filteredRoutes = routes.filter((r: any) => 
    `${r.origin} ${r.destination} ${r.originName} ${r.destName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Tracked Aviation Routes</h1>
            <p className="text-slate-400 text-sm">Real-time monitored corridors across India with instant AeroNex AI analysis.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search routes or cities..."
              className="bg-[#0A1838] border border-slate-700 rounded-xl text-white pl-10 pr-4 py-2 w-64 outline-none focus:border-[#1788FF]"
            />
          </div>
        </div>

        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#0A1838]/50 text-slate-400 text-sm">
              <tr>
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium">Current Fare</th>
                <th className="p-4 font-medium">Movement</th>
                <th className="p-4 font-medium">Operating Carriers</th>
                <th className="p-4 font-medium text-right">AeroNex AI</th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-slate-700/50">
              {filteredRoutes.map((route: any) => (
                <tr 
                  key={route.id} 
                  onClick={() => handleOpenAIAnalysis(route)}
                  className="hover:bg-blue-500/5 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 font-bold text-lg">
                        {route.origin} <ArrowRight className="w-4 h-4 text-slate-500" /> {route.destination}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {route.originName} to {route.destName}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-cyan-400 text-base">₹{route.price.toLocaleString()}</td>
                  <td className="p-4">
                    <div className={`flex items-center gap-1 font-medium ${route.change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {route.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(route.change)}%
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{route.airlines}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => handleOpenAIAnalysis(route, e)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-[#1788FF]/20 border border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-[#1788FF] text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Route Analysis Modal */}
        {selectedRoute && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#071330] border border-blue-500/30 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedRoute.origin} → {selectedRoute.destination}
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AeroNex AI Route Analysis</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{selectedRoute.originName} to {selectedRoute.destName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRoute(null)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="py-5">
                {aiAnalysisMutation.isPending && (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold">AeroNex AI is performing corridor analysis...</p>
                    <p className="text-slate-500 text-xs">Evaluating carrier pricing distributions and booking windows</p>
                  </div>
                )}

                {aiAnalysisMutation.isError && (
                  <div className="py-8 flex flex-col items-center text-center gap-3">
                    <ShieldAlert className="w-10 h-10 text-red-400" />
                    <p className="text-red-500 dark:text-red-400 text-sm font-semibold">AeroNex AI analysis temporarily unavailable.</p>
                    <button 
                      onClick={() => aiAnalysisMutation.mutate(`${selectedRoute.origin}-${selectedRoute.destination}`)}
                      className="mt-2 px-4 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500 text-blue-600 dark:text-white text-xs flex items-center gap-1.5 cursor-pointer hover:bg-blue-500/30 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Analysis
                    </button>
                  </div>
                )}

                {aiAnalysisMutation.data && !aiAnalysisMutation.isPending && (
                  <div className="flex flex-col gap-4">
                    {/* Key metrics grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#0A1838] p-3.5 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                          Price Trajectory
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {aiAnalysisMutation.data.priceTrend || 'Stable / Moderate Fluctuations'}
                        </div>
                      </div>

                      <div className="bg-[#0A1838] p-3.5 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                          Optimal Booking Window
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {aiAnalysisMutation.data.bestBookingWindow || '14-21 days ahead'}
                        </div>
                      </div>
                    </div>

                    {/* Strategic recommendation */}
                    <div className="bg-gradient-to-r from-blue-900/15 to-cyan-900/10 p-4 rounded-xl border border-cyan-500/30">
                      <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                        <Lightbulb className="w-4 h-4" />
                        Strategic Advice
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm leading-snug">
                        {aiAnalysisMutation.data.recommendation}
                      </p>
                    </div>

                    {/* Deep explanation */}
                    <div className="bg-[#0A1838] p-4 rounded-xl border border-slate-700/50">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Market Context</h4>
                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                        {aiAnalysisMutation.data.explanation}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                        {aiAnalysisMutation.data.currentSituation}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 text-center">
                      AI predictions are estimates based on available airfare data and are not guaranteed.
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button 
                  onClick={() => setSelectedRoute(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
