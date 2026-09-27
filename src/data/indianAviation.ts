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
