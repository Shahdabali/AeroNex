import { AirfareProvider } from '../providers/AirfareProvider';
import { PuppeteerAirfareProvider } from '../providers/PuppeteerAirfareProvider';
import { AmadeusAirfareProvider } from '../providers/AmadeusAirfareProvider';
import { validateFareData, FareDataInput } from '../utils/validation';
import { indexEngine } from '../analytics/indexEngine';
import { liveDataStore } from '../liveDataStore';
import { dbService } from '../dbService';
import { alertService } from '../services/alertService';
import { ingestionMonitor, Observation } from '../services/ingestionMonitor';
import { config } from '../config';
import { scraperConfigured } from '../services/scraperClient';
import { syncFromScraper, requestScrape, SCRAPER_PROVIDER_NAME } from './scraperSync';

// Fares that move more than this between consecutive observations are flagged as outliers.
const OUTLIER_THRESHOLD_PCT = 12;

const isAmadeusConfigured = Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);

/**
 * Where fares come from, in order of preference:
 *   scraper    the AeroNex scraper service (real fares collected from a live source)          [SCRAPER_API_URL]
 *   amadeus    the Amadeus Self-Service API (real fares)                                      [AMADEUS_CLIENT_ID/SECRET]
 *   puppeteer  built-in puppeteer scraper (real fares)                                        (default fallback)
 *   none       nothing configured
 */
export type SourceKind = 'scraper' | 'amadeus' | 'puppeteer' | 'none';
export const sourceKind: SourceKind = scraperConfigured()
  ? 'scraper'
  : isAmadeusConfigured
    ? 'amadeus'
    : 'puppeteer';

const provider: AirfareProvider | null =
  sourceKind === 'amadeus'
    ? new AmadeusAirfareProvider(process.env.AMADEUS_CLIENT_ID!, process.env.AMADEUS_CLIENT_SECRET!)
    : sourceKind === 'puppeteer'
      ? new PuppeteerAirfareProvider()
      : null;

const configuredInterval = parseInt(process.env.DATA_REFRESH_INTERVAL_SECONDS || '30', 10);
// Live providers are quota-limited; never poll faster than once a minute. Reading the scraper's stored data is cheap.
const INTERVAL_SEC =
  sourceKind === 'scraper'
    ? Math.max(10, parseInt(process.env.SCRAPER_POLL_SECONDS || '30', 10) || 30)
    : Math.max(provider?.mode === 'live' ? 60 : 5, Number.isFinite(configuredInterval) ? configuredInterval : 30);


let running = false;

/**
 * One ingestion pass: fetch -> validate -> flag outliers -> store -> recompute index -> evaluate alerts.
 * Guarded so a slow provider can never cause overlapping cycles.
 */
export async function runIngestionCycle(reason: 'scheduled' | 'manual' = 'scheduled') {
  if (sourceKind === 'scraper') {
    if (reason === 'manual') await requestScrape().catch(() => undefined);
    return syncFromScraper(reason);
  }
  if (!provider) {
    return { skipped: false as const, reason, error: 'No live airfare source is configured on this server.' };
  }
  if (running) return { skipped: true as const, reason: 'A cycle is already in progress.' };
  running = true;
  const startedAt = Date.now();
  try {
    const raw = await provider.fetchLatestFares();

    const valid: FareDataInput[] = [];
    let rejected = 0;
    for (const item of raw) {
      try {
        valid.push(validateFareData(item));
      } catch {
        rejected++;
      }
    }

    const observations: Observation[] = [];
    let flagged = 0;
    for (const fare of valid) {
      const route = `${fare.origin_iata}-${fare.destination_iata}`;
      const before = liveDataStore.getAllRoutes().find(r => r.route === route);
      const deviationPct = before ? ((fare.fare_amount - before.currentFare) / before.currentFare) * 100 : null;
      const isOutlier = deviationPct !== null && Math.abs(deviationPct) > OUTLIER_THRESHOLD_PCT;
      if (isOutlier) flagged++;
      liveDataStore.updateFare(route, fare.fare_amount);
      observations.push({
        id: `${fare.flight_number}-${startedAt}-${observations.length}`,
        flightNumber: fare.flight_number,
        airlineCode: fare.airline_code,
        origin: fare.origin_iata,
        destination: fare.destination_iata,
        fare: fare.fare_amount,
        source: fare.source,
        capturedAt: new Date().toISOString(),
        flagged: isOutlier,
        deviationPct: deviationPct === null ? null : parseFloat(deviationPct.toFixed(1)),
      });
    }

    let indexValue: number | undefined;
    let indexChange: number | undefined;
    if (valid.length > 0) {
      const indexResult = indexEngine.calculateIndex(valid);
      if (indexResult.sample_size > 0) {
        liveDataStore.addIndexHistory(indexResult.index_value);
        indexValue = indexResult.index_value;
        indexChange = indexResult.change_percent;
        await dbService.saveAirfareIndex(indexResult);
      }
      const regions = ['North', 'South', 'East', 'West'];
      liveDataStore.setRegionalIndices(
        regions.map(region => {
          const result = indexEngine.calculateRegionalIndex(valid, region);
          return { region, value: result.index_value, change: result.change_percent };
        }),
      );
    }

    const triggered = alertService.evaluateAll();
    if (triggered > 0) ingestionMonitor.log('INFO', `${triggered} price alert${triggered === 1 ? '' : 's'} reached target.`);

    const report = {
      provider: provider.name,
      mode: provider.mode,
      attempted: raw.length,
      accepted: valid.length,
      rejected,
      flagged,
      durationMs: Date.now() - startedAt,
      observations,
      indexValue,
      indexChangePercent: indexChange,
    };
    ingestionMonitor.recordCycle(report);
    return { skipped: false as const, reason, ...report };
  } catch (err: any) {
    const message = err?.message || 'Unknown provider error';
    ingestionMonitor.recordCycle({
      provider: provider.name,
      mode: provider.mode,
      attempted: 0,
      accepted: 0,
      rejected: 0,
      flagged: 0,
      durationMs: Date.now() - startedAt,
      observations: [],
      error: message,
    });
    return { skipped: false as const, reason, error: message };
  } finally {
    running = false;
  }
}

export function getProviderInfo() {
  if (sourceKind === 'scraper') return { name: SCRAPER_PROVIDER_NAME, mode: 'live' as const, refreshIntervalSec: INTERVAL_SEC, sourceKind };
  if (!provider) return { name: 'No data source configured', mode: 'unconfigured' as const, refreshIntervalSec: INTERVAL_SEC, sourceKind };
  return { name: provider.name, mode: provider.mode, refreshIntervalSec: INTERVAL_SEC, sourceKind };
}

export async function startIngestionWorker() {
  const info = getProviderInfo();
  ingestionMonitor.configure(info.name, info.mode, INTERVAL_SEC);
  if (sourceKind === 'none') {
    console.warn('[Worker] No fare source configured (set SCRAPER_API_URL or AMADEUS_* for development). The app will report "no data source".');
    return;
  }
  console.log(`[Worker] ${info.name} (${info.mode}) - refresh every ${INTERVAL_SEC}s`);
  await runIngestionCycle('scheduled');
  setInterval(() => void runIngestionCycle('scheduled'), INTERVAL_SEC * 1000);
}
