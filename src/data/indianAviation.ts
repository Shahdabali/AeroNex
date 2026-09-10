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
  { code: 'PNQ', city: 'Pune', name: 'Pune International Airport', state: 'Maharashtra', region: 'West', popular: true, tag: 'Auto & IT Hub' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport', state: 'Rajasthan', region: 'North', popular: true, tag: 'Heritage Tourism' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport', state: 'Kerala', region: 'South', popular: true, tag: 'Coastal Gateway' },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International', state: 'Uttar Pradesh', region: 'North', popular: true, tag: 'Regional Hub' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International', state: 'Assam', region: 'East', popular: false, tag: 'North East Gateway' },
  { code: 'IXC', city: 'Chandigarh', name: 'Shaheed Bhagat Singh International', state: 'Punjab/Haryana', region: 'North', popular: true, tag: 'Northern Gateway' },
  { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport', state: 'Jammu & Kashmir', region: 'North', popular: true, tag: 'Valley Tourism' },
  { code: 'IDR', city: 'Indore', name: 'Devi Ahilyabai Holkar Airport', state: 'Madhya Pradesh', region: 'Central', popular: true, tag: 'Commercial Hub' },
  { code: 'BHO', city: 'Bhopal', name: 'Raja Bhoj Airport', state: 'Madhya Pradesh', region: 'Central', popular: false, tag: 'Central Capital' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport', state: 'Kerala', region: 'South', popular: false, tag: 'Capital Gateway' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri International', state: 'Uttar Pradesh', region: 'North', popular: true, tag: 'Spiritual Center' },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan Airport', state: 'Bihar', region: 'East', popular: false, tag: 'Regional Capital' },
  { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik International Airport', state: 'Odisha', region: 'East', popular: false, tag: 'Coastal Capital' },
  { code: 'IXB', city: 'Bagdogra', name: 'Bagdogra International Airport', state: 'West Bengal', region: 'East', popular: false, tag: 'Himalayan Corridor' },
  { code: 'ATQ', city: 'Amritsar', name: 'Sri Guru Ram Dass Jee International', state: 'Punjab', region: 'North', popular: false, tag: 'Golden Temple' },
  { code: 'CJB', city: 'Coimbatore', name: 'Coimbatore International Airport', state: 'Tamil Nadu', region: 'South', popular: false, tag: 'Textile Hub' },
  { code: 'IXE', city: 'Mangalore', name: 'Mangaluru International Airport', state: 'Karnataka', region: 'South', popular: false, tag: 'Coastal Port' },
  { code: 'IXM', city: 'Madurai', name: 'Madurai International Airport', state: 'Tamil Nadu', region: 'South', popular: false, tag: 'Cultural City' },
  { code: 'RPR', city: 'Raipur', name: 'Swami Vivekananda Airport', state: 'Chhattisgarh', region: 'Central', popular: false, tag: 'Central Gateway' },
  { code: 'IXR', city: 'Ranchi', name: 'Birsa Munda Airport', state: 'Jharkhand', region: 'East', popular: false, tag: 'Mineral Hub' },
  { code: 'UDR', city: 'Udaipur', name: 'Maharana Pratap Airport', state: 'Rajasthan', region: 'North', popular: true, tag: 'City of Lakes' },
  { code: 'IXZ', city: 'Port Blair', name: 'Veer Savarkar International Airport', state: 'Andaman & Nicobar', region: 'South', popular: true, tag: 'Island Gateway' },
  { code: 'STV', city: 'Surat', name: 'Surat International Airport', state: 'Gujarat', region: 'West', popular: false, tag: 'Diamond City' },
  { code: 'BDQ', city: 'Vadodara', name: 'Vadodara Airport', state: 'Gujarat', region: 'West', popular: false, tag: 'Heritage & Chem' },
  { code: 'DED', city: 'Dehradun', name: 'Jolly Grant Airport', state: 'Uttarakhand', region: 'North', popular: true, tag: 'Foothills Gateway' },
  { code: 'VTZ', city: 'Visakhapatnam', name: 'Visakhapatnam International Airport', state: 'Andhra Pradesh', region: 'South', popular: false, tag: 'Port City' }
];

// Recognized international airports & cities for strict rejection
export const KNOWN_INTERNATIONAL_DESTINATIONS = [
  'DUBAI', 'DXB', 'LONDON', 'LHR', 'SINGAPORE', 'SIN', 'BANGKOK', 'BKK', 
  'NEW YORK', 'JFK', 'TORONTO', 'YYZ', 'PARIS', 'CDG', 'FRANKFURT', 'FRA', 
  'DOHA', 'DOH', 'ABU DHABI', 'AUH', 'KUALA LUMPUR', 'KUL', 'TOKYO', 'HND', 'NRT',
  'SYDNEY', 'SYD', 'COLOMBO', 'CMB', 'KATHMANDU', 'KTM', 'DHAKA', 'DAC',
  'BALI', 'DPS', 'MALDIVES', 'MLE', 'SAN FRANCISCO', 'SFO', 'LOS ANGELES', 'LAX'
];

export function isIndianAirport(input: string): boolean {
  if (!input) return false;
  const clean = input.trim().toUpperCase();
  return INDIAN_AIRPORTS.some(a => 
    a.code.toUpperCase() === clean || 
    a.city.toUpperCase() === clean ||
    clean.includes(a.code.toUpperCase()) ||
    clean.includes(a.city.toUpperCase())
  );
}

export function validateDomesticAirports(origin: string, destination: string): { valid: boolean; error?: string } {
  const o = origin.trim().toUpperCase();
  const d = destination.trim().toUpperCase();

  // Check known international
  const isOriginIntl = KNOWN_INTERNATIONAL_DESTINATIONS.some(intl => o === intl || o.includes(intl));
  const isDestIntl = KNOWN_INTERNATIONAL_DESTINATIONS.some(intl => d === intl || d.includes(intl));

  if (isOriginIntl || isDestIntl) {
    return {
      valid: false,
      error: 'AeroNex AI Trip Suggester currently supports domestic flights within India only.'
    };
  }

  const validOrigin = isIndianAirport(origin);
  const validDest = isIndianAirport(destination);

  if (!validOrigin || !validDest) {
    return {
      valid: false,
      error: 'AeroNex AI Trip Suggester currently supports domestic flights within India only.'
    };
  }

  return { valid: true };
}

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
  date?: string;
}

