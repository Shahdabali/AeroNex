
export function FlightMap() {
  return (
    <div className="absolute left-[35%] top-[15%] w-[600px] h-[600px] pointer-events-none opacity-50 xl:opacity-70">
      {/* SVG Map representation */}
      <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-[0_0_15px_rgba(23,136,255,0.4)]">
        {/* Placeholder India Map Path - more refined shape */}
        <path
          d="M 150 20 C 180 -10, 220 -10, 240 20 C 270 60, 310 90, 330 140 C 370 180, 390 230, 370 280 C 350 330, 300 390, 240 430 C 190 450, 160 410, 130 360 C 90 310, 30 250, 60 180 C 80 130, 100 80, 150 20 Z"
          fill="rgba(6, 26, 66, 0.4)"
          stroke="#1788FF"
          strokeWidth="1"
          strokeDasharray="3 4"
          className="opacity-60"
        />

        {/* Nodes */}
        <g className="nodes">
          {/* DEL */}
          <circle cx="210" cy="160" r="4" fill="#fff" className="animate-pulse" />
          <circle cx="210" cy="160" r="14" fill="none" stroke="#1788FF" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
          <text x="210" y="140" fill="#fff" fontSize="13" textAnchor="middle" className="font-semibold tracking-wide drop-shadow-md">DEL → BOM</text>

          {/* BOM */}
          <circle cx="120" cy="270" r="4" fill="#fff" className="animate-pulse" />
          <circle cx="120" cy="270" r="14" fill="none" stroke="#1788FF" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
          <text x="95" y="265" fill="#fff" fontSize="13" textAnchor="end" className="font-semibold tracking-wide drop-shadow-md">BOM → BLR</text>

          {/* BLR */}
          <circle cx="170" cy="370" r="4" fill="#fff" className="animate-pulse" />
          <circle cx="170" cy="370" r="14" fill="none" stroke="#1788FF" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
          <text x="195" y="375" fill="#fff" fontSize="13" textAnchor="start" className="font-semibold tracking-wide drop-shadow-md">DEL → BLR</text>
        </g>

        {/* Routes */}
        <path d="M 210 160 Q 140 210 120 270" fill="none" stroke="#1788FF" strokeWidth="2" strokeLinecap="round" className="opacity-80 drop-shadow-[0_0_8px_rgba(23,136,255,0.8)]" />
        <path d="M 120 270 Q 145 320 170 370" fill="none" stroke="#1788FF" strokeWidth="2" strokeLinecap="round" className="opacity-80 drop-shadow-[0_0_8px_rgba(23,136,255,0.8)]" />
        <path d="M 210 160 Q 240 270 170 370" fill="none" stroke="#4E55F5" strokeWidth="2" strokeLinecap="round" className="opacity-80 drop-shadow-[0_0_8px_rgba(78,85,245,0.8)]" />
      </svg>
    </div>
  );
}
