import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TrendingUp, TrendingDown, Plane } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

interface RegionPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  hub: string;
  defaultVal: number;
  defaultChange: number;
  routes: string;
}

const REGION_HUBS: RegionPoint[] = [
  { id: 'North', name: 'Northern Sector', x: 195, y: 115, hub: 'DEL (Delhi)', defaultVal: 118.6, defaultChange: 2.3, routes: 'DEL-BOM, DEL-BLR' },
  { id: 'West', name: 'Western Sector', x: 125, y: 220, hub: 'BOM (Mumbai)', defaultVal: 124.2, defaultChange: 3.1, routes: 'BOM-BLR, BOM-GOI' },
  { id: 'East', name: 'Eastern Sector', x: 310, y: 190, hub: 'CCU (Kolkata)', defaultVal: 112.7, defaultChange: 1.8, routes: 'CCU-DEL, CCU-BLR' },
  { id: 'Central', name: 'Central Sector', x: 190, y: 225, hub: 'HYD (Hyderabad)', defaultVal: 121.4, defaultChange: -0.8, routes: 'HYD-DEL, HYD-BLR' },
  { id: 'South', name: 'Southern Sector', x: 175, y: 310, hub: 'BLR / MAA (Bengaluru/Chennai)', defaultVal: 131.5, defaultChange: 4.2, routes: 'BLR-BOM, MAA-DEL' },
];

