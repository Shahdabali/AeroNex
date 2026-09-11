import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppProvider';

export function AirfareIndexChart() {
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const [timeframe, setTimeframe] = useState('24h');
  const { data, isLoading } = useQuery({
    queryKey: ['chartData', timeframe],
    queryFn: () => api.getChartData(timeframe),
    staleTime: 6000,
  });

  const timeframes = ['24h', '7d', '30d', '6m', '1y'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[420px]">
      
      {/* Main Chart Area */}
      <div className="lg:col-span-3 bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 h-full flex flex-col transition-all shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-white text-[14px] font-bold uppercase tracking-widest">India Airfare Price Index</h3>
            <span className="text-[9px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Feed
            </span>
          </div>
          <div className="flex bg-[#0E1017] rounded-lg p-1 border border-white/[0.06]">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-micro ${
                  timeframe === tf 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full min-h-[300px]">
          {isLoading || !data ? (
            <div className="w-full h-full flex flex-col justify-between py-6 px-2 animate-pulse">
              <div className="w-full h-px border-b border-dashed border-white/[0.08]" />
              <div className="w-full h-px border-b border-dashed border-white/[0.08]" />
              <div className="w-full h-px border-b border-dashed border-white/[0.08]" />
              <div className="w-full h-px border-b border-dashed border-white/[0.08]" />
              <div className="flex justify-between pt-2">
                <div className="h-2.5 w-12 bg-white/[0.05] rounded" />
                <div className="h-2.5 w-12 bg-white/[0.05] rounded" />
                <div className="h-2.5 w-12 bg-white/[0.05] rounded" />
                <div className="h-2.5 w-12 bg-white/[0.05] rounded" />
                <div className="h-2.5 w-12 bg-white/[0.05] rounded" />
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : 'rgba(255,255,255,0.04)'} vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke={isLight ? '#64748B' : '#52525b'} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                  interval="preserveStartEnd"
                  minTickGap={50}
                  fontFamily="monospace"
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  stroke={isLight ? '#64748B' : '#52525b'} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                  fontFamily="monospace"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#FFFFFF' : '#090A0F',
                    border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.08)' : '0 8px 30px rgba(0,0,0,0.8)',
                    color: isLight ? '#0F172A' : '#FFFFFF'
                  }}
                  itemStyle={{ color: isLight ? '#0F172A' : '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}
                  labelStyle={{ color: isLight ? '#475569' : '#a1a1aa', marginBottom: '4px', fontSize: '12px' }}
                  formatter={(value: any) => [`${value}`, 'Index Value']}
                  labelFormatter={(label) => `${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isLight ? '#0284C7' : '#22d3ee'} 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: isLight ? '#0284C7' : '#22d3ee', stroke: isLight ? '#FFFFFF' : '#090A0F', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Explainer Panel */}
      <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 h-full flex flex-col">
        <h4 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-4">What is the index?</h4>
        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          AeroNex Airfare Price Index tracks changes in observed airfare levels across a configurable basket of Indian domestic routes.
        </p>
        
        <div className="space-y-4 mb-6">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Base Period</div>
            <div className="text-white font-mono font-bold tabular-nums">100.0 <span className="text-zinc-500 text-xs font-normal">(Jan 2026)</span></div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Current</div>
            <div className="text-cyan-400 font-mono font-bold text-xl tabular-nums">140.2</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Change</div>
            <div className="text-rose-400 font-mono font-bold tabular-nums">+40.2%</div>
          </div>
        </div>

        <div className="mt-auto p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Prototype / Experimental Index</div>
          <p className="text-[11px] text-amber-500/80 leading-tight">
            This is an analytical prototype designed to demonstrate potential high-frequency airfare intelligence. Do not use as official MoSPI CPI data.
          </p>
        </div>
      </div>
    </div>
  );
}
