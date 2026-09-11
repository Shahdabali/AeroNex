import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 flex font-['Inter',sans-serif] transition-colors relative overflow-hidden">
      {/* High-Performance Clean Cosmic Intelligence Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none stars-bg opacity-20" />
      <div className="nebula-bg" />
      <div className="absolute inset-0 z-0 pointer-events-none tech-grid-bg opacity-15" />

      
      <div className="z-10 relative flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-[280px]">
          <Header />
          <main className="flex-1 p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
