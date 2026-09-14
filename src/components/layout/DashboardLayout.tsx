import { type ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Menu } from 'lucide-react';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 flex font-['Inter',sans-serif] transition-colors relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none stars-bg opacity-20" />
      <div className="nebula-bg" />
      <div className="absolute inset-0 z-0 pointer-events-none tech-grid-bg opacity-15" />

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="z-10 relative flex w-full">
        {/* Sidebar — fixed on desktop, drawer on mobile */}
        <div
          className={`fixed left-0 top-0 h-screen z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content — shifts right on desktop */}
        <div className="flex-1 flex flex-col lg:ml-[260px] min-w-0">
          {/* Mobile header row with hamburger */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#090A0F] border-b border-white/[0.06] sticky top-0 z-20">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-white font-bold text-sm tracking-wide">AeroNex</span>
          </div>

          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
