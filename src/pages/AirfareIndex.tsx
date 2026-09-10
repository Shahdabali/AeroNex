import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Globe } from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { RegionalMap } from '../components/dashboard/RegionalMap';

export function AirfareIndex() {
  usePageTitle('Airfare Index');
  const { data: indexMetrics } = useQuery({
    queryKey: ['airfareIndexMetrics'],
    queryFn: api.getDashboardMetrics
  });

  const { data: regionalData = [] } = useQuery({
    queryKey: ['airfareIndexRegional'],
    queryFn: api.getRegionalIndex
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ['airfareChartData'],
    queryFn: () => api.getChartData('24h')
  });

  const currentIndex = indexMetrics?.airfareIndex?.value ?? 138.4;
  const currentChange = indexMetrics?.airfareIndex?.change ?? 4.2;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Airfare Index</h1>
          <div className="flex bg-[#0A1838] border border-slate-700/60 rounded-xl overflow-hidden">
            <button className="px-4 py-2 text-white bg-[#1788FF] font-semibold text-xs shadow-sm cursor-pointer">24h</button>
            <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer">7d</button>
            <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer">30d</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Current National Index</p>
              <h2 className="text-4xl font-bold text-white">{currentIndex}</h2>
            </div>
            <div className={`flex items-center gap-2 mt-4 ${currentChange >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'} w-max px-3 py-1 rounded-full text-sm font-semibold`}>
              {currentChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{currentChange >= 0 ? `+${currentChange}` : currentChange}% vs baseline</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Index Trend (Live Stream)</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.length > 0 ? chartData : [{ time: '12 AM', value: 120 }, { time: '12 PM', value: 125 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#1788FF" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-1">
            <RegionalMap />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white">Regional Breakdown Corridors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(regionalData.length > 0 ? regionalData : [
                { region: 'North', value: 118.6, change: 2.3 },
                { region: 'West', value: 124.2, change: 3.1 },
                { region: 'East', value: 112.7, change: 1.8 },
                { region: 'South', value: 131.5, change: 4.2 }
              ]).map((r: any, i: number) => (
                <div key={i} className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-5 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Globe className="w-5 h-5 text-[#1788FF]" />
                    </div>
                    <span className={`text-sm font-semibold ${r.change >= 0 ? 'text-emerald-400' : 'text-rose-400'} flex items-center`}>
                      {r.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {r.change >= 0 ? `+${r.change}` : r.change}%
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{r.region} Region</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{r.value}</h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">Live 5s Realtime Stream</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
