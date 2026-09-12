import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { Plane, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppProvider';

export function AirlinesPage() {
  usePageTitle('Airline Market Monitor');
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const [searchTerm, setSearchTerm] = useState('');

  const carriers = [
    {
      name: 'IndiGo (InterGlobe Aviation)',
      code: '6E',
      routesMonitored: 104,
      avgFare: 5240,
      medianFare: 5100,
      volatility: 'Low (4.2%)',
      observations: '42,800',
      marketShare: '62.4%',
      indexMovement: '+3.1%',
      isPositive: true,
      businessModel: 'Low-Cost Carrier (LCC)'
    },
    {
      name: 'Air India (Tata Group)',
      code: 'AI',
      routesMonitored: 85,
      avgFare: 6350,
      medianFare: 6150,
      volatility: 'Moderate (6.8%)',
      observations: '34,200',
      marketShare: '14.8%',
      indexMovement: '+4.5%',
      isPositive: true,
      businessModel: 'Full-Service Carrier (FSC)'
    },
    {
      name: 'Vistara (Tata SIA Airlines)',
      code: 'UK',
      routesMonitored: 42,
      avgFare: 6850,
      medianFare: 6600,
      volatility: 'Moderate (5.9%)',
      observations: '16,400',
      marketShare: '9.6%',
      indexMovement: '+4.2%',
      isPositive: true,
      businessModel: 'Full-Service Carrier (FSC)'
    },
    {
      name: 'Akasa Air (SNV Aviation)',
      code: 'QP',
      routesMonitored: 24,
      avgFare: 4890,
      medianFare: 4750,
      volatility: 'Low (3.8%)',
      observations: '12,400',
      marketShare: '4.8%',
      indexMovement: '+1.9%',
      isPositive: true,
      businessModel: 'Ultra Low-Cost Carrier'
    },
    {
      name: 'SpiceJet Ltd',
      code: 'SG',
      routesMonitored: 38,
      avgFare: 5490,
      medianFare: 5200,
      volatility: 'High (11.4%)',
      observations: '18,500',
      marketShare: '4.2%',
      indexMovement: '+8.6%',
      isPositive: true,
      businessModel: 'Low-Cost Carrier (LCC)'
    },
    {
      name: 'AirAsia India / AIX Connect',
      code: 'I5',
      routesMonitored: 28,
      avgFare: 4980,
      medianFare: 4850,
      volatility: 'Moderate (6.1%)',
      observations: '11,200',
      marketShare: '3.1%',
      indexMovement: '+2.4%',
      isPositive: true,
      businessModel: 'Low-Cost Carrier (LCC)'
    },
    {
      name: 'Alliance Air (Govt of India)',
      code: '9I',
      routesMonitored: 16,
      avgFare: 4120,
      medianFare: 3950,
      volatility: 'Very Low (2.1%)',
      observations: '4,800',
      marketShare: '1.1%',
      indexMovement: '+0.5%',
      isPositive: true,
      businessModel: 'Regional UDAN Carrier'
    }
  ];

  const filtered = carriers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = carriers.map(c => ({
    name: c.code,
    avgFare: c.avgFare,
    medianFare: c.medianFare
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Market Surveillance
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  7 Scheduled Carriers
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Airline Market Monitor & Pricing Behavior
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Econometric comparison of carrier pricing strategies, market concentration, tariff dispersion, and contribution to national airfare inflation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                Market Observations: 140K+ / Cycle
              </span>
            </div>
          </div>
        </div>

        {/* Carrier Pricing Comparison Chart */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
                Average vs Median Fare Comparison Across Scheduled Airlines
              </h3>
              <span className="text-[11px] text-slate-400">Divergence between average and median indicates positive fare skewness (expensive peak tickets)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Values in INR</span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} vertical={false} />
                <XAxis dataKey="name" stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                <YAxis stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="avgFare" name="Average Fare (₹)" fill="#0F2A4A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medianFare" name="Median Fare (₹)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Airline Market Monitor Table */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B101D] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] dark:text-white">
              Carrier Pricing & Concentration Matrix
            </h3>
            <div className="relative w-64">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search airline or code..."
                className="w-full h-8 pl-8 pr-3 text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-[#0E1424]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-[#080D1A] text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">Airline Carrier</th>
                  <th className="py-3 px-4">Monitored Routes</th>
                  <th className="py-3 px-4">Average Fare</th>
                  <th className="py-3 px-4">Median Fare</th>
                  <th className="py-3 px-4">Price Volatility</th>
                  <th className="py-3 px-4">Market Observations</th>
                  <th className="py-3 px-4">Capacity Share</th>
                  <th className="py-3 px-6 text-right">Index Movement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filtered.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Plane size={14} className="text-blue-600 shrink-0" />
                      <div>
                        <div>{c.name}</div>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">{c.businessModel}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{c.routesMonitored}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">₹{c.avgFare.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">₹{c.medianFare.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.volatility.startsWith('High') ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.volatility}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{c.observations}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{c.marketShare}</td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-blue-600">
                      {c.indexMovement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
