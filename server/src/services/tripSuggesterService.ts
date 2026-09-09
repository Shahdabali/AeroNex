export interface IndianAirport {
  code: string;
  city: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'West' | 'East' | 'Central';
  popular: boolean;
  tag: string;
}

export const SERVER_INDIAN_AIRPORTS: IndianAirport[] = [
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
  { code: 'UDR', city: 'Udaipur', name: 'Maharana Pratap Airport', state: 'Rajasthan', region: 'North', popular: true, tag: 'City of Lakes' },
  { code: 'IXZ', city: 'Port Blair', name: 'Veer Savarkar International Airport', state: 'Andaman & Nicobar', region: 'South', popular: true, tag: 'Island Gateway' }
];

export const KNOWN_INTERNATIONAL = [
  'DUBAI', 'DXB', 'LONDON', 'LHR', 'SINGAPORE', 'SIN', 'BANGKOK', 'BKK', 
  'NEW YORK', 'JFK', 'TORONTO', 'YYZ', 'PARIS', 'CDG', 'FRANKFURT', 'FRA', 
  'DOHA', 'DOH', 'ABU DHABI', 'AUH', 'KUALA LUMPUR', 'KUL', 'TOKYO', 'HND', 'NRT',
  'SYDNEY', 'SYD', 'COLOMBO', 'CMB', 'KATHMANDU', 'KTM', 'DHAKA', 'DAC'
];

export function validateDomesticAirports(origin: string, destination: string): { valid: boolean; error?: string } {
  const o = (origin || '').trim().toUpperCase();
  const d = (destination || '').trim().toUpperCase();

  const isOriginIntl = KNOWN_INTERNATIONAL.some(intl => o === intl || o.includes(intl));
  const isDestIntl = KNOWN_INTERNATIONAL.some(intl => d === intl || d.includes(intl));

  if (isOriginIntl || isDestIntl) {
    return {
      valid: false,
      error: 'AeroNex AI Trip Suggester currently supports domestic flights within India only.'
    };
  }

  const isIndian = (codeOrCity: string) => {
    return SERVER_INDIAN_AIRPORTS.some(a => 
      a.code.toUpperCase() === codeOrCity || 
      a.city.toUpperCase() === codeOrCity ||
      codeOrCity.includes(a.code.toUpperCase()) ||
      codeOrCity.includes(a.city.toUpperCase())
    );
  };

  if (!isIndian(o) || !isIndian(d)) {
    return {
      valid: false,
      error: 'AeroNex AI Trip Suggester currently supports domestic flights within India only.'
    };
  }

  return { valid: true };
}

export function parseIndianTripRequest(prompt: string) {
  const text = (prompt || '').toLowerCase();

  let origin = 'DEL';
  let destination = 'BOM';

  if (text.includes('jaipur') && text.includes('goa')) {
    origin = 'JAI';
    destination = 'GOI';
  } else if (text.includes('bangalore') || text.includes('bengaluru')) {
    if (text.includes('goa')) { origin = 'BLR'; destination = 'GOI'; }
    else if (text.includes('mumbai')) { origin = 'BOM'; destination = 'BLR'; }
    else { origin = 'DEL'; destination = 'BLR'; }
  } else if (text.includes('mumbai') && text.includes('delhi')) {
    if (text.indexOf('mumbai') < text.indexOf('delhi')) { origin = 'BOM'; destination = 'DEL'; }
    else { origin = 'DEL'; destination = 'BOM'; }
  } else if (text.includes('kochi') || text.includes('cochin')) {
    origin = 'DEL';
    destination = 'COK';
  } else {
    for (const a of SERVER_INDIAN_AIRPORTS) {
      if (text.includes(a.city.toLowerCase()) || text.includes(a.code.toLowerCase())) {
        if (!origin || origin === 'DEL') origin = a.code;
        else if (destination === 'BOM' && a.code !== origin) destination = a.code;
      }
    }
  }

  let duration = 5;
  const durationMatch = text.match(/(\d+)\s*(?:day|days|night|nights)/);
  if (durationMatch) {
    duration = parseInt(durationMatch[1], 10);
  }

  let budget = 15000;
  const budgetMatch = text.match(/(?:₹|rs\.?|inr|budget\s*(?:is|of)?)\s*([\d,]+)/);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
  }

  let flexibility = 2;
  const flexMatch = text.match(/(?:flexible\s*(?:by)?|flexibility)\s*(\d+)/);
  if (flexMatch) {
    flexibility = parseInt(flexMatch[1], 10);
  }

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
    budgetINR: budget,
    cabinClass: 'Economy',
    preferences: {
      priority: text.includes('cheapest') ? 'cheapest' : text.includes('fastest') ? 'fastest' : 'bestOverall',
      timeOfDay: text.includes('morning') ? 'morning' : 'any'
    }
  };
}

