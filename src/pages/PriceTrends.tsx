import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, TrendingDown } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const mockTrendData = [
  { date: '1 Aug', price: 4500 },
  { date: '8 Aug', price: 4200 },
  { date: '15 Aug', price: 4800 },
  { date: '22 Aug', price: 5100 },
  { date: '29 Aug', price: 4600 },
  { date: '5 Sep', price: 4100 },
];

export function PriceTrends() {
  usePageTitle('Price Trends');
  const [period, setPeriod] = useState('30d');

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">Price Trends</h1>
        
        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
            <div className="flex-1">
              <label className="text-slate-400 text-sm mb-1 block">Origin</label>
              <select className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-2 appearance-none">
                <option>DEL - New Delhi</option>
                <option>BOM - Mumbai</option>
                <option>BLR - Bangalore</option>
              </select>
            </div>
            <div className="pb-2 hidden md:block">
              <ArrowRight className="text-slate-500 w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-sm mb-1 block">Destination</label>
              <select className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-2 appearance-none">
                <option>BOM - Mumbai</option>
                <option>DXB - Dubai</option>
                <option>LHR - London</option>
              </select>
            </div>
            <div>
              <button className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-6 py-2 w-full md:w-auto">
                Analyze Trend
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">DEL → BOM Trend</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-[#1788FF]">₹4,100</span>
                <span className="text-emerald-400 flex items-center text-sm bg-emerald-400/10 px-2 py-0.5 rounded">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  12% vs last month
                </span>
              </div>
            </div>
            
            <div className="flex bg-[#0A1838] border border-slate-700 rounded-xl overflow-hidden">
              <button 
                onClick={() => setPeriod('30d')}
                className={`px-4 py-1.5 text-sm ${period === '30d' ? 'text-white bg-blue-500/20' : 'text-slate-400'}`}
              >
                30 Days
              </button>
              <button 
                onClick={() => setPeriod('90d')}
                className={`px-4 py-1.5 text-sm ${period === '90d' ? 'text-white bg-blue-500/20' : 'text-slate-400'}`}
              >
                90 Days
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickMargin={10} />
                <YAxis stroke="#94a3b8" tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`₹${value}`, 'Avg Fare']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#1788FF" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0f172a', stroke: '#1788FF', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#1788FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
