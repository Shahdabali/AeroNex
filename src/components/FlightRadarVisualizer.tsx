import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, Radio, Activity, TrendingUp, ShieldCheck } from 'lucide-react';

interface FlightRadarProps {
  className?: string;
}

// Major Indian Aviation Hubs coordinates normalized to percentage canvas (0-100)
const INDIAN_HUBS = [
  { code: 'DEL', name: 'New Delhi (IGI)', x: 38, y: 28, lat: '28.55°N', lon: '77.10°E' },
  { code: 'BOM', name: 'Mumbai (CSMIA)', x: 26, y: 56, lat: '19.08°N', lon: '72.86°E' },
  { code: 'BLR', name: 'Bengaluru (KIA)', x: 38, y: 76, lat: '13.19°N', lon: '77.70°E' },
  { code: 'HYD', name: 'Hyderabad (RGIA)', x: 44, y: 62, lat: '17.24°N', lon: '78.42°E' },
  { code: 'CCU', name: 'Kolkata (NSCBIA)', x: 74, y: 44, lat: '22.65°N', lon: '88.44°E' },
  { code: 'MAA', name: 'Chennai (MAA)', x: 49, y: 78, lat: '12.99°N', lon: '80.17°E' },
  { code: 'GOI', name: 'Goa (Dabolim)', x: 28, y: 68, lat: '15.38°N', lon: '73.83°E' },
];

// Active flight routes with paths and cruise data
const FLIGHT_ROUTES = [
  { id: 'AN-102', from: 'DEL', to: 'BOM', fare: '₹4,120', trend: '+1.8%', d: 'M 38 28 Q 30 40 26 56', duration: 7 },
  { id: 'AN-408', from: 'BOM', to: 'BLR', fare: '₹3,450', trend: '-2.4%', d: 'M 26 56 Q 30 68 38 76', duration: 8.5 },
  { id: 'AN-712', from: 'DEL', to: 'BLR', fare: '₹5,890', trend: '+3.1%', d: 'M 38 28 Q 42 52 38 76', duration: 9 },
  { id: 'AN-206', from: 'DEL', to: 'CCU', fare: '₹4,780', trend: '+0.9%', d: 'M 38 28 Q 58 32 74 44', duration: 7.5 },
  { id: 'AN-550', from: 'HYD', to: 'BLR', fare: '₹2,690', trend: '-1.2%', d: 'M 44 62 Q 40 70 38 76', duration: 6 },
];