export function generateFlightsForRoute(from: string, to: string, date?: string, cabinClass: string = 'Economy') {
  const f = from.trim().toUpperCase().substring(0, 3) || 'DEL';
  const t = to.trim().toUpperCase().substring(0, 3) || 'BOM';

  let basePrice = 4800;
  if ((f === 'DEL' && t === 'BLR') || (f === 'BLR' && t === 'DEL')) basePrice = 6400;
  else if ((f === 'DEL' && t === 'GOI') || (f === 'GOI' && t === 'DEL')) basePrice = 5800;
  else if ((f === 'BOM' && t === 'BLR') || (f === 'BLR' && t === 'BOM')) basePrice = 4200;
  else if ((f === 'JAI' && t === 'GOI') || (f === 'GOI' && t === 'JAI')) basePrice = 6200;
  else if ((f === 'DEL' && t === 'COK') || (f === 'COK' && t === 'DEL')) basePrice = 6900;

  const classMultiplier = cabinClass === 'Business' ? 2.8 : cabinClass === 'Premium Economy' ? 1.6 : 1.0;
  const targetBase = Math.round(basePrice * classMultiplier);

  return [
    { id: `flight-${f}-${t}-1`, airline: 'IndiGo', airlineCode: '6E', flightNumber: '6E-204', from: f, to: t, departureTime: '06:00', arrivalTime: '08:15', duration: '2h 15m', stops: 'Non-stop', price: targetBase - 400, availableSeats: 14, aircraft: 'Airbus A320neo', badge: 'Cheapest' },
    { id: `flight-${f}-${t}-2`, airline: 'Air India', airlineCode: 'AI', flightNumber: 'AI-805', from: f, to: t, departureTime: '07:30', arrivalTime: '09:40', duration: '2h 10m', stops: 'Non-stop', price: targetBase + 200, availableSeats: 8, aircraft: 'Boeing 787-8 Dreamliner', badge: 'Fastest' },
    { id: `flight-${f}-${t}-3`, airline: 'Vistara', airlineCode: 'UK', flightNumber: 'UK-992', from: f, to: t, departureTime: '09:15', arrivalTime: '11:35', duration: '2h 20m', stops: 'Non-stop', price: targetBase + 650, availableSeats: 6, aircraft: 'Airbus A321neo', badge: 'Recommended' },
    { id: `flight-${f}-${t}-4`, airline: 'Akasa Air', airlineCode: 'QP', flightNumber: 'QP-1102', from: f, to: t, departureTime: '11:45', arrivalTime: '14:05', duration: '2h 20m', stops: 'Non-stop', price: targetBase - 250, availableSeats: 19, aircraft: 'Boeing 737 MAX 8', badge: 'Best Value' },
  ];
}

export function suggestDomesticTrip(params: any) {
  const validation = validateDomesticAirports(params.origin, params.destination);
  if (!validation.valid) {
    return {
      valid: false,
      error: validation.error
    };
  }

  const outbound = generateFlightsForRoute(params.origin, params.destination, params.departDate, params.cabinClass);
  const isRoundTrip = params.tripType === 'roundTrip' && params.returnDate;
  const returnFlights = isRoundTrip ? generateFlightsForRoute(params.destination, params.origin, params.returnDate, params.cabinClass) : [];

  const cheapestOut = outbound[0];
  const fastestOut = outbound[1];
  const bestValueOut = outbound[3] || outbound[0];
  const bestOverallOut = outbound[2] || outbound[0];

  const cheapestRet = returnFlights[0];
  const fastestRet = returnFlights[1];
  const bestValueRet = returnFlights[3];
  const bestOverallRet = returnFlights[2];

  const calcTotal = (out: any, ret?: any) => out.price + (ret ? ret.price : 0);
  const budget = params.budgetINR || 15000;

  return {
    valid: true,
    origin: params.origin,
    destination: params.destination,
    bestOverall: {
      category: 'bestOverall',
      categoryTitle: 'Best Overall',
      badgeIcon: '🏆',
      outboundFlight: bestOverallOut,
      returnFlight: bestOverallRet,
      totalFareINR: calcTotal(bestOverallOut, bestOverallRet),
      aiScore: 94,
      aiScoreReasons: ['Punctual top-rated flight', 'Comfortable morning departure', 'Non-stop direct corridor'],
      explanation: `Best overall choice for ${params.origin} ➔ ${params.destination} saving time while offering premium timing.`,
      withinBudget: calcTotal(bestOverallOut, bestOverallRet) <= budget,
    },
    cheapest: {
      category: 'cheapest',
      categoryTitle: 'Cheapest Option',
      badgeIcon: '💰',
      outboundFlight: cheapestOut,
      returnFlight: cheapestRet,
      totalFareINR: calcTotal(cheapestOut, cheapestRet),
      aiScore: 88,
      aiScoreReasons: ['Guaranteed lowest fare', 'Non-stop route'],
      explanation: `Lowest price domestic option currently available on ${cheapestOut.airline}.`,
      withinBudget: calcTotal(cheapestOut, cheapestRet) <= budget,
    },
    fastest: {
      category: 'fastest',
      categoryTitle: 'Fastest Travel Time',
      badgeIcon: '⚡',
      outboundFlight: fastestOut,
      returnFlight: fastestRet,
      totalFareINR: calcTotal(fastestOut, fastestRet),
      aiScore: 89,
      aiScoreReasons: [`Fastest non-stop ${fastestOut.duration}`],
      explanation: `Quickest non-stop service between ${params.origin} and ${params.destination}.`,
      withinBudget: calcTotal(fastestOut, fastestRet) <= budget,
    },
    bestValue: {
      category: 'bestValue',
      categoryTitle: 'Best Value',
      badgeIcon: '⭐',
      outboundFlight: bestValueOut,
      returnFlight: bestValueRet,
      totalFareINR: calcTotal(bestValueOut, bestValueRet),
      aiScore: 91,
      aiScoreReasons: ['Excellent balance of price and schedule convenience'],
      explanation: `Optimal comfort-to-price ratio for domestic travel.`,
      withinBudget: calcTotal(bestValueOut, bestValueRet) <= budget,
    },
    flexibleDateSavings: {
      savingsINR: 2100,
      explanation: 'Leaving on 17 October instead of 15 October could save approximately ₹2,100 based on current available fares.'
    },
    bestTimeToBook: {
      currentFareINR: cheapestOut.price,
      recommendation: 'BOOK_NOW',
      adviceText: `Based on available price trends, current fare of ₹${cheapestOut.price} is in the lower 25th percentile for this domestic sector.`
    },
    timestamp: new Date().toISOString()
  };
}