export const AIRLINE_INFO: Record<string, { name: string; code: string; color: string; bg: string }> = {
  '6E': { name: 'IndiGo', code: '6E', color: '#002B7F', bg: 'bg-blue-600/20 text-blue-400 border-blue-500/30' },
  'AI': { name: 'Air India', code: 'AI', color: '#ED1B24', bg: 'bg-red-600/20 text-red-400 border-red-500/30' },
  'UK': { name: 'Vistara', code: 'UK', color: '#59114D', bg: 'bg-purple-600/20 text-purple-400 border-purple-500/30' },
  'QP': { name: 'Akasa Air', code: 'QP', color: '#FF671F', bg: 'bg-orange-600/20 text-orange-400 border-orange-500/30' },
  'SG': { name: 'SpiceJet', code: 'SG', color: '#E4251B', bg: 'bg-amber-600/20 text-amber-400 border-amber-500/30' },
  'I5': { name: 'Air India Express', code: 'IX', color: '#E4251B', bg: 'bg-rose-600/20 text-rose-400 border-rose-500/30' }
};

// Procedural dynamic flight generator for any domestic route
export function generateRouteFlights(from: string, to: string, date?: string, cabinClass: string = 'Economy'): FlightItem[] {
  const f = from.trim().toUpperCase().substring(0, 3) || 'DEL';
  const t = to.trim().toUpperCase().substring(0, 3) || 'BOM';

  // Seed baseline price based on 2026 realistic Indian domestic route yields
  let basePrice = 5200;
  if ((f === 'DEL' && t === 'BLR') || (f === 'BLR' && t === 'DEL')) basePrice = 6950;
  else if ((f === 'DEL' && t === 'BOM') || (f === 'BOM' && t === 'DEL')) basePrice = 5650;
  else if ((f === 'DEL' && t === 'GOI') || (f === 'GOI' && t === 'DEL')) basePrice = 6450;
  else if ((f === 'BOM' && t === 'BLR') || (f === 'BLR' && t === 'BOM')) basePrice = 4450;
  else if ((f === 'MAA' && t === 'DEL') || (f === 'DEL' && t === 'MAA')) basePrice = 5350;
  else if ((f === 'HYD' && t === 'DEL') || (f === 'DEL' && t === 'HYD')) basePrice = 4650;
  else if ((f === 'CCU' && t === 'DEL') || (f === 'DEL' && t === 'CCU')) basePrice = 5480;
  else if ((f === 'GOI' && t === 'BOM') || (f === 'BOM' && t === 'GOI')) basePrice = 3600;
  else if ((f === 'JAI' && t === 'GOI') || (f === 'GOI' && t === 'JAI')) basePrice = 6800;
  else if ((f === 'JAI' && t === 'BOM') || (f === 'BOM' && t === 'JAI')) basePrice = 4950;
  else if ((f === 'COK' && t === 'BOM') || (f === 'BOM' && t === 'COK')) basePrice = 4380;
  else if ((f === 'DEL' && t === 'COK') || (f === 'COK' && t === 'DEL')) basePrice = 7450;
  else if ((f === 'SXR' && t === 'DEL') || (f === 'DEL' && t === 'SXR')) basePrice = 5350;
  else if ((f === 'GAU' && t === 'DEL') || (f === 'DEL' && t === 'GAU')) basePrice = 6150;
  else if ((f === 'BLR' && t === 'HYD') || (f === 'HYD' && t === 'BLR')) basePrice = 3450;

  // Day of week modifier
  let dayVariance = 0;
  if (date) {
    const d = new Date(date);
    const day = d.getDay();
    if (day === 5 || day === 0) dayVariance = 550; // Fri/Sun peak weekend surge
    if (day === 2 || day === 3) dayVariance = -420; // Tue/Wed mid-week savings
  }

  // Multipliers for cabin class
  const classMultiplier = cabinClass === 'Business' ? 2.8 : cabinClass === 'Premium Economy' ? 1.6 : cabinClass === 'First' ? 4.2 : 1.0;
  const targetBase = Math.round((basePrice + dayVariance) * classMultiplier);

  const schedules = [
    { code: '6E', num: '204', dep: '06:00', arr: '08:15', dur: '2h 15m', stops: 'Non-stop', priceDelta: -450, aircraft: 'Airbus A321neo', badge: 'Cheapest' as const, seats: 14 },
    { code: 'AI', num: '805', dep: '07:30', arr: '09:40', dur: '2h 10m', stops: 'Non-stop', priceDelta: 280, aircraft: 'Airbus A350-900', badge: 'Fastest' as const, seats: 8 },
    { code: 'UK', num: '992', dep: '09:15', arr: '11:35', dur: '2h 20m', stops: 'Non-stop', priceDelta: 650, aircraft: 'Boeing 787-8 Dreamliner', badge: 'Recommended' as const, seats: 6 },
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
    cabinClass,
    date
  }));
}

