import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { 
  Activity, Percent, TrendingUp, Fuel, 
  ShieldCheck, BarChart2, Calculator, Info, Compass 
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  CPI_DATA_SERIES, COST_BASKET_BREAKDOWN, REGIONAL_CPI_DIVERGENCE 
} from '../data/indianAviation';

export function CPIAnalytics() {
  usePageTitle('CPI Analytics');
  const [period, setPeriod] = useState<'6M' | 'YTD' | '1Y' | '3Y' | '5Y'>('1Y');
  
  // Active comparison series toggles
  const [visibleSeries, setVisibleSeries] = useState({
    airfare: true,
    cpi: true,
    transportCpi: true,
    atfIndex: true,
  });

  // Interactive Travel Budget Simulator state
  const [annualSpend, setAnnualSpend] = useState<number>(75000);
  const [passengersCount, setPassengersCount] = useState<number>(2);

  const currentData = CPI_DATA_SERIES[period] || CPI_DATA_SERIES['1Y'];
  const latest = currentData[currentData.length - 1];
  const earliest = currentData[0];

  // Calculate cumulative inflation deltas
  const airfareDelta = (((latest.airfare - earliest.airfare) / earliest.airfare) * 100).toFixed(1);
  const cpiDelta = (((latest.cpi - earliest.cpi) / earliest.cpi) * 100).toFixed(1);
  const spreadDelta = (latest.airfare - latest.cpi).toFixed(1);

  // Budget calculations
  const airfareInflationRate = 0.185; // 18.5%
  const generalInflationRate = 0.054; // 5.4%
  const excessCost = Math.round(annualSpend * (airfareInflationRate - generalInflationRate));
  const potentialSavings = Math.round(annualSpend * 0.142); // 14.2% AI savings

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/30 flex items-center gap-1.5">
                <Activity size={12} /> Macroeconomic Intelligence
              </span>
              <span className="text-xs text-slate-400">MoSPI & DGCA Official Reference Matrix</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              AeroNex Airfare Index vs Consumer Price Index (CPI)
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Track aviation-specific fare inflation against retail headline CPI, transportation sub-indices, and Aviation Turbine Fuel (ATF) pricing.
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-[#0A1838] border border-slate-700/80 rounded-2xl p-1 shadow-lg">
            {(['6M', 'YTD', '1Y', '3Y', '5Y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  period === p
                    ? 'bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white shadow-[0_0_15px_rgba(23,136,255,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Macroeconomic KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Airfare Index */}
          <div className="bg-[rgba(10,24,56,0.65)] border border-blue-500/20 rounded-[20px] p-6 shadow-xl relative overflow-hidden group hover:border-[#1788FF] transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Domestic Airfare Index</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF]">
                <Activity size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-2">{latest.airfare.toFixed(1)}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-rose-400 font-semibold flex items-center">
                <TrendingUp size={14} className="mr-0.5" /> +{airfareDelta}%
              </span>
              <span className="text-slate-400">vs {earliest.month}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>MoM Momentum:</span>
              <span className="font-semibold text-white">{latest.momAirfareChange > 0 ? `+${latest.momAirfareChange}%` : `${latest.momAirfareChange}%`}</span>
            </div>
          </div>

          {/* Card 2: Headline CPI */}
          <div className="bg-[rgba(10,24,56,0.65)] border border-emerald-500/20 rounded-[20px] p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Headline Retail CPI</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Percent size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-2">{latest.cpi.toFixed(1)}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center">
                <TrendingUp size={14} className="mr-0.5" /> +{cpiDelta}%
              </span>
              <span className="text-slate-400">Combined Basket</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Transport Weight:</span>
              <span className="font-semibold text-emerald-300">8.6% of CPI</span>
            </div>
          </div>

          {/* Card 3: Spread / Elasticity */}
          <div className="bg-[rgba(10,24,56,0.65)] border border-amber-500/20 rounded-[20px] p-6 shadow-xl relative overflow-hidden group hover:border-amber-500 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Airfare vs CPI Spread</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-2">+{spreadDelta} pts</div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <span>Airfare outpaces CPI by 3.8x</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Elasticity Rating:</span>
              <span className="font-semibold text-amber-300">High Discretionary</span>
            </div>
          </div>

          {/* Card 4: ATF Jet Fuel Index */}
          <div className="bg-[rgba(10,24,56,0.65)] border border-rose-500/20 rounded-[20px] p-6 shadow-xl relative overflow-hidden group hover:border-rose-500 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ATF Jet Fuel Index</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Fuel size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-2">{latest.atfIndex.toFixed(1)}</div>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-medium">
              <span>0.88 Cost Correlation</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Airline Cost Share:</span>
              <span className="font-semibold text-rose-300">~40% of Total</span>
            </div>
          </div>
        </div>

        {/* Primary Interactive Chart */}
        <div className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-blue-500/20 rounded-[24px] p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Comparative Historical Trajectory
                <span className="text-xs font-normal text-slate-400">({period} timeframe)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Observe the structural divergence between air travel and consumer goods inflation.
              </p>
            </div>

            {/* Series Visibility Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setVisibleSeries({ ...visibleSeries, airfare: !visibleSeries.airfare })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visibleSeries.airfare
                    ? 'bg-[#1788FF]/20 text-[#1788FF] border border-[#1788FF]/40'
                    : 'bg-[#0A1838] text-slate-500 border border-slate-800'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#1788FF]" />
                Airfare Index
              </button>

              <button
                onClick={() => setVisibleSeries({ ...visibleSeries, cpi: !visibleSeries.cpi })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visibleSeries.cpi
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#0A1838] text-slate-500 border border-slate-800'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                General CPI
              </button>

              <button
                onClick={() => setVisibleSeries({ ...visibleSeries, transportCpi: !visibleSeries.transportCpi })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visibleSeries.transportCpi
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-[#0A1838] text-slate-500 border border-slate-800'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Transport CPI
              </button>

              <button
                onClick={() => setVisibleSeries({ ...visibleSeries, atfIndex: !visibleSeries.atfIndex })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visibleSeries.atfIndex
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-[#0A1838] text-slate-500 border border-slate-800'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                ATF Jet Fuel
              </button>
            </div>
          </div>

          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickMargin={10} />
                <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#07132e]/95 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4 shadow-2xl text-xs min-w-[200px]">
                          <div className="font-bold text-white mb-2 pb-1.5 border-b border-slate-700/60 flex items-center justify-between">
                            <span>{label}</span>
                            <span className="text-[10px] text-cyan-400 font-mono">Index Points</span>
                          </div>
                          <div className="space-y-1.5">
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-slate-300">{entry.name}:</span>
                                </div>
                                <span className="font-bold text-white font-mono">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {visibleSeries.airfare && (
                  <Line 
                    type="monotone" 
                    dataKey="airfare" 
                    name="Airfare Index" 
                    stroke="#1788FF" 
                    strokeWidth={3.5} 
                    dot={{ r: 4, fill: '#07132e', stroke: '#1788FF', strokeWidth: 2 }} 
                    activeDot={{ r: 7, fill: '#1788FF' }} 
                  />
                )}
                {visibleSeries.cpi && (
                  <Line 
                    type="monotone" 
                    dataKey="cpi" 
                    name="General CPI" 
                    stroke="#10B981" 
                    strokeWidth={2.5} 
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#10B981' }} 
                  />
                )}
                {visibleSeries.transportCpi && (
                  <Line 
                    type="monotone" 
                    dataKey="transportCpi" 
                    name="Transport CPI" 
                    stroke="#F59E0B" 
                    strokeWidth={2.5} 
                    dot={{ r: 3, fill: '#F59E0B' }} 
                  />
                )}
                {visibleSeries.atfIndex && (
                  <Line 
                    type="monotone" 
                    dataKey="atfIndex" 
                    name="ATF Jet Fuel" 
                    stroke="#EC4899" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#EC4899' }} 
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Grid: Cost Basket & MoM Seasonality */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cost Basket Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-blue-500/20 rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Fuel size={18} className="text-[#1788FF]" /> Airline Cost Basket
                </h3>
                <span className="text-xs text-slate-400">DGCA Fleet Standards</span>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Breakdown of carrier operating expenditure components determining structural airfare pricing.
              </p>

              <div className="space-y-4">
                {COST_BASKET_BREAKDOWN.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.component}</span>
                      <span className="font-mono font-bold text-white">{item.weight}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#081533] rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${item.weight}%`, backgroundColor: item.color }} 
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>CPI Correlation: <strong className="text-slate-300">{item.cpiCorrelation}</strong></span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">{item.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2.5">
              <Info size={16} className="text-[#1788FF] shrink-0 mt-0.5" />
              <span>
                <strong>Macro Note:</strong> Aviation Turbine Fuel (ATF) represents 40% of airline unit operating costs (CASK), making airfares 4x more sensitive to global crude oil swings than the general CPI grocery basket.
              </span>
            </div>
          </div>

          {/* MoM Inflation Seasonality (7 cols) */}
          <div className="lg:col-span-7 bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-blue-500/20 rounded-[24px] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart2 size={18} className="text-emerald-400" /> MoM Seasonality Heatmap
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Month-over-month airfare index velocity highlighting peak summer and festive demand surges.
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#07132e', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val: any) => [`${val}%`, 'MoM Change']}
                  />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Bar 
                    dataKey="momAirfareChange" 
                    name="MoM Change" 
                    radius={[6, 6, 0, 0]}
                    fill="#1788FF"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-[#081533] border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Q1 (Jan-Mar)</span>
                <span className="text-xs font-semibold text-emerald-400">Post-Holiday Lows</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Best booking window</span>
              </div>
              <div className="p-3 rounded-xl bg-[#081533] border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Q2 (Apr-Jun)</span>
                <span className="text-xs font-semibold text-rose-400">+5.9% Summer Surge</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Vacation peak demand</span>
              </div>
              <div className="p-3 rounded-xl bg-[#081533] border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Q4 (Oct-Dec)</span>
                <span className="text-xs font-semibold text-amber-400">+5.5% Festival Spike</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Diwali & Year-end rush</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Inflation Travel Impact Simulator */}
        <div className="bg-gradient-to-br from-[#0B1E4A] via-[#07132e] to-[#0D245A] border border-blue-500/30 rounded-[24px] p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#1788FF] to-[#4E55F5] text-white shadow-lg shadow-blue-500/25">
              <Calculator size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Interactive Inflation Travel Budget Simulator</h3>
              <p className="text-xs text-slate-300">
                Calculate the real purchasing power drag on your travel budget compared to standard retail inflation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-white">Annual Flight Budget</label>
                  <span className="text-base font-bold font-mono text-cyan-400">
                    ₹{annualSpend.toLocaleString('en-IN')}
                  </span>
                </div>
                <input 
                  type="range"
                  min="20000"
                  max="500000"
                  step="5000"
                  value={annualSpend}
                  onChange={(e) => setAnnualSpend(Number(e.target.value))}
                  className="w-full accent-[#1788FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹20,000 (Leisure)</span>
                  <span>₹2,50,000 (Frequent)</span>
                  <span>₹5,00,000 (Corporate)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-white">Frequent Travelers in Household/Team</label>
                  <span className="text-sm font-bold text-cyan-400">{passengersCount} Travelers</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 4, 8, 12].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPassengersCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        passengersCount === num
                          ? 'bg-[#1788FF] text-white'
                          : 'bg-[#0A1838] border border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Output Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#050E24]/80 border border-rose-500/30">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Airfare Inflation Drag</span>
                <div className="text-2xl font-black text-rose-400 mb-1">
                  +₹{excessCost.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-slate-400">
                  Excess expenditure compared to standard CPI inflation over the same period.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#050E24]/80 border border-emerald-500/30">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">AeroNex AI Potential Savings</span>
                <div className="text-2xl font-black text-emerald-400 mb-1">
                  ₹{potentialSavings.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-slate-400">
                  Estimated recovery using 21-day advance purchase windows and off-peak sectors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Regional CPI vs Regional Airfare Divergence Table */}
        <div className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-blue-500/20 rounded-[24px] overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass size={18} className="text-[#1788FF]" /> Regional Airfare vs Regional CPI Divergence
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Cross-sector comparison of domestic aviation corridors against regional state-level inflation.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#081533] text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Sector / Region</th>
                  <th className="p-4">Airfare Inflation</th>
                  <th className="p-4">Regional CPI</th>
                  <th className="p-4">Elasticity</th>
                  <th className="p-4">Trunk Corridors</th>
                  <th className="p-4 pr-6">Primary Macro Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {REGIONAL_CPI_DIVERGENCE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-500/5 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-white">{row.region}</td>
                    <td className="p-4 font-bold text-rose-400">{row.airfareGrowth}</td>
                    <td className="p-4 font-medium text-emerald-400">{row.regionalCpi}</td>
                    <td className="p-4 font-mono font-semibold text-amber-400">{row.elasticity}</td>
                    <td className="p-4 font-mono text-xs text-cyan-400">{row.topRoutes}</td>
                    <td className="p-4 pr-6 text-xs text-slate-400">{row.driver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DGCA / RBI Macro Policy Brief */}
        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#1788FF]" /> Strategic Regulatory Context (DGCA & MoCA)
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            In the post-deregulation Indian aviation sector, airfares adhere to dynamic revenue management algorithms governed by seat inventory buckets. During high-density quarters, Passenger Load Factors (PLF) exceed 89%, causing bucket tier progression to accelerate dramatically ahead of baseline CPI. AeroNex AI models this elasticity to provide verified advance advisory for consumer and enterprise travelers.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
