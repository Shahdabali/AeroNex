import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  TrendingUp, TrendingDown, Globe, Map as MapIcon, 
  Radio, ArrowRight
} from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';
import { AviationGlobe3D, SECTOR_HUBS } from '../visualizations/AviationGlobe3D';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface Sector2DCoords {
  x: number;
  y: number;
}

const SECTOR_2D_MAP: Record<string, Sector2DCoords> = {
  North: { x: 195, y: 105 },
  West: { x: 125, y: 210 },
  South: { x: 170, y: 300 },
  East: { x: 305, y: 180 },
  Central: { x: 188, y: 220 },
};

// Tactical Sector Poly-Zones for Indian Airspace
const SECTOR_POLYGONS: Record<string, string> = {
  North: 'M 175 35 C 185 25, 205 25, 215 40 C 235 55, 245 75, 280 100 L 220 155 L 160 145 Z',
  West: 'M 160 145 L 220 155 L 188 220 L 140 265 L 95 210 L 85 170 Z',
  South: 'M 140 265 L 188 220 L 245 265 L 220 340 L 195 380 L 168 380 Z',
  East: 'M 220 155 L 280 100 C 310 115, 345 125, 360 140 C 375 155, 380 175, 365 190 C 350 200, 330 185, 315 185 C 305 195, 290 210, 245 265 Z',
  Central: 'M 165 160 L 245 160 L 245 250 L 165 250 Z',
};

// Active flight corridors in 2D
const CORRIDOR_PATHS = [
  { id: 'DEL-BOM', d: 'M 195 105 Q 140 160 125 210', color: '#00E5FF', dur: '4.5s' },
  { id: 'BOM-BLR', d: 'M 125 210 Q 140 260 170 300', color: '#38BDF8', dur: '5.2s' },
  { id: 'DEL-BLR', d: 'M 195 105 Q 210 200 170 300', color: '#10B981', dur: '6.0s' },
  { id: 'DEL-CCU', d: 'M 195 105 Q 260 135 305 180', color: '#F59E0B', dur: '5.5s' },
  { id: 'HYD-DEL', d: 'M 188 220 Q 192 160 195 105', color: '#A855F7', dur: '4.8s' },
  { id: 'DEL-GOI', d: 'M 195 105 Q 150 180 132 250', color: '#00E5FF', dur: '5.8s' },
];

