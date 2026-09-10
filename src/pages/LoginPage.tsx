import { motion } from 'framer-motion';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { LoginCard } from '../components/LoginCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { LineChart, Calendar, Repeat, Plane } from 'lucide-react';

export function LoginPage() {
  usePageTitle('Sign In — AERONEX');

  return (
    <div className="login-page-bg min-h-screen w-full bg-[#020A1D] relative overflow-hidden flex flex-col font-['Inter',sans-serif] select-none transition-colors duration-300">
      
      {/* 1. Cinematic Airplane Wing over Golden Sunset Cloudscape */}
      <div 
        className="login-bg-image absolute inset-0 pointer-events-none z-0 bg-cover bg-center sm:bg-right opacity-90 transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/assets/login-hero-clean.jpg)',
        }}
      />

      {/* Atmospheric Overlays: Deep Twilight Blue on Left smoothly blending into sunset clouds */}
      <div className="login-gradient-overlay absolute inset-0 bg-gradient-to-r from-[#02091B]/95 via-[#02091B]/70 to-[#02091B]/40 pointer-events-none z-0 transition-all duration-300" />
      
      {/* Ambient Glow Orbs */}
      <div className="login-ambient-orb absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-[#00A3FF]/15 rounded-full blur-[140px] pointer-events-none z-0 transition-opacity duration-300" />
      <div className="login-ambient-orb absolute bottom-[10%] right-[25%] w-[450px] h-[450px] bg-[#4E55F5]/10 rounded-full blur-[130px] pointer-events-none z-0 transition-opacity duration-300" />

      {/* Top Header Bar */}
      <header className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-14 pt-6 pb-2 flex items-center justify-between relative z-30">
        {/* Brand in Top Left (Desktop & Mobile) */}
        <div>
          <AeroNexLogo size={42} showTagline={true} />
        </div>

        {/* Top Right Controls: Theme Toggle + Language Selector */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content Container matching reference mockup */}
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-14 flex-1 flex flex-col lg:flex-row items-center justify-between relative z-20 py-4 lg:py-6 gap-8">
        
        {/* LEFT COLUMN: HERO INFORMATION */}
        <div className="w-full lg:w-[50%] flex flex-col justify-center h-full relative z-20 py-4">
          
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="login-hero-headline text-[38px] sm:text-[48px] lg:text-[54px] font-black text-white leading-[1.08] tracking-tight">
              Track fares.<br />
              Understand<br />
              trends. <span className="text-[#00D2FF]">Travel</span><br />
              <span className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#818CF8] bg-clip-text text-transparent login-headline-gradient">
                smarter.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="login-hero-subtitle text-slate-300 text-[15px] sm:text-[16px] leading-relaxed max-w-md mt-4 transition-colors duration-300">
              AI-powered flight suggestions, best time to book, and return flight insights — all in one place.
            </p>
          </motion.div>

          {/* 3 Feature Cards Row (Side-by-Side as in reference image) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 max-w-lg"
          >
            {/* 1. National Airfare Index */}
            <div className="login-feature-card flex flex-col items-start p-3.5 rounded-2xl bg-[#0E1017]/80 backdrop-blur-md border border-white/[0.08] shadow-lg group hover:border-cyan-400/50 transition-all cursor-default">
              <div className="login-feature-icon w-10 h-10 rounded-xl bg-[#161822] border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-105 transition-transform">
                <LineChart size={19} />
              </div>
              <span className="login-feature-title text-white font-bold text-xs sm:text-[13px] mt-3 leading-tight block">
                Airfare Index
              </span>
              <span className="login-feature-desc text-zinc-400 text-[10px] sm:text-[11px] mt-1 leading-snug block">
                Real-time DGCA benchmarks
              </span>
            </div>

            {/* 2. Best Time to Book */}
            <div className="login-feature-card flex flex-col items-start p-3.5 rounded-2xl bg-[#061434]/80 backdrop-blur-md border border-blue-500/20 shadow-lg group hover:border-cyan-400/50 transition-all cursor-default">
              <div className="login-feature-icon w-10 h-10 rounded-xl bg-[#0F2454] border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-105 transition-transform">
                <Calendar size={19} />
              </div>
              <span className="login-feature-title text-white font-bold text-xs sm:text-[13px] mt-3 leading-tight block">
                Best Time to Book
              </span>
              <span className="login-feature-desc text-slate-400 text-[10px] sm:text-[11px] mt-1 leading-snug block">
                Save more with AI insights
              </span>
            </div>

            {/* 3. Return Flight Optimizer */}
            <div className="login-feature-card flex flex-col items-start p-3.5 rounded-2xl bg-[#061434]/80 backdrop-blur-md border border-blue-500/20 shadow-lg group hover:border-cyan-400/50 transition-all cursor-default">
              <div className="login-feature-icon w-10 h-10 rounded-xl bg-[#0F2454] border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-105 transition-transform">
                <Repeat size={19} />
              </div>
              <span className="login-feature-title text-white font-bold text-xs sm:text-[13px] mt-3 leading-tight block">
                Return Flight Optimizer
              </span>
              <span className="login-feature-desc text-slate-400 text-[10px] sm:text-[11px] mt-1 leading-snug block">
                Get the best time & price
              </span>
            </div>
          </motion.div>

          {/* Script Callout Accent with Swoop Arrow & Jet */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="mt-8 flex items-center gap-3 select-none"
          >
            <span className="login-script-text font-['Caveat',cursive] text-[28px] sm:text-[32px] text-[#38BDF8] font-bold leading-[1.05] drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              Your Next Trip<br />Starts Here
            </span>
            <div className="relative w-16 h-8 flex items-center -ml-1">
              <svg className="login-script-arrow w-16 h-8 text-[#38BDF8]" viewBox="0 0 70 30" fill="none">
                <path d="M 5 22 Q 35 28 55 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 3" />
              </svg>
              <Plane size={18} className="login-script-plane text-[#38BDF8] fill-[#38BDF8] transform -rotate-12 absolute right-0 top-0" />
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: LOGIN CARD (approx 50%) */}
        <div className="w-full lg:w-[48%] flex justify-center lg:justify-end relative z-30">
          <LoginCard />
        </div>

      </div>
    </div>
  );
}
