export interface IndianAirport {
  code: string;
  city: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'West' | 'East' | 'Central';
  popular: boolean;
  tag: string;
}

export const INDIAN_AIRPORTS: IndianAirport[] = [
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport', state: 'Delhi NCR', region: 'North', popular: true, tag: 'National Hub' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International', state: 'Maharashtra', region: 'West', popular: true, tag: 'Financial Capital' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', state: 'Karnataka', region: 'South', popular: true, tag: 'Tech Hub' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', state: 'Telangana', region: 'South', popular: true, tag: 'Metro Hub' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', state: 'Tamil Nadu', region: 'South', popular: true, tag: 'Southern Gateway' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose International', state: 'West Bengal', region: 'East', popular: true, tag: 'Eastern Gateway' },
  { code: 'GOI', city: 'Goa', name: 'Dabolim / Manohar International Airport', state: 'Goa', region: 'West', popular: true, tag: 'Leisure & Tourism' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International', state: 'Gujarat', region: 'West', popular: true, tag: 'Commercial Center' },
  { code: 'PNQ', city: 'Pune', name: 'Pune International Airport', state: 'Maharashtra', region: 'West', popular: false, tag: 'Auto & IT Hub' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport', state: 'Rajasthan', region: 'North', popular: false, tag: 'Heritage Tourism' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport', state: 'Kerala', region: 'South', popular: true, tag: 'Coastal Gateway' },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International', state: 'Uttar Pradesh', region: 'North', popular: false, tag: 'Regional Hub' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International', state: 'Assam', region: 'East', popular: false, tag: 'North East Gateway' },
  { code: 'IXC', city: 'Chandigarh', name: 'Shaheed Bhagat Singh International', state: 'Punjab/Haryana', region: 'North', popular: false, tag: 'Northern Gateway' },
  { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport', state: 'Jammu & Kashmir', region: 'North', popular: false, tag: 'Valley Tourism' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport', state: 'Kerala', region: 'South', popular: false, tag: 'Capital Gateway' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri International', state: 'Uttar Pradesh', region: 'North', popular: false, tag: 'Spiritual Center' },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan Airport', state: 'Bihar', region: 'East', popular: false, tag: 'Regional Capital' },
  { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik International Airport', state: 'Odisha', region: 'East', popular: false, tag: 'Coastal Capital' },
  { code: 'IXB', city: 'Bagdogra', name: 'Bagdogra International Airport', state: 'West Bengal', region: 'East', popular: false, tag: 'Himalayan Corridor' }
];

export interface FlightItem {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  price: number;
  availableSeats: number;
  aircraft: string;
  badge?: 'Cheapest' | 'Fastest' | 'Recommended' | 'Best Value';
  cabinClass: string;
}

export const AIRLINE_INFO: Record<string, { name: string; code: string; color: string; bg: string }> = {
  '6E': { name: 'IndiGo', code: '6E', color: '#002B7F', bg: 'bg-blue-600/20 text-blue-400 border-blue-500/30' },
  'AI': { name: 'Air India', code: 'AI', color: '#ED1B24', bg: 'bg-red-600/20 text-red-400 border-red-500/30' },
  'UK': { name: 'Vistara', code: 'UK', color: '#59114D', bg: 'bg-purple-600/20 text-purple-400 border-purple-500/30' },
  'QP': { name: 'Akasa Air', code: 'QP', color: '#FF671F', bg: 'bg-orange-600/20 text-orange-400 border-orange-500/30' },
  'SG': { name: 'SpiceJet', code: 'SG', color: '#E4251B', bg: 'bg-amber-600/20 text-amber-400 border-amber-500/30' },
  'I5': { name: 'Air India Express', code: 'IX', color: '#E4251B', bg: 'bg-rose-600/20 text-rose-400 border-rose-500/30' }
};

