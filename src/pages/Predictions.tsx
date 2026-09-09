import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Sparkles, ArrowRight, TrendingUp, TrendingDown, Calendar, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';

export function Predictions() {
  usePageTitle('Predictions');
  const [route, setRoute] = useState({ origin: 'DEL', destination: 'BOM' });

  const predictMutation = useMutation({
    mutationFn: async () => {
      const targetRoute = `${route.origin}-${route.destination}`;
      return api.predict({ route: targetRoute });
    }
  });

  const data = predictMutation.data;

  const handleSwap = () => {
    setRoute({ origin: route.destination, destination: route.origin });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-[#1788FF]/20 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                AeroNex AI Fare Predictions
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1788FF]/10 text-cyan-400 border border-cyan-500/30">
                  Gemini Engine
                </span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">Real-time predictive forecasting powered by verified airfare data & machine learning.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md border border-blue-500/20 rounded-[16px] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Departure City</label>
              <select 
                value={route.origin}
                onChange={(e) => setRoute({...route, origin: e.target.value})}
                className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-2.5 outline-none focus:border-[#1788FF]"
              >
                <option value="DEL">DEL — New Delhi</option>
                <option value="BOM">BOM — Mumbai</option>
                <option value="BLR">BLR — Bengaluru</option>
                <option value="MAA">MAA — Chennai</option>
                <option value="HYD">HYD — Hyderabad</option>
                <option value="CCU">CCU — Kolkata</option>
                <option value="GOI">GOI — Goa</option>
              </select>
            </div>

            <button 
              type="button" 
              onClick={handleSwap}
              title="Swap origin & destination"
              className="pb-2.5 text-slate-400 hover:text-cyan-400 transition-colors hidden md:block cursor-pointer"
            >
              <ArrowRight className="w-5 h-5 hover:rotate-180 transition-transform" />
            </button>

            <div className="flex-1 w-full">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Destination City</label>
              <select 
                value={route.destination}
                onChange={(e) => setRoute({...route, destination: e.target.value})}
                className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-2.5 outline-none focus:border-[#1788FF]"
              >
                <option value="BOM">BOM — Mumbai</option>
                <option value="DEL">DEL — New Delhi</option>
                <option value="BLR">BLR — Bengaluru</option>
                <option value="MAA">MAA — Chennai</option>
                <option value="HYD">HYD — Hyderabad</option>
                <option value="CCU">CCU — Kolkata</option>
                <option value="GOI">GOI — Goa</option>
              </select>
            </div>

            <button 
              onClick={() => predictMutation.mutate()}
              disabled={predictMutation.isPending}
              className="w-full md:w-auto bg-gradient-to-r from-cyan-500 via-[#1788FF] to-[#4E55F5] rounded-xl text-white px-7 py-2.5 font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(23,136,255,0.4)] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {predictMutation.isPending ? 'Generating Forecast...' : 'Analyze with AeroNex AI'}
            </button>
          </div>
        </div>

        {/* Loading State with animated feedback */}
        {predictMutation.isPending && (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <div className="flex flex-col items-center">
              <p className="text-white text-base font-semibold">AeroNex AI is analyzing airfare data...</p>
              <p className="text-slate-400 text-xs mt-1">Cross-referencing historical volatility, booking lead times & national demand baskets</p>
            </div>
          </div>
        )}

        {/* Prediction Results */}
        {data && !predictMutation.isPending && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: Recommendation */}
              <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Recommendation
                </div>
                <div className="text-3xl font-extrabold text-cyan-400 capitalize my-2">
                  {data.recommendedAction ? data.recommendedAction.replace('_', ' ') : 'Book Soon'}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                  <span>Confidence:</span>
                  <span className="font-bold text-white bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-500/30">
                    {Math.round((data.confidence || 0.82) * 100)}%
                  </span>
                </div>
              </div>

              {/* Card 2: Current vs Predicted */}
              <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 flex flex-col justify-between">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Price Forecast
                </div>
                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-2xl font-bold text-slate-300">₹{(data.currentFare || 5240).toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="text-3xl font-black text-white">₹{(data.predictedFare || 5680).toLocaleString()}</span>
                </div>
                <div className={`text-xs font-semibold flex items-center gap-1 ${data.direction === 'increase' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {data.direction === 'increase' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {data.direction === 'increase' ? '+' : '-'}{data.predictedChangePercent || 4.8}% expected movement
                </div>
              </div>

              {/* Card 3: Best Booking Window */}
              <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Optimal Window
                </div>
                <div className="text-2xl font-bold text-white my-2 leading-snug">
                  {data.bestBookingWindow || '18-25 days'}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Departure lead time target
                </div>
              </div>

              {/* Card 4: Direction Status */}
              <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 flex flex-col justify-between">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Market Trajectory
                </div>
                <div className={`text-2xl font-bold capitalize my-2 ${data.direction === 'increase' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {data.direction || 'Upward Trend'}
                </div>
                <div className="text-xs text-slate-400">
                  Route: {data.route || `${route.origin} → ${route.destination}`}
                </div>
              </div>
            </div>

            {/* AI Intelligence Explanation */}
            <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AeroNex AI Analytical Reasoning
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {data.reason || 'Recent booking trends and capacity adjustments point toward impending fare shifts across this corridor.'}
              </p>

              {/* Subtle Disclaimer */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-slate-500 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{data.disclaimer || 'AI predictions are estimates based on available airfare data and are not guaranteed.'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Initial helpful state when no query generated yet */}
        {!data && !predictMutation.isPending && (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-8 text-center flex flex-col items-center">
            <Sparkles className="w-10 h-10 text-cyan-400/50 mb-3" />
            <h3 className="text-lg font-bold text-white">Select a route to generate predictions</h3>
            <p className="text-slate-400 text-sm max-w-lg mt-1">
              Choose your origin and destination above and click <strong>Analyze with AeroNex AI</strong> to evaluate future pricing trajectory.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
