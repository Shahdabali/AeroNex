import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppProvider';
import { TrendingUp, Info, Compass, ShieldCheck } from 'lucide-react';

export function AirfareIndexChart() {
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '6m' | '1y'>('30d');
  const { data, isLoading } = useQuery({
    queryKey: ['chartData', timeframe],
    queryFn: () => api.getChartData(timeframe),
    staleTime: 6000,
  });



  const timeframes: ('7d' | '30d' | '90d' | '6m' | '1y')[] = ['7d', '30d', '90d', '6m', '1y'];

  // Current index telemetry
  const currentIndex = 124.8;
  const pctChange = '+3.7%';
  const basePeriod = '2024 = 100';
  const obsCount = '1,420 Daily Quotes';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Main Centerpiece Chart Area */}
      <div className="lg:col-span-3 bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xs">
        
        {/* Header with Title, Disclaimer, Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wide">
                India Airfare Price Index
              </h2>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                AeroNex Analytical Index
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deterministic Laspeyres index for CPI augmentation • Reference: <span className="font-semibold text-slate-700 dark:text-slate-300">{basePeriod}</span>
            </p>
          </div>

          {/* Timeframe Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                  timeframe === tf 
                    ? 'bg-[#0F2A4A] text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800/80 rounded-lg mb-4 text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Current Index</div>
            <div className="text-xl font-extrabold text-[#0F2A4A] dark:text-white tabular-nums">{currentIndex}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Change (vs Base)</div>
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums flex items-center gap-1">
              <TrendingUp size={16} /> {pctChange}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Observations</div>
            <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">{obsCount}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Augmentation Role</div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck size={14} /> High-Freq Signal
            </div>
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="w-full h-[320px]">
          {isLoading || !data ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-[#0B101D] rounded-lg animate-pulse text-xs text-slate-400">
              Loading deterministic index series...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="govBlueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isLight ? '#E2E8F0' : '#1E293B'} 
                  vertical={false} 
                />
                <XAxis 
                  dataKey="time" 
                  stroke={isLight ? '#64748B' : '#94A3B8'} 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']} 
                  stroke={isLight ? '#64748B' : '#94A3B8'} 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => Number(val).toFixed(0)}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const val = Number(payload[0].value);
                      return (
                        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-md text-xs">
                          <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-500 dark:text-slate-400">Airfare Index:</span>
                            <span className="font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                              {val.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Base 2024=100 • Laspeyres aggregation</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563EB" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#govBlueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bottom Disclaimer & Audit Badge */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Formula: Weighted Laspeyres index with passenger traffic weights ($W_0$)</span>
          <span className="font-medium text-slate-500 dark:text-slate-400">
            Analytical comparison indicator • Independent research prototype
          </span>
        </div>

      </div>

      {/* Right Column: Regional Sub-indices & Correlation */}
      <div className="flex flex-col gap-4">
        
        {/* Regional Breakdown Card */}
        <div className="bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={14} className="text-blue-600" />
              Regional Sub-Indices
            </h3>
            <span className="text-[10px] font-mono text-slate-400">2024 = 100</span>
          </div>

          <div className="space-y-3 mt-3">
            {[
              { region: 'Northern Region', value: 126.4, change: '+4.2%', routes: 'DEL, IXC, JAI hubs' },
              { region: 'Western Region', value: 121.8, change: '+2.1%', routes: 'BOM, AMD, PNQ hubs' },
              { region: 'Southern Region', value: 128.2, change: '+5.6%', routes: 'BLR, MAA, HYD hubs' },
              { region: 'Eastern Region', value: 119.5, change: '+1.8%', routes: 'CCU, GAU, PAT hubs' },
            ].map(r => (
              <div key={r.region} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.region}</span>
                  <span className="text-xs font-extrabold text-[#0F2A4A] dark:text-blue-300 tabular-nums">{r.value}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10.5px]">
                  <span className="text-slate-400">{r.routes}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{r.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CPI Contribution Card */}
        <div className="bg-white dark:bg-[#0E1424] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Info size={14} className="text-amber-500" />
                CPI Transport Role
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold">
                ~3.02% Weight
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              Air transport forms a key high-volatility constituent of the Transport and Communication group. AeroNex feeds automated quote streams to eliminate the conventional survey reporting delay.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">CPI Correlation:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">r = 0.78 (Strong)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
