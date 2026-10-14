import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { Calculator, Plane, Users, Clock, XCircle, ExternalLink, Info, TrendingDown, TrendingUp, Landmark } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../services/api';
import {
  AIRLINES, DGCA_CANCELLATION, DGCA_CUMULATIVE, DGCA_LATEST_REPORT, DGCA_LOAD_FACTOR, DGCA_MARKET_SHARE,
  DGCA_MONTHLY, DGCA_OTP, DGCA_SOURCES, type Airline,
} from '../data/dgcaTraffic';

const COLORS: Record<Airline, string> = {
  IndiGo: '#38bdf8',
  'Air India Group': '#f87171',
  'Akasa Air': '#fb923c',
  SpiceJet: '#facc15',
};

const tooltipStyle = { backgroundColor: '#0B0D14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12 };
const pct = (a: number, b: number) => ((a - b) / b) * 100;
const lakh = (v: number | null | undefined) => (v == null ? '—' : `${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`);
const cell = (v: number | null | undefined, suffix = '%') => (v == null ? <span className="text-zinc-600">n/p</span> : `${v}${suffix}`);

export function CPIAnalytics() {
  usePageTitle('CPI Analytics');
  const [showSources, setShowSources] = useState(false);

  // AeroNex's own observed fare index, read from the existing live pipeline (unchanged; read-only here).
  const index = useQuery({ queryKey: ['airPriceIndex'], queryFn: api.getAirPriceIndex, staleTime: 60_000, retry: 0 });

  const ytd = DGCA_CUMULATIVE[DGCA_CUMULATIVE.length - 1];
  const latest = DGCA_MONTHLY[DGCA_MONTHLY.length - 1];
  const latestShare = DGCA_MARKET_SHARE[DGCA_MARKET_SHARE.length - 1];
  const latestOtp = DGCA_OTP[DGCA_OTP.length - 1];
  const latestCxl = DGCA_CANCELLATION[DGCA_CANCELLATION.length - 1];
  const peak = useMemo(
    () => DGCA_MONTHLY.reduce((best, m) => (m.pax2026 != null && (best.pax2026 == null || m.pax2026 > best.pax2026) ? m : best), DGCA_MONTHLY[0]),
    [],
  );

  const shareRows = DGCA_MARKET_SHARE.map(r => ({ label: r.label, ...r.share }));
  const yoyLatest = latest.pax2026 != null && latest.pax2025 != null ? pct(latest.pax2026, latest.pax2025) : null;
  const yoyYtd = pct(ytd.pax2026, ytd.pax2025);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-[1400px] pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0B0D14] via-[#11131C] to-[#151A28] p-6 md:p-8">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Calculator size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">CPI Analytics</h1>
                <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
                  Official Indian domestic aviation demand from DGCA monthly traffic reports — passengers, airline market share,
                  punctuality and cancellations — set against AeroNex's own observed fare index.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <Landmark size={11} /> Source: DGCA
              </span>
              <span className="text-[11px] text-zinc-500">
                Latest report: {DGCA_LATEST_REPORT.month} · published {new Date(DGCA_LATEST_REPORT.published).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={Users} label={`Passengers · ${latest.label} 2026`} value={lakh(latest.pax2026)} change={yoyLatest} sub="vs same month 2025" />
          <Kpi icon={Plane} label={`Passengers · ${ytd.period} 2026`} value={lakh(ytd.pax2026)} change={yoyYtd} sub={`vs ${lakh(ytd.pax2025)} in 2025`} />
          <Kpi icon={Clock} label={`On-time · ${latestOtp.label} (best)`} value={`${latestOtp.otp.IndiGo}%`} sub="IndiGo, 10 major airports" />
          <Kpi icon={XCircle} label={`Cancellation rate · ${latestCxl.label}`} value={`${latestCxl.rate}%`} sub="all scheduled domestic airlines" />
        </div>

        {/* Monthly traffic */}
        <Card
          title="Domestic passengers carried, 2026 vs 2025"
          subtitle={`Lakh passengers per month. Peak month so far: ${peak.label} 2026 (${lakh(peak.pax2026)}). February was not published separately in the sources used, so it is left blank rather than estimated.`}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DGCA_MONTHLY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={44} domain={[100, 'auto']} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(v: any, name: any, p: any) => {
                    const key = name === '2026' ? 'pax2026Precision' : 'pax2025Precision';
                    const prec = p?.payload?.[key];
                    return [v == null ? 'not published' : `${v} lakh${prec && prec !== 'reported' ? ` (${prec})` : ''}`, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pax2025" name="2025" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pax2026" name="2026" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3">
            <strong className="text-zinc-400">reported</strong> = as published · <strong className="text-zinc-400">derived</strong> = exact difference of two DGCA
            year-to-date totals · <strong className="text-zinc-400">rounded</strong> = DGCA only published it to 0.01 crore. Hover a bar to see which.
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market share */}
          <Card title="Domestic market share" subtitle={`Share of passengers carried (%). ${latestShare.label}: IndiGo ${latestShare.share.IndiGo}%, Air India Group ${latestShare.share['Air India Group']}%.`}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={shareRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={36} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n: any) => [v == null ? 'not published' : `${v}%`, n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {AIRLINES.map(a => (
                    <Line key={a} type="monotone" dataKey={a} stroke={COLORS[a]} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {DGCA_MARKET_SHARE.filter(r => r.note).map(r => (
              <p key={r.label} className="text-[11px] text-amber-400/80 mt-2">{r.label}: {r.note}</p>
            ))}
          </Card>

          {/* On-time performance */}
          <Card title="On-time performance" subtitle="Share of flights on time at DGCA's ten major airports (%). n/p = not published for that month.">
            <Table
              headers={['Month', ...AIRLINES]}
              rows={DGCA_OTP.map(r => [r.label, ...AIRLINES.map(a => cell(r.otp[a]))])}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cumulative */}
          <Card title="Year-to-date totals" subtitle="DGCA-published cumulative passengers (lakh).">
            <Table
              headers={['Period', '2026', '2025', 'YoY']}
              rows={DGCA_CUMULATIVE.map(r => {
                const ch = pct(r.pax2026, r.pax2025);
                return [r.period, lakh(r.pax2026), lakh(r.pax2025), <Change key={r.period} value={ch} />];
              })}
            />
          </Card>

          {/* Load factor */}
          <Card title="Passenger load factor" subtitle="Seats filled (%), only months where DGCA figures were published.">
            <Table headers={['Month', ...AIRLINES]} rows={DGCA_LOAD_FACTOR.map(r => [r.label, ...AIRLINES.map(a => cell(r.lf[a]))])} />
          </Card>

          {/* CPI linkage */}
          <Card title="Fares vs demand" subtitle="How AeroNex links this to price inflation.">
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">AeroNex observed fare index</div>
                {index.isPending ? (
                  <div className="mt-1 text-zinc-500">Loading…</div>
                ) : index.isError || !index.data?.data ? (
                  <div className="mt-1 text-zinc-500">Not available right now — it is computed from live scraped fares and needs the AeroNex server.</div>
                ) : (
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white font-mono">{index.data.data.value}</span>
                    <span className="text-zinc-500">
                      {index.data.data.nRoutes} routes · {new Date(index.data.data.computedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
              <p className="flex gap-2 text-zinc-400 leading-relaxed">
                <Info size={14} className="shrink-0 mt-0.5 text-cyan-400" />
                <span>
                  MoSPI's CPI does not publish an air-transport-only sub-index, so AeroNex reads fare movement from its own observed index and
                  demand from DGCA. The two cover different periods (DGCA: Jan–Aug 2026; AeroNex: since it began collecting), so no correlation is
                  claimed until they overlap for several months.
                </span>
              </p>
            </div>
          </Card>
        </div>

        {/* Cancellations */}
        <Card title="Cancellation rate" subtitle="Overall cancellation rate of scheduled domestic airlines (%), months where DGCA published it.">
          <div className="flex flex-wrap gap-3">
            {DGCA_CANCELLATION.map(c => (
              <div key={c.label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 min-w-[110px]">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{c.label} 2026</div>
                <div className="text-lg font-bold font-mono text-white">{c.rate}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sources */}
        <Card
          title="Sources & methodology"
          subtitle="All figures are from DGCA's monthly domestic traffic and on-time performance reports, as published in the coverage below."
          action={
            <button
              type="button"
              onClick={() => setShowSources(s => !s)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              {showSources ? 'Hide sources' : `Show ${Object.keys(DGCA_SOURCES).length} sources`}
            </button>
          }
        >
          {showSources ? (
            <ul className="space-y-2">
              {Object.entries(DGCA_SOURCES).map(([key, s]) => (
                <li key={key} className="flex items-start gap-2 text-xs">
                  <ExternalLink size={12} className="shrink-0 mt-0.5 text-zinc-500" />
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-cyan-300 hover:underline">
                    {s.title}
                  </a>
                  <span className="text-zinc-600 shrink-0">{s.published}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-400">
              Nothing on this page is estimated. Verify figures against the original DGCA reports at{' '}
              <a href="https://www.dgca.gov.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">dgca.gov.in</a> before
              citing them externally.
            </p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Card({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#12141C]/80 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Kpi({ icon: Icon, label, value, change, sub }: { icon: any; label: string; value: string; change?: number | null; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#12141C]/80 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
        <Icon size={13} className="text-cyan-400" /> <span className="truncate">{label}</span>
      </div>
      <div className="mt-2 text-xl md:text-2xl font-bold font-mono text-white">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
        {change != null && <Change value={change} />}
        {sub && <span className="truncate">{sub}</span>}
      </div>
    </div>
  );
}

function Change({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
      <Icon size={12} /> {up ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-zinc-500 text-left">
            {headers.map(h => (
              <th key={h} className="font-medium pb-2 pr-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/[0.05] text-zinc-200">
              {r.map((c, j) => (
                <td key={j} className={`py-2 pr-3 whitespace-nowrap ${j === 0 ? 'text-zinc-400' : 'font-mono'}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
