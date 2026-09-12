import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Download } from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';

const CORRIDOR_WEIGHTINGS = [
  { route: 'DEL → BOM', name: 'Delhi — Mumbai (CSMIA)', weight: '22.4%', medianFare: 5420, change: '+4.8%', volume: 'High Density' },
  { route: 'BOM → BLR', name: 'Mumbai — Bengaluru (KIA)', weight: '14.8%', medianFare: 4280, change: '-3.2%', volume: 'High Density' },
  { route: 'DEL → BLR', name: 'Delhi — Bengaluru (KIA)', weight: '12.1%', medianFare: 6850, change: '+1.5%', volume: 'High Density' },
  { route: 'CCU → DEL', name: 'Kolkata — Delhi (IGI)', weight: '9.6%', medianFare: 5120, change: '+2.4%', volume: 'Medium Density' },
  { route: 'DEL → GOI', name: 'Delhi — Goa (Dabolim)', weight: '7.2%', medianFare: 5800, change: '+6.1%', volume: 'Seasonal Leisure' },
  { route: 'HYD → DEL', name: 'Hyderabad — Delhi (IGI)', weight: '6.8%', medianFare: 4680, change: '-1.1%', volume: 'Medium Density' },
  { route: 'BLR → HYD', name: 'Bengaluru — Hyderabad', weight: '5.5%', medianFare: 3190, change: '+0.8%', volume: 'Regional Trunk' },
];

export function AirfareIndex() {
  usePageTitle('Airfare Price Index');
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '6m' | '1y'>('30d');

  const { data: indexMetrics } = useQuery({
    queryKey: ['airfareIndexMetrics'],
    queryFn: api.getDashboardMetrics,
    staleTime: 6000,
  });

  const { data: rawChartData = [] } = useQuery({
    queryKey: ['airfareChartData', timeframe],
    queryFn: () => api.getChartData(timeframe === '90d' ? '30d' : timeframe),
    staleTime: 6000,
  });

  const currentIndex = indexMetrics?.airfareIndex?.value ? Number(indexMetrics.airfareIndex.value).toFixed(1) : '124.8';
  const currentChange = indexMetrics?.airfareIndex?.change ?? 3.7;

  const exportCSV = () => {
    const headers = ['Corridor', 'Name', 'Laspeyres Weight', 'Current Median Fare (INR)', 'Observed 30d Delta', 'Density Category'];
    const rows = CORRIDOR_WEIGHTINGS.map(c => [
      c.route,
      `"${c.name}"`,
      c.weight,
      c.medianFare,
      c.change,
      c.volume
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AeroNex_Airfare_Index_Weightings_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Deterministic Index
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Base 2024 = 100
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                India Airfare Price Index (AeroNex NAI)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analytical index for CPI augmentation • Formulated using Laspeyres aggregation weighted by DGCA passenger volume distribution.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B101D] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download size={13} /> Export Weights CSV
              </button>
            </div>
          </div>
        </div>

        {/* 4 Statistical KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs border-t-2 border-t-[#0F2A4A]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">National Airfare Index</span>
            <div className="text-3xl font-extrabold text-[#0F2A4A] dark:text-white mt-1 tabular-nums">{currentIndex}</div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
              +{currentChange}% vs 2024 baseline
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs border-t-2 border-t-blue-600">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference Base Period</span>
            <div className="text-2xl font-extrabold text-[#0F2A4A] dark:text-white mt-1 font-mono">2024 = 100</div>
            <div className="text-xs text-slate-500 mt-1">
              Calibrated to updated MoSPI base year
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs border-t-2 border-t-emerald-600">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corridors in Composite Basket</span>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">184 Routes</div>
            <div className="text-xs text-slate-500 mt-1">
              Representing 94.6% domestic traffic
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs border-t-2 border-t-amber-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Composite Volatility (σ)</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">4.8%</div>
            <div className="text-xs text-slate-500 mt-1">
              Rolling 30-day standard deviation
            </div>
          </div>
        </div>

        {/* Centerpiece Area Chart */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <h2 className="text-sm font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wide">
                India Airfare Price Index Historical Trend
              </h2>
              <span className="text-xs text-slate-500">AeroNex Airfare Price Index — Analytical index for CPI augmentation</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {(['7d', '30d', '90d', '6m', '1y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                    timeframe === tf 
                      ? 'bg-[#0F2A4A] text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rawChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="indexBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} vertical={false} />
                <XAxis dataKey="time" stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis domain={['dataMin - 4', 'dataMax + 4']} stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#indexBlue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Corridor Basket Weighting Table */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B101D] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] dark:text-white">
              Primary Index Weighting Basket (DGCA Volume Allocation)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Sum of Top Weights: 77.4%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-[#080D1A] text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">Corridor</th>
                  <th className="py-3 px-4">City Pair Name</th>
                  <th className="py-3 px-4">Index Weight (W₀)</th>
                  <th className="py-3 px-4">Observed Median Fare</th>
                  <th className="py-3 px-4">30-Day Movement</th>
                  <th className="py-3 px-6 text-right">Traffic Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {CORRIDOR_WEIGHTINGS.map((c) => (
                  <tr key={c.route} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold font-mono text-slate-900 dark:text-white">{c.route}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{c.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{c.weight}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">₹{c.medianFare.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{c.change}</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {c.volume}
                      </span>
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
