import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  Bell, Plus, Trash2, ArrowRight, ArrowLeftRight, 
  Sparkles, TrendingDown, Plane, ShieldCheck, Clock, Mail, 
  Smartphone, MessageSquare, SlidersHorizontal, Search, ExternalLink, 
  Play, Pause, Zap, CheckCircle2, DollarSign, Tag, Radio
} from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { INDIAN_AIRPORTS, type IndianAirport } from '../data/indianAviation';

export function PriceAlerts() {
  usePageTitle('Autonomous Price Alerts — AERONEX');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Route & Target Price State
  const initialFrom = searchParams.get('from')?.toUpperCase() || 'DEL';
  const initialTo = searchParams.get('to')?.toUpperCase() || 'BOM';
  const initialTarget = searchParams.get('target') || '';

  const [origin, setOrigin] = useState(initialFrom);
  const [destination, setDestination] = useState(initialTo === initialFrom ? 'BOM' : initialTo);
  const [targetPrice, setTargetPrice] = useState(initialTarget);
  
  // Advanced Options
  const [selectedAirline, setSelectedAirline] = useState('Any Airline');
  const [travelDate, setTravelDate] = useState('2026-09-25');
  const [cabinClass, setCabinClass] = useState('Economy');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['Email', 'Push Notification']);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(10);

  // List Filter & Search State
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'triggered' | 'paused'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch live alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
  });

  // Calculate live market fare for chosen route
  const currentLiveFare = useMemo(() => {
    return api.getEstimatedRouteFare(origin, destination);
  }, [origin, destination]);

  // Sync target price when route or discount preset changes
  useEffect(() => {
    if (!initialTarget || targetPrice === '') {
      const discounted = Math.round(currentLiveFare * (1 - discountPercent / 100));
      setTargetPrice(discounted.toString());
    }
  }, [origin, destination, discountPercent, currentLiveFare]);

  // Airport Lookup Helper
  const getAirport = (code: string): IndianAirport => {
    return INDIAN_AIRPORTS.find(a => a.code === code) || {
      code,
      city: code,
      name: `${code} Airport`,
      state: 'India',
      region: 'Central',
      popular: true,
      tag: 'Domestic'
    };
  };

  // Swap Origin & Destination
  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Channel Toggle Helper
  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter(c => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  // Preset discount click
  const handlePresetClick = (percent: number) => {
    setDiscountPercent(percent);
    const discounted = Math.round(currentLiveFare * (1 - percent / 100));
    setTargetPrice(discounted.toString());
  };

  // Mutation: Create Alert
  const createAlertMutation = useMutation({
    mutationFn: async (overrideData?: any) => {
      const payload = overrideData || {
        origin,
        destination,
        route: `${origin}-${destination}`,
        targetPrice: Number(targetPrice) || Math.round(currentLiveFare * 0.9),
        currentFare: currentLiveFare,
        airline: selectedAirline,
        date: travelDate,
        cabinClass,
        channels: selectedChannels,
      };
      return api.createAlert(payload);
    },
    onSuccess: (newAlert: any) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      triggerToast(`Price alert activated for ${newAlert.origin} → ${newAlert.destination}!`);
    },
    onError: () => {
      triggerToast('Could not create price alert. Please try again.');
    }
  });

  // Mutation: Toggle Alert Active/Paused
  const toggleAlertMutation = useMutation({
    mutationFn: (id: string) => api.toggleAlertStatus(id),
    onSuccess: (updated: any) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      if (updated) {
        triggerToast(`Alert for ${updated.origin} → ${updated.destination} is now ${updated.status}.`);
      }
    }
  });

  // Mutation: Simulate Trigger
  const triggerSimulationMutation = useMutation({
    mutationFn: (id: string) => api.triggerAlertSimulation(id),
    onSuccess: (triggered: any) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      if (triggered) {
        triggerToast(`🎯 Price drop simulated! Fare reached ₹${triggered.currentFare} for ${triggered.origin} → ${triggered.destination}!`);
      }
    }
  });

  // Mutation: Delete Alert
  const deleteAlertMutation = useMutation({
    mutationFn: (id: string) => api.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      triggerToast('Price alert deleted.');
    }
  });

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert: any) => {
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'active' ? alert.status === 'Active' :
        activeTab === 'triggered' ? alert.status === 'Triggered' :
        alert.status === 'Paused';

      const matchesSearch = 
        !searchFilter.trim() ||
        alert.origin?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        alert.destination?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        alert.route?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        alert.airline?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        getAirport(alert.origin).city.toLowerCase().includes(searchFilter.toLowerCase()) ||
        getAirport(alert.destination).city.toLowerCase().includes(searchFilter.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [alerts, activeTab, searchFilter]);

  // Metric Stats Computations
  const stats = useMemo(() => {
    const total = alerts.length;
    const active = alerts.filter((a: any) => a.status === 'Active').length;
    const triggered = alerts.filter((a: any) => a.status === 'Triggered').length;
    const savings = alerts.reduce((acc: number, curr: any) => {
      const diff = (curr.currentFare || 5200) - curr.targetPrice;
      return acc + (diff > 0 ? diff : 0);
    }, 0);

    return { total, active, triggered, savings };
  }, [alerts]);

  // AI Recommended Smart Alerts
  const aiRecommendations = [
    {
      origin: 'DEL',
      destination: 'GOI',
      airline: 'IndiGo (6E)',
      currentFare: 6150,
      recommendedTarget: 5200,
      dropPercent: 15,
      confidence: 91,
      reason: 'Weekend tourist wave cooling off. Seat availability surges in 48h.',
    },
    {
      origin: 'BOM',
      destination: 'BLR',
      airline: 'Akasa Air (QP)',
      currentFare: 4280,
      recommendedTarget: 3850,
      dropPercent: 10,
      confidence: 88,
      reason: 'Low-cost carrier capacity expansion on mid-day departures.',
    },
    {
      origin: 'DEL',
      destination: 'BOM',
      airline: 'Air India (AI)',
      currentFare: 5420,
      recommendedTarget: 4850,
      dropPercent: 11,
      confidence: 94,
      reason: 'Golden corporate corridor mid-week inventory clearance window.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-7 max-w-[1400px] mx-auto pb-12">
        
        {/* ── 1. Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-[#1788FF]/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(0,163,255,0.25)]">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090A0F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Price Alerts</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Radio size={11} className="animate-pulse" /> 5s Live Engine
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Autonomous high-frequency corridor price watchers. Instant notifications via Email, Push, WhatsApp & Discord.
              </p>
            </div>
          </div>

          {/* Quick Status Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const firstActive = alerts.find((a: any) => a.status === 'Active');
                if (firstActive) {
                  triggerSimulationMutation.mutate(firstActive.id);
                } else {
                  triggerToast('No active alerts to simulate. Create one below!');
                }
              }}
              disabled={triggerSimulationMutation.isPending}
              className="px-4 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(0,217,255,0.25)]"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Simulate Price Drop</span>
            </button>
          </div>
        </div>

        {/* ── Toast Notification Banner ── */}
        {toastMessage && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-medium shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="flex-1">{toastMessage}</span>
          </div>
        )}

        {/* ── 2. Top Summary Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#090A0F]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Active Watchers</span>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.active} <span className="text-xs font-normal text-slate-400">/ {stats.total} total</span>
            </div>
            <p className="text-[11px] text-cyan-400/90 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck size={12} /> Real-time corridor telemetry
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090A0F]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Deals Ready</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">READY</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
              {stats.triggered}
            </div>
            <p className="text-[11px] text-emerald-300/90 mt-1 flex items-center gap-1 font-medium">
              <TrendingDown size={12} /> Target fare reached or surpassed
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090A0F]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Potential Savings</span>
              <DollarSign size={14} className="text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ₹{stats.savings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Tag size={12} className="text-blue-400" /> Across monitored routes
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090A0F]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Ingestion Cycle</span>
              <Clock size={14} className="text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-300 tracking-tight">
              5 Sec
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> Continuous DGCA & GDS sweeps
            </p>
          </div>
        </div>

        {/* ── 3. High-Tech Alert Creation Engine ── */}
        <div className="p-6 sm:p-7 rounded-[28px] bg-[#0E1017]/90 border border-white/[0.12] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#1788FF] to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                <Plus size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Create Smart Fare Monitor</h2>
                <p className="text-xs text-slate-400">Set route, specify target price, and let our engine notify you instantly.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>{showAdvanced ? 'Hide Filters' : 'Advanced Filters'}</span>
            </button>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            
            {/* Origin Airport */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Origin Airport
              </label>
              <div className="relative">
                <select
                  value={origin}
                  onChange={(e) => {
                    const newOrigin = e.target.value;
                    setOrigin(newOrigin);
                    if (newOrigin === destination) {
                      setDestination(newOrigin === 'DEL' ? 'BOM' : 'DEL');
                    }
                  }}
                  className="w-full h-[48px] bg-[#161824] border border-white/[0.1] rounded-2xl px-4 text-sm font-semibold text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
                >
                  {INDIAN_AIRPORTS.map((airport) => (
                    <option key={airport.code} value={airport.code} className="bg-[#090A0F] text-white">
                      {airport.city} ({airport.code}) — {airport.name.slice(0, 24)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-1 flex justify-center pb-1">
              <button
                type="button"
                onClick={handleSwapAirports}
                className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-cyan-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Swap Departure and Arrival"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>

            {/* Destination Airport */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Destination Airport
              </label>
              <div className="relative">
                <select
                  value={destination}
                  onChange={(e) => {
                    const newDest = e.target.value;
                    setDestination(newDest);
                    if (newDest === origin) {
                      setOrigin(newDest === 'BOM' ? 'DEL' : 'BOM');
                    }
                  }}
                  className="w-full h-[48px] bg-[#161824] border border-white/[0.1] rounded-2xl px-4 text-sm font-semibold text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
                >
                  {INDIAN_AIRPORTS.filter(a => a.code !== origin).map((airport) => (
                    <option key={airport.code} value={airport.code} className="bg-[#090A0F] text-white">
                      {airport.city} ({airport.code}) — {airport.name.slice(0, 24)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Price */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Price (₹)
                </label>
                <span className="text-[11px] text-cyan-400 font-semibold">
                  Live: ₹{currentLiveFare.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 4500"
                  className="w-full h-[48px] bg-[#161824] border border-white/[0.1] rounded-2xl pl-8 pr-4 text-sm font-bold text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => createAlertMutation.mutate(undefined)}
                disabled={createAlertMutation.isPending || !targetPrice}
                className="w-full h-[48px] rounded-2xl bg-gradient-to-r from-cyan-500 via-[#00A3FF] to-[#0070F3] hover:shadow-[0_0_25px_rgba(0,163,255,0.45)] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-60"
              >
                {createAlertMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Set Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Target Preset Chips & Projected Savings */}
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Quick Target Presets:</span>
              {[
                { percent: 5, label: '-5% Dip' },
                { percent: 10, label: '-10% Drop (Recommended)' },
                { percent: 15, label: '-15% Great Deal' },
                { percent: 20, label: '-20% Deep Discount' },
              ].map((chip) => {
                const isSelected = discountPercent === chip.percent;
                const calcPrice = Math.round(currentLiveFare * (1 - chip.percent / 100));
                return (
                  <button
                    key={chip.percent}
                    type="button"
                    onClick={() => handlePresetClick(chip.percent)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,217,255,0.4)]'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]'
                    }`}
                  >
                    {chip.label} (₹{calcPrice.toLocaleString('en-IN')})
                  </button>
                );
              })}
            </div>

            {/* Savings preview badge */}
            {targetPrice && Number(targetPrice) < currentLiveFare && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <TrendingDown size={14} />
                <span>
                  Projected Savings: ₹{(currentLiveFare - Number(targetPrice)).toLocaleString('en-IN')} per passenger ({Math.round(((currentLiveFare - Number(targetPrice)) / currentLiveFare) * 100)}% drop)
                </span>
              </div>
            )}
          </div>

          {/* Advanced Options Drawer */}
          {showAdvanced && (
            <div className="mt-5 pt-5 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Airline filter */}
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Preferred Airline</label>
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className="w-full h-[42px] bg-[#161824] border border-white/[0.1] rounded-xl px-3 text-xs text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Any Airline">Any Airline (Cheapest)</option>
                  <option value="IndiGo (6E)">IndiGo (6E)</option>
                  <option value="Air India (AI)">Air India (AI)</option>
                  <option value="Vistara (UK)">Vistara (UK)</option>
                  <option value="Akasa Air (QP)">Akasa Air (QP)</option>
                  <option value="SpiceJet (SG)">SpiceJet (SG)</option>
                </select>
              </div>

              {/* Travel date */}
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full h-[42px] bg-[#161824] border border-white/[0.1] rounded-xl px-3 text-xs text-white outline-none focus:border-cyan-400 cursor-pointer"
                />
              </div>

              {/* Cabin class */}
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Cabin Class</label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full h-[42px] bg-[#161824] border border-white/[0.1] rounded-xl px-3 text-xs text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              {/* Alert channels */}
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Alert Dispatch Channels</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'Email', icon: Mail },
                    { id: 'Push Notification', icon: Smartphone },
                    { id: 'WhatsApp', icon: MessageSquare },
                  ].map((chan) => {
                    const isSelected = selectedChannels.includes(chan.id);
                    const IconComp = chan.icon;
                    return (
                      <button
                        key={chan.id}
                        type="button"
                        onClick={() => toggleChannel(chan.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-white/[0.04] text-slate-400 border border-white/[0.08]'
                        }`}
                      >
                        <IconComp size={12} />
                        <span>{chan.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ── 4. AI Recommended Smart Alerts ── */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">AI Smart Recommendations</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                High Drop Probability
              </span>
            </div>
            <span className="text-xs text-slate-400">Based on historical demand curves & capacity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiRecommendations.map((rec, i) => (
              <div 
                key={i}
                className="p-4.5 rounded-2xl bg-[#090A0F]/80 border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <span>{rec.origin}</span>
                      <ArrowRight size={13} className="text-slate-500" />
                      <span>{rec.destination}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                      -{rec.dropPercent}% Dip
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {rec.reason}
                  </p>

                  <div className="flex items-center justify-between text-xs py-2 border-t border-white/[0.06] mb-3">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Current Fare</span>
                      <span className="text-slate-300 font-semibold line-through">₹{rec.currentFare.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Projected Target</span>
                      <span className="text-cyan-400 font-bold text-sm">₹{rec.recommendedTarget.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    createAlertMutation.mutate({
                      origin: rec.origin,
                      destination: rec.destination,
                      route: `${rec.origin}-${rec.destination}`,
                      targetPrice: rec.recommendedTarget,
                      currentFare: rec.currentFare,
                      airline: rec.airline,
                      channels: ['Email', 'Push Notification'],
                    });
                  }}
                  disabled={createAlertMutation.isPending}
                  className="w-full py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={13} />
                  <span>Set Alert at ₹{rec.recommendedTarget.toLocaleString('en-IN')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. Active Alerts Management Table ── */}
        <div className="rounded-[28px] bg-[#0E1017]/90 border border-white/[0.12] backdrop-blur-2xl shadow-2xl overflow-hidden">
          
          {/* Table Header Controls */}
          <div className="p-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#161824] p-1 rounded-xl border border-white/[0.06]">
              {[
                { id: 'all' as const, label: 'All Monitors', count: alerts.length },
                { id: 'active' as const, label: 'Active', count: alerts.filter((a: any) => a.status === 'Active').length },
                { id: 'triggered' as const, label: 'Deals Ready', count: alerts.filter((a: any) => a.status === 'Triggered').length },
                { id: 'paused' as const, label: 'Paused', count: alerts.filter((a: any) => a.status === 'Paused').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-black shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search within alerts */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by city, code, airline..."
                className="w-full h-[38px] bg-[#161824] border border-white/[0.08] rounded-xl pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Alerts Cards List */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-xs">Loading corridor monitors...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
                <Bell size={22} />
              </div>
              <h3 className="text-white font-bold text-sm">No price alerts found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {searchFilter ? 'No alerts match your search filter.' : 'You have not set any price monitors yet. Use the form above to track live route fares.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filteredAlerts.map((alert: any) => {
                const originInfo = getAirport(alert.origin || alert.route?.split('-')[0]);
                const destInfo = getAirport(alert.destination || alert.route?.split('-')[1]);
                const currentFare = alert.currentFare || api.getEstimatedRouteFare(originInfo.code, destInfo.code);
                const target = alert.targetPrice;
                const isTriggered = alert.status === 'Triggered' || currentFare <= target;
                const priceDiff = currentFare - target;
                const proximityPercent = Math.min(100, Math.max(0, Math.round(((target) / currentFare) * 100)));

                return (
                  <div 
                    key={alert.id}
                    className="p-5 hover:bg-white/[0.02] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    {/* Left: Route details */}
                    <div className="flex items-start gap-4 min-w-[280px]">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isTriggered
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : alert.status === 'Paused'
                            ? 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                            : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                      }`}>
                        <Plane size={18} className={isTriggered ? 'animate-bounce' : ''} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-sm tracking-tight">
                            {originInfo.city} ({originInfo.code})
                          </h4>
                          <ArrowRight size={13} className="text-slate-500" />
                          <h4 className="text-white font-bold text-sm tracking-tight">
                            {destInfo.city} ({destInfo.code})
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                          <span>{alert.airline || 'Any Domestic Carrier'}</span>
                          <span>•</span>
                          <span>{alert.cabinClass || 'Economy'}</span>
                          {alert.date && (
                            <>
                              <span>•</span>
                              <span>{alert.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Price Proximity Meter */}
                    <div className="flex-1 max-w-md">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400">
                          Target: <strong className="text-white">₹{target.toLocaleString('en-IN')}</strong>
                        </span>
                        <span className="text-slate-400">
                          Current: <strong className={isTriggered ? 'text-emerald-400' : 'text-cyan-400'}>₹{currentFare.toLocaleString('en-IN')}</strong>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTriggered 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                              : 'bg-gradient-to-r from-[#1788FF] to-cyan-400'
                          }`}
                          style={{ width: `${isTriggered ? 100 : proximityPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] mt-1.5">
                        {isTriggered ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Target Met! Fare is ₹{Math.abs(priceDiff).toLocaleString('en-IN')} below target
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            ₹{priceDiff.toLocaleString('en-IN')} drop needed to trigger
                          </span>
                        )}

                        <span className="text-slate-500 text-[10px]">
                          Checked live
                        </span>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center gap-2.5 self-end lg:self-center">
                      
                      {/* Status badge */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        isTriggered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                          : alert.status === 'Paused'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {isTriggered ? 'Deal Ready' : alert.status || 'Active'}
                      </span>

                      {/* Book Flight link if triggered */}
                      {isTriggered && (
                        <button
                          type="button"
                          onClick={() => navigate(`/search?from=${originInfo.code}&to=${destInfo.code}`)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        >
                          <span>Book Now</span>
                          <ExternalLink size={12} />
                        </button>
                      )}

                      {/* Toggle Pause / Resume */}
                      <button
                        type="button"
                        onClick={() => toggleAlertMutation.mutate(alert.id)}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all cursor-pointer"
                        title={alert.status === 'Active' ? 'Pause Alert' : 'Resume Alert'}
                      >
                        {alert.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete Alert"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}
