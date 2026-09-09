import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AirfareIndexChart() {
  const [timeframe, setTimeframe] = useState('24h');
  const { data, isLoading } = useQuery({
    queryKey: ['chartData', timeframe],
    queryFn: () => api.getChartData(timeframe),
    refetchInterval: 5000,
  });

  const timeframes = ['24h', '7d', '30d', '6m', '1y'];

  return (
    <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-6 h-[420px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <h3 className="text-white text-[18px] font-bold">India Airfare Price Index</h3>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE TICKER 5s
          </span>
        </div>
        <div className="flex bg-[#06112a] rounded-lg p-1 border border-slate-800">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                timeframe === tf 
                  ? 'bg-[#1788FF] text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {isLoading || !data ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#1788FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A1838',
                  border: '1px solid rgba(23,136,255,0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                formatter={(value: any) => [`${value}`, 'Airfare Index']}
                labelFormatter={(label) => `${label} (10 Sep)`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#1788FF" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#1788FF', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
