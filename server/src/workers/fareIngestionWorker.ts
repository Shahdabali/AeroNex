import { AirfareProvider } from '../providers/AirfareProvider';
import { DemoAirfareProvider } from '../providers/DemoAirfareProvider';
import { AmadeusAirfareProvider } from '../providers/AmadeusAirfareProvider';
import { validateFareData, FareDataInput } from '../utils/validation';
import { indexEngine } from '../analytics/indexEngine';
import { liveDataStore } from '../liveDataStore';
import { dbService } from '../dbService';
import { alertService } from '../services/alertService';
import { ingestionMonitor, Observation } from '../services/ingestionMonitor';

// Fares that move more than this between consecutive observations are flagged as outliers.
const OUTLIER_THRESHOLD_PCT = 12;

const isAmadeusConfigured = Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);

const provider: AirfareProvider = isAmadeusConfigured
  ? new AmadeusAirfareProvider(process.env.AMADEUS_CLIENT_ID!, process.env.AMADEUS_CLIENT_SECRET!)
  : new DemoAirfareProvider();

const configuredInterval = parseInt(process.env.DATA_REFRESH_INTERVAL_SECONDS || '30', 10);
// Live providers are quota-limited; never poll faster than once a minute.
const INTERVAL_SEC = Math.max(provider.mode === 'live' ? 60 : 5, Number.isFinite(configuredInterval) ? configuredInterval : 30);

let running = false;

/**
 * One ingestion pass: fetch -> validate -> flag outliers -> store -> recompute index -> evaluate alerts.
 * Guarded so a slow provider can never cause overlapping cycles.
 */
export async function runIngestionCycle(reason: 'scheduled' | 'manual' = 'scheduled') {
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
  return { name: provider.name, mode: provider.mode, refreshIntervalSec: INTERVAL_SEC };
}

export async function startIngestionWorker() {
  ingestionMonitor.configure(provider.name, provider.mode, INTERVAL_SEC);
  console.log(`[Worker] ${provider.name} (${provider.mode}) — refresh every ${INTERVAL_SEC}s`);
  await runIngestionCycle('scheduled');
  setInterval(() => void runIngestionCycle('scheduled'), INTERVAL_SEC * 1000);
}
