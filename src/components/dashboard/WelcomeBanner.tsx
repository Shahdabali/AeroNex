import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export function WelcomeBanner() {
  const { data: freshness } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    staleTime: 6000,
  });

  const [elapsedSec, setElapsedSec] = useState(0);
  const [justUpdated, setJustUpdated] = useState(false);
  const prevTicksRef = useRef<number | undefined>(undefined);

  // Measure authentic seconds since last data packet
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When fresh data arrives, reset the elapsed timer and briefly show pulse
  useEffect(() => {
    if (freshness) {
      setElapsedSec(0);
      if (prevTicksRef.current !== undefined && prevTicksRef.current !== freshness.ticks) {
        setJustUpdated(true);
        const timeout = setTimeout(() => setJustUpdated(false), 1400);
        return () => clearTimeout(timeout);
      }
      prevTicksRef.current = freshness.ticks;
    }
  }, [freshness]);

  const now = new Date();
  const isLive = elapsedSec < 25;
  const isStale = elapsedSec >= 60;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[#0A0C13] border border-white/[0.08] shadow-lg p-6 sm:p-7 hover-lift">
      {/* High-Performance Clean Subtle Ambient Mesh */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-950/15 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            {isStale ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold font-mono tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                STALE TELEMETRY · Last update {Math.floor(elapsedSec / 60)}m ago
              </span>
            ) : (
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-bold font-mono tracking-wider transition-colors ${
                justUpdated 
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                  : isLive 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${justUpdated ? 'bg-cyan-400 animate-ping' : isLive ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                {justUpdated ? '↑ NEW DATA TICK' : isLive ? `● LIVE · Updated ${elapsedSec}s ago` : `SYNCED · Updated ${elapsedSec}s ago`}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
            India Airfare <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence</span>
          </h1>
          
          <p className="text-sm text-zinc-400 max-w-xl">
            Real-time analytical view of India's domestic airfare market for CPI augmentation.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Last Updated
          </span>
          <span className="text-[13px] font-mono text-zinc-300 tabular-nums">
            {format(now, "dd MMMM yyyy · hh:mm a 'IST'")}
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-cyan-400/90 font-mono">
            <Activity size={12} className={isLive ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>{freshness?.status === 'live' ? 'DGCA Basket Feed Connected' : 'Syncing Engine...'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
