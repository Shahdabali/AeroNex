import { motion } from 'framer-motion';
import { Navigate, useLocation } from 'react-router-dom';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { LoginCard } from '../components/LoginCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';
import { LineChart, Brain } from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'signin' | 'signup';
}

export function LoginPage({ initialMode = 'signin' }: LoginPageProps) {
  const { isAuthenticated, authLoading } = useAppContext();
  const location = useLocation();
  const isSignupPath = location.pathname === '/signup' || initialMode === 'signup';

  usePageTitle(isSignupPath ? 'Create Account — AERONEX' : 'Sign In — AERONEX');

  // If already authenticated and not loading session, direct to dashboard
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page-bg min-h-screen w-full bg-[#020A1D] relative overflow-hidden flex flex-col font-['Inter',sans-serif] select-none transition-colors duration-300">
      
      {/* Ambient Glow Orbs */}
      <div className="login-ambient-orb absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-[#00A3FF]/15 rounded-full blur-[140px] pointer-events-none z-0 transition-opacity duration-300" />
      <div className="login-ambient-orb absolute bottom-[10%] right-[25%] w-[450px] h-[450px] bg-[#4E55F5]/10 rounded-full blur-[130px] pointer-events-none z-0 transition-opacity duration-300" />

      {/* Top Header Bar */}
      <header className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-14 pt-6 pb-2 flex items-center justify-between relative z-30">
        <div>
          <AeroNexLogo size={42} showTagline={true} />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content Container */}
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-14 flex-1 flex flex-col lg:flex-row items-center justify-between relative z-20 py-4 lg:py-6 gap-8">
        
        {/* LEFT COLUMN: HERO INFORMATION */}
        <div className="w-full lg:w-[50%] flex flex-col justify-center h-full relative z-20 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="login-hero-headline text-[38px] sm:text-[48px] lg:text-[54px] font-black text-white leading-[1.08] tracking-tight">
              AeroNex Airfare<br />
              <span className="text-[#00D2FF]">Intelligence</span> Platform
            </h1>
            <p className="login-hero-subtitle text-slate-300 text-[15px] sm:text-[16px] leading-relaxed max-w-md mt-4 transition-colors duration-300">
              Access real-time airfare analytics, price index tracking, and route intelligence powered by advanced AI and automated ingestion.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 max-w-lg"
          >
            <div className="login-feature-card flex flex-col items-start p-4 rounded-2xl bg-[#0E1017]/80 backdrop-blur-md border border-white/[0.08] shadow-lg group hover:border-cyan-400/50 transition-all cursor-default">
              <div className="w-10 h-10 rounded-xl bg-[#161822] border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <LineChart size={19} />
              </div>
              <span className="text-white font-bold text-sm mt-3 leading-tight block">Airfare Index</span>
              <span className="text-zinc-400 text-xs mt-1 leading-snug block">Real-time DGCA benchmarks</span>
            </div>

            <div className="login-feature-card flex flex-col items-start p-4 rounded-2xl bg-[#061434]/80 backdrop-blur-md border border-blue-500/20 shadow-lg group hover:border-cyan-400/50 transition-all cursor-default">
              <div className="w-10 h-10 rounded-xl bg-[#0F2454] border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Brain size={19} />
              </div>
              <span className="text-white font-bold text-sm mt-3 leading-tight block">AI Analytics</span>
              <span className="text-slate-400 text-xs mt-1 leading-snug block">Smart trend intelligence</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: LOGIN CARD */}
        <div className="w-full lg:w-[48%] flex justify-center lg:justify-end relative z-30">
          <LoginCard initialMode={isSignupPath ? 'signup' : 'signin'} />
        </div>

      </div>
    </div>
  );
}
