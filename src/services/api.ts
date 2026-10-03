import { supabase } from '../lib/supabase';
import { authService, type AuthUser } from './authService';
import { INDIAN_AIRPORTS } from '../data/indianAviation';
import { FAQS } from '../data/faqs';

/* ────────────────────────────────────────────────────────────────────────────
   Transport
   ──────────────────────────────────────────────────────────────────────────── */

// Backend base URL. Localhost defaults to the dev server; in production it must be set
// via VITE_API_BASE_URL. When it is empty the app runs in "standalone" mode, where all
// market figures come from the clearly-labelled client-side simulation below.
const API_BASE: string = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : '')
).replace(/\/$/, '');

export const API_BASE_URL = API_BASE;
export const hasBackend = true;

/** Error carrying a user-presentable message. `network` is true when the server could not be reached. */
export class ApiError extends Error {
  status: number;
  network: boolean;
  constructor(message: string, status = 0, network = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.network = network;
  }
}

const READ_TIMEOUT_MS = 10_000;
const WRITE_TIMEOUT_MS = 15_000;

function readStoredUser(): { isGuest?: boolean; email?: string; id?: string } | null {
  try {
    const raw = localStorage.getItem('aeronex_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** True when the visitor has a real (non-guest) account, i.e. the server can identify them. */
export function hasAccountSession(): boolean {
  const u = readStoredUser();
  return hasBackend && !!u && !u.isGuest;
}

async function authHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return { Authorization: `Bearer ${data.session.access_token}` };
  } catch {
    /* anonymous */
  }
  return {};
}

const inflight = new Map<string, Promise<any>>();

async function send(method: string, path: string, body: unknown, auth: boolean, attempt = 0): Promise<any> {
  if (!hasBackend) throw new ApiError('The AeroNex server is not configured for this deployment.', 0, true);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), method === 'GET' ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? await authHeaders() : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      // Transient gateway errors on reads are retried once.
      if (method === 'GET' && attempt < 1 && [502, 503, 504].includes(res.status)) {
        await new Promise(r => setTimeout(r, 700));
        return send(method, path, body, auth, attempt + 1);
      }
      const json = await res.json().catch(() => ({}));
      const raw = json?.error;
      const message =
        (typeof raw === 'string' ? raw : raw?.message) ||
        (res.status === 401 ? 'Please sign in with your AeroNex account to do this.' : null) ||
        (res.status === 429 ? 'Too many requests. Please wait a moment and try again.' : null) ||
        (res.status >= 500 ? 'The AeroNex server had a problem. Please try again.' : `Request failed (${res.status}).`);
      throw new ApiError(message, res.status);
    }
    if (res.status === 204) return null;
    const json = await res.json();
    return json && typeof json === 'object' && 'success' in json && 'data' in json ? json.data : json;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (method === 'GET' && attempt < 1) {
      await new Promise(r => setTimeout(r, 700));
      return send(method, path, body, auth, attempt + 1);
    }
    const timedOut = (err as any)?.name === 'AbortError';
    throw new ApiError(
      timedOut ? 'The AeroNex server took too long to respond.' : 'Cannot reach the AeroNex server. Check your connection and try again.',
      0,
      true,
    );
  } finally {
    clearTimeout(timer);
  }
}

