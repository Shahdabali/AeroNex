import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Percent, TrendingUp } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const mockCPIData = [
  { month: 'Jan', airfare: 110, cpi: 108 },
  { month: 'Feb', airfare: 115, cpi: 109 },
  { month: 'Mar', airfare: 120, cpi: 110 },
  { month: 'Apr', airfare: 118, cpi: 111 },
  { month: 'May', airfare: 125, cpi: 112 },
  { month: 'Jun', airfare: 135, cpi: 113 },
  { month: 'Jul', airfare: 142, cpi: 114 },
  { month: 'Aug', airfare: 138, cpi: 115 },
];

export function CPIAnalytics() {
  usePageTitle('CPI Analytics');
  const [period, setPeriod] = useState('YTD');

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">CPI Analytics</h1>
            <p className="text-slate-400 text-sm">Compare Airfare Index movements against general Consumer Price Index.</p>
          </div>
          <div className="flex bg-[#0A1838] border border-slate-700 rounded-xl overflow-hidden">
            <button className={`px-4 py-2 ${period === '1Y' ? 'text-white bg-blue-500/20' : 'text-slate-400 hover:text-white transition-colors'}`} onClick={() => setPeriod('1Y')}>1Y</button>
            <button className={`px-4 py-2 ${period === 'YTD' ? 'text-white bg-blue-500/20' : 'text-slate-400 hover:text-white transition-colors'}`} onClick={() => setPeriod('YTD')}>YTD</button>
            <button className={`px-4 py-2 ${period === '5Y' ? 'text-white bg-blue-500/20' : 'text-slate-400 hover:text-white transition-colors'}`} onClick={() => setPeriod('5Y')}>5Y</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
            <div className="flex items-center gap-3 mb-4 text-[#1788FF]">
              <Activity className="w-5 h-5" />
              <h3 className="font-medium text-white">Airfare Index</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">138.4</div>
            <div className="text-sm text-red-400 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +25.8% YoY</div>
          </div>
          
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Percent className="w-5 h-5" />
              <h3 className="font-medium text-white">General CPI</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">115.0</div>
            <div className="text-sm text-emerald-400 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +6.5% YoY</div>
          </div>

          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
            <div className="flex items-center gap-3 mb-4 text-orange-400">
              <Activity className="w-5 h-5" />
              <h3 className="font-medium text-white">Spread</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">23.4 pts</div>
            <div className="text-sm text-slate-400">Airfare growth exceeds CPI</div>
          </div>
        </div>

        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Airfare Index vs CPI</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockCPIData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="airfare" name="Airfare Index" stroke="#1788FF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cpi" name="General CPI" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
