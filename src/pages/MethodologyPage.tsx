import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  Calculator, Layers, ShieldCheck, 
  Sliders, RefreshCw, ArrowRight, CheckCircle2,
  Activity, Database
} from 'lucide-react';

interface CorridorSim {
  route: string;
  name: string;
  weight: number; // 0 to 1
  baseFare: number;
  currentFare: number;
  region: 'North' | 'West' | 'South' | 'East';
}

const DEFAULT_SIM_CORRIDORS: CorridorSim[] = [
  { route: 'DEL-BOM', name: 'Delhi — Mumbai', weight: 0.224, baseFare: 5000, currentFare: 5680, region: 'North' },
  { route: 'BOM-BLR', name: 'Mumbai — Bengaluru', weight: 0.148, baseFare: 4500, currentFare: 4450, region: 'West' },
  { route: 'DEL-BLR', name: 'Delhi — Bengaluru', weight: 0.121, baseFare: 6000, currentFare: 7120, region: 'North' },
  { route: 'CCU-DEL', name: 'Kolkata — Delhi', weight: 0.096, baseFare: 4800, currentFare: 5490, region: 'East' },
  { route: 'DEL-GOI', name: 'Delhi — Goa', weight: 0.072, baseFare: 6500, currentFare: 6750, region: 'North' },
  { route: 'HYD-DEL', name: 'Hyderabad — Delhi', weight: 0.068, baseFare: 5500, currentFare: 4680, region: 'South' },
  { route: 'BLR-HYD', name: 'Bengaluru — Hyderabad', weight: 0.055, baseFare: 3000, currentFare: 3450, region: 'South' },
];