// Procedural dynamic flight generator for any route
export function generateRouteFlights(from: string, to: string, _date?: string, cabinClass: string = 'Economy'): FlightItem[] {
  const f = from.trim().toUpperCase().substring(0, 3) || 'DEL';
  const t = to.trim().toUpperCase().substring(0, 3) || 'BOM';

  // Seed baseline price based on route distance simulation
  let basePrice = 4600;
  if ((f === 'DEL' && t === 'BLR') || (f === 'BLR' && t === 'DEL')) basePrice = 6400;
  if ((f === 'DEL' && t === 'GOI') || (f === 'GOI' && t === 'DEL')) basePrice = 5800;
  if ((f === 'BOM' && t === 'BLR') || (f === 'BLR' && t === 'BOM')) basePrice = 4200;
  if ((f === 'MAA' && t === 'DEL') || (f === 'DEL' && t === 'MAA')) basePrice = 5100;
  if ((f === 'HYD' && t === 'DEL') || (f === 'DEL' && t === 'HYD')) basePrice = 4500;
  if ((f === 'CCU' && t === 'DEL') || (f === 'DEL' && t === 'CCU')) basePrice = 5200;
  if ((f === 'GOI' && t === 'BOM') || (f === 'BOM' && t === 'GOI')) basePrice = 3400;

  // Multipliers for cabin class
  const classMultiplier = cabinClass === 'Business' ? 2.8 : cabinClass === 'Premium Economy' ? 1.6 : cabinClass === 'First' ? 4.2 : 1.0;
  const targetBase = Math.round(basePrice * classMultiplier);

  const schedules = [
    { code: '6E', num: '204', dep: '06:00', arr: '08:15', dur: '2h 15m', stops: 'Non-stop', priceDelta: -450, aircraft: 'Airbus A320neo', badge: 'Cheapest' as const, seats: 14 },
    { code: 'AI', num: '805', dep: '07:30', arr: '09:40', dur: '2h 10m', stops: 'Non-stop', priceDelta: 250, aircraft: 'Boeing 787-8 Dreamliner', badge: 'Fastest' as const, seats: 8 },
    { code: 'UK', num: '992', dep: '09:15', arr: '11:35', dur: '2h 20m', stops: 'Non-stop', priceDelta: 680, aircraft: 'Airbus A321neo', badge: 'Recommended' as const, seats: 6 },
    { code: 'QP', num: '1102', dep: '11:45', arr: '14:05', dur: '2h 20m', stops: 'Non-stop', priceDelta: -320, aircraft: 'Boeing 737 MAX 8', badge: 'Best Value' as const, seats: 19 },
    { code: '6E', num: '5311', dep: '14:20', arr: '16:40', dur: '2h 20m', stops: 'Non-stop', priceDelta: 120, aircraft: 'Airbus A320neo', seats: 11 },
    { code: 'SG', num: '8169', dep: '16:50', arr: '19:15', dur: '2h 25m', stops: 'Non-stop', priceDelta: -280, aircraft: 'Boeing 737-800', seats: 5 },
    { code: 'AI', num: '657', dep: '19:10', arr: '21:30', dur: '2h 20m', stops: 'Non-stop', priceDelta: 410, aircraft: 'Airbus A321neo', seats: 9 },
    { code: 'UK', num: '944', dep: '21:30', arr: '23:45', dur: '2h 15m', stops: 'Non-stop', priceDelta: 310, aircraft: 'Airbus A320neo', seats: 7 }
  ];

  return schedules.map((item, idx) => ({
    id: `flight-${f}-${t}-${idx + 1}`,
    airline: AIRLINE_INFO[item.code]?.name || 'Airline',
    airlineCode: item.code,
    flightNumber: `${item.code}-${item.num}`,
    from: f,
    to: t,
    departureTime: item.dep,
    arrivalTime: item.arr,
    duration: item.dur,
    stops: item.stops,
    price: Math.max(2200, targetBase + item.priceDelta),
    availableSeats: item.seats,
    aircraft: item.aircraft,
    badge: item.badge,
    cabinClass
  }));
}

// Macroeconomic CPI Analytics Data (1Y, YTD, 3Y, 5Y, 6M)
export interface CPIDataPoint {
  month: string;
  airfare: number;
  cpi: number;
  transportCpi: number;
  atfIndex: number;
  spread: number;
  momAirfareChange: number;
}