export function FlightRadarVisualizer({ className = '' }: FlightRadarProps) {
  // Dynamic 5s cycle ticker state
  const [pulseCount, setPulseCount] = useState(1);
  const [activeFares, setActiveFares] = useState({
    nationalIndex: 5240,
    change: 2.4,
    trackedFlights: 125482,
    activeRoutes: 1280
  });

  useEffect(() => {
    // 5s Live Ticker Cycle
    const timer = setInterval(() => {
      setPulseCount((prev) => prev + 1);
      setActiveFares((prev) => {
        const delta = (Math.random() * 8 - 4);
        const newIndex = Math.max(4800, Math.round(prev.nationalIndex + delta));
        const newFlights = prev.trackedFlights + Math.floor(Math.random() * 7) - 3;
        return {
          nationalIndex: newIndex,
          change: +(prev.change + (delta > 0 ? 0.05 : -0.05)).toFixed(1),
          trackedFlights: newFlights,
          activeRoutes: 1280 + (Math.random() > 0.5 ? 1 : 0)
        };
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[460px] overflow-hidden select-none pointer-events-none ${className}`}>
      
      {/* 1. Radar Grid & Coordinate Axes */}
      <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="radarGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.3" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#1788FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Grid pattern background */}
        <rect width="100" height="100" fill="url(#radarGrid)" />

        {/* Radar Range Rings (Concentric Circles centered around Western/Central India) */}
        <circle cx="36" cy="54" r="16" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="0.35" strokeDasharray="1 2" />
        <circle cx="36" cy="54" r="28" fill="none" stroke="rgba(34, 211, 238, 0.16)" strokeWidth="0.35" strokeDasharray="1.5 2.5" />
        <circle cx="36" cy="54" r="42" fill="none" stroke="rgba(34, 211, 238, 0.12)" strokeWidth="0.35" strokeDasharray="2 3" />
        <circle cx="36" cy="54" r="56" fill="none" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="0.3" />

        {/* Center Crosshair */}
        <line x1="36" y1="46" x2="36" y2="62" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="0.4" />
        <line x1="28" y1="54" x2="44" y2="54" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="0.4" />

        {/* Animated Flight Trajectory Curves */}
        {FLIGHT_ROUTES.map((route) => (
          <g key={route.id}>
            {/* Glowing Underlying Flight Path */}
            <path
              d={route.d}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="0.75"
              strokeDasharray="2 2"
              className="opacity-70 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]"
            />
          </g>
        ))}
      </svg>

      {/* 2. Rotating Radar Sweep Line */}
      <div 
        className="absolute top-[54%] left-[36%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none opacity-40 mix-blend-screen overflow-hidden"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(34, 211, 238, 0.35) 0deg, rgba(23, 136, 255, 0.08) 45deg, transparent 60deg, transparent 360deg)',
          animation: 'radar-sweep 8s linear infinite',
        }}
      />

      {/* 3. Interactive Jetliner Glyphs Cruising Along Trajectories */}
      {FLIGHT_ROUTES.map((route, idx) => (
        <motion.div
          key={route.id}
          animate={{
            offsetDistance: ['0%', '100%'],
          }}
          transition={{
            duration: route.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: idx * 1.6,
          }}
          style={{
            offsetPath: `path("${route.d}")`,
            offsetRotate: 'auto',
          }}
          className="absolute z-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative group cursor-pointer pointer-events-auto">
            <div className="w-5 h-5 rounded-full bg-cyan-400/20 backdrop-blur-sm border border-cyan-400/80 flex items-center justify-center shadow-[0_0_12px_#22d3ee]">
              <Plane size={11} className="text-white fill-white transform rotate-90" />
            </div>
            {/* Live Jet Tag on Hover */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#020A1D]/90 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 whitespace-nowrap shadow-md hidden sm:block">
              {route.id} • {route.fare}
            </div>
          </div>
        </motion.div>
      ))}

      {/* 4. Airport Radar Hub Nodes */}
      {INDIAN_HUBS.map((hub) => (
        <div
          key={hub.code}
          style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto group cursor-pointer"
        >
          {/* IATA Code Pill */}
          <span className="text-[10px] font-black text-white font-mono bg-[#030C22]/90 px-2 py-0.5 rounded-md border border-cyan-500/40 shadow-lg backdrop-blur-md transition-all group-hover:border-cyan-300 group-hover:scale-105">
            {hub.code}
          </span>

          {/* Pulsing Beacon Node */}
          <div className="relative mt-1 w-3 h-3 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 block shadow-[0_0_10px_#22d3ee]" />
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 absolute inset-0 animate-ping opacity-70" />
          </div>

          {/* Coordinates Tooltip */}
          <span className="text-[8px] font-mono text-slate-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 px-1 rounded whitespace-nowrap hidden sm:block">
            {hub.lat} {hub.lon}
          </span>
        </div>
      ))}

      {/* 5. Floating Live Flight Telemetry HUD Card (5s Real-Time Sync) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-4 left-6 z-30 bg-[#040E26]/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] max-w-[280px] pointer-events-auto border-t-cyan-400/60"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Radio size={13} className="text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
              Live Airfare Ticker
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 px-1.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            5s SYNC
          </span>
        </div>

        {/* Metric 1: National Index */}
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[11px] text-slate-400">National Index</span>
          <div className="flex items-baseline gap-1.5">
            <motion.span 
              key={pulseCount} 
              initial={{ opacity: 0.5, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-black text-white font-mono"
            >
              ₹{activeFares.nationalIndex.toLocaleString()}
            </motion.span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center">
              <TrendingUp size={10} className="inline mr-0.5" />
              +{activeFares.change}%
            </span>
          </div>
        </div>

        {/* Metric 2: Monitored Flights */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="text-[11px]">Tracked Flights</span>
          <span className="font-mono text-cyan-300 font-semibold text-[11px]">
            {activeFares.trackedFlights.toLocaleString()}
          </span>
        </div>

        {/* Dynamic 5s Frequency Bars Visualization */}
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-700/40">
          <div className="flex items-center gap-0.5 h-4 flex-1">
            {[40, 70, 95, 60, 85, 50, 90, 75, 60, 80, 45, 90].map((height, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [`${height}%`, `${Math.max(20, (height + pulseCount * 17) % 100)}%`, `${height}%`],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
                className="flex-1 bg-gradient-to-t from-cyan-500 to-[#1788FF] rounded-full"
              />
            ))}
          </div>
          <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1 pl-2">
            <Activity size={11} className="text-[#1788FF]" />
            5s Realtime
          </div>
        </div>
      </motion.div>

      {/* 6. Top Right Radar Status Pill */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-2 bg-[#020A1D]/80 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/30 shadow-md pointer-events-auto">
        <ShieldCheck size={13} className="text-emerald-400" />
        <span className="text-[10px] font-bold text-slate-300">
          DGCA • AAI Monitored Corridors
        </span>
      </div>

    </div>
  );
}
