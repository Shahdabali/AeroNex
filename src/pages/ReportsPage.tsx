import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../services/api';
import { useDataStatus } from '../hooks/useDataStatus';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { FileText, Download, TrendingUp, Database, BarChart3, CheckCircle2, AlertCircle, RefreshCw, Map } from 'lucide-react';

/** Reports are generated on demand from the data AeroNex currently holds; nothing here is pre-written. */

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows: unknown[][]) => rows.map(r => r.map(csvCell).join(',')).join('\n');

interface ReportDef {
  id: string;
  title: string;
  description: string;
  icon: any;
  build: () => Promise<{ header: string[]; rows: unknown[][] }>;
}

const REPORTS: ReportDef[] = [
  {
    id: 'basket',
    title: 'Index basket snapshot',
    description: 'Every corridor in the airfare index with its baseline fare, weight, latest observed fare and deviation from baseline.',
    icon: BarChart3,
    build: async () => {
      const basket = (await api.getIndexBasket()) as any[];
      return {
        header: ['route', 'weight_pct', 'baseline_inr', 'current_fare_inr', 'vs_baseline_pct', 'last_change_pct'],
        rows: basket.map(b => [b.route, b.weightPct, b.baseline, b.currentFare, b.vsBaselinePct, b.changePct]),
      };
    },
  },
  {
    id: 'routes',
    title: 'Observed route fares',
    description: 'Latest and previous observed fare for every tracked route, with the timestamp of the last update.',
    icon: Database,
    build: async () => {
      const routes = (await api.getRoutes()) as any[];
      return {
        header: ['route', 'current_fare_inr', 'previous_fare_inr', 'change_pct', 'last_updated'],
        rows: routes.map(r => [r.route, r.currentFare, r.previousFare, r.previousFare ? +(((r.currentFare - r.previousFare) / r.previousFare) * 100).toFixed(2) : '', r.lastUpdated]),
      };
    },
  },
  {
    id: 'history',
    title: 'Index history (24h)',
    description: 'The national airfare index as recorded over the last 24 hours.',
    icon: TrendingUp,
    build: async () => {
      const series = (await api.getChartData('24h')) as any[];
      return { header: ['timestamp', 'label', 'index_value'], rows: series.map(p => [p.timestamp ?? '', p.time, p.value]) };
    },
  },
  {
    id: 'regional',
    title: 'Regional indices',
    description: 'Current airfare index for each region (baseline = 100) and its change since the previous refresh.',
    icon: Map,
    build: async () => {
      const regional = (await api.getRegionalIndex()) as any[];
      return { header: ['region', 'index_value', 'change_pct'], rows: regional.map(r => [r.region, r.value, r.change]) };
    },
  },
];

export function ReportsPage() {
  usePageTitle('Reports - AeroNex');
  const feed = useDataStatus();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const generate = async (report: ReportDef) => {
    if (busy) return;
    setBusy(report.id);
    setNotice(null);
    try {
      const { header, rows } = await report.build();
      if (rows.length === 0) throw new Error('There is no data to include yet. Try again after the next data refresh.');
      const meta = [
        [`# AeroNex report: ${report.title}`],
        [`# Generated: ${new Date().toISOString()}`],
        [`# Data source: ${feed.status ? `${feed.status.provider} (${feed.status.mode})` : 'unknown'}`]
      ];
      const csv = `${toCsv(meta)}\n${toCsv([header, ...rows])}\n`;
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `AeroNex_${report.id}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotice({ tone: 'ok', text: `${report.title} downloaded (${rows.length} rows).` });
    } catch (err: any) {
      setNotice({ tone: 'error', text: err?.message || 'Could not generate the report.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Reports &amp; Data Exports</h1>
            <DataSourceBadge />
          </div>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            CSV exports generated on demand from the data AeroNex currently holds. Each file records when it was generated and which data source it came from.
          </p>
        </div>

        {notice && (
          <div
            role={notice.tone === 'error' ? 'alert' : 'status'}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${notice.tone === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}
          >
            {notice.tone === 'error' ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
            {notice.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORTS.map(report => {
            const Icon = report.icon;
            const running = busy === report.id;
            return (
              <div key={report.id} className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-white font-bold text-sm flex items-center gap-2">
                      {report.title}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">CSV</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{report.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => generate(report)}
                  disabled={busy !== null}
                  className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {running ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                  {running ? 'Generating…' : 'Generate & download'}
                </button>
              </div>
            );
          })}
        </div>

        <p className="flex items-center gap-2 text-[11px] text-zinc-500">
          <FileText size={12} /> Files use standard RFC 4180 CSV and open in Excel, Google Sheets, Python and R.
        </p>
      </div>
    </DashboardLayout>
  );
}
