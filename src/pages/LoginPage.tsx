import { AirFareXLogo } from '../components/AirFareXLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { LoginCard } from '../components/LoginCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { BarChart3, TrendingUp, Bell, Plane, MapPin, Building2, Clock } from 'lucide-react';

export function LoginPage() {
  usePageTitle('Sign In — AirFareX');

  return (
    <div className="min-h-screen w-full bg-[#020A1D] relative overflow-hidden flex flex-col font-['Inter',sans-serif] select-none">
      
      {/* 1. Cinematic Background Image Artwork */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center opacity-85 transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/assets/login-hero-clean.jpg)',
        }}
      />

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020A1D]/90 via-[#020A1D]/60 to-[#020A1D]/95 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/25 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none z-0" />

      {/* Top Header Bar (Desktop & Mobile) */}
      <header className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-2 flex items-center justify-between relative z-30">
        {/* Brand in Mobile View */}
        <div className="lg:hidden">
          <AirFareXLogo size={32} showSubtitle={false} />
        </div>
        <div className="hidden lg:block" />

        {/* Top Right Controls matching screenshot: Sun/Moon slider + Indian Language flag */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12 flex-1 flex flex-col lg:flex-row items-center justify-between relative z-20 py-6 lg:py-10">
        
        {/* LEFT COLUMN: HERO INTELLIGENCE (approx 56%) */}
        <div className="w-full lg:w-[56%] flex flex-col justify-between h-full relative z-20">
          
          {/* Top Brand on Desktop */}
          <div className="hidden lg:block">
            <AirFareXLogo size={42} showSubtitle={true} />
          </div>

          {/* Headline matching screenshot */}
          <div className="mt-4 lg:mt-10 mb-6">
            <h1 className="text-[36px] sm:text-[44px] xl:text-[50px] font-black text-white leading-[1.12] tracking-tight max-w-xl">
              Track fares. Understand<br />
              trends. <span className="bg-gradient-to-r from-[#6366F1] via-[#3B82F6] to-[#38BDF8] bg-clip-text text-transparent">Travel smarter.</span>
            </h1>

            {/* 3 Feature Rows matching screenshot */}
            <div className="flex flex-col gap-5 mt-8 max-w-md">
              {/* Feature 1 */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_15px_rgba(23,136,255,0.25)] shrink-0 group-hover:scale-105 transition-transform">
                  <BarChart3 size={20} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] leading-snug">Real-Time Airfare Index</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Monitor airfare movements across India.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_15px_rgba(23,136,255,0.25)] shrink-0 group-hover:scale-105 transition-transform">
                  <TrendingUp size={20} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] leading-snug">Smart Price Prediction</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Understand whether fares may rise or fall.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#131C38]/95 border border-blue-500/30 flex items-center justify-center text-[#1788FF] shadow-[0_0_15px_rgba(23,136,255,0.25)] shrink-0 group-hover:scale-105 transition-transform">
                  <Bell size={20} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] leading-snug">Price Alerts</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Get notified when your target fare is reached.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Route Nodes on India Map Background (Desktop) */}
          <div className="hidden xl:block absolute inset-0 pointer-events-none z-10">
            {/* Route DEL -> BOM */}
            <div className="absolute top-[36%] left-[45%] flex flex-col items-center">
              <span className="text-[10px] font-bold text-white font-mono bg-[#030C22]/85 px-2 py-0.5 rounded border border-blue-500/40 shadow-lg">
                DEL → BOM
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-ping mt-1" />
            </div>

            {/* Route BOM -> BLR */}
            <div className="absolute top-[52%] left-[38%] flex flex-col items-center">
              <span className="text-[10px] font-bold text-white font-mono bg-[#030C22]/85 px-2 py-0.5 rounded border border-blue-500/40 shadow-lg">
                BOM → BLR
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-ping mt-1" />
            </div>

            {/* Route DEL -> BLR */}
            <div className="absolute top-[54%] left-[52%] flex flex-col items-center">
              <span className="text-[10px] font-bold text-white font-mono bg-[#030C22]/85 px-2 py-0.5 rounded border border-blue-500/40 shadow-lg">
                DEL → BLR
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-ping mt-1" />
            </div>

            {/* Floating Price Badge on chart */}
            <div className="absolute bottom-[20%] left-[28%] bg-[#051434]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3.5 py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex flex-col items-center">
              <span className="text-xs font-black text-white">₹5,240</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                ↑ 2.4%
              </span>
            </div>
          </div>

          {/* Bottom Stats Row matching screenshot */}
          <div className="mt-8 lg:mt-auto pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 z-20 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0">
                <Plane size={18} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">125K+</span>
                <span className="text-[11px] text-slate-400 leading-tight">Flights Tracked</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">1.2K+</span>
                <span className="text-[11px] text-slate-400 leading-tight">Routes Tracked</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">50+</span>
                <span className="text-[11px] text-slate-400 leading-tight">Indian Airports</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#1788FF] shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">24/7</span>
                <span className="text-[11px] text-slate-400 leading-tight">Real-time Data</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LOGIN CARD (approx 44%) */}
        <div className="w-full lg:w-[44%] flex justify-center lg:justify-end mt-8 lg:mt-0 relative z-30">
          <LoginCard />
        </div>

      </div>
    </div>
  );
}
