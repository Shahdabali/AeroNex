import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

interface CinematicHeroProps {
  freshnessStatus?: string;
}

export function CinematicHeroBanner({ freshnessStatus = 'live' }: CinematicHeroProps) {
  const { user, t } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const airplaneRef = useRef<SVGGElement>(null);
  const flightPathRef = useRef<SVGPathElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Shadab';

  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance timeline for text and badges
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgeRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
      })
      .from(headlineRef.current, {
        y: 25,
        opacity: 0,
        duration: 0.7,
      }, '-=0.3')
      .from(subtitleRef.current, {
        y: 15,
        opacity: 0,
        duration: 0.6,
      }, '-=0.4')
      .from(statsRef.current, {
        x: 30,
        opacity: 0,
        duration: 0.6,
      }, '-=0.5');

      // 2. Continuous Aircraft Trajectory along Bezier Path
      if (airplaneRef.current && flightPathRef.current) {
        const path = flightPathRef.current;
        const pathLength = path.getTotalLength();

        // Animate path stroke drawing
        gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 3,
          ease: 'power2.inOut',
          repeat: -1,
          repeatDelay: 1,
        });

        // Object holding progress for GSAP animation
        const airplaneObj = { progress: 0 };
        gsap.to(airplaneObj, {
          progress: 1,
          duration: 9,
          ease: 'none',
          repeat: -1,
          onUpdate: () => {
            const currentPoint = path.getPointAtLength(airplaneObj.progress * pathLength);
            // Calculate tangent angle for realistic aircraft orientation/heading
            const nextPoint = path.getPointAtLength(Math.min((airplaneObj.progress + 0.01) * pathLength, pathLength));
            const angle = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) * (180 / Math.PI);

            if (airplaneRef.current) {
              gsap.set(airplaneRef.current, {
                x: currentPoint.x,
                y: currentPoint.y,
                rotation: angle + 90, // adjust orientation so plane points forward
                transformOrigin: 'center center',
              });
            }
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="card-interactive w-full min-h-[230px] rounded-3xl relative overflow-hidden flex flex-col justify-between p-7 md:p-9 border border-white/[0.08] shadow-2xl bg-gradient-to-r from-[#090A0F] via-[#12141C] to-[#161924]"
    >
      {/* Background Ambience & Golden Sunset Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-right-top opacity-20 mix-blend-screen pointer-events-none"
        style={{ backgroundImage: "url('/assets/login-hero-clean.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F] via-[#090A0F]/85 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-transparent to-transparent pointer-events-none" />

      {/* SVG Canvas with Bezier Flight Corridor and Aircraft */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0 opacity-80"
        viewBox="0 0 1000 240"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flightArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#1788FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.2" />
          </linearGradient>
          <filter id="aircraftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Flight Trajectory Curved Bezier Path */}
        <path
          ref={flightPathRef}
          d="M 50 190 Q 300 40, 600 130 T 980 60"
          fill="none"
          stroke="url(#flightArcGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Real-time GSAP Cruising Jetliner */}
        <g ref={airplaneRef} filter="url(#aircraftGlow)">
          <path
            d="M0 -14 L4 -4 L16 2 L16 5 L4 4 L3 12 L7 15 L7 17 L0 15 L-7 17 L-7 15 L-3 12 L-4 4 L-16 5 L-16 2 L-4 -4 Z"
            fill="#00E5FF"
            stroke="#FFFFFF"
            strokeWidth="0.8"
          />
          {/* Engine Exhaust Jet Glow */}
          <circle cx="0" cy="15" r="2.5" fill="#38BDF8" opacity="0.9" />
        </g>
      </svg>

      {/* Top Banner Row */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div ref={badgeRef} className="inline-flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-sm">
            <Sparkles size={11} className="text-cyan-300 animate-pulse" />
            AeroNex Intelligence — FLY BEYOND LIMITS
          </span>
        </div>

        <div ref={statsRef} className="flex items-center gap-3">
          <div className="text-slate-300 text-xs font-mono flex items-center gap-2">
            <span>{dateStr}</span> <span className="text-slate-600">|</span> <span>{timeStr}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#12141C]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 text-xs font-semibold">
              {freshnessStatus === 'live' ? 'Live data streaming' : 'Data updated recently'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Content Row */}
      <div className="relative z-10 mt-6 flex flex-col justify-end">
        <h2 ref={headlineRef} className="text-2xl md:text-[32px] font-extrabold text-white flex items-center gap-2.5 tracking-tight">
          <span>{timeGreeting}, {firstName}!</span>
          <span className="origin-bottom-right hover:rotate-12 transition-transform cursor-default text-2xl">👋</span>
        </h2>
        <p ref={subtitleRef} className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
          Here's what's happening with real-time Indian airfares, DGCA benchmarks & predictive routes today.
        </p>
      </div>
    </div>
  );
}