export const CPI_DATA_SERIES: Record<string, CPIDataPoint[]> = {
  '6M': [
    { month: 'Apr 24', airfare: 122.4, cpi: 112.1, transportCpi: 118.2, atfIndex: 135.0, spread: 10.3, momAirfareChange: 1.8 },
    { month: 'May 24', airfare: 128.6, cpi: 112.8, transportCpi: 119.4, atfIndex: 138.2, spread: 15.8, momAirfareChange: 5.1 },
    { month: 'Jun 24', airfare: 136.2, cpi: 113.6, transportCpi: 121.0, atfIndex: 142.5, spread: 22.6, momAirfareChange: 5.9 },
    { month: 'Jul 24', airfare: 141.5, cpi: 114.2, transportCpi: 121.8, atfIndex: 145.8, spread: 27.3, momAirfareChange: 3.9 },
    { month: 'Aug 24', airfare: 137.9, cpi: 114.9, transportCpi: 122.1, atfIndex: 144.2, spread: 23.0, momAirfareChange: -2.5 },
    { month: 'Sep 24', airfare: 138.4, cpi: 115.4, transportCpi: 122.7, atfIndex: 146.1, spread: 23.0, momAirfareChange: 0.4 }
  ],
  'YTD': [
    { month: 'Jan 24', airfare: 114.2, cpi: 110.2, transportCpi: 115.8, atfIndex: 128.4, spread: 4.0, momAirfareChange: -1.2 },
    { month: 'Feb 24', airfare: 116.5, cpi: 110.9, transportCpi: 116.4, atfIndex: 130.1, spread: 5.6, momAirfareChange: 2.0 },
    { month: 'Mar 24', airfare: 120.3, cpi: 111.4, transportCpi: 117.2, atfIndex: 132.8, spread: 8.9, momAirfareChange: 3.3 },
    { month: 'Apr 24', airfare: 122.4, cpi: 112.1, transportCpi: 118.2, atfIndex: 135.0, spread: 10.3, momAirfareChange: 1.7 },
    { month: 'May 24', airfare: 128.6, cpi: 112.8, transportCpi: 119.4, atfIndex: 138.2, spread: 15.8, momAirfareChange: 5.1 },
    { month: 'Jun 24', airfare: 136.2, cpi: 113.6, transportCpi: 121.0, atfIndex: 142.5, spread: 22.6, momAirfareChange: 5.9 },
    { month: 'Jul 24', airfare: 141.5, cpi: 114.2, transportCpi: 121.8, atfIndex: 145.8, spread: 27.3, momAirfareChange: 3.9 },
    { month: 'Aug 24', airfare: 137.9, cpi: 114.9, transportCpi: 122.1, atfIndex: 144.2, spread: 23.0, momAirfareChange: -2.5 },
    { month: 'Sep 24', airfare: 138.4, cpi: 115.4, transportCpi: 122.7, atfIndex: 146.1, spread: 23.0, momAirfareChange: 0.4 }
  ],
  '1Y': [
    { month: 'Oct 23', airfare: 112.0, cpi: 108.5, transportCpi: 113.4, atfIndex: 124.0, spread: 3.5, momAirfareChange: 4.2 },
    { month: 'Nov 23', airfare: 118.2, cpi: 109.1, transportCpi: 114.2, atfIndex: 127.5, spread: 9.1, momAirfareChange: 5.5 },
    { month: 'Dec 23', airfare: 124.0, cpi: 109.8, transportCpi: 115.0, atfIndex: 131.0, spread: 14.2, momAirfareChange: 4.9 },
    { month: 'Jan 24', airfare: 114.2, cpi: 110.2, transportCpi: 115.8, atfIndex: 128.4, spread: 4.0, momAirfareChange: -7.9 },
    { month: 'Feb 24', airfare: 116.5, cpi: 110.9, transportCpi: 116.4, atfIndex: 130.1, spread: 5.6, momAirfareChange: 2.0 },
    { month: 'Mar 24', airfare: 120.3, cpi: 111.4, transportCpi: 117.2, atfIndex: 132.8, spread: 8.9, momAirfareChange: 3.3 },
    { month: 'Apr 24', airfare: 122.4, cpi: 112.1, transportCpi: 118.2, atfIndex: 135.0, spread: 10.3, momAirfareChange: 1.7 },
    { month: 'May 24', airfare: 128.6, cpi: 112.8, transportCpi: 119.4, atfIndex: 138.2, spread: 15.8, momAirfareChange: 5.1 },
    { month: 'Jun 24', airfare: 136.2, cpi: 113.6, transportCpi: 121.0, atfIndex: 142.5, spread: 22.6, momAirfareChange: 5.9 },
    { month: 'Jul 24', airfare: 141.5, cpi: 114.2, transportCpi: 121.8, atfIndex: 145.8, spread: 27.3, momAirfareChange: 3.9 },
    { month: 'Aug 24', airfare: 137.9, cpi: 114.9, transportCpi: 122.1, atfIndex: 144.2, spread: 23.0, momAirfareChange: -2.5 },
    { month: 'Sep 24', airfare: 138.4, cpi: 115.4, transportCpi: 122.7, atfIndex: 146.1, spread: 23.0, momAirfareChange: 0.4 }
  ],
  '3Y': [
    { month: '2021', airfare: 92.5, cpi: 95.2, transportCpi: 98.1, atfIndex: 90.0, spread: -2.7, momAirfareChange: 0 },
    { month: '2022', airfare: 108.4, cpi: 101.6, transportCpi: 107.4, atfIndex: 118.2, spread: 6.8, momAirfareChange: 17.2 },
    { month: '2023', airfare: 121.8, cpi: 108.3, transportCpi: 113.9, atfIndex: 129.5, spread: 13.5, momAirfareChange: 12.4 },
    { month: '2024', airfare: 138.4, cpi: 115.4, transportCpi: 122.7, atfIndex: 146.1, spread: 23.0, momAirfareChange: 13.6 }
  ],
  '5Y': [
    { month: '2019', airfare: 84.2, cpi: 88.0, transportCpi: 90.2, atfIndex: 82.0, spread: -3.8, momAirfareChange: 0 },
    { month: '2020', airfare: 76.8, cpi: 91.5, transportCpi: 93.4, atfIndex: 68.5, spread: -14.7, momAirfareChange: -8.8 },
    { month: '2021', airfare: 92.5, cpi: 95.2, transportCpi: 98.1, atfIndex: 90.0, spread: -2.7, momAirfareChange: 20.4 },
    { month: '2022', airfare: 108.4, cpi: 101.6, transportCpi: 107.4, atfIndex: 118.2, spread: 6.8, momAirfareChange: 17.2 },
    { month: '2023', airfare: 121.8, cpi: 108.3, transportCpi: 113.9, atfIndex: 129.5, spread: 13.5, momAirfareChange: 12.4 },
    { month: '2024', airfare: 138.4, cpi: 115.4, transportCpi: 122.7, atfIndex: 146.1, spread: 23.0, momAirfareChange: 13.6 }
  ]
};

