import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { CheckCircle2, Search, Info } from 'lucide-react';

export function DataSourcesPage() {
  usePageTitle('Data Sources & Provenance');
  const [searchTerm, setSearchTerm] = useState('');

  const sourcesList = [
    {
      name: 'IndiGo Web Booking Portal',
      operator: 'InterGlobe Aviation Ltd',
      iata: '6E',
      type: 'Direct Airline Feeds',
      collectionMethod: 'Automated Headless Web Scraper',
      frequency: 'Every 30 Seconds',
      routesCovered: '104 Domestic Corridors',
      dataStatus: 'Validated',
      sampleQuote: 'DEL-BOM • ₹5,420 (INR)',
      lastIngested: '2026-09-12 22:45 IST',
      protocol: 'TLS 1.3 / REST JSON API'
    },
    {
      name: 'Air India Booking Engine',
      operator: 'Air India Limited (Tata Group)',
      iata: 'AI',
      type: 'Direct Airline Feeds',
      collectionMethod: 'Automated Ingestion Worker',
      frequency: 'Every 30 Seconds',
      routesCovered: '85 Domestic Corridors',
      dataStatus: 'Validated',
      sampleQuote: 'DEL-BLR • ₹6,850 (INR)',
      lastIngested: '2026-09-12 22:45 IST',
      protocol: 'TLS 1.3 / Direct Channel'
    },
    {
      name: 'SpiceJet Scheduled Portal',
      operator: 'SpiceJet Limited',
      iata: 'SG',
      type: 'Direct Airline Feeds',
      collectionMethod: 'Scheduled Web Scraper',
      frequency: 'Every 60 Seconds',
      routesCovered: '38 Domestic Corridors',
      dataStatus: 'Validated',
      sampleQuote: 'BOM-GOI • ₹3,620 (INR)',
      lastIngested: '2026-09-12 22:44 IST',
      protocol: 'HTTPS / Web Parser'
    },
    {
      name: 'Akasa Air Network Feeds',
      operator: 'SNV Aviation Pvt Ltd',
      iata: 'QP',
      type: 'Direct Airline Feeds',
      collectionMethod: 'Automated Ingestion Worker',
      frequency: 'Every 30 Seconds',
      routesCovered: '24 Domestic Corridors',
      dataStatus: 'Validated',
      sampleQuote: 'BLR-HYD • ₹3,450 (INR)',
      lastIngested: '2026-09-12 22:45 IST',
      protocol: 'HTTPS / JSON Endpoint'
    },
    {
      name: 'MakeMyTrip Aggregator Feed',
      operator: 'MakeMyTrip (India) Pvt Ltd',
      iata: 'OTA-MMT',
      type: 'Online Travel Aggregators (OTA)',
      collectionMethod: 'Multi-Carrier Comparison Ingestion',
      frequency: 'Every 45 Seconds',
      routesCovered: '180+ Domestic Corridors',
      dataStatus: 'Validated',
      sampleQuote: 'Cross-Airline Fare Aggregation',
      lastIngested: '2026-09-12 22:45 IST',
      protocol: 'Public API / Headless Parser'
    },
    {
      name: 'EaseMyTrip Travel Aggregator',
      operator: 'Easy Trip Planners Ltd',
      iata: 'OTA-EMT',
      type: 'Online Travel Aggregators (OTA)',
      collectionMethod: 'Multi-Carrier Comparison Ingestion',
      frequency: 'Every 60 Seconds',
      routesCovered: '160+ Domestic Corridors',
      dataStatus: 'Validated',
      sampleQuote: 'Secondary Tariff Verification',
      lastIngested: '2026-09-12 22:44 IST',
      protocol: 'Public API'
    },
  ];

  const filtered = sourcesList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Data Governance
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                  DEMO MODE — Simulated Observations
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Data Sources & Provenance Register
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Transparent auditing of data origin, collection protocols, scraping frequency, and verification status across all airline endpoints and aggregators.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono">
              <span className="text-slate-400 block text-[9.5px] uppercase font-sans">Simulated Demonstration Environment</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">In-Memory LiveDataStore Active</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by source or operator name..."
              className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} Provenance Channels Documented
          </span>
        </div>

        {/* Data Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((src, i) => (
            <div key={i} className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono uppercase block">
                      {src.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {src.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">{src.operator}</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {src.iata}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Collection Method:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{src.collectionMethod}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Polling Cycle:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{src.frequency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Corridors Covered:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{src.routesCovered}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Security Protocol:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">{src.protocol}</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Representative Quote</span>
                  <span className="font-bold text-[#0F2A4A] dark:text-white">{src.sampleQuote}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">{src.lastIngested}</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={12} /> {src.dataStatus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Data Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
          <Info size={16} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-bold block mb-0.5">Demarcation of Demonstration Data:</span>
            In development and sandbox testing without live production proxy rotation or carrier scraper credentials, AeroNex executes a deterministic in-memory `LiveDataStore` simulating live Indian market fluctuations. Simulated observations are clearly labelled to preserve academic and audit integrity.
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
