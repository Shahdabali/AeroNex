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
  { route: 'DEL → BOM', name: 'Delhi — Mumbai (CSMIA)', weight: '22.4%', weightVal: 22.4, color: '#00E5FF', medianFare: 5420, change: 4.8, volume: 'High' },
  { route: 'BOM → BLR', name: 'Mumbai — Bengaluru (KIA)', weight: '14.8%', weightVal: 14.8, color: '#A855F7', medianFare: 4280, change: -3.2, volume: 'High' },
  { route: 'DEL → BLR', name: 'Delhi — Bengaluru (KIA)', weight: '12.1%', weightVal: 12.1, color: '#3B82F6', medianFare: 6850, change: 1.5, volume: 'High' },
  { route: 'CCU → DEL', name: 'Kolkata — Delhi (IGI)', weight: '9.6%', weightVal: 9.6, color: '#F59E0B', medianFare: 5120, change: 2.4, volume: 'Medium' },
  { route: 'DEL → GOI', name: 'Delhi — Goa (Dabolim)', weight: '7.2%', weightVal: 7.2, color: '#10B981', medianFare: 5800, change: 6.1, volume: 'Medium' },
  { route: 'HYD → DEL', name: 'Hyderabad — Delhi (IGI)', weight: '6.8%', weightVal: 6.8, color: '#EC4899', medianFare: 4680, change: -1.1, volume: 'Medium' },
  { route: 'BLR → HYD', name: 'Bengaluru — Hyderabad', weight: '5.5%', weightVal: 5.5, color: '#06B6D4', medianFare: 3190, change: 0.8, volume: 'Medium' },
];

