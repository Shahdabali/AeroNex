import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  Bookmark, Search, Trash2, Plane, Clock, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export function MyFlights() {
  usePageTitle('My Saved Flights');
  const navigate = useNavigate(); 
  
  const [savedFlights, setSavedFlights] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('aeronex_saved_flights');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleRemoveFlight = (id: string) => {
    const updated = savedFlights.filter(f => f.id !== id);
    setSavedFlights(updated);
    try {
      localStorage.setItem('aeronex_saved_flights', JSON.stringify(updated));
    } catch {}
  };

  const handleAddSampleFlight = (sample: any) => {
    const updated = [sample, ...savedFlights];
    setSavedFlights(updated);
    try {
      localStorage.setItem('aeronex_saved_flights', JSON.stringify(updated));
    } catch {}
  };

  const sampleFlights = [
    {
      id: 'sample-1',
      airline: 'IndiGo',
      airlineCode: '6E',
      flightNumber: '6E-204',
      from: 'DEL',
      to: 'BOM',
      originCity: 'New Delhi',
      destCity: 'Mumbai',
      departureTime: '06:00',
      arrivalTime: '08:15',
      duration: '2h 15m',
      stops: 'Non-stop',
      aircraft: 'Airbus A320neo',
      price: 4850,
      targetFare: 4400,
      currentFare: 4850,
      status: 'Tracking Live',
      savedAt: new Date().toISOString()
    },
    {
      id: 'sample-2',
      airline: 'Vistara',
      airlineCode: 'UK',
      flightNumber: 'UK-992',
      from: 'BOM',
      to: 'BLR',
      originCity: 'Mumbai',
      destCity: 'Bengaluru',
      departureTime: '09:15',
      arrivalTime: '11:35',
      duration: '2h 20m',
      stops: 'Non-stop',
      aircraft: 'Airbus A321neo',
      price: 4280,
      targetFare: 3900,
      currentFare: 4280,
      status: 'Price Dropped (-₹340)',
      savedAt: new Date().toISOString()
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              My Saved & Tracked Flights
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {savedFlights.length} Active Tracks
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time radar tracking and automated fare monitoring for your saved domestic flights.
            </p>
          </div>

          <button 
            onClick={() => navigate('/search')}
            className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-6 py-2.5 font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(23,136,255,0.4)] transition-all cursor-pointer self-start md:self-auto"
          >
            <Search size={16} /> Search More Flights
          </button>
        </div>

        {savedFlights.length > 0 ? (
          <div className="space-y-4">
            {savedFlights.map((flight) => {
              const isDrop = flight.status?.includes('Dropped');

              return (
                <div 
                  key={flight.id}
                  className="bg-[rgba(10,24,56,0.65)] hover:bg-[rgba(10,24,56,0.85)] border border-blue-500/20 hover:border-blue-500/40 rounded-[20px] p-6 transition-all shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  {/* Airline & Status */}
                  <div className="flex items-center gap-4 w-full md:w-1/4">
                    <div className="w-12 h-12 rounded-2xl bg-[#081533] border border-slate-700 flex items-center justify-center font-bold text-sm font-mono text-cyan-400">
                      {flight.airlineCode || 'FL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{flight.airline}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isDrop 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {flight.status || 'Active Monitoring'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono block">
                        {flight.flightNumber} • {flight.aircraft || 'Commercial Jet'}
                      </span>
                    </div>
                  </div>

                  {/* Flight Corridor & Timing */}
                  <div className="flex items-center justify-center gap-6 w-full md:w-2/5">
                    <div className="text-right">
                      <span className="text-xl font-bold text-white block">{flight.departureTime}</span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold">{flight.from}</span>
                      <span className="text-[10px] text-slate-400 block">{flight.originCity || flight.from}</span>
                    </div>

                    <div className="flex flex-col items-center flex-1 max-w-[130px]">
                      <span className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                        <Clock size={11} /> {flight.duration || '2h 15m'}
                      </span>
                      <div className="w-full flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#1788FF]" />
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#1788FF] to-purple-500" />
                        <Plane size={14} className="text-purple-400 rotate-90 mx-0.5" />
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-500 to-[#1788FF]" />
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium mt-1">
                        {flight.stops || 'Non-stop'}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-xl font-bold text-white block">{flight.arrivalTime}</span>
                      <span className="text-xs font-mono text-purple-400 font-semibold">{flight.to}</span>
                      <span className="text-[10px] text-slate-400 block">{flight.destCity || flight.to}</span>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-1/3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <div className="text-2xl font-black text-white">
                        ₹{(flight.price || flight.currentFare || 4850).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Target: <strong className="text-cyan-400">₹{(flight.targetFare || 4200).toLocaleString('en-IN')}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/search?from=${flight.from}&to=${flight.to}`)}
                        title="Search updated schedules for this route"
                        className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-[#1788FF] transition-colors cursor-pointer"
                      >
                        <ExternalLink size={18} />
                      </button>

                      <button
                        onClick={() => handleRemoveFlight(flight.id)}
                        title="Remove from saved flights"
                        className="p-2.5 rounded-xl bg-[#0A1838] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer border border-slate-700/60"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="w-20 h-20 bg-[#0A1838] rounded-3xl border border-slate-700 flex items-center justify-center text-cyan-400 mb-6 shadow-inner">
              <Bookmark size={36} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Saved Flights Yet</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
              Search flights and click the bookmark button on any flight card to track fare movements in real-time.
            </p>

            {/* 1-Click Sample Trackers */}
            <div className="w-full max-w-md bg-[#07132e] border border-slate-800 rounded-2xl p-4 mb-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Quick Track Popular Flights
              </span>
              <div className="space-y-2">
                {sampleFlights.map((sample) => (
                  <div 
                    key={sample.id}
                    onClick={() => handleAddSampleFlight(sample)}
                    className="p-3 rounded-xl bg-[#0A1838] hover:bg-blue-500/20 border border-slate-700/60 hover:border-blue-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Plane size={16} className="text-[#1788FF] group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {sample.airline} ({sample.flightNumber}): {sample.from} ➔ {sample.to}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {sample.departureTime} • {sample.duration}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cyan-400">+ Track ₹{sample.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-8 py-3 font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(23,136,255,0.4)] transition-all cursor-pointer"
            >
              <Search size={18} />
              Open Flight Search
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
