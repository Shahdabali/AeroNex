import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { useDataStatus } from '../../hooks/useDataStatus';
import { DataSourceBadge } from '../DataSourceBadge';
import { useAppContext } from '../../context/AppProvider';

function ATCBackground() {
  const { theme } = useAppContext();
  const isLight = theme === 'light';
  
  const strokeColor = isLight ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 229, 255, 0.15)';
  const activeColor = isLight ? '#2563EB' : '#00E5FF';
  const planeColor = isLight ? '#1D4ED8' : '#FFFFFF';
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full opacity-60">
        <defs>
          <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="15%" stopColor="white" />
            <stop offset="85%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <path id="path1" d="M -50 150 Q 250 50, 500 100 T 1050 50" />
          <path id="path2" d="M -50 80 Q 300 180, 600 80 T 1050 120" />
          <path id="path3" d="M -50 180 Q 400 -20, 800 180 T 1050 60" />
        </defs>
        
        <g mask="url(#fadeMask)">
          <mask id="fadeMask">
            <rect width="100%" height="100%" fill="url(#fade)" />
          </mask>
          
          {/* Static dashed paths */}
          <path d="M -50 150 Q 250 50, 500 100 T 1050 50" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 6" />
          <path d="M -50 80 Q 300 180, 600 80 T 1050 120" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 6" />
          <path d="M -50 180 Q 400 -20, 800 180 T 1050 60" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
          
          {/* Animated drawing lines */}
          <path d="M -50 150 Q 250 50, 500 100 T 1050 50" fill="none" stroke={activeColor} strokeWidth="2" className="animate-[dash_12s_linear_infinite]" strokeDasharray="100 1000" />
          <path d="M -50 80 Q 300 180, 600 80 T 1050 120" fill="none" stroke={activeColor} strokeWidth="2" className="animate-[dash_15s_linear_infinite]" strokeDasharray="60 1000" style={{animationDelay: '-5s'}} />
          
          {/* Airplanes */}
          <g fill={planeColor}>
            {/* Plane 1 */}
            <path d="M 0 -4 L 8 0 L 0 4 L 2 0 Z">
              <animateMotion dur="12s" repeatCount="indefinite" rotate="auto">
                <mpath href="#path1" />
              </animateMotion>
            </path>
            {/* Plane 2 */}
            <path d="M 0 -4 L 8 0 L 0 4 L 2 0 Z">
              <animateMotion dur="15s" repeatCount="indefinite" rotate="auto" begin="-5s">
                <mpath href="#path2" />
              </animateMotion>
            </path>
            {/* Plane 3 (Small) */}
            <path d="M 0 -3 L 6 0 L 0 3 L 1 0 Z" fill={activeColor} opacity="0.6">
              <animateMotion dur="20s" repeatCount="indefinite" rotate="auto" begin="-10s">
                <mpath href="#path3" />
              </animateMotion>
            </path>
          </g>
          
          {/* Waypoint pings */}
          <circle cx="250" cy="50" r="3" fill={activeColor} opacity="0.5">
            <animate attributeName="r" values="3; 15" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8; 0" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="50" r="2" fill={activeColor} />
          
          <circle cx="600" cy="80" r="3" fill={activeColor} opacity="0.5">
            <animate attributeName="r" values="3; 15" dur="4s" repeatCount="indefinite" begin="-2s" />
            <animate attributeName="opacity" values="0.8; 0" dur="4s" repeatCount="indefinite" begin="-2s" />
          </circle>
          <circle cx="600" cy="80" r="2" fill={activeColor} />
          
          <circle cx="500" cy="100" r="3" fill={activeColor} opacity="0.5">
            <animate attributeName="r" values="3; 12" dur="2.5s" repeatCount="indefinite" begin="-1s" />
            <animate attributeName="opacity" values="0.8; 0" dur="2.5s" repeatCount="indefinite" begin="-1s" />
          </circle>
          <circle cx="500" cy="100" r="2" fill={activeColor} />
        </g>
      </svg>
    </div>
  );
}

export function WelcomeBanner() {
  const feed = useDataStatus();
  const last = feed.status?.lastCycleAt ? new Date(feed.status.lastCycleAt) : null;
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  return (
    <div className={`relative w-full rounded-xl overflow-hidden shadow-xl p-6 sm:p-7 hover-lift transition-all duration-500 border ${
      isLight 
        ? 'bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/50 border-blue-200/60' 
        : 'bg-[#0A0C13] border-white/[0.08]'
    }`}>
      
      {/* Background ATC Animation */}
      <ATCBackground />

      {/* Fade Gradients for text legibility over the animation */}
      <div className={`absolute inset-0 pointer-events-none ${isLight ? 'bg-gradient-to-r from-slate-50/90 via-slate-50/50 to-transparent' : 'bg-gradient-to-r from-[#0A0C13]/95 via-[#0A0C13]/70 to-transparent'}`} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            <DataSourceBadge showAge />
          </div>

          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
            India Airfare <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-fluid-gradient">Intelligence</span>
          </h1>

          <p className={`text-sm max-w-xl ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Analytical view of India&apos;s domestic airfare market for CPI augmentation.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Data last refreshed</span>
          <span className={`text-[13px] font-mono tabular-nums ${isLight ? 'text-slate-700 font-semibold' : 'text-zinc-300'}`}>
            {last ? format(last, 'dd MMMM yyyy \\u00B7 hh:mm:ss a') : 'Waiting for first update?'}
          </span>
          <div className={`mt-1 flex items-center gap-1.5 text-[10px] font-mono ${isLight ? 'text-blue-600 font-semibold' : 'text-cyan-400/90'}`} title={feed.detail}>
            <Activity size={12} className={feed.state === 'live' ? 'text-emerald-500' : (isLight ? 'text-slate-400' : 'text-zinc-500')} />
            <span>{feed.status ? feed.status.provider : feed.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
