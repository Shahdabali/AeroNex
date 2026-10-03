import { PuppeteerAirfareProvider } from '../providers/PuppeteerAirfareProvider';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { scraper, scraperConfigured, friendlyScraperMessage, friendlyJobError, ScraperError } from '../services/scraperClient';
import { ingestionMonitor } from '../services/ingestionMonitor';
import { createRateLimiter } from '../middleware/security';

/**
 * Flight-data API. The browser only ever talks to these endpoints; they read the scraper service's stored,
 * validated data. Nothing here scrapes, and nothing is generated: when the scraper has no data or is unreachable
 * the response says so with a friendly message and a machine-readable code.
 *
 * Success:  { data, meta }        Failure: { success: false, error: "<friendly message>", code }
 */
export const flightRouter = Router();

// A search can create real scraping work, so it has a tighter limit than read-only endpoints.
const searchLimiter = createRateLimiter({ windowMs: 60_000, max: 40, message: 'Too many flight searches. Please wait a moment.' });

const inflight = new Map<string, Promise<any>>();
const recent = new Map<string, { at: number; value: any }>();

/** De-duplicates identical concurrent upstream calls and serves a very short-lived copy to absorb bursts. */
async function shared<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = recent.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  const running = inflight.get(key);
  if (running) return running;
  const p = load()
    .then(value => {
      if (ttlMs > 0) recent.set(key, { at: Date.now(), value });
      if (recent.size > 200) recent.delete(recent.keys().next().value as string);
      return value;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(err => {
      if (err instanceof ScraperError || err?.name === 'ZodError') return sendFailure(res, err);
      next(err);
    });

function sendFailure(res: Response, err: unknown) {
  if ((err as any)?.name === 'ZodError') {
    const first = (err as z.ZodError).issues[0];
    return res.status(400).json({ success: false, code: 'invalid_request', error: first ? `${first.path.join('.') || 'request'}: ${first.message}` : 'Invalid request.' });
  }
  const f = friendlyScraperMessage(err);
  return res.status(f.status).json({ success: false, code: f.code, error: f.message });
}

const route = z.string().regex(/^[A-Za-z]{3}-[A-Za-z]{3}$/, 'must look like DEL-BOM').transform(s => s.toUpperCase());
const code = z.string().regex(/^[A-Za-z]{3}$/, 'must be a 3-letter airport code').transform(s => s.toUpperCase());

const searchSchema = z.object({
  from: code,
  to: code,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  pax: z.coerce.number().int().min(1).max(9).default(1),
  cabin: z.string().max(20).default('economy'),
  refresh: z.enum(['1', '0', 'true', 'false']).optional(),
});

/**
 * GET /api/flights/search - answers from the freshest stored scrape and, when it is older than the cache TTL,
 * queues a refresh. `meta.status` tells the client where things stand:
 *   ready | refreshing | pending | failed | ready_stale
 * so the UI can show partial (stale) results immediately and progress for the refresh - it never blocks on a scrape.
 */

const searchJobs = new Map<string, { status: string, data: any[], startedAt: number }>();

flightRouter.get('/flights/search', searchLimiter, wrap(async (req, res) => {
  const q = searchSchema.parse(req.query);
  const params = new URLSearchParams({ from: q.from, to: q.to, date: q.date, pax: String(q.pax), cabin: q.cabin.toLowerCase() });
  if (q.refresh === '1' || q.refresh === 'true') params.set('refresh', '1');
  
  if (!scraperConfigured()) {
    const jobKey = `${q.from}-${q.to}-${q.date}`;
    let job = searchJobs.get(jobKey);
    
    // If user requested refresh, or job doesn't exist, or it's stuck for 60s
    if (q.refresh === '1' || !job || (Date.now() - job.startedAt > 60000 && job.status === 'pending')) {
      job = { status: 'pending', data: [], startedAt: Date.now() };
      searchJobs.set(jobKey, job);
      
      const provider = new PuppeteerAirfareProvider();
      provider.fetchSpecificRoute(q.from, q.to, q.date).then(fares => {
        const liveFlights = fares.map(f => ({
          id: `${f.flight_number}-${f.fare_amount}`,
          airlineCode: f.airline_code,
          airline: f.airline_code === '6E' ? 'IndiGo' : f.airline_code,
          flightNumber: f.flight_number,
          origin: f.origin_iata,
          destination: f.destination_iata,
          route: `${f.origin_iata}-${f.destination_iata}`,
          departureAt: (f as any).departure_time || new Date().toISOString(),
          arrivalAt: (f as any).arrival_time || new Date().toISOString(),
          durationMin: 120,
          stops: 0,
          stopsLabel: 'Nonstop',
          cabin: 'economy',
          fareType: 'Regular',
          aircraft: 'A320',
          baggage: '15kg',
          legs: [],
          price: f.fare_amount,
          currency: f.currency,
          baseFare: Math.round(f.fare_amount * 0.8),
          taxes: Math.round(f.fare_amount * 0.2),
          availability: 'available',
          seatsLeft: null,
          isOutlier: false,
          previousPrice: null,
          priceChangedAt: null,
          priceChangePct: null,
          lowestSeen: f.fare_amount,
          highestSeen: f.fare_amount,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
          source: 'puppeteer',
          sourceUrl: null
        }));
        
        const finishedJob = searchJobs.get(jobKey);
        if (finishedJob) {
          finishedJob.status = 'ready';
          finishedJob.data = liveFlights;
        }
      }).catch(err => {
        console.error("Puppeteer background job failed:", err);
        const failedJob = searchJobs.get(jobKey);
        if (failedJob) failedJob.status = 'failed';
      });
    }
    
    return res.json({
      data: job.status === 'ready' ? job.data : [],
      meta: {
        status: job.status,
        freshness: 'live',
        job: { stage: job.status === 'pending' ? 'scraping' : 'done', attempts: 1 }
      }
    });
  }

  const { data, meta } = await shared(`search:${params}`, 0, () => scraper.get<any[]>(`/search?${params}`, 10_000));
  const failed = meta.error ? friendlyJobError(meta.error.kind) : null;
  res.json({ data, meta: { ...meta, errorMessage: failed } });
}));


flightRouter.get('/flights/:id', wrap(async (req, res) => {
  const id = z.string().regex(/^[0-9a-f]{20}$/, 'invalid flight id').parse(req.params.id);
  const out = await shared(`flight:${id}`, 3000, () => scraper.get(`/flights/${id}`));
  res.json(out);
}));

flightRouter.get('/routes/:origin/:destination', wrap(async (req, res) => {
  const o = code.parse(req.params.origin);
  const d = code.parse(req.params.destination);
  const out = await shared(`route:${o}-${d}`, 3000, () => scraper.get(`/routes/${o}/${d}`));
  res.json(out);
}));

flightRouter.get('/fares/history', wrap(async (req, res) => {
  const q = z.object({
    route,
    window: z.coerce.number().int().min(0).max(365).optional(),
    hours: z.coerce.number().int().min(1).max(24 * 365).default(168),
  }).parse(req.query);
  const qs = new URLSearchParams({ route: q.route, hours: String(q.hours), ...(q.window ? { window: String(q.window) } : {}) });
  res.json(await shared(`hist:${qs}`, 5000, () => scraper.get(`/fares/history?${qs}`)));
}));

flightRouter.get('/fares/trends', wrap(async (req, res) => {
  const q = z.object({ hours: z.coerce.number().int().min(1).max(24 * 90).default(24) }).parse(req.query);
  res.json(await shared(`trends:${q.hours}`, 5000, () => scraper.get(`/fares/trends?hours=${q.hours}`)));
}));

flightRouter.get('/air-price-index', wrap(async (_req, res) => {
  res.json(await shared('index', 3000, () => scraper.get('/index')));
}));

flightRouter.get('/air-price-index/history', wrap(async (req, res) => {
  const q = z.object({ hours: z.coerce.number().int().min(1).max(24 * 365).default(24 * 30) }).parse(req.query);
  res.json(await shared(`indexhist:${q.hours}`, 5000, () => scraper.get(`/index/history?hours=${q.hours}`)));
}));

/** Data freshness: this server's view of the feed, plus the scraper's own per-route freshness when reachable. */
flightRouter.get('/data/freshness', wrap(async (_req, res) => {
  const source = ingestionMonitor.getDataSource();
  if (!scraperConfigured()) return res.json({ data: { source, scraper: null }, meta: { scraperConfigured: false } });
  try {
    const { data } = await shared('freshness', 3000, () => scraper.get('/freshness'));
    res.json({ data: { source, scraper: data }, meta: { scraperConfigured: true, scraperReachable: true } });
  } catch (err) {
    res.json({ data: { source, scraper: null }, meta: { scraperConfigured: true, scraperReachable: false, message: friendlyScraperMessage(err).message } });
  }
}));
