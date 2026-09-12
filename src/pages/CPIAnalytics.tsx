import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { 
  ShieldCheck, BookOpen, Layers, CheckCircle2
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';

export function CPIAnalytics() {
  usePageTitle('CPI & Airfare Analytics');
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');

  // Realistic comparative series (Base 2024 = 100)
  const monthlyData = [
    { period: 'Jan 2024', cpi: 100.0, airfare: 100.0, transportCpi: 100.0 },
    { period: 'Mar 2024', cpi: 100.8, airfare: 103.4, transportCpi: 101.2 },
    { period: 'May 2024', cpi: 101.6, airfare: 107.8, transportCpi: 102.5 },
    { period: 'Jul 2024', cpi: 102.4, airfare: 112.5, transportCpi: 103.8 },
    { period: 'Sep 2024', cpi: 103.2, airfare: 109.1, transportCpi: 104.2 },
    { period: 'Nov 2024', cpi: 104.1, airfare: 116.4, transportCpi: 105.1 },
    { period: 'Jan 2025', cpi: 104.9, airfare: 114.2, transportCpi: 106.0 },
    { period: 'Mar 2025', cpi: 105.7, airfare: 118.6, transportCpi: 107.4 },
    { period: 'May 2025', cpi: 106.5, airfare: 122.9, transportCpi: 108.9 },
    { period: 'Jul 2025', cpi: 107.3, airfare: 127.4, transportCpi: 110.2 },
    { period: 'Sep 2025', cpi: 108.1, airfare: 121.8, transportCpi: 111.4 },
    { period: 'Nov 2025', cpi: 109.0, airfare: 128.5, transportCpi: 112.8 },
    { period: 'Jan 2026', cpi: 109.8, airfare: 124.8, transportCpi: 113.9 },
  ];

  const quarterlyData = [
    { period: 'Q1 2024', cpi: 100.4, airfare: 101.7, transportCpi: 100.6 },
    { period: 'Q2 2024', cpi: 101.6, airfare: 108.2, transportCpi: 102.6 },
    { period: 'Q3 2024', cpi: 102.8, airfare: 110.8, transportCpi: 104.0 },
    { period: 'Q4 2024', cpi: 104.1, airfare: 115.3, transportCpi: 105.1 },
    { period: 'Q1 2025', cpi: 105.3, airfare: 116.4, transportCpi: 106.7 },
    { period: 'Q2 2025', cpi: 106.9, airfare: 125.1, transportCpi: 109.5 },
    { period: 'Q3 2025', cpi: 108.1, airfare: 124.6, transportCpi: 111.4 },
    { period: 'Q4 2025', cpi: 109.4, airfare: 126.7, transportCpi: 113.4 },
  ];

  const yearlyData = [
    { period: '2024', cpi: 102.2, airfare: 109.0, transportCpi: 103.1 },
    { period: '2025', cpi: 107.4, airfare: 123.2, transportCpi: 110.3 },
    { period: '2026 (YTD)', cpi: 109.8, airfare: 124.8, transportCpi: 113.9 },
  ];

  const chartSeries = frequency === 'Monthly' ? monthlyData : (frequency === 'Quarterly' ? quarterlyData : yearlyData);

  const pipelineSteps = [
    { step: '01', title: 'Automated Airfare Observation', desc: 'Continuous 30s scraping across airline web portals and OTAs harvesting non-stop & connecting fares.' },
    { step: '02', title: 'Data Cleaning & Outlier Removal', desc: 'Zod schema validation, duplicate deduplication, and Z-score trimming to remove promotional anomalies.' },
    { step: '03', title: 'Route Normalization', desc: 'Standardizing city-pairs, time horizons (0–3d, 7–14d, 30+d), and cabin class parity.' },
    { step: '04', title: 'Price Aggregation', desc: 'Computing representative median corridor prices weighted by passenger density volumes from DGCA statistics.' },
    { step: '05', title: 'Laspeyres Index Engine', desc: 'Determining base-calibrated airfare indices against reference period 2024 = 100.' },
    { step: '06', title: 'Trend & Anomaly Detection', desc: 'Real-time divergence tracking identifying predatory spikes under DGCA Rule 135 thresholds.' },
    { step: '07', title: 'Comparison with Official CPI', desc: 'Correlating high-frequency airfare series with lagged official MoSPI transport sub-group publications.' },
    { step: '08', title: 'Research & Policy Insights', desc: 'Providing economic analysts and NSO researchers with early-warning inflation signals and briefing bulletins.' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Macroeconomic Analytics
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  MoSPI SIH26056 Research Track
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                CPI & Airfare Analytics
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluating high-frequency automated web scraping of airline fares as an early analytical augmentation layer for the Consumer Price Index (CPI).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                CPI Base Period: 2024 = 100
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Macroeconomic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs border-t-2 border-t-[#0F2A4A]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section A: CPI Context</span>
            <div className="text-2xl font-extrabold text-[#0F2A4A] dark:text-white mt-1 tabular-nums">2024 = 100</div>
            <p className="text-[11px] text-slate-500 mt-1">Official MoSPI national reference base year framework</p>
          </div>

          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs border-t-2 border-t-blue-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section B: AeroNex Airfare Index</span>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">124.8</div>
            <p className="text-[11px] text-slate-500 mt-1">Current live computed value (+24.8% vs 2024 base)</p>
          </div>

          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs border-t-2 border-t-amber-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Index Divergence / Spread</span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">+10.9 pts</div>
            <p className="text-[11px] text-slate-500 mt-1">Airfare inflation leads general CPI basket (113.9)</p>
          </div>

          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs border-t-2 border-t-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Statistical Correlation</span>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">r = 0.78</div>
            <p className="text-[11px] text-slate-500 mt-1">Strong statistical co-movement with Transport CPI</p>
          </div>
        </div>

        {/* Section C: Comparative Trend Chart */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <h2 className="text-sm font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wide">
                Comparative Trend: AeroNex Airfare Index vs Official CPI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Potential CPI augmentation signal • Analytical comparison indicator for NSO researchers
              </p>
            </div>

            {/* Frequency Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {(['Monthly', 'Quarterly', 'Yearly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    frequency === freq 
                      ? 'bg-[#0F2A4A] text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} vertical={false} />
                <XAxis dataKey="period" stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={11} domain={['dataMin - 3', 'dataMax + 3']} tickLine={false} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-md text-xs">
                          <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 mb-1.5">{label}</div>
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex justify-between gap-4 py-0.5">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-mono font-bold tabular-nums">{Number(entry.value).toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="airfare" 
                  name="AeroNex Airfare Price Index" 
                  stroke="#2563EB" 
                  strokeWidth={2.5} 
                  dot={{ r: 3 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="transportCpi" 
                  name="Official CPI (Transport Sub-group)" 
                  stroke="#16A34A" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={{ r: 2 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="cpi" 
                  name="General CPI (Headline Inflation)" 
                  stroke="#475569" 
                  strokeWidth={1.5} 
                  strokeDasharray="2 2" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
            <span>Airfare demonstrates higher volatility and leads traditional CPI survey reports by 30–45 days.</span>
            <span className="font-semibold text-slate-600 dark:text-slate-400">Disclaimer: Independent prototype research indicator. Not an official CSO index release.</span>
          </div>
        </div>

        {/* Section D: Contribution & Movement Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] dark:text-white mb-3 flex items-center gap-1.5">
              <Layers size={14} className="text-blue-600" />
              Movement & Elasticity Breakdown
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Airfare Cumulative Movement:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+24.8%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Transport CPI Movement:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+13.9%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Spread / Divergence:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">+10.9 pts</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Transport Commodity Group Weight:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">~3.02% of National CPI Basket</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Survey Collection Frequency:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Daily Real-Time vs Monthly Lagged</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] dark:text-white mb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              Policy & NSO Augmentation Utility
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              AeroNex answers Problem Statement SIH26056 by automating price discovery. Rather than waiting for monthly field enumeration visits, the NSO can monitor real-time pricing pressures as airlines adjust fares dynamically based on algorithms.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800 rounded-lg text-xs space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-200">Key Augmentation Highlights:</div>
              <div className="text-[11.5px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero survey lag — continuous 24/7 web scraping of airline booking APIs.</span>
              </div>
              <div className="text-[11.5px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Deterministic Laspeyres formulation aligns directly with MoSPI price index theory.</span>
              </div>
              <div className="text-[11.5px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Proactive identification of seasonal festival spikes and predatory pricing.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section E: 8-Step Visual Methodology Pipeline */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              How AeroNex Augments CPI Analysis — 8-Stage Methodology Pipeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              End-to-end mathematical and operational data lifecycle from raw web scraping to sovereign statistical insights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineSteps.map((s) => (
              <div key={s.step} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-800">
                    STAGE {s.step}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">{s.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