/** GET with in-flight de-duplication so several components can ask for the same data at once. */
function get<T = any>(path: string, auth = false): Promise<T> {
  const key = `${auth ? 'a' : 'p'}:${path}`;
  const existing = inflight.get(key);
  if (existing) return existing;
  const p = send('GET', path, undefined, auth).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
const post = <T = any>(path: string, body?: unknown, auth = false): Promise<T> => send('POST', path, body ?? {}, auth);
const put = <T = any>(path: string, body?: unknown, auth = true): Promise<T> => send('PUT', path, body ?? {}, auth);
const del = <T = any>(path: string, auth = true): Promise<T> => send('DELETE', path, undefined, auth);

const needsServer = (what: string) =>
  new ApiError(`${what} needs the AeroNex server, which isn't connected in this deployment.`, 0, true);

/* ────────────────────────────────────────────────────────────────────────────
   Standalone simulation (only used when NO backend is configured)
   Everything served from here is flagged mode:'simulated' by getDataStatus().
   ──────────────────────────────────────────────────────────────────────────── */

const ROUTE_BASE_FARES: Record<string, number> = {
  'DEL-BOM': 5680, 'BOM-DEL': 5620, 'BOM-BLR': 4450, 'BLR-BOM': 4480, 'DEL-BLR': 7120, 'BLR-DEL': 7080,
  'MAA-DEL': 5350, 'DEL-MAA': 5350, 'HYD-DEL': 4680, 'DEL-HYD': 4680, 'CCU-DEL': 5490, 'DEL-CCU': 5490,
  'GOI-BOM': 3620, 'BOM-GOI': 3620, 'DEL-GOI': 6750, 'GOI-DEL': 6750, 'BLR-CCU': 5850, 'CCU-BLR': 5850,
  'BLR-HYD': 3450, 'HYD-BLR': 3450,
};
const INDEX_BASELINE: Record<string, number> = {
  'DEL-BOM': 5000, 'BOM-DEL': 5000, 'BOM-BLR': 4500, 'BLR-BOM': 4500, 'DEL-BLR': 6000, 'BLR-DEL': 6000,
  'MAA-DEL': 4000, 'DEL-MAA': 4000, 'HYD-DEL': 5500, 'DEL-HYD': 5500, 'CCU-DEL': 4800, 'DEL-CCU': 4800,
  'GOI-BOM': 3500, 'BOM-GOI': 3500, 'DEL-GOI': 6500, 'GOI-DEL': 6500, 'BLR-CCU': 5200, 'CCU-BLR': 5200,
  'BLR-HYD': 3000, 'HYD-BLR': 3000,
};

interface SimRoute { route: string; currentFare: number; previousFare: number | null; lastUpdated: string }

class StandaloneSimulation {
  private fares = new Map<string, SimRoute>();
  private history: { time: string; timestamp: string; value: number }[] = [];
  private routeHistory = new Map<string, { route: string; fare: number; timestamp: string }[]>();
  private lastTick = 0;
  ticks = 0;
  lastUpdated = new Date().toISOString();
  private anchor = { ...ROUTE_BASE_FARES };

  constructor() {
    for (const [route, fare] of Object.entries(ROUTE_BASE_FARES)) {
      this.fares.set(route, { route, currentFare: fare, previousFare: null, lastUpdated: this.lastUpdated });
    }
    this.tick(true);
  }

  tick(force = false) {
    const now = Date.now();
    if (!force && now - this.lastTick < 5000) return;
    this.lastTick = now;
    this.ticks++;
    this.lastUpdated = new Date(now).toISOString();
    for (const [route, entry] of this.fares) {
      const anchor = this.anchor[route];
      const step = 1 + (Math.random() - 0.5) * 0.04;
      const next = Math.round(Math.min(anchor * 1.2, Math.max(anchor * 0.8, entry.currentFare * step)));
      this.fares.set(route, { route, currentFare: next, previousFare: entry.currentFare, lastUpdated: this.lastUpdated });
      const h = this.routeHistory.get(route) ?? [];
      h.push({ route, fare: next, timestamp: this.lastUpdated });
      if (h.length > 300) h.shift();
      this.routeHistory.set(route, h);
    }
    const at = new Date(now);
    this.history.push({
      time: at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: at.toISOString(),
      value: this.indexValue(),
    });
    if (this.history.length > 300) this.history.shift();
  }

  private indexValue() {
    let cur = 0, base = 0;
    for (const [route, e] of this.fares) { cur += e.currentFare; base += INDEX_BASELINE[route]; }
    return parseFloat(((cur / base) * 100).toFixed(2));
  }

  routes() { this.tick(); return [...this.fares.values()]; }

  metrics() {
    const routes = this.routes();
    const idx = this.indexValue();
    const prevIdx = this.history.length > 1 ? this.history[this.history.length - 2].value : idx;
    const changePct = (a: number, b: number) => (b ? parseFloat((((a - b) / b) * 100).toFixed(1)) : 0);
    const sorted = [...routes].sort((a, b) => a.currentFare - b.currentFare);
    const moves = routes
      .filter(r => r.previousFare)
      .map(r => ({ route: r.route, change: changePct(r.currentFare, r.previousFare!) }))
      .sort((a, b) => a.change - b.change);
    const avg = Math.round(routes.reduce((n, r) => n + r.currentFare, 0) / routes.length);
    return {
      hasData: true,
      airfareIndex: { value: parseFloat(idx.toFixed(1)), change: changePct(idx, prevIdx) },
      averageFare: { value: avg, change: 0 },
      flightsTracked: { value: routes.length, change: 0 },
      routesTracked: { value: routes.length, change: 0 },
      secondary: {
        lowestFare: { fare: sorted[0].currentFare, route: sorted[0].route },
        highestFare: { fare: sorted[sorted.length - 1].currentFare, route: sorted[sorted.length - 1].route },
        biggestIncrease: { change: moves[moves.length - 1]?.change ?? 0, route: moves[moves.length - 1]?.route ?? '' },
        biggestDecrease: { change: moves[0]?.change ?? 0, route: moves[0]?.route ?? '' },
      },
    };
  }

  routeChanges() {
    return this.routes()
      .map(r => ({
        route: r.route,
        currentFare: r.currentFare,
        change: r.previousFare ? parseFloat((((r.currentFare - r.previousFare) / r.previousFare) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5);
  }

  chart() { this.tick(); return [...this.history]; }

  historyFor(route: string) { this.tick(); return [...(this.routeHistory.get(route) ?? [])]; }
}

/**
 * The simulation is a DEVELOPMENT aid. A production build never serves modelled fares: without a server it reports
 * that no data source is connected (VITE_ALLOW_SIMULATION=true re-enables it for a clearly-labelled demo deployment).
 */
const SIMULATION_ALLOWED = Boolean(import.meta.env.DEV) || import.meta.env.VITE_ALLOW_SIMULATION === 'true';

let sim: StandaloneSimulation | null = null;
const simulation = () => {
  if (!SIMULATION_ALLOWED) throw needsServer('Live airfare data');
  return (sim ||= new StandaloneSimulation());
};

/* ────────────────────────────────────────────────────────────────────────────
   Public API
   ──────────────────────────────────────────────────────────────────────────── */

export interface DataStatus {
  mode: 'live' | 'simulated' | 'unconfigured';
  provider: string;
  lastCycleAt: string | null;
  ageSec: number | null;
  /** live: recently collected; delayed / stale: older than the source's freshness limits; unavailable: nothing collected. */
  freshness: 'live' | 'delayed' | 'stale' | 'unavailable';
  stale: boolean;
  refreshIntervalSec: number;
  lastError: string | null;
}

/* ── Live flight data (collected by the scraper service, read through the AeroNex server) ── */
export interface LiveFlightLeg {
  airlineCode: string; airline: string; flightNumber: string; origin: string; destination: string;
  departureAt: string; arrivalAt: string; durationLabel: string | null; aircraft: string | null;
}
export interface LiveFlight {
  id: string; airlineCode: string; airline: string; flightNumber: string;
  origin: string; destination: string; route: string;
  /** ISO-8601 with an explicit +05:30 (IST) offset. */
  departureAt: string; arrivalAt: string; durationMin: number;
  stops: number; stopsLabel: string; cabin: string; fareType: string | null; aircraft: string | null; baggage: string | null;
  legs: LiveFlightLeg[];
  price: number; currency: string; baseFare: number | null; taxes: number | null;
  availability: 'available' | 'limited' | 'not_listed' | string; seatsLeft: number | null; isOutlier: boolean;
  previousPrice: number | null; priceChangedAt: string | null; priceChangePct: number | null;
  lowestSeen: number; highestSeen: number; firstSeenAt: string; lastSeenAt: string;
  source: string; sourceUrl: string | null;
}
export type SearchStatus = 'ready' | 'refreshing' | 'pending' | 'failed' | 'ready_stale';
export type Freshness = 'live' | 'delayed' | 'stale' | 'unavailable';
export interface JobInfo {
  id: string; status: 'queued' | 'running' | 'succeeded' | 'failed'; stage: string; kind: string; source: string; attempts: number;
  queuedAt: string; startedAt: string | null; completedAt: string | null; durationMs: number | null;
  found: number | null; accepted: number | null; rejected: number | null; errorKind: string | null; error: string | null;
}
export interface SearchMeta {
  status: SearchStatus; servedFrom: 'cache' | 'fresh' | 'stale' | 'pending' | 'failed'; freshness: Freshness;
  lastUpdated: string | null; ageSec: number | null; refreshing: boolean; job: JobInfo | null; noFlights: boolean;
  sourceCount: number; sources: { name: string; found: number; accepted: number; rejected: number }[]; count: number;
  error: { kind: string; message: string } | null; errorMessage: string | null; retryAfterSec: number | null; cacheTtlSec: number;
}
export interface LiveSearchResult { data: LiveFlight[]; meta: SearchMeta }
export interface FlightDetail {
  flight: LiveFlight;
  history: { t: string; price: number; availability: string | null }[];
  priceChanges: { at: string; oldPrice: number; newPrice: number; diff: number; pct: number }[];
}
export interface RouteIntel {
  route: string; origin: string; destination: string; originCity: string; destinationCity: string;
  insufficientData: boolean; reason?: string; windowDays?: number; travelDate?: string;
  lastUpdated?: string; ageSec?: number | null; freshness?: Freshness;
  stats?: { cheapest: number; median: number; average: number; highest: number; cheapestNonstop: number | null; flightCount: number; airlineCount: number };
  airlines?: { airline: string; flights: number; cheapest: number; average: number }[];
  departureTimes?: { morning: number; afternoon: number; evening: number; night: number };
  stops?: { nonstop: number; oneStop: number; twoPlus: number };
  cabins?: string[];
  trend?: { direction: 'up' | 'down' | 'flat' | null; changePct: number | null; points: number; since?: string; insufficientData: boolean };
  flights: LiveFlight[];
}
export interface FareHistoryPoint { t: string; windowDays: number; travelDate: string; min: number; median: number; avg: number; max: number; nFlights: number }

const localKey = (name: string) => `aeronex_${name}`;
const readLocal = <T>(name: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(localKey(name));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeLocal = (name: string, value: unknown) => {
  try {
    localStorage.setItem(localKey(name), JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode / quota) */
  }
};

export const api = {
  /* ── Data provenance ─────────────────────────────────────────────── */
  getDataStatus: async (): Promise<DataStatus> => {
    if (!hasBackend) {
      if (!SIMULATION_ALLOWED) {
        return {
          mode: 'unconfigured', provider: 'No AeroNex server connected', lastCycleAt: null, ageSec: null, freshness: 'unavailable',
          stale: true, refreshIntervalSec: 0, lastError: null,
        };
      }
      const s = simulation();
      s.tick();
      return {
        mode: 'simulated',
        provider: 'Built-in simulation (no server connected)',
        lastCycleAt: s.lastUpdated,
        ageSec: Math.round((Date.now() - new Date(s.lastUpdated).getTime()) / 1000),
        freshness: 'live',
        stale: false,
        refreshIntervalSec: 5,
        lastError: null,
      };
    }
    return get<DataStatus>('/api/data-status');
  },

  /** Kept for existing callers; same payload as getDataStatus plus `status` for legacy checks. */
  getFreshness: async () => {
    const s = await api.getDataStatus();
    return { ...s, lastUpdatedAt: s.lastCycleAt, status: s.mode === 'live' && !s.stale ? 'live' : s.stale ? 'stale' : 'unconfigured' };
  },

  /* ── Market data ─────────────────────────────────────────────────── */
  getDashboardMetrics: async () => (hasBackend ? get('/api/dashboard/metrics') : simulation().metrics()),
  getRouteChanges: async () => (hasBackend ? get('/api/dashboard/routes') : simulation().routeChanges()),

  getRegionalIndex: async () => {
    if (hasBackend) return get('/api/dashboard/regional-index');
    const routes = simulation().routes();
    const groups: Record<string, string[]> = {
      North: ['DEL-BOM', 'DEL-BLR', 'DEL-GOI'], West: ['BOM-BLR'], South: ['MAA-DEL', 'HYD-DEL'], East: ['CCU-DEL', 'CCU-BLR'],
    };
    return Object.entries(groups).map(([region, keys]) => {
      const rs = routes.filter(r => keys.includes(r.route));
      const cur = rs.reduce((n, r) => n + r.currentFare, 0);
      const base = rs.reduce((n, r) => n + (INDEX_BASELINE[r.route] || 0), 0);
      return { region, value: base ? parseFloat(((cur / base) * 100).toFixed(1)) : 0, change: 0 };
    });
  },

  getChartData: async (timeframe: string = '24h') =>
    hasBackend ? get(`/api/dashboard/chart-data?timeframe=${encodeURIComponent(timeframe)}`) : simulation().chart(),

  getIndexBasket: async () => {
    if (hasBackend) return get('/api/dashboard/basket');
    const routes = simulation().routes();
    const total = Object.values(INDEX_BASELINE).reduce((n, v) => n + v, 0);
    return Object.entries(INDEX_BASELINE)
      .map(([route, baseline]) => {
        const r = routes.find(x => x.route === route);
        return {
          route,
          baseline,
          weightPct: parseFloat(((baseline / total) * 100).toFixed(1)),
          currentFare: r?.currentFare ?? null,
          changePct: r?.previousFare ? parseFloat((((r.currentFare - r.previousFare) / r.previousFare) * 100).toFixed(1)) : null,
          vsBaselinePct: r ? parseFloat((((r.currentFare - baseline) / baseline) * 100).toFixed(1)) : null,
        };
      })
      .sort((x, y) => y.weightPct - x.weightPct);
  },

  getRoutes: async () => (hasBackend ? get('/api/routes') : simulation().routes()),
  getRouteHistory: async (routeId: string) => (hasBackend ? get(`/api/routes/${encodeURIComponent(routeId)}?limit=300`) : simulation().historyFor(routeId)),
  getAirports: async () => (hasBackend ? get('/api/airports') : INDIAN_AIRPORTS.map(a => a.code)),
  getAirlines: async () => (hasBackend ? get('/api/airlines') : [
    { code: '6E', name: 'IndiGo' }, { code: 'AI', name: 'Air India' }, { code: 'SG', name: 'SpiceJet' }, { code: 'QP', name: 'Akasa Air' },
  ]),

  /** Latest observed fare for a corridor, or null when AeroNex does not track it. */
  getEstimatedRouteFare: (origin: string, destination: string): number | null => {
    const key = `${origin}-${destination}`.toUpperCase();
    if (hasBackend || !SIMULATION_ALLOWED) return null; // server-observed fares are read via getRoutes()
    const s = simulation().routes().find(r => r.route === key);
    return s ? s.currentFare : null;
  },

  /* ── Live flight data (scraper-backed; every value has a stored, timestamped source) ─────────── */
  /**
   * Search fares for one route and date. Returns immediately with whatever is stored (flagged with its freshness) and,
   * when a refresh is needed, tells the caller it is in progress so the UI can poll instead of blocking.
   */
  searchFlightsLive: async (p: { from: string; to: string; date: string; refresh?: boolean }): Promise<LiveSearchResult> => {
    if (!hasBackend) throw needsServer('Live flight search');
    const qs = new URLSearchParams({ from: p.from, to: p.to, date: p.date, pax: '1', cabin: 'economy' });
    if (p.refresh) qs.set('refresh', '1');
    return get<LiveSearchResult>(`/api/flights/search?${qs}`);
  },
  getFlightDetail: async (id: string): Promise<{ data: FlightDetail }> => {
    if (!hasBackend) throw needsServer('Flight details');
    return get(`/api/flights/${encodeURIComponent(id)}`);
  },
  getRouteIntel: async (origin: string, destination: string): Promise<{ data: RouteIntel }> => {
    if (!hasBackend) throw needsServer('Route intelligence');
    return get(`/api/routes/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`);
  },
  getFareHistory: async (route: string, windowDays?: number, hours = 168): Promise<{ data: { route: string; points: FareHistoryPoint[] } }> => {
    if (!hasBackend) throw needsServer('Fare history');
    return get(`/api/fares/history?route=${encodeURIComponent(route)}&hours=${hours}${windowDays ? `&window=${windowDays}` : ''}`);
  },
  getFareTrends: async (hours = 24): Promise<{ data: any }> => {
    if (!hasBackend) throw needsServer('Fare trends');
    return get(`/api/fares/trends?hours=${hours}`);
  },
  getAirPriceIndex: async (): Promise<{ data: any; meta: any }> => {
    if (!hasBackend) throw needsServer('The air price index');
    return get('/api/air-price-index');
  },
  getDataFreshness: async (): Promise<{ data: any; meta: any }> => {
    if (!hasBackend) throw needsServer('Data freshness');
    return get('/api/data/freshness');
  },

  /* ── AI ──────────────────────────────────────────────────────────── */
  getInsights: async () => (hasBackend ? get('/api/ai/insights') : []),
  getAiInsights: async () => (hasBackend ? get('/api/ai/insights') : []),
  generateInsights: async () => (hasBackend ? post('/api/ai/insights') : []),

  predict: async (params: { route?: string; origin?: string; destination?: string } | string) => {
    if (!hasBackend) throw needsServer('AI fare prediction');
    const p = typeof params === 'string' ? { route: params } : params;
    return post('/api/ai/predict', p.route ? { route: p.route } : { origin: p.origin, destination: p.destination });
  },
  routeAnalysis: async (route: string) => {
    if (!hasBackend) throw needsServer('Route analysis');
    return post('/api/ai/route-analysis', { route });
  },
  bookingRecommendation: async (route: string) => {
    if (!hasBackend) throw needsServer('Booking advice');
    return post('/api/ai/booking-recommendation', { route });
  },
  regionalAnalysis: async (region: string) => {
    if (!hasBackend) throw needsServer('Regional analysis');
    return post('/api/ai/regional-analysis', { region });
  },
  getRouteAnalysis: async (origin: string, destination: string) => api.routeAnalysis(`${origin}-${destination}`),
  getRegionalAnalysis: async (region: string) => api.regionalAnalysis(region),
  getPrediction: async (origin: string, destination: string) => api.predict({ route: `${origin}-${destination}` }),
  getBookingRecommendation: async (origin: string, destination: string) => api.bookingRecommendation(`${origin}-${destination}`),
  askAI: async (message: string, route?: string) => {
    if (!hasBackend) throw needsServer('AeroNex AI chat');
    return post('/api/ai/chat', { message, route });
  },
  getAIStatus: async () => {
    if (!hasBackend) return { configured: false, provider: 'Unavailable', model: 'none', status: 'offline', cachedEntries: 0, rateLimitPerMinute: 0, dataMode: 'simulated' };
    return get('/api/ai/status');
  },

  /* ── Health ──────────────────────────────────────────────────────── */
  getHealth: async () => {
    if (!hasBackend) throw needsServer('Health check');
    return get('/api/health');
  },

  /* ── Price alerts (account: server; guest/standalone: this device only) ─── */
  alertsAreLocal: () => !hasAccountSession(),

  getAlerts: async () => {
    if (hasAccountSession()) return get<any[]>('/api/alerts', true);
    const stored = readLocal<any[]>('price_alerts', []);
    // Device-only alerts are checked against whichever market data this session can see.
    let routes: { route: string; currentFare: number }[] = [];
    try { routes = await api.getRoutes(); } catch { /* keep stored values */ }
    const fareOf = new Map(routes.map(r => [r.route, r.currentFare]));
    const updated = stored.map(a => {
      const fare = fareOf.get(a.route);
      if (fare === undefined) return a;
      const status = a.status === 'Active' && fare <= a.targetPrice ? 'Triggered' : a.status;
      return { ...a, previousFare: a.currentFare, currentFare: fare, status, lastCheckedAt: new Date().toISOString() };
    });
    writeLocal('price_alerts', updated);
    return updated;
  },

  createAlert: async (alert: any) => {
    const origin = String(alert.origin || '').toUpperCase();
    const destination = String(alert.destination || '').toUpperCase();
    if (hasAccountSession()) return post('/api/alerts', { ...alert, origin, destination }, true);

    const targetPrice = Number(alert.targetPrice);
    if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) throw new ApiError('Choose valid origin and destination airports.');
    if (origin === destination) throw new ApiError('Origin and destination must be different airports.');
    if (!Number.isFinite(targetPrice) || targetPrice < 500) throw new ApiError('Enter a target price of at least ₹500.');
    const existing = readLocal<any[]>('price_alerts', []);
    const route = `${origin}-${destination}`;
    const date = alert.date || '';
    if (existing.some(a => a.route === route && a.date === date && a.targetPrice === targetPrice && a.status !== 'Triggered')) {
      throw new ApiError('You already have an alert for this route, date and target price.');
    }
    const tracked = (await api.getRoutes().catch(() => [])).find((r: any) => r.route === route);
    const created = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      origin, destination, route, targetPrice: Math.round(targetPrice),
      currentFare: tracked?.currentFare ?? null, previousFare: null,
      airline: alert.airline || 'Any Airline', date, cabinClass: alert.cabinClass || 'Economy',
      channels: alert.channels?.length ? alert.channels : ['In-app'],
      status: 'Active', createdAt: new Date().toISOString(), lastCheckedAt: null, triggeredAt: null,
    };
    writeLocal('price_alerts', [created, ...existing]);
    return created;
  },

  toggleAlertStatus: async (id: string) => {
    if (hasAccountSession()) return post(`/api/alerts/${encodeURIComponent(id)}/toggle`, {}, true);
    const list = readLocal<any[]>('price_alerts', []);
    const target = list.find(a => a.id === id);
    if (!target) throw new ApiError('That alert no longer exists.', 404);
    target.status = target.status === 'Active' ? 'Paused' : 'Active';
    writeLocal('price_alerts', list);
    return target;
  },

  deleteAlert: async (id: string) => {
    if (hasAccountSession()) return del(`/api/alerts/${encodeURIComponent(id)}`);
    writeLocal('price_alerts', readLocal<any[]>('price_alerts', []).filter(a => a.id !== id));
    return { success: true };
  },

  /* ── Notifications ───────────────────────────────────────────────── */
  getNotifications: async () => (hasAccountSession() ? get<any[]>('/api/notifications', true) : readLocal<any[]>('notifications', [])),
  markNotificationsRead: async (id?: string) => {
    if (hasAccountSession()) return post('/api/notifications/read', id ? { id } : {}, true);
    writeLocal('notifications', readLocal<any[]>('notifications', []).map(n => (!id || n.id === id ? { ...n, read: true } : n)));
    return { success: true };
  },

  /* ── Account & settings ──────────────────────────────────────────── */
  getUserProfile: async () => {
    if (hasAccountSession()) return get('/api/user/profile', true);
    const u = readStoredUser() as Partial<AuthUser> | null;
    return {
      profile: { id: u?.id || '', name: u?.name || 'AeroNex Member', email: u?.email || '', role: u?.role || 'Guest', avatarUrl: u?.avatarUrl, organization: u?.organization || '', phone: u?.phone || '', bio: u?.bio || '' },
      preferences: readLocal('travel_preferences', {}),
      notifications: readLocal('notifications_settings', null),
      appearance: readLocal('appearance_settings', {}),
      integrations: { ...readLocal('integrations', {}), apiKey: '' },
    };
  },

  updateUserProfile: async (data: Partial<AuthUser> & { email: string }) => {
    if (hasAccountSession()) {
      const saved = await put('/api/user/profile', data);
      authService.updateProfile(data.email, { ...data, name: saved?.name ?? data.name });
      return saved;
    }
    return authService.updateProfile(data.email, data);
  },

  uploadAvatar: async (avatarUrl: string, email: string) => {
    if (hasAccountSession()) await post('/api/user/avatar', { avatarUrl }, true);
    authService.updateProfile(email, { avatarUrl });
    return avatarUrl;
  },

  updateUserPreferences: async (preferences: any) => {
    if (hasAccountSession()) return put('/api/user/preferences', { preferences });
    writeLocal('travel_preferences', preferences);
    return preferences;
  },
  updateUserNotifications: async (notifications: any) => {
    if (hasAccountSession()) return put('/api/user/notifications', { notifications });
    writeLocal('notifications_settings', notifications);
    return notifications;
  },
  updateUserAppearance: async (appearance: any) => {
    if (hasAccountSession()) return put('/api/user/appearance', { appearance });
    writeLocal('appearance_settings', { ...readLocal('appearance_settings', {}), ...appearance });
    return appearance;
  },

  toggleIntegration: async (provider: string) => {
    if (hasAccountSession()) return post('/api/user/integrations/toggle', { provider }, true);
    const current = readLocal<Record<string, boolean>>('integrations', {});
    current[provider] = !current[provider];
    writeLocal('integrations', current);
    return current;
  },

  regenerateApiKey: async () => {
    if (!hasAccountSession()) throw new ApiError('Sign in with an AeroNex account to generate an API key.', 401);
    const res = await send('POST', '/api/user/api-key/regenerate', {}, true);
    return (res?.apiKey ?? res) as string;
  },

  /** Verifies the current password with Supabase before applying the new one. */
  changePassword: async (currentPassword: string, newPassword: string, email: string) =>
    authService.changePassword(email, currentPassword, newPassword),

  exportUserData: async () => {
    if (hasAccountSession()) return get('/api/user/export-data', true);
    const u = readStoredUser();
    return {
      metadata: { exportedAt: new Date().toISOString(), service: 'AeroNex Airfare Intelligence Platform', note: 'Guest export: only data stored on this device.' },
      account: u,
      preferences: readLocal('travel_preferences', {}),
      notifications: readLocal('notifications_settings', {}),
      appearance: readLocal('appearance_settings', {}),
      priceAlerts: readLocal('price_alerts', []),
    };
  },

  /** Deletes server-side data and the Supabase auth user, then signs out. Throws if that fails. */
  deleteAccount: async () => {
    if (hasAccountSession()) await del('/api/user/account');
    await authService.deleteAccount();
    return true;
  },

  getFaqs: async () => {
    if (hasBackend) {
      try {
        const res = await get<any[]>('/api/support/faqs');
        if (Array.isArray(res) && res.length) return res;
      } catch { /* use bundled copy */ }
    }
    return FAQS.map(f => ({ id: f.id, category: f.category, question: f.q, answer: f.a }));
  },

  submitSupportTicket: async (ticket: { email: string; subject: string; category: string; message: string; userId?: string }) => {
    if (!hasBackend) throw new ApiError("Support requests can't be sent right now because the AeroNex server isn't connected.", 0, true);
    const headers = hasAccountSession();
    const res = await send('POST', '/api/support/ticket', ticket, headers);
    return { success: true, message: 'Your request was received.', data: res };
  },

  submitFeedback: async (feedback: { email?: string; rating: number; category: string; comments: string; userId?: string }) => {
    if (!hasBackend) throw new ApiError("Feedback can't be sent right now because the AeroNex server isn't connected.", 0, true);
    const res = await send('POST', '/api/support/feedback', feedback, hasAccountSession());
    return { success: true, message: 'Thank you. Your feedback was recorded.', data: res };
  },

  /* ── Data pipeline ───────────────────────────────────────────────── */
  getScraperStatus: async () => {
    if (!hasAccountSession()) {
      throw new ApiError('Sign in with an AeroNex account to view the data pipeline.', 401);
    }
    return get('/api/scraper/status', true);
  },
  triggerScrape: async () => {
    if (!hasAccountSession()) throw new ApiError('Sign in with an AeroNex account to run the pipeline.', 401);
    return send('POST', '/api/scraper/trigger', {}, true);
  },

};
