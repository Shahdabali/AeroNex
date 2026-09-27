/* eslint-disable @typescript-eslint/no-var-requires */
import http from 'http';
import os from 'os';
import path from 'path';
import fs from 'fs';
import express from 'express';

process.env.AERONEX_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'aeronex-scraper-test-'));

let passed = 0;
let failed = 0;
function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}`);
    failed++;
  }
}

type Handler = (req: http.IncomingMessage, url: URL) => { status?: number; body?: any; delayMs?: number; raw?: string } | undefined;
let handler: Handler = () => undefined;
const requests: { method: string; path: string; auth: string | undefined }[] = [];

const fake = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://x');
  requests.push({ method: req.method || 'GET', path: url.pathname + url.search, auth: req.headers.authorization });
  const out = handler(req, url) || { status: 404, body: { error: { code: 'not_found', message: 'nope' } } };
  const send = () => {
    res.statusCode = out.status ?? 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(out.raw !== undefined ? out.raw : JSON.stringify(out.body));
  };
  if (out.delayMs) setTimeout(send, out.delayMs);
  else send();
});

const env = (routes: any[], extra: Record<string, any> = {}) => ({
  data: routes,
  meta: {
    newestObservedAt: routes.length ? routes[0].observedAt : null,
    referenceWindowDays: 15,
    flightsTracked24h: 812,
    refreshIntervalSec: 1800,
    thresholds: { liveMaxSec: 2700, delayedMaxSec: 10800 },
    ...extra,
  },
});

const route = (r: string, current: number, snapshotId: number, at: string, over: Record<string, any> = {}) => ({
  route: r, current, previous: current - 100, changePct: -1.5, cheapest: current - 400, nFlights: 100, nAirlines: 5,
  observedAt: at, snapshotId, referenceWindowDays: 15, ...over,
});

async function run() {
  await new Promise<void>(r => fake.listen(0, '127.0.0.1', r));
  const port = (fake.address() as any).port;
  process.env.SCRAPER_API_URL = `http://127.0.0.1:${port}`;
  process.env.SCRAPER_API_TOKEN = 'test-token-123';
  process.env.NODE_ENV = 'development';

  const { ScraperClient, ScraperError, friendlyScraperMessage, friendlyJobError } = require('../services/scraperClient') as typeof import('../services/scraperClient');
  const { liveDataStore } = require('../liveDataStore') as typeof import('../liveDataStore');
  const { ingestionMonitor } = require('../services/ingestionMonitor') as typeof import('../services/ingestionMonitor');
  const sync = require('../workers/scraperSync') as typeof import('../workers/scraperSync');
  const { flightRouter } = require('../routes/flightRoutes') as typeof import('../routes/flightRoutes');
  const { isAdmin } = require('../routes/scraperRoutes') as typeof import('../routes/scraperRoutes');
  const { config } = require('../config') as typeof import('../config');

  const client = new ScraperClient(`http://127.0.0.1:${port}`, 'test-token-123');

  console.log('[1] Scraper client');
  handler = () => ({ body: { data: [1, 2], meta: { a: 1 } } });
  const ok = await client.get('/routes');
  assert(Array.isArray(ok.data) && ok.meta.a === 1, 'parses the {data, meta} envelope');
  assert(requests[requests.length - 1].auth === 'Bearer test-token-123', 'sends the bearer token (server-side only)');
  assert(requests[requests.length - 1].path === '/internal/v1/routes', 'targets the /internal/v1 API');

  const kindOf = async (h: Handler, call: () => Promise<any> = () => client.get('/x')) => {
    handler = h;
    try {
      await call();
      return 'ok';
    } catch (e: any) {
      return e instanceof ScraperError ? e.kind : `other:${e?.message}`;
    }
  };
  assert((await kindOf(() => ({ status: 401, body: { error: { message: 'no' } } }))) === 'unauthorized', '401 -> unauthorized');
  assert((await kindOf(() => ({ status: 400, body: { error: { message: 'Travel date is in the past.' } } }))) === 'bad_request', '400 -> bad_request');
  assert((await kindOf(() => ({ status: 429, body: { error: { message: 'slow down' } } }))) === 'rate_limited', '429 -> rate_limited');
  assert((await kindOf(() => ({ raw: '<html>oops</html>' }))) === 'invalid_response', 'non-JSON -> invalid_response');
  assert((await kindOf(() => ({ body: { nodata: true } }))) === 'invalid_response', 'wrong envelope -> invalid_response');

  let calls = 0;
  const flaky = await kindOf(() => (++calls === 1 ? { status: 502, body: { error: { message: 'bad gateway' } } } : { body: { data: 1, meta: {} } }));
  assert(flaky === 'ok' && calls === 2, 'a transient 502 on a GET is retried once');
  calls = 0;
  assert((await kindOf(() => { calls++; return { status: 400, body: { error: { message: 'bad' } } }; })) === 'bad_request' && calls === 1, '4xx is never retried');
  handler = () => ({ body: { data: 1, meta: {} }, delayMs: 400 });
  try {
    await client.get('/slow', 100);
    assert(false, 'timeout should throw');
  } catch (e: any) {
    assert(e.kind === 'timeout', 'a slow scraper -> timeout');
  }
  const dead = new ScraperClient('http://127.0.0.1:1', 'x');
  try {
    await dead.get('/x');
    assert(false, 'unreachable should throw');
  } catch (e: any) {
    assert(e.kind === 'unreachable', 'a dead scraper -> unreachable');
  }
  try {
    await new ScraperClient('', '').get('/x');
    assert(false, 'not configured should throw');
  } catch (e: any) {
    assert(e.kind === 'not_configured', 'no URL configured -> not_configured');
  }

  console.log('\n[2] Friendly messages never leak internals');
  const leaky = [
    friendlyScraperMessage(new ScraperError('unreachable', 'connect ECONNREFUSED 10.1.2.3:8000')).message,
    friendlyScraperMessage(new ScraperError('unauthorized', 'Bearer abc')).message,
    friendlyScraperMessage(new ScraperError('upstream', 'Traceback (most recent call last)')).message,
    friendlyScraperMessage(new Error('boom at /srv/app/x.ts:12')).message,
  ];
  assert(leaky.every(m => !/ECONNREFUSED|Bearer|Traceback|\.ts|10\.1\.2\.3/.test(m)), 'user-facing messages contain no addresses, tokens or stack text');
  assert(friendlyScraperMessage(new ScraperError('bad_request', 'Travel date is in the past.')).message === 'Travel date is in the past.', 'validation messages pass through unchanged');
  assert(/temporarily unavailable/.test(friendlyScraperMessage(new ScraperError('timeout', 't')).message), 'timeouts read as "temporarily unavailable"');
  assert(/refusing automated access/.test(friendlyJobError('access_denied')) && /could not read/.test(friendlyJobError('parser')), 'job failures map to distinct explanations');
  assert(friendlyJobError('access_denied') !== friendlyJobError('timeout') && friendlyJobError('timeout') !== friendlyJobError('parser'), 'no-flights / blocked / timeout / parser are all distinguishable');

  console.log('\n[3] Sync from the scraper');
  const T1 = new Date(Date.now() - 5 * 60_000).toISOString();
  const T2 = new Date(Date.now() - 60_000).toISOString();
  let snapshot = 100;
  let at = T1;
  let price = 6500;
  handler = (_req, url) => {
    if (url.pathname.endsWith('/routes')) return { body: env([route('DEL-BOM', price, snapshot, at), route('BOM-DEL', 6600, snapshot + 1, at)]) };
    if (url.pathname.endsWith('/fares/history')) {
      return { body: { data: { points: [{ t: new Date(Date.now() - 3_600_000).toISOString(), median: 6400 }, { t: new Date(Date.now() - 1_800_000).toISOString(), median: 6450 }] }, meta: {} } };
    }
    if (url.pathname.endsWith('/index/history')) return { body: { data: [{ t: new Date(Date.now() - 3_600_000).toISOString(), value: 100 }], meta: {} } };
    if (url.pathname.endsWith('/index')) {
      return { body: { data: { value: 101.5, previous: 100, changePct: 1.5, computedAt: at, regional: { North: 102, South: 99 }, components: [], nRoutes: 2 }, meta: {} } };
    }
    return undefined;
  };
  const r1: any = await sync.syncFromScraper();
  assert(!r1.error && r1.accepted === 2, 'first sync applies both routes');
  const rf = liveDataStore.getAllRoutes().find(x => x.route === 'DEL-BOM')!;
  assert(rf.currentFare === 6500 && rf.previousFare === 6400 && rf.cheapestFare === 6100, 'fares, previous fare and cheapest fare come from the scraper (nothing invented)');
  assert(rf.lastUpdated.toISOString() === T1, "the fare carries the scraper's own timestamp, not the poll time");
  assert(liveDataStore.getRouteHistory('DEL-BOM', 50).length >= 3, 'persisted history was seeded from the scraper database');
  assert(liveDataStore.getMetrics().flightsTracked.value === 812, 'flights-tracked comes from the scraper, not a counter');
  const metrics = liveDataStore.getMetrics();
  assert(metrics.airfareIndex.value === 101.5, 'the dashboard index is the scraper-computed index');
  assert(liveDataStore.getRegionalIndices().some(x => x.region === 'North' && x.value === 102), 'regional indices come from the scraper');

  const tracked = liveDataStore.getRouteHistory('DEL-BOM', 500).length;
  const r2: any = await sync.syncFromScraper();
  assert(r2.accepted === 0 && liveDataStore.getRouteHistory('DEL-BOM', 500).length === tracked, 'same snapshot again: the dashboard does NOT move');

  snapshot = 200;
  at = T2;
  price = 6800;
  const r3: any = await sync.syncFromScraper();
  const rf2 = liveDataStore.getAllRoutes().find(x => x.route === 'DEL-BOM')!;
  assert(r3.accepted >= 1 && rf2.currentFare === 6800 && liveDataStore.getRouteHistory('DEL-BOM', 500).length === tracked + 1, 'a newer snapshot updates the fare and appends one history point');

  console.log('\n[4] Freshness reflects the age of the DATA');
  const ds = ingestionMonitor.getDataSource();
  assert(ds.mode === 'live' && ds.freshness === 'live' && ds.stale === false && (ds.ageSec ?? 999) < 120, 'a 1-minute-old scrape is live');
  assert(ds.lastCycleAt === T2, 'lastCycleAt is the scrape time (data age), not the time this server polled');
  const old = new Date(Date.now() - 2 * 3600_000).toISOString();
  ingestionMonitor.recordCycle({ provider: 'x', mode: 'live', attempted: 1, accepted: 1, rejected: 0, flagged: 0, durationMs: 1, observations: [], dataAsOf: old });
  assert(ingestionMonitor.getDataSource().freshness === 'delayed' && ingestionMonitor.getDataSource().stale, 'data 2 h old is "delayed", never "live"');
  ingestionMonitor.recordCycle({ provider: 'x', mode: 'live', attempted: 1, accepted: 1, rejected: 0, flagged: 0, durationMs: 1, observations: [], dataAsOf: new Date(Date.now() - 5 * 3600_000).toISOString() });
  assert(ingestionMonitor.getDataSource().freshness === 'stale', 'data 5 h old is "stale"');

  console.log('\n[5] Failure behaviour');
  handler = () => ({ body: env([]) });
  const before = ingestionMonitor.getDataSource().lastCycleAt;
  const r4: any = await sync.syncFromScraper();
  assert(!!r4.error && ingestionMonitor.getDataSource().lastCycleAt === before, 'a scraper with no data reports an error and does NOT refresh the freshness clock');
  handler = () => ({ status: 503, body: { error: { message: 'down' } } });
  const r5: any = await sync.syncFromScraper();
  assert(!!r5.error && !!ingestionMonitor.getDataSource().lastError, 'an unreachable/failing scraper is recorded as an error, dashboard data is kept');
  assert(liveDataStore.getAllRoutes().find(x => x.route === 'DEL-BOM')!.currentFare === 6800, 'the last real fares stay visible (flagged stale by age), never replaced by invented values');

  console.log('\n[6] Flight API over HTTP');
  const app = express();
  app.use('/api', flightRouter);
  const api = http.createServer(app);
  await new Promise<void>(r => api.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${(api.address() as any).port}/api`;
  const get = async (p: string) => {
    const res = await fetch(base + p);
    return { status: res.status, body: (await res.json()) as any };
  };

  const bad = await get('/flights/search?from=DEL&to=BOM');
  assert(bad.status === 400 && /date/.test(bad.body.error), 'missing date -> 400 with a clear field message');
  assert((await get('/flights/search?from=DE&to=BOM&date=2026-12-01')).status === 400, 'bad airport code -> 400');
  assert((await get("/flights/search?from=DEL&to=BOM&date=2026-12-01&pax=99")).status === 400, 'absurd passenger count -> 400');
  assert((await get('/flights/notanid')).status === 400, 'malformed flight id -> 400');
  assert((await get('/fares/history?route=DELBOM')).status === 400, 'malformed route -> 400');
  const injected = await get("/flights/search?from=DEL&to=BOM&date=2026-12-01&cabin=" + encodeURIComponent("x'; DROP TABLE flights;--"));
  assert(injected.status === 200 || injected.status === 400 || injected.status === 503, 'injection strings are treated as data, not executed');

  requests.length = 0;
  handler = (_req, url) => {
    if (url.pathname.endsWith('/search')) {
      return {
        body: {
          data: [{ id: 'a'.repeat(20), price: 6100 }],
          meta: { status: 'ready_stale', freshness: 'delayed', ageSec: 4000, refreshing: false, error: { kind: 'access_denied', message: 'raw internal text' }, retryAfterSec: 90 },
        },
      };
    }
    return undefined;
  };
  const found = await get('/flights/search?from=DEL&to=BOM&date=2026-12-01');
  assert(found.status === 200 && found.body.data.length === 1 && found.body.meta.freshness === 'delayed', 'search returns data with its freshness');
  assert(/refusing automated access/.test(found.body.meta.errorMessage) && !/raw internal text/.test(JSON.stringify(found.body.meta.errorMessage)), 'a failed refresh is explained in friendly words, not raw scraper text');
  assert(requests.length === 1 && /from=DEL&to=BOM&date=2026-12-01/.test(requests[0].path) && requests[0].auth === 'Bearer test-token-123', 'the browser request becomes an authenticated server-to-server call');
  assert(!JSON.stringify(found.body).includes('test-token-123') && !JSON.stringify(found.body).includes(String(port)), 'the token and scraper address never reach the browser');

  handler = () => ({ status: 503, body: { error: { message: 'internal: db locked at /srv/x.py' } } });
  const down = await get('/routes/DEL/BOM');
  assert(down.status === 503 && down.body.error === 'Live airfare data is temporarily unavailable.' && down.body.code === 'live_data_unavailable', 'scraper failure -> friendly 503 with a stable code');
  assert(!/srv|db locked/.test(JSON.stringify(down.body)), 'no internals in the error body');

  handler = () => ({ status: 400, body: { error: { message: 'Only economy fares are collected at the moment.' } } });
  const rejected = await get('/flights/search?from=DEL&to=BOM&date=2026-12-01&cabin=business');
  assert(rejected.status === 400 && /economy/.test(rejected.body.error), 'scraper-side validation messages reach the user intact');

  let concurrent = 0;
  handler = (_req, url) => {
    if (url.pathname.endsWith('/routes/DEL/BOM')) {
      concurrent++;
      return { body: { data: { route: 'DEL-BOM' }, meta: {} }, delayMs: 80 };
    }
    return undefined;
  };
  await Promise.all([get('/routes/DEL/BOM'), get('/routes/DEL/BOM'), get('/routes/DEL/BOM'), get('/routes/DEL/BOM')]);
  assert(concurrent === 1, 'identical concurrent requests share ONE upstream call');

  console.log('\n[7] Administrative controls');
  const saved = { emails: config.adminEmails, prod: config.isProduction };
  (config as any).adminEmails = [];
  (config as any).isProduction = true;
  assert(isAdmin('anyone@example.com') === false && isAdmin(undefined) === false, 'production with no ADMIN_EMAILS: nobody may trigger scrapes');
  (config as any).adminEmails = ['boss@example.com'];
  assert(isAdmin('BOSS@example.com') === true && isAdmin('other@example.com') === false, 'only listed administrators may trigger scrapes (case-insensitive)');
  (config as any).adminEmails = [];
  (config as any).isProduction = false;
  assert(isAdmin('dev@example.com') === true, 'outside production a signed-in developer may trigger scrapes');
  (config as any).adminEmails = saved.emails;
  (config as any).isProduction = saved.prod;

  api.close();
  fake.close();
  fs.rmSync(process.env.AERONEX_DATA_DIR!, { recursive: true, force: true });
  console.log(`\nAeroNex scraper-integration tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
