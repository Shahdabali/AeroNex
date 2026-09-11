import { useState, useMemo, useRef, lazy, Suspense, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  TrendingUp, TrendingDown, Globe, Map as MapIcon, 
  Radio, ArrowRight
} from 'lucide-react';
import { SECTOR_HUBS } from '../../data/sectorHubs';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { usePerformanceVisibility } from '../../hooks/usePerformanceVisibility';
import { useAppContext } from '../../context/AppProvider';

// Lazy-load 3D Orbit so Three.js (~600KB) is NEVER loaded unless user toggles 3D mode
const LazyAviationGlobe3D = lazy(() => 
  import('../visualizations/AviationGlobe3D').then(m => ({ default: m.AviationGlobe3D }))
);

interface Sector2DCoords {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  anchor: 'start' | 'end' | 'middle';
}

const SECTOR_2D_MAP: Record<string, Sector2DCoords> = {
  North: { x: 195, y: 95, labelX: 195, labelY: 72, anchor: 'middle' },
  West: { x: 122, y: 200, labelX: 105, labelY: 200, anchor: 'end' },
  South: { x: 172, y: 300, labelX: 195, labelY: 310, anchor: 'start' },
  East: { x: 305, y: 175, labelX: 320, labelY: 175, anchor: 'start' },
  Central: { x: 192, y: 205, labelX: 208, labelY: 205, anchor: 'start' },
};

// Static Vector Outlines for Indian Airspace Sectors
const SECTOR_POLYGONS: Record<string, string> = {
  North: 'M 175 35 C 185 25, 205 25, 215 40 C 235 55, 245 75, 280 100 L 220 155 L 160 145 Z',
  West: 'M 160 145 L 220 155 L 188 220 L 140 265 L 95 210 L 85 170 Z',
  South: 'M 140 265 L 188 220 L 245 265 L 220 340 L 195 380 L 168 380 Z',
  East: 'M 220 155 L 280 100 C 310 115, 345 125, 360 140 C 375 155, 380 175, 365 190 C 350 200, 330 185, 315 185 C 305 195, 290 210, 245 265 Z',
  Central: 'M 165 160 L 245 160 L 245 250 L 165 250 Z',
};

// Major Active Flight Corridors
const CORRIDOR_PATHS = [
  { id: 'DEL-BOM', from: 'North', to: 'West', d: 'M 195 95 Q 140 150 122 200', color: '#00E5FF' },
  { id: 'BOM-BLR', from: 'West', to: 'South', d: 'M 122 200 Q 140 255 172 300', color: '#38BDF8' },
  { id: 'DEL-BLR', from: 'North', to: 'South', d: 'M 195 95 Q 205 200 172 300', color: '#10B981' },
  { id: 'DEL-CCU', from: 'North', to: 'East', d: 'M 195 95 Q 260 130 305 175', color: '#F59E0B' },
  { id: 'HYD-DEL', from: 'Central', to: 'North', d: 'M 192 205 Q 194 150 195 95', color: '#A855F7' },
  { id: 'DEL-GOI', from: 'North', to: 'West', d: 'M 195 95 Q 148 180 130 240', color: '#00E5FF' },
];

