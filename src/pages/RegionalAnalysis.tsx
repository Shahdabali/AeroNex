import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { RegionalMap } from '../components/dashboard/RegionalMap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppProvider';

export function RegionalAnalysis() {
  usePageTitle('Regional Price Analysis');
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const regionalComparison = [
    { region: 'Northern India', index: 126.4, avgFare: 5680, change: '+4.2%', routes: 52, topCorridor: 'DEL → BOM (₹5,420)' },
    { region: 'Western India', index: 121.8, avgFare: 4890, change: '+2.1%', routes: 44, topCorridor: 'BOM → BLR (₹4,280)' },
    { region: 'Southern India', index: 128.2, avgFare: 5920, change: '+5.6%', routes: 48, topCorridor: 'BLR → DEL (₹6,850)' },
    { region: 'Eastern India', index: 119.5, avgFare: 5120, change: '+1.8%', routes: 26, topCorridor: 'CCU → DEL (₹5,120)' },
    { region: 'North-East / UDAN', index: 114.2, avgFare: 4350, change: '+0.8%', routes: 14, topCorridor: 'GAU → DEL (₹5,800)' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Geographic Disparity
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Sub-Index Aggregation
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Regional Airfare Disparity & Geographic Indices
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Spatial decomposition of the National Airfare Index across India's geographic zones (North, South, East, West, and UDAN North-East).
              </p>
            </div>

            <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              National Index: 124.8
            </span>
          </div>
        </div>

        {/* 5 Regional Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {regionalComparison.map((r) => (
            <div key={r.region} className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">{r.region}</span>
                  <span className="text-[10px] font-mono text-slate-400">{r.routes} Routes</span>
                </div>
                <div className="text-2xl font-extrabold text-[#0F2A4A] dark:text-blue-400 tabular-nums">{r.index}</div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-500">Median Fare:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{r.avgFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-500">Base Delta:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">{r.change}</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10.5px] text-slate-400 truncate">
                {r.topCorridor}
              </div>
            </div>
          ))}
        </div>

        {/* Map & Comparison Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RegionalMap />
          </div>

          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
                  Regional Index Variance
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Base: 100</span>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} vertical={false} />
                    <XAxis dataKey="region" stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={9} tickLine={false} />
                    <YAxis domain={[90, 140]} stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="index" name="Sub-Index" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#0B101D] rounded-lg border border-slate-100 dark:border-slate-800 text-xs mt-3 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">Inter-Regional Disparity Observation:</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Southern routes show highest current index pressure (128.2), led by tech-corridor demand between Bengaluru, Hyderabad, and Chennai. North-East UDAN subsidized routes remain most stable (114.2).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10.5px] text-slate-400 text-center">
              {"Derived from Laspeyres regional weights W_{region}"}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
