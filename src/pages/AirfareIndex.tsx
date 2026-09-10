import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  Activity, Info, TrendingUp,
  ArrowUpRight, ArrowDownRight, Layers, ShieldCheck,
  ChevronDown, ChevronUp, FileSpreadsheet, FileJson,
  BookOpen, Database
} from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { RegionalMap } from '../components/dashboard/RegionalMap';

// High-impact Indian domestic corridors and their index weighting
const CORRIDOR_WEIGHTINGS = [
  { route: 'DEL → BOM', name: 'Delhi — Mumbai (CSMIA)', weight: '22.4%', medianFare: 5420, change: 4.8, volume: 'High' },
  { route: 'BOM → BLR', name: 'Mumbai — Bengaluru (KIA)', weight: '14.8%', medianFare: 4280, change: -3.2, volume: 'High' },
  { route: 'DEL → BLR', name: 'Delhi — Bengaluru (KIA)', weight: '12.1%', medianFare: 6850, change: 1.5, volume: 'High' },
  { route: 'CCU → DEL', name: 'Kolkata — Delhi (IGI)', weight: '9.6%', medianFare: 5120, change: 2.4, volume: 'Medium' },
  { route: 'DEL → GOI', name: 'Delhi — Goa (Dabolim)', weight: '7.2%', medianFare: 5800, change: 6.1, volume: 'Medium' },
  { route: 'HYD → DEL', name: 'Hyderabad — Delhi (IGI)', weight: '6.8%', medianFare: 4680, change: -1.1, volume: 'Medium' },
  { route: 'BLR → HYD', name: 'Bengaluru — Hyderabad', weight: '5.5%', medianFare: 3190, change: 0.8, volume: 'Medium' },
];

