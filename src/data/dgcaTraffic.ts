/**
 * DGCA domestic air-traffic data, January–August 2026.
 *
 * Every figure below is a DGCA monthly-report number as published in press coverage of that report (linked in
 * DGCA_SOURCES). Nothing is estimated or interpolated:
 *   - 'reported' = the figure as published.
 *   - 'derived'  = an exact difference of two DGCA-published cumulative totals (e.g. Jan–Jun minus Jan–May).
 *   - 'rounded'  = DGCA's figure was only published to one decimal of a crore (e.g. "1.44 crore").
 *   - null       = not published in any source consulted. Shown as a gap, never filled in.
 *
 * Passenger figures are in lakh (1 lakh = 100,000). Percentages are as published.
 * Before quoting these externally, check them against the DGCA reports at https://www.dgca.gov.in.
 */
export type Precision = 'reported' | 'derived' | 'rounded';

export interface MonthlyTraffic {
  month: string; // YYYY-MM
  label: string;
  pax2026: number | null;
  pax2026Precision?: Precision;
  pax2025: number | null;
  pax2025Precision?: Precision;
  source: string;
}

export const DGCA_MONTHLY: MonthlyTraffic[] = [
  { month: '2026-01', label: 'Jan', pax2026: 152.49, pax2026Precision: 'reported', pax2025: 146.11, pax2025Precision: 'reported', source: 'jan' },
  { month: '2026-02', label: 'Feb', pax2026: null, pax2025: null, source: 'jan-apr' },
  { month: '2026-03', label: 'Mar', pax2026: 144, pax2026Precision: 'rounded', pax2025: 145, pax2025Precision: 'rounded', source: 'apr' },
  { month: '2026-04', label: 'Apr', pax2026: 138, pax2026Precision: 'rounded', pax2025: 143.16, pax2025Precision: 'reported', source: 'apr' },
  { month: '2026-05', label: 'May', pax2026: 153.9, pax2026Precision: 'reported', pax2025: 140.56, pax2025Precision: 'reported', source: 'may' },
  { month: '2026-06', label: 'Jun', pax2026: 134.64, pax2026Precision: 'derived', pax2025: 136.04, pax2025Precision: 'derived', source: 'jun' },
  { month: '2026-07', label: 'Jul', pax2026: 119.99, pax2026Precision: 'derived', pax2025: 126.05, pax2025Precision: 'derived', source: 'jul' },
  { month: '2026-08', label: 'Aug', pax2026: 121.26, pax2026Precision: 'reported', pax2025: 129.47, pax2025Precision: 'reported', source: 'aug' },
];

/** DGCA-published year-to-date totals (lakh). These are the anchors the 'derived' months are computed from. */
export const DGCA_CUMULATIVE = [
  { period: 'Jan–Apr', pax2026: 575.49, pax2025: 575.13, source: 'apr' },
  { period: 'Jan–May', pax2026: 729.4, pax2025: 715.7, source: 'may' },
  { period: 'Jan–Jun', pax2026: 864.04, pax2025: 851.74, source: 'jun' },
  { period: 'Jan–Jul', pax2026: 984.03, pax2025: 977.79, source: 'jul' },
  { period: 'Jan–Aug', pax2026: 1105.3, pax2025: 1107.26, source: 'aug' },
];

export const AIRLINES = ['IndiGo', 'Air India Group', 'Akasa Air', 'SpiceJet'] as const;
export type Airline = (typeof AIRLINES)[number];

/** Domestic market share by passengers carried (%). */
export const DGCA_MARKET_SHARE: { label: string; source: string; note?: string; share: Record<Airline, number | null> }[] = [
  { label: 'Jan', source: 'jan', share: { IndiGo: 63.6, 'Air India Group': 26.5, 'Akasa Air': null, SpiceJet: null } },
  { label: 'Mar', source: 'apr', share: { IndiGo: 63.3, 'Air India Group': 26.2, 'Akasa Air': 5.4, SpiceJet: 3.8 } },
  { label: 'Apr', source: 'apr', share: { IndiGo: 65.0, 'Air India Group': 24.7, 'Akasa Air': 5.8, SpiceJet: 3.4 } },
  { label: 'May', source: 'may', note: 'One outlet reported IndiGo at 63.3%; most reports, citing the Ministry of Civil Aviation, give 64.9%.', share: { IndiGo: 64.9, 'Air India Group': 25.6, 'Akasa Air': 5.8, SpiceJet: 2.5 } },
  { label: 'Jun', source: 'jun', share: { IndiGo: 66.3, 'Air India Group': 23.9, 'Akasa Air': 6.4, SpiceJet: 1.9 } },
  { label: 'Jul', source: 'jul', share: { IndiGo: 67.4, 'Air India Group': 24.0, 'Akasa Air': 5.5, SpiceJet: 1.6 } },
  { label: 'Aug', source: 'aug', share: { IndiGo: 65.0, 'Air India Group': 26.7, 'Akasa Air': 5.5, SpiceJet: 1.2 } },
];

