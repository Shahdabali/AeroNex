import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  Calculator, Layers, ShieldCheck, 
  Sliders, RefreshCw, ArrowRight, CheckCircle2,
  Activity, FileText, Download,
  TrendingUp, BarChart3, Scale, Filter, BookOpen,
  Sparkles, AlertCircle
} from 'lucide-react';

interface CorridorSim {
  route: string;
  name: string;
  weight: number;
  baseFare: number;
  currentFare: number;
  region: 'North' | 'West' | 'South' | 'East';
  passengersMonthly: string;
}

const DEFAULT_SIM_CORRIDORS: CorridorSim[] = [
  { route: 'DEL-BOM', name: 'Delhi — Mumbai', weight: 0.224, baseFare: 5000, currentFare: 5680, region: 'North', passengersMonthly: '2.4M' },
  { route: 'BOM-BLR', name: 'Mumbai — Bengaluru', weight: 0.148, baseFare: 4500, currentFare: 4450, region: 'West', passengersMonthly: '1.6M' },
  { route: 'DEL-BLR', name: 'Delhi — Bengaluru', weight: 0.121, baseFare: 6000, currentFare: 7120, region: 'North', passengersMonthly: '1.3M' },
  { route: 'CCU-DEL', name: 'Kolkata — Delhi', weight: 0.096, baseFare: 4800, currentFare: 5490, region: 'East', passengersMonthly: '1.1M' },
  { route: 'DEL-GOI', name: 'Delhi — Goa', weight: 0.072, baseFare: 6500, currentFare: 6750, region: 'North', passengersMonthly: '0.8M' },
  { route: 'HYD-DEL', name: 'Hyderabad — Delhi', weight: 0.068, baseFare: 5500, currentFare: 4680, region: 'South', passengersMonthly: '0.75M' },
  { route: 'BLR-HYD', name: 'Bengaluru — Hyderabad', weight: 0.055, baseFare: 3000, currentFare: 3450, region: 'South', passengersMonthly: '0.6M' },
];

