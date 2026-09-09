import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="theme-toggle-btn flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A1838]/85 hover:bg-[#0E204A] border border-slate-700/80 hover:border-slate-500 shadow-lg backdrop-blur-md transition-all cursor-pointer group"
      aria-label="Toggle day and night mode"
      title={isDark ? 'Switch to Day Mode (Light)' : 'Switch to Cockpit Mode (Dark)'}
    >
      <Sun size={14} className={isDark ? "text-slate-400 group-hover:text-slate-200" : "text-amber-500"} />
      
      {/* Sliding track & circle knob */}
      <div className="theme-toggle-track w-10 h-4 bg-[#030B1E] border border-slate-700 rounded-full relative p-0.5 flex items-center transition-colors">
        <div 
          className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(23,136,255,0.9)] ring-2 transition-transform duration-200 ease-out ${
            isDark 
              ? 'translate-x-6 bg-[#1788FF] ring-[#1788FF]/30' 
              : 'translate-x-0 bg-amber-500 ring-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
          }`}
        />
      </div>

      <Moon size={14} className={isDark ? "text-[#1788FF]" : "text-slate-400 group-hover:text-slate-600"} />
    </button>
  );
}