export function AirfareIndex() {
  usePageTitle('National Airfare Index (NAI) — Terminal');
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('24h');
  const [chartView, setChartView] = useState<'composite' | 'spread'>('composite');
  const [showMethodology, setShowMethodology] = useState(false);

  // Queries
  const { data: indexMetrics } = useQuery({
    queryKey: ['airfareIndexMetrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 5000,
  });

  const { data: regionalData = [] } = useQuery({
    queryKey: ['airfareIndexRegional'],
    queryFn: api.getRegionalIndex,
    refetchInterval: 5000,
  });

  const { data: rawChartData = [] } = useQuery({
    queryKey: ['airfareChartData', timeframe],
    queryFn: () => api.getChartData(timeframe === '90d' ? '30d' : timeframe),
    refetchInterval: 5000,
  });

  const currentIndex = indexMetrics?.airfareIndex?.value ?? 138.4;
  const currentChange = indexMetrics?.airfareIndex?.change ?? 4.2;

  // Chart data normalization & statistics
  const chartData = useMemo(() => {
    if (rawChartData && rawChartData.length > 0) {
      return rawChartData.map((d: any, idx: number) => {
        const val = Number(d.value) || 135;
        return {
          time: d.time || `${idx}:00`,
          value: Number(val.toFixed(1)),
          baseline: 100.0,
          spread: Number((val - 100.0).toFixed(1)),
        };
      });
    }

    // High quality fallback time series
    return [
      { time: '00:00', value: 132.4, baseline: 100.0, spread: 32.4 },
      { time: '04:00', value: 131.8, baseline: 100.0, spread: 31.8 },
      { time: '08:00', value: 135.2, baseline: 100.0, spread: 35.2 },
      { time: '12:00', value: 139.6, baseline: 100.0, spread: 39.6 },
      { time: '16:00', value: 141.2, baseline: 100.0, spread: 41.2 },
      { time: '20:00', value: 138.4, baseline: 100.0, spread: 38.4 },
      { time: '23:59', value: 138.4, baseline: 100.0, spread: 38.4 },
    ];
  }, [rawChartData]);

  // Derived Telemetry
  const stats = useMemo(() => {
    const values = chartData.map((d: any) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a: number, b: number) => a + b, 0) / (values.length || 1);
    
    // Standard deviation volatility
    const variance = values.reduce((acc: number, val: number) => acc + Math.pow(val - avg, 2), 0) / (values.length || 1);
    const stdDev = Math.sqrt(variance);
    const volatilityPct = ((stdDev / avg) * 100).toFixed(2);

    return {
      high: max.toFixed(1),
      low: min.toFixed(1),
      avg: avg.toFixed(1),
      volatility: volatilityPct,
      rangeProgress: Math.min(100, Math.max(0, ((currentIndex - min) / (max - min || 1)) * 100)).toFixed(0),
    };
  }, [chartData, currentIndex]);

  // Data Exporters
  const handleExportCSV = () => {
    const headers = 'Time,IndexValue,Baseline,Spread\n';
    const rows = chartData.map((d: any) => `${d.time},${d.value},${d.baseline},${d.spread}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AeroNex_Airfare_Index_${timeframe}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify({
      metric: 'National Airfare Index (NAI)',
      baseYear: '2023-2024 = 100.0',
      timeframe,
      lastUpdated: new Date().toISOString(),
      currentValue: currentIndex,
      deltaPercent: currentChange,
      series: chartData,
      regionalCorridors: regionalData,
    }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AeroNex_Airfare_Index_${timeframe}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-12">
        
        {/* Terminal Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                National Airfare Index (NAI)
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                DGCA BENCHMARK
              </span>
            </div>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">
              Real-time weighted passenger yield benchmark across major Indian domestic airline corridors (Base 100 = FY 23-24).
            </p>
          </div>

          {/* Quick Actions: Export, Nav & Timeframes */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Links */}
            <button 
              onClick={() => navigate('/methodology')}
              title="View Index Calculation Methodology"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <BookOpen size={13} className="text-cyan-400" />
              <span>Methodology</span>
            </button>
            <button 
              onClick={() => navigate('/data-scraping')}
              title="Inspect Live Data Scraping Cluster"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] border border-white/[0.08] hover:border-emerald-500/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Database size={13} className="text-emerald-400" />
              <span>Scrapers</span>
            </button>

            {/* Export Menu */}
            <div className="flex items-center bg-[#161824] border border-white/[0.08] rounded-xl overflow-hidden p-1 shadow-sm">
              <button 
                onClick={handleExportCSV}
                title="Export series as CSV"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={13} className="text-emerald-400" />
                <span>CSV</span>
              </button>
              <button 
                onClick={handleExportJSON}
                title="Export series as JSON"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <FileJson size={13} className="text-cyan-400" />
                <span>JSON</span>
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="flex bg-[#161824] border border-white/[0.08] rounded-xl p-1 shadow-sm">
              {(['24h', '7d', '30d', '90d', '1y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Telemetry KPIs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Current Index */}
          <div className="card-interactive bg-[#12141C]/80 backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Composite Index</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Activity size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-white tracking-tight">{currentIndex}</span>
                <span className="text-xs font-mono text-zinc-500">pt</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                  currentChange >= 0 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                }`}>
                  {currentChange >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {currentChange >= 0 ? `+${currentChange}` : currentChange}%
                </span>
                <span className="text-[11px] text-zinc-500">vs 100.0 baseline</span>
              </div>
            </div>
          </div>

          {/* Card 2: Market Volatility */}
          <div className="card-interactive bg-[#12141C]/80 backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Volatility Index (σ)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-white tracking-tight">{stats.volatility}%</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  STABLE LIQUIDITY
                </span>
                <span className="text-[11px] text-zinc-500">DGCA Tolerance &lt; 5%</span>
              </div>
            </div>
          </div>

          {/* Card 3: 24h High / Low Range */}
          <div className="card-interactive bg-[#12141C]/80 backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{timeframe.toUpperCase()} Corridor Range</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-white mb-1.5">
                <span className="text-zinc-400">L: {stats.low}</span>
                <span className="text-cyan-400">{currentIndex}</span>
                <span className="text-zinc-400">H: {stats.high}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1A1D2A] overflow-hidden p-0.5 border border-white/[0.06]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500" 
                  style={{ width: `${stats.rangeProgress}%` }}
                />
              </div>
              <div className="text-[11px] text-zinc-500 mt-2 text-right">
                Position: {stats.rangeProgress}% of range
              </div>
            </div>
          </div>

          {/* Card 4: Moving Average Momentum */}
          <div className="card-interactive bg-[#12141C]/80 backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Benchmark Deviation</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  +{(currentIndex - 100).toFixed(1)}
                </span>
                <span className="text-xs font-mono text-zinc-500">pts</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-cyan-400 font-semibold">
                  Yield premium vs FY24
                </span>
                <span className="text-zinc-600">|</span>
                <span className="text-[11px] text-zinc-500">Inflation-adjusted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Central High-Precision Technical Chart */}
        <div className="bg-[#12141C]/80 backdrop-blur-md rounded-2xl border border-white/[0.08] p-6 shadow-xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white text-lg font-bold">AeroNex National Index Trajectory</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {timeframe.toUpperCase()} STREAM
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Computed via Laspeyres passenger seat-weight aggregation across 104 domestic routes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#161824] p-1 rounded-xl border border-white/[0.08]">
                <button
                  onClick={() => setChartView('composite')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    chartView === 'composite' 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Composite Index
                </button>
                <button
                  onClick={() => setChartView('spread')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    chartView === 'spread' 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Spread vs Baseline
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="w-full h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="indexMatteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#1788FF" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="spreadMatteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} opacity={0.6} />

                <XAxis 
                  dataKey="time" 
                  stroke="#71717A" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                  minTickGap={40}
                />

                <YAxis 
                  domain={chartView === 'composite' ? ['auto', 'auto'] : ['auto', 'auto']}
                  stroke="#71717A" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />

                {/* Base 100 Benchmark Line */}
                {chartView === 'composite' && (
                  <ReferenceLine 
                    y={100} 
                    stroke="#F43F5E" 
                    strokeDasharray="4 4" 
                    label={{ value: 'DGCA Base (100.0)', position: 'insideBottomRight', fill: '#F43F5E', fontSize: 10 }} 
                  />
                )}

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1017',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.85)',
                    padding: '10px 14px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#A1A1AA', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold' }}
                  formatter={(value: any, name: any) => [
                    `${value} pt`,
                    name === 'value' ? 'Airfare Index' : 'Spread vs Base'
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />

                <Area 
                  type="monotone" 
                  dataKey={chartView === 'composite' ? 'value' : 'spread'} 
                  stroke={chartView === 'composite' ? '#00E5FF' : '#10B981'} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill={chartView === 'composite' ? 'url(#indexMatteGrad)' : 'url(#spreadMatteGrad)'}
                  activeDot={{ r: 5, fill: '#00E5FF', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-3 border-t border-white/[0.04] mt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Airfare Index
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-rose-500" />
                Base Benchmark (100.0)
              </span>
            </div>
            <span>Auto-refreshing every 5 seconds</span>
          </div>
        </div>

        {/* 2-Column Split: Metro Corridor Weighting Table & Regional Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 cols): High-Traffic Corridor Weights */}
          <div className="lg:col-span-7 bg-[#12141C]/80 backdrop-blur-md rounded-2xl border border-white/[0.08] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white text-base font-bold flex items-center gap-2">
                    <span>Key Corridor Weighting Matrix</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      TOP 7
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Proportionate impact of high-density metropolitan routes on national index.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/routes')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  All Routes →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[11px] text-zinc-400 uppercase font-semibold">
                      <th className="pb-3">Corridor</th>
                      <th className="pb-3 text-center">Index Weight</th>
                      <th className="pb-3 text-right">Median Fare</th>
                      <th className="pb-3 text-right">24h Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {CORRIDOR_WEIGHTINGS.map((item, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => navigate('/price-trends')}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 text-xs">
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            {item.route}
                          </div>
                          <div className="text-[10.5px] text-zinc-500">{item.name}</div>
                        </td>
                        <td className="py-3 text-center text-xs font-mono font-bold text-zinc-200">
                          <span className="bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                            {item.weight}
                          </span>
                        </td>
                        <td className="py-3 text-right text-xs font-bold text-white">
                          ₹{item.medianFare.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-right text-xs font-bold">
                          <span className={`inline-flex items-center gap-0.5 ${
                            item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {item.change >= 0 ? '+' : ''}{item.change}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500">
              <span>Weights calibrated against DGCA monthly passenger traffic logs</span>
              <span className="text-cyan-400 font-mono">Σ Weight = 78.4%</span>
            </div>
          </div>

          {/* Right Column (5 cols): Embedded 2D/3D Radar Map */}
          <div className="lg:col-span-5">
            <RegionalMap />
          </div>
        </div>

        {/* DGCA Mathematical Methodology Card (Collapsible) */}
        <div className="bg-[#12141C]/80 backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 shadow-lg">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Info size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  DGCA Laspeyres-Fisher Index Calculation Methodology
                </h4>
                <p className="text-xs text-zinc-400">
                  Mathematical aggregation formula, load factors, and real-time yield calibration.
                </p>
              </div>
            </div>
            <div className="text-zinc-400 group-hover:text-white p-1">
              {showMethodology ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {showMethodology && (
            <div className="mt-5 pt-4 border-t border-white/[0.06] text-xs text-zinc-300 space-y-3 leading-relaxed">
              <div className="bg-[#161824] p-4 rounded-xl border border-white/[0.08] font-mono text-cyan-300 text-center text-sm overflow-x-auto">
                I_t = [ Σ ( P_i,t × W_i ) / Σ ( P_i,0 × W_i ) ] × 100
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="font-bold text-white mb-1">1. Price Observation (P_i,t)</div>
                  <p className="text-zinc-400 text-[11px]">
                    Continuous real-time scraping and GDS querying across 104 domestic routes at 3, 7, 14, and 30-day booking horizons.
                  </p>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="font-bold text-white mb-1">2. Seat Capacity Weight (W_i)</div>
                  <p className="text-zinc-400 text-[11px]">
                    Derived from monthly DGCA scheduled seat capacity reports, updated quarterly to reflect seasonal airline deployment.
                  </p>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="font-bold text-white mb-1">3. Base Calibration (P_i,0)</div>
                  <p className="text-zinc-400 text-[11px]">
                    Normalized baseline indexed to FY 2023-24 average domestic passenger yields (fixed at base = 100.0).
                  </p>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.04]">
                <span className="text-zinc-400 text-xs">Simulate custom corridor fares or inspect live crawler feeds:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/methodology')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Open Formula Simulator →
                  </button>
                  <button
                    onClick={() => navigate('/data-scraping')}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.1] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Scraper Pipeline →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
