import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-1.5 p-1 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
        theme === 'light'
          ? 'bg-slate-100 border-slate-300 shadow-sm text-slate-700 hover:border-slate-400'
          : 'bg-[rgba(5,20,52,0.75)] border-blue-500/30 text-slate-300 hover:text-white shadow-[0_0_15px_rgba(23,136,255,0.15)]'
      }`}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to Day Mode (Light)' : 'Switch to Cockpit Mode (Dark)'}
    >
      <div
        className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
          theme === 'light' 
            ? 'bg-amber-500 text-white shadow-md scale-105' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sun size={16} />
      </div>
      <div
        className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
          theme === 'dark' 
            ? 'bg-[#1788FF] text-white shadow-[0_0_10px_rgba(23,136,255,0.5)] scale-105' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Moon size={16} />
      </div>
    </button>
  );
}