export function MethodologyPage() {
  usePageTitle('Airfare Index Methodology — AeroNex Specification');
  const navigate = useNavigate();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'formulas' | 'simulator' | 'pipeline' | 'cpi-link'>('overview');

  // Interactive Simulator State
  const [corridors, setCorridors] = useState<CorridorSim[]>(DEFAULT_SIM_CORRIDORS);

  // Simulator Handler
  const handleFareChange = (route: string, newFare: number) => {
    setCorridors(prev => prev.map(c => c.route === route ? { ...c, currentFare: newFare } : c));
  };

  const handleResetSim = () => {
    setCorridors(DEFAULT_SIM_CORRIDORS);
  };

  // Recompute Simulated Laspeyres Index
  const simResults = useMemo(() => {
    let sumCurrentWeighted = 0;
    let sumBaseWeighted = 0;
    let totalWeight = 0;

    const regionalSums: Record<string, { current: number; base: number }> = {
      North: { current: 0, base: 0 },
      West: { current: 0, base: 0 },
      South: { current: 0, base: 0 },
      East: { current: 0, base: 0 },
    };

    corridors.forEach(c => {
      const currentVal = c.currentFare * c.weight;
      const baseVal = c.baseFare * c.weight;
      sumCurrentWeighted += currentVal;
      sumBaseWeighted += baseVal;
      totalWeight += c.weight;

      if (regionalSums[c.region]) {
        regionalSums[c.region].current += currentVal;
        regionalSums[c.region].base += baseVal;
      }
    });

    const indexValue = Number(((sumCurrentWeighted / (sumBaseWeighted || 1)) * 100).toFixed(2));
    const baseValue = 100.0;
    const spread = Number((indexValue - baseValue).toFixed(2));

    const regionalIndices = Object.entries(regionalSums).map(([region, val]) => {
      const regIndex = val.base > 0 ? Number(((val.current / val.base) * 100).toFixed(1)) : 100.0;
      return { region, index: regIndex, change: Number((regIndex - 100.0).toFixed(1)) };
    });

    return { indexValue, spread, regionalIndices, totalWeight };
  }, [corridors]);

  const tabs = [
    { id: 'overview', label: '1. MoSPI Specification', icon: BookOpen, badge: 'UN-ILO' },
    { id: 'formulas', label: '2. Mathematical Formulation', icon: Calculator, badge: 'Laspeyres' },
    { id: 'simulator', label: '3. Interactive Simulator', icon: Sliders, badge: 'Live Recalc' },
    { id: 'pipeline', label: '4. Data Cleaning & Winsorization', icon: Filter, badge: '95th %' },
    { id: 'cpi-link', label: '5. CPI Augmentation', icon: TrendingUp, badge: 'MoSPI Transport' },
  ] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">
        
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070D1E] via-[#0D1836] to-[#12224A] border border-white/[0.1] p-6 sm:p-8 shadow-2xl obsidian-card">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  <span>MoSPI SIH26056 Specification</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-mono">
                  Base Epoch: Jan 2026 = 100.0
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                National Airfare Price Index <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">(API-CPI)</span> Methodology
              </h1>
              
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                An empirical econometric framework replacing lagging monthly field surveys with automated high-frequency web scraping. Powered by capacity-weighted Chained Laspeyres formulation, 95th percentile winsorization, and multi-horizon advance purchase curves.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <a
                href="/AeroNex_SIH26056_Technical_Dossier.pdf"
                download="AeroNex_SIH26056_Technical_Dossier.pdf"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer hover-lift"
              >
                <Download size={15} />
                <span>Download Official Dossier (PDF)</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/airfare-index')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Activity size={14} className="text-cyan-400" />
                  <span>Live Index</span>
                </button>
                <button
                  onClick={() => navigate('/cpi-analytics')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span>CPI Analytics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Specification Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.08]">
            <div className="p-2.5 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Statistical Standard</span>
              <span className="text-white text-sm font-bold font-mono">UN-ILO CPI Manual (2020)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Aggregation Formula</span>
              <span className="text-cyan-400 text-sm font-bold font-mono">Modified Laspeyres</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Sampling Scope</span>
              <span className="text-white text-sm font-bold font-mono">1,500+ Domestic Routes</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Outlier Treatment</span>
              <span className="text-emerald-400 text-sm font-bold font-mono">95% Rolling Winsorized</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.08] scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-ui cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'bg-[#0A0C13] text-zinc-400 hover:text-white border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
                <span>{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/[0.05] text-zinc-500'
                }`}>
                  {t.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW & MOSPI STANDARDS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Problem & Mandate */}
              <div className="lg:col-span-7 bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">The MoSPI Problem Statement Mandate</h3>
                    <p className="text-xs text-zinc-400">SIH26056 • Ministry of Statistics and Programme Implementation</p>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  In India's current CPI computation methodology, price data for goods and services is collected on a monthly basis by field investigators visiting physical retail shops and airport booking counters across 1,114 urban markets and 1,181 villages.
                </p>

                <div className="p-4 rounded-xl bg-[#0E1017] border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <AlertCircle size={14} />
                    <span>The Fatal Flaw in Aviation Price Collection</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Aviation is fundamentally dynamic: ticket prices adjust every few seconds driven by automated revenue management algorithms, remaining seat buckets, and fuel surcharges. A single monthly manual survey point misses <strong>99.8% of fare fluctuations</strong>, leading to severe statistical lag and volatility distortion in the national CPI Transport sub-group.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">AeroNex Automated Solution:</h4>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>High-Frequency Ingestion:</strong> Continuous automated scraping across airline portals (IndiGo, Air India, Vistara, Akasa) and OTAs every 5–30 seconds.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Complete Domestic Coverage:</strong> Captures 1,500+ active routes across metro corridors and regional Tier-2/3 UDAN airports.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Auditable Digital Trail:</strong> Every recorded fare has cryptographic timestamp and airline flight code verification, eliminating surveyor fabrication.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Comparative Metrics */}
              <div className="lg:col-span-5 bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Traditional vs. AeroNex Paradigm</h3>
                    <p className="text-xs text-zinc-400">Rigorous architectural comparison</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06] flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-white block">Update Frequency</span>
                      <span className="text-[11px] text-zinc-500">Traditional: Monthly (30 days)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 rounded bg-cyan-500/10">
                      Real-Time (5s)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06] flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-white block">Domestic Routes Tracked</span>
                      <span className="text-[11px] text-zinc-500">Traditional: ~15 metro pairs</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 rounded bg-cyan-500/10">
                      1,500+ Corridors
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06] flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-white block">Data Collection Cost</span>
                      <span className="text-[11px] text-zinc-500">Traditional: Field surveyor salaries</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10">
                      99.4% Reduction
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06] flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-white block">Booking Windows Captured</span>
                      <span className="text-[11px] text-zinc-500">Traditional: Single spot fare</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 rounded bg-cyan-500/10">
                      4 Advance Horizons
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="/AeroNex_SIH26056_Technical_Dossier.pdf"
                    download="AeroNex_SIH26056_Technical_Dossier.pdf"
                    className="w-full inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold font-mono transition-all cursor-pointer"
                  >
                    <FileText size={15} />
                    <span>Download Full 8-Page Technical Dossier (PDF)</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MATHEMATICAL FORMULATION */}
        {activeTab === 'formulas' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Formula 1: Modified Laspeyres */}
              <div className="lg:col-span-7 bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">1. Modified Laspeyres Airfare Index</h3>
                    <p className="text-xs text-zinc-400">DGCA Capacity-Weighted Base Period Aggregator</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Simple arithmetic averages produce severe distortion in civil aviation because high-density corridors (such as Delhi–Mumbai with 2.4 million annual passengers) dwarf regional flights. AeroNex implements the internationally endorsed <strong>Modified Laspeyres Aggregator</strong>:
                </p>

                {/* Formula Display Box */}
                <div className="p-5 rounded-2xl bg-[#07090F] border border-cyan-500/40 text-center relative overflow-hidden shadow-2xl">
                  <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase tracking-wider">AeroNex Master Formula (I_t)</div>
                  <div className="text-cyan-300 font-mono text-base sm:text-2xl font-bold tracking-wide py-2">
                    I_t = [ ∑ ( P_i,t · W_i ) / ∑ ( P_i,0 · W_i ) ] × 100
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2 font-mono">
                    Base Benchmark: I_0 = 100.0 (January 2026 Reference Baseline)
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06]">
                    <span className="font-mono text-cyan-400 font-bold block mb-1">P_i,t (Current Fare)</span>
                    <span className="text-zinc-400 text-[11px] leading-snug block">
                      Observed geometric mean fare across carriers for route i at observation timestamp t.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06]">
                    <span className="font-mono text-blue-400 font-bold block mb-1">P_i,0 (Base Fare)</span>
                    <span className="text-zinc-400 text-[11px] leading-snug block">
                      Benchmark base passenger yield calibrated to the January 2026 official survey epoch.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06]">
                    <span className="font-mono text-emerald-400 font-bold block mb-1">W_i (Corridor Weight)</span>
                    <span className="text-zinc-400 text-[11px] leading-snug block">
                      Route expenditure weight proportional to DGCA scheduled seat capacity: (Q_i,0 × P_i,0) / Total.
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula 2: Fisher Ideal & Jevons Mean */}
              <div className="lg:col-span-5 bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">2. Fisher Ideal Bias Correction</h3>
                    <p className="text-xs text-zinc-400">Consumer substitution elasticity adjustment</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  When airfares surge on specific full-service carriers, price-sensitive consumers immediately substitute toward budget airlines or alternate timing slots. To correct for Laspeyres upward bias, AeroNex computes the geometric Fisher Ideal:
                </p>

                <div className="p-4 rounded-xl bg-[#07090F] border border-blue-500/30 text-center relative overflow-hidden shadow-inner">
                  <div className="text-[10px] text-zinc-500 font-mono mb-1 uppercase tracking-wider">Fisher Ideal Formulation (F_t)</div>
                  <div className="text-blue-300 font-mono text-lg font-bold tracking-wide py-1">
                    F_t = √( L_t × P_t )
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#0E1017] border border-white/[0.06]">
                    <span className="text-xs font-bold text-white block mb-1">3. Jevons Elementary Aggregation:</span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                      P_i,t = ( ∏ p_i,j,t )^(1/k)
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Geometric mean of k distinct flight options on corridor i, robust to extreme outlier tickets.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-zinc-400">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Conforms to Section 10.3 of the 2020 United Nations Consumer Price Index Manual.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Advance Booking Horizons */}
            <div className="bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-4">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                Advance Purchase Horizon Curve Weighting
              </h3>
              <p className="text-xs text-zinc-400">
                To prevent single-day emergency rush pricing from distorting general consumer cost-of-living metrics, AeroNex aggregates fares across four strategic advance booking horizons:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">0–3 Days (Spot / Rush)</span>
                    <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10">35%</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">Captures emergency, short-notice business travel yield and surge ceiling.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">4–7 Days (Near-Term)</span>
                    <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">30%</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">Standard domestic booking pattern representing active business travel.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">8–14 Days (Planned)</span>
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10">20%</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">Domestic personal and leisure travel with standard airline fare classes.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">15–30 Days (Advance)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">15%</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">Lowest baseline promotional tariff bucket published by scheduled carriers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE LASPEYRES SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0A0C13] rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sliders size={20} className="text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">Interactive Laspeyres Formula Simulator</h2>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
                      Live Recalculation
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Adjust observed corridor fares with the sliders. Watch how the capacity-weighted Laspeyres engine dynamically re-indexes national & regional benchmarks.
                  </p>
                </div>

                <button
                  onClick={handleResetSim}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono transition-all cursor-pointer self-start md:self-auto"
                >
                  <RefreshCw size={13} />
                  <span>Reset to Base Values</span>
                </button>
              </div>

              {/* Simulator Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-[#0E1017] border border-cyan-500/40 relative overflow-hidden shadow-lg">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">National Airfare Index</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-mono text-cyan-400 tabular-nums">{simResults.indexValue}</span>
                    <span className="text-xs text-zinc-500 font-mono">pts</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Spread vs Base: <span className={`font-mono font-bold tabular-nums ${simResults.spread >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {simResults.spread >= 0 ? `+${simResults.spread}` : simResults.spread} pts
                    </span>
                  </span>
                </div>

                {simResults.regionalIndices.map(reg => (
                  <div key={reg.region} className="p-4 rounded-2xl bg-[#0E1017] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">{reg.region} Region</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold font-mono text-white tabular-nums">{reg.index}</span>
                      <span className="text-xs text-zinc-500 font-mono">pts</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-1 block font-mono">
                      Delta: <span className={`font-bold tabular-nums ${reg.change >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {reg.change >= 0 ? `+${reg.change}` : reg.change}%
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Corridor Sliders */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono border-b border-white/[0.04] pb-2">
                  <span>Corridor Route & Traffic Weight</span>
                  <span>Base vs Current Simulated Fare</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {corridors.map((c) => {
                    const diffPercent = (((c.currentFare - c.baseFare) / c.baseFare) * 100).toFixed(1);
                    return (
                      <div key={c.route} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white font-bold text-sm font-mono">{c.route}</span>
                            <span className="text-xs text-zinc-400 ml-2">({c.name})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono border border-blue-500/20">
                              {(c.weight * 100).toFixed(1)}% Weight
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {c.passengersMonthly}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-500">Base: ₹{c.baseFare.toLocaleString('en-IN')}</span>
                          <span className="text-white font-bold">
                            Simulated: ₹{c.currentFare.toLocaleString('en-IN')}{' '}
                            <span className={`tabular-nums ${Number(diffPercent) >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              ({Number(diffPercent) >= 0 ? `+${diffPercent}%` : `${diffPercent}%`})
                            </span>
                          </span>
                        </div>

                        <input
                          type="range"
                          min={Math.round(c.baseFare * 0.6)}
                          max={Math.round(c.baseFare * 1.8)}
                          step={50}
                          value={c.currentFare}
                          onChange={(e) => handleFareChange(c.route, Number(e.target.value))}
                          className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATA CLEANING & WINSORIZATION */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Winsorization Card */}
              <div className="bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">95th Percentile Dynamic Winsorization</h3>
                    <p className="text-xs text-zinc-400">Extreme anomaly isolation</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  During severe fog conditions at Delhi IGI or emergency runway closures at Mumbai, single unsold business class seats can spike to ₹45,000+ for a short-haul flight. AeroNex prevents synthetic index distortion via rolling winsorization:
                </p>

                <div className="p-4 rounded-xl bg-[#07090F] border border-amber-500/30 font-mono text-xs text-amber-300 space-y-1">
                  <div className="text-zinc-500 uppercase tracking-wider text-[10px]">Algorithm Rule:</div>
                  <div>IF ObservedFare &gt; P_95(Route, 30-Day Moving Window) THEN</div>
                  <div className="pl-4">EffectiveFare = P_95(Route, 30-Day Moving Window)</div>
                  <div>END IF</div>
                </div>

                <div className="space-y-2 text-xs text-zinc-400">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Preserves the trend direction while dampening erratic extreme one-off spikes.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Re-calibrated daily using rolling IQR and 14-day standard deviations.</span>
                  </div>
                </div>
              </div>

              {/* Fee Stripping Card */}
              <div className="bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Filter size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Mandatory Fare & Fee Normalization</h3>
                    <p className="text-xs text-zinc-400">Pure inflation measurement</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Online Travel Aggregators (OTAs) display bundled prices that include optional add-ons. To ensure statistical comparability with MoSPI requirements, AeroNex strips non-mandatory ancillaries:
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#0E1017] border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-white font-semibold block">Included in Base Index (P_i,t):</span>
                      <span className="text-zinc-400 text-[11px]">Base fare + Aviation Security Fee (ASF) + User Development Fee (UDF) + Fuel Surcharge</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-xs">INCLUDED</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0E1017] border border-rose-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-white font-semibold block">Stripped Ancillaries:</span>
                      <span className="text-zinc-400 text-[11px]">Paid seat selection + Excess baggage + Travel insurance + Convenience fees</span>
                    </div>
                    <span className="text-rose-400 font-mono font-bold text-xs">EXCLUDED</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: MOSPI CPI AUGMENTATION */}
        {activeTab === 'cpi-link' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">MoSPI CPI Transport Sub-Index Augmentation</h3>
                  <p className="text-xs text-zinc-400">High-frequency nowcasting and macroeconomic inflation forecasting</p>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                In India's official Consumer Price Index (Base 2012=100), the <strong>Transport & Communication</strong> group carries an aggregate weight of <strong>8.59%</strong> in urban indices. Air travel expenditure has grown over <strong>380%</strong> since the 2012 base revision due to the rapid expansion of domestic air corridors and the UDAN scheme.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">1. Inflation Nowcasting</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    By computing hourly and daily Laspeyres indices, AeroNex allows MoSPI and the Reserve Bank of India (RBI) to <strong>nowcast monthly transport inflation 25 days before</strong> official statistics are published.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">2. Surge & Cartel Detection</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Empowers the Directorate General of Civil Aviation (DGCA) with automated flags whenever regional route fares surge beyond 2.5 standard deviations, enforcing fair airline competition.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">3. Dynamic Basket Weighting</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Facilitates modern chained index compilation where corridor weights update quarterly based on empirical DGCA passenger city-pair traffic filings.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06]">
                <div className="text-xs text-zinc-400">
                  Inspect the live inflation correlation curves and dual-axis chart:
                </div>
                <button
                  onClick={() => navigate('/cpi-analytics')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Open CPI Analytics Portal</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
