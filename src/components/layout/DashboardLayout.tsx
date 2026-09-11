import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 flex font-['Inter',sans-serif] transition-colors relative overflow-hidden">
      {/* Galaxy Theme Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none stars-bg mix-blend-screen" />
      <div className="nebula-bg" />
      <div className="absolute inset-0 z-0 pointer-events-none tech-grid-bg opacity-30" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-900/5 blur-[100px] pointer-events-none z-0 mix-blend-screen" />

      
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
