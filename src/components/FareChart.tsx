import { motion } from 'framer-motion';

export function FareChart() {
  return (
    <div className="absolute bottom-0 left-0 w-[60%] h-[300px] pointer-events-none z-0 overflow-hidden">
      <svg viewBox="0 0 800 300" className="w-full h-full preserve-3d">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1788FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1788FF" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          d="M 0 250 L 50 240 L 100 260 L 150 200 L 200 220 L 250 150 L 300 180 L 350 100 L 400 140 L 450 80 L 500 120 L 550 50 L 600 90 L 650 30 L 700 60 L 800 20"
          fill="none"
          stroke="#1788FF"
          strokeWidth="3"
          filter="url(#glow)"
        />
        
        <path
          d="M 0 250 L 50 240 L 100 260 L 150 200 L 200 220 L 250 150 L 300 180 L 350 100 L 400 140 L 450 80 L 500 120 L 550 50 L 600 90 L 650 30 L 700 60 L 800 20 L 800 300 L 0 300 Z"
          fill="url(#chartGradient)"
          opacity="0.5"
        />

        {/* Floating Price Badge */}
        <g transform="translate(350, 60)">
          <rect x="-40" y="-15" width="80" height="45" rx="8" fill="rgba(5, 20, 52, 0.8)" stroke="#1788FF" strokeWidth="1" opacity="0.9" />
          <text x="0" y="5" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">₹5,240</text>
          <text x="0" y="22" fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle">↑ 2.4%</text>
        </g>
      </svg>
    </div>
  );
}
