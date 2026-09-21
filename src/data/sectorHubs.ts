export interface SectorHubData {
  id: string; // 'North' | 'West' | 'South' | 'East' | 'Central'
  code: string;
  name: string;
  sectorName: string;
  lat: number;
  lon: number;
  color: string;
  hexColor: number;
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
  },
];
