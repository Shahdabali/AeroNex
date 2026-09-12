import { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  Database, Sliders, Calculator, 
  ShieldAlert, BookOpen, Layers, Filter 
} from 'lucide-react';

interface CorridorWeight {
  route: string;
  name: string;
  weight: number;
  baseFare: number;
  currentFare: number;
}

const DEFAULT_CORRIDORS: CorridorWeight[] = [
  { route: 'DEL-BOM', name: 'Delhi — Mumbai', weight: 0.224, baseFare: 4800, currentFare: 5420 },
  { route: 'BOM-BLR', name: 'Mumbai — Bengaluru', weight: 0.148, baseFare: 4100, currentFare: 4280 },
  { route: 'DEL-BLR', name: 'Delhi — Bengaluru', weight: 0.121, baseFare: 6200, currentFare: 6850 },
  { route: 'CCU-DEL', name: 'Kolkata — Delhi', weight: 0.096, baseFare: 4900, currentFare: 5120 },
  { route: 'DEL-GOI', name: 'Delhi — Goa', weight: 0.072, baseFare: 5500, currentFare: 6750 },
  { route: 'HYD-DEL', name: 'Hyderabad — Delhi', weight: 0.068, baseFare: 4500, currentFare: 4680 },
  { route: 'BLR-HYD', name: 'Bengaluru — Hyderabad', weight: 0.055, baseFare: 3100, currentFare: 3450 },
];