export function RegionalMap() {
  const { t } = useAppContext();
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string>('North');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [radarSweepActive, setRadarSweepActive] = useState<boolean>(true);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  // Live real-time regional index data query
  const { data: regionalData } = useQuery({
    queryKey: ['regionalIndex'],
    queryFn: api.getRegionalIndex,
    refetchInterval: 5000,
  });

  const getRegionMetrics = (regionId: string) => {
    if (Array.isArray(regionalData) && regionalData.length > 0) {
      const found = regionalData.find((r: any) => r.region?.toLowerCase() === regionId.toLowerCase());
      if (found) return { value: found.value, change: found.change };
    }
    const fallback = SECTOR_HUBS.find(h => h.id === regionId);
    return { value: fallback?.defaultVal ?? 134.8, change: fallback?.defaultChange ?? 2.4 };
  };

  const selectedHub = useMemo(() => {
    return SECTOR_HUBS.find(h => h.id === activeRegion) || SECTOR_HUBS[0];
  }, [activeRegion]);

  const selectedMetrics = getRegionMetrics(selectedHub.id);

  return (
    <div className="bg-[#0C0E17]/90 backdrop-blur-md rounded-2xl border border-white/[0.08] hover:border-white/[0.14] p-4 sm:p-5 min-h-[460px] flex flex-col relative overflow-hidden transition-all shadow-xl select-none">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white text-sm sm:text-base font-bold flex items-center gap-2">
              <span>{viewMode === '3d' ? '3D Indian Airspace Mesh' : (t.regionalMapTitle || 'Airfare Index by Region')}</span>
            </h3>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE 5S RADAR
            </span>
          </div>
          <p className="text-zinc-400 text-xs mt-0.5">
            {viewMode === '3d'
              ? 'Tactical 3D orbital beacon towers & suborbital flight corridors'
              : (t.regionalMapSubtitle || 'Interactive sector vector radar, real-time yields & active corridors')}
          </p>
        </div>

        {/* View Mode & Radar Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {viewMode === '2d' && (
            <button
              onClick={() => setRadarSweepActive(!radarSweepActive)}
              className={`p-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                radarSweepActive 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                  : 'bg-[#141824] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
              title={radarSweepActive ? 'Pause Radar Sweep' : 'Resume Radar Sweep'}
            >
              <Radio size={13} className={radarSweepActive ? 'animate-pulse' : ''} />
            </button>
          )}

          <div className="flex items-center gap-1 bg-[#141824] p-1 rounded-xl border border-white/[0.08] shadow-inner">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === '2d' 
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MapIcon size={13} />
              <span>2D Radar</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === '3d' 
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe size={13} />
              <span>3D Orbit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Quick-Sector Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-2 z-10">
        {SECTOR_HUBS.map((hub) => {
          const metrics = getRegionMetrics(hub.id);
          const isSelected = activeRegion === hub.id;
          const isHovered = hoveredSector === hub.id;

          return (
            <button
              key={hub.id}
              onClick={() => setActiveRegion(hub.id)}
              onMouseEnter={() => setHoveredSector(hub.id)}
              onMouseLeave={() => setHoveredSector(null)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#161B2E] border-cyan-500/60 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                  : isHovered
                  ? 'bg-[#121624] border-white/[0.15] text-zinc-200'
                  : 'bg-[#0E111A]/80 border-white/[0.06] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: hub.color, boxShadow: isSelected ? `0 0 8px ${hub.color}` : 'none' }} 
              />
              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                {hub.id}
              </span>
              <span className={`text-xs font-mono font-extrabold ${isSelected ? 'text-cyan-300' : 'text-zinc-400'}`}>
                <AnimatedNumber value={metrics.value} format={(v) => v.toFixed(1)} />
              </span>
              <span className={`text-[10px] font-mono font-bold ${metrics.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.change >= 0 ? '+' : ''}
                <AnimatedNumber value={metrics.change} format={(v) => v.toFixed(1)} />%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Visual Canvas Area */}
      {viewMode === '3d' ? (
        <div className="flex-1 w-full min-h-[360px] relative rounded-xl overflow-hidden border border-white/[0.06]">
          <AviationGlobe3D 
            className="w-full h-full border-0 shadow-none bg-transparent" 
            activeRegion={activeRegion}
            onSelectRegion={setActiveRegion}
            regionalData={regionalData}
          />
        </div>
      ) : (
        <div className="flex-1 relative flex items-center justify-center min-h-[340px] bg-[#070910]/40 backdrop-blur-md rounded-xl border border-white/[0.06] overflow-hidden">
          
          {/* Tactical Coordinate Grid Overlay */}
          <div className="absolute top-2 left-3 text-[9.5px] font-mono text-zinc-500 pointer-events-none z-10 flex items-center gap-3">
            <span>GRID: <strong className="text-zinc-300">IND-RADAR-2D</strong></span>
            <span>BEARING: <strong className="text-cyan-400">034° TRUE</strong></span>
            <span>POL: <strong className="text-emerald-400">DGCA W-84</strong></span>
          </div>

          <div className="absolute top-2 right-3 text-[9.5px] font-mono text-zinc-500 pointer-events-none z-10">
            <span>RADAR FREQ: <strong className="text-cyan-300">2.8 GHz S-BAND</strong></span>
          </div>

          {/* SVG Tactical Vector Map */}
          <svg viewBox="0 0 420 380" className="w-full h-full max-h-[350px] select-none">
            <defs>
              <linearGradient id="tacticalMapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0E1E3D" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#091326" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#050A14" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="radarSweepGrad2D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.35" />
                <stop offset="40%" stopColor="#00E5FF" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
              </linearGradient>

              <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Tactical Compass Radar Concentric Rings */}
            <circle cx="200" cy="205" r="165" fill="none" stroke="#1788FF" strokeWidth="0.6" strokeDasharray="3 6" opacity="0.18" />
            <circle cx="200" cy="205" r="115" fill="none" stroke="#1788FF" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.25" />
            <circle cx="200" cy="205" r="60" fill="none" stroke="#1788FF" strokeWidth="0.6" opacity="0.3" />

            {/* Crosshair Latitude / Longitude lines */}
            <line x1="35" y1="205" x2="365" y2="205" stroke="#1788FF" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />
            <line x1="200" y1="40" x2="200" y2="370" stroke="#1788FF" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />

            {/* Range markers */}
            <text x="205" y="148" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.7">250 NM</text>
            <text x="205" y="93" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.7">500 NM</text>
            <text x="205" y="45" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.7">750 NM</text>

            {/* Geographic Vector Outline of India Base */}
            <path
              d="
                M 175 30 
                C 185 20, 205 20, 215 35
                C 225 50, 235 60, 240 75
                C 255 85, 275 90, 285 105
                C 300 115, 340 125, 360 140
                C 375 155, 385 175, 370 190
                C 355 200, 335 185, 320 185
                C 310 195, 305 210, 290 220
                C 275 230, 260 250, 250 270
                C 235 305, 220 345, 195 385
                C 185 395, 175 395, 168 385
                C 150 350, 135 305, 120 270
                C 110 245, 95 230, 85 210
                C 75 190, 85 170, 95 160
                C 110 145, 125 155, 140 145
                C 150 135, 155 110, 160 90
                C 165 65, 170 45, 175 30 
                Z
              "
              fill="url(#tacticalMapGrad)"
              stroke="#1788FF"
              strokeWidth="1.5"
              className="filter drop-shadow-[0_0_15px_rgba(23,136,255,0.25)] transition-all duration-300"
            />

            {/* Sector Highlight Poly-Zones */}
            {SECTOR_HUBS.map((hub) => {
              const isSelected = activeRegion === hub.id;
              const isHovered = hoveredSector === hub.id;
              const polyPath = SECTOR_POLYGONS[hub.id];
              if (!polyPath) return null;

              return (
                <path
                  key={`poly-${hub.id}`}
                  d={polyPath}
                  fill={hub.color}
                  fillOpacity={isSelected ? 0.22 : isHovered ? 0.12 : 0.03}
                  stroke={hub.color}
                  strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.6}
                  strokeDasharray={isSelected ? 'none' : '3 2'}
                  className="transition-all duration-300 cursor-pointer"
                  onClick={() => setActiveRegion(hub.id)}
                  onMouseEnter={() => setHoveredSector(hub.id)}
                  onMouseLeave={() => setHoveredSector(null)}
                />
              );
            })}

            {/* Continuous 360-degree Sweeping Tactical Radar Beam */}
            {radarSweepActive && (
              <g className="origin-[200px_205px] animate-[spin_7s_linear_infinite] pointer-events-none">
                <path
                  d="M 200 205 L 365 205 A 165 165 0 0 0 316 88 Z"
                  fill="url(#radarSweepGrad2D)"
                />
                <line
                  x1="200"
                  y1="205"
                  x2="365"
                  y2="205"
                  stroke="#00E5FF"
                  strokeWidth="1.6"
                  strokeOpacity="0.9"
                  className="filter drop-shadow-[0_0_8px_#00E5FF]"
                />
              </g>
            )}

            {/* Great-Circle Flight Corridors */}
            {CORRIDOR_PATHS.map((corridor) => (
              <path
                key={corridor.id}
                d={corridor.d}
                fill="none"
                stroke={corridor.color}
                strokeWidth="1.6"
                strokeDasharray="4 3"
                opacity="0.65"
                className="transition-all"
              />
            ))}

            {/* Animated In-Flight Aircraft Gliding on Corridors */}
            {CORRIDOR_PATHS.map((corridor) => (
              <g key={`plane-${corridor.id}`}>
                <circle r="3" fill="#FFFFFF" className="filter drop-shadow-[0_0_8px_#FFFFFF]">
                  <animateMotion
                    path={corridor.d}
                    dur={corridor.dur}
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="6" fill="none" stroke={corridor.color} strokeWidth="1" opacity="0.8">
                  <animateMotion
                    path={corridor.d}
                    dur={corridor.dur}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}

            {/* Sector Hub Beacons */}
            {SECTOR_HUBS.map((hub) => {
              const coords = SECTOR_2D_MAP[hub.id] || { x: 200, y: 200 };
              const metrics = getRegionMetrics(hub.id);
              const isSelected = activeRegion === hub.id;
              const isHovered = hoveredSector === hub.id;

              return (
                <g
                  key={`hub-${hub.id}`}
                  onClick={() => setActiveRegion(hub.id)}
                  onMouseEnter={() => setHoveredSector(hub.id)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className="cursor-pointer group"
                >
                  {/* Expanding Sonar Ping Ring */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 16 : 10}
                    fill="none"
                    stroke={hub.color}
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />

                  {/* Outer Glowing Ring */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 10 : isHovered ? 8.5 : 7}
                    fill={isSelected ? hub.color : isHovered ? `${hub.color}90` : `${hub.color}40`}
                    stroke={isSelected ? '#FFFFFF' : isHovered ? '#00E5FF' : hub.color}
                    strokeWidth={isSelected ? 2 : isHovered ? 1.6 : 1.2}
                    className="transition-all duration-300 filter drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]"
                  />

                  {/* Center Core Dot */}
                  <circle cx={coords.x} cy={coords.y} r="3" fill="#FFFFFF" />

                  {/* Beacon Monospace Label */}
                  <text
                    x={coords.x + (coords.x > 260 ? -12 : 12)}
                    y={coords.y + 4}
                    fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : '600'}
                    textAnchor={coords.x > 260 ? 'end' : 'start'}
                    className="select-none filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                  >
                    {hub.code} ({metrics.value})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Selected Sector Intelligence & Deep Links Deck */}
      <div className="mt-3 p-3.5 rounded-xl bg-[#0E111A]/95 border border-white/[0.08] backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-md"
            style={{ 
              backgroundColor: `${selectedHub.color}25`, 
              color: selectedHub.color, 
              border: `1.5px solid ${selectedHub.color}60` 
            }}
          >
            {selectedHub.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{selectedHub.sectorName}</span>
              <span className="text-xs font-mono text-zinc-400">({selectedHub.name})</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/[0.06] text-zinc-300 font-semibold">
                Carrier: {selectedHub.dominantAirline}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span>Corridors: <strong className="text-zinc-200">{selectedHub.routes}</strong></span>
              <span>•</span>
              <span>Sector Yield: <strong className="text-white">{selectedHub.avgFare}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-white/[0.06]">
          <div className="text-right">
            <div className="text-base font-mono font-black text-cyan-300 flex items-center justify-end gap-1.5">
              <span>
                <AnimatedNumber value={selectedMetrics.value} format={(v) => v.toFixed(1)} />
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 ${
                selectedMetrics.change >= 0 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {selectedMetrics.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>
                  {selectedMetrics.change >= 0 ? '+' : ''}
                  <AnimatedNumber value={selectedMetrics.change} format={(v) => v.toFixed(1)} />%
                </span>
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">DGCA LASPEYRES WEIGHTED</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/price-trends')}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer whitespace-nowrap"
            >
              Analyze Trends
            </button>
            <button
              onClick={() => navigate(`/search?from=${selectedHub.code}`)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold text-cyan-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-[0_0_12px_rgba(0,229,255,0.2)]"
            >
              <span>Search {selectedHub.code}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
