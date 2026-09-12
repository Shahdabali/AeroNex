import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WelcomeBanner() {
  const { data: freshness, refetch, isFetching } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    staleTime: 6000,
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Title & Status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Data Pipeline: Operational
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 uppercase">
              DEMO MODE — Simulated Observations
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Reference: 2024 = 100
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#0F2A4A] dark:text-white tracking-tight">
            AeroNex National Airfare Intelligence
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl">
            Real-time airfare monitoring and price-index analytics for India — Designed for the Ministry of Statistics and Programme Implementation (MoSPI) to support high-frequency Consumer Price Index (CPI) transport group augmentation.
          </p>
        </div>

        {/* Right Controls & Dynamic Timestamp */}
        <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="text-slate-400">Last System Ingestion:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {freshness?.lastUpdatedAt ? new Date(freshness.lastUpdatedAt).toLocaleTimeString('en-IN') : currentTime}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <RefreshCw size={12} className={isFetching ? 'animate-spin text-blue-600' : ''} />
              {isFetching ? 'Refreshing...' : 'Refresh Pipeline'}
            </button>
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F2A4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <FileSpreadsheet size={13} />
              Generate Bulletin
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
