import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { config } from '../config';
import { ingestionMonitor } from '../services/ingestionMonitor';
import { scraper, ScraperError, friendlyScraperMessage } from '../services/scraperClient';
import { runIngestionCycle, sourceKind, getProviderInfo } from '../workers/fareIngestionWorker';
import { requestScrape, syncFromScraper } from '../workers/scraperSync';

export const scraperRouter = Router();
scraperRouter.use(requireAuth);

/** Manual scrapes cost real requests against a third-party site, so only administrators may start them. */
export function isAdmin(email: string | undefined): boolean {
  if (config.adminEmails.length > 0) return !!email && config.adminEmails.includes(email.toLowerCase());
  return !config.isProduction; // development convenience only; production with no ADMIN_EMAILS means nobody
}

// GET /api/scraper/status - real pipeline telemetry: this server's ingestion view plus the scraper's own health
scraperRouter.get('/status', async (req, res) => {
  const base = ingestionMonitor.getStatus();
  let scraperStatus: any = null;
  let scraperError: string | null = null;
  if (sourceKind === 'scraper') {
    try {
      scraperStatus = (await scraper.get('/status')).data;
    } catch (err) {
      scraperError = friendlyScraperMessage(err).message;
    }
  }
  res.json({
    success: true,
    data: { ...base, sourceKind, provider: getProviderInfo(), scraper: scraperStatus, scraperError, canTrigger: isAdmin(req.user?.email) },
  });
});

const lastTrigger = new Map<string, number>();
const MIN_TRIGGER_GAP_MS = 10_000;

// POST /api/scraper/trigger - queue a refresh of the standard routes now (administrators only)
scraperRouter.post('/trigger', async (req, res, next) => {
  try {
    if (!isAdmin(req.user?.email)) {
      return res.status(403).json({ success: false, error: 'Only AeroNex administrators can start a manual scrape.' });
    }
    const userId = req.user!.id;
    const last = lastTrigger.get(userId) || 0;
    const wait = MIN_TRIGGER_GAP_MS - (Date.now() - last);
    if (wait > 0) {
      res.set('Retry-After', String(Math.ceil(wait / 1000)));
      return res.status(429).json({ success: false, error: `Please wait ${Math.ceil(wait / 1000)}s before starting another scrape.` });
    }
    lastTrigger.set(userId, Date.now());

    if (sourceKind === 'scraper') {
      try {
        const q = await requestScrape();
        void syncFromScraper('manual');
        // 202: the scrape is QUEUED, not done. The pipeline page shows real job progress as the worker finishes.
        return res.status(202).json({
          success: true,
          data: {
            queued: q.created,
            alreadyQueued: q.alreadyQueued,
            message: q.created
              ? `Queued ${q.created} scrape job${q.created === 1 ? '' : 's'}. Fresh fares appear as the worker completes them.`
              : 'Those scrapes are already queued or running.',
          },
        });
      } catch (err) {
        if (err instanceof ScraperError) {
          const f = friendlyScraperMessage(err);
          return res.status(f.status).json({ success: false, error: f.message });
        }
        throw err;
      }
    }

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
