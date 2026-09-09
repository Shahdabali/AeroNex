import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020A1D] flex font-['Inter',sans-serif]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[280px]">
        <Header />
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
