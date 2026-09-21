import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { ingestionMonitor } from '../services/ingestionMonitor';
import { runIngestionCycle } from '../workers/fareIngestionWorker';

export const scraperRouter = Router();
scraperRouter.use(requireAuth);

// GET /api/scraper/status — real pipeline telemetry (no synthetic figures)
scraperRouter.get('/status', (_req, res) => {
  res.json({ success: true, data: ingestionMonitor.getStatus() });
});

const lastTrigger = new Map<string, number>();
const MIN_TRIGGER_GAP_MS = 10_000;

// POST /api/scraper/trigger — run one ingestion cycle now
scraperRouter.post('/trigger', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const last = lastTrigger.get(userId) || 0;
    const wait = MIN_TRIGGER_GAP_MS - (Date.now() - last);
    if (wait > 0) {
      res.set('Retry-After', String(Math.ceil(wait / 1000)));
      return res.status(429).json({ success: false, error: `Please wait ${Math.ceil(wait / 1000)}s before running another cycle.` });
    }
    lastTrigger.set(userId, Date.now());
    const result: any = await runIngestionCycle('manual');
    if (result.skipped) return res.status(409).json({ success: false, error: result.reason });
    if (result.error) return res.status(502).json({ success: false, error: `Data provider error: ${result.error}` });
    res.json({
      success: true,
      data: {
        recordsIngested: result.accepted,
        rejected: result.rejected,
        flagged: result.flagged,
        executionTimeMs: result.durationMs,
        newIndexValue: result.indexValue ?? null,
        indexChangePercent: result.indexChangePercent ?? null,
        provider: result.provider,
        mode: result.mode,
      },
    });
  } catch (err) {
    next(err);
  }
});