/** On-time performance (%) across DGCA's ten major airports. */
export const DGCA_OTP: { label: string; source: string; otp: Record<Airline, number | null> }[] = [
  { label: 'Apr', source: 'apr', otp: { IndiGo: 88.5, 'Air India Group': 82.4, 'Akasa Air': 81.4, SpiceJet: 31.2 } },
  { label: 'May', source: 'may', otp: { IndiGo: 82.8, 'Air India Group': 74.5, 'Akasa Air': 78.3, SpiceJet: 26.5 } },
  { label: 'Jun', source: 'jun', otp: { IndiGo: 89.4, 'Air India Group': 85.9, 'Akasa Air': 82.7, SpiceJet: 33.5 } },
  { label: 'Jul', source: 'jul', otp: { IndiGo: 91.2, 'Air India Group': null, 'Akasa Air': 90.8, SpiceJet: null } },
  { label: 'Aug', source: 'aug', otp: { IndiGo: 91.5, 'Air India Group': 83.9, 'Akasa Air': 90.5, SpiceJet: null } },
];

/** Overall cancellation rate of scheduled domestic airlines (%). */
export const DGCA_CANCELLATION: { label: string; rate: number; source: string }[] = [
  { label: 'Jan', rate: 1.44, source: 'jan' },
  { label: 'May', rate: 0.55, source: 'may' },
  { label: 'Jun', rate: 0.63, source: 'jun' },
  { label: 'Aug', rate: 1.39, source: 'aug' },
];

/** Passenger load factor (%), only where published. */
export const DGCA_LOAD_FACTOR: { label: string; source: string; lf: Record<Airline, number | null> }[] = [
  { label: 'Jan', source: 'jan', lf: { IndiGo: 87.7, 'Air India Group': null, 'Akasa Air': 93.2, SpiceJet: null } },
  { label: 'May', source: 'may', lf: { IndiGo: 86.4, 'Air India Group': 83.5, 'Akasa Air': 92.5, SpiceJet: 87.4 } },
];

export const DGCA_SOURCES: Record<string, { title: string; url: string; published: string }> = {
  jan: { title: 'India sees 4.36% rise in domestic air passenger traffic in January: DGCA (Accord Fintech)', url: 'https://investmentguruindia.com/newsdetail/india-sees-4-36-rise-in-domestic-air-passenger-traffic-in-january-dgca503629', published: '2026-03-02' },
  apr: { title: 'Domestic air traffic falls nearly 4% to 1.38 crore passengers in April (PTI)', url: 'https://www.outlookbusiness.com/news/domestic-air-traffic-falls-nearly-4-to-138-crore-passengers-in-april', published: '2026-06-01' },
  'jan-apr': { title: 'February 2026 was not published separately in the sources consulted; it is included in the Jan–Apr total', url: 'https://www.outlookbusiness.com/news/domestic-air-traffic-falls-nearly-4-to-138-crore-passengers-in-april', published: '2026-06-01' },
  may: { title: 'Passengers carried by domestic airlines show 1.91% YoY growth in Jan–May 2026', url: 'https://www.latestly.com/agency-news/india-news-passengers-carried-by-domestic-airlines-show-1-91-yoy-growth-in-jan-may-2026-7507261.html/amp', published: '2026-06' },
  jun: { title: 'Domestic air traffic drops nearly 12% to 1.35 crore in June (PTI)', url: 'https://telanganatoday.com/domestic-air-traffic-drops-nearly-12-per-cent-to-1-35-crore-in-june-indigo-widens-market-lead', published: '2026-07-21' },
  jul: { title: 'Domestic air passenger traffic slips 4.80% to 1.20 crore in July: DGCA', url: 'https://psuwatch.com/amp/story/newsupdates/domestic-air-passenger-traffic-slips-480-to-120-crore-in-jul-dgca', published: '2026-08-20' },
  aug: { title: "India's domestic air traffic drops 6.34% to 12.126 million passengers in August 2026", url: 'https://www.angelone.in/news/economy/india-s-domestic-air-traffic-drops-6-34-to-12-126-million-passengers-in-august-2026', published: '2026-09-23' },
  '2025': { title: 'Domestic air passenger traffic grows 8% to 143.16 lakh in April 2025 / 1.89% to 140.56 lakh in May 2025 (PTI)', url: 'https://www.theweek.in/wire-updates/business/2025/06/24/dcm107-avi-dgca-passenger-traffic.html', published: '2025-06-24' },
};

export const DGCA_LATEST_REPORT = { month: 'August 2026', published: '2026-09-23' };
