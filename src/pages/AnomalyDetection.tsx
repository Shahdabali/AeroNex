import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { Search, Info } from 'lucide-react';

export function AnomalyDetection() {
  usePageTitle('Airfare Anomaly Monitor');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'elevated'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const anomaliesList = [
    {
      id: 'ANM-2026-084',
      route: 'Delhi → Mumbai (DEL–BOM)',
      corridorCode: 'DEL-BOM',
      normalRange: '₹3,800 – ₹6,200',
      observedFare: 9850,
      deviation: '+58.4%',
      zScore: 3.2,
      airline: 'IndiGo (6E)',
      flightNumber: '6E-2051',
      bookingHorizon: '0–2 Days (Last Minute)',
      timestamp: 'Today, 14:20 IST',
      status: 'critical',
      severityLabel: 'HIGH ANOMALY',
      provisionalCause: 'Potential demand/capacity/booking-horizon driven movement. High festival rush and emergency capacity reallocation.',
      validationStatus: 'Requires Regulatory Validation'
    },
    {
      id: 'ANM-2026-085',
      route: 'Delhi → Goa (DEL–GOI)',
      corridorCode: 'DEL-GOI',
      normalRange: '₹4,500 – ₹7,200',
      observedFare: 14800,
      deviation: '+96.0%',
      zScore: 4.1,
      airline: 'SpiceJet (SG)',
      flightNumber: 'SG-8192',
      bookingHorizon: '1 Day (Weekend Surge)',
      timestamp: 'Today, 13:45 IST',
      status: 'critical',
      severityLabel: 'CRITICAL SPIKE',
      provisionalCause: 'Potential seasonal weekend leisure spike. Low seat availability reported across non-stop carriers.',
      validationStatus: 'Flagged for Tariff Oversight'
    },
    {
      id: 'ANM-2026-086',
      route: 'Bengaluru → Mumbai (BLR–BOM)',
      corridorCode: 'BLR-BOM',
      normalRange: '₹3,400 – ₹5,100',
      observedFare: 6850,
      deviation: '+34.3%',
      zScore: 2.6,
      airline: 'Air India (AI)',
      flightNumber: 'AI-639',
      bookingHorizon: '3 Days',
      timestamp: 'Today, 12:10 IST',
      status: 'elevated',
      severityLabel: 'ELEVATED SURGE',
      provisionalCause: 'Potential business weekday travel concentration. Morning peak departure slot dynamic pricing.',
      validationStatus: 'Under Surveillance'
    },
    {
      id: 'ANM-2026-087',
      route: 'Kolkata → Delhi (CCU–DEL)',
      corridorCode: 'CCU-DEL',
      normalRange: '₹4,200 – ₹6,400',
      observedFare: 3150,
      deviation: '-25.0%',
      zScore: -2.3,
      airline: 'Akasa Air (QP)',
      flightNumber: 'QP-1402',
      bookingHorizon: '14 Days (Advance Booking)',
      timestamp: 'Today, 10:30 IST',
      status: 'elevated',
      severityLabel: 'NEGATIVE OUTLIER (DROP)',
      provisionalCause: 'Potential promotional promotional discount or excess unbooked seat inventory dump.',
      validationStatus: 'Verified Low-Fare Outlier'
    }
  ];

  const filtered = anomaliesList.filter(a => {
    if (filterSeverity === 'critical' && a.status !== 'critical') return false;
    if (filterSeverity === 'elevated' && a.status !== 'elevated') return false;
    if (searchTerm && !a.route.toLowerCase().includes(searchTerm.toLowerCase()) && !a.airline.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[10px] uppercase tracking-wider">
                  Tariff Oversight
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  DGCA Rule 135 Monitoring
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Airfare Anomaly Monitor
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Surveillance of statistically unusual airfare deviations from 30-day rolling medians ($Z \ge 2.5$). Provisional causes require validation before policy action.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold">
                {anomaliesList.filter(a => a.status === 'critical').length} Critical Spikes Active
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search corridor or airline..."
                className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {(['all', 'critical', 'elevated'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize transition-colors ${
                    filterSeverity === sev ? 'bg-[#0F2A4A] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Rule 135: Mandatory tariff display & predatory fare prevention compliance
          </div>
        </div>

        {/* Anomaly Register Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((anomaly) => (
            <div 
              key={anomaly.id} 
              className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400">{anomaly.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        anomaly.status === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {anomaly.severityLabel}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {anomaly.route}
                    </h2>
                    <span className="text-xs text-slate-500">{anomaly.airline} • Flight {anomaly.flightNumber}</span>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-mono font-extrabold text-rose-600 dark:text-rose-400">
                      ₹{anomaly.observedFare.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs font-bold text-rose-700">
                      {anomaly.deviation} Deviation
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800 font-mono text-xs mb-3">
                  <div>
                    <span className="text-[9.5px] font-sans text-slate-400 uppercase block">Normal Band</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{anomaly.normalRange}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-sans text-slate-400 uppercase block">Statistical Z-Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">{anomaly.zScore}σ</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-sans text-slate-400 uppercase block">Booking Horizon</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">{anomaly.bookingHorizon}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 text-xs text-amber-900 dark:text-amber-300 leading-relaxed mb-2">
                  <div className="font-bold mb-0.5 flex items-center gap-1.5">
                    <Info size={13} /> Provisional Contributing Signal:
                  </div>
                  <p className="text-[11.5px] text-amber-800 dark:text-amber-200/90">
                    {anomaly.provisionalCause}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">Observed {anomaly.timestamp}</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                  {anomaly.validationStatus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Methodology Note */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <p>
            <strong>Analytical Caution:</strong> Fares marked as anomalies are identified through mathematical rolling standard deviation bounds and do not represent verified anti-competitive conduct without confirmation of carrier load factor and ATC slot constraints.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