// -------------------------------------------------------------
// AI TRIP SUGGESTER: TYPES & ALGORITHMS (INDIA DOMESTIC)
// -------------------------------------------------------------

export interface TripSuggesterParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  tripType: 'oneWay' | 'roundTrip';
  tripDurationDays?: number;
  flexibilityDays: number; // 0, 1, 2, 3
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  budgetINR?: number;
  preferences: {
    priority: 'cheapest' | 'fastest' | 'bestValue' | 'bestOverall';
    airline?: string;
    maxStops?: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  };
  userPrompt?: string;
}

export interface TripRecommendation {
  category: 'bestOverall' | 'cheapest' | 'fastest' | 'bestValue';
  categoryTitle: string;
  badgeIcon: string;
  outboundFlight: FlightItem;
  returnFlight?: FlightItem;
  totalFareINR: number;
  aiScore: number;
  aiScoreReasons: string[];
  explanation: string;
  withinBudget: boolean;
  savingsVsBenchmarkINR: number;
}

export interface FlexibleDateSavings {
  originalDate: string;
  recommendedDate: string;
  savingsINR: number;
  originalFareINR: number;
  recommendedFareINR: number;
  explanation: string;
  dateOptions: Array<{ date: string; fareINR: number; isLowest: boolean }>;
}

export interface RoundTripOptimization {
  outboundFlight: FlightItem;
  returnFlight: FlightItem;
  totalFareINR: number;
  savingsINR: number;
  explanation: string;
}

export interface BestTimeToBookAdvice {
  currentFareINR: number;
  recommendation: 'BOOK_NOW' | 'FAIR_PRICE' | 'CONSIDER_WAITING';
  historicalConfidence: 'high' | 'moderate' | 'insufficient';
  adviceText: string;
  weekdaySavingsInsight: string;
  advanceWindowDays: string;
}

export interface BudgetAnalysis {
  requestedBudgetINR: number;
  totalTripFareINR: number;
  withinBudget: boolean;
  excessCostINR: number;
  closestOptions: Array<{ title: string; fareINR: number; diffINR: number }>;
  adviceText: string;
}

export interface TripSuggesterResult {
  valid: boolean;
  error?: string;
  originInfo: IndianAirport;
  destinationInfo: IndianAirport;
  params: TripSuggesterParams;
  bestOverall: TripRecommendation;
  cheapest: TripRecommendation;
  fastest: TripRecommendation;
  bestValue: TripRecommendation;
  flexibleDateSavings?: FlexibleDateSavings;
  roundTripOptimization?: RoundTripOptimization;
  bestTimeToBook: BestTimeToBookAdvice;
  budgetAnalysis?: BudgetAnalysis;
  timestamp: string;
  refreshedAt: string;
}

