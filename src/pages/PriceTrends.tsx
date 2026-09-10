import { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ReferenceLine 
} from 'recharts';
import { 
  ArrowLeftRight, TrendingDown, TrendingUp, Search, Zap 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { INDIAN_AIRPORTS } from '../data/indianAviation';

export function PriceTrends() {
  usePageTitle('Price Trends');
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [period, setPeriod] = useState<'30d' | '90d' | '180d'>('30d');

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Generate dynamic trend dataset based on selected route and period
  const trendData = useMemo(() => {
    const isMajor = (origin === 'DEL' && destination === 'BOM') || (origin === 'BOM' && destination === 'DEL');
    const isBlr = (origin === 'BOM' && destination === 'BLR') || (origin === 'BLR' && destination === 'BOM');
    const isGoi = origin === 'GOI' || destination === 'GOI';

    let base = 5200;
    if (isMajor) base = 5400;
    else if (isBlr) base = 4300;
    else if (isGoi) base = 4800;

    const days = period === '30d' ? 30 : period === '90d' ? 90 : 180;
    const step = period === '30d' ? 2 : period === '90d' ? 6 : 12;

    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i -= step) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
      // Dynamic simulated curve with weekday/weekend fluctuations
      const dayOfWeek = d.getDay();
      const weekendSurcharge = (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) ? 450 : -200;
      const wave = Math.sin(i / 5) * 350;
      const jitter = ((i * 37) % 250) - 125;
      const fare = Math.round(base + weekendSurcharge + wave + jitter);

      data.push({
        date: label,
        price: fare,
        lowest: Math.round(fare * 0.88),
        highest: Math.round(fare * 1.15),
      });
    }

    return data;
  }, [origin, destination, period]);

  const prices = trendData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const currentPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const priceChangePercent = (((currentPrice - firstPrice) / firstPrice) * 100).toFixed(1);
  const isDrop = Number(priceChangePercent) <= 0;

  const originAirport = INDIAN_AIRPORTS.find(a => a.code === origin) || { city: origin, name: 'Airport' };
  const destAirport = INDIAN_AIRPORTS.find(a => a.code === destination) || { city: destination, name: 'Airport' };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              Historical Price Trends & Volatility
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                180-Day Memory
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Analyze seasonal fare trajectories and timing windows across domestic aviation sectors.
            </p>
          </div>

          <div className="flex bg-[#12141C] border border-white/[0.08] rounded-2xl p-1 shadow-lg">
            {(['30d', '90d', '180d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  period === p
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Route Selector Panel */}
        <div className="bg-[#12141C] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl obsidian-card">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Origin */}
            <div className="flex-1 w-full">
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block font-mono">
                Origin City
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-[#161824] border border-white/[0.08] rounded-xl text-white px-4 py-3 text-sm focus:border-cyan-500/60 outline-none cursor-pointer"
              >
                {INDIAN_AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code} className="bg-[#12141C]">
                    {a.code} — {a.city} ({a.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap */}
            <button
              onClick={handleSwap}
              title="Swap origin & destination"
              className="mt-6 w-10 h-10 rounded-full bg-[#161824] border border-white/[0.08] hover:border-cyan-400 text-zinc-400 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <ArrowLeftRight size={16} />
            </button>

            {/* Destination */}
            <div className="flex-1 w-full">
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block font-mono">
                Destination City
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-[#161824] border border-white/[0.08] rounded-xl text-white px-4 py-3 text-sm focus:border-cyan-500/60 outline-none cursor-pointer"
              >
                {INDIAN_AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code} className="bg-[#12141C]">
                    {a.code} — {a.city} ({a.name})
                  </option>
                ))}
              </select>
            </div>

            {/* CTA */}
            <div className="mt-6 w-full md:w-auto">
              <button
                onClick={() => navigate(`/search?from=${origin}&to=${destination}`)}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-xl text-white px-6 py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all cursor-pointer whitespace-nowrap shadow-lg"
              >
                <Search size={16} /> Search Flights
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-cyan-500/10 via-[#12141C] to-[#12141C] border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
            <span className="text-xs uppercase font-bold text-zinc-400 block mb-1 font-mono">Current Lowest Fare</span>
            <div className="text-2xl font-black text-cyan-300 font-mono">₹{currentPrice.toLocaleString('en-IN')}</div>
            <div className="mt-2 text-xs flex items-center gap-1 font-mono">
              <span className={`font-semibold flex items-center ${isDrop ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isDrop ? <TrendingDown size={14} className="mr-0.5" /> : <TrendingUp size={14} className="mr-0.5" />}
                {priceChangePercent}%
              </span>
              <span className="text-zinc-500">vs start of period</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 via-[#12141C] to-[#12141C] border border-emerald-500/20 rounded-2xl p-5 shadow-xl">
            <span className="text-xs uppercase font-bold text-zinc-400 block mb-1 font-mono">Recorded Lowest</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">₹{minPrice.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-zinc-500 mt-2 block font-mono">Optimal booking target</span>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 via-[#12141C] to-[#12141C] border border-rose-500/20 rounded-2xl p-5 shadow-xl">
            <span className="text-xs uppercase font-bold text-zinc-400 block mb-1 font-mono">Peak Recorded Fare</span>
            <div className="text-2xl font-black text-rose-400 font-mono">₹{maxPrice.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-zinc-500 mt-2 block font-mono">Holiday peak surge</span>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 via-[#12141C] to-[#12141C] border border-purple-500/20 rounded-2xl p-5 shadow-xl">
            <span className="text-xs uppercase font-bold text-zinc-400 block mb-1 font-mono">Period Average Fare</span>
            <div className="text-2xl font-black text-purple-400 font-mono">₹{avgPrice.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-zinc-500 mt-2 block font-mono">Benchmark baseline</span>
          </div>
        </div>

        {/* Primary Trend Chart */}
        <div className="bg-[#12141C] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl obsidian-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
                {originAirport.city} ({origin}) ➔ {destAirport.city} ({destination})
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Daily aggregated lowest nonstop fares over {period.toUpperCase()}
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-medium font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Volatility: Stable (14.2%)
            </span>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="vibrantTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.45} />
                    <stop offset="40%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="80%" stopColor="#3B82F6" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="#090A0F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="trendStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={11} tickFormatter={(v) => `₹${v}`} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1017', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.85)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#A1A1AA', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Fare']}
                />
                <ReferenceLine y={avgPrice} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: `Avg ₹${avgPrice}`, fill: '#F59E0B', fontSize: 11 }} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="url(#trendStrokeGrad)" 
                  strokeWidth={3.5} 
                  fillOpacity={1} 
                  fill="url(#vibrantTrendGrad)" 
                  isAnimationActive={true}
                  animationDuration={1100}
                  animationEasing="ease-in-out"
                  activeDot={{ r: 6, fill: '#00E5FF', stroke: '#fff', strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategic Timing Recommendation */}
        <div className="bg-[#12141C] border border-cyan-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 obsidian-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Optimal Booking Advisory</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Historical patterns show lowest fares for this route are released 14 to 21 days prior to departure.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/airfare-index`)}
            className="px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            Analyze National Airfare Index →
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
