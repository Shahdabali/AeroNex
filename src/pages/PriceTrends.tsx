import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Bell, Search, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { INDIAN_AIRPORTS } from '../data/indianAviation';
import { api } from '../services/api';
import { useAppContext } from '../context/AppProvider';
import { useRoutes, MARKET_REFRESH_MS, fmtINR } from '../hooks/useMarket';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../components/StateViews';
import { RouteDetailModal } from '../components/RouteDetailModal';

const city = (code: string) => INDIAN_AIRPORTS.find(a => a.code === code)?.city ?? code;

export function PriceTrends() {
  usePageTitle('Price Trends');
  const navigate = useNavigate();
  const { theme } = useAppContext();
  const isLight = theme === 'light';
  const [params, setParams] = useSearchParams();
  const [showDetail, setShowDetail] = useState(false);

  const routes = useRoutes();
  const options = useMemo(() => ((routes.data as any[]) || []).map(r => r.route as string).sort(), [routes.data]);
  const route = params.get('route') && options.includes(params.get('route')!) ? params.get('route')! : options.includes('DEL-BOM') ? 'DEL-BOM' : options[0];

  const history = useQuery({
    queryKey: ['routeHistory', route],
    queryFn: () => api.getRouteHistory(route),
    enabled: Boolean(route),
    refetchInterval: MARKET_REFRESH_MS,
    staleTime: 10_000,
    retry: 1,
  });

  const points = useMemo(
    () =>
      ((history.data as any[]) || []).map(h => ({
        at: new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        fare: h.fare as number,
      })),
    [history.data],
  );

  const stats = useMemo(() => {
    if (points.length === 0) return null;
    const fares = points.map(p => p.fare);
    const avg = fares.reduce((a, b) => a + b, 0) / fares.length;
    return {
      min: Math.min(...fares),
      max: Math.max(...fares),
      avg,
      first: fares[0],
      last: fares[fares.length - 1],
      change: ((fares[fares.length - 1] - fares[0]) / fares[0]) * 100,
    };
  }, [points]);

  const [from, to] = (route || '-').split('-');
  const axis = isLight ? '#64748B' : '#94A3B8';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">Price Trends</h1>
              <DataSourceBadge />
            </div>
            <p className="text-slate-400 text-sm mt-1">Observed fare history for a corridor. Only fares AeroNex has actually recorded since the data server started are shown.</p>
          </div>

          <div>
            <label htmlFor="trend-route" className="block text-xs font-semibold text-slate-400 mb-1">Corridor</label>
            <select
              id="trend-route"
              value={route ?? ''}
              onChange={e => setParams({ route: e.target.value }, { replace: true })}
              disabled={options.length === 0}
              className="bg-[#0A1838] border border-slate-700 rounded-xl text-white px-3 py-2 outline-none focus:border-[#1788FF] cursor-pointer min-w-[240px]"
            >
              {options.map(o => (
                <option key={o} value={o}>
                  {city(o.split('-')[0])} → {city(o.split('-')[1])} ({o})
                </option>
              ))}
            </select>
          </div>
        </div>

        {routes.isPending ? (
          <LoadingBlock label="Loading corridors…" />
        ) : routes.isError ? (
          <ErrorBlock error={routes.error} onRetry={() => routes.refetch()} title="Couldn't load corridors" />
        ) : options.length === 0 ? (
          <EmptyBlock title="No corridors observed yet" description="Trends appear once the data feed records fares." />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Current" value={stats ? fmtINR(stats.last) : '—'} />
              <Stat label="Lowest observed" value={stats ? fmtINR(stats.min) : '—'} />
              <Stat label="Highest observed" value={stats ? fmtINR(stats.max) : '—'} />
              <Stat
                label="Change over window"
                value={stats ? `${stats.change >= 0 ? '+' : ''}${stats.change.toFixed(1)}%` : '—'}
                tone={stats ? (stats.change >= 0 ? 'bad' : 'good') : undefined}
                icon={stats ? stats.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} /> : undefined}
              />
            </div>

            <div className="bg-[#12141C]/90 rounded-2xl border border-white/[0.1] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-white font-bold">
                  {from} → {to}
                  <span className="text-xs font-normal text-zinc-500 ml-2">{points.length} observations</span>
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowDetail(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-semibold cursor-pointer">
                    <Sparkles size={12} /> Details &amp; AI
                  </button>
                  <button onClick={() => navigate(`/price-alerts?from=${from}&to=${to}${stats ? `&target=${Math.round(stats.last * 0.93)}` : ''}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-xs font-semibold cursor-pointer">
                    <Bell size={12} /> Set alert
                  </button>
                  <button onClick={() => navigate(`/search?from=${from}&to=${to}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-xs font-semibold cursor-pointer">
                    <Search size={12} /> Search flights
                  </button>
                </div>
              </div>

              <div className="h-[340px] w-full">
                {history.isPending ? (
                  <LoadingBlock label="Loading fare history…" className="h-full" />
                ) : history.isError ? (
                  <ErrorBlock error={history.error} onRetry={() => history.refetch()} title="Couldn't load fare history" className="h-full" />
                ) : points.length < 2 ? (
                  <EmptyBlock title="Not enough observations yet" description="A trend needs at least two recorded fares. A new point is added at every data refresh." className="h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={points} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1788FF" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#1788FF" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : 'rgba(255,255,255,0.06)'} vertical={false} />
                      <XAxis dataKey="at" stroke={axis} fontSize={11} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis domain={['auto', 'auto']} stroke={axis} fontSize={11} tickLine={false} axisLine={false} width={56} tickFormatter={v => `₹${v}`} />
                      {stats && <ReferenceLine y={stats.avg} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: `avg ${fmtINR(stats.avg)}`, fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} />}
                      <Tooltip
                        contentStyle={{ backgroundColor: isLight ? '#fff' : '#0E1017', border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.14)', borderRadius: 12 }}
                        labelFormatter={(_l, payload) => (payload?.[0]?.payload?.date as string) ?? ''}
                        itemStyle={{ color: isLight ? '#0F172A' : '#fff', fontWeight: 700 }}
                        formatter={(v: any) => [fmtINR(Number(v)), `${from}→${to}`]}
                      />
                      <Area type="monotone" dataKey="fare" stroke="#1788FF" strokeWidth={2.5} fill="url(#trendGrad)" isAnimationActive={points.length < 200} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-3">History is held in the data server&apos;s memory and resets when it restarts; longer-term storage requires the database tables to be migrated.</p>
            </div>
          </>
        )}
      </div>
      {showDetail && route && <RouteDetailModal route={route} onClose={() => setShowDetail(false)} />}
    </DashboardLayout>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: string; tone?: 'good' | 'bad'; icon?: React.ReactNode }) {
  return (
    <div className="bg-[#12141C] rounded-2xl border border-white/[0.1] p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{label}</div>
      <div className={`mt-1 flex items-center gap-1.5 text-xl font-mono font-bold ${tone === 'bad' ? 'text-rose-400' : tone === 'good' ? 'text-emerald-400' : 'text-white'}`}>
        {icon}
        {value}
      </div>
    </div>
  );
}
