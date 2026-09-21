import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { useAppContext } from '../../context/AppProvider';
import { useChartData, useMetrics } from '../../hooks/useMarket';
import { DataSourceBadge } from '../DataSourceBadge';
import { ErrorBlock, EmptyBlock, LoadingBlock } from '../StateViews';

const TIMEFRAMES = ['24h', '7d', '30d', '6m', '1y'];

export function AirfareIndexChart() {
  const { theme } = useAppContext();
  const isLight = theme === 'light';
  const [timeframe, setTimeframe] = useState('24h');
  const [selected, setSelected] = useState<number | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useChartData(timeframe);
  const { data: metrics } = useMetrics();
  const points: { time: string; timestamp?: string; value: number }[] = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const stats = useMemo(() => {
    if (points.length === 0) return null;
    const values = points.map(p => p.value);
    return { min: Math.min(...values), max: Math.max(...values), first: values[0], last: values[values.length - 1] };
  }, [points]);

  const picked = selected !== null ? points[selected] : null;
  const windowChange = stats && stats.first ? ((stats.last - stats.first) / stats.first) * 100 : null;

  const changeTimeframe = (tf: string) => {
    setTimeframe(tf);
    setSelected(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[420px]">
      <div className="lg:col-span-3 bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 h-full flex flex-col transition-all shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-white text-[14px] font-bold uppercase tracking-widest">India Airfare Price Index</h3>
            <DataSourceBadge />
            {isFetching && !isPending && <span className="text-[10px] text-zinc-500">updating…</span>}
          </div>
          <div className="flex bg-[#0E1017] rounded-lg p-1 border border-white/[0.06] self-start" role="tablist" aria-label="Time range">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                role="tab"
                aria-selected={timeframe === tf}
                onClick={() => changeTimeframe(tf)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-micro cursor-pointer ${
                  timeframe === tf ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full min-h-[300px]">
          {isPending ? (
            <LoadingBlock label="Loading index history…" className="h-full" />
          ) : isError ? (
            <ErrorBlock error={error} onRetry={() => refetch()} title="Couldn't load the index history" className="h-full" />
          ) : points.length === 0 ? (
            <EmptyBlock
              title={`No index history for the last ${timeframe}`}
              description="History accumulates as the pipeline runs. Longer ranges fill in over time; try 24h."
              className="h-full"
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={points}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(state: any) => {
                  const i = Number(state?.activeIndex);
                  if (Number.isInteger(i) && i >= 0 && i < points.length) setSelected(i);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : 'rgba(255,255,255,0.04)'} vertical={false} />
                <XAxis dataKey="time" stroke={isLight ? '#64748B' : '#71717a'} fontSize={10} tickLine={false} axisLine={false} dy={10} interval="preserveStartEnd" minTickGap={50} fontFamily="monospace" />
                <YAxis domain={['auto', 'auto']} stroke={isLight ? '#64748B' : '#71717a'} fontSize={10} tickLine={false} axisLine={false} dx={-10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#FFFFFF' : '#090A0F',
                    border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.08)' : '0 8px 30px rgba(0,0,0,0.8)',
                  }}
                  itemStyle={{ color: isLight ? '#0F172A' : '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}
                  labelStyle={{ color: isLight ? '#475569' : '#a1a1aa', marginBottom: '4px', fontSize: '12px' }}
                  formatter={(value: any) => [`${value}`, 'Index value']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isLight ? '#0284C7' : '#22d3ee'}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={points.length < 200}
                  activeDot={{ r: 5, fill: isLight ? '#0284C7' : '#22d3ee', stroke: isLight ? '#FFFFFF' : '#090A0F', strokeWidth: 2 }}
                />
                {picked && <ReferenceDot x={picked.time} y={picked.value} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2} />}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Inspected point (click a point on the chart) */}
        <div className="mt-3 min-h-[44px] rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px]" aria-live="polite">
          {picked && stats ? (
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
                <span className="text-zinc-500">vs range start </span>
                <strong className="font-mono">{stats.first ? `${(((picked.value - stats.first) / stats.first) * 100).toFixed(2)}%` : '—'}</strong>
              </span>
              <span className="text-zinc-500">
                Range {stats.min} – {stats.max}
              </span>
              <button type="button" onClick={() => setSelected(null)} className="ml-auto text-zinc-500 hover:text-white cursor-pointer">
                Clear
              </button>
            </div>
          ) : (
            <span className="text-zinc-500">Click any point on the chart to inspect its value and how it compares with the rest of the range.</span>
          )}
        </div>
      </div>

      {/* Explainer Panel */}
      <div className="bg-[#0A0C13] rounded-xl border border-white/[0.08] p-5 h-full flex flex-col">
        <h4 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-4">What is the index?</h4>
        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          The AeroNex Airfare Index compares fares currently observed across a fixed basket of Indian domestic routes with a baseline fare for each (baseline = 100).
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Current</div>
            <div className="text-cyan-400 font-mono font-bold text-xl tabular-nums">{metrics && metrics.hasData !== false ? metrics.airfareIndex.value : '—'}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Change over {timeframe} window</div>
            <div className={`font-mono font-bold tabular-nums ${windowChange === null ? 'text-zinc-500' : windowChange >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {windowChange === null ? '—' : `${windowChange >= 0 ? '+' : ''}${windowChange.toFixed(2)}%`}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Data points shown</div>
            <div className="text-white font-mono font-bold tabular-nums">{points.length}</div>
          </div>
        </div>

        <div className="mt-auto p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">How it is calculated</div>
          <p className="text-[11px] text-cyan-400/80 leading-tight">
            Sum of current fares divided by sum of baseline fares across tracked corridors. See the Methodology page for the full definition.
          </p>
        </div>
      </div>
    </div>
  );
}
