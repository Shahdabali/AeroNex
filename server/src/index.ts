import express from 'express';
import cors from 'cors';
import { dbService } from './dbService';
import { config } from './config';
import { liveDataStore } from './liveDataStore';
import { startIngestionWorker, sourceKind } from './workers/fareIngestionWorker';
import { getLatestIndex } from './workers/scraperSync';
import { flightRouter } from './routes/flightRoutes';
import { aiRouter } from './routes/aiRoutes';
import { userRouter } from './routes/userRoutes';
import { supportRouter } from './routes/supportRoutes';
import { scraperRouter } from './routes/scraperRoutes';
import { alertRouter } from './routes/alertRoutes';
import { corsOptions, securityHeaders, createRateLimiter, errorHandler } from './middleware/security';
import { ingestionMonitor } from './services/ingestionMonitor';
import { indexEngine } from './analytics/indexEngine';

const app = express();

if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
app.use(securityHeaders);
app.use(cors(corsOptions));
// Largest legitimate body is an avatar data URL (~2 MB); everything else is tiny.
app.use(express.json({ limit: '3mb' }));
app.use('/api', createRateLimiter({ windowMs: 60_000, max: 300 }));

// AeroNex Subsystems
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);
app.use('/api/support', supportRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api', alertRouter);
app.use('/api', flightRouter);

const asyncRoute =
  (fn: (req: express.Request, res: express.Response) => Promise<unknown>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) =>
    fn(req, res).catch(next);

// Dashboard Analytics Routes
app.get('/api/dashboard/metrics', asyncRoute(async (_req, res) => {
  res.json(await dbService.getDashboardMetrics());
}));

app.get('/api/dashboard/routes', asyncRoute(async (_req, res) => {
  res.json(await dbService.getTopRouteChanges());
}));

app.get('/api/dashboard/regional-index', asyncRoute(async (_req, res) => {
  res.json(await dbService.getRegionalIndices());
}));

app.get('/api/dashboard/chart-data', asyncRoute(async (req, res) => {
  const timeframe = typeof req.query.timeframe === 'string' ? req.query.timeframe : '24h';
  res.json(await dbService.getAirfareChartData(timeframe));
}));

/** The basket of corridors behind the index, joined with the latest observed fares. */
app.get('/api/dashboard/basket', (_req, res) => {
  const fares = new Map(liveDataStore.getAllRoutes().map(r => [r.route, r]));
  if (sourceKind === 'scraper') {
    // The real basket: the routes and lead-time windows behind the index, each measured against its own base fare.
    const idx = getLatestIndex();
    if (!idx) return res.json([]);
    return res.json(
      idx.components.map((c: any) => {
        const w = c.windows['15'] ?? c.windows[Object.keys(c.windows)[0]];
        const f = fares.get(c.route);
        return {
          route: c.route,
          region: c.region,
          baseline: Math.round(w.base),
          weightPct: parseFloat((100 / idx.nRoutes).toFixed(1)),
          currentFare: Math.round(w.current),
          changePct: f && f.previousFare ? parseFloat((((f.currentFare - f.previousFare) / f.previousFare) * 100).toFixed(1)) : null,
          vsBaselinePct: parseFloat(((c.relative - 1) * 100).toFixed(1)),
          windows: c.windows,
        };
      }),
    );
  }
  res.json(
    indexEngine
      .getBasket()
      .map(b => {
        const f = fares.get(b.route);
        return {
          ...b,
          currentFare: f ? f.currentFare : null,
          changePct: f && f.previousFare ? parseFloat((((f.currentFare - f.previousFare) / f.previousFare) * 100).toFixed(1)) : null,
          vsBaselinePct: f ? parseFloat((((f.currentFare - b.baseline) / b.baseline) * 100).toFixed(1)) : null,
        };
      })
      .sort((a, b) => b.weightPct - a.weightPct),
  );
});

/** Truthful data provenance: whether fares are live or simulated, and how fresh they are. */
app.get('/api/data-status', (_req, res) => {
  res.json(ingestionMonitor.getDataSource());
});

app.get('/api/dashboard/freshness', (_req, res) => {
  const ds = ingestionMonitor.getDataSource();
  res.json({ lastUpdatedAt: liveDataStore.getLastUpdatedAt(), ...ds });
});

app.get('/api/health', asyncRoute(async (_req, res) => {
  const dbHealth = await dbService.getHealth();
  const ds = ingestionMonitor.getDataSource();
  res.json({
    brand: 'AeroNex',
    tagline: 'FLY BEYOND LIMITS',
    // A pipeline error (e.g. the scraper is unreachable) degrades health even while the last data is still recent.
    status: dbHealth.connected && !ds.stale && !ds.lastError ? 'ok' : 'degraded',
    services: {
      db: dbHealth.connected ? 'ok' : 'degraded',
      dbDetails: { provider: dbHealth.provider, connected: dbHealth.connected, message: dbHealth.message },
      worker: ds.stale ? 'stale' : 'ok',
      dataSource: sourceKind === 'scraper' ? (ds.lastError ? 'scraper-unreachable' : ds.freshness) : sourceKind,
      ai: process.env.GEMINI_API_KEY ? 'ok' : 'deterministic-only',
    },
    dataSource: ds,
  });
}));

// Reference Data Routes
const AIRPORTS = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'GOI', 'AMD', 'PNQ', 'COK', 'JAI', 'LKO', 'GAU', 'IXC'];
const AIRLINES = [
  { code: '6E', name: 'IndiGo' },
  { code: 'AI', name: 'Air India' },
  { code: 'SG', name: 'SpiceJet' },
  { code: 'UK', name: 'Vistara' },
  { code: 'QP', name: 'Akasa Air' },
];

app.get('/api/airports', (_req, res) => {
  res.json(AIRPORTS);
});

app.get('/api/airlines', (_req, res) => {
  res.json(AIRLINES);
});

app.get('/api/routes', (_req, res) => {
  res.json(liveDataStore.getAllRoutes());
});

app.get('/api/routes/:id', (req, res) => {
  const id = req.params.id.toUpperCase();
  if (!/^[A-Z]{3}-[A-Z]{3}$/.test(id)) return res.status(400).json({ success: false, error: 'Route must look like DEL-BOM.' });
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
  res.json(liveDataStore.getRouteHistory(id, limit));
});

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`AeroNex API running on port ${config.port}`);
  console.log(`Persistence: ${config.isDemoMode ? 'in-memory (no Supabase configured)' : 'Supabase'}`);
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    console.warn('[auth] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing: authenticated endpoints will reject all requests.');
  }
  void startIngestionWorker();
});