export function RegionalMap() {
  const { theme, t } = useAppContext();
  const [activeRegion, setActiveRegion] = useState<string>('North');
  const isLight = theme === 'light';
  
  const { data: regionalData } = useQuery({
    queryKey: ['regionalIndex'],
    queryFn: api.getRegionalIndex,
    refetchInterval: 5000,
  });

  const getRegionMetrics = (regionId: string) => {
    if (Array.isArray(regionalData)) {
      const found = regionalData.find((r: any) => r.region?.toLowerCase() === regionId.toLowerCase());
      if (found) return { value: found.value, change: found.change };
    }
    const fallback = REGION_HUBS.find(h => h.id === regionId);
    return { value: fallback?.defaultVal ?? 122.0, change: fallback?.defaultChange ?? 2.5 };
  };

  const selectedPoint = REGION_HUBS.find(h => h.id === activeRegion) || REGION_HUBS[0];
  const selectedMetrics = getRegionMetrics(selectedPoint.id);

  return (
    <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-5 h-[420px] flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-2 z-10">
        <div>
          <h3 className="text-white text-[15px] font-bold flex items-center gap-2">
            <span>{t.regionalMapTitle || 'Airfare Index by Region'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </h3>
          <p className="text-slate-400 text-[11px]">{t.regionalMapSubtitle || 'Interactive Aviation Radar & Fare Corridors'}</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-[#1788FF] font-semibold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
            {selectedPoint.id} Sector: {selectedMetrics.value}
          </span>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {/* Custom Vector SVG Map of India & Aviation Routes */}
        <svg viewBox="0 0 400 420" className="w-full h-full max-h-[300px] select-none">
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1788FF" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#4E55F5" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0B1B42" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="mapGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="routeGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1788FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4E55F5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1788FF" stopOpacity="0.8" />
            </linearGradient>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Radar Background Rings */}
          <circle cx="200" cy="210" r="160" fill="none" stroke={isLight ? "#94A3B8" : "#1788FF"} strokeWidth="0.5" strokeDasharray="3 6" opacity={isLight ? "0.35" : "0.15"} />
          <circle cx="200" cy="210" r="110" fill="none" stroke={isLight ? "#94A3B8" : "#1788FF"} strokeWidth="0.5" strokeDasharray="2 4" opacity={isLight ? "0.4" : "0.2"} />
          <circle cx="200" cy="210" r="60" fill="none" stroke={isLight ? "#94A3B8" : "#1788FF"} strokeWidth="0.5" opacity={isLight ? "0.45" : "0.25"} />

          {/* Detailed Geographic Vector Outline of India */}
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
            fill={isLight ? "url(#mapGradientLight)" : "url(#mapGradient)"}
            stroke={isLight ? "#2563EB" : "#1788FF"}
            strokeWidth={isLight ? "1.8" : "1.5"}
            className={isLight ? "filter drop-shadow-[0_2px_8px_rgba(37,99,235,0.15)] transition-all duration-300" : "filter drop-shadow-[0_0_12px_rgba(23,136,255,0.25)] transition-all duration-300"}
          />

          {/* Aviation Corridors / Arcs */}
          {/* DEL (195, 115) to BOM (125, 220) */}
          <path d="M 195 115 Q 150 160 125 220" fill="none" stroke="url(#routeGrad1)" strokeWidth="1.8" strokeDasharray="3 2" className="opacity-80" />
          {/* BOM (125, 220) to BLR (175, 310) */}
          <path d="M 125 220 Q 140 270 175 310" fill="none" stroke="url(#routeGrad2)" strokeWidth="1.8" strokeDasharray="3 2" className="opacity-80" />
          {/* DEL (195, 115) to BLR (175, 310) */}
          <path d="M 195 115 Q 210 210 175 310" fill="none" stroke="#1788FF" strokeWidth="1.5" strokeDasharray="4 3" opacity={isLight ? "0.8" : "0.6"} />
          {/* DEL (195, 115) to CCU (310, 190) */}
          <path d="M 195 115 Q 260 140 310 190" fill="none" stroke={isLight ? "#0284C7" : "#00F2FE"} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.8" />
          {/* HYD (190, 225) to DEL (195, 115) */}
          <path d="M 190 225 L 195 115" fill="none" stroke="#4E55F5" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.7" />

          {/* Regional Sector Hub Markers */}
          {REGION_HUBS.map((hub) => {
            const metrics = getRegionMetrics(hub.id);
            const isSelected = activeRegion === hub.id;
            const isUp = metrics.change >= 0;

            return (
              <g 
                key={hub.id} 
                onClick={() => setActiveRegion(hub.id)}
                className="cursor-pointer group"
              >
                {/* Outer ping animation */}
                <circle 
                  cx={hub.x} 
                  cy={hub.y} 
                  r={isSelected ? 14 : 9} 
                  fill="none" 
                  stroke={isSelected ? (isLight ? "#0284C7" : "#00F2FE") : isUp ? "#10B981" : "#EF4444"} 
                  strokeWidth="1.5" 
                  className="animate-ping" 
                  opacity={isSelected ? "0.8" : "0.4"} 
                />
                
                {/* Selection ring */}
                <circle 
                  cx={hub.x} 
                  cy={hub.y} 
                  r={isSelected ? 9 : 6} 
                  fill={isSelected ? (isLight ? "#0284C7" : "#00F2FE") : isUp ? "#10B981" : "#EF4444"} 
                  className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(2,132,199,0.5)]" 
                />
                
                {/* Center dot */}
                <circle cx={hub.x} cy={hub.y} r="3" fill="#FFFFFF" />

                {/* Hub Label */}
                <text 
                  x={hub.x + (hub.x > 250 ? -12 : 12)} 
                  y={hub.y + 4} 
                  fill={isSelected ? (isLight ? "#0284C7" : "#00F2FE") : (isLight ? "#0F172A" : "#E2E8F0")} 
                  fontSize="11" 
                  fontWeight={isSelected ? "bold" : "700"}
                  textAnchor={hub.x > 250 ? "end" : "start"}
                  className="select-none drop-shadow-sm transition-colors"
                >
                  {hub.id} ({metrics.value})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Hub Floating Intelligence Card */}
        <div className={`absolute bottom-1 left-2 right-2 p-2.5 rounded-xl ${isLight ? 'bg-white/95 border-slate-200 shadow-md text-slate-900' : 'bg-[#030E26]/90 border-blue-500/30 text-white shadow-xl'} backdrop-blur-md border flex items-center justify-between text-xs z-20`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-500/15 border-blue-500/30 text-[#1788FF]'} border flex items-center justify-center`}>
              <Plane size={16} />
            </div>
            <div>
              <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-1.5`}>
                <span>{selectedPoint.name}</span>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-normal`}>({selectedPoint.hub})</span>
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Routes: {selectedPoint.routes}</div>
            </div>
          </div>

          <div className="text-right">
            <div className={`${isLight ? 'text-slate-900' : 'text-white'} font-extrabold text-sm`}>{selectedMetrics.value}</div>
            <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${selectedMetrics.change >= 0 ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : (isLight ? 'text-rose-700' : 'text-rose-400')}`}>
              {selectedMetrics.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{selectedMetrics.change >= 0 ? `+${selectedMetrics.change}` : selectedMetrics.change}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