// Airline Operating Cost Basket Weighting Breakdown (%)
export const COST_BASKET_BREAKDOWN = [
  { component: 'Aviation Turbine Fuel (ATF)', weight: 40, cpiCorrelation: 0.88, impact: 'Very High', color: '#1788FF' },
  { component: 'Aircraft Lease & Capital Depreciation', weight: 22, cpiCorrelation: 0.45, impact: 'High', color: '#4E55F5' },
  { component: 'Maintenance, Repair & Overhaul (MRO)', weight: 14, cpiCorrelation: 0.62, impact: 'Moderate', color: '#06B6D4' },
  { component: 'Cockpit & Cabin Crew Staff Costs', weight: 12, cpiCorrelation: 0.74, impact: 'Moderate', color: '#10B981' },
  { component: 'Airport Navigation, Landing & Security Fees', weight: 12, cpiCorrelation: 0.38, impact: 'Regulated', color: '#F59E0B' }
];

// Regional CPI vs Regional Airfare Divergence
export const REGIONAL_CPI_DIVERGENCE = [
  { region: 'Northern Corridor', airfareGrowth: '+26.4%', regionalCpi: '+5.4%', elasticity: '4.8x', topRoutes: 'DEL-BOM, DEL-BLR', driver: 'High corporate & diplomatic traffic density' },
  { region: 'Western Sector', airfareGrowth: '+22.1%', regionalCpi: '+5.7%', elasticity: '3.8x', topRoutes: 'BOM-BLR, BOM-GOI', driver: 'Financial and leisure holiday demand' },
  { region: 'Southern Network', airfareGrowth: '+28.9%', regionalCpi: '+6.1%', elasticity: '4.7x', topRoutes: 'BLR-HYD, MAA-DEL', driver: 'Tech corridor expansion & semiconductor travel' },
  { region: 'Eastern Corridor', airfareGrowth: '+18.5%', regionalCpi: '+5.2%', elasticity: '3.5x', topRoutes: 'CCU-DEL, GAU-DEL', driver: 'Festival surges (Durga Puja, Diwali) & regional connectivity' }
];
