import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../context/AppProvider';

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useAppContext();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(5,20,52,0.75)] backdrop-blur-md border border-blue-500/30 text-slate-300 hover:text-white hover:border-blue-500/50 transition-all text-sm font-medium shadow-[0_0_15px_rgba(23,136,255,0.15)]"
      >
        <span className="text-base leading-none">🇮🇳</span>
        {language}
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 bg-[#061A42] border border-blue-500/30 rounded-lg shadow-xl overflow-hidden z-50">
          <button
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-500/20"
            onClick={() => { setLanguage('English'); setIsOpen(false); }}
          >
            🇮🇳 English
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-blue-500/20"
            onClick={() => { setLanguage('Hindi'); setIsOpen(false); }}
          >
            🇮🇳 Hindi
          </button>
        </div>
      )}
    </div>
  );
}
