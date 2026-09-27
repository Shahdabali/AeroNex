import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FlightDetailModal } from '../components/FlightDetailModal';
import { clock, dayOf, durationLabel } from '../utils/flightTime';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { ErrorBlock } from '../components/StateViews';
import { SearchBanner, SearchProgress } from '../components/SearchStatus';
import { useFlightSearch } from '../hooks/useFlightSearch';
import {
  Search, Calendar, Users, Briefcase, ArrowLeftRight, Plane,
  Check, Bookmark, Clock, ChevronDown, Bell
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { api, type LiveFlight } from '../services/api';
import { INDIAN_AIRPORTS, type IndianAirport } from '../data/indianAviation';

/** Calendar date in India (IST) `n` days from now, as YYYY-MM-DD. Fares are for Indian departures, so "today" is the IST day. */
const istDay = (n = 0) => new Date(Date.now() + 19_800_000 + n * 86_400_000).toISOString().slice(0, 10);
/** A date the fare source can be asked about: well-formed, not in the past, within the booking horizon. */
const isSearchableDate = (d: string | null): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= istDay(0) && d <= istDay(330);

export function FlightSearch() {
  usePageTitle('Flight Search');
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFrom = searchParams.get('from') || 'DEL';
  const initialTo = searchParams.get('to') || 'BOM';

  const [fromCode, setFromCode] = useState(initialFrom);
  const [toCode, setToCode] = useState(initialTo);
  // The URL is the source of truth for a shared/bookmarked search; without a usable date, default to tomorrow (IST).
  const [departDate, setDepartDate] = useState(() => {
    const fromUrl = searchParams.get('date');
    return isSearchableDate(fromUrl) ? fromUrl : istDay(1);
  });

  // Dropdown UI states
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearchFilter, setFromSearchFilter] = useState('');
  const [toSearchFilter, setToSearchFilter] = useState('');

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'departure'>('cheapest');
  const [filterStops, setFilterStops] = useState<'all' | 'nonstop'>('all');
  const [filterAirline, setFilterAirline] = useState<string>(searchParams.get('airline') || 'all');

  // Tracking notifications
  const [savedFlightIds, setSavedFlightIds] = useState<string[]>([]);
  const [detailFlight, setDetailFlight] = useState<LiveFlight | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    const paramDate = searchParams.get('date');
    if (paramFrom) setFromCode(paramFrom.toUpperCase());
    if (paramTo) setToCode(paramTo.toUpperCase());
    if (isSearchableDate(paramDate)) setDepartDate(paramDate);
  }, [searchParams]);

  // Keep the URL in sync with the search so it survives refresh and can be shared.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set('from', fromCode);
    next.set('to', toCode);
    next.set('date', departDate);
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCode, toCode, departDate]);

  const { flights, meta, phase, error, refresh, refetch } = useFlightSearch(fromCode, toCode, departDate);
  const today = istDay(0);
  const maxDate = istDay(330);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (err: any) {
      setToastMessage(err?.message || 'Could not refresh fares.');
      setTimeout(() => setToastMessage(null), 4500);
    } finally {
      setRefreshing(false);
    }
  };

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

  // "Track" creates a real price alert for the corridor at 10% below this fare.
  const handleTrackFlight = async (flight: LiveFlight) => {
    if (savedFlightIds.includes(flight.id)) return;
    try {
      await api.createAlert({
        origin: flight.origin,
        destination: flight.destination,
        targetPrice: Math.round(flight.price * 0.9),
        airline: flight.airline,
        date: departDate,
        cabinClass: 'Economy',
        channels: ['In-app'],
      });
      setSavedFlightIds(ids => [...ids, flight.id]);
      setToastMessage(`Price alert set for ${flight.origin} → ${flight.destination} below ₹${Math.round(flight.price * 0.9).toLocaleString('en-IN')}. Manage it in Price Alerts.`);
    } catch (err: any) {
      setToastMessage(err?.message || 'Could not set the price alert.');
    }
    setTimeout(() => setToastMessage(null), 4500);
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
  const processedFlights = flights
    .filter(f => {
      if (filterStops === 'nonstop' && f.stops !== 0) return false;
      if (filterAirline !== 'all' && f.airlineCode !== filterAirline) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'cheapest') return a.price - b.price;
      if (sortBy === 'fastest') return a.durationMin - b.durationMin || a.price - b.price;
      if (sortBy === 'departure') return a.departureAt.localeCompare(b.departureAt);
      return 0;
    });

  // Filter options come from the flights actually returned, not a hard-coded airline list.
  const airlineOptions = [...new Map(flights.map(f => [f.airlineCode, f.airline] as const)).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const lowestPrice = processedFlights.length > 0 ? Math.min(...processedFlights.map(f => f.price)) : 0;
  const fastestMin = processedFlights.length > 0 ? Math.min(...processedFlights.map(f => f.durationMin)) : 0;
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
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5 flex-wrap">
              Flight Search &amp; Fare Comparison
              <DataSourceBadge />
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Fares collected from a live fare source for Indian domestic routes. Every result shows how recently it was collected; nothing here is estimated.
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
        <div className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl">
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
                  min={today}
                  max={maxDate}
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
              <div className="flex items-center gap-2 bg-[#0A1838] border border-slate-700 rounded-xl px-3 py-2" title="Fares are collected for one adult passenger at the moment">
                <Users size={16} className="text-slate-400" />
                <span className="text-xs text-slate-400">Travelers:</span>
                <select
                  value={1}
                  onChange={() => undefined}
                  aria-label="Passengers"
                  className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
                >
                  <option value={1} className="bg-[#0A1838]">1 Passenger</option>
                  <option value={2} disabled className="bg-[#0A1838]">2+ (not collected)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#0A1838] border border-slate-700 rounded-xl px-3 py-2" title="Only economy fares are collected at the moment">
                <Briefcase size={16} className="text-slate-400" />
                <span className="text-xs text-slate-400">Cabin:</span>
                <select
                  value="Economy"
                  onChange={() => undefined}
                  aria-label="Cabin"
                  className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
                >
                  <option value="Economy" className="bg-[#0A1838]">Economy</option>
                  <option value="Premium Economy" disabled className="bg-[#0A1838]">Premium Economy (not collected)</option>
                  <option value="Business" disabled className="bg-[#0A1838]">Business (not collected)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => void refetch()}
              className="w-full md:w-auto bg-gradient-to-r from-cyan-500 via-[#1788FF] to-[#4E55F5] text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(23,136,255,0.4)] transition-all cursor-pointer"
            >
              <Search size={18} />
              Search fares
            </button>
          </div>
        </div>

        <SearchBanner phase={phase} meta={meta} onRefresh={() => void handleRefresh()} refreshing={refreshing} />

        {/* Results Toolbar (Filters & Sorters) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(10,24,56,0.4)] p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Available Flights
              <span className="text-xs font-mono px-2 py-0.5 bg-blue-500/20 text-[#1788FF] rounded-full">
                {processedFlights.length === flights.length ? `${flights.length} Flights` : `${processedFlights.length} of ${flights.length} Flights`}
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
              {airlineOptions.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Fare Alert Callout */}
        <div className="bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-purple-950/30 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Track fares for {fromCode} ➔ {toCode}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lowestPrice ? `Get notified in-app when the fare drops below ₹${Math.round(lowestPrice * 0.9).toLocaleString('en-IN')} (10% under today's lowest).` : 'Get notified in-app when the fare drops to your target.'}
              </p>
            </div>
          </div>
          <Link
            to={`/price-alerts?from=${fromCode}&to=${toCode}&target=${Math.round(lowestPrice * 0.9)}`}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Bell size={14} />
            Set Price Alert (-10%)
          </Link>
        </div>

        {/* Flight Cards Grid */}
        {phase === 'searching' ? (
          <SearchProgress meta={meta} />
        ) : phase === 'error' ? (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px]">
            <ErrorBlock error={error} onRetry={() => void refetch()} title="Couldn't reach live fares" />
          </div>
        ) : processedFlights.length > 0 ? (
          <div className="space-y-4">
            {processedFlights.map((flight) => {
              const isSaved = savedFlightIds.includes(flight.id);
              const nextDay = dayOf(flight.arrivalAt) !== dayOf(flight.departureAt);
              const badge = flight.price === lowestPrice ? 'Cheapest' : flight.durationMin === fastestMin ? 'Fastest' : null;
              const listed = flight.availability !== 'not_listed';

              return (
                <div
                  key={flight.id}
                  className={`bg-[rgba(10,24,56,0.65)] hover:bg-[rgba(10,24,56,0.85)] border border-blue-500/20 hover:border-blue-500/40 rounded-[20px] p-5 transition-all shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 group ${listed ? '' : 'opacity-60'}`}
                >
                  {/* Airline */}
                  <div className="flex items-center gap-4 w-full md:w-1/4">
                    <div className="w-12 h-12 rounded-2xl bg-[#081533] border border-slate-700 flex items-center justify-center font-bold text-sm font-mono text-cyan-400 shadow-inner">
                      {flight.airlineCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base">{flight.airline}</span>
                        {badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono block">
                        {flight.flightNumber}{flight.aircraft ? ` · ${flight.aircraft.replace(/\s*\(.*\)/, '')}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Flight Timing & Corridor */}
                  <div className="flex items-center justify-center gap-6 w-full md:w-2/5">
                    <div className="text-right">
                      <span className="text-xl font-bold text-white block">{clock(flight.departureAt)}</span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold">{flight.origin}</span>
                      <span className="text-[10px] text-slate-400 block">{fromInfo.city}</span>
                    </div>

                    <div className="flex flex-col items-center flex-1 max-w-[150px]">
                      <span className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                        <Clock size={11} /> {durationLabel(flight.durationMin)}
                      </span>
                      <div className="w-full flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#1788FF]" />
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#1788FF] to-purple-500" />
                        <Plane size={14} className="text-purple-400 rotate-90 mx-0.5" />
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-500 to-[#1788FF]" />
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium mt-1 text-center">
                        {flight.stopsLabel}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-xl font-bold text-white block">
                        {clock(flight.arrivalAt)}
                        {nextDay && <sup className="text-[10px] text-amber-400 ml-0.5">+1</sup>}
                      </span>
                      <span className="text-xs font-mono text-purple-400 font-semibold">{flight.destination}</span>
                      <span className="text-[10px] text-slate-400 block">{toInfo.city}</span>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-1/3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <div className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
                        ₹{flight.price.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {!listed ? 'No longer listed' : flight.seatsLeft ? `${flight.seatsLeft} seats left` : 'per adult, taxes incl.'}
                      </span>
                      {flight.priceChangePct !== null && flight.priceChangePct !== 0 && (
                        <span className={`text-[10px] font-semibold ${flight.priceChangePct < 0 ? 'text-emerald-400' : 'text-rose-400'}`} title={`Previously ₹${flight.previousPrice?.toLocaleString('en-IN')}`}>
                          {flight.priceChangePct < 0 ? '▼' : '▲'} {Math.abs(flight.priceChangePct)}% since last change
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTrackFlight(flight)}
                        aria-label={isSaved ? 'Price alert set' : `Set a price alert for ${flight.flightNumber}`}
                        title={isSaved ? 'Price alert set' : 'Track this fare with a price alert'}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSaved
                            ? 'bg-blue-500/20 border-blue-500 text-cyan-400 shadow-[0_0_15px_rgba(23,136,255,0.3)]'
                            : 'bg-[#0A1838] border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
                      </button>

                      <button
                        onClick={() => setDetailFlight(flight)}
                        className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] hover:shadow-[0_0_20px_rgba(23,136,255,0.4)] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : flights.length > 0 ? (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-12 text-center text-slate-400">
            <p className="text-base text-white font-medium mb-1">No flights match the active filters.</p>
            <p className="text-xs text-slate-400">{flights.length} flights were found for this search. Try another airline or include connecting flights.</p>
            <button
              onClick={() => {
                setFilterAirline('all');
                setFilterStops('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-cyan-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (phase === 'ready' || phase === 'stale' || phase === 'refreshing') && meta?.noFlights ? (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-12 text-center text-slate-400">
            <p className="text-base text-white font-medium mb-1">No flights were found for this route and date.</p>
            <p className="text-xs text-slate-400">{fromInfo.city} ({fromCode}) → {toInfo.city} ({toCode}) on {departDate}. Try a nearby date.</p>
          </div>
        ) : phase === 'failed' || phase === 'timeout' || phase === 'stale' ? null : (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[20px] p-12 text-center text-slate-400">
            <p className="text-sm">Choose a route and date to see live fares.</p>
          </div>
        )}
      </div>
      {detailFlight && <FlightDetailModal flight={detailFlight} onClose={() => setDetailFlight(null)} />}
    </DashboardLayout>
  );
}