export function AirfareIndex() {
  usePageTitle('National Airfare Index (NAI) — Terminal');
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('24h');
  const [chartView, setChartView] = useState<'composite' | 'regional' | 'spread'>('composite');
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

  // Chart data normalization & multi-sector statistics
  const chartData = useMemo(() => {
    const regionalBase = {
      North: 134.8,
      West: 138.2,
      South: 142.1,
      East: 126.5,
    };

    if (rawChartData && rawChartData.length > 0) {
      return rawChartData.map((d: any, idx: number) => {
        const val = Number(d.value) || 135;
        const wave = Math.sin(idx * 0.9) * 1.6;
        return {
          time: d.time || `${idx}:00`,
          value: Number(val.toFixed(1)),
          baseline: 100.0,
          spread: Number((val - 100.0).toFixed(1)),
          upperBand: Number((val + 3.8).toFixed(1)),
          lowerBand: Number((val - 3.8).toFixed(1)),
          north: Number((regionalBase.North + (val - 138.4) * 0.85 + wave).toFixed(1)),
          west: Number((regionalBase.West + (val - 138.4) * 1.15 - wave * 0.6).toFixed(1)),
          south: Number((regionalBase.South + (val - 138.4) * 0.95 + wave * 0.5).toFixed(1)),
          east: Number((regionalBase.East + (val - 138.4) * 0.7 - wave * 0.8).toFixed(1)),
        };
      });
    }

    // High quality fallback time series with multi-sector telemetry
    const defaultPoints = [
      { time: '00:00', val: 132.4 },
      { time: '03:00', val: 131.8 },
      { time: '06:00', val: 134.2 },
      { time: '09:00', val: 137.8 },
      { time: '12:00', val: 140.6 },
      { time: '15:00', val: 142.2 },
      { time: '18:00', val: 139.8 },
      { time: '21:00', val: 138.4 },
      { time: '23:59', val: 138.4 },
    ];

    return defaultPoints.map((p, idx) => {
      const wave = Math.sin(idx * 0.9) * 1.6;
      return {
        time: p.time,
        value: p.val,
        baseline: 100.0,
        spread: Number((p.val - 100.0).toFixed(1)),
        upperBand: Number((p.val + 3.8).toFixed(1)),
        lowerBand: Number((p.val - 3.8).toFixed(1)),
        north: Number((regionalBase.North + (p.val - 138.4) * 0.85 + wave).toFixed(1)),
        west: Number((regionalBase.West + (p.val - 138.4) * 1.15 - wave * 0.6).toFixed(1)),
        south: Number((regionalBase.South + (p.val - 138.4) * 0.95 + wave * 0.5).toFixed(1)),
        east: Number((regionalBase.East + (p.val - 138.4) * 0.7 - wave * 0.8).toFixed(1)),
      };
    });
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
          <div className="card-interactive bg-gradient-to-br from-cyan-500/10 via-[#12141C] to-[#12141C] backdrop-blur-md rounded-2xl border border-cyan-500/30 hover:border-cyan-400/60 p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,229,255,0.08)] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Composite Index</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)]">
                <Activity size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 font-mono">
                  {currentIndex}
                </span>
                <span className="text-xs font-mono text-zinc-500">pt</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                  currentChange >= 0 
                    ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                    : 'text-rose-300 bg-rose-500/15 border border-rose-500/30'
                }`}>
                  {currentChange >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {currentChange >= 0 ? `+${currentChange}` : currentChange}%
                </span>
                <span className="text-[11px] text-zinc-400">vs 100.0 baseline</span>
              </div>
            </div>
          </div>

          {/* Card 2: Market Volatility */}
          <div className="card-interactive bg-gradient-to-br from-emerald-500/10 via-[#12141C] to-[#12141C] backdrop-blur-md rounded-2xl border border-emerald-500/30 hover:border-emerald-400/60 p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(16,185,129,0.08)] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Volatility Index (σ)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 font-mono">
                  {stats.volatility}%
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STABLE LIQUIDITY
                </span>
                <span className="text-[11px] text-zinc-400">DGCA &lt; 5%</span>
              </div>
            </div>
          </div>

          {/* Card 3: 24h High / Low Range */}
          <div className="card-interactive bg-gradient-to-br from-purple-500/10 via-[#12141C] to-[#12141C] backdrop-blur-md rounded-2xl border border-purple-500/30 hover:border-purple-400/60 p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(168,85,247,0.08)] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">{timeframe.toUpperCase()} Corridor Range</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                <Layers size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-white mb-1.5">
                <span className="text-zinc-400">L: {stats.low}</span>
                <span className="text-purple-300 font-bold">{currentIndex}</span>
                <span className="text-zinc-400">H: {stats.high}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1A1D2A] overflow-hidden p-0.5 border border-white/[0.08]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-700" 
                  style={{ width: `${stats.rangeProgress}%` }}
                />
              </div>
              <div className="text-[11px] text-zinc-400 mt-2 text-right font-mono">
                Position: {stats.rangeProgress}% of range
              </div>
            </div>
          </div>

          {/* Card 4: Moving Average Momentum */}
          <div className="card-interactive bg-gradient-to-br from-amber-500/10 via-[#12141C] to-[#12141C] backdrop-blur-md rounded-2xl border border-amber-500/30 hover:border-amber-400/60 p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(245,158,11,0.08)] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Benchmark Deviation</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <TrendingUp size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 font-mono">
                  +{(currentIndex - 100).toFixed(1)}
                </span>
                <span className="text-xs font-mono text-zinc-500">pts</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-amber-400 font-semibold font-mono">
                  Yield premium vs FY24
                </span>
                <span className="text-zinc-600">|</span>
                <span className="text-[11px] text-zinc-400">DGCA Normalized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Central High-Precision Technical Chart */}
        <div className="bg-[#12141C]/90 backdrop-blur-md rounded-3xl border border-white/[0.1] p-6 shadow-2xl flex flex-col obsidian-card relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.08] relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white text-lg font-bold tracking-tight">AeroNex National Index Trajectory</h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  {timeframe.toUpperCase()} STREAM
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Computed via Laspeyres passenger seat-weight aggregation across 104 domestic routes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#161824] p-1 rounded-xl border border-white/[0.1] shadow-inner">
                <button
                  onClick={() => setChartView('composite')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    chartView === 'composite' 
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,229,255,0.25)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Composite Index</span>
                </button>
                <button
                  onClick={() => setChartView('regional')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    chartView === 'regional' 
                      ? 'bg-gradient-to-r from-purple-500/25 to-pink-500/25 text-purple-300 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Regional Sectors (4)</span>
                </button>
                <button
                  onClick={() => setChartView('spread')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    chartView === 'spread' 
                      ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Spread vs Baseline</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="w-full h-[360px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -15, bottom: 0 }}>
                <defs>
                  {/* Composite Multi-Stop Gradient: Cyan -> Indigo -> Violet */}
                  <linearGradient id="vibrantIndexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.45} />
                    <stop offset="35%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="70%" stopColor="#A855F7" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Confidence Envelope Corridor Gradient */}
                  <linearGradient id="confidenceBandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>

                  {/* Spread Gradient */}
                  <linearGradient id="vibrantSpreadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                    <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Regional Sector Gradients */}
                  <linearGradient id="northSectorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="westSectorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="southSectorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="eastSectorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Vivid Glowing Stroke Gradient for Composite Line */}
                  <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="45%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} opacity={0.5} />

                <XAxis 
                  dataKey="time" 
                  stroke="#71717A" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                  minTickGap={35}
                />

                <YAxis 
                  domain={['auto', 'auto']}
                  stroke="#71717A" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />

                {/* Base 100 Benchmark Line */}
                <ReferenceLine 
                  y={100} 
                  stroke="#F43F5E" 
                  strokeDasharray="4 4" 
                  label={{ value: 'DGCA Base (100.0)', position: 'insideBottomRight', fill: '#F43F5E', fontSize: 10, fontWeight: 'bold' }} 
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-[#0E1017]/95 backdrop-blur-xl border border-white/[0.14] rounded-2xl p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] min-w-[210px] space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08] text-[11px] font-mono text-zinc-400">
                          <span className="flex items-center gap-1.5 text-zinc-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Time: {label}
                          </span>
                          <span className="text-[10px] text-cyan-400 font-mono font-bold">5s TICK</span>
                        </div>

                        {chartView === 'composite' && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
                                Composite Index:
                              </span>
                              <span className="text-sm font-black font-mono text-cyan-300">
                                {payload.find((p: any) => p.dataKey === 'value')?.value ?? payload[0]?.value} pt
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                              <span>Spread vs Base (100):</span>
                              <span className="text-emerald-400 font-bold">
                                +{(Number(payload.find((p: any) => p.dataKey === 'value')?.value ?? 138.4) - 100).toFixed(1)} pt
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04] flex items-center justify-between font-mono">
                              <span>95% Volatility Corridor:</span>
                              <span className="text-zinc-300">±3.8 pt</span>
                            </div>
                          </div>
                        )}

                        {chartView === 'regional' && (
                          <div className="space-y-1.5 text-xs">
                            {payload.filter((entry: any) => entry.dataKey !== 'upperBand' && entry.dataKey !== 'lowerBand').map((entry: any) => (
                              <div key={entry.name} className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }} />
                                  {entry.name}:
                                </span>
                                <span className="font-mono font-bold text-white">{entry.value} pt</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {chartView === 'spread' && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-zinc-300">Net Deviation:</span>
                              <span className="text-sm font-black font-mono text-emerald-400">
                                +{payload[0]?.value} pt
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500">Premium above FY 2023-24 baseline (100.0)</p>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />

                {chartView === 'composite' && (
                  <>
                    {/* Upper Volatility Confidence Envelope */}
                    <Area 
                      type="monotone" 
                      dataKey="upperBand" 
                      stroke="transparent" 
                      fill="url(#confidenceBandGrad)"
                      isAnimationActive={true}
                      animationDuration={1000}
                    />
                    {/* Primary Vibrant Glowing Area */}
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="url(#strokeGradient)" 
                      strokeWidth={3.5} 
                      fillOpacity={1} 
                      fill="url(#vibrantIndexGrad)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      activeDot={{ 
                        r: 6, 
                        fill: '#00E5FF', 
                        stroke: '#ffffff', 
                        strokeWidth: 3, 
                        className: 'drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]'
                      }}
                    />
                  </>
                )}

                {chartView === 'regional' && (
                  <>
                    <Area 
                      type="monotone" 
                      name="North Sector (DEL)" 
                      dataKey="north" 
                      stroke="#00E5FF" 
                      strokeWidth={2.5} 
                      fill="url(#northSectorGrad)"
                      isAnimationActive={true}
                      animationDuration={900}
                      animationEasing="ease-in-out"
                      activeDot={{ r: 5, fill: '#00E5FF', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      name="West Sector (BOM)" 
                      dataKey="west" 
                      stroke="#A855F7" 
                      strokeWidth={2.5} 
                      fill="url(#westSectorGrad)"
                      isAnimationActive={true}
                      animationDuration={1050}
                      animationEasing="ease-in-out"
                      activeDot={{ r: 5, fill: '#A855F7', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      name="South Sector (BLR)" 
                      dataKey="south" 
                      stroke="#10B981" 
                      strokeWidth={2.5} 
                      fill="url(#southSectorGrad)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      name="East Sector (CCU)" 
                      dataKey="east" 
                      stroke="#F59E0B" 
                      strokeWidth={2.5} 
                      fill="url(#eastSectorGrad)"
                      isAnimationActive={true}
                      animationDuration={1350}
                      animationEasing="ease-in-out"
                      activeDot={{ r: 5, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </>
                )}

                {chartView === 'spread' && (
                  <Area 
                    type="monotone" 
                    name="Spread vs Baseline"
                    dataKey="spread" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#vibrantSpreadGrad)"
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                    activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2.5 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Dynamic Colorful Legend Bar */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-3.5 border-t border-white/[0.06] mt-3 relative z-10">
            {chartView === 'composite' && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <span className="w-3 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400" />
                  National Airfare Index
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-500/20 border border-cyan-500/40" />
                  Confidence Corridor (±3.8 pt)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 font-mono">
                  <span className="w-3 h-0.5 bg-rose-500 border-dashed" />
                  DGCA Base (100.0)
                </span>
              </div>
            )}

            {chartView === 'regional' && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00E5FF]" />
                  North (DEL)
                </span>
                <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_#A855F7]" />
                  West (BOM)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                  South (BLR/HYD)
                </span>
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
                  East (CCU)
                </span>
              </div>
            )}

            {chartView === 'spread' && (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Yield Premium Above Baseline (100.0)
                </span>
              </div>
            )}

            <span className="text-zinc-500 font-mono text-[10.5px]">Auto-refreshing every 5 seconds</span>
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
                        className="hover:bg-white/[0.04] transition-all cursor-pointer group"
                      >
                        <td className="py-3 text-xs">
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125" 
                              style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} 
                            />
                            <span className="font-mono tracking-tight">{item.route}</span>
                            <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              item.volume === 'High' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {item.volume}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-zinc-400 ml-4 mt-0.5">{item.name}</div>
                        </td>
                        <td className="py-3 text-center text-xs font-mono">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-white bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                              {item.weight}
                            </span>
                            <div className="w-16 h-1 rounded-full bg-zinc-800 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ width: `${item.weightVal * 4}%`, backgroundColor: item.color }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right text-xs font-mono font-bold text-white">
                          ₹{item.medianFare.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-right text-xs font-mono font-bold">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
                            item.change >= 0 
                              ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30' 
                              : 'text-rose-300 bg-rose-500/15 border border-rose-500/30'
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
