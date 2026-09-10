import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  Plane, Search, ShieldCheck, 
  Layers, X, Wifi, Luggage, 
  UtensilsCrossed, ArrowUpRight, BarChart3, 
  ChevronRight, ExternalLink
} from 'lucide-react';

interface FleetItem {
  model: string;
  active: number;
  onOrder: number;
  seats: string;
}

interface AirlineRouteItem {
  corridor: string;
  medianFare: number;
  dailyFlights: number;
  duration: string;
}

interface AirlineDetail {
  id: string;
  name: string;
  code: string;
  icao: string;
  callsign: string;
  type: 'LCC' | 'FSC' | 'REGIONAL';
  typeLabel: string;
  brandColor: string;
  accentGlow: string;
  hub: string;
  headquarters: string;
  parentCompany: string;
  fleetSize: number;
  marketShare: number;
  routesCount: number;
  otp: number;
  avgYieldPerKm: number;
  cancellationRate: number;
  baggageAllowance: string;
  mealsPolicy: string;
  wifiEnabled: boolean;
  fleetComposition: FleetItem[];
  topCorridors: AirlineRouteItem[];
}

const AIRLINES_DATABASE: AirlineDetail[] = [
  {
    id: 'indigo',
    name: 'IndiGo',
    code: '6E',
    icao: 'IGO',
    callsign: 'IFLY',
    type: 'LCC',
    typeLabel: 'Low-Cost Carrier',
    brandColor: '#0071C2',
    accentGlow: 'rgba(0, 210, 255, 0.4)',
    hub: 'Delhi (DEL) / Mumbai (BOM) / Bengaluru (BLR)',
    headquarters: 'Gurugram, Haryana',
    parentCompany: 'InterGlobe Aviation Ltd.',
    fleetSize: 382,
    marketShare: 62.8,
    routesCount: 104,
    otp: 89.2,
    avgYieldPerKm: 4.85,
    cancellationRate: 0.35,
    baggageAllowance: '15 kg Check-in + 7 kg Cabin',
    mealsPolicy: 'Buy-on-Board Snack & Beverage Menu (6E Eats)',
    wifiEnabled: false,
    fleetComposition: [
      { model: 'Airbus A320neo', active: 194, onOrder: 150, seats: '180 / 186 Y' },
      { model: 'Airbus A321neo', active: 104, onOrder: 280, seats: '222 / 232 Y' },
      { model: 'ATR 72-600', active: 45, onOrder: 15, seats: '78 Y' },
      { model: 'Airbus A321XLR', active: 0, onOrder: 69, seats: 'Long Haul Config' },
      { model: 'Boeing 777-300ER (Leased)', active: 2, onOrder: 0, seats: '531 Y / 7 C' },
    ],
    topCorridors: [
      { corridor: 'DEL → BOM', medianFare: 5420, dailyFlights: 24, duration: '2h 15m' },
      { corridor: 'BOM → BLR', medianFare: 4280, dailyFlights: 18, duration: '1h 45m' },
      { corridor: 'DEL → BLR', medianFare: 6850, dailyFlights: 16, duration: '2h 45m' },
      { corridor: 'CCU → DEL', medianFare: 5120, dailyFlights: 12, duration: '2h 20m' },
    ],
  },
  {
    id: 'air-india',
    name: 'Air India',
    code: 'AI',
    icao: 'AIC',
    callsign: 'AIRINDIA',
    type: 'FSC',
    typeLabel: 'Full-Service Carrier',
    brandColor: '#E31837',
    accentGlow: 'rgba(227, 24, 55, 0.4)',
    hub: 'Delhi (DEL) / Mumbai (BOM)',
    headquarters: 'Gurugram, Haryana',
    parentCompany: 'Tata Sons (100%)',
    fleetSize: 142,
    marketShare: 14.6,
    routesCount: 85,
    otp: 82.4,
    avgYieldPerKm: 5.60,
    cancellationRate: 0.82,
    baggageAllowance: '25 kg Check-in + 8 kg Cabin (Economy)',
    mealsPolicy: 'Complimentary Hot Multi-Course Meals',
    wifiEnabled: true,
    fleetComposition: [
      { model: 'Airbus A350-900', active: 6, onOrder: 34, seats: '28 B / 24 W / 264 Y' },
      { model: 'Boeing 777-300ER', active: 19, onOrder: 10, seats: '4 F / 35 B / 303 Y' },
      { model: 'Boeing 787-8 Dreamliner', active: 27, onOrder: 20, seats: '18 B / 238 Y' },
      { model: 'Airbus A321neo', active: 22, onOrder: 140, seats: '12 B / 180 Y' },
      { model: 'Airbus A320neo', active: 48, onOrder: 70, seats: '12 B / 150 Y' },
    ],
    topCorridors: [
      { corridor: 'DEL → BOM', medianFare: 5850, dailyFlights: 18, duration: '2h 10m' },
      { corridor: 'DEL → BLR', medianFare: 7200, dailyFlights: 12, duration: '2h 40m' },
      { corridor: 'BOM → MAA', medianFare: 4890, dailyFlights: 8, duration: '1h 55m' },
      { corridor: 'DEL → HYD', medianFare: 4950, dailyFlights: 10, duration: '2h 15m' },
    ],
  },
  {
    id: 'vistara',
    name: 'Vistara',
    code: 'UK',
    icao: 'VTI',
    callsign: 'VISTARA',
    type: 'FSC',
    typeLabel: 'Full-Service Carrier',
    brandColor: '#7A2267',
    accentGlow: 'rgba(192, 132, 252, 0.4)',
    hub: 'Delhi (DEL) / Mumbai (BOM)',
    headquarters: 'Gurugram, Haryana',
    parentCompany: 'Tata Sons & Singapore Airlines',
    fleetSize: 70,
    marketShare: 9.8,
    routesCount: 42,
    otp: 88.6,
    avgYieldPerKm: 5.95,
    cancellationRate: 0.41,
    baggageAllowance: '20 kg Check-in (Eco) / 30 kg (Business)',
    mealsPolicy: 'Complimentary Star Alliance Gourmet Dining',
    wifiEnabled: true,
    fleetComposition: [
      { model: 'Boeing 787-9 Dreamliner', active: 7, onOrder: 0, seats: '30 B / 21 W / 248 Y' },
      { model: 'Airbus A321neo', active: 10, onOrder: 0, seats: '12 B / 24 W / 152 Y' },
      { model: 'Airbus A320neo', active: 53, onOrder: 0, seats: '8 B / 24 W / 126 Y' },
    ],
    topCorridors: [
      { corridor: 'DEL → BOM', medianFare: 6100, dailyFlights: 14, duration: '2h 15m' },
      { corridor: 'DEL → BLR', medianFare: 7450, dailyFlights: 10, duration: '2h 45m' },
      { corridor: 'BOM → GOI', medianFare: 3950, dailyFlights: 6, duration: '1h 10m' },
    ],
  },
  {
    id: 'akasa-air',
    name: 'Akasa Air',
    code: 'QP',
    icao: 'AKJ',
    callsign: 'AKASA AIR',
    type: 'LCC',
    typeLabel: 'Low-Cost Carrier',
    brandColor: '#FF6B00',
    accentGlow: 'rgba(255, 107, 0, 0.4)',
    hub: 'Mumbai (BOM) / Bengaluru (BLR)',
    headquarters: 'Mumbai, Maharashtra',
    parentCompany: 'SNV Aviation Pvt. Ltd.',
    fleetSize: 26,
    marketShare: 4.8,
    routesCount: 28,
    otp: 86.9,
    avgYieldPerKm: 4.55,
    cancellationRate: 0.48,
    baggageAllowance: '15 kg Check-in + 7 kg Cabin',
    mealsPolicy: 'Café Akasa Fresh Food Program (Pre-order)',
    wifiEnabled: false,
    fleetComposition: [
      { model: 'Boeing 737 MAX 8', active: 24, onOrder: 150, seats: '189 Y' },
      { model: 'Boeing 737 MAX 8-200', active: 2, onOrder: 54, seats: '197 Y' },
    ],
    topCorridors: [
      { corridor: 'BOM → BLR', medianFare: 4150, dailyFlights: 8, duration: '1h 45m' },
      { corridor: 'DEL → GOI', medianFare: 6200, dailyFlights: 4, duration: '2h 35m' },
      { corridor: 'BLR → HYD', medianFare: 3190, dailyFlights: 6, duration: '1h 10m' },
    ],
  },
  {
    id: 'spicejet',
    name: 'SpiceJet',
    code: 'SG',
    icao: 'SEJ',
    callsign: 'SPICEJET',
    type: 'LCC',
    typeLabel: 'Low-Cost Carrier',
    brandColor: '#E53935',
    accentGlow: 'rgba(248, 113, 113, 0.4)',
    hub: 'Delhi (DEL) / Hyderabad (HYD)',
    headquarters: 'Gurugram, Haryana',
    parentCompany: 'SpiceJet Ltd.',
    fleetSize: 56,
    marketShare: 3.9,
    routesCount: 46,
    otp: 74.1,
    avgYieldPerKm: 4.40,
    cancellationRate: 1.65,
    baggageAllowance: '15 kg Check-in + 7 kg Cabin',
    mealsPolicy: 'SpiceCafe Hot Meals & Beverages',
    wifiEnabled: false,
    fleetComposition: [
      { model: 'Boeing 737-800', active: 28, onOrder: 0, seats: '189 Y' },
      { model: 'Boeing 737 MAX 8', active: 10, onOrder: 50, seats: '189 Y' },
      { model: 'De Havilland Q400', active: 18, onOrder: 0, seats: '78 / 90 Y' },
    ],
    topCorridors: [
      { corridor: 'DEL → BOM', medianFare: 5100, dailyFlights: 6, duration: '2h 20m' },
      { corridor: 'GOI → BOM', medianFare: 3450, dailyFlights: 4, duration: '1h 15m' },
      { corridor: 'DEL → JAI', medianFare: 2450, dailyFlights: 4, duration: '0h 55m' },
    ],
  },
  {
    id: 'aix-connect',
    name: 'AIX Connect (AirAsia India)',
    code: 'I5',
    icao: 'IAD',
    callsign: 'RED KNIGHT',
    type: 'LCC',
    typeLabel: 'Low-Cost Carrier',
    brandColor: '#ED1C24',
    accentGlow: 'rgba(237, 28, 36, 0.4)',
    hub: 'Bengaluru (BLR) / Delhi (DEL)',
    headquarters: 'Bengaluru, Karnataka',
    parentCompany: 'Tata Sons (Air India Express)',
    fleetSize: 28,
    marketShare: 2.7,
    routesCount: 34,
    otp: 83.5,
    avgYieldPerKm: 4.65,
    cancellationRate: 0.62,
    baggageAllowance: '15 kg Check-in + 7 kg Cabin',
    mealsPolicy: 'Gourmair In-flight Hot Dishes',
    wifiEnabled: false,
    fleetComposition: [
      { model: 'Airbus A320-200', active: 23, onOrder: 0, seats: '180 Y' },
      { model: 'Airbus A320neo', active: 5, onOrder: 0, seats: '186 Y' },
    ],
    topCorridors: [
      { corridor: 'BLR → DEL', medianFare: 6700, dailyFlights: 6, duration: '2h 45m' },
      { corridor: 'BLR → CCU', medianFare: 5650, dailyFlights: 4, duration: '2h 30m' },
    ],
  },
  {
    id: 'alliance-air',
    name: 'Alliance Air',
    code: '9I',
    icao: 'LLR',
    callsign: 'ALLIED',
    type: 'REGIONAL',
    typeLabel: 'Regional RCS Feeder',
    brandColor: '#1E3A8A',
    accentGlow: 'rgba(96, 165, 250, 0.4)',
    hub: 'Delhi (DEL) / Kolkata (CCU)',
    headquarters: 'Delhi (IGI Airport)',
    parentCompany: 'AIAHL (Govt. of India Enterprise)',
    fleetSize: 21,
    marketShare: 1.4,
    routesCount: 18,
    otp: 80.2,
    avgYieldPerKm: 5.10,
    cancellationRate: 1.20,
    baggageAllowance: '15 kg Check-in + 5 kg Cabin (ATR)',
    mealsPolicy: 'Complimentary Snack Box & Water',
    wifiEnabled: false,
    fleetComposition: [
      { model: 'ATR 72-600', active: 18, onOrder: 2, seats: '70 Y' },
      { model: 'Dornier 228', active: 2, onOrder: 2, seats: '17 Y' },
      { model: 'ATR 42-600', active: 1, onOrder: 0, seats: '48 Y' },
    ],
    topCorridors: [
      { corridor: 'DEL → DHM (Dharamsala)', medianFare: 5800, dailyFlights: 2, duration: '1h 20m' },
      { corridor: 'CCU → GAU (Guwahati)', medianFare: 3600, dailyFlights: 2, duration: '1h 10m' },
    ],
  },
];