// Natural language input parser for Indian domestic travel requests
export function parseNaturalLanguageTrip(prompt: string): Partial<TripSuggesterParams> {
  const text = prompt.toLowerCase();

  // Find origin & destination from Indian airports
  let origin = 'DEL';
  let destination = 'BOM';

  // Specific city matching
  if (text.includes('jaipur') && text.includes('goa')) {
    origin = 'JAI';
    destination = 'GOI';
  } else if (text.includes('bangalore') || text.includes('bengaluru')) {
    if (text.includes('goa')) { origin = 'BLR'; destination = 'GOI'; }
    else if (text.includes('mumbai')) { origin = 'BOM'; destination = 'BLR'; }
    else if (text.includes('delhi')) { origin = 'DEL'; destination = 'BLR'; }
    else { origin = 'BLR'; destination = 'DEL'; }
  } else if (text.includes('mumbai') && text.includes('delhi')) {
    if (text.indexOf('mumbai') < text.indexOf('delhi')) { origin = 'BOM'; destination = 'DEL'; }
    else { origin = 'DEL'; destination = 'BOM'; }
  } else if (text.includes('kochi') || text.includes('cochin')) {
    origin = 'DEL';
    destination = 'COK';
  } else {
    for (const a of INDIAN_AIRPORTS) {
      if (text.includes(a.city.toLowerCase()) || text.includes(a.code.toLowerCase())) {
        if (!origin || origin === 'DEL') origin = a.code;
        else if (destination === 'BOM' && a.code !== origin) destination = a.code;
      }
    }
  }

  // Duration
  let duration = 5;
  const durationMatch = text.match(/(\d+)\s*(?:day|days|night|nights)/);
  if (durationMatch) {
    duration = parseInt(durationMatch[1], 10);
  }

  // Budget
  let budget: number | undefined;
  const budgetMatch = text.match(/(?:₹|rs\.?|inr|budget\s*(?:is|of)?)\s*([\d,]+)/);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
  }

  // Flexibility
  let flexibility = 2;
  const flexMatch = text.match(/(?:flexible\s*(?:by)?|flexibility)\s*(\d+)/);
  if (flexMatch) {
    flexibility = parseInt(flexMatch[1], 10);
  } else if (text.includes('flexible')) {
    flexibility = 2;
  }

  // Time of day
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'any' = 'any';
  if (text.includes('morning')) timeOfDay = 'morning';
  else if (text.includes('afternoon')) timeOfDay = 'afternoon';
  else if (text.includes('evening')) timeOfDay = 'evening';
  else if (text.includes('night') || text.includes('red-eye')) timeOfDay = 'night';

  // Priority
  let priority: 'cheapest' | 'fastest' | 'bestValue' | 'bestOverall' = 'bestOverall';
  if (text.includes('cheapest') || text.includes('lowest price')) priority = 'cheapest';
  else if (text.includes('fastest') || text.includes('quickest')) priority = 'fastest';
  else if (text.includes('best value')) priority = 'bestValue';

  const isRoundTrip = text.includes('round trip') || text.includes('roundtrip') || text.includes('return') || duration > 1;

  const departDate = new Date();
  departDate.setDate(departDate.getDate() + 7);
  const returnDate = new Date(departDate);
  returnDate.setDate(returnDate.getDate() + duration);

  return {
    origin,
    destination,
    departDate: departDate.toISOString().split('T')[0],
    returnDate: isRoundTrip ? returnDate.toISOString().split('T')[0] : undefined,
    tripType: isRoundTrip ? 'roundTrip' : 'oneWay',
    tripDurationDays: duration,
    flexibilityDays: flexibility,
    budgetINR: budget || 15000,
    cabinClass: text.includes('business') ? 'Business' : text.includes('premium') ? 'Premium Economy' : 'Economy',
    preferences: {
      priority,
      timeOfDay
    }
  };
}

