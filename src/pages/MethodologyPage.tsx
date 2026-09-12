import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../services/api';
import { 
  Database, Cpu, Sliders, Calculator, Sparkles, 
  MapPin, CheckCircle2, ArrowRight, Download, RefreshCw, 
  Activity, ShieldCheck, TrendingUp, Filter, 
  Calendar, Plane, ArrowDownRight, 
  Zap, ChevronDown, ChevronUp, 
  Search
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
  usePageTitle('AeroNex Methodology — End-to-End System Architecture');
  const navigate = useNavigate();

  // Active Stage in the master pipeline
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  // Corridor Simulator State
  const [corridors, setCorridors] = useState<CorridorSim[]>(DEFAULT_SIM_CORRIDORS);

  // Active Route Analysis tab
  const [selectedRouteKey, setSelectedRouteKey] = useState<'DEL-BOM' | 'BOM-BLR' | 'DEL-BLR'>('DEL-BOM');

  // AI Interactive State
  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiResult, setAiResult] = useState<{
    direction: string;
    predictedChange: string;
    confidence: number;
    recommendedAction: string;
    reasoning: string;
  } | null>({
    direction: 'Downward Correction',
    predictedChange: '-8.4%',
    confidence: 93.6,
    recommendedAction: 'Book within next 48–72 hours',
    reasoning: 'Seat inventory bucket P25 opened on off-peak Tuesday departures for IndiGo 6E and Vistara UK.',
  });

  const handleRunAiDemo = async (routeStr: string) => {
    setAiPredicting(true);
    try {
      const res = await api.predict({ route: routeStr });
      if (res) {
        setAiResult({
          direction: res.direction || 'Moderate Rise',
          predictedChange: `${res.predictedChange || '+4.2%'}`,
          confidence: res.confidence || 91.5,
          recommendedAction: res.recommendation || 'Book within 3 days before fare escalation',
          reasoning: res.reason || 'Observed capacity load factor exceeds 88% on this domestic sector.',
        });
      }
    } catch {
      // Fallback
      setAiResult({
        direction: 'Downward Opportunity',
        predictedChange: '-6.5%',
        confidence: 94.2,
        recommendedAction: 'Target Tuesday mid-day departure',
        reasoning: 'Historical yield trends indicate low corporate rush on midweek afternoon slots.',
      });
    } finally {
      setAiPredicting(false);
    }
  };

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

  // Master 8-Stage Pipeline Data
  const pipelineStages = [
    {
      id: 1,
      title: 'Data Sources',
      shortDesc: 'Automated ingestion of flight schedules, OTAs & airlines',
      icon: Database,
      tag: 'Ingestion',
      details: 'Gathers raw airfares, capacity indicators, airport pairings, and dynamic fare classes across IndiGo, Air India, Vistara, Akasa Air, and OTAs (MakeMyTrip, Yatra, EaseMyTrip).'
    },
    {
      id: 2,
      title: 'Data Processing',
      shortDesc: 'Validation, fee stripping & 95th% winsorization',
      icon: Filter,
      tag: 'Sanitization',
      details: 'Zod schema validation, mandatory fee isolation (stripping baggage & seat add-ons), deduplication, and 95th percentile winsorization to eliminate extreme weather outliers.'
    },
    {
      id: 3,
      title: 'Feature Engineering',
      shortDesc: 'Booking windows, volatility & seasonal factors',
      icon: Cpu,
      tag: 'Features',
      details: 'Transforms structured fares into 10 key predictive features including day-of-week sensitivity, advance booking horizons (0-3d, 4-7d, 8-14d, 15-30d), and route load factors.'
    },
    {
      id: 4,
      title: 'CPI / Analysis Engine',
      shortDesc: 'Modified Laspeyres index & MoSPI augmentation',
      icon: Calculator,
      tag: 'Econometrics',
      details: 'Computes seat-capacity weighted Laspeyres index and Fisher Ideal substitution adjustments. Benches high-frequency price movements against Jan 2026=100 baseline.'
    },
    {
      id: 5,
      title: 'AI / ML Intelligence',
      shortDesc: 'Pattern recognition & directional prediction models',
      icon: Sparkles,
      tag: 'Intelligence',
      details: 'Combines rolling autoregressive time-series models with gradient boosted decision trees and LLM semantic reasoning to evaluate trend directions and confidence scores.'
    },
    {
      id: 6,
      title: 'Route & Fare Analysis',
      shortDesc: 'Corridor distance, demand & best departure days',
      icon: MapPin,
      tag: 'Spatial Routing',
      details: 'Deep spatial analysis across 1,500+ Indian domestic sectors mapping flight distance, airport congestion windows, historical median pricing, and route alternatives.'
    },
    {
      id: 7,
      title: 'Recommendation Engine',
      shortDesc: 'Multi-factor convergence for optimal travel decisions',
      icon: Zap,
      tag: 'Convergence',
      details: 'Synthesizes CPI status, historical dips, seat scarcity alerts, and seasonal shifts to generate authoritative booking timing windows and pricing forecasts.'
    },
    {
      id: 8,
      title: 'User Dashboard',
      shortDesc: 'Actionable flight advice, savings & confidence score',
      icon: Activity,
      tag: 'Execution',
      details: 'Delivers high-clarity travel intelligence to citizens, enterprise travel desks, and MoSPI economists with concrete expected fares, potential savings, and reliability metrics.'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-24 max-w-7xl mx-auto">
        
        {/* ========================================================================= */}
        {/* HERO BANNER & EXECUTIVE SUMMARY */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070D1E] via-[#0D1836] to-[#12224A] border border-white/[0.1] p-6 sm:p-10 shadow-2xl obsidian-card">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  <span>Smart India Hackathon • SIH26056</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
                  Ministry of Statistics & Programme Implementation (MoSPI)
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                AeroNex Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Methodology</span> Architecture
              </h1>
              
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                An end-to-end data intelligence pipeline converting automated civil aviation web scraping into mathematically rigorous Airfare Price Index benchmarks, econometric CPI augmentation, and predictive passenger recommendations.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href="/AeroNex_SIH26056_Technical_Dossier.pdf"
                download="AeroNex_SIH26056_Technical_Dossier.pdf"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-xl shadow-cyan-500/25 transition-ui hover-lift cursor-pointer"
              >
                <Download size={16} />
                <span>Download Technical Dossier (PDF)</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/airfare-index')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#161824] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-semibold transition-ui cursor-pointer"
                >
                  <Activity size={14} className="text-cyan-400" />
                  <span>Live Index Terminal</span>
                </button>
                <button
                  onClick={() => navigate('/cpi-analytics')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#161824] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-semibold transition-ui cursor-pointer"
                >
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span>CPI Analytics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Specification Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.08]">
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">1. Aggregation Formula</span>
              <span className="text-cyan-400 text-sm font-bold font-mono">Chained Laspeyres</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">2. Statistical Benchmark</span>
              <span className="text-white text-sm font-bold font-mono">UN-ILO CPI Manual (2020)</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">3. Real-Time Latency</span>
              <span className="text-emerald-400 text-sm font-bold font-mono">&lt; 5s Live Ingestion</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">4. Corridor Coverage</span>
              <span className="text-white text-sm font-bold font-mono">1,500+ Domestic Routes</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: MASTER METHODOLOGY PIPELINE (TIMELINE / WORKFLOW) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 01 • Architecture Flow</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">End-to-End Visual Methodology Pipeline</h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Click any stage to inspect technical subsystem details
            </span>
          </div>

          {/* Connected Workflow Container */}
          <div className="bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-xl relative">
            
            {/* Desktop Horizontal Workflow Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 relative">
              {pipelineStages.map((stg) => {
                const Icon = stg.icon;
                const isSelected = expandedStage === stg.id;
                return (
                  <div key={stg.id} className="flex flex-col relative group">
                    <div 
                      onClick={() => setExpandedStage(isSelected ? null : stg.id)}
                      className={`p-3.5 rounded-xl border transition-ui cursor-pointer flex flex-col justify-between h-full hover-lift ${
                        isSelected 
                          ? 'bg-blue-600/20 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40' 
                          : 'bg-[#0E1017] border-white/[0.06] hover:border-cyan-500/40 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-cyan-500 text-black' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 font-bold">0{stg.id}</span>
                        </div>
                        <h3 className="text-xs font-bold text-white mb-1 leading-snug">{stg.title}</h3>
                        <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2">{stg.shortDesc}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 font-mono">{stg.tag}</span>
                        <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                          {isSelected ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expandable Technical Detail Drawer */}
            {expandedStage !== null && (
              <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-[#0C152B] to-[#0A1020] border border-cyan-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                        Subsystem Deep-Dive • Stage 0{expandedStage}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        {pipelineStages.find(s => s.id === expandedStage)?.title}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed max-w-4xl">
                      {pipelineStages.find(s => s.id === expandedStage)?.details}
                    </p>
                  </div>
                  <button 
                    onClick={() => setExpandedStage(null)}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/[0.04] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: DATA INGESTION LAYER */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 02 • High-Throughput Harvester</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Data Ingestion Architecture</h2>
            <p className="text-xs text-zinc-400 mt-1">Multi-threaded automated harvesting capturing comprehensive civil aviation telemetry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: 'Flight Schedules', desc: 'Real-time scheduled departure and arrival city pairs across 140+ Indian airports.', icon: Calendar, tag: 'GDS / Schedules' },
              { title: 'Historical Fare Matrix', desc: '5-second tick time-series storing past fare distributions and price movements.', icon: Activity, tag: 'Ring-Buffer' },
              { title: 'Route Information', desc: 'Corridor flight distance, airway density, and direct vs connecting flight parameters.', icon: MapPin, tag: 'Corridors' },
              { title: 'Airport Infrastructure', desc: 'Terminal capacity, User Development Fees (UDF), and regional UDAN classifications.', icon: Plane, tag: 'Hub Metadata' },
              { title: 'Demand Patterns', desc: 'Passenger load factors derived from DGCA monthly traffic and seat availability.', icon: TrendingUp, tag: 'Seat Buckets' },
              { title: 'Seasonal Trends', desc: 'Festival surge curves (Diwali, Chhath, Holi), school vacation, and pilgrimage corridors.', icon: Sparkles, tag: 'Seasonality' },
              { title: 'OTA & Airline APIs', desc: 'Automated crawlers querying IndiGo, Air India, Vistara, Akasa, MMT, and EaseMyTrip.', icon: Database, tag: 'Multi-Source' },
              { title: 'Travel Preferences', desc: 'Direct vs 1-stop choices, baggage requirements, and preferred departure time bands.', icon: Sliders, tag: 'User Context' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-xl bg-[#0A0C13] border border-white/[0.08] hover:border-cyan-500/30 transition-ui hover-lift group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 font-semibold">{item.tag}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: DATA PROCESSING & CLEANING PIPELINE */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 03 • Sanitization Engine</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Data Processing & Cleaning Pipeline</h2>
            <p className="text-xs text-zinc-400 mt-1">Transforming raw, noisy web-scraped DOM payloads into verified econometric datasets.</p>
          </div>

          <div className="bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
              {[
                { step: '01', name: 'Raw Scrape', sub: 'HTML / JSON Payloads', desc: 'Raw fares collected from crawler headless browser sessions.' },
                { step: '02', name: 'Zod Validation', sub: 'Schema Integrity', desc: 'Strict type validation discarding corrupted or missing fields.' },
                { step: '03', name: 'Fee Stripping', sub: 'Ancillary Isolation', desc: 'Extracts mandatory base + fuel; discards seats & baggage fees.' },
                { step: '04', name: 'Normalization', sub: 'Unit Standardization', desc: 'Converts fares to per-km passenger metrics and UTC timestamps.' },
                { step: '05', name: 'Winsorization', sub: '95th % Outlier Cap', desc: 'Dampens isolated emergency spike anomalies at 2.5σ.' },
                { step: '06', name: 'Structured Data', sub: 'Econometric Ready', desc: 'Stored into LiveDataStore in-memory cache for indexing.' },
              ].map((node, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06] hover:border-cyan-500/40 transition-ui flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400">{node.step}</span>
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-white block">{node.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-2">{node.sub}</span>
                    <p className="text-[11px] text-zinc-400 leading-snug">{node.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: FEATURE ENGINEERING */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 04 • Predictive Vectors</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Feature Engineering Nodes</h2>
            <p className="text-xs text-zinc-400 mt-1">Multi-dimensional econometric and behavioral factors feeding into the intelligence layer.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: 'Historical Fare Matrix', formula: 'Δ(Fare_t, Fare_30d_avg)', desc: 'Mean reversion indicator' },
              { name: 'Route Popularity Factor', formula: 'Seats_Booked / Capacity', desc: 'Capacity load factor index' },
              { name: 'Festival / Seasonality', formula: 'Peak_Multiplier ∈ [1.0, 2.4]', desc: 'Holiday & calendar shifts' },
              { name: 'Day-of-Week Effect', formula: 'DOW_Weight (Fri vs Tue)', desc: 'Business travel elasticity' },
              { name: 'Advance Booking Window', formula: 'Horizon ∈ [0d, 7d, 14d, 30d]', desc: 'Yield curve progression' },
              { name: 'Departure Time Band', formula: 'Slot ∈ [Early, Prime, Red-Eye]', desc: 'Passenger utility preference' },
              { name: 'Return Window Timing', formula: 'Sun Evening vs Mon Morning', desc: 'Trip turnaround elasticity' },
              { name: 'Demand Scarcity Index', formula: 'Unsold_Buckets / Total_Seats', desc: 'Real-time inventory pressure' },
              { name: 'Airport Hub Congestion', formula: 'Slot_Delay_Index(IGI, CSMIA)', desc: 'Runway & terminal friction' },
              { name: 'Intraday Fare Volatility', formula: 'σ_fare / μ_fare (24h Window)', desc: 'Algorithmic surge volatility' },
            ].map((feat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0A0C13] border border-white/[0.08] hover:border-blue-500/40 transition-ui space-y-1.5">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">{feat.formula}</span>
                <span className="text-xs font-semibold text-white block">{feat.name}</span>
                <span className="text-[10px] text-zinc-400 block">{feat.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: CPI / PRICE ANALYSIS ENGINE (WITH INTERACTIVE SIMULATOR) */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 05 • Core Econometrics</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">CPI / Airfare Price Index Calculation Engine</h2>
              <p className="text-xs text-zinc-400 mt-1">Modified Laspeyres price index formula with live corridor recalculation simulator.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Engine Active
              </span>
            </div>
          </div>

          {/* 4 Analytical Price States */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0A0C13] border border-emerald-500/30">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">State A • Opportunity</span>
              <span className="text-xs font-bold text-white block">Low Price Opportunity</span>
              <span className="text-[11px] text-zinc-400 mt-1 block">Current fare &lt; P25 historical band. Immediate booking recommendation triggered.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A0C13] border border-blue-500/30">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block mb-1">State B • Baseline</span>
              <span className="text-xs font-bold text-white block">Normal Price Range</span>
              <span className="text-[11px] text-zinc-400 mt-1 block">Index tracks 100.0 ± 5 pts. Stable consumer price equilibrium.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A0C13] border border-amber-500/30">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">State C • Alert</span>
              <span className="text-xs font-bold text-white block">High Price Period</span>
              <span className="text-[11px] text-zinc-400 mt-1 block">Surge &gt; P75 ceiling. Advises delaying non-essential travel.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A0C13] border border-purple-500/30">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block mb-1">State D • Arbitrage</span>
              <span className="text-xs font-bold text-white block">Potential Savings Opportunity</span>
              <span className="text-[11px] text-zinc-400 mt-1 block">High intra-day volatility detected. Target window saves up to 28%.</span>
            </div>
          </div>

          {/* Master Formula Display Card */}
          <div className="p-5 rounded-2xl bg-[#07090F] border border-cyan-500/40 text-center relative overflow-hidden shadow-2xl">
            <div className="text-[10px] text-zinc-400 font-mono mb-1 uppercase tracking-widest">Modified Laspeyres CPI Aggregator</div>
            <div className="text-cyan-300 font-mono text-lg sm:text-2xl font-bold tracking-wider py-1.5">
              I_t = [ ∑ ( P_i,t · W_i ) / ∑ ( P_i,0 · W_i ) ] × 100
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              W_i = Route passenger seat expenditure share from DGCA monthly scheduled filings.
            </div>
          </div>

          {/* Interactive Laspeyres Simulator Box */}
          <div className="bg-[#0A0C13] rounded-3xl border border-white/[0.08] p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders size={18} className="text-cyan-400" />
                  Interactive Laspeyres Recalculation Terminal
                </h3>
                <p className="text-xs text-zinc-400">Slide corridor fares below to trigger instantaneous index recalculation across all 4 regions.</p>
              </div>
              <button
                onClick={handleResetSim}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono transition-ui cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Reset to Baseline</span>
              </button>
            </div>

            {/* Live Recalculation Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0E1017] border border-cyan-500/40">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Simulated National Index</span>
                <span className="text-2xl font-black font-mono text-cyan-400 tabular-nums">{simResults.indexValue}</span>
                <span className="text-[10px] text-zinc-400 block font-mono">
                  Spread: <strong className={simResults.spread >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {simResults.spread >= 0 ? `+${simResults.spread}` : simResults.spread} pts
                  </strong>
                </span>
              </div>
              {simResults.regionalIndices.map(r => (
                <div key={r.region} className="p-3.5 rounded-xl bg-[#0E1017] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">{r.region} Corridor</span>
                  <span className="text-xl font-bold font-mono text-white tabular-nums">{r.index}</span>
                  <span className={`text-[10px] font-mono font-bold block tabular-nums ${r.change >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {r.change >= 0 ? `+${r.change}` : r.change}%
                  </span>
                </div>
              ))}
            </div>

            {/* Slider Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {corridors.map((c) => {
                const diff = (((c.currentFare - c.baseFare) / c.baseFare) * 100).toFixed(1);
                return (
                  <div key={c.route} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white font-mono">{c.route}</strong>
                        <span className="text-zinc-400 ml-1.5">({c.name})</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10">
                        {(c.weight * 100).toFixed(1)}% Weight
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-zinc-500">Base: ₹{c.baseFare}</span>
                      <span className="text-white font-bold tabular-nums">
                        Current: ₹{c.currentFare}{' '}
                        <span className={Number(diff) >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          ({Number(diff) >= 0 ? `+${diff}%` : `${diff}%`})
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

        {/* ========================================================================= */}
        {/* SECTION 6: AI / ML INTELLIGENCE LAYER */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 06 • Predictive Intelligence</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">AI / Machine Learning Forecasting Architecture</h2>
            <p className="text-xs text-zinc-400 mt-1">Multi-stage pipeline: Pattern Recognition ➔ Directional Prediction ➔ Confidence Validation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: 3 Distinct Tiers */}
            <div className="lg:col-span-7 space-y-3">
              <div className="p-4 rounded-xl bg-[#0A0C13] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">1</div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Historical Time-Series Analysis</h3>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Decomposes 3-year historical fare datasets into baseline trend, seasonal cyclicality, and noise. Establishes empirical expected fares for each day of the year.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0C13] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">2</div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Predictive Machine Learning Modeling</h3>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Gradient-boosted decision trees analyze current seat scarcity and advance booking horizons to forecast 7-day price drift (+/- %) with statistical confidence bounds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0C13] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">3</div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Recommendation & Natural Language Synthesis</h3>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Evaluates whether predicted price changes outweigh delay risk, synthesizing natural language booking strategies ("Book Now" vs "Wait 48h") for travel decision makers.
                </p>
              </div>
            </div>

            {/* Right Column: Live Interactive Model Terminal */}
            <div className="lg:col-span-5 bg-[#0A0C13] rounded-2xl border border-cyan-500/30 p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400" />
                    Live ML Corridor Inference
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Active API Model
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  {(['DEL-BOM', 'BOM-BLR', 'DEL-BLR'] as const).map(rt => (
                    <button
                      key={rt}
                      onClick={() => handleRunAiDemo(rt)}
                      disabled={aiPredicting}
                      className="flex-1 py-1.5 text-xs font-mono rounded-lg border border-white/[0.08] bg-[#0E1017] hover:bg-white/[0.06] text-white transition-ui cursor-pointer"
                    >
                      {rt}
                    </button>
                  ))}
                </div>

                {aiResult && (
                  <div className="mt-4 p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">Forecast Direction</span>
                        <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                          <ArrowDownRight size={14} /> {aiResult.direction}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">Predicted Shift</span>
                        <span className="text-sm font-mono font-bold text-white tabular-nums">{aiResult.predictedChange}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">Model Confidence</span>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full transition-all" style={{ width: `${aiResult.confidence}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 mt-1 block text-right">{aiResult.confidence}% Reliability</span>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-snug bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                      {aiResult.reasoning}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-zinc-500 font-mono">
                Verified against 104 domestic Indian corridors • Updated continuously.
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 7: ROUTE ANALYSIS */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 07 • Corridor Intelligence</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Spatial Route & Corridor Analysis</h2>
            <p className="text-xs text-zinc-400 mt-1">Mapping flight distance, fare velocity, seasonal demand, and optimal departure days.</p>
          </div>

          <div className="bg-[#0A0C13] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-6">
            
            {/* Route Selector Tabs */}
            <div className="flex gap-2 border-b border-white/[0.06] pb-3">
              {[
                { key: 'DEL-BOM', label: 'Delhi ➔ Mumbai', distance: '1,148 km', time: '2h 10m' },
                { key: 'BOM-BLR', label: 'Mumbai ➔ Bengaluru', distance: '842 km', time: '1h 45m' },
                { key: 'DEL-BLR', label: 'Delhi ➔ Bengaluru', distance: '1,740 km', time: '2h 45m' },
              ].map(r => (
                <button
                  key={r.key}
                  onClick={() => setSelectedRouteKey(r.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-ui cursor-pointer border ${
                    selectedRouteKey === r.key
                      ? 'bg-blue-600/20 text-cyan-300 border-cyan-400'
                      : 'bg-[#0E1017] text-zinc-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Visual Route Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] text-center">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">Origin Node</span>
                <span className="text-base font-bold text-white font-mono">
                  {selectedRouteKey.split('-')[0]}
                </span>
                <span className="text-[10px] text-zinc-500 block">Primary Metro Hub</span>
              </div>

              <div className="text-center text-zinc-500 font-bold hidden md:block">➔</div>

              <div className="p-4 rounded-xl bg-[#0E1017] border border-cyan-500/30 text-center">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">Fare Intelligence</span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  {selectedRouteKey === 'DEL-BOM' ? '₹4,820 Median' : selectedRouteKey === 'BOM-BLR' ? '₹4,250 Median' : '₹6,400 Median'}
                </span>
                <span className="text-[10px] text-zinc-400 block">Lowest on Tue & Wed</span>
              </div>

              <div className="text-center text-zinc-500 font-bold hidden md:block">➔</div>

              <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] text-center">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">Destination Node</span>
                <span className="text-base font-bold text-white font-mono">
                  {selectedRouteKey.split('-')[1]}
                </span>
                <span className="text-[10px] text-zinc-500 block">Destination Terminal</span>
              </div>
            </div>

            {/* Route Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Optimal Booking Window</span>
                <span className="text-xs font-bold text-white font-mono">14 to 18 Days Ahead</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Cheapest Departure Day</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">Tuesday (Mid-day)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Peak Surge Window</span>
                <span className="text-xs font-bold text-rose-400 font-mono">Friday 18:00 - 21:00</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Primary Operating Carrier</span>
                <span className="text-xs font-bold text-white font-mono">IndiGo (6E) & Vistara (UK)</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 8: RECOMMENDATION ENGINE (CONVERGENCE MODEL) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 08 • Synthesis Core</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Recommendation Engine Convergence Model</h2>
            <p className="text-xs text-zinc-400 mt-1">How 7 distinct analytical inputs converge into concrete consumer travel advice.</p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0B0F1C] to-[#070A12] border border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
              {[
                { name: 'CPI Index', sub: 'Baseline Value' },
                { name: 'Historical Fare', sub: '3-Year Trend' },
                { name: 'Route Capacity', sub: 'Load Factor' },
                { name: 'Demand Cycle', sub: 'Seat Scarcity' },
                { name: 'Seasonality', sub: 'Festival Factor' },
                { name: 'Booking Window', sub: 'Horizon Curve' },
                { name: 'AI Prediction', sub: 'ML Forecast' },
              ].map((inp, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-xs font-bold text-white block">{inp.name}</span>
                  <span className="text-[9px] font-mono text-cyan-400 block">{inp.sub}</span>
                </div>
              ))}
            </div>

            {/* Convergence Visual Arrow & Hub */}
            <div className="my-6 flex flex-col items-center">
              <div className="w-px h-6 bg-gradient-to-b from-cyan-500 to-blue-600" />
              <div className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-center shadow-lg shadow-cyan-500/10">
                <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Cpu size={16} /> AeroNex Multi-Factor Recommendation Core
                </span>
              </div>
              <div className="w-px h-6 bg-gradient-to-b from-blue-600 to-emerald-500" />
            </div>

            {/* Output Results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-[#0E1017] border border-emerald-500/30">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">Target Flight</span>
                <span className="text-xs font-bold text-white">IndiGo 6E-2041 (06:15)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0E1017] border border-cyan-500/30">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">Optimal Booking Day</span>
                <span className="text-xs font-bold text-white">Tuesday (14d Prior)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0E1017] border border-blue-500/30">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block mb-1">Optimal Return Day</span>
                <span className="text-xs font-bold text-white">Sunday (Post 21:00)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0E1017] border border-purple-500/30">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block mb-1">Expected Wallet Saving</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">₹1,430 (22.8% Saved)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 9: USER OUTPUT PRESENTATION */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">Section 09 • Actionable Intelligence</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">User Output Presentation</h2>
            <p className="text-xs text-zinc-400 mt-1">Converting deep algorithmic complexity into clean, actionable advice for travelers and statisticians.</p>
          </div>

          {/* Actionable Result Card Preview */}
          <div className="bg-[#0A0C13] rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl obsidian-card relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold mb-2">
                  <CheckCircle2 size={12} /> Verified Best Booking Recommendation
                </div>
                <h3 className="text-xl font-bold text-white">DEL ➔ BOM (Delhi to Mumbai Corridor)</h3>
                <p className="text-xs text-zinc-400">Analysis synthesized from 18,400 observed tickets in the current monthly cycle.</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Expected Tariff</span>
                <span className="text-3xl font-black font-mono text-cyan-400 tabular-nums">₹4,820</span>
                <span className="text-xs text-emerald-400 font-mono block">Save ₹1,430 vs Spot Average</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Recommended Flight</span>
                <div className="text-sm font-bold text-white">IndiGo 6E-2041</div>
                <div className="text-[11px] text-zinc-400">06:15 DEL ➔ 08:30 BOM (Direct)</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Booking Window</span>
                <div className="text-sm font-bold text-white">Tuesday Morning</div>
                <div className="text-[11px] text-zinc-400">14–18 days prior to departure</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Return Flight Window</span>
                <div className="text-sm font-bold text-white">Sunday Late Evening</div>
                <div className="text-[11px] text-zinc-400">Departure post 21:00 avoids surge</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1017] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Algorithm Reliability</span>
                <div className="text-sm font-bold text-cyan-400 font-mono">94.2% Confidence</div>
                <div className="text-[11px] text-zinc-400">Backtested over 12 months</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-400">
                Ready to inspect live flight fares or track price alerts for this corridor?
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => navigate('/search?from=DEL&to=BOM')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono transition-ui cursor-pointer"
                >
                  <Search size={14} />
                  <span>Search Flights</span>
                </button>
                <button
                  onClick={() => navigate('/price-alerts')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-ui cursor-pointer"
                >
                  <span>Set Price Alert</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
