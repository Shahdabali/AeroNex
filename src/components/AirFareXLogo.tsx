interface AirFareXLogoProps {
  className?: string;
  size?: number;
  showSubtitle?: boolean;
}

export function AirFareXLogo({
  className = '',
  size = 36,
  showSubtitle = true,
}: AirFareXLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Geometric Jet Icon matching screenshot */}
      <div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 36 36" 
          fill="none" 
          className="w-full h-full drop-shadow-[0_0_12px_rgba(23,136,255,0.45)]"
        >
          {/* Main wing/body polygon */}
          <path 
            d="M3 19L33 4L21 33L16 21L3 19Z" 
            fill="url(#airfarex_plane_grad)" 
          />
          {/* Central fuselage fold */}
          <path 
            d="M16 21L33 4" 
            stroke="#93C5FD" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <defs>
            <linearGradient id="airfarex_plane_grad" x1="3" y1="4" x2="33" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="0.6" stopColor="#1788FF" />
              <stop offset="1" stopColor="#4E55F5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <span className="text-2xl xl:text-[26px] font-black tracking-tight text-white flex items-center leading-none">
          AirFare<span className="text-[#1788FF]">X</span>
        </span>
        {showSubtitle && (
          <span className="text-[11px] font-medium text-slate-400 mt-1 tracking-normal leading-tight">
            Real-Time Airfare Price Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