export function AirlinesPage() {
  usePageTitle('Airlines Intelligence & Fleet Directory');
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'LCC' | 'FSC' | 'REGIONAL'>('ALL');
  const [sortBy, setSortBy] = useState<'marketShare' | 'fleetSize' | 'otp' | 'routes'>('marketShare');
  const [activeModalAirline, setActiveModalAirline] = useState<AirlineDetail | null>(null);

  // Filter and sort airlines
  const filteredAirlines = useMemo(() => {
    return AIRLINES_DATABASE.filter(airline => {
      const matchesSearch = 
        airline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airline.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airline.hub.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airline.headquarters.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'ALL' || airline.type === selectedType;
      return matchesSearch && matchesType;
    }).sort((a, b) => {
      if (sortBy === 'marketShare') return b.marketShare - a.marketShare;
      if (sortBy === 'fleetSize') return b.fleetSize - a.fleetSize;
      if (sortBy === 'otp') return b.otp - a.otp;
      if (sortBy === 'routes') return b.routesCount - a.routesCount;
      return 0;
    });
  }, [searchQuery, selectedType, sortBy]);

  // Industry aggregate metrics
  const totalFleet = useMemo(() => AIRLINES_DATABASE.reduce((acc, a) => acc + a.fleetSize, 0), []);
  const avgOTP = useMemo(() => (AIRLINES_DATABASE.reduce((acc, a) => acc + a.otp, 0) / AIRLINES_DATABASE.length).toFixed(1), []);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0D14] via-[#12141F] to-[#161928] border border-white/[0.08] p-6 sm:p-8 shadow-2xl obsidian-card">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>DGCA Scheduled Commercial Aviation</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Indian Scheduled <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Airlines Directory</span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Comprehensive fleet tracking, market share distribution, on-time performance (OTP), and passenger yield benchmarks across all certified domestic carriers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => navigate('/airfare-index')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <BarChart3 size={15} />
                <span>Airfare Index Benchmark</span>
              </button>
              <button
                onClick={() => navigate('/routes')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#161824] hover:bg-white/[0.08] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Layers size={15} />
                <span>Explore Route Matrix</span>
              </button>
            </div>
          </div>

          {/* Quick Aggregate Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.06]">
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Monitored Airlines</span>
              <span className="text-white text-xl sm:text-2xl font-black font-mono">7 Carriers</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Active Commercial Fleet</span>
              <span className="text-cyan-400 text-xl sm:text-2xl font-black font-mono">{totalFleet} Aircraft</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Market Leader</span>
              <span className="text-white text-xl sm:text-2xl font-black font-mono">IndiGo (62.8%)</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">Industry Average OTP</span>
              <span className="text-emerald-400 text-xl sm:text-2xl font-black font-mono">{avgOTP}% On-Time</span>
            </div>
          </div>
        </div>

        {/* Section 1: Market Share Distribution Visualizer */}
        <div className="bg-[#12141C] rounded-2xl border border-white/[0.08] p-6 shadow-xl space-y-4 obsidian-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <BarChart3 size={17} className="text-cyan-400" />
                <span>Domestic Market Share Distribution (Capacity Share)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                DGCA monthly passenger carriage proportions across scheduled operators.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.08]">
              FY 2025-26 Certified
            </span>
          </div>

          {/* Stacked Multi-Segment Color Bar */}
          <div className="w-full h-4 rounded-xl bg-zinc-800 overflow-hidden flex shadow-inner p-0.5 border border-white/[0.06]">
            {AIRLINES_DATABASE.map((a) => (
              <div
                key={a.id}
                style={{ width: `${a.marketShare}%`, backgroundColor: a.brandColor }}
                title={`${a.name}: ${a.marketShare}%`}
                className="h-full first:rounded-l-lg last:rounded-r-lg hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => setActiveModalAirline(a)}
              />
            ))}
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {AIRLINES_DATABASE.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveModalAirline(a)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs transition-all cursor-pointer group"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.brandColor }} />
                <span className="text-zinc-300 group-hover:text-white font-medium">{a.name}</span>
                <span className="text-zinc-500 font-mono font-bold text-[11px]">{a.marketShare}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Search, Category Filters & Sort Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by carrier name, IATA code (6E, AI), hub (DEL)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12141C] border border-white/[0.08] text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filters & Sorter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-[#12141C] p-1 rounded-xl border border-white/[0.08]">
              {(['ALL', 'LCC', 'FSC', 'REGIONAL'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedType === t
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {t === 'ALL' ? 'All (7)' : t === 'LCC' ? 'Low-Cost' : t === 'FSC' ? 'Full-Service' : 'Regional'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-[#12141C] px-3 py-1.5 rounded-xl border border-white/[0.08]">
              <span className="text-[11px] text-zinc-500 font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
              >
                <option value="marketShare" className="bg-[#12141C]">Market Share</option>
                <option value="fleetSize" className="bg-[#12141C]">Fleet Size</option>
                <option value="otp" className="bg-[#12141C]">On-Time Rate</option>
                <option value="routes" className="bg-[#12141C]">Routes Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Rich Airline Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAirlines.map((airline) => (
            <div
              key={airline.id}
              className="bg-[#12141C] rounded-2xl border border-white/[0.08] hover:border-white/[0.2] p-6 shadow-xl flex flex-col justify-between obsidian-card transition-all duration-300 group relative overflow-hidden"
              style={{
                boxShadow: `0 8px 30px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Airline Top Color Accent Bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
                style={{ backgroundColor: airline.brandColor }}
              />

              <div>
                {/* Card Top Row: Logo Badge & Type */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-white text-lg shadow-lg border border-white/[0.12] transition-transform group-hover:scale-105"
                      style={{ backgroundColor: airline.brandColor }}
                    >
                      {airline.code}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                        {airline.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                        <span>ICAO: {airline.icao}</span>
                        <span>•</span>
                        <span>Callsign: {airline.callsign}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                    airline.type === 'LCC' 
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                      : airline.type === 'FSC'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {airline.type}
                  </span>
                </div>

                {/* Hub Information */}
                <p className="text-xs text-zinc-400 leading-snug line-clamp-1 mb-4">
                  <span className="text-zinc-500">Hubs:</span> {airline.hub}
                </p>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                  <div>
                    <span className="text-[10.5px] text-zinc-500 block font-mono">MARKET SHARE</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-white font-mono font-bold text-base">{airline.marketShare}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${airline.marketShare * 1.5}%`, backgroundColor: airline.brandColor }} 
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-zinc-500 block font-mono">FLEET SIZE</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-white font-mono font-bold text-base">{airline.fleetSize}</span>
                      <span className="text-[10px] text-zinc-500">aircraft</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-1 truncate">
                      {airline.fleetComposition[0]?.model}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="text-[10.5px] text-zinc-500 block font-mono">ON-TIME (OTP)</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm block mt-0.5">
                      {airline.otp}%
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="text-[10.5px] text-zinc-500 block font-mono">ROUTES</span>
                    <span className="text-cyan-400 font-mono font-bold text-sm block mt-0.5">
                      {airline.routesCount} corridors
                    </span>
                  </div>
                </div>

                {/* Policy Highlights */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <Luggage size={11} className="text-zinc-500" />
                    {airline.baggageAllowance.split(' ')[0]} {airline.baggageAllowance.split(' ')[1]}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <UtensilsCrossed size={11} className="text-zinc-500" />
                    {airline.type === 'FSC' ? 'Hot Meals' : 'Buy-on-Board'}
                  </span>
                  {airline.wifiEnabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Wifi size={11} />
                      In-flight Wi-Fi
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalAirline(airline)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Fleet & Details</span>
                  <ChevronRight size={14} />
                </button>

                <button
                  onClick={() => navigate(`/search?airline=${airline.code}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                  style={{ backgroundColor: airline.brandColor }}
                >
                  <span>Search Flights</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Carrier Detail Modal */}
        {activeModalAirline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#0E1017] border border-white/[0.14] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
              
              {/* Close Button */}
              <button
                onClick={() => setActiveModalAirline(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black font-mono text-white text-2xl shadow-xl border border-white/[0.15] shrink-0"
                  style={{ backgroundColor: activeModalAirline.brandColor }}
                >
                  {activeModalAirline.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">{activeModalAirline.name}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 font-mono">
                      {activeModalAirline.typeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {activeModalAirline.parentCompany} • HQ: {activeModalAirline.headquarters}
                  </p>
                </div>
              </div>

              {/* Top Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Market Share</span>
                  <span className="text-white font-bold text-sm">{activeModalAirline.marketShare}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Total Fleet</span>
                  <span className="text-cyan-400 font-bold text-sm">{activeModalAirline.fleetSize} Active</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">On-Time (OTP)</span>
                  <span className="text-emerald-400 font-bold text-sm">{activeModalAirline.otp}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Cancellation</span>
                  <span className="text-zinc-300 font-bold text-sm">{activeModalAirline.cancellationRate}%</span>
                </div>
              </div>

              {/* Fleet Composition Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plane size={15} className="text-cyan-400" />
                  <span>Fleet Composition & Aircraft Orders</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-zinc-500 font-mono uppercase text-[10.5px]">
                        <th className="pb-2">Aircraft Model</th>
                        <th className="pb-2 text-center">Active</th>
                        <th className="pb-2 text-center">On Order</th>
                        <th className="pb-2 text-right">Cabin Configuration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {activeModalAirline.fleetComposition.map((f, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 font-bold text-white">{f.model}</td>
                          <td className="py-2.5 text-center font-mono text-cyan-300 font-semibold">{f.active}</td>
                          <td className="py-2.5 text-center font-mono text-zinc-400">{f.onOrder || '—'}</td>
                          <td className="py-2.5 text-right font-mono text-zinc-300">{f.seats}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Operated Corridors */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={15} className="text-cyan-400" />
                  <span>Primary Domestic Corridors</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeModalAirline.topCorridors.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-white block">{c.corridor}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{c.dailyFlights} flights/day • {c.duration}</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300">₹{c.medianFare.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => navigate('/routes')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View All Domestic Routes</span>
                  <ExternalLink size={12} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalAirline(null)}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const code = activeModalAirline.code;
                      setActiveModalAirline(null);
                      navigate(`/search?airline=${code}`);
                    }}
                    className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                    style={{ backgroundColor: activeModalAirline.brandColor }}
                  >
                    Search Flights
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
