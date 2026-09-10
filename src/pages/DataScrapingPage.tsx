import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../services/api';
import { 
  Database, RefreshCw, Play, 
  Radio, Terminal, Server, 
  CheckCircle2
} from 'lucide-react';

export function DataScrapingPage() {
  usePageTitle('Live Data Scraping & Ingestion — AeroNex Cluster');
  const queryClient = useQueryClient();

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Scraper status query (polls every 5s)
  const { data: scraperData, refetch } = useQuery({
    queryKey: ['scraperStatus'],
    queryFn: api.getScraperStatus,
    refetchInterval: 5000,
  });

  // Trigger manual scrape mutation
  const triggerMutation = useMutation({
    mutationFn: (crawlerId?: string) => api.triggerScrape(crawlerId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['scraperStatus'] });
      queryClient.invalidateQueries({ queryKey: ['airfareIndexMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setNotification({
        message: `Harvest Complete! ${data?.recordsIngested || 14} new flight records ingested into LiveDataStore. New Index: ${data?.newIndexValue || 138.6} pt.`,
        type: 'success',
      });
      setTimeout(() => setNotification(null), 6000);
    },
  });

  const metrics = scraperData?.metrics || {
    totalScrapesExecuted: 8420,
    totalRecordsIngested: 673410,
    currentRecordsPerSec: 19.8,
    proxyPoolHealth: '99.4% Operational',
    activeWorkers: 5,
    totalWorkers: 5,
    avgLatencyMs: 164,
  };

  const workers = scraperData?.workers || [];
  const recentPayloads = scraperData?.recentPayloads || [];
  const logs = scraperData?.logs || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0D14] via-[#12141F] to-[#161928] border border-white/[0.08] p-6 sm:p-8 shadow-2xl obsidian-card">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Distributed Scraping Pipeline Active</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Live Data Scraping & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-500">Ingestion Cluster</span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Autonomous crawlers harvesting real-time seat inventories, fare classes, and dynamic pricing surges across Indian scheduled airlines and GDS booking gateways.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                onClick={() => triggerMutation.mutate(undefined)}
                disabled={triggerMutation.isPending}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-xl transition-all cursor-pointer ${
                  triggerMutation.isPending
                    ? 'bg-zinc-800 text-zinc-400 border border-white/[0.06]'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-emerald-500/20'
                }`}
              >
                <RefreshCw size={15} className={triggerMutation.isPending ? 'animate-spin' : ''} />
                <span>{triggerMutation.isPending ? 'Crawling Routes...' : 'Trigger Full Ingestion Now'}</span>
              </button>

              <button
                onClick={() => refetch()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#161824] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
              >
                <Radio size={14} className="text-cyan-400" />
                <span>Sync Node Telemetry</span>
              </button>
            </div>
          </div>

          {/* Flash Notification Toast */}
          {notification && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{notification.message}</span>
            </div>
          )}

          {/* Cluster Telemetry Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.06]">
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Total Ingested Records</span>
              <span className="text-white text-xl sm:text-2xl font-black font-mono">
                {metrics.totalRecordsIngested.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Ingestion Velocity</span>
              <span className="text-cyan-400 text-xl sm:text-2xl font-black font-mono">
                {metrics.currentRecordsPerSec} rec/s
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Active Nodes</span>
              <span className="text-emerald-400 text-xl sm:text-2xl font-black font-mono">
                {metrics.activeWorkers} / {metrics.totalWorkers} Online
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Cluster Latency</span>
              <span className="text-white text-xl sm:text-2xl font-black font-mono">
                {metrics.avgLatencyMs} ms
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Active Crawler Nodes Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Server size={18} className="text-cyan-400" />
                <span>Distributed Crawler Nodes</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Active worker instances connecting to airline direct APIs, GDS systems, and aggregator feeds.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Proxy Pool: {metrics.proxyPoolHealth}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((w: any) => (
              <div 
                key={w.id} 
                className="bg-[#12141C] rounded-2xl border border-white/[0.08] p-5 shadow-xl space-y-4 obsidian-card hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-mono font-bold text-cyan-400">{w.carrier}</span>
                        <span className="text-white font-bold text-sm">{w.carrierName}</span>
                      </div>
                      <h4 className="text-xs text-zinc-300 font-medium mt-1 leading-snug">{w.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08] shrink-0">
                      {w.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mt-4 pt-3 border-t border-white/[0.04]">
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono">HARVESTED</span>
                      <span className="text-white font-mono font-bold text-xs">
                        {w.recordsScrapedTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono">LATENCY</span>
                      <span className="text-cyan-400 font-mono font-bold text-xs">{w.latencyMs} ms</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono">ERROR RATE</span>
                      <span className="text-emerald-400 font-mono text-xs">{w.errorRate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono">PROXY</span>
                      <span className="text-zinc-400 font-mono text-[10px] truncate block">{w.proxyPool.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Last: {new Date(w.lastRun).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => triggerMutation.mutate(w.id)}
                    disabled={triggerMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play size={11} />
                    <span>Scrape Node</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Live Scraped Flight Payloads Table */}
        <div className="bg-[#12141C] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-4 obsidian-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database size={16} className="text-cyan-400" />
                <span>Recent Ingested Flight Payloads</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Validated flight records parsed from upstream APIs and stored in the live database.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Showing {recentPayloads.length} recent captures
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-500 font-mono uppercase text-[10.5px]">
                  <th className="py-2.5 px-3">Flight / Carrier</th>
                  <th className="py-2.5 px-3">Corridor</th>
                  <th className="py-2.5 px-3">Base Fare</th>
                  <th className="py-2.5 px-3">Taxes & Fees</th>
                  <th className="py-2.5 px-3">Total Fare</th>
                  <th className="py-2.5 px-3">Surge Mult</th>
                  <th className="py-2.5 px-3">Seats</th>
                  <th className="py-2.5 px-3">Captured At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentPayloads.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{p.flightNumber}</span>
                        <span className="text-[10px] text-zinc-400">({p.carrierName})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">
                      {p.origin} → {p.destination}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-300">
                      ₹{p.baseFare.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500">
                      ₹{p.taxes.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      ₹{p.totalFare.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.dynamicMultiplier > 1.05 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {p.dynamicMultiplier}×
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-300">
                      {p.seatsRemaining}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-zinc-500 font-mono">
                      {new Date(p.scrapedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Live Terminal Stream */}
        <div className="bg-[#090A0F] rounded-2xl border border-white/[0.08] p-5 shadow-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Terminal size={14} className="text-emerald-400" />
              <span className="text-white font-bold">AeroNex Cluster Log Stream</span>
              <span className="text-[10px] text-zinc-600">/dev/scraper-telemetry</span>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto pr-2 text-zinc-300">
            {logs.map((l: any) => (
              <div key={l.id} className="flex items-start gap-2.5 hover:bg-white/[0.02] p-1 rounded">
                <span className="text-zinc-600 text-[10px] shrink-0">
                  {new Date(l.timestamp).toLocaleTimeString()}
                </span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                  l.level === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                  l.level === 'DATA' ? 'bg-cyan-500/20 text-cyan-400' :
                  l.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-zinc-800 text-zinc-300'
                }`}>
                  {l.level}
                </span>
                <span className="text-zinc-500 text-[11px] shrink-0">[{l.crawlerId}]</span>
                <span className="text-zinc-300 text-[11px] leading-relaxed">{l.message}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
