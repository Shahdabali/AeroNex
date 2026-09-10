import { Router } from 'express';
import { scraperService } from '../services/scraperService';

export const scraperRouter = Router();

// GET /api/scraper/status
scraperRouter.get('/status', (req, res) => {
  try {
    const status = scraperService.getStatus();
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/scraper/trigger
scraperRouter.post('/trigger', async (req, res) => {
  try {
    const { crawlerId } = req.body || {};
    const result = await scraperService.triggerManualScrape(crawlerId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
