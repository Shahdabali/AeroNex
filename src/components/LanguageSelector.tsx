import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppProvider';

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useAppContext();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="lang-selector-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A1838]/85 hover:bg-[#0E204A] border border-slate-700/80 hover:border-slate-500 shadow-md backdrop-blur-md text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
      >
        <span className="text-sm">🇮🇳</span>
        <span>{language}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          role="menu"
          className="lang-selector-menu absolute right-0 top-full mt-2 w-40 bg-[#0A1838] border border-slate-700 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2"
        >
          <button
            type="button"
            role="menuitem"
            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              language === 'English' ? 'bg-[#1788FF]/20 text-[#1788FF]' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => { setLanguage('English'); setIsOpen(false); }}
          >
            <span>🇮🇳</span> English
          </button>
          <button
            type="button"
            role="menuitem"
            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              language === 'Hindi' ? 'bg-[#1788FF]/20 text-[#1788FF]' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => { setLanguage('Hindi'); setIsOpen(false); }}
          >
            <span>🇮🇳</span> हिन्दी (Hindi)
          </button>
        </div>
      )}
    </div>
  );
}
