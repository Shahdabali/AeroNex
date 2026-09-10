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

          <div className="flex bg-[#0A1838] border border-slate-700 rounded-2xl p-1 shadow-lg">
            {(['30d', '90d', '180d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  period === p
                    ? 'bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Route Selector Panel */}
        <div className="bg-[rgba(10,24,56,0.65)] backdrop-blur-xl border border-blue-500/20 rounded-[24px] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Origin */}
            <div className="flex-1 w-full">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                Origin City
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3 text-sm focus:border-[#1788FF] outline-none cursor-pointer"
              >
                {INDIAN_AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code} className="bg-[#0A1838]">
                    {a.code} — {a.city} ({a.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap */}
            <button
              onClick={handleSwap}
              title="Swap origin & destination"
              className="mt-6 w-10 h-10 rounded-full bg-[#0A1838] border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <ArrowLeftRight size={16} />
            </button>

            {/* Destination */}
            <div className="flex-1 w-full">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                Destination City
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-3 text-sm focus:border-[#1788FF] outline-none cursor-pointer"
              >
                {INDIAN_AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code} className="bg-[#0A1838]">
                    {a.code} — {a.city} ({a.name})
                  </option>
                ))}
              </select>
            </div>

            {/* CTA */}
            <div className="mt-6 w-full md:w-auto">
              <button
                onClick={() => navigate(`/search?from=${origin}&to=${destination}`)}
                className="w-full bg-gradient-to-r from-cyan-500 via-[#1788FF] to-[#4E55F5] rounded-xl text-white px-6 py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(23,136,255,0.4)] transition-all cursor-pointer whitespace-nowrap"
              >
                <Search size={16} /> Search Flights
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-5 shadow-lg">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Current Lowest Fare</span>
            <div className="text-2xl font-black text-white">₹{currentPrice.toLocaleString('en-IN')}</div>
            <div className="mt-2 text-xs flex items-center gap-1">
              <span className={`font-semibold flex items-center ${isDrop ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isDrop ? <TrendingDown size={14} className="mr-0.5" /> : <TrendingUp size={14} className="mr-0.5" />}
                {priceChangePercent}%
              </span>
              <span className="text-slate-400">vs start of period</span>
            </div>
          </div>

          <div className="bg-[rgba(10,24,56,0.6)] border border-emerald-500/20 rounded-[20px] p-5 shadow-lg">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Recorded Lowest</span>
            <div className="text-2xl font-black text-emerald-400">₹{minPrice.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-slate-400 mt-2 block">Optimal booking target</span>
          </div>

          <div className="bg-[rgba(10,24,56,0.6)] border border-rose-500/20 rounded-[20px] p-5 shadow-lg">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Peak Recorded Fare</span>
            <div className="text-2xl font-black text-rose-400">₹{maxPrice.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-slate-400 mt-2 block">Holiday peak surge</span>
          </div>

          <div className="bg-[rgba(10,24,56,0.6)] border border-purple-500/20 rounded-[20px] p-5 shadow-lg">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Period Average Fare</span>
            <div className="text-2xl font-black text-purple-400">₹{avgPrice.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-slate-400 mt-2 block">Benchmark baseline</span>
          </div>
        </div>

        {/* Primary Trend Chart */}
        <div className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-blue-500/20 rounded-[24px] p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {originAirport.city} ({origin}) ➔ {destAirport.city} ({destination})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily aggregated lowest nonstop fares over {period.toUpperCase()}
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-medium">
              Volatility: Moderate (14.2%)
            </span>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="fareGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1788FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1788FF" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickMargin={10} />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v}`} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#07132e', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Fare']}
                />
                <ReferenceLine y={avgPrice} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: `Avg ₹${avgPrice}`, fill: '#F59E0B', fontSize: 11 }} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#1788FF" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#fareGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategic Timing Recommendation */}
        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Zap size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Optimal Booking Advisory</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Historical patterns show lowest fares for this route are released 14 to 21 days prior to departure.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/airfare-index`)}
            className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-cyan-400 border border-white/[0.12] hover:border-cyan-400/40 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            Analyze National Airfare Index →
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
