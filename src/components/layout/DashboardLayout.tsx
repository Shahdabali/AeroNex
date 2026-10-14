import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppContext } from '../../context/AppProvider';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { theme } = useAppContext();
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.classList.contains('light'));

  return (
    <div className={`min-h-screen flex font-['Inter',sans-serif] transition-colors relative overflow-hidden ${
      isLight ? 'bg-[#F8FAFC] text-slate-800' : 'bg-[#090A0F] text-zinc-100'
    }`}>
      {/* Background in dark mode */}
      {!isLight && (
        <>
          <div className="absolute inset-0 z-0 pointer-events-none stars-bg opacity-20" />
          <div className="nebula-bg" />
          <div className="absolute inset-0 z-0 pointer-events-none tech-grid-bg opacity-15" />
        </>
      )}

      <div className="z-10 relative flex w-full">
        {/* Sidebar — Ribbon on mobile, full on desktop */}
        <div className="fixed left-0 top-0 h-screen z-40">
          <Sidebar />
        </div>

        {/* Main content — shifts right on mobile (64px) and desktop (260px) */}
        <div className="flex-1 flex flex-col ml-[64px] lg:ml-[260px] min-w-0 transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
