import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { api, ApiError, hasAccountSession } from '../services/api';
import { useDataStatus } from '../hooks/useDataStatus';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../components/StateViews';
import { RouteDetailModal } from '../components/RouteDetailModal';
import { Database, RefreshCw, Terminal, CheckCircle2, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';

const pct = (v: number | null | undefined) => (v == null ? '—' : `${v}%`);

export function DataScrapingPage() {
  usePageTitle('Data Pipeline - AeroNex');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const feed = useDataStatus();
  const signedIn = hasAccountSession();
  const [notice, setNotice] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const [openRoute, setOpenRoute] = useState<string | null>(null);

  const status = useQuery({
    queryKey: ['pipelineStatus'],
    queryFn: api.getScraperStatus,
    enabled: signedIn,
    refetchInterval: 15_000,
    retry: 1,
  });

  const run = useMutation({
    mutationFn: () => api.triggerScrape(),
    onSuccess: (data: any) => {
      ['pipelineStatus', 'dashboardMetrics', 'routeChanges', 'routes', 'chartData', 'dataStatus'].forEach(k => queryClient.invalidateQueries({ queryKey: [k] }));
      setNotice({
        text: `Refresh complete: ${data?.recordsIngested ?? 0} observations validated${data?.flagged ? `, ${data.flagged} flagged as outliers` : ''} in ${data?.executionTimeMs ?? '?'}ms.`,
        tone: 'ok',
      });
    },
    onError: (err: unknown) => setNotice({ text: err instanceof ApiError || err instanceof Error ? err.message : 'The refresh failed.', tone: 'error' }),
  });

  const d: any = status.data;
  const m = d?.metrics;
  const observations: any[] = d?.recentObservations ?? [];
  const logs: any[] = d?.logs ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0D14] via-[#12141F] to-[#161928] border border-white/[0.08] p-6 sm:p-8 shadow-2xl obsidian-card">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <DataSourceBadge showAge />
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-500">Pipeline</span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                What the ingestion worker actually did: where fares come from, how many observations passed validation, which were flagged as outliers, and when the last refresh
                succeeded.
              </p>
              {feed.status?.mode === 'simulated' && (
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 max-w-2xl">
                  This deployment is running on a <strong>simulated market model</strong>, not real airline fares. To ingest real fares, set Amadeus credentials on the server (see the README).
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setNotice(null);
                  run.mutate();
                }}
                disabled={run.isPending || !signedIn}
                title={signedIn ? 'Run one ingestion cycle now' : 'Sign in with an account to run the pipeline'}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-xl transition-all cursor-pointer bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={15} className={run.isPending ? 'animate-spin' : ''} />
                <span>{run.isPending ? 'Refreshing…' : 'Refresh data now'}</span>
              </button>
            </div>
          </div>

          {notice && (
            <div
              role={notice.tone === 'error' ? 'alert' : 'status'}
              className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                notice.tone === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {notice.tone === 'error' ? <AlertTriangle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
              <span>{notice.text}</span>
            </div>
          )}

          {/* Real quality counters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t border-white/[0.06]">
            <Tile label="Refresh cycles" value={m ? String(m.cycles) : '—'} />
            <Tile label="Failed cycles" value={m ? String(m.failedCycles) : '—'} tone={m?.failedCycles ? 'bad' : undefined} />
            <Tile label="Validation pass rate" value={pct(m?.validationPassRate)} tone="good" />
            <Tile label="Outliers flagged" value={m ? `${m.outliersFlagged}` : '—'} sub={m?.outlierRate != null ? `${m.outlierRate}% of observations` : undefined} />
            <Tile label="Last cycle" value={m?.lastDurationMs != null ? `${m.lastDurationMs}ms` : '—'} />
          </div>
        </div>

        {!signedIn ? (
          <div className="bg-[#12141C] rounded-2xl border border-white/[0.08] p-8 text-center">
            <Lock size={22} className="mx-auto text-zinc-500 mb-2" />
            <p className="text-white font-semibold">Sign in to see pipeline details</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Observation-level telemetry is available to signed-in accounts. Guests can still see the feed status above.
            </p>
            <button type="button" onClick={() => navigate('/login')} className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer">
              Sign in
            </button>
          </div>
        ) : status.isPending ? (
          <LoadingBlock label="Loading pipeline telemetry…" />
        ) : status.isError ? (
          <ErrorBlock error={status.error} onRetry={() => status.refetch()} title="Couldn't load pipeline telemetry" />
        ) : (
          <>
            {/* Source */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database size={18} className="text-cyan-400" />
                <span>Data source</span>
              </h2>
              <div className="bg-[#12141C] rounded-2xl border border-white/[0.08] p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <Field label="Provider" value={d.dataSource.provider} />
                <Field label="Mode" value={d.dataSource.mode === 'live' ? 'Live market data' : 'Simulated (not real fares)'} />
                <Field label="Last successful refresh" value={d.dataSource.lastCycleAt ? new Date(d.dataSource.lastCycleAt).toLocaleString('en-IN') : 'Not yet'} />
                <Field label="Refresh interval" value={`${d.dataSource.refreshIntervalSec}s`} />
                {d.dataSource.lastError && <Field label="Last error" value={d.dataSource.lastError} className="sm:col-span-2 lg:col-span-4 text-amber-400" />}
              </div>
            </div>

            {/* Observations */}
            <div className="bg-[#12141C] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-4 obsidian-card">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cyan-400" />
                  <span>Recent observations</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Validated fare records. A record is flagged when its fare moved more than 12% from the previous observation on the same route.</p>
              </div>

              {observations.length === 0 ? (
                <EmptyBlock title="No observations yet" description="They appear after the first successful refresh." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-zinc-500 font-mono uppercase text-[10.5px]">
                        <th className="py-2.5 px-3">Flight</th>
                        <th className="py-2.5 px-3">Route</th>
                        <th className="py-2.5 px-3">Fare</th>
                        <th className="py-2.5 px-3">Δ vs previous</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Captured</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {observations.map(o => (
                        <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-white">{o.flightNumber}</td>
                          <td className="py-2.5 px-3">
                            <button type="button" onClick={() => setOpenRoute(`${o.origin}-${o.destination}`)} className="font-mono text-cyan-300 font-semibold hover:underline cursor-pointer">
                              {o.origin} → {o.destination}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white">₹{o.fare.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 font-mono text-zinc-300">{o.deviationPct == null ? '—' : `${o.deviationPct > 0 ? '+' : ''}${o.deviationPct}%`}</td>
                          <td className="py-2.5 px-3">
                            {o.flagged ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                                <AlertTriangle size={10} /> Flagged
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                <CheckCircle2 size={10} /> Normal
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-zinc-500 font-mono">{new Date(o.capturedAt).toLocaleTimeString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Log */}
            <div className="bg-[#090A0F] rounded-2xl border border-white/[0.08] p-5 shadow-2xl space-y-3 font-mono">
              <div className="flex items-center gap-2 text-xs text-zinc-400 pb-2 border-b border-white/[0.06]">
                <Terminal size={14} className="text-emerald-400" />
                <span className="text-white font-bold">Pipeline log</span>
              </div>
              <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto pr-2 text-zinc-300">
                {logs.length === 0 && <p className="text-zinc-500">No log entries yet.</p>}
                {logs.map(l => (
                  <div key={l.id} className="flex items-start gap-2.5 p-1 rounded">
                    <span className="text-zinc-600 text-[10px] shrink-0">{new Date(l.timestamp).toLocaleTimeString('en-IN')}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 rounded shrink-0 ${
                        l.level === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : l.level === 'ERROR' ? 'bg-rose-500/20 text-rose-400' : l.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {l.level}
                    </span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed">{l.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {openRoute && <RouteDetailModal route={openRoute} onClose={() => setOpenRoute(null)} />}
    </DashboardLayout>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad' }) {
  return (
    <div>
      <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">{label}</span>
      <span className={`text-xl sm:text-2xl font-black font-mono ${tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-rose-400' : 'text-white'}`}>{value}</span>
      {sub && <span className="text-[10px] text-zinc-500 block">{sub}</span>}
    </div>
  );
}

function Field({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">{label}</span>
      <span className="text-white break-words">{value}</span>
    </div>
  );
}