export const RegionalMap = memo(function RegionalMap() {
  const navigate = useNavigate();
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldAnimate, prefersReducedMotion } = usePerformanceVisibility(containerRef);

  const [activeRegion, setActiveRegion] = useState<string>('North');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [radarSweepEnabled, setRadarSweepEnabled] = useState<boolean>(true);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  // Live real-time regional index data query (cache-coordinated)
  const { data: regionalData } = useQuery({
    queryKey: ['regionalIndex'],
    queryFn: api.getRegionalIndex,
    staleTime: 6000,
  });

  const getRegionMetrics = (regionId: string) => {
    if (Array.isArray(regionalData) && regionalData.length > 0) {
      const found = regionalData.find((r: any) => r.region?.toLowerCase() === regionId.toLowerCase());
      if (found) return { value: found.value, change: found.change };
    }
    const fallback = SECTOR_HUBS.find(h => h.id === regionId);
    return { value: fallback?.defaultVal ?? 135.5, change: fallback?.defaultChange ?? 2.4 };
  };

  const selectedHub = useMemo(() => {
    return SECTOR_HUBS.find(h => h.id === activeRegion) || SECTOR_HUBS[0];
  }, [activeRegion]);

  const selectedMetrics = getRegionMetrics(selectedHub.id);
  const isAnimationActive = shouldAnimate && radarSweepEnabled && !prefersReducedMotion;

  return (
    <div 
      ref={containerRef}
      className="bg-[#0C0E17] rounded-xl border border-white/[0.08] hover:border-white/[0.14] p-4 sm:p-5 min-h-[480px] flex flex-col relative overflow-hidden transition-colors shadow-xl select-none hover-lift"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white text-sm sm:text-base font-bold uppercase tracking-wider flex items-center gap-2">
              <span>AIRFARE INDEX BY REGION</span>
            </h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-400">
              <span className={`w-1.5 h-1.5 rounded-full bg-cyan-400 ${isAnimationActive ? 'animate-ping' : ''}`} />
              LIVE RADAR
            </span>
          </div>
          <p className="text-zinc-400 text-xs mt-0.5">
            Real-time regional movement of weighted domestic airfare indices
          </p>
        </div>

        {/* View Mode & Radar Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {viewMode === '2d' && (
            <button
              onClick={() => setRadarSweepEnabled(!radarSweepEnabled)}
              className={`p-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                radarSweepEnabled 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                  : 'bg-[#141824] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
              title={radarSweepEnabled ? 'Pause Radar Sweep' : 'Resume Radar Sweep'}
              aria-label="Toggle Radar Sweep"
            >
              <Radio size={13} className={isAnimationActive ? 'animate-pulse' : ''} />
            </button>
          )}

          <div className="flex items-center gap-1 bg-[#141824] p-1 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === '2d' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MapIcon size={13} />
              <span>2D RADAR</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === '3d' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe size={13} />
              <span>3D ORBIT</span>
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#161B2E] border-cyan-500/60 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : isHovered
                  ? 'bg-[#121624] border-white/[0.15] text-zinc-200'
                  : 'bg-[#0E111A]/80 border-white/[0.06] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: hub.color }} 
              />
              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                {hub.id.toUpperCase()}
              </span>
              <span className={`text-xs font-mono font-extrabold ${isSelected ? 'text-cyan-300' : 'text-zinc-400'}`}>
                <AnimatedNumber value={metrics.value} format={(v) => v.toFixed(1)} />
              </span>
              <span className={`text-[10px] font-mono font-bold tabular-nums ${metrics.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.change >= 0 ? '+' : ''}
                <AnimatedNumber value={metrics.change} format={(v) => v.toFixed(1)} />%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Visual Canvas Area */}
      {viewMode === '3d' ? (
        <div className="flex-1 w-full min-h-[350px] relative rounded-xl overflow-hidden border border-white/[0.06]">
          <Suspense fallback={
            <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-[#070910] text-zinc-400 gap-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono tracking-wider text-cyan-300">INITIALIZING 3D ORBITAL RADAR...</span>
            </div>
          }>
            <LazyAviationGlobe3D 
              className="w-full h-full border-0 shadow-none bg-transparent" 
              activeRegion={activeRegion}
              onSelectRegion={setActiveRegion}
              regionalData={regionalData}
              onWebGLUnsupported={() => setViewMode('2d')}
            />
          </Suspense>
        </div>
      ) : (
        <div className="flex-1 relative flex items-center justify-center min-h-[340px] bg-[#070910] rounded-xl border border-white/[0.06] overflow-hidden">
          
          {/* Tactical Coordinate Grid Overlay */}
          <div className="absolute top-2 left-3 text-[9.5px] font-mono text-zinc-500 pointer-events-none z-10 flex items-center gap-3">
            <span>RADAR: <strong className="text-zinc-300">IND-TACTICAL-2D</strong></span>
            <span>BEARING: <strong className="text-cyan-400">034° TRUE</strong></span>
            <span>POL: <strong className="text-emerald-400">DGCA W-84</strong></span>
          </div>

          <div className="absolute top-2 right-3 text-[9.5px] font-mono text-zinc-500 pointer-events-none z-10">
            <span>SWEEP FREQ: <strong className="text-cyan-300">8.0s S-BAND</strong></span>
          </div>

          {/* SVG Tactical Vector Map - Layered Architecture */}
          <svg viewBox="0 0 420 380" className="w-full h-full max-h-[350px] select-none">
            <defs>
              <linearGradient id="radarMapFillDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B152B" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#050A14" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="conicalSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isLight ? '#0284C7' : '#00E5FF'} stopOpacity={isLight ? 0.16 : 0.22} />
                <stop offset="50%" stopColor={isLight ? '#0284C7' : '#00E5FF'} stopOpacity="0.05" />
                <stop offset="100%" stopColor={isLight ? '#0284C7' : '#00E5FF'} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* LAYER 2: STATIC TACTICAL RADAR GRID */}
            <circle cx="200" cy="205" r="160" fill="none" stroke={isLight ? '#CBD5E1' : '#1788FF'} strokeWidth="0.6" strokeDasharray="3 5" opacity={isLight ? 0.4 : 0.16} />
            <circle cx="200" cy="205" r="110" fill="none" stroke={isLight ? '#CBD5E1' : '#1788FF'} strokeWidth="0.6" strokeDasharray="2 4" opacity={isLight ? 0.45 : 0.22} />
            <circle cx="200" cy="205" r="60" fill="none" stroke={isLight ? '#CBD5E1' : '#1788FF'} strokeWidth="0.6" opacity={isLight ? 0.5 : 0.26} />

            {/* Crosshair Latitude / Longitude lines */}
            <line x1="40" y1="205" x2="360" y2="205" stroke={isLight ? '#CBD5E1' : '#1788FF'} strokeWidth="0.5" strokeDasharray="2 4" opacity={isLight ? 0.4 : 0.2} />
            <line x1="200" y1="45" x2="200" y2="365" stroke={isLight ? '#CBD5E1' : '#1788FF'} strokeWidth="0.5" strokeDasharray="2 4" opacity={isLight ? 0.4 : 0.2} />

            {/* Range markers */}
            <text x="205" y="150" fill={isLight ? '#475569' : '#64748B'} fontSize="8" fontFamily="monospace" opacity="0.8">250 NM</text>
            <text x="205" y="98" fill={isLight ? '#475569' : '#64748B'} fontSize="8" fontFamily="monospace" opacity="0.8">500 NM</text>
            <text x="205" y="50" fill={isLight ? '#475569' : '#64748B'} fontSize="8" fontFamily="monospace" opacity="0.8">750 NM</text>

            {/* LAYER 1: STATIC INDIA VECTOR SHAPE (Rendered once, clean SVG without filters) */}
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
              fill={isLight ? '#F1F5F9' : 'url(#radarMapFillDark)'}
              stroke={isLight ? '#94A3B8' : '#1788FF'}
              strokeWidth="1.2"
              opacity="0.9"
            />

            {/* Sector Poly-Zones with Selective Focus */}
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
                  fillOpacity={isSelected ? (isLight ? 0.22 : 0.2) : isHovered ? 0.12 : (isLight ? 0.04 : 0.02)}
                  stroke={hub.color}
                  strokeWidth={isSelected ? 1.8 : 0.6}
                  strokeDasharray={isSelected ? 'none' : '3 2'}
                  opacity={isSelected ? 1.0 : 0.5}
                  className="transition-all duration-200 cursor-pointer"
                  onClick={() => setActiveRegion(hub.id)}
                  onMouseEnter={() => setHoveredSector(hub.id)}
                  onMouseLeave={() => setHoveredSector(null)}
                />
              );
            })}

            {/* LAYER 5: AIR ROUTE LINES (Static with subtle focus pulse on active route) */}
            {CORRIDOR_PATHS.map((corridor) => {
              const isCorridorActive = corridor.from === activeRegion || corridor.to === activeRegion;
              return (
                <path
                  key={corridor.id}
                  d={corridor.d}
                  fill="none"
                  stroke={corridor.color}
                  strokeWidth={isCorridorActive ? 1.8 : 0.9}
                  strokeDasharray={isCorridorActive ? '4 3' : '2 3'}
                  opacity={isCorridorActive ? 0.85 : 0.25}
                  className="transition-opacity duration-200"
                />
              );
            })}

            {/* LAYER 6: PURPOSEFUL RADAR SWEEP (Smooth CSS rotation, GPU transform) */}
            {isAnimationActive && (
              <g 
                className="origin-[200px_205px] pointer-events-none"
                style={{
                  animation: 'spin 8s linear infinite',
                  transformOrigin: '200px 205px',
                  willChange: 'transform',
                }}
              >
                <path
                  d="M 200 205 L 360 205 A 160 160 0 0 0 313 92 Z"
                  fill="url(#conicalSweep)"
                />
                <line
                  x1="200"
                  y1="205"
                  x2="360"
                  y2="205"
                  stroke={isLight ? '#0284C7' : '#00E5FF'}
                  strokeWidth="1.2"
                  strokeOpacity="0.8"
                />
              </g>
            )}

            {/* LAYER 4: REGIONAL DATA NODES (Staggered breathing pulse on active node) */}
            {SECTOR_HUBS.map((hub) => {
              const coords = SECTOR_2D_MAP[hub.id] || { x: 200, y: 200, labelX: 200, labelY: 200, anchor: 'middle' };
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
                  {/* Subtle breathing pulse ring for the selected node only */}
                  {isSelected && isAnimationActive && (
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="12"
                      fill="none"
                      stroke={hub.color}
                      strokeWidth="1.2"
                      opacity="0.35"
                    />
                  )}

                  {/* Beacon Core */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 5.5 : isHovered ? 4.5 : 3.5}
                    fill={hub.color}
                    stroke={isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#CBD5E1' : '#090A0F')}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  {/* Clean Monospace Label with Price & Trend */}
                  <g transform={`translate(${coords.labelX}, ${coords.labelY})`}>
                    <text
                      x="0"
                      y="0"
                      fill={isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#334155' : '#CBD5E1')}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : '600'}
                      textAnchor={coords.anchor}
                    >
                      {hub.id.toUpperCase()} {metrics.value.toFixed(1)}
                    </text>
                    <text
                      x="0"
                      y="11"
                      fill={metrics.change >= 0 ? '#10B981' : '#F43F5E'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor={coords.anchor}
                    >
                      {metrics.change >= 0 ? '+' : ''}{metrics.change.toFixed(1)}%
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Selected Sector Intelligence & Deep Links Deck */}
      <div className="mt-3 p-3.5 rounded-xl bg-[#0E111A] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-black text-sm shrink-0"
            style={{ 
              backgroundColor: `${selectedHub.color}20`, 
              color: selectedHub.color, 
              border: `1.5px solid ${selectedHub.color}60` 
            }}
          >
            {selectedHub.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase">{selectedHub.sectorName}</span>
              <span className="text-xs font-mono text-zinc-400">({selectedHub.name})</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/[0.06] text-zinc-300 font-semibold">
                Carrier: {selectedHub.dominantAirline}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span>Avg Observed Fare: <strong className="text-white tabular-nums">{selectedHub.avgFare}</strong></span>
              <span>•</span>
              <span>Routes Monitored: <strong className="text-zinc-200 tabular-nums">{selectedHub.monitoredRoutesCount}</strong></span>
              <span>•</span>
              <span>Observations: <strong className="text-zinc-200 tabular-nums">{selectedHub.observationCount.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-white/[0.06]">
          <div className="text-right">
            <div className="text-base font-mono font-black text-cyan-300 flex items-center justify-end gap-1.5 tabular-nums">
              <span>
                <AnimatedNumber value={selectedMetrics.value} format={(v) => v.toFixed(1)} />
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 tabular-nums ${
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
            <div className="text-[9.5px] font-mono text-zinc-500 uppercase">DGCA Laspeyres Weighted</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/price-trends')}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Analyze Trends
            </button>
            <button
              onClick={() => navigate(`/search?from=${selectedHub.code}`)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold text-cyan-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              <span>Search {selectedHub.code}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
