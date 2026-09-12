import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, ReferenceLine 
} from 'recharts';
import { ArrowLeftRight } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';

export function PriceTrends() {
  usePageTitle('Price Trends & Market Movement');
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [activeTab, setActiveTab] = useState<'route' | 'weekday' | 'horizon' | 'seasonal'>('route');

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Route trend with anomaly marker
  const routeTrendData = [
    { date: 'Aug 15', fare: 4850, nationalIndex: 121.2, isAnomaly: false },
    { date: 'Aug 22', fare: 5120, nationalIndex: 122.4, isAnomaly: false },
    { date: 'Aug 29', fare: 4950, nationalIndex: 122.8, isAnomaly: false },
    { date: 'Sep 05', fare: 5240, nationalIndex: 123.5, isAnomaly: false },
    { date: 'Sep 08', fare: 9850, nationalIndex: 124.8, isAnomaly: true, anomalyLabel: 'Holiday Spike (+58%)' },
    { date: 'Sep 12', fare: 5420, nationalIndex: 124.8, isAnomaly: false },
  ];

  // Weekday vs Weekend fare comparison
  const weekdayData = [
    { day: 'Monday (Peak Biz)', avgFare: 5850, premium: '+8.3%' },
    { day: 'Tuesday', avgFare: 5120, premium: '-5.2%' },
    { day: 'Wednesday (Trough)', avgFare: 4890, premium: '-9.4%' },
    { day: 'Thursday', avgFare: 5250, premium: '-2.8%' },
    { day: 'Friday (Weekend Rush)', avgFare: 6450, premium: '+19.4%' },
    { day: 'Saturday', avgFare: 5980, premium: '+10.7%' },
    { day: 'Sunday (Return Peak)', avgFare: 6750, premium: '+25.0%' },
  ];

  // Booking Horizon curve
  const horizonData = [
    { horizon: '0–2 Days (Spot)', fare: 8950, markup: '+65%' },
    { horizon: '3–7 Days', fare: 6850, markup: '+26%' },
    { horizon: '8–14 Days (Standard)', fare: 5420, markup: 'Baseline' },
    { horizon: '15–30 Days', fare: 4650, markup: '-14%' },
    { horizon: '30+ Days (Advance)', fare: 4120, markup: '-24%' },
  ];

  // Seasonal quarterly trend
  const seasonalData = [
    { quarter: 'Q1 (Jan–Mar: Post-Festive Trough)', seasonalIndex: 112.4 },
    { quarter: 'Q2 (Apr–Jun: Summer Vacations)', seasonalIndex: 126.8 },
    { quarter: 'Q3 (Jul–Sep: Monsoon Off-Peak)', seasonalIndex: 116.2 },
    { quarter: 'Q4 (Oct–Dec: Festive & New Year Peak)', seasonalIndex: 138.5 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Price Dynamics
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Econometric Decomposition
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Price Trends & Market Movement
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Decomposing airfare fluctuations across booking horizons, day-of-week demand patterns, seasonal cycles, and anomaly events.
              </p>
            </div>

            {/* Analysis Views Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {[
                { id: 'route', label: 'Route Trend & Anomalies' },
                { id: 'weekday', label: 'Weekday / Weekend' },
                { id: 'horizon', label: 'Booking Horizon' },
                { id: 'seasonal', label: 'Seasonal Cycle' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                    activeTab === t.id 
                      ? 'bg-[#0F2A4A] text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Route Selector Bar */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-bold uppercase text-[11px]">Select Corridor:</span>
            <div className="flex items-center gap-2">
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="h-8 px-2.5 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold"
              >
                <option value="DEL">DEL (Delhi)</option>
                <option value="BOM">BOM (Mumbai)</option>
                <option value="BLR">BLR (Bengaluru)</option>
                <option value="MAA">MAA (Chennai)</option>
                <option value="CCU">CCU (Kolkata)</option>
                <option value="GOI">GOI (Goa)</option>
              </select>
              
              <button 
                onClick={handleSwap}
                className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <ArrowLeftRight size={13} />
              </button>

              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-8 px-2.5 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold"
              >
                <option value="BOM">BOM (Mumbai)</option>
                <option value="DEL">DEL (Delhi)</option>
                <option value="BLR">BLR (Bengaluru)</option>
                <option value="MAA">MAA (Chennai)</option>
                <option value="CCU">CCU (Kolkata)</option>
                <option value="GOI">GOI (Goa)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span>Corridor Base: ₹4,800</span>
            <span>•</span>
            <span className="font-bold text-blue-600">Current Observed: ₹5,420</span>
          </div>
        </div>

        {/* Dynamic View Panels */}
        {activeTab === 'route' && (
          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
                  Observed Fare History with Anomaly Markers — {origin} ⇄ {destination}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Includes regulatory trigger flag on Sep 08 (Festival surge breach)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                1 Anomaly Event Flagged
              </span>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={routeTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} vertical={false} />
                  <XAxis dataKey="date" stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip />
                  <ReferenceLine y={8500} stroke="#DC2626" strokeDasharray="3 3" label={{ value: 'DGCA Surge Threshold (₹8,500)', fill: '#DC2626', fontSize: 10 }} />
                  <Area type="monotone" dataKey="fare" name="Observed Fare (₹)" stroke="#2563EB" strokeWidth={2.5} fill="#2563EB" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'weekday' && (
          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
                Day-of-the-Week Price Variation & Weekend Premium
              </h3>
              <span className="text-[11px] text-slate-400">
                Friday and Sunday experience significant leisure and returning business premiums (+25%)
              </span>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} vertical={false} />
                  <XAxis dataKey="day" stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="avgFare" name="Average Fare (₹)" fill="#0F2A4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'horizon' && (
          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
                Lead Time / Booking Horizon Yield Management Curve
              </h3>
              <span className="text-[11px] text-slate-400">
                Airlines enforce steep dynamic markup in the 0–2 day window (+65% over baseline)
              </span>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horizonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} vertical={false} />
                  <XAxis dataKey="horizon" stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="fare" name="Expected Fare (₹)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'seasonal' && (
          <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wider">
                Quarterly Seasonal Index Movement (India Domestic)
              </h3>
              <span className="text-[11px] text-slate-400">
                Q4 (Diwali, Chhath, Winter holidays) marks national peak inflation (138.5)
              </span>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} vertical={false} />
                  <XAxis dataKey="quarter" stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                  <YAxis domain={[90, 150]} stroke={isLight ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="seasonalIndex" name="Quarterly Sub-Index" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
