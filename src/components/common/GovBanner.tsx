import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GovBannerProps {
  compact?: boolean;
}

export const GovBanner: React.FC<GovBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="w-full bg-[#0F2A4A] text-white px-4 py-1.5 flex items-center justify-between text-[11px] border-b border-[#1E3A8A]">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-amber-300 uppercase">SIH26056 • MoSPI Track</span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:inline text-slate-200">
            Real-Time Airfare Price Index for CPI Augmentation Research
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-400/30">
            Base: 2024 = 100
          </span>
          <Link to="/methodology" className="text-cyan-300 hover:text-white underline text-[10px]">
            Methodology & Provenance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#0F2A4A] text-amber-400 shrink-0 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-[#0F2A4A] dark:text-blue-300 tracking-tight">
                AeroNex National Airfare Intelligence Prototype
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                MoSPI SIH26056 Research
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Reference Base: 2024 = 100
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Automated high-frequency airfare observation, deterministic Laspeyres price-index calculation, and econometric anomaly analytics designed to augment the Consumer Price Index (CPI) transport group.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <Link
            to="/methodology"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Info size={13} />
            Statistical Methodology
          </Link>
          <Link
            to="/reports"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0F2A4A] hover:bg-[#1E3A8A] text-white transition-colors shadow-xs"
          >
            Generate Briefing
          </Link>
        </div>
      </div>
    </div>
  );
};
