import { motion, type Variants } from 'framer-motion';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { LoginCard } from '../components/LoginCard';
import { FlightRadarVisualizer } from '../components/FlightRadarVisualizer';
import { usePageTitle } from '../hooks/usePageTitle';
import { BarChart3, TrendingUp, Bell, Plane, MapPin, Building2, Activity, Sparkles } from 'lucide-react';

export function LoginPage() {
  usePageTitle('Sign In — AERONEX');

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: 'easeOut' } 
    },
  };

  return (
    <div className="login-page-bg min-h-screen w-full bg-[#020A1D] relative overflow-hidden flex flex-col font-['Inter',sans-serif] select-none transition-colors duration-300">
      
      {/* 1. Cinematic Background Image Artwork */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center opacity-75 transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/assets/login-hero-clean.jpg)',
        }}
      />

      {/* Atmospheric Overlays (Dynamically reacts to day/night mode via CSS) */}
      <div className="login-gradient-overlay absolute inset-0 bg-gradient-to-r from-[#020A1D]/95 via-[#020A1D]/75 to-[#020A1D]/90 pointer-events-none z-0 transition-all duration-300" />
      
      {/* Floating Animated Ambient Glow Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.25, 1],
          opacity: [0.12, 0.22, 0.12],
          x: [0, 25, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[12%] left-[18%] w-[550px] h-[550px] bg-[#1788FF]/15 rounded-full blur-[150px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -30, 0],
          y: [0, 25, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[8%] right-[25%] w-[500px] h-[500px] bg-[#4E55F5]/15 rounded-full blur-[140px] pointer-events-none z-0" 
      />

      {/* Interactive Radar & Flight Paths Layer (Desktop & Tablet) */}
      <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
        <FlightRadarVisualizer />
      </div>

      {/* Top Header Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-2 flex items-center justify-between relative z-30"
      >
        {/* Brand in Mobile View */}
        <div className="lg:hidden">
          <AeroNexLogo size={36} showTagline={false} />
        </div>
        <div className="hidden lg:block">
          <AeroNexLogo size={46} showTagline={true} />
        </div>

        {/* Top Right Controls: Sun/Moon track slider + Indian Language flag */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12 flex-1 flex flex-col lg:flex-row items-center justify-between relative z-20 py-4 lg:py-8 gap-8">
        
        {/* LEFT COLUMN: HERO INTELLIGENCE (approx 52%) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[52%] flex flex-col justify-between h-full relative z-20"
        >
          
          {/* Headline with glowing gradient */}
          <div className="mt-2 lg:mt-6 mb-6">
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-semibold mb-4 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Next-Gen India Domestic Flight Intelligence</span>
              <span className="text-slate-400 font-mono text-[10px]">• 5s Ticker</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-[34px] sm:text-[44px] xl:text-[50px] font-black text-white leading-[1.12] tracking-tight max-w-xl login-hero-headline"
            >
              Track fares. Understand<br />
              trends. <span className="bg-gradient-to-r from-cyan-400 via-[#3B82F6] to-[#818cf8] bg-clip-text text-transparent">Travel smarter.</span>
            </motion.h1>

            {/* 3 Animated Feature Rows */}
            <div className="flex flex-col gap-3.5 sm:gap-4 mt-6 max-w-md">
              
              {/* Feature 1 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 6 }}
                className="flex items-start gap-3.5 group p-2.5 rounded-2xl transition-all hover:bg-blue-500/10 cursor-default bg-[#06112A]/40 border border-blue-500/15 backdrop-blur-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_18px_rgba(23,136,255,0.3)] shrink-0 group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                  <BarChart3 size={19} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[14px] leading-snug flex items-center gap-1.5">
                    Real-Time Airfare Index
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">5s continuous polling across major Indian domestic corridors.</p>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 6 }}
                className="flex items-start gap-3.5 group p-2.5 rounded-2xl transition-all hover:bg-blue-500/10 cursor-default bg-[#06112A]/40 border border-blue-500/15 backdrop-blur-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_18px_rgba(23,136,255,0.3)] shrink-0 group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                  <TrendingUp size={19} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[14px] leading-snug flex items-center gap-1.5">
                    Smart Price Prediction
                    <Sparkles size={13} className="text-purple-400" />
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Understand whether fares may rise or drop with AI analysis.</p>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 6 }}
                className="flex items-start gap-3.5 group p-2.5 rounded-2xl transition-all hover:bg-blue-500/10 cursor-default bg-[#06112A]/40 border border-blue-500/15 backdrop-blur-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_18px_rgba(23,136,255,0.3)] shrink-0 group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                  <Bell size={19} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[14px] leading-snug">Price Alerts & Tracking</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Get notified instantly when your target fare is reached.</p>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Bottom Stats Row */}
          <motion.div 
            variants={itemVariants}
            className="mt-6 lg:mt-auto pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 z-20 relative"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0 shadow-sm">
                <Plane size={17} />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-white block leading-tight">125K+</span>
                <span className="text-[10px] text-slate-400 leading-tight">Flights Tracked</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0 shadow-sm">
                <MapPin size={17} />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-white block leading-tight">1.2K+</span>
                <span className="text-[10px] text-slate-400 leading-tight">Routes Tracked</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0 shadow-sm">
                <Building2 size={17} />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-white block leading-tight">50+</span>
                <span className="text-[10px] text-slate-400 leading-tight">Indian Airports</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0 shadow-sm">
                <Activity size={17} />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-white block leading-tight">5s Sync</span>
                <span className="text-[10px] text-slate-400 leading-tight">Real-time Data</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* RIGHT COLUMN: LOGIN CARD (approx 48%) */}
        <div className="w-full lg:w-[48%] flex justify-center lg:justify-end relative z-30">
          <LoginCard />
        </div>

      </div>
    </div>
  );
}
