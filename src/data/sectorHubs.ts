export interface SectorHubData {
  id: string; // 'North' | 'West' | 'South' | 'East' | 'Central'
  code: string;
  name: string;
  sectorName: string;
  lat: number;
  lon: number;
  color: string;
  hexColor: number;
  defaultVal: number;
  defaultChange: number;
  avgFare: string;
  routes: string;
  dominantAirline: string;
  monitoredRoutesCount: number;
  observationCount: number;
}

export const SECTOR_HUBS: SectorHubData[] = [
  { 
    id: 'North', 
    code: 'DEL', 
    name: 'Delhi (IGI)', 
    sectorName: 'Northern Sector', 
    lat: 28.5562, 
    lon: 77.1000, 
    color: '#00E5FF', 
    hexColor: 0x00E5FF, 
    defaultVal: 135.5, 
    defaultChange: 2.4, 
    avgFare: '₹5,840', 
    routes: 'DEL-BOM, DEL-BLR, DEL-GOI',
    dominantAirline: 'IndiGo / Air India',
    monitoredRoutesCount: 42,
    observationCount: 184220
  },
  { 
    id: 'West', 
    code: 'BOM', 
    name: 'Mumbai (CSMIA)', 
    sectorName: 'Western Sector', 
    lat: 19.0896, 
    lon: 72.8656, 
    color: '#38BDF8', 
    hexColor: 0x38BDF8, 
    defaultVal: 138.0, 
    defaultChange: 1.9, 
    avgFare: '₹5,120', 
    routes: 'BOM-BLR, BOM-GOI, BOM-DEL',
    dominantAirline: 'IndiGo / Akasa Air',
    monitoredRoutesCount: 38,
    observationCount: 162900
  },
  { 
    id: 'South', 
    code: 'BLR', 
    name: 'Bengaluru / MAA', 
    sectorName: 'Southern Sector', 
    lat: 13.1986, 
    lon: 77.7066, 
    color: '#10B981', 
    hexColor: 0x10B981, 
    defaultVal: 142.8, 
    defaultChange: 3.6, 
    avgFare: '₹4,690', 
    routes: 'BLR-BOM, MAA-DEL, BLR-HYD',
    dominantAirline: 'IndiGo / SpiceJet',
    monitoredRoutesCount: 46,
    observationCount: 198450
  },
  { 
    id: 'East', 
    code: 'CCU', 
    name: 'Kolkata (NSCBIA)', 
    sectorName: 'Eastern Sector', 
    lat: 22.6547, 
    lon: 88.4467, 
    color: '#F59E0B', 
    hexColor: 0xF59E0B, 
    defaultVal: 126.0, 
    defaultChange: 1.5, 
    avgFare: '₹4,350', 
    routes: 'CCU-DEL, CCU-BLR, CCU-GAU',
    dominantAirline: 'IndiGo / AI Express',
    monitoredRoutesCount: 28,
    observationCount: 112300
  },
  { 
    id: 'Central', 
    code: 'HYD', 
    name: 'Hyderabad (RGIA)', 
    sectorName: 'Central Sector', 
    lat: 17.2403, 
    lon: 78.4294, 
    color: '#A855F7', 
    hexColor: 0xA855F7, 
    defaultVal: 127.8, 
    defaultChange: -0.8, 
    avgFare: '₹4,120', 
    routes: 'HYD-DEL, HYD-BLR, HYD-BOM',
    dominantAirline: 'IndiGo / Vistara',
    monitoredRoutesCount: 30,
    observationCount: 129800
  },
];