export function MethodologyPage() {
  usePageTitle('Airfare Index Methodology — AeroNex Specification');
  const navigate = useNavigate();

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

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0D14] via-[#12141F] to-[#161928] border border-white/[0.08] p-6 sm:p-8 shadow-2xl obsidian-card">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>DGCA-Calibrated Econometric Specification</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                National Airfare Index <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">(NAI)</span> Methodology
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                A mathematical framework modeling passenger yield fluctuations across scheduled Indian civil aviation corridors. Combining Laspeyres capacity-weighting, Fisher ideal aggregation, and real-time outlier winsorization.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => navigate('/airfare-index')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Activity size={15} />
                <span>Open Live Index Terminal</span>
              </button>
              <button
                onClick={() => navigate('/data-scraping')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#161824] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Database size={15} />
                <span>Inspect Data Scraper Nodes</span>
              </button>
            </div>
          </div>

          {/* Quick Spec Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.06]">
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Base Epoch</span>
              <span className="text-white text-base font-bold font-mono">FY 2023-24 = 100.0</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Index Formula</span>
              <span className="text-cyan-400 text-base font-bold font-mono">Laspeyres-Fisher</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Sampling Window</span>
              <span className="text-white text-base font-bold font-mono">104 Metro Pairs</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Dynamic Trim</span>
              <span className="text-emerald-400 text-base font-bold font-mono">95th % Winsorized</span>
            </div>
          </div>
        </div>

        {/* Section 1: Mathematical Formulation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#12141C] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-5 obsidian-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Calculator size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">1. Laspeyres Yield Formulation</h3>
                <p className="text-xs text-zinc-400">Primary weighted base-period aggregator</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Standard arithmetic price averages fail in aviation because route passenger volumes differ by orders of magnitude. The AeroNex National Airfare Index uses a modified Laspeyres Price Index weighted by seat-capacity:
            </p>

            {/* Formula Block */}
            <div className="p-5 rounded-xl bg-[#090A0F] border border-cyan-500/30 text-center relative overflow-hidden shadow-inner">
              <div className="text-xs text-zinc-500 font-mono mb-2 uppercase tracking-wider">AeroNex Index Formula (I_t)</div>
              <div className="text-cyan-300 font-mono text-base sm:text-xl font-bold tracking-wide">
                I_t = [ ∑ ( P_i,t · W_i ) / ∑ ( P_i,0 · W_i ) ] × 100
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="font-mono text-cyan-400 font-bold block mb-1">P_i,t (Current Fare)</span>
                <span className="text-zinc-400 text-[11px] leading-snug block">
                  Observed economy base fare + mandatory fees for route i at timestamp t.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="font-mono text-blue-400 font-bold block mb-1">P_i,0 (Base Fare)</span>
                <span className="text-zinc-400 text-[11px] leading-snug block">
                  Benchmark passenger yield fixed to the FY 2023-24 average DGCA survey baseline.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="font-mono text-emerald-400 font-bold block mb-1">W_i (Corridor Weight)</span>
                <span className="text-zinc-400 text-[11px] leading-snug block">
                  Relative scheduled seat capacity derived from DGCA monthly traffic filings.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#12141C] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-5 obsidian-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">2. Fisher Ideal Correction</h3>
                <p className="text-xs text-zinc-400">Mitigating consumer substitution bias</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              When ticket prices surge on a specific airline or corridor, passengers substitute to alternative carriers or off-peak departures. To account for this elasticity, AeroNex benchmarks the Laspeyres index with the Paasche formula:
            </p>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-blue-500/30 text-center relative overflow-hidden shadow-inner">
              <div className="text-xs text-zinc-500 font-mono mb-2 uppercase tracking-wider">Fisher Ideal Index (F_t)</div>
              <div className="text-blue-300 font-mono text-lg font-bold tracking-wide">
                F_t = √( L_t · P_t )
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Eliminates upward Laspeyres bias during peak festival travel seasons.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Yield updates verified against 104 active domestic routes across 7 scheduled airlines.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Airfare Index Simulator */}
        <div className="bg-[#12141C] rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl obsidian-card relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders size={20} className="text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Interactive Index Formula Simulator</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
                  Live Recalculation
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Adjust domestic corridor fares below. Watch the modified Laspeyres algorithm recompute national & regional indices in real time.
              </p>
            </div>

            <button
              onClick={handleResetSim}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono transition-all cursor-pointer self-start md:self-auto"
            >
              <RefreshCw size={13} />
              <span>Reset to Defaults</span>
            </button>
          </div>

          {/* Simulator Results Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-[#0E1017] border border-cyan-500/30 relative overflow-hidden shadow-lg">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Simulated National Index</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">{simResults.indexValue}</span>
                <span className="text-xs text-zinc-500">pts</span>
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Spread vs 100.0: <span className={simResults.spread >= 0 ? 'text-rose-400' : 'text-emerald-400'}>{simResults.spread >= 0 ? `+${simResults.spread}` : simResults.spread} pts</span>
              </span>
            </div>

            {simResults.regionalIndices.map(reg => (
              <div key={reg.region} className="p-4 rounded-2xl bg-[#0E1017] border border-white/[0.08]">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">{reg.region} Region Index</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white">{reg.index}</span>
                  <span className="text-xs text-zinc-500">pts</span>
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Delta: <span className={reg.change >= 0 ? 'text-amber-400' : 'text-emerald-400'}>{reg.change >= 0 ? `+${reg.change}` : reg.change}%</span>
                </span>
              </div>
            ))}
          </div>

          {/* Sliders Grid */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono border-b border-white/[0.04] pb-2">
              <span>Domestic Corridor & Weight</span>
              <span>Base vs Simulated Fare</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {corridors.map((c) => {
                const diffPercent = (((c.currentFare - c.baseFare) / c.baseFare) * 100).toFixed(1);
                return (
                  <div key={c.route} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold text-sm font-mono">{c.route}</span>
                        <span className="text-xs text-zinc-400 ml-2">({c.name})</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                        {(c.weight * 100).toFixed(1)}% Weight
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500">Base: ₹{c.baseFare.toLocaleString('en-IN')}</span>
                      <span className="text-white font-bold">
                        Simulated: ₹{c.currentFare.toLocaleString('en-IN')}{' '}
                        <span className={Number(diffPercent) >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
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

        {/* Section 3: Data Cleansing & Booking Horizon Weights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking Horizon Weights */}
          <div className="bg-[#12141C] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-4 obsidian-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity size={16} />
              </div>
              <h3 className="text-white font-bold text-base">Booking Horizon Weighted Distribution</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Airfares fluctuate drastically based on advance purchase. AeroNex captures multiple booking windows to prevent distortion from last-minute emergency spikes.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { horizon: '3-Day Window (Immediate Business)', weight: '35%', desc: 'Captures peak business travel yield and dynamic pricing surge' },
                { horizon: '7-Day Window (Near-Term Travel)', weight: '30%', desc: 'Standard short-haul domestic booking behavior' },
                { horizon: '14-Day Window (Planned Travel)', weight: '20%', desc: 'Stable pricing baseline for domestic leisure' },
                { horizon: '30-Day Window (Advance Leisure)', weight: '15%', desc: 'Lowest available published carrier bucket' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <div className="text-white text-xs font-semibold">{item.horizon}</div>
                    <div className="text-zinc-500 text-[11px]">{item.desc}</div>
                  </div>
                  <span className="font-mono text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                    {item.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Outlier Winsorization */}
          <div className="bg-[#12141C] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-4 obsidian-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck size={16} />
              </div>
              <h3 className="text-white font-bold text-base">Outlier Winsorization & Integrity Checks</h3>
            </div>
            <p className="text-xs text-zinc-400">
              During extreme weather disruptions or fog delays at IGI Delhi or CSMIA Mumbai, single emergency tickets may surge to 10× normal prices.
            </p>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-white/[0.06] space-y-2">
              <span className="text-xs font-mono text-cyan-300 font-bold block">95th Percentile Winsorization Rule:</span>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                IF fare &gt; P_95(Route, 30-Day Moving Window) THEN<br />
                &nbsp;&nbsp;fare_effective = P_95<br />
                END IF
              </p>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Prevents synthetic inflation of the National Index from extreme isolated anomalies.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Re-calibrated daily using 14-day rolling standard deviation (σ).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Architecture Link Card */}
        <div className="p-6 rounded-2xl bg-[#12141C] border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 obsidian-card">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-white font-bold text-base">Interested in real-time data collection?</h4>
            <p className="text-xs text-zinc-400">
              Inspect active scraping workers, GDS connectors, and live telemetry feeds on our data ingestion control panel.
            </p>
          </div>
          <button
            onClick={() => navigate('/data-scraping')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-xs font-bold font-mono transition-all cursor-pointer shrink-0"
          >
            <span>Inspect Scraper Pipeline</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
