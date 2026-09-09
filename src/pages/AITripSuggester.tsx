import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Plane, ArrowRight, ArrowLeftRight, Calendar, Users, 
  DollarSign, ShieldAlert, Check, RefreshCw, 
  ChevronDown, Search, Award, Bookmark 
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../services/api';
import { 
  INDIAN_AIRPORTS, 
  validateDomesticAirports,
  type IndianAirport, 
  type TripSuggesterParams, 
  type TripSuggesterResult,
  type TripRecommendation 
} from '../data/indianAviation';

export function AITripSuggester() {
  usePageTitle('AI Trip Suggester — India Domestic');
  const navigate = useNavigate();

  // Natural language query input
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [isParsingPrompt, setIsParsingPrompt] = useState(false);

  // Form parameters
  const [originCode, setOriginCode] = useState('DEL');
  const [destCode, setDestCode] = useState('GOI');
  const [departDate, setDepartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 12);
    return d.toISOString().split('T')[0];
  });
  const [tripType, setTripType] = useState<'roundTrip' | 'oneWay'>('roundTrip');
  const [flexibilityDays, setFlexibilityDays] = useState<number>(2);
  const [tripDurationDays, setTripDurationDays] = useState<number>(5);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [cabinClass, setCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business'>('Economy');
  const [budgetINR, setBudgetINR] = useState<number>(18000);
  const [priorityPreference, setPriorityPreference] = useState<'bestOverall' | 'cheapest' | 'fastest' | 'bestValue'>('bestOverall');
  const [timeOfDayPreference, setTimeOfDayPreference] = useState<'morning' | 'afternoon' | 'evening' | 'night' | 'any'>('morning');
  const [preferredAirline, setPreferredAirline] = useState<string>('any');

  // UI state for dropdowns
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [originSearchFilter, setOriginSearchFilter] = useState('');
  const [destSearchFilter, setDestSearchFilter] = useState('');

  // Results & Loading animation states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [searchResult, setSearchResult] = useState<TripSuggesterResult | null>(null);
  const [intlError, setIntlError] = useState<string | null>(null);
  const [savedFlightNotification, setSavedFlightNotification] = useState<string | null>(null);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Run initial default suggestion on mount
  useEffect(() => {
    executeTripSuggestion({
      origin: originCode,
      destination: destCode,
      departDate,
      returnDate: tripType === 'roundTrip' ? returnDate : undefined,
      tripType,
      tripDurationDays,
      flexibilityDays,
      travelers: { adults, children, infants },
      cabinClass,
      budgetINR,
      preferences: {
        priority: priorityPreference,
        timeOfDay: timeOfDayPreference,
        airline: preferredAirline !== 'any' ? preferredAirline : undefined
      }
    });
  }, []);

  const getAirportInfo = (code: string): IndianAirport => {
    return INDIAN_AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase()) || {
      code,
      city: code,
      name: `${code} Airport`,
      state: 'India',
      region: 'North',
      popular: false,
      tag: 'Domestic'
    };
  };

  const handleSwapAirports = () => {
    const temp = originCode;
    setOriginCode(destCode);
    setDestCode(temp);
    setIntlError(null);
  };

  // Natural Language Prompt Parser
  const handleParsePrompt = async (customText?: string) => {
    const queryToParse = customText || naturalPrompt;
    if (!queryToParse.trim()) return;

    setIsParsingPrompt(true);
    setIntlError(null);

    try {
      const parsed = await api.parseTripPrompt(queryToParse);
      if (parsed.origin) setOriginCode(parsed.origin);
      if (parsed.destination) setDestCode(parsed.destination);
      if (parsed.departDate) setDepartDate(parsed.departDate);
      if (parsed.returnDate) {
        setReturnDate(parsed.returnDate);
        setTripType('roundTrip');
      } else if (parsed.tripType) {
        setTripType(parsed.tripType);
      }
      if (parsed.tripDurationDays) setTripDurationDays(parsed.tripDurationDays);
      if (parsed.flexibilityDays !== undefined) setFlexibilityDays(parsed.flexibilityDays);
      if (parsed.budgetINR) setBudgetINR(parsed.budgetINR);
      if (parsed.cabinClass) setCabinClass(parsed.cabinClass);
      if (parsed.preferences?.priority) setPriorityPreference(parsed.preferences.priority);
      if (parsed.preferences?.timeOfDay) setTimeOfDayPreference(parsed.preferences.timeOfDay);

      // Trigger recommendation
      executeTripSuggestion({
        origin: parsed.origin || originCode,
        destination: parsed.destination || destCode,
        departDate: parsed.departDate || departDate,
        returnDate: parsed.tripType === 'roundTrip' ? (parsed.returnDate || returnDate) : undefined,
        tripType: parsed.tripType || tripType,
        tripDurationDays: parsed.tripDurationDays || tripDurationDays,
        flexibilityDays: parsed.flexibilityDays !== undefined ? parsed.flexibilityDays : flexibilityDays,
        travelers: { adults, children, infants },
        cabinClass: parsed.cabinClass || cabinClass,
        budgetINR: parsed.budgetINR || budgetINR,
        preferences: {
          priority: parsed.preferences?.priority || priorityPreference,
          timeOfDay: parsed.preferences?.timeOfDay || timeOfDayPreference,
          airline: preferredAirline !== 'any' ? preferredAirline : undefined
        }
      });
    } catch {
      setIntlError('Could not analyze natural language prompt. Please use the form fields below.');
    } finally {
      setIsParsingPrompt(false);
    }
  };

  // Execute optimization
  const executeTripSuggestion = async (params: TripSuggesterParams) => {
    // 1. Validate Domestic India Bounds
    const validation = validateDomesticAirports(params.origin, params.destination);
    if (!validation.valid) {
      setIntlError(validation.error || 'AeroNex AI Trip Suggester currently supports domestic flights within India only.');
      setSearchResult(null);
      return;
    }

    setIntlError(null);
    setIsLoading(true);

    // Multi-stage animated experience
    const stages = [
      'Searching Indian domestic flights...',
      'Comparing multi-carrier fares across Indian trunk routes...',
      'Checking flexible dates (±3 days) for fare troughs...',
      'Optimizing return flight combinations...',
      'Calculating explainable 0–100 AI Trip Scores...',
      'Preparing your optimized recommendations...'
    ];

    let stageIdx = 0;
    setLoadingStage(stages[0]);
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setLoadingStage(stages[stageIdx]);
      }
    }, 280);

    try {
      const res = await api.suggestTrip(params);
      if (!res.valid) {
        setIntlError(res.error || 'AeroNex AI Trip Suggester currently supports domestic flights within India only.');
        setSearchResult(null);
      } else {
        setSearchResult(res);
      }
    } catch {
      setIntlError('Failed to retrieve domestic flight recommendations. Please search normally.');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeTripSuggestion({
      origin: originCode,
      destination: destCode,
      departDate,
      returnDate: tripType === 'roundTrip' ? returnDate : undefined,
      tripType,
      tripDurationDays,
      flexibilityDays,
      travelers: { adults, children, infants },
      cabinClass,
      budgetINR,
      preferences: {
        priority: priorityPreference,
        timeOfDay: timeOfDayPreference,
        airline: preferredAirline !== 'any' ? preferredAirline : undefined
      }
    });
  };

  const handleSaveRecommendation = (rec: TripRecommendation) => {
    try {
      const existing = localStorage.getItem('aeronex_saved_flights');
      let list = existing ? JSON.parse(existing) : [];
      const item = {
        ...rec.outboundFlight,
        id: `trip-rec-${Date.now()}`,
        savedAt: new Date().toISOString(),
        originCity: getAirportInfo(rec.outboundFlight.from).city,
        destCity: getAirportInfo(rec.outboundFlight.to).city,
        targetFare: Math.round(rec.totalFareINR * 0.9),
        currentFare: rec.totalFareINR,
        status: `${rec.categoryTitle} (Score ${rec.aiScore}/100)`
      };
      list.unshift(item);
      localStorage.setItem('aeronex_saved_flights', JSON.stringify(list));
      setSavedFlightNotification(`Trip added to My Flights! Track live price changes.`);
      setTimeout(() => setSavedFlightNotification(null), 3500);
    } catch {}
  };

  const filteredOriginAirports = INDIAN_AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(originSearchFilter.toLowerCase()) ||
    a.code.toLowerCase().includes(originSearchFilter.toLowerCase()) ||
    a.name.toLowerCase().includes(originSearchFilter.toLowerCase())
  );

  const filteredDestAirports = INDIAN_AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(destSearchFilter.toLowerCase()) ||
    a.code.toLowerCase().includes(destSearchFilter.toLowerCase()) ||
    a.name.toLowerCase().includes(destSearchFilter.toLowerCase())
  );

  const originInfo = getAirportInfo(originCode);
  const destInfo = getAirportInfo(destCode);

  const samplePrompts = [
    "Jaipur to Goa for 5 days under ₹15,000",
    "Cheapest Delhi to Mumbai next weekend",
    "Bangalore to Goa 4 days, budget ₹12,000",
    "Mumbai to Delhi, ₹10,000 budget, morning flights",
    "Delhi to Kochi round trip for 6 days"
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-16">
        
        {/* Notification Toast */}
        {savedFlightNotification && (
          <div className="fixed top-24 right-8 z-50 bg-[#0A1838] border border-[#1788FF] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Bookmark className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-medium">{savedFlightNotification}</span>
          </div>
        )}

        {/* Page Hero & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles size={13} className="text-cyan-400 animate-pulse" /> AI Trip Suggester — India Domestic
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                DOMESTIC FLIGHTS ONLY
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Domestic Trip Intelligence & Whole-Trip Optimizer
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-3xl">
              Optimize your complete domestic itinerary across 35+ Indian airports. AeroNex AI analyzes fares, travel duration, connection quality, timing comfort, and flexible-date savings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => executeTripSuggestion({
                origin: originCode,
                destination: destCode,
                departDate,
                returnDate: tripType === 'roundTrip' ? returnDate : undefined,
                tripType,
                tripDurationDays,
                flexibilityDays,
                travelers: { adults, children, infants },
                cabinClass,
                budgetINR,
                preferences: {
                  priority: priorityPreference,
                  timeOfDay: timeOfDayPreference,
                  airline: preferredAirline !== 'any' ? preferredAirline : undefined
                }
              })}
              disabled={isLoading}
              className="px-4 py-2 bg-[#0A1838] border border-slate-700 hover:border-blue-500/40 rounded-xl text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#1788FF]' : 'text-slate-400'} />
              Refresh Fares
            </button>
          </div>
        </div>

        {/* International Rejection Error Alert */}
        {intlError && (
          <div className="bg-rose-950/40 border border-rose-500/40 text-rose-200 p-4 rounded-2xl flex items-start gap-3 shadow-xl animate-in fade-in">
            <ShieldAlert size={20} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-300">Domestic India Route Policy</h4>
              <p className="text-xs text-rose-200/90 mt-0.5">{intlError}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] text-rose-400">Supported hubs:</span>
                {INDIAN_AIRPORTS.slice(0, 6).map(a => (
                  <button
                    key={a.code}
                    onClick={() => {
                      setDestCode(a.code);
                      setIntlError(null);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-rose-900/50 hover:bg-rose-800 text-white font-mono cursor-pointer"
                  >
                    {a.city} ({a.code})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 1. Natural Language Prompt Assistant Panel */}
        <div className="bg-gradient-to-br from-[#071738] via-[#05112B] to-[#0A1C44] border border-blue-500/30 rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Natural Language Trip Planner</h3>
              <p className="text-xs text-slate-400">Describe your trip in plain language, and AeroNex AI will extract all parameters automatically.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={naturalPrompt}
                onChange={(e) => setNaturalPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleParsePrompt();
                }}
                placeholder="Tell AeroNex AI what kind of trip you're planning (e.g. Jaipur to Goa for 5 days, budget ₹15,000)..."
                className="w-full bg-[#03091B]/80 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1788FF] transition-all shadow-inner"
              />
            </div>
            <button
              onClick={() => handleParsePrompt()}
              disabled={isParsingPrompt || !naturalPrompt.trim()}
              className="bg-gradient-to-r from-cyan-500 via-[#1788FF] to-[#4E55F5] hover:shadow-[0_0_20px_rgba(23,136,255,0.4)] disabled:opacity-50 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles size={16} />
              {isParsingPrompt ? 'Analyzing...' : 'Extract & Optimize'}
            </button>
          </div>

          {/* Quick example prompt pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Try prompt:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setNaturalPrompt(p);
                  handleParsePrompt(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0A1838] hover:bg-blue-500/20 border border-slate-700/60 hover:border-blue-500/40 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer truncate max-w-[280px]"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        {/* 2. Structured Trip Specification Form */}
        <form onSubmit={handleManualSearch} className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-blue-500/20 rounded-[24px] p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Origin Airport Picker (4 cols) */}
            <div className="lg:col-span-4 relative" ref={originRef}>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                From (Indian Airport)
              </label>
              <div
                onClick={() => {
                  setShowOriginDropdown(!showOriginDropdown);
                  setShowDestDropdown(false);
                }}
                className={`w-full bg-[#0A1838] border ${showOriginDropdown ? 'border-[#1788FF] ring-2 ring-blue-500/20' : 'border-slate-700'} rounded-2xl px-4 py-3 cursor-pointer flex items-center justify-between transition-all hover:border-slate-600`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                    {originInfo.code}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">{originInfo.city}</span>
                    <span className="text-xs text-slate-400 block truncate">{originInfo.name}</span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showOriginDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* Origin Dropdown Menu */}
              {showOriginDropdown && (
                <div className="absolute top-[82px] left-0 w-full md:w-[360px] bg-[#07132e]/98 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-2xl z-50 p-3 max-h-[340px] flex flex-col animate-in fade-in">
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={originSearchFilter}
                      onChange={(e) => setOriginSearchFilter(e.target.value)}
                      placeholder="Filter Indian cities or airport code..."
                      className="w-full bg-[#0A1838] border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#1788FF]"
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 space-y-1">
                    {filteredOriginAirports.map((a) => (
                      <div
                        key={a.code}
                        onClick={() => {
                          setOriginCode(a.code);
                          setShowOriginDropdown(false);
                          setOriginSearchFilter('');
                          if (a.code === destCode) setDestCode(a.code === 'DEL' ? 'BOM' : 'DEL');
                        }}
                        className={`p-2.5 rounded-xl hover:bg-blue-500/15 cursor-pointer transition-colors flex items-center justify-between ${
                          a.code === originCode ? 'bg-blue-500/20 border border-blue-500/40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {a.code}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white block">{a.city}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[190px]">{a.name}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {a.region}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Swap Button (1 col) */}
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

            {/* Destination Airport Picker (4 cols) */}
            <div className="lg:col-span-4 relative" ref={destRef}>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                To (Indian Destination)
              </label>
              <div
                onClick={() => {
                  setShowDestDropdown(!showDestDropdown);
                  setShowOriginDropdown(false);
                }}
                className={`w-full bg-[#0A1838] border ${showDestDropdown ? 'border-[#1788FF] ring-2 ring-blue-500/20' : 'border-slate-700'} rounded-2xl px-4 py-3 cursor-pointer flex items-center justify-between transition-all hover:border-slate-600`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-mono font-bold text-sm">
                    {destInfo.code}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">{destInfo.city}</span>
                    <span className="text-xs text-slate-400 block truncate">{destInfo.name}</span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showDestDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* Destination Dropdown Menu */}
              {showDestDropdown && (
                <div className="absolute top-[82px] left-0 w-full md:w-[360px] bg-[#07132e]/98 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl z-50 p-3 max-h-[340px] flex flex-col animate-in fade-in">
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={destSearchFilter}
                      onChange={(e) => setDestSearchFilter(e.target.value)}
                      placeholder="Filter Indian destinations..."
                      className="w-full bg-[#0A1838] border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 space-y-1">
                    {filteredDestAirports.map((a) => (
                      <div
                        key={a.code}
                        onClick={() => {
                          setDestCode(a.code);
                          setShowDestDropdown(false);
                          setDestSearchFilter('');
                        }}
                        className={`p-2.5 rounded-xl hover:bg-purple-500/15 cursor-pointer transition-colors flex items-center justify-between ${
                          a.code === destCode ? 'bg-purple-500/20 border border-purple-500/40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                            {a.code}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white block">{a.city}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[190px]">{a.name}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {a.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Travel Date / Departure (3 cols) */}
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

          {/* Second Row: Trip Type, Return Date, Flexibility, Budget, Cabin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mt-5 pt-5 border-t border-slate-800/80 items-center">
            
            {/* Trip Type toggle (2 cols) */}
            <div className="lg:col-span-2">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Trip Type</label>
              <div className="flex bg-[#0A1838] border border-slate-700 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setTripType('roundTrip')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    tripType === 'roundTrip' ? 'bg-[#1788FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Round Trip
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('oneWay')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    tripType === 'oneWay' ? 'bg-[#1788FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  One Way
                </button>
              </div>
            </div>

            {/* Return Date (if Round Trip) (3 cols) */}
            {tripType === 'roundTrip' && (
              <div className="lg:col-span-3">
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Return Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white pl-10 pr-3 py-2 text-xs focus:border-[#1788FF] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Flexibility (2 cols) */}
            <div className={tripType === 'roundTrip' ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Date Flexibility</label>
              <select
                value={flexibilityDays}
                onChange={(e) => setFlexibilityDays(Number(e.target.value))}
                className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-3 py-2 text-xs focus:border-[#1788FF] outline-none cursor-pointer"
              >
                <option value={0} className="bg-[#0A1838]">Exact Date Only</option>
                <option value={1} className="bg-[#0A1838]">±1 Day Flexible</option>
                <option value={2} className="bg-[#0A1838]">±2 Days Flexible</option>
                <option value={3} className="bg-[#0A1838]">±3 Days (Recommended)</option>
              </select>
            </div>

            {/* Budget (3 cols) */}
            <div className={tripType === 'roundTrip' ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Budget (INR)</label>
                <span className="text-xs font-bold font-mono text-cyan-400">₹{budgetINR.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={budgetINR}
                onChange={(e) => setBudgetINR(Number(e.target.value))}
                className="w-full accent-[#1788FF] cursor-pointer"
              />
            </div>

            {/* Travelers (3 cols) */}
            <div className="lg:col-span-3">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Travelers</label>
              <div className="flex items-center gap-1.5 bg-[#0A1838] border border-slate-700 rounded-xl px-2.5 py-1.5">
                <Users size={14} className="text-slate-400 shrink-0" />
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n} className="bg-[#0A1838]">{n} Ad</option>
                  ))}
                </select>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer"
                >
                  {[0, 1, 2, 3, 4].map(n => (
                    <option key={n} value={n} className="bg-[#0A1838]">{n} Ch</option>
                  ))}
                </select>
                <select
                  value={infants}
                  onChange={(e) => setInfants(Number(e.target.value))}
                  className="bg-transparent text-xs text-slate-400 outline-none cursor-pointer"
                >
                  {[0, 1, 2].map(n => (
                    <option key={n} value={n} className="bg-[#0A1838]">{n} Inf</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cabin Class (2 cols) */}
            <div className="lg:col-span-2 flex flex-col justify-end">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Cabin</label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as any)}
                className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-3 py-2 text-xs focus:border-[#1788FF] outline-none cursor-pointer"
              >
                <option value="Economy" className="bg-[#0A1838]">Economy</option>
                <option value="Premium Economy" className="bg-[#0A1838]">Premium Economy</option>
                <option value="Business" className="bg-[#0A1838]">Business Class</option>
              </select>
            </div>
          </div>

          {/* Third Row: Preferences Chips & Action Button */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Preferences:</span>
              
              {/* Priority */}
              <div className="flex bg-[#0A1838] border border-slate-700 rounded-xl p-0.5">
                {(['bestOverall', 'cheapest', 'fastest', 'bestValue'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriorityPreference(p)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      priorityPreference === p ? 'bg-[#1788FF] text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p === 'bestOverall' ? '🏆 Best' : p === 'cheapest' ? '💰 Lowest' : p === 'fastest' ? '⚡ Speed' : '⭐ Value'}
                  </button>
                ))}
              </div>

              {/* Time of Day */}
              <select
                value={timeOfDayPreference}
                onChange={(e) => setTimeOfDayPreference(e.target.value as any)}
                className="bg-[#0A1838] border border-slate-700 rounded-xl text-slate-300 px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="any">Any Time</option>
                <option value="morning">Morning (06:00 - 12:00)</option>
                <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                <option value="evening">Evening (17:00 - 21:00)</option>
                <option value="night">Night (21:00 - 06:00)</option>
              </select>

              {/* Preferred Airline */}
              <select
                value={preferredAirline}
                onChange={(e) => setPreferredAirline(e.target.value)}
                className="bg-[#0A1838] border border-slate-700 rounded-xl text-slate-300 px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="any">All Domestic Airlines</option>
                <option value="IndiGo">IndiGo (6E)</option>
                <option value="Air India">Air India (AI)</option>
                <option value="Vistara">Vistara (UK)</option>
                <option value="Akasa Air">Akasa Air (QP)</option>
                <option value="SpiceJet">SpiceJet (SG)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto bg-gradient-to-r from-cyan-500 via-[#1788FF] to-[#4E55F5] hover:shadow-[0_0_25px_rgba(23,136,255,0.4)] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles size={16} />
              {isLoading ? 'Analyzing Flights...' : 'Optimize Domestic Trip'}
            </button>
          </div>
        </form>

        {/* International / Domestic Notice Banner */}
        {intlError && (
          <div className="bg-gradient-to-r from-amber-950/40 via-red-950/30 to-[#0A1838] border border-amber-500/50 rounded-[22px] p-6 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
                <ShieldAlert size={26} />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Domestic India Routes Only</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      India Restricted
                    </span>
                  </h3>
                  <p className="text-sm text-slate-200 mt-1">
                    {intlError}
                  </p>
                </div>

                <div className="pt-2 border-t border-amber-500/20">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    Looking for a getaway? Explore popular domestic Indian destinations instead:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { city: 'Goa (GOI)', code: 'GOI', icon: '🏖️' },
                      { city: 'Kerala / Kochi (COK)', code: 'COK', icon: '🌴' },
                      { city: 'Kashmir / Srinagar (SXR)', code: 'SXR', icon: '🏔️' },
                      { city: 'Andaman / Port Blair (IXZ)', code: 'IXZ', icon: '🏝️' },
                      { city: 'Jaipur (JAI)', code: 'JAI', icon: '🏰' },
                      { city: 'Bengaluru (BLR)', code: 'BLR', icon: '☕' }
                    ].map(alt => (
                      <button
                        key={alt.code}
                        type="button"
                        onClick={() => {
                          setDestCode(alt.code);
                          setIntlError(null);
                          executeTripSuggestion({
                            origin: originCode === alt.code ? (alt.code === 'DEL' ? 'BOM' : 'DEL') : originCode,
                            destination: alt.code,
                            departDate,
                            returnDate: tripType === 'roundTrip' ? returnDate : undefined,
                            tripType,
                            tripDurationDays,
                            flexibilityDays,
                            travelers: { adults, children, infants },
                            cabinClass,
                            budgetINR,
                            preferences: {
                              priority: priorityPreference,
                              timeOfDay: timeOfDayPreference,
                              airline: preferredAirline !== 'any' ? preferredAirline : undefined
                            }
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-200 hover:text-white transition-all cursor-pointer"
                      >
                        <span>{alt.icon}</span>
                        <span>{alt.city}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Multi-Stage Animated Loading Experience */}
        {isLoading && (
          <div className="bg-[rgba(10,24,56,0.8)] border border-blue-500/30 rounded-[24px] p-10 flex flex-col items-center justify-center text-center shadow-2xl animate-in fade-in">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#1788FF] animate-pulse">
                <Plane size={30} className="animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400" />
              AeroNex AI is analyzing your domestic trip...
            </h3>
            <p className="text-cyan-400 text-sm font-medium tracking-wide animate-pulse">
              {loadingStage}
            </p>

            <div className="w-full max-w-md bg-slate-800/80 rounded-full h-2 mt-5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-[#1788FF] h-full rounded-full animate-[pulse_1s_infinite]" style={{ width: '80%' }} />
            </div>
          </div>
        )}

        {/* 4. Results Display */}
        {searchResult && !isLoading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-200">
            
            {/* Realtime Refresh Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A1838]/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                  {searchResult.originInfo.city} ({searchResult.originInfo.code}) ➔ {searchResult.destinationInfo.city} ({searchResult.destinationInfo.code})
                </span>
                <span className="text-xs text-slate-300">
                  {searchResult.params.tripType === 'roundTrip' ? 'Round Trip' : 'One Way'} • {searchResult.params.cabinClass}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Updated just now ({searchResult.refreshedAt})
                </span>
              </div>
            </div>

            {/* Flexible Date AI Savings Callout Banner */}
            {searchResult.flexibleDateSavings && (
              <div className="bg-gradient-to-r from-emerald-950/40 via-[#07241A] to-[#0A1838] border border-emerald-500/40 rounded-[20px] p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        ✨ AI Found a Better Date
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                        Save ~₹{searchResult.flexibleDateSavings.savingsINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 mt-1">
                      {searchResult.flexibleDateSavings.explanation}
                    </p>
                  </div>
                </div>

                {/* Date options chips */}
                <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
                  {searchResult.flexibleDateSavings.dateOptions.map((opt, i) => (
                    <div
                      key={i}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all ${
                        opt.isLowest 
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' 
                          : 'bg-[#0A1838] border border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <span className="block text-[10px]">{opt.date}</span>
                      <span>₹{opt.fareINR.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4 Recommendation Category Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category 1: 🏆 Best Overall */}
              <div className="bg-gradient-to-br from-[#0B1E4A] via-[rgba(10,24,56,0.85)] to-[#07132e] border-2 border-[#1788FF] rounded-[24px] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1788FF]/10 rounded-full blur-3xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏆</span>
                      <h3 className="text-lg font-black text-white">{searchResult.bestOverall.categoryTitle}</h3>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40">
                      <Award size={14} className="text-cyan-400" />
                      <span className="text-xs font-bold text-cyan-300 font-mono">
                        AI Score: {searchResult.bestOverall.aiScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Outbound Flight */}
                  <div className="bg-[#050D24]/80 rounded-2xl p-4 border border-slate-800 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outbound Flight</span>
                      <span className="text-xs font-mono font-bold text-[#1788FF]">
                        {searchResult.bestOverall.outboundFlight.airline} ({searchResult.bestOverall.outboundFlight.flightNumber})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-white block">{searchResult.bestOverall.outboundFlight.departureTime}</span>
                        <span className="text-xs text-slate-400">{searchResult.originInfo.city}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400">{searchResult.bestOverall.outboundFlight.duration}</span>
                        <div className="w-16 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 my-1" />
                        <span className="text-[10px] text-emerald-400 font-semibold">{searchResult.bestOverall.outboundFlight.stops}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-white block">{searchResult.bestOverall.outboundFlight.arrivalTime}</span>
                        <span className="text-xs text-slate-400">{searchResult.destinationInfo.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Return Flight if Round Trip */}
                  {searchResult.bestOverall.returnFlight && (
                    <div className="bg-[#050D24]/80 rounded-2xl p-4 border border-slate-800 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Return Flight</span>
                        <span className="text-xs font-mono font-bold text-purple-400">
                          {searchResult.bestOverall.returnFlight.airline} ({searchResult.bestOverall.returnFlight.flightNumber})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-white block">{searchResult.bestOverall.returnFlight.departureTime}</span>
                          <span className="text-xs text-slate-400">{searchResult.destinationInfo.city}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400">{searchResult.bestOverall.returnFlight.duration}</span>
                          <div className="w-16 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 my-1" />
                          <span className="text-[10px] text-emerald-400 font-semibold">{searchResult.bestOverall.returnFlight.stops}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-white block">{searchResult.bestOverall.returnFlight.arrivalTime}</span>
                          <span className="text-xs text-slate-400">{searchResult.originInfo.city}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Why AI Recommends This */}
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                    <span className="text-xs font-bold text-cyan-300 block mb-1">Why AI Recommends This:</span>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      "{searchResult.bestOverall.explanation}"
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {searchResult.bestOverall.aiScoreReasons.map((r, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-slate-200 flex items-center gap-1">
                          <Check size={10} className="text-cyan-400" /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Itinerary Fare</span>
                    <span className="text-2xl font-black text-white">
                      ₹{searchResult.bestOverall.totalFareINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveRecommendation(searchResult.bestOverall)}
                      title="Save to My Flights"
                      className="p-3 rounded-xl bg-[#0A1838] border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <Bookmark size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/search?from=${searchResult.originInfo.code}&to=${searchResult.destinationInfo.code}`)}
                      className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] hover:shadow-[0_0_20px_rgba(23,136,255,0.4)] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      View Flight <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category 2: 💰 Cheapest */}
              <div className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-emerald-500/30 rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💰</span>
                      <h3 className="text-lg font-black text-white">{searchResult.cheapest.categoryTitle}</h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      AI Score: {searchResult.cheapest.aiScore}/100
                    </span>
                  </div>

                  {/* Flight Info */}
                  <div className="bg-[#050D24]/80 rounded-2xl p-4 border border-slate-800 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{searchResult.cheapest.outboundFlight.airline}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">₹{searchResult.cheapest.outboundFlight.price.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Departs {searchResult.cheapest.outboundFlight.departureTime} • {searchResult.cheapest.outboundFlight.duration} • {searchResult.cheapest.outboundFlight.stops}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 text-xs text-slate-300">
                    <p className="leading-relaxed">"{searchResult.cheapest.explanation}"</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {searchResult.cheapest.aiScoreReasons.map((r, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-slate-200 flex items-center gap-1">
                          <Check size={10} className="text-emerald-400" /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lowest Total Fare</span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₹{searchResult.cheapest.totalFareINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/search?from=${searchResult.originInfo.code}&to=${searchResult.destinationInfo.code}`)}
                    className="bg-[#0A1838] hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Select Cheapest <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Category 3: ⚡ Fastest */}
              <div className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-amber-500/30 rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚡</span>
                      <h3 className="text-lg font-black text-white">{searchResult.fastest.categoryTitle}</h3>
                    </div>
                    <span className="text-xs font-bold text-amber-400 font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                      AI Score: {searchResult.fastest.aiScore}/100
                    </span>
                  </div>

                  <div className="bg-[#050D24]/80 rounded-2xl p-4 border border-slate-800 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{searchResult.fastest.outboundFlight.airline}</span>
                      <span className="text-xs font-mono text-amber-400 font-bold">{searchResult.fastest.outboundFlight.duration}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {searchResult.fastest.outboundFlight.aircraft} • Non-stop high-priority slot
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 text-xs text-slate-300">
                    <p className="leading-relaxed">"{searchResult.fastest.explanation}"</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {searchResult.fastest.aiScoreReasons.map((r, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-slate-200 flex items-center gap-1">
                          <Check size={10} className="text-amber-400" /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fastest Flight Fare</span>
                    <span className="text-2xl font-black text-amber-400">
                      ₹{searchResult.fastest.totalFareINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/search?from=${searchResult.originInfo.code}&to=${searchResult.destinationInfo.code}`)}
                    className="bg-[#0A1838] hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Select Fastest <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Category 4: ⭐ Best Value */}
              <div className="bg-[rgba(10,24,56,0.7)] backdrop-blur-xl border border-purple-500/30 rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      <h3 className="text-lg font-black text-white">{searchResult.bestValue.categoryTitle}</h3>
                    </div>
                    <span className="text-xs font-bold text-purple-400 font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30">
                      AI Score: {searchResult.bestValue.aiScore}/100
                    </span>
                  </div>

                  <div className="bg-[#050D24]/80 rounded-2xl p-4 border border-slate-800 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{searchResult.bestValue.outboundFlight.airline}</span>
                      <span className="text-xs font-mono text-purple-400 font-bold">₹{searchResult.bestValue.outboundFlight.price.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Departure {searchResult.bestValue.outboundFlight.departureTime} • {searchResult.bestValue.outboundFlight.duration}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4 text-xs text-slate-300">
                    <p className="leading-relaxed">"{searchResult.bestValue.explanation}"</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {searchResult.bestValue.aiScoreReasons.map((r, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-slate-200 flex items-center gap-1">
                          <Check size={10} className="text-purple-400" /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Best Value Total</span>
                    <span className="text-2xl font-black text-purple-400">
                      ₹{searchResult.bestValue.totalFareINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/search?from=${searchResult.originInfo.code}&to=${searchResult.destinationInfo.code}`)}
                    className="bg-[#0A1838] hover:bg-purple-500/20 text-purple-400 border border-purple-500/40 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Select Best Value <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>

            {/* 5. Round Trip Return Optimization Section */}
            {searchResult.roundTripOptimization && (
              <div className="bg-[rgba(10,24,56,0.65)] border border-blue-500/20 rounded-[20px] p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeftRight size={18} className="text-[#1788FF]" />
                  <h3 className="text-base font-bold text-white">Return Flight Optimization (Round Trip)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  {searchResult.roundTripOptimization.explanation}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#050D24]/80 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">Outbound Sector</span>
                    <span className="text-sm font-bold text-white block">
                      {searchResult.roundTripOptimization.outboundFlight.airline} ({searchResult.roundTripOptimization.outboundFlight.flightNumber})
                    </span>
                    <span className="text-xs text-slate-400">
                      {searchResult.roundTripOptimization.outboundFlight.departureTime} ➔ {searchResult.roundTripOptimization.outboundFlight.arrivalTime} • ₹{searchResult.roundTripOptimization.outboundFlight.price}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">Inbound Sector</span>
                    <span className="text-sm font-bold text-white block">
                      {searchResult.roundTripOptimization.returnFlight.airline} ({searchResult.roundTripOptimization.returnFlight.flightNumber})
                    </span>
                    <span className="text-xs text-slate-400">
                      {searchResult.roundTripOptimization.returnFlight.departureTime} ➔ {searchResult.roundTripOptimization.returnFlight.arrivalTime} • ₹{searchResult.roundTripOptimization.returnFlight.price}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Round Trip Fare: </span>
                    <span className="text-sm font-bold text-white">₹{searchResult.roundTripOptimization.totalFareINR.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/search?from=${searchResult.originInfo.code}&to=${searchResult.destinationInfo.code}`)}
                    className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-xs font-bold text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    View Round Trip Flights <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* 6. Best Time to Book & Price Intelligence */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Best Time to Book (7 cols) */}
              <div className="md:col-span-7 bg-[rgba(10,24,56,0.65)] border border-blue-500/20 rounded-[20px] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-cyan-400" />
                    <h3 className="text-base font-bold text-white">📅 Best Time to Book</h3>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {searchResult.bestTimeToBook.recommendation === 'BOOK_NOW' ? 'Optimal Window' : 'Fair Price'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {searchResult.bestTimeToBook.adviceText}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#050D24]/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Optimal Booking Window:</span>
                    <span className="font-bold text-white font-mono">{searchResult.bestTimeToBook.advanceWindowDays}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050D24]/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Weekday Savings Insight:</span>
                    <span className="font-semibold text-emerald-400">{searchResult.bestTimeToBook.weekdaySavingsInsight}</span>
                  </div>
                </div>
              </div>

              {/* Budget Analysis Guidance (5 cols) */}
              {searchResult.budgetAnalysis && (
                <div className="md:col-span-5 bg-[rgba(10,24,56,0.65)] border border-blue-500/20 rounded-[20px] p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-amber-400" />
                        <h3 className="text-base font-bold text-white">Budget Feasibility</h3>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        searchResult.budgetAnalysis.withinBudget
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {searchResult.budgetAnalysis.withinBudget ? 'Within Budget' : 'Budget Exceeded'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {searchResult.budgetAnalysis.adviceText}
                    </p>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Available Tier Breakdown:</span>
                      {searchResult.budgetAnalysis.closestOptions.map((opt, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#050D24]">
                          <span className="text-slate-300">{opt.title}</span>
                          <span className="font-mono font-bold text-white">₹{opt.fareINR.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
