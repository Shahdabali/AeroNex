import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 p-1.5 rounded-full bg-[rgba(5,20,52,0.75)] backdrop-blur-md border border-blue-500/30 text-slate-300 hover:text-white transition-all shadow-[0_0_15px_rgba(23,136,255,0.15)]"
      aria-label="Toggle theme"
    >
      <div
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'light' ? 'bg-white text-blue-600' : 'text-slate-400'
        }`}
      >
        <Sun size={16} />
      </div>
      <div
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'dark' ? 'bg-blue-500 text-white' : 'text-slate-400'
        }`}
      >
        <Moon size={16} />
      </div>
    </button>
  );
}
