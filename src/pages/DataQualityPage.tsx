import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  CheckCircle2, AlertTriangle, XCircle, Database, 
  RefreshCw, ShieldCheck 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function DataQualityPage() {
  usePageTitle('Data Quality & Coverage');

  const { refetch, isFetching } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    staleTime: 6000,
  });

  const qualityMetrics = [
    { label: 'Overall Quality Index', value: '99.4%', status: 'good', desc: 'Composite audit grade metric', threshold: '>98.0%' },
    { label: 'Missing Fields / Nulls', value: '0.04%', status: 'good', desc: 'Mandatory fields completeness', threshold: '<1.0%' },
    { label: 'Duplicate Quotes Filtered', value: '1.2%', status: 'good', desc: 'Identical payload deduplication', threshold: '<3.0%' },
    { label: 'Outliers & Spurious Fares', value: '0.8%', status: 'good', desc: 'Fares outside 0.1x - 10x median', threshold: '<2.0%' },
    { label: 'Corridor Route Coverage', value: '98.2%', status: 'good', desc: '184 of 188 targeted city-pairs', threshold: '>95.0%' },
    { label: 'Airline Fleet Coverage', value: '100%', status: 'good', desc: 'All 7 scheduled domestic carriers', threshold: '100%' },
  ];

  const sourceHealth = [
    { source: 'IndiGo Web Booking API (6E)', type: 'Airline Feed', status: 'good', uptime: '99.9%', latency: '180ms', quotesToday: '42,800', lastIngested: '18s ago' },
    { source: 'Air India Direct Channel (AI)', type: 'Airline Feed', status: 'good', uptime: '99.7%', latency: '240ms', quotesToday: '34,200', lastIngested: '24s ago' },
    { source: 'SpiceJet Scheduled Parser (SG)', type: 'Airline Feed', status: 'good', uptime: '98.8%', latency: '310ms', quotesToday: '18,500', lastIngested: '30s ago' },
    { source: 'Akasa Air Network Ingestion (QP)', type: 'Airline Feed', status: 'good', uptime: '99.8%', latency: '190ms', quotesToday: '12,400', lastIngested: '15s ago' },
    { source: 'MakeMyTrip Aggregator Feed', type: 'OTA Portal', status: 'good', uptime: '99.4%', latency: '220ms', quotesToday: '84,000', lastIngested: '12s ago' },
    { source: 'EaseMyTrip Secondary Scraper', type: 'OTA Portal', status: 'good', uptime: '99.1%', latency: '260ms', quotesToday: '62,100', lastIngested: '22s ago' },
    { source: 'UDAN Regional Hub Pipeline', type: 'Gov GDS', status: 'warning', uptime: '96.2%', latency: '540ms', quotesToday: '4,800', lastIngested: '2m ago' },
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'good') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 size={11} /> Good
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={11} /> Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
        <XCircle size={11} /> Critical
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                  Audit Grade
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  Data Governance
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Data Quality & Ingestion Coverage Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive data hygiene and provenance telemetry ensuring every airfare observation is valid, deduplicated, and audit-verifiable for official statistics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F2A4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                {isFetching ? 'Auditing...' : 'Run Pipeline Audit'}
              </button>
            </div>
          </div>
        </div>

        {/* 6 Data Quality KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {qualityMetrics.map((m, i) => (
            <div key={i} className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                  {getStatusBadge(m.status)}
                </div>
                <div className="text-2xl font-extrabold text-[#0F2A4A] dark:text-white tabular-nums">{m.value}</div>
                <p className="text-[10.5px] text-slate-500 mt-1">{m.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400">
                Target: {m.threshold}
              </div>
            </div>
          ))}
        </div>

        {/* Source Health Matrix Table */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B101D] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] dark:text-white">
                Ingestion Source Health & Telemetry
              </h3>
              <span className="text-[11px] text-slate-400">
                Live monitoring of airline endpoints, web parsers, and aggregator feeds
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
              7 of 7 Sources Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-[#080D1A] text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">Ingestion Endpoint</th>
                  <th className="py-3 px-4">Source Category</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4">Uptime SLA</th>
                  <th className="py-3 px-4">Response Latency</th>
                  <th className="py-3 px-4">Quotes Ingested Today</th>
                  <th className="py-3 px-6 text-right">Last Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {sourceHealth.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Database size={13} className="text-blue-600" />
                      {s.source}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{s.type}</td>
                    <td className="py-3 px-4">{getStatusBadge(s.status)}</td>
                    <td className="py-3 px-4 font-mono">{s.uptime}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{s.latency}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0F2A4A] dark:text-white">{s.quotesToday}</td>
                    <td className="py-3 px-6 text-right font-mono text-[11px] text-slate-400">{s.lastIngested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality Rules Card */}
        <div className="bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-600" />
            Quality Control Standards & Validation Protocols
          </h4>
          <p>
            1. <strong>Format & Schema Validation:</strong> Every scraped fare is parsed against rigid Zod schemas ensuring non-negative currency, valid IATA airport codes, and verified timestamp stamps.
          </p>
          <p>
            2. <strong>Deduplication Engine:</strong> Duplicate quotes received within the same 60-second window across multiple OTAs are merged using minimum observed non-stop tariff.
          </p>
          <p>
            3. <strong>Outlier Trimming:</strong> Extreme price distortions ($Z \ge 3.5$) caused by typographical booking bugs or currency conversion errors are isolated for human verification before index calculation.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
