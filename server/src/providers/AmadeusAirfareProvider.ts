import { AirfareProvider } from './AirfareProvider';
import { FareDataInput } from '../utils/validation';

/**
 * Real market fares from the Amadeus Self-Service "Flight Offers Search" API.
 * Activated only when AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are set.
 *
 * The free tier is quota-limited, so each cycle queries a rotating batch of
 * corridors (AMADEUS_ROUTES_PER_CYCLE, default 4) for a departure date two
 * weeks out and records the cheapest offer. Corridors not queried in a cycle
 * simply keep their last observed fare.
 */
const CORRIDORS = [
  'DEL-BOM', 'BOM-DEL', 'BOM-BLR', 'BLR-BOM', 'DEL-BLR', 'BLR-DEL', 'MAA-DEL', 'DEL-MAA', 'HYD-DEL', 'DEL-HYD',
  'CCU-DEL', 'DEL-CCU', 'GOI-BOM', 'BOM-GOI', 'DEL-GOI', 'GOI-DEL', 'BLR-CCU', 'CCU-BLR', 'BLR-HYD', 'HYD-BLR',
];

const REQUEST_TIMEOUT_MS = 8000;

export class AmadeusAirfareProvider implements AirfareProvider {
  readonly name = 'Amadeus Flight Offers Search';
  readonly mode = 'live' as const;

  private token: { value: string; expiresAt: number } | null = null;
  private cursor = 0;
  private readonly host: string;
  private readonly perCycle: number;

  constructor(private clientId: string, private clientSecret: string) {
    this.host = process.env.AMADEUS_HOST || 'https://test.api.amadeus.com';
    this.perCycle = Math.max(1, parseInt(process.env.AMADEUS_ROUTES_PER_CYCLE || '4', 10));
  }

  private async request(url: string, init: RequestInit = {}): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (res.status === 429) throw new Error('Amadeus rate limit reached');
      if (!res.ok) throw new Error(`Amadeus responded ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  private async getToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 30_000) return this.token.value;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    const json = await this.request(`${this.host}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!json?.access_token) throw new Error('Amadeus token response was empty');
    this.token = { value: json.access_token, expiresAt: Date.now() + (Number(json.expires_in) || 1500) * 1000 };
    return this.token.value;
  }

  async fetchLatestFares(): Promise<FareDataInput[]> {
    const token = await this.getToken();
    const departure = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
    const batch: string[] = [];
    for (let i = 0; i < this.perCycle; i++) batch.push(CORRIDORS[(this.cursor + i) % CORRIDORS.length]);
    this.cursor = (this.cursor + this.perCycle) % CORRIDORS.length;

    const results: FareDataInput[] = [];
    let lastError: unknown = null;
    for (const corridor of batch) {
      const [origin, destination] = corridor.split('-');
      const qs = new URLSearchParams({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departure,
        adults: '1',
        currencyCode: 'INR',
        max: '10',
      });
      try {
        const json = await this.request(`${this.host}/v2/shopping/flight-offers?${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const offers: any[] = Array.isArray(json?.data) ? json.data : [];
        const priced = offers
          .map(o => ({ offer: o, price: Number(o?.price?.grandTotal ?? o?.price?.total) }))
          .filter(o => Number.isFinite(o.price) && o.price > 0)
          .sort((a, b) => a.price - b.price)[0];
        if (!priced) continue;
        const seg = priced.offer?.itineraries?.[0]?.segments?.[0];
        const carrier = String(seg?.carrierCode || priced.offer?.validatingAirlineCodes?.[0] || '').toUpperCase();
        if (carrier.length !== 2 || !seg?.departure?.at || !seg?.arrival?.at) continue;
        results.push({
          flight_number: `${carrier}-${seg.number ?? '0'}`,
          airline_code: carrier,
          origin_iata: origin,
          destination_iata: destination,
          fare_amount: Math.round(priced.price),
          currency: 'INR',
          departure_time: new Date(seg.departure.at).toISOString(),
          arrival_time: new Date(seg.arrival.at).toISOString(),
          source: 'amadeus-flight-offers',
        });
      } catch (err) {
        lastError = err;
      }
    }
    // Only surface an error when nothing at all could be fetched this cycle.
    if (results.length === 0 && lastError) throw lastError;
    return results;
  }
}