export function MethodologyPage() {
  usePageTitle('Methodology & Statistical Documentation');

  const [corridors, setCorridors] = useState<CorridorWeight[]>(DEFAULT_CORRIDORS);

  // Dynamic Laspeyres Calculation
  const computedIndex = useMemo(() => {
    let sumCurrentWeighted = 0;
    let sumBaseWeighted = 0;
    corridors.forEach(c => {
      sumCurrentWeighted += c.currentFare * c.weight;
      sumBaseWeighted += c.baseFare * c.weight;
    });
    return ((sumCurrentWeighted / (sumBaseWeighted || 1)) * 100).toFixed(1);
  }, [corridors]);

  const pipelineStages = [
    { name: 'DATA', desc: 'Continuous Scraping', icon: Database },
    { name: 'VALIDATION', desc: 'Zod Format Check', icon: Filter },
    { name: 'NORMALIZATION', desc: 'Fare Harmonization', icon: Sliders },
    { name: 'WEIGHTING', desc: 'DGCA Volume Share', icon: Layers },
    { name: 'INDEX ENGINE', desc: 'Laspeyres 2024=100', icon: Calculator },
    { name: 'QUALITY CONTROL', desc: 'Outlier & Z-Score', icon: ShieldAlert },
    { name: 'CPI ANALYTICS', desc: 'MoSPI Augmentation', icon: BookOpen },
  ];

  const sections = [
    {
      num: '01',
      title: 'Objective & Problem Statement Alignment',
      content: 'AeroNex is engineered specifically to answer Smart India Hackathon Problem Statement SIH26056 issued by the Ministry of Statistics and Programme Implementation (MoSPI): "Development of a Real-time Airfare Price Index for India through Automated Web Scraping of Airline and Online Travel Aggregator Portals for Augmentation of the Consumer Price Index (CPI)". The goal is to provide sovereign statisticians with a real-time, high-frequency price discovery signal that bridges the 30–45 day survey lag in traditional price collection.'
    },
    {
      num: '02',
      title: 'Data Collection Framework',
      content: 'Price quote streams are harvested at continuous 30-second cycles across all 7 scheduled Indian domestic airlines (IndiGo, Air India, Vistara, SpiceJet, Akasa Air, AirAsia India, Alliance Air) alongside major Online Travel Aggregators (OTAs). The system monitors non-stop and one-stop economy tickets across 184 domestic city-pairs.'
    },
    {
      num: '03',
      title: 'Data Cleaning & Deduplication',
      content: 'Inbound raw payloads pass through rigid server-side Zod validation pipelines. Mandatory airport IATA codes, flight identifiers, base tariffs, and tax components are parsed. Unbundled ancillary charges (seat selection, baggage, insurance) are stripped. Duplicate quotes recorded within identical 60-second windows across multiple portals are merged into a unified representative observation.'
    },
    {
      num: '04',
      title: 'Route Normalization & Price Harmonization',
      content: 'Airfares exhibit extreme temporal variance. AeroNex stratifies observations by booking horizon: 0–3 days (Spot / Emergency), 4–7 days (Near Term), 8–14 days (Standard Corporate), and 15–30+ days (Advance Leisure). Fares are normalized per kilometer yield and matched against identical departure time-bands.'
    },
    {
      num: '05',
      title: 'Route Classification',
      content: 'The 184 monitored city-pairs are categorized into 4 analytical strata: (1) Metro Trunk Routes (DEL-BOM, BOM-BLR), (2) Business Hub Connectors (DEL-HYD, BLR-MAA), (3) High-Elasticity Leisure Corridors (DEL-GOI, BOM-COK), and (4) Regional UDAN Subsidized Connectivity (GAU-IXC, DEL-DED). Stratification prevents leisure spikes from skewing baseline inflation.'
    },
    {
      num: '06',
      title: 'Weighting Methodology (DGCA Passenger Distribution)',
      content: 'Corridor weights ($W_{i,0}$) are derived directly from DGCA (Directorate General of Civil Aviation) monthly domestic scheduled traffic bulletins. High-density corridors receive proportional weighting (e.g. DEL-BOM ~22.4%, BOM-BLR ~14.8%) to ensure index representative fidelity.'
    },
    {
      num: '07',
      title: 'Index Calculation (Laspeyres Base 2024 = 100)',
      content: 'The National Airfare Price Index is computed deterministically using the standard Laspeyres index formulation: I_t = [ Σ(P_{i,t} · W_{i,0}) / Σ(P_{i,0} · W_{i,0}) ] · 100. Reference base period 2024 = 100 is chosen to align with the updated base year framework utilized by MoSPI for Consumer Price Indexation.'
    },
    {
      num: '08',
      title: 'Quality Control & Outlier Filtering',
      content: 'Observations undergo statistical Winsorization at the 95th percentile. Fares exceeding 2.5 standard deviations from the rolling 30-day median ($Z \\ge 2.5$) are flagged as potential tariff anomalies. Anomalous observations are quarantined for secondary validation to avoid spurious distortion of the index.'
    },
    {
      num: '09',
      title: 'CPI Augmentation Mechanics',
      content: 'Air transport constitutes approximately ~3.02% of the national Consumer Price Index basket within the Transport & Communication group. While official CPI is published monthly with survey collection lags, AeroNex produces continuous daily indices that serve as an early-warning signal for macroeconomic analysts.'
    },
    {
      num: '10',
      title: 'AI Analytics & Natural Language Synthesis',
      content: 'Google Gemini 2.5 Flash is integrated strictly as an analytical synthesizer on the server-side. Gemini ingests pre-computed statistical tables and generates structured interpretations: identifying provisional price drivers, festival surge correlations, and research notes. Gemini never modifies the deterministic numerical index.'
    },
    {
      num: '11',
      title: 'Limitations & Statistical Disclaimer',
      content: 'AeroNex is an independent academic/hackathon prototype developed for research evaluation under SIH26056. Limitations include potential carrier web-scraping rate limiting, dynamic pricing opacity, and secondary distribution channel markups. AeroNex does not represent an official publication of the Central Statistics Office (CSO) or MoSPI.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto w-full pb-10">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Technical Architecture
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  MoSPI SIH26056 Alignment
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Statistical Methodology & Operational Architecture
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete mathematical formulation, data provenance lifecycle, and Laspeyres index specification for Consumer Price Index augmentation.
              </p>
            </div>

            <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Formulation: Laspeyres (2024 = 100)
            </span>
          </div>
        </div>

        {/* Visual Pipeline Bar */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <h2 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider mb-4">
            AeroNex End-to-End Operational Pipeline
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.name} className="relative p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] text-white flex items-center justify-center mb-2">
                    <Icon size={16} />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-blue-600 block mb-0.5">STAGE 0{idx+1}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{stage.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{stage.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Laspeyres Index Engine Simulator */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <h2 className="text-sm font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wide">
                Interactive Laspeyres Index Computation Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Adjust observed corridor fares below to verify real-time deterministic index recalculation against 2024 base.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Computed Airfare Index</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">{computedIndex}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B101D] text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Corridor</th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">DGCA Weight (W₀)</th>
                  <th className="py-2.5 px-4">Base Fare (P₀)</th>
                  <th className="py-2.5 px-4">Observed Fare (P_t)</th>
                  <th className="py-2.5 px-4 text-right">Weighted Product</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {corridors.map((c, i) => (
                  <tr key={c.route}>
                    <td className="py-2.5 px-4 font-mono font-bold">{c.route}</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{c.name}</td>
                    <td className="py-2.5 px-4 font-mono">{(c.weight * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-4 font-mono">₹{c.baseFare}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={c.currentFare}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCorridors(prev => prev.map((item, idx) => idx === i ? { ...item, currentFare: val } : item));
                        }}
                        className="w-24 h-7 px-2 font-mono text-xs border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-[#0B101D]"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{Math.round(c.currentFare * c.weight)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 11 Comprehensive Methodology Sections */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
            11-Point Technical & Statistical Specification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((s) => (
              <div key={s.num} className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      SECTION {s.num}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {s.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
