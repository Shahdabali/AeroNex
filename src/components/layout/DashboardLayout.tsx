import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GovBanner } from '../common/GovBanner';
import { Link } from 'react-router-dom';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#080D1A] text-slate-800 dark:text-slate-100 flex font-['Inter',sans-serif] transition-colors relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[260px] min-w-0">
        <GovBanner compact={true} />
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden max-w-[1600px] w-full">
          {children}
        </main>
        
        {/* Government Statistical Portal Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0A101D] px-8 py-5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 dark:text-slate-300">AeroNex Intelligence</span>
              <span>•</span>
              <span>MoSPI Smart India Hackathon Prototype (SIH26056)</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                DEMO MODE — Simulated Observations
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link to="/methodology" className="hover:text-blue-600 dark:hover:text-blue-400 underline">
                Methodology (Laspeyres 2024=100)
              </Link>
              <Link to="/data-sources" className="hover:text-blue-600 dark:hover:text-blue-400 underline">
                Data Provenance
              </Link>
              <Link to="/data-quality" className="hover:text-blue-600 dark:hover:text-blue-400 underline">
                Quality Audit
              </Link>
              <span>Built for NSO / MoSPI Research</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
