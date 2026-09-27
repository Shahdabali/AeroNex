import { scraper, ScraperError } from '../services/scraperClient';
import { liveDataStore } from '../liveDataStore';
import { ingestionMonitor, Observation } from '../services/ingestionMonitor';
import { alertService } from '../services/alertService';

/**
 * Keeps the dashboard store in step with the scraper service.
 *
 * The scraper collects, validates and stores fares on its own schedule; this module only READS the latest route
 * snapshots and index from it. Nothing is generated here, and the store is updated only when the scraper reports a
 * NEWER snapshot than the one already applied - so the dashboard moves when real data moves, and not otherwise.
 */
export const SCRAPER_PROVIDER_NAME = 'EaseMyTrip via AeroNex scraper';

interface RouteSummary {
  route: string;
  current: number;
  previous: number | null;
  changePct: number | null;
  cheapest: number;
  nFlights: number;
  nAirlines: number;
  observedAt: string;
  snapshotId: number;
  referenceWindowDays: number;
}

interface IndexPayload {
  value: number;
  previous: number | null;
  changePct: number | null;
  computedAt: string;
  regional: Record<string, number>;
  components: any[];
  nRoutes: number;
}

const appliedSnapshot = new Map<string, number>();
let appliedIndexAt: string | null = null;
let historySeeded = false;
let latestIndex: IndexPayload | null = null;
let previousRegional: Record<string, number> = {};
let running = false;

export const getLatestIndex = () => latestIndex;

export function resetScraperSyncState() {
  appliedSnapshot.clear();
  appliedIndexAt = null;
  historySeeded = false;
  latestIndex = null;
  previousRegional = {};
  running = false;
}

async function seedHistory(routes: RouteSummary[]) {
  for (const r of routes) {
    try {
      const { data } = await scraper.get<{ points: { t: string; median: number }[] }>(
        `/fares/history?route=${encodeURIComponent(r.route)}&window=${r.referenceWindowDays}&hours=720&limit=2000`,
      );
      liveDataStore.seedRouteHistory(
        r.route,
        (data.points || []).map(p => ({ at: new Date(p.t), fare: p.median })),
      );
    } catch {
      /* a route with no persisted history simply starts empty: nothing is invented to fill it */
    }
  }
  try {
    const { data } = await scraper.get<{ t: string; value: number }[]>('/index/history?hours=8760');
    liveDataStore.seedIndexHistory((data || []).map(p => ({ at: new Date(p.t), value: p.value })));
  } catch {
    /* index history starts empty */
  }
  historySeeded = true;
}

export async function syncFromScraper(reason: 'scheduled' | 'manual' = 'scheduled') {
  if (running) return { skipped: true as const, reason: 'A sync is already in progress.' };
  running = true;
  const startedAt = Date.now();
  try {
    const { data: routes, meta } = await scraper.get<RouteSummary[]>('/routes');
    if (meta.thresholds) ingestionMonitor.setFreshnessThresholds(meta.thresholds.liveMaxSec, meta.thresholds.delayedMaxSec, meta.refreshIntervalSec);

    if (!routes.length) {
      // Reachable, but nothing has been collected yet. This must NOT read as fresh data.
      const message = 'The scraper is running but has not collected any fares yet.';
      ingestionMonitor.recordCycle({
        provider: SCRAPER_PROVIDER_NAME, mode: 'live', attempted: 0, accepted: 0, rejected: 0, flagged: 0,
        durationMs: Date.now() - startedAt, observations: [], error: message,
      });
      return { skipped: false as const, reason, error: message };
    }

    if (!historySeeded) await seedHistory(routes);
    if (typeof meta.flightsTracked24h === 'number') liveDataStore.setFlightsTracked(meta.flightsTracked24h);

    const observations: Observation[] = [];
    for (const r of routes) {
      if (appliedSnapshot.get(r.route) === r.snapshotId) continue;   // nothing new for this route: leave the dashboard alone
      appliedSnapshot.set(r.route, r.snapshotId);
      const observedAt = new Date(r.observedAt);
      liveDataStore.setRouteFare(r.route, { current: r.current, previous: r.previous, cheapest: r.cheapest, observedAt, flightCount: r.nFlights });
      const [origin, destination] = r.route.split('-');
      observations.push({
        id: `snap-${r.snapshotId}`,
        flightNumber: `Median of ${r.nFlights} flights`,
        airlineCode: `${r.nAirlines} airlines`,
        origin, destination,
        fare: r.current,
        source: 'EaseMyTrip',
        capturedAt: r.observedAt,
        flagged: false,
        deviationPct: r.changePct,
      });
    }

    let indexValue: number | undefined;
    let indexChange: number | undefined;
    try {
      const { data: idx } = await scraper.get<IndexPayload | null>('/index');
      if (idx) {
        latestIndex = idx;
        if (idx.computedAt !== appliedIndexAt) {
          appliedIndexAt = idx.computedAt;
          liveDataStore.addIndexPoint(idx.value, new Date(idx.computedAt));
          liveDataStore.setRegionalIndices(
            Object.entries(idx.regional).map(([region, value]) => {
              const prev = previousRegional[region];
              return { region, value, change: prev ? parseFloat((((value - prev) / prev) * 100).toFixed(2)) : 0 };
            }),
          );
          previousRegional = { ...idx.regional };
        }
        indexValue = idx.value;
        indexChange = idx.changePct ?? undefined;
      }
    } catch {
      /* the index is optional for a cycle: route data above is already applied */
    }

    const triggered = observations.length ? alertService.evaluateAll() : 0;
    if (triggered > 0) ingestionMonitor.log('INFO', `${triggered} price alert${triggered === 1 ? '' : 's'} reached target.`);

    const report = {
      provider: SCRAPER_PROVIDER_NAME,
      mode: 'live' as const,
      attempted: routes.length,
      accepted: observations.length,
      rejected: 0,
      flagged: 0,
      durationMs: Date.now() - startedAt,
      observations,
      indexValue,
      indexChangePercent: indexChange,
      dataAsOf: meta.newestObservedAt as string | null,
    };
    ingestionMonitor.recordCycle(report);
    return { skipped: false as const, reason, ...report };
  } catch (err: any) {
    const message = err instanceof ScraperError ? err.message : 'Unexpected error while reading from the scraper.';
    ingestionMonitor.recordCycle({
      provider: SCRAPER_PROVIDER_NAME, mode: 'live', attempted: 0, accepted: 0, rejected: 0, flagged: 0,
      durationMs: Date.now() - startedAt, observations: [], error: message,
    });
    return { skipped: false as const, reason, error: message };
  } finally {
    running = false;
  }
}

/** Ask the scraper to refresh (queue jobs for) the standard routes now. Returns immediately; results arrive as the worker finishes. */
export async function requestScrape(routes?: string[], windows?: number[]) {
  const { data } = await scraper.post<{ jobIds: string[]; created: number; alreadyQueued: number }>('/scrape/trigger', { routes, windows });
  return data;
}
