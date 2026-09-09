import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Calendar, Users, Briefcase, ArrowLeftRight, Plane, 
  Check, Bookmark, Clock, ChevronDown 
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../services/api';
import { INDIAN_AIRPORTS, type IndianAirport, type FlightItem } from '../data/indianAviation';

export function FlightSearch() {
  usePageTitle('Flight Search');
  const [searchParams] = useSearchParams();

  const initialFrom = searchParams.get('from') || 'DEL';
  const initialTo = searchParams.get('to') || 'BOM';

  const [fromCode, setFromCode] = useState(initialFrom);
  const [toCode, setToCode] = useState(initialTo);
  const [departDate, setDepartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  
  // Dropdown UI states
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearchFilter, setFromSearchFilter] = useState('');
  const [toSearchFilter, setToSearchFilter] = useState('');
  
  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'departure'>('cheapest');
  const [filterStops, setFilterStops] = useState<'all' | 'nonstop'>('all');
  const [filterMaxPrice, setFilterMaxPrice] = useState<number>(15000);
  const [filterAirline, setFilterAirline] = useState<string>('all');

  // Tracking notifications
  const [savedFlightIds, setSavedFlightIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('aeronex_saved_flights');
      return stored ? JSON.parse(stored).map((f: any) => f.id) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize URL parameters if present
  useEffect(() => {
    const paramFrom = searchParams.get('from');
    const paramTo = searchParams.get('to');
    if (paramFrom) setFromCode(paramFrom.toUpperCase());
    if (paramTo) setToCode(paramTo.toUpperCase());
  }, [searchParams]);

  const { data: flights = [], isLoading, refetch } = useQuery<FlightItem[]>({
    queryKey: ['flights', fromCode, toCode, departDate, cabinClass],
    queryFn: () => api.searchFlights(fromCode, toCode, departDate, cabinClass),
    enabled: Boolean(fromCode && toCode),
  });

  const getAirportInfo = (code: string) => {
    return INDIAN_AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase()) || {
      code,
      city: code,
      name: `${code} Airport`,
      region: 'India',
      tag: 'Domestic'
    };
  };

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSelectFrom = (airport: IndianAirport) => {
    setFromCode(airport.code);
    setShowFromDropdown(false);
    setFromSearchFilter('');
    // If To is the same as new From, change To
    if (airport.code === toCode) {
      setToCode(airport.code === 'DEL' ? 'BOM' : 'DEL');
    }
    // Automatically prompt arrival dropdown
    setTimeout(() => setShowToDropdown(true), 150);
  };

  const handleSelectTo = (airport: IndianAirport) => {
    setToCode(airport.code);
    setShowToDropdown(false);
    setToSearchFilter('');
  };

  const handleSaveFlight = (flight: FlightItem) => {
    try {
      const existing = localStorage.getItem('aeronex_saved_flights');
      let list = existing ? JSON.parse(existing) : [];
      if (savedFlightIds.includes(flight.id)) {
        list = list.filter((f: any) => f.id !== flight.id);
        setSavedFlightIds(savedFlightIds.filter(id => id !== flight.id));
        setToastMessage(`Flight ${flight.flightNumber} removed from saved flights.`);
      } else {
        const enriched = {
          ...flight,
          savedAt: new Date().toISOString(),
          originCity: getAirportInfo(flight.from).city,
          destCity: getAirportInfo(flight.to).city,
          targetFare: Math.round(flight.price * 0.9),
          currentFare: flight.price,
          status: 'Tracking Live'
        };
        list.push(enriched);
        setSavedFlightIds([...savedFlightIds, flight.id]);
        setToastMessage(`Flight ${flight.flightNumber} saved! View in My Flights.`);
      }
      localStorage.setItem('aeronex_saved_flights', JSON.stringify(list));
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage('Could not update saved flights.');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // Filtered dropdown airport lists
  const filteredFromAirports = INDIAN_AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(fromSearchFilter.toLowerCase()) ||
    a.code.toLowerCase().includes(fromSearchFilter.toLowerCase()) ||
    a.name.toLowerCase().includes(fromSearchFilter.toLowerCase())
  );

  const filteredToAirports = INDIAN_AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(toSearchFilter.toLowerCase()) ||
    a.code.toLowerCase().includes(toSearchFilter.toLowerCase()) ||
    a.name.toLowerCase().includes(toSearchFilter.toLowerCase())
  );

  // Filtered & Sorted Flights
  const processedFlights = (flights || [])
    .filter(f => {
      if (filterStops === 'nonstop' && f.stops !== 'Non-stop') return false;
      if (f.price > filterMaxPrice) return false;
      if (filterAirline !== 'all' && f.airlineCode !== filterAirline) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'cheapest') return a.price - b.price;
      if (sortBy === 'fastest') return a.duration.localeCompare(b.duration);
      if (sortBy === 'departure') return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });

  const fromInfo = getAirportInfo(fromCode);
  const toInfo = getAirportInfo(toCode);

  const popularRoutes = [
    { from: 'DEL', to: 'BOM', label: 'DEL ⇄ BOM' },
    { from: 'BOM', to: 'BLR', label: 'BOM ⇄ BLR' },
    { from: 'DEL', to: 'GOI', label: 'DEL ⇄ GOI' },
    { from: 'DEL', to: 'BLR', label: 'DEL ⇄ BLR' },
    { from: 'CCU', to: 'DEL', label: 'CCU ⇄ DEL' },
    { from: 'HYD', to: 'DEL', label: 'HYD ⇄ DEL' }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Toast alert */}
        {toastMessage && (
          <div className="fixed top-24 right-8 z-50 bg-[#0A1838] border border-blue-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Bookmark className="w-5 h-5 text-[#1788FF]" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5">
              Flight Search & Real-Time Fares
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                5s Live Pricing
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Search verified multi-carrier flights across 20+ major Indian hubs with automated fare tracking.
            </p>
          </div>

          {/* Quick Route Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trunk Routes:</span>
            {popularRoutes.map((r, i) => (
              <button
                key={i}
                onClick={() => {
                  setFromCode(r.from);
                  setToCode(r.to);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  fromCode === r.from && toCode === r.to
                    ? 'bg-[#1788FF] text-white shadow-md'
                    : 'bg-[#0A1838] text-slate-300 hover:text-white border border-slate-700/60 hover:border-blue-500/40'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Search Panel */}
        <div className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-blue-500/20 rounded-[24px] p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Departure City Selector */}
            <div className="lg:col-span-4 relative" ref={fromRef}>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                Departure (From)
              </label>
              <div 
                onClick={() => {
                  setShowFromDropdown(!showFromDropdown);
                  setShowToDropdown(false);
                }}
                className={`w-full bg-[#0A1838] border ${showFromDropdown ? 'border-[#1788FF] ring-2 ring-blue-500/20' : 'border-slate-700'} rounded-2xl px-4 py-3 cursor-pointer flex items-center justify-between transition-all hover:border-slate-600`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                    {fromInfo.code}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">{fromInfo.city}</span>
                    <span className="text-xs text-slate-400 block truncate">{fromInfo.name}</span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showFromDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* From Dropdown Popover */}
              {showFromDropdown && (
                <div className="absolute top-[82px] left-0 w-full md:w-[380px] bg-[#07132e]/98 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-3 max-h-[380px] flex flex-col animate-in fade-in slide-in-from-top-2">
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={fromSearchFilter}
                      onChange={(e) => setFromSearchFilter(e.target.value)}
                      placeholder="Type city or airport code (DEL, BOM...)"
                      className="w-full bg-[#0A1838] border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#1788FF]"
                    />
                  </div>
                  
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      Major Indian Airports ({filteredFromAirports.length})
                    </div>
                    {filteredFromAirports.map((airport) => (
                      <div
                        key={airport.code}
                        onClick={() => handleSelectFrom(airport)}
                        className={`p-2.5 rounded-xl hover:bg-blue-500/15 cursor-pointer transition-colors flex items-center justify-between ${
                          airport.code === fromCode ? 'bg-blue-500/20 border border-blue-500/40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {airport.code}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white block">{airport.city}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">{airport.name}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {airport.region}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-1 flex justify-center pt-5">
              <button
                type="button"
                onClick={handleSwapAirports}
                title="Swap departure & arrival"
                className="w-10 h-10 rounded-full bg-[#0A1838] border border-slate-700 hover:border-blue-500/50 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>

            {/* Arrival City Selector */}
            <div className="lg:col-span-4 relative" ref={toRef}>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                Arrival (To)
              </label>
              <div 
                onClick={() => {
                  setShowToDropdown(!showToDropdown);
                  setShowFromDropdown(false);
                }}
                className={`w-full bg-[#0A1838] border ${showToDropdown ? 'border-[#1788FF] ring-2 ring-blue-500/20' : 'border-slate-700'} rounded-2xl px-4 py-3 cursor-pointer flex items-center justify-between transition-all hover:border-slate-600`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-mono font-bold text-sm">
                    {toInfo.code}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">{toInfo.city}</span>
                    <span className="text-xs text-slate-400 block truncate">{toInfo.name}</span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showToDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* To Dropdown Popover */}
              {showToDropdown && (
                <div className="absolute top-[82px] left-0 w-full md:w-[380px] bg-[#07132e]/98 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-3 max-h-[380px] flex flex-col animate-in fade-in slide-in-from-top-2">
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={toSearchFilter}
                      onChange={(e) => setToSearchFilter(e.target.value)}
                      placeholder="Type destination city or code..."
                      className="w-full bg-[#0A1838] border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      Destinations ({filteredToAirports.length})
                    </div>
                    {filteredToAirports.map((airport) => (
                      <div
                        key={airport.code}
                        onClick={() => handleSelectTo(airport)}
                        className={`p-2.5 rounded-xl hover:bg-purple-500/15 cursor-pointer transition-colors flex items-center justify-between ${
                          airport.code === toCode ? 'bg-purple-500/20 border border-purple-500/40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                            {airport.code}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white block">{airport.city}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">{airport.name}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {airport.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Travel Date */}
            <div className="lg:col-span-3">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                Departure Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full bg-[#0A1838] border border-slate-700 rounded-2xl text-white pl-10 pr-4 py-3 text-sm focus:border-[#1788FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Secondary Options (Passengers, Class, Search Button) */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-[#0A1838] border border-slate-700 rounded-xl px-3 py-2">
                <Users size={16} className="text-slate-400" />
                <span className="text-xs text-slate-400">Travelers:</span>
                <select 
                  value={passengers} 
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
                >
                  <option value={1} className="bg-[#0A1838]">1 Passenger</option>
                  <option value={2} className="bg-[#0A1838]">2 Passengers</option>
                  <option value={3} className="bg-[#0A1838]">3 Passengers</option>
                  <option value={4} className="bg-[#0A1838]">4+ Group</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#0A1838] border border-slate-700 rounded-xl px-3 py-2">
                <Briefcase size={16} className="text-slate-400" />
                <span className="text-xs text-slate-400">Cabin:</span>
                <select 
                  value={cabinClass} 
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
                >
                  <option value="Economy" className="bg-[#0A1838]">Economy</option>
                  <option value="Premium Economy" className="bg-[#0A1838]">Premium Economy</option>
                  <option value="Business" className="bg-[#0A1838]">Business</option>
                  <option value="First" className="bg-[#0A1838]">First Class</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => refetch()}
              className="w-full md:w-auto bg-gradient-to-r from-cyan-500 via-[#1788FF] to-[#4E55F5] text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(23,136,255,0.4)] transition-all cursor-pointer"
            >
              <Search size={18} />
              Find Live Fares
            </button>
          </div>
        </div>

        {/* Results Toolbar (Filters & Sorters) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(10,24,56,0.4)] p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Available Flights
              <span className="text-xs font-mono px-2 py-0.5 bg-blue-500/20 text-[#1788FF] rounded-full">
                {processedFlights.length} Flights
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              {fromInfo.city} ({fromCode}) ➔ {toInfo.city} ({toCode})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Sort options */}
            <div className="flex items-center bg-[#0A1838] border border-slate-700 rounded-xl p-1">
              <button 
                onClick={() => setSortBy('cheapest')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sortBy === 'cheapest' ? 'bg-[#1788FF] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cheapest
              </button>
              <button 
                onClick={() => setSortBy('fastest')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sortBy === 'fastest' ? 'bg-[#1788FF] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fastest
              </button>
              <button 
                onClick={() => setSortBy('departure')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sortBy === 'departure' ? 'bg-[#1788FF] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Time
              </button>
            </div>

            {/* Filter by Stops */}
            <select 
              value={filterStops}
              onChange={(e) => setFilterStops(e.target.value as any)}
              className="bg-[#0A1838] border border-slate-700 rounded-xl text-slate-300 px-3 py-2 outline-none"
            >
              <option value="all">All Stops</option>
              <option value="nonstop">Non-stop Only</option>
            </select>

            {/* Filter by Airline */}
            <select 
              value={filterAirline}
              onChange={(e) => setFilterAirline(e.target.value)}
              className="bg-[#0A1838] border border-slate-700 rounded-xl text-slate-300 px-3 py-2 outline-none"
            >
              <option value="all">All Airlines</option>
              <option value="6E">IndiGo</option>
              <option value="AI">Air India</option>
              <option value="UK">Vistara</option>
              <option value="QP">Akasa Air</option>
              <option value="SG">SpiceJet</option>
            </select>
          </div>
        </div>

        {/* Flight Cards Grid */}
        {isLoading ? (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <Plane className="w-8 h-8 text-[#1788FF] animate-bounce mb-3" />
            <span className="text-sm font-medium">Scanning live flight radar & dynamic fares...</span>
          </div>
        ) : processedFlights.length > 0 ? (
          <div className="space-y-4">
            {processedFlights.map((flight) => {
              const isSaved = savedFlightIds.includes(flight.id);

              return (
                <div 
                  key={flight.id}
                  className="bg-[rgba(10,24,56,0.65)] hover:bg-[rgba(10,24,56,0.85)] border border-blue-500/20 hover:border-blue-500/40 rounded-[20px] p-5 transition-all shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 group"
                >
                  {/* Airline & Aircraft */}
                  <div className="flex items-center gap-4 w-full md:w-1/4">
                    <div className="w-12 h-12 rounded-2xl bg-[#081533] border border-slate-700 flex items-center justify-center font-bold text-sm font-mono text-cyan-400 shadow-inner">
                      {flight.airlineCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{flight.airline}</span>
                        {flight.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {flight.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono block">
                        {flight.flightNumber} • {flight.aircraft}
                      </span>
                    </div>
                  </div>

                  {/* Flight Timing & Corridor */}
                  <div className="flex items-center justify-center gap-6 w-full md:w-2/5">
                    {/* Departure */}
                    <div className="text-right">
                      <span className="text-xl font-bold text-white block">{flight.departureTime}</span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold">{flight.from}</span>
                      <span className="text-[10px] text-slate-400 block">{fromInfo.city}</span>
                    </div>

                    {/* Flight Arc & Duration */}
                    <div className="flex flex-col items-center flex-1 max-w-[140px]">
                      <span className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                        <Clock size={11} /> {flight.duration}
                      </span>
                      <div className="w-full flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#1788FF]" />
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#1788FF] to-purple-500" />
                        <Plane size={14} className="text-purple-400 rotate-90 mx-0.5" />
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-500 to-[#1788FF]" />
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium mt-1">
                        {flight.stops}
                      </span>
                    </div>

                    {/* Arrival */}
                    <div className="text-left">
                      <span className="text-xl font-bold text-white block">{flight.arrivalTime}</span>
                      <span className="text-xs font-mono text-purple-400 font-semibold">{flight.to}</span>
                      <span className="text-[10px] text-slate-400 block">{toInfo.city}</span>
                    </div>
                  </div>

                  {/* Pricing & Booking CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-1/3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <div className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
                        ₹{flight.price.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {flight.availableSeats <= 6 ? (
                          <span className="text-amber-400 font-semibold">Only {flight.availableSeats} seats left</span>
                        ) : (
                          `${flight.availableSeats} seats available`
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveFlight(flight)}
                        title={isSaved ? "Remove from tracking" : "Track price in My Flights"}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSaved 
                            ? 'bg-blue-500/20 border-blue-500 text-cyan-400 shadow-[0_0_15px_rgba(23,136,255,0.3)]' 
                            : 'bg-[#0A1838] border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
                      </button>

                      <button
                        onClick={() => {
                          setToastMessage(`Flight ${flight.flightNumber} selected. Redirecting to instant reservation...`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] hover:shadow-[0_0_20px_rgba(23,136,255,0.4)] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap"
                      >
                        Select Flight
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-12 text-center text-slate-400">
            <p className="text-base text-white font-medium mb-1">No flights match the active filters.</p>
            <p className="text-xs text-slate-400">Try adjusting your price ceiling, airline filter, or choose non-stop.</p>
            <button
              onClick={() => {
                setFilterAirline('all');
                setFilterStops('all');
                setFilterMaxPrice(15000);
              }}
              className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-cyan-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
