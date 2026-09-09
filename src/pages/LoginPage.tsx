import { AeroNexLogo } from '../components/AeroNexLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { HeroFeatures } from '../components/HeroFeatures';
import { FlightMap } from '../components/FlightMap';
import { FareChart } from '../components/FareChart';
import { StatsBar } from '../components/StatsBar';
import { LoginCard } from '../components/LoginCard';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppProvider';
import { usePageTitle } from '../hooks/usePageTitle';

export function LoginPage() {
  usePageTitle('Sign In');
  const { t } = useAppContext();

  return (
    <div className="min-h-screen w-full bg-[#020A1D] relative overflow-x-hidden flex flex-col font-['Inter',sans-serif]">
      {/* Background cinematic elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#132A60]/30 via-[#020A1D]/0 to-[#020A1D]/0 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#1788FF]/15 via-[#020A1D]/0 to-[#020A1D]/0 pointer-events-none" />
      <div className="fixed top-[20%] left-[30%] w-[600px] h-[600px] bg-[#1788FF]/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[10%] right-[20%] w-[400px] h-[400px] bg-[#4E55F5]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
      
      {/* City skyline silhouettes using CSS gradients */}
      <div className="fixed bottom-0 left-0 w-full h-[35vh] opacity-30 pointer-events-none z-0 hidden lg:block" style={{
        backgroundImage: `
          linear-gradient(to top, #020A1D 0%, transparent 100%),
          repeating-linear-gradient(to right, 
            transparent 0%, transparent 2%, 
            #0a1838 2%, #0a1838 4%, 
            transparent 4%, transparent 7%, 
            #06112a 7%, #06112a 10%
          )
        `,
        backgroundSize: '100% 100%, 200px 100%'
      }} />

      {/* Main container */}
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row h-full min-h-screen relative z-10">
        
        {/* Mobile Header (Brand & Controls) */}
        <div className="flex lg:hidden justify-between items-center w-full pt-6 pb-4 relative z-20">
          <AeroNexLogo size={36} showTagline={false} className="scale-90 origin-left" />
          <div className="flex gap-3">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>

        {/* Left Column - Hero Content (approx 58%) */}
        <div className="hidden lg:flex w-full lg:w-[58%] pt-12 pb-10 flex-col relative z-10">
          {/* Top Brand */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AeroNexLogo size={52} showTagline={true} />
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[40px] md:text-[48px] lg:text-[54px] font-bold text-white leading-[1.15] mt-16 lg:mt-32 tracking-tight"
          >
            {t.heroHeadline1}<br />
            {t.heroHeadline2} <span className="bg-gradient-to-r from-[#6670ff] to-[#12a7ff] bg-clip-text text-transparent">{t.heroHeadlineHighlight}</span>
          </motion.h1>

          {/* Feature List */}
          <HeroFeatures />

          {/* Visual Elements behind/around features */}
          <div className="absolute inset-0 z-[-1] pointer-events-none">
            <FlightMap />
            <FareChart />
          </div>

          {/* Bottom Stats */}
          <StatsBar />
        </div>

        {/* Right Column - Login Card (approx 42%) */}
        <div className="w-full lg:w-[42%] flex flex-col pt-4 lg:pt-12 pb-10 lg:pl-10 relative z-20">
          {/* Top Right Controls (Desktop only) */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex justify-end gap-4 mb-16 lg:pr-10"
          >
            <ThemeToggle />
            <LanguageSelector />
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 flex flex-col items-center lg:items-end justify-center lg:justify-start w-full"
          >
            <LoginCard />
          </motion.div>
        </div>

      </div>
    </div>
  );
}