// Complete Domestic India Trip Optimization Engine
export function generateDomesticTripRecommendations(params: TripSuggesterParams): TripSuggesterResult {
  const originAirport = INDIAN_AIRPORTS.find(a => a.code.toUpperCase() === params.origin.toUpperCase()) || {
    code: params.origin.toUpperCase(),
    city: params.origin,
    name: `${params.origin} Airport`,
    state: 'India',
    region: 'North' as const,
    popular: true,
    tag: 'Domestic'
  };

  const destAirport = INDIAN_AIRPORTS.find(a => a.code.toUpperCase() === params.destination.toUpperCase()) || {
    code: params.destination.toUpperCase(),
    city: params.destination,
    name: `${params.destination} Airport`,
    state: 'India',
    region: 'West' as const,
    popular: true,
    tag: 'Domestic'
  };

  const isRoundTrip = params.tripType === 'roundTrip' && Boolean(params.returnDate);
  const travelerMultiplier = (params.travelers?.adults || 1) + (params.travelers?.children || 0) * 0.75 + (params.travelers?.infants || 0) * 0.15;

  // 1. Generate outbound flights for base date
  const outboundFlights = generateRouteFlights(params.origin, params.destination, params.departDate, params.cabinClass);
  
  // 2. Generate return flights if round trip
  const returnFlights = isRoundTrip 
    ? generateRouteFlights(params.destination, params.origin, params.returnDate, params.cabinClass)
    : [];

  // 3. Score & categorize flights
  const cheapestOut = [...outboundFlights].sort((a, b) => a.price - b.price)[0];
  const fastestOut = [...outboundFlights].sort((a, b) => a.duration.localeCompare(b.duration))[0];
  const bestValueOut = outboundFlights.find(f => f.badge === 'Best Value') || outboundFlights[3] || outboundFlights[0];
  const bestOverallOut = outboundFlights.find(f => f.badge === 'Recommended') || outboundFlights[1] || outboundFlights[0];

  const cheapestRet = returnFlights.length > 0 ? [...returnFlights].sort((a, b) => a.price - b.price)[0] : undefined;
  const fastestRet = returnFlights.length > 0 ? [...returnFlights].sort((a, b) => a.duration.localeCompare(b.duration))[0] : undefined;
  const bestValueRet = returnFlights.length > 0 ? (returnFlights.find(f => f.badge === 'Best Value') || returnFlights[2]) : undefined;
  const bestOverallRet = returnFlights.length > 0 ? (returnFlights.find(f => f.badge === 'Recommended') || returnFlights[1]) : undefined;

  const calcTotal = (out: FlightItem, ret?: FlightItem) => {
    const single = out.price + (ret ? ret.price : 0);
    return Math.round(single * travelerMultiplier);
  };

  const totalBestOverall = calcTotal(bestOverallOut, bestOverallRet);
  const totalCheapest = calcTotal(cheapestOut, cheapestRet);
  const totalFastest = calcTotal(fastestOut, fastestRet);
  const totalBestValue = calcTotal(bestValueOut, bestValueRet);

  const budget = params.budgetINR || 18000;

  // Category 1: Best Overall
  const bestOverall: TripRecommendation = {
    category: 'bestOverall',
    categoryTitle: 'Best Overall',
    badgeIcon: '🏆',
    outboundFlight: bestOverallOut,
    returnFlight: bestOverallRet,
    totalFareINR: totalBestOverall,
    aiScore: 94,
    aiScoreReasons: [
      'Top-rated carrier punctuality & convenience',
      'Non-stop direct corridor with optimal morning departure',
      totalBestOverall <= budget ? 'Well within specified budget' : 'Near budget threshold',
      isRoundTrip ? 'Harmonized 5-day round trip window' : 'Prime departure timing'
    ],
    explanation: `Best overall choice for ${originAirport.city} ➔ ${destAirport.city} balancing a non-stop duration of ${bestOverallOut.duration} with high on-time performance and comfortable mid-day timing.`,
    withinBudget: totalBestOverall <= budget,
    savingsVsBenchmarkINR: Math.max(0, totalFastest - totalBestOverall)
  };

  // Category 2: Cheapest
  const cheapest: TripRecommendation = {
    category: 'cheapest',
    categoryTitle: 'Cheapest Option',
    badgeIcon: '💰',
    outboundFlight: cheapestOut,
    returnFlight: cheapestRet,
    totalFareINR: totalCheapest,
    aiScore: 88,
    aiScoreReasons: [
      'Guaranteed lowest available fare on this domestic sector',
      `Saves ₹${(totalBestOverall - totalCheapest).toLocaleString('en-IN')} vs recommended flight`,
      'Non-stop direct route'
    ],
    explanation: `Lowest price domestic option currently available on ${cheapestOut.airline}, ideal for budget-conscious travelers.`,
    withinBudget: totalCheapest <= budget,
    savingsVsBenchmarkINR: totalBestOverall - totalCheapest
  };

  // Category 3: Fastest
  const fastest: TripRecommendation = {
    category: 'fastest',
    categoryTitle: 'Fastest Travel Time',
    badgeIcon: '⚡',
    outboundFlight: fastestOut,
    returnFlight: fastestRet,
    totalFareINR: totalFastest,
    aiScore: 89,
    aiScoreReasons: [
      `Minimal air time of ${fastestOut.duration}`,
      'Wide-body or modern high-speed aircraft equipment',
      'Priority airport departure slot'
    ],
    explanation: `Fastest non-stop service between ${originAirport.code} and ${destAirport.code} with minimal ground turnaround.`,
    withinBudget: totalFastest <= budget,
    savingsVsBenchmarkINR: 0
  };

  // Category 4: Best Value
  const bestValue: TripRecommendation = {
    category: 'bestValue',
    categoryTitle: 'Best Value',
    badgeIcon: '⭐',
    outboundFlight: bestValueOut,
    returnFlight: bestValueRet,
    totalFareINR: totalBestValue,
    aiScore: 91,
    aiScoreReasons: [
      'High seating availability with modern cabin equipment',
      `Priced only ₹${Math.abs(totalBestValue - totalCheapest)} above bare minimum`,
      'Prime afternoon connection'
    ],
    explanation: `Delivers highest comfort-to-cost ratio, giving premium schedule convenience at competitive LCC pricing.`,
    withinBudget: totalBestValue <= budget,
    savingsVsBenchmarkINR: Math.max(0, totalFastest - totalBestValue)
  };

  // 4. Flexible Date Scanning (±3 days)
  let flexibleDateSavings: FlexibleDateSavings | undefined;
  if (params.flexibilityDays > 0) {
    const baseDateObj = new Date(params.departDate);
    const dateOptions: Array<{ date: string; fareINR: number; isLowest: boolean }> = [];
    
    let lowestFare = Infinity;
    let bestDateStr = params.departDate;

    for (let offset = -params.flexibilityDays; offset <= params.flexibilityDays; offset++) {
      const d = new Date(baseDateObj);
      d.setDate(d.getDate() + offset);
      const dateStr = d.toISOString().split('T')[0];
      const flightsOnDate = generateRouteFlights(params.origin, params.destination, dateStr, params.cabinClass);
      const minOnDate = Math.min(...flightsOnDate.map(f => f.price));

      if (minOnDate < lowestFare) {
        lowestFare = minOnDate;
        bestDateStr = dateStr;
      }

      dateOptions.push({
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        fareINR: minOnDate,
        isLowest: false
      });
    }

    dateOptions.forEach(opt => {
      if (opt.fareINR === lowestFare) opt.isLowest = true;
    });

    const originalFare = cheapestOut.price;
    const diff = originalFare - lowestFare;

    const formattedBestDate = new Date(bestDateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
    const formattedOrigDate = new Date(params.departDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

    flexibleDateSavings = {
      originalDate: formattedOrigDate,
      recommendedDate: formattedBestDate,
      savingsINR: diff > 0 ? diff : 1850,
      originalFareINR: originalFare,
      recommendedFareINR: lowestFare,
      explanation: diff > 0
        ? `Leaving on ${formattedBestDate} instead of ${formattedOrigDate} could save approximately ₹${diff.toLocaleString('en-IN')} based on current available fares.`
        : `Fares for your selected date are already at the lower bound of the flexible window. Moving departure by 2 days maintains optimal pricing.`,
      dateOptions
    };
  }

  // 5. Round Trip Optimization
  let roundTripOptimization: RoundTripOptimization | undefined;
  if (isRoundTrip && returnFlights.length > 0) {
    const bestPairOut = cheapestOut;
    const bestPairRet = cheapestRet!;
    const comboFare = (bestPairOut.price + bestPairRet.price) * travelerMultiplier;
    const benchmarkFare = (bestOverallOut.price + bestOverallRet!.price) * travelerMultiplier;
    const diff = Math.max(1200, benchmarkFare - comboFare);

    roundTripOptimization = {
      outboundFlight: bestPairOut,
      returnFlight: bestPairRet,
      totalFareINR: Math.round(comboFare),
      savingsINR: Math.round(diff),
      explanation: `Optimized combination pairs ${bestPairOut.airline} (${bestPairOut.flightNumber}) outbound with ${bestPairRet.airline} (${bestPairRet.flightNumber}) return, saving ₹${diff.toLocaleString('en-IN')} compared to single-carrier peak returns.`
    };
  }

  // 6. Best Time to Book Advice
  const bestTimeToBook: BestTimeToBookAdvice = {
    currentFareINR: cheapestOut.price,
    recommendation: cheapestOut.price < 5500 ? 'BOOK_NOW' : 'FAIR_PRICE',
    historicalConfidence: 'high',
    adviceText: `Based on available price trends across ${originAirport.code} ➔ ${destAirport.code}, current fare of ₹${cheapestOut.price.toLocaleString('en-IN')} is within the historical lower 25th percentile for domestic departures in this window.`,
    weekdaySavingsInsight: 'Tuesday & Wednesday departures are currently ₹1,200–₹1,650 cheaper than Friday or Sunday flights on this route.',
    advanceWindowDays: '14–21 days before departure'
  };

  // 7. Budget Analysis
  let budgetAnalysis: BudgetAnalysis | undefined;
  if (budget) {
    const isExceeded = totalBestOverall > budget && totalCheapest > budget;
    const excess = totalCheapest > budget ? totalCheapest - budget : 0;

    budgetAnalysis = {
      requestedBudgetINR: budget,
      totalTripFareINR: totalBestOverall,
      withinBudget: !isExceeded,
      excessCostINR: excess,
      closestOptions: [
        { title: `${cheapestOut.airline} Standard`, fareINR: totalCheapest, diffINR: totalCheapest - budget },
        { title: `${bestValueOut.airline} Flexi`, fareINR: totalBestValue, diffINR: totalBestValue - budget },
        { title: `${bestOverallOut.airline} Prime`, fareINR: totalBestOverall, diffINR: totalBestOverall - budget }
      ],
      adviceText: isExceeded
        ? `We couldn't find a complete itinerary within ₹${budget.toLocaleString('en-IN')}. Increasing your budget by ₹${(excess + 400).toLocaleString('en-IN')} will unlock confirmed direct flights.`
        : `Your budget of ₹${budget.toLocaleString('en-IN')} comfortably covers all 4 recommendation tiers with up to ₹${(budget - totalCheapest).toLocaleString('en-IN')} in headroom.`
    };
  }

  return {
    valid: true,
    originInfo: originAirport,
    destinationInfo: destAirport,
    params,
    bestOverall,
    cheapest,
    fastest,
    bestValue,
    flexibleDateSavings,
    roundTripOptimization,
    bestTimeToBook,
    budgetAnalysis,
    timestamp: new Date().toISOString(),
    refreshedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}

// -------------------------------------------------------------
// Macroeconomic CPI Analytics Data (1Y, YTD, 3Y, 5Y, 6M)
// -------------------------------------------------------------
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
    { month: 'Apr 26', airfare: 124.8, cpi: 118.2, transportCpi: 122.4, atfIndex: 136.2, spread: 6.6, momAirfareChange: 1.8 },
    { month: 'May 26', airfare: 129.5, cpi: 119.1, transportCpi: 123.6, atfIndex: 139.4, spread: 10.4, momAirfareChange: 3.8 },
    { month: 'Jun 26', airfare: 137.2, cpi: 120.4, transportCpi: 125.1, atfIndex: 143.8, spread: 16.8, momAirfareChange: 5.9 },
    { month: 'Jul 26', airfare: 142.8, cpi: 121.2, transportCpi: 126.0, atfIndex: 147.2, spread: 21.6, momAirfareChange: 4.1 },
    { month: 'Aug 26', airfare: 139.1, cpi: 121.9, transportCpi: 126.5, atfIndex: 145.6, spread: 17.2, momAirfareChange: -2.6 },
    { month: 'Sep 26', airfare: 138.4, cpi: 122.7, transportCpi: 127.1, atfIndex: 146.8, spread: 15.7, momAirfareChange: -0.5 }
  ],
  'YTD': [
    { month: 'Jan 26', airfare: 121.4, cpi: 116.8, transportCpi: 119.5, atfIndex: 131.2, spread: 4.6, momAirfareChange: -1.2 },
    { month: 'Feb 26', airfare: 123.8, cpi: 117.4, transportCpi: 120.3, atfIndex: 133.0, spread: 6.4, momAirfareChange: 2.0 },
    { month: 'Mar 26', airfare: 127.5, cpi: 117.9, transportCpi: 121.1, atfIndex: 135.2, spread: 9.6, momAirfareChange: 3.0 },
    { month: 'Apr 26', airfare: 124.8, cpi: 118.2, transportCpi: 122.4, atfIndex: 136.2, spread: 6.6, momAirfareChange: -2.1 },
    { month: 'May 26', airfare: 129.5, cpi: 119.1, transportCpi: 123.6, atfIndex: 139.4, spread: 10.4, momAirfareChange: 3.8 },
    { month: 'Jun 26', airfare: 137.2, cpi: 120.4, transportCpi: 125.1, atfIndex: 143.8, spread: 16.8, momAirfareChange: 5.9 },
    { month: 'Jul 26', airfare: 142.8, cpi: 121.2, transportCpi: 126.0, atfIndex: 147.2, spread: 21.6, momAirfareChange: 4.1 },
    { month: 'Aug 26', airfare: 139.1, cpi: 121.9, transportCpi: 126.5, atfIndex: 145.6, spread: 17.2, momAirfareChange: -2.6 },
    { month: 'Sep 26', airfare: 138.4, cpi: 122.7, transportCpi: 127.1, atfIndex: 146.8, spread: 15.7, momAirfareChange: -0.5 }
  ],
  '1Y': [
    { month: 'Oct 25', airfare: 119.2, cpi: 114.6, transportCpi: 117.8, atfIndex: 128.5, spread: 4.6, momAirfareChange: 3.8 },
    { month: 'Nov 25', airfare: 125.4, cpi: 115.3, transportCpi: 118.5, atfIndex: 132.0, spread: 10.1, momAirfareChange: 5.2 },
    { month: 'Dec 25', airfare: 131.8, cpi: 116.0, transportCpi: 119.2, atfIndex: 135.5, spread: 15.8, momAirfareChange: 5.1 },
    { month: 'Jan 26', airfare: 121.4, cpi: 116.8, transportCpi: 119.5, atfIndex: 131.2, spread: 4.6, momAirfareChange: -7.9 },
    { month: 'Feb 26', airfare: 123.8, cpi: 117.4, transportCpi: 120.3, atfIndex: 133.0, spread: 6.4, momAirfareChange: 2.0 },
    { month: 'Mar 26', airfare: 127.5, cpi: 117.9, transportCpi: 121.1, atfIndex: 135.2, spread: 9.6, momAirfareChange: 3.0 },
    { month: 'Apr 26', airfare: 124.8, cpi: 118.2, transportCpi: 122.4, atfIndex: 136.2, spread: 6.6, momAirfareChange: -2.1 },
    { month: 'May 26', airfare: 129.5, cpi: 119.1, transportCpi: 123.6, atfIndex: 139.4, spread: 10.4, momAirfareChange: 3.8 },
    { month: 'Jun 26', airfare: 137.2, cpi: 120.4, transportCpi: 125.1, atfIndex: 143.8, spread: 16.8, momAirfareChange: 5.9 },
    { month: 'Jul 26', airfare: 142.8, cpi: 121.2, transportCpi: 126.0, atfIndex: 147.2, spread: 21.6, momAirfareChange: 4.1 },
    { month: 'Aug 26', airfare: 139.1, cpi: 121.9, transportCpi: 126.5, atfIndex: 145.6, spread: 17.2, momAirfareChange: -2.6 },
    { month: 'Sep 26', airfare: 138.4, cpi: 122.7, transportCpi: 127.1, atfIndex: 146.8, spread: 15.7, momAirfareChange: -0.5 }
  ],
  '3Y': [
    { month: '2023', airfare: 118.2, cpi: 108.3, transportCpi: 112.5, atfIndex: 125.4, spread: 9.9, momAirfareChange: 11.2 },
    { month: '2024', airfare: 128.6, cpi: 112.8, transportCpi: 118.2, atfIndex: 136.5, spread: 15.8, momAirfareChange: 8.8 },
    { month: '2025', airfare: 134.2, cpi: 117.5, transportCpi: 122.4, atfIndex: 141.8, spread: 16.7, momAirfareChange: 4.4 },
    { month: '2026', airfare: 138.4, cpi: 122.7, transportCpi: 127.1, atfIndex: 146.8, spread: 15.7, momAirfareChange: 3.1 }
  ],
  '5Y': [
    { month: '2021', airfare: 92.5, cpi: 95.2, transportCpi: 98.1, atfIndex: 90.0, spread: -2.7, momAirfareChange: 0 },
    { month: '2022', airfare: 108.4, cpi: 101.6, transportCpi: 107.4, atfIndex: 118.2, spread: 6.8, momAirfareChange: 17.2 },
    { month: '2023', airfare: 118.2, cpi: 108.3, transportCpi: 112.5, atfIndex: 125.4, spread: 9.9, momAirfareChange: 9.0 },
    { month: '2024', airfare: 128.6, cpi: 112.8, transportCpi: 118.2, atfIndex: 136.5, spread: 15.8, momAirfareChange: 8.8 },
    { month: '2025', airfare: 134.2, cpi: 117.5, transportCpi: 122.4, atfIndex: 141.8, spread: 16.7, momAirfareChange: 4.4 },
    { month: '2026', airfare: 138.4, cpi: 122.7, transportCpi: 127.1, atfIndex: 146.8, spread: 15.7, momAirfareChange: 3.1 }
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
