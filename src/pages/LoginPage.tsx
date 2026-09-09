import { motion, type Variants } from 'framer-motion';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { LoginCard } from '../components/LoginCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { BarChart3, TrendingUp, Bell, Plane, MapPin, Building2, Clock, Sparkles } from 'lucide-react';

export function LoginPage() {
  usePageTitle('Sign In — AERONEX');

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: 'easeOut' } 
    },
  };

  return (
    <div className="login-page-bg min-h-screen w-full bg-[#020A1D] relative overflow-hidden flex flex-col font-['Inter',sans-serif] select-none transition-colors duration-300">
      
      {/* 1. Cinematic Background Image Artwork */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center opacity-85 transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/assets/login-hero-clean.jpg)',
        }}
      />

      {/* Atmospheric Overlays (Dynamically reacts to day/night mode via CSS) */}
      <div className="login-gradient-overlay absolute inset-0 bg-gradient-to-r from-[#020A1D]/90 via-[#020A1D]/65 to-[#020A1D]/95 pointer-events-none z-0 transition-all duration-300" />
      
      {/* Floating Animated Ambient Glow Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 20, 0],
          y: [0, -15, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-[#1788FF]/15 rounded-full blur-[140px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -25, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[10%] right-[30%] w-[450px] h-[450px] bg-[#4E55F5]/15 rounded-full blur-[130px] pointer-events-none z-0" 
      />

      {/* Top Header Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-2 flex items-center justify-between relative z-30"
      >
        {/* Brand in Mobile View */}
        <div className="lg:hidden">
          <AeroNexLogo size={34} showTagline={false} />
        </div>
        <div className="hidden lg:block" />

        {/* Top Right Controls: Sun/Moon track slider + Indian Language flag */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </motion.header>

      {/* Main Container */}
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12 flex-1 flex flex-col lg:flex-row items-center justify-between relative z-20 py-6 lg:py-10">
        
        {/* LEFT COLUMN: HERO INTELLIGENCE (approx 56%) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[56%] flex flex-col justify-between h-full relative z-20"
        >
          
          {/* Top Brand on Desktop with AERONEX logo */}
          <motion.div variants={itemVariants} className="hidden lg:block">
            <AeroNexLogo size={46} showTagline={true} />
          </motion.div>

          {/* Headline matching screenshot */}
          <div className="mt-4 lg:mt-8 mb-6">
            <motion.h1 
              variants={itemVariants}
              className="text-[36px] sm:text-[44px] xl:text-[52px] font-black text-white leading-[1.12] tracking-tight max-w-xl"
            >
              Track fares. Understand<br />
              trends. <span className="bg-gradient-to-r from-[#6366F1] via-[#3B82F6] to-[#38BDF8] bg-clip-text text-transparent">Travel smarter.</span>
            </motion.h1>

            {/* 3 Feature Rows matching screenshot with interactive hover animations */}
            <div className="flex flex-col gap-4 sm:gap-5 mt-7 max-w-md">
              
              {/* Feature 1 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 6 }}
                className="flex items-start gap-4 group p-2.5 rounded-2xl transition-all hover:bg-blue-500/10 cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_18px_rgba(23,136,255,0.3)] shrink-0 group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                  <BarChart3 size={20} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] leading-snug flex items-center gap-1.5">
                    Real-Time Airfare Index
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Monitor airfare movements across India.</p>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 6 }}
                className="flex items-start gap-4 group p-2.5 rounded-2xl transition-all hover:bg-blue-500/10 cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_18px_rgba(23,136,255,0.3)] shrink-0 group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                  <TrendingUp size={20} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] leading-snug flex items-center gap-1.5">
                    Smart Price Prediction
                    <Sparkles size={13} className="text-purple-400" />
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Understand whether fares may rise or fall.</p>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 6 }}
                className="flex items-start gap-4 group p-2.5 rounded-2xl transition-all hover:bg-blue-500/10 cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_18px_rgba(23,136,255,0.3)] shrink-0 group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                  <Bell size={20} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] leading-snug">Price Alerts</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Get notified when your target fare is reached.</p>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Interactive Route Nodes on India Map Background (Desktop) */}
          <div className="hidden xl:block absolute inset-0 pointer-events-none z-10">
            
            {/* Route DEL -> BOM */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute top-[35%] left-[45%] flex flex-col items-center"
            >
              <span className="text-[10px] font-bold text-white font-mono bg-[#030C22]/85 px-2.5 py-0.5 rounded-lg border border-blue-500/40 shadow-lg backdrop-blur-md">
                DEL → BOM
              </span>
              <div className="relative mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block shadow-[0_0_12px_#22d3ee]" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute inset-0 animate-ping opacity-75" />
              </div>
            </motion.div>

            {/* Route BOM -> BLR */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="absolute top-[51%] left-[38%] flex flex-col items-center"
            >
              <span className="text-[10px] font-bold text-white font-mono bg-[#030C22]/85 px-2.5 py-0.5 rounded-lg border border-blue-500/40 shadow-lg backdrop-blur-md">
                BOM → BLR
              </span>
              <div className="relative mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block shadow-[0_0_12px_#22d3ee]" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute inset-0 animate-ping opacity-75" />
              </div>
            </motion.div>

            {/* Route DEL -> BLR */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute top-[53%] left-[52%] flex flex-col items-center"
            >
              <span className="text-[10px] font-bold text-white font-mono bg-[#030C22]/85 px-2.5 py-0.5 rounded-lg border border-blue-500/40 shadow-lg backdrop-blur-md">
                DEL → BLR
              </span>
              <div className="relative mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block shadow-[0_0_12px_#22d3ee]" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute inset-0 animate-ping opacity-75" />
              </div>
            </motion.div>

            {/* Floating Price Badge with Smooth Bobbing Animation */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[21%] left-[28%] bg-[#051434]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3.5 py-1.5 shadow-[0_0_25px_rgba(34,211,238,0.35)] flex flex-col items-center"
            >
              <span className="text-xs font-black text-white">₹5,240</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                ↑ 2.4%
              </span>
            </motion.div>
          </div>

          {/* Bottom Stats Row matching screenshot */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 lg:mt-auto pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 z-20 relative"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0 shadow-sm">
                <Plane size={18} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">125K+</span>
                <span className="text-[11px] text-slate-400 leading-tight">Flights Tracked</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0 shadow-sm">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">1.2K+</span>
                <span className="text-[11px] text-slate-400 leading-tight">Routes Tracked</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0 shadow-sm">
                <Building2 size={18} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">50+</span>
                <span className="text-[11px] text-slate-400 leading-tight">Indian Airports</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0 shadow-sm">
                <Clock size={18} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">24/7</span>
                <span className="text-[11px] text-slate-400 leading-tight">Real-time Data</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* RIGHT COLUMN: LOGIN CARD (approx 44%) */}
        <div className="w-full lg:w-[44%] flex justify-center lg:justify-end mt-8 lg:mt-0 relative z-30">
          <LoginCard />
        </div>

      </div>
    </div>
  );
}
