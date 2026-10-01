import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { Activity, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck, ChevronDown, ChevronUp, FileSpreadsheet, FileJson, BookOpen, Database } from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';
import { useMetrics, useChartData, useRegionalIndex, MARKET_REFRESH_MS, fmtINR } from '../hooks/useMarket';
import { RegionalMap } from '../components/dashboard/RegionalMap';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../components/StateViews';
import { RouteDetailModal } from '../components/RouteDetailModal';

type Timeframe = '24h' | '7d' | '30d' | '6m' | '1y';
const TIMEFRAMES: Timeframe[] = ['24h', '7d', '30d', '6m', '1y'];

export function AirfareIndex() {
  usePageTitle('National Airfare Index (NAI)');
  const navigate = useNavigate();
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [chartView, setChartView] = useState<'composite' | 'spread'>('composite');
  const [showMethodology, setShowMethodology] = useState(false);
  const [openRoute, setOpenRoute] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const metrics = useMetrics();
  const chart = useChartData(timeframe);
  const regional = useRegionalIndex();
  const basket = useQuery({ queryKey: ['indexBasket'], queryFn: api.getIndexBasket, refetchInterval: MARKET_REFRESH_MS, staleTime: 10_000, retry: 1 });

  const hasMetrics = metrics.data && metrics.data.hasData !== false;
  const currentIndex: number | null = hasMetrics ? metrics.data.airfareIndex.value : null;
  const currentChange: number = hasMetrics ? metrics.data.airfareIndex.change : 0;

  const series = useMemo(
    () =>
      (Array.isArray(chart.data) ? chart.data : []).map((d: any) => ({
        time: d.time as string,
        timestamp: d.timestamp as string | undefined,
        value: Number(d.value),
        spread: Number((Number(d.value) - 100).toFixed(2)),
      })),
    [chart.data],
  );

  const stats = useMemo(() => {
    if (series.length === 0) return null;
    const values = series.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sd = Math.sqrt(values.reduce((a, v) => a + (v - avg) ** 2, 0) / values.length);
    const last = values[values.length - 1];
    return {
      min,
      max,
      avg,
      volatility: avg ? (sd / avg) * 100 : 0,
      position: max === min ? 50 : ((last - min) / (max - min)) * 100,
    };
  }, [series]);

  const exportFile = (kind: 'csv' | 'json') => {
    const body =
      kind === 'csv'
        ? 'Time,Timestamp,IndexValue,SpreadVsBaseline\n' + series.map(d => `${d.time},${d.timestamp ?? ''},${d.value},${d.spread}`).join('\n')
        : JSON.stringify({ metric: 'AeroNex National Airfare Index', baseline: 100, timeframe, exportedAt: new Date().toISOString(), current: currentIndex, series }, null, 2);
    const url = URL.createObjectURL(new Blob([body], { type: kind === 'csv' ? 'text/csv' : 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `AeroNex_Airfare_Index_${timeframe}.${kind}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const picked = selected !== null ? series[selected] : null;
  const axis = isLight ? '#64748B' : '#71717A';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">National Airfare Index (NAI)</h1>
              <DataSourceBadge showAge />
            </div>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">
              Current observed fares across the tracked domestic corridors compared with a fixed baseline basket (baseline = 100).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => navigate('/methodology')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer">
              <BookOpen size={13} className="text-cyan-400" /> Methodology
            </button>
            <button onClick={() => navigate('/data-scraping')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer">
              <Database size={13} className="text-cyan-400" /> Data pipeline
            </button>
            <button
              onClick={() => exportFile('csv')}
              disabled={series.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet size={13} className="text-cyan-400" /> CSV
            </button>
            <button
              onClick={() => exportFile('json')}
              disabled={series.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileJson size={13} className="text-cyan-400" /> JSON
            </button>
            <div className="flex bg-[#161824] border border-white/[0.08] rounded-xl p-1" role="tablist" aria-label="Time range">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  role="tab"
                  aria-selected={timeframe === tf}
                  onClick={() => {
                    setTimeframe(tf);
                    setSelected(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeframe === tf ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {metrics.isError && <ErrorBlock error={metrics.error} onRetry={() => metrics.refetch()} title="Couldn't load the index" />}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            title="Composite Index"
            icon={<Activity size={16} />}
            value={currentIndex === null ? '—' : String(currentIndex)}
            unit="pt"
            foot={
              currentIndex === null ? null : (
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${currentChange >= 0 ? 'text-rose-300 bg-rose-500/15 border border-rose-500/30' : 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'}`}>
                  {currentChange >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {currentChange >= 0 ? '+' : ''}
                  {currentChange}% <span className="font-normal text-zinc-400">since last refresh</span>
                </span>
              )
            }
          />
          <Kpi
            title="Volatility (σ / mean)"
            icon={<ShieldCheck size={16} />}
            value={stats ? `${stats.volatility.toFixed(2)}%` : '—'}
            foot={<span className="text-[11px] text-zinc-400">Over the {timeframe.toUpperCase()} window ({series.length} points)</span>}
          />
          <Kpi
            title={`${timeframe.toUpperCase()} Range`}
            icon={<Layers size={16} />}
            value={stats ? `${stats.min.toFixed(1)} – ${stats.max.toFixed(1)}` : '—'}
            foot={stats && currentIndex !== null ? <span className="text-[11px] text-zinc-400 font-mono">Now at {stats.position.toFixed(0)}% of the range</span> : null}
          />
          <Kpi
            title="Deviation from baseline"
            icon={<TrendingUp size={16} />}
            value={currentIndex === null ? '—' : `${currentIndex - 100 >= 0 ? '+' : ''}${(currentIndex - 100).toFixed(1)}`}
            unit="pts"
            foot={<span className="text-[11px] text-zinc-400">Baseline basket = 100</span>}
          />
        </div>

        {/* Chart */}
        <div className="bg-[#12141C]/90 rounded-3xl border border-white/[0.1] p-6 shadow-2xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-white text-lg font-bold tracking-tight">Index trajectory</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Sum of current fares divided by sum of baseline fares across the tracked corridors. Click a point to inspect it.</p>
            </div>
            <div className="flex bg-[#161824] p-1 rounded-xl border border-white/[0.1] self-start" role="tablist" aria-label="Chart view">
              {(['composite', 'spread'] as const).map(v => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={chartView === v}
                  onClick={() => setChartView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${chartView === v ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  {v === 'composite' ? 'Composite Index' : 'Spread vs Baseline'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[340px]">
            {chart.isPending ? (
              <LoadingBlock label="Loading index history…" className="h-full" />
            ) : chart.isError ? (
              <ErrorBlock error={chart.error} onRetry={() => chart.refetch()} title="Couldn't load the index history" className="h-full" />
            ) : series.length === 0 ? (
              <EmptyBlock title={`No index history for the last ${timeframe}`} description="History accumulates while the pipeline runs. Longer ranges fill in over time." className="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ top: 12, right: 12, left: -15, bottom: 0 }}
                  onClick={(s: any) => {
                    const i = Number(s?.activeIndex);
                    if (Number.isInteger(i) && i >= 0 && i < series.length) setSelected(i);
                  }}
                >
                  <defs>
                    <linearGradient id="idxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#27272A'} vertical={false} opacity={0.6} />
                  <XAxis dataKey="time" stroke={axis} fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={35} />
                  <YAxis domain={['auto', 'auto']} stroke={axis} fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                  {chartView === 'composite' && <ReferenceLine y={100} stroke="#F43F5E" strokeDasharray="4 4" label={{ value: 'Baseline (100)', position: 'insideBottomRight', fill: '#F43F5E', fontSize: 10 }} />}
                  {chartView === 'spread' && <ReferenceLine y={0} stroke="#F43F5E" strokeDasharray="4 4" />}
                  <Tooltip
                    contentStyle={{ backgroundColor: isLight ? '#fff' : '#0E1017', border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.14)', borderRadius: 12 }}
                    labelStyle={{ color: isLight ? '#475569' : '#a1a1aa', fontSize: 11 }}
                    itemStyle={{ color: isLight ? '#0F172A' : '#fff', fontWeight: 700 }}
                    formatter={(v: any) => [`${v} pt`, chartView === 'composite' ? 'Index' : 'Spread vs 100']}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartView === 'composite' ? 'value' : 'spread'}
                    stroke={isLight ? '#0284C7' : '#22d3ee'}
                    strokeWidth={2.5}
                    fill="url(#idxGrad)"
                    isAnimationActive={series.length < 200}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Regional Graph */}
          <div className="mt-8 pt-8 border-t border-white/[0.08]">
            <div className="mb-4">
              <h3 className="text-white text-lg font-bold tracking-tight">Regional Index Performance</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Current index values broken down by geographic region.</p>
            </div>
            <div className="w-full h-[250px]">
              {regional.isPending ? (
                <LoadingBlock label="Loading regional data..." className="h-full" />
              ) : regional.isError ? (
                <ErrorBlock error={regional.error} onRetry={() => regional.refetch()} title="Couldn't load regional data" className="h-full" />
              ) : regional.data?.length === 0 ? (
                <EmptyBlock title="No regional data" description="Try again later." className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regional.data}
                    margin={{ top: 12, right: 12, left: -15, bottom: 0 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#27272A'} horizontal={true} vertical={false} opacity={0.6} />
                    <XAxis type="number" domain={['auto', 'auto']} stroke={isLight ? '#94a3b8' : '#52525B'} fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                    <YAxis dataKey="region" type="category" stroke={isLight ? '#94a3b8' : '#52525B'} fontSize={11} tickLine={false} axisLine={false} dx={-10} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isLight ? '#fff' : '#0E1017', border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.14)', borderRadius: 12 }}
                      labelStyle={{ color: isLight ? '#475569' : '#a1a1aa', fontSize: 11 }}
                      itemStyle={{ color: isLight ? '#0F172A' : '#fff', fontWeight: 700 }}
                      formatter={(v) => [`${Number(v).toFixed(1)} pt`, 'Index Value']}
                    />
                    <Bar dataKey="index" radius={[0, 4, 4, 0]} maxBarSize={40}>
                      {
                        (regional.data || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.index > 100 ? (isLight ? '#ef4444' : '#f87171') : (isLight ? '#10b981' : '#34d399')} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>


          <div className="mt-3 min-h-[40px] rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px]" aria-live="polite">
            {picked ? (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-zinc-300">
                <span>
                  <span className="text-zinc-500">When </span>
                  <strong className="font-mono">{picked.timestamp ? new Date(picked.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : picked.time}</strong>
                </span>
                <span>
                  <span className="text-zinc-500">Index </span>
                  <strong className="font-mono text-cyan-400">{picked.value}</strong>
                </span>
                <span>
                  <span className="text-zinc-500">vs baseline </span>
                  <strong className="font-mono">{picked.spread >= 0 ? '+' : ''}{picked.spread}</strong>
                </span>
                <button type="button" onClick={() => setSelected(null)} className="ml-auto text-zinc-500 hover:text-white cursor-pointer">Clear</button>
              </div>
            ) : (
              <span className="text-zinc-500">Click any point on the chart to inspect it.</span>
            )}
          </div>
        </div>

        <RegionalMap />

        {/* Basket */}
        <div className="bg-[#12141C]/90 rounded-2xl border border-white/[0.1] overflow-hidden">
          <div className="p-5 border-b border-white/[0.08]">
            <h3 className="text-white font-bold text-base">Index basket</h3>
            <p className="text-xs text-zinc-400 mt-0.5">The corridors behind the index. Weight is derived from official DGCA domestic passenger traffic statistics. Click a row for route details.</p>
          </div>
          {basket.isPending ? (
            <LoadingBlock />
          ) : basket.isError ? (
            <ErrorBlock error={basket.error} onRetry={() => basket.refetch()} title="Couldn't load the basket" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[560px]">
                <thead className="text-zinc-500 text-[11px] uppercase tracking-wider font-mono">
                  <tr className="border-b border-white/[0.06]">
                    <th className="p-3">Route</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Baseline</th>
                    <th className="p-3">Current</th>
                    <th className="p-3">vs baseline</th>
                    <th className="p-3">Last change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(basket.data as any[]).map(b => (
                    <tr key={b.route} onClick={() => setOpenRoute(b.route)} className="hover:bg-white/[0.03] cursor-pointer transition-colors">
                      <td className="p-3 font-mono font-bold text-white">{b.route.replace('-', ' → ')}</td>
                      <td className="p-3 text-zinc-300">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, b.weightPct * 6)}%` }} />
                          </div>
                          {b.weightPct}%
                        </div>
                      </td>
                      <td className="p-3 font-mono text-zinc-400">{fmtINR(b.baseline)}</td>
                      <td className="p-3 font-mono text-white">{fmtINR(b.currentFare)}</td>
                      <td className={`p-3 font-mono ${b.vsBaselinePct === null ? 'text-zinc-500' : b.vsBaselinePct >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {b.vsBaselinePct === null ? '—' : `${b.vsBaselinePct >= 0 ? '+' : ''}${b.vsBaselinePct}%`}
                      </td>
                      <td className={`p-3 font-mono ${b.changePct === null ? 'text-zinc-500' : b.changePct >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {b.changePct === null ? '—' : `${b.changePct >= 0 ? '+' : ''}${b.changePct}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className="bg-[#12141C]/90 rounded-2xl border border-white/[0.1]">
          <button onClick={() => setShowMethodology(v => !v)} aria-expanded={showMethodology} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
            <span className="text-white font-bold text-base">How the index is calculated</span>
            {showMethodology ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
          </button>
          {showMethodology && (
            <div className="px-5 pb-5 text-sm text-zinc-300 space-y-2">
              <p>
                <strong>Index = (Σ current fares ÷ Σ baseline fares) × 100</strong> over the corridors in the basket above. A value of 110 means observed fares are, in aggregate, 10% above the baseline.
              </p>
              <p>Each corridor's weight corresponds to its DGCA passenger volume share. The data source and refresh interval are shown in the badge at the top of this page; open the Data Pipeline page for validation and outlier statistics.</p>
              <button onClick={() => navigate('/methodology')} className="text-cyan-400 hover:underline text-xs font-semibold cursor-pointer">Read the full methodology →</button>
            </div>
          )}
        </div>
      </div>
      {openRoute && <RouteDetailModal route={openRoute} onClose={() => setOpenRoute(null)} />}
    </DashboardLayout>
  );
}

function Kpi({ title, icon, value, unit, foot }: { title: string; icon: React.ReactNode; value: string; unit?: string; foot?: React.ReactNode }) {
  return (
    <div className="bg-[#12141C] rounded-2xl border border-white/[0.1] p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">{icon}</div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-black tracking-tight text-white font-mono">{value}</span>
          {unit && <span className="text-xs font-mono text-zinc-500">{unit}</span>}
        </div>
        <div className="mt-2">{foot}</div>
      </div>
    </div>
  );
}
