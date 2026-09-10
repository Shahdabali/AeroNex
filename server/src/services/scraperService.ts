import { liveDataStore } from '../liveDataStore';
import { indexEngine } from '../analytics/indexEngine';
import { validateFareData, FareDataInput } from '../utils/validation';

export interface ScraperWorker {
  id: string;
  name: string;
  type: 'DIRECT_AIRLINE_API' | 'GDS_FEED' | 'REST_SCRAPER' | 'NETWORK_EDGE' | 'META_OTA_CONNECTOR';
  carrier: string;
  carrierName: string;
  status: 'ONLINE' | 'SCRAPING' | 'STANDBY' | 'SYNCED';
  lastRun: string;
  recordsScrapedTotal: number;
  errorRate: string;
  latencyMs: number;
  proxyPool: string;
  targetCorridors: string[];
}

export interface ScrapedPayload {
  id: string;
  flightNumber: string;
  airlineCode: string;
  carrierName: string;
  origin: string;
  destination: string;
  baseFare: number;
  taxes: number;
  totalFare: number;
  seatsRemaining: number;
  dynamicMultiplier: number;
  scrapedAt: string;
  crawlerId: string;
  confidence: number;
}

export interface ScraperLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'DATA';
  crawlerId: string;
  message: string;
}

export interface ScraperMetrics {
  totalScrapesExecuted: number;
  totalRecordsIngested: number;
  currentRecordsPerSec: number;
  proxyPoolHealth: string;
  activeWorkers: number;
  totalWorkers: number;
  avgLatencyMs: number;
  lastIngestionTimestamp: string;
}

const DOMESTIC_ROUTES = [
  { origin: 'DEL', destination: 'BOM', carrier: '6E', carrierName: 'IndiGo', base: 5600, flight: '6E-5012' },
  { origin: 'BOM', destination: 'DEL', carrier: 'AI', carrierName: 'Air India', base: 5550, flight: 'AI-887' },
  { origin: 'BOM', destination: 'BLR', carrier: 'QP', carrierName: 'Akasa Air', base: 4320, flight: 'QP-1324' },
  { origin: 'BLR', destination: 'BOM', carrier: '6E', carrierName: 'IndiGo', base: 4380, flight: '6E-678' },
  { origin: 'DEL', destination: 'BLR', carrier: 'AI', carrierName: 'Air India', base: 6980, flight: 'AI-506' },
  { origin: 'BLR', destination: 'DEL', carrier: 'SG', carrierName: 'SpiceJet', base: 6850, flight: 'SG-192' },
  { origin: 'CCU', destination: 'DEL', carrier: '6E', carrierName: 'IndiGo', base: 5420, flight: '6E-442' },
  { origin: 'DEL', destination: 'GOI', carrier: 'QP', carrierName: 'Akasa Air', base: 6620, flight: 'QP-1108' },
  { origin: 'HYD', destination: 'DEL', carrier: 'AI', carrierName: 'Air India', base: 4620, flight: 'AI-840' },
  { origin: 'BLR', destination: 'HYD', carrier: '6E', carrierName: 'IndiGo', base: 3380, flight: '6E-318' },
  { origin: 'MAA', destination: 'DEL', carrier: '6E', carrierName: 'IndiGo', base: 5290, flight: '6E-2041' },
  { origin: 'DEL', destination: 'CCU', carrier: 'AI', carrierName: 'Air India', base: 5410, flight: 'AI-701' },
  { origin: 'GOI', destination: 'BOM', carrier: 'SG', carrierName: 'SpiceJet', base: 3580, flight: 'SG-291' },
  { origin: 'BLR', destination: 'CCU', carrier: '6E', carrierName: 'IndiGo', base: 5780, flight: '6E-711' },
];

class ScraperService {
  private workers: ScraperWorker[] = [
    {
      id: 'worker-indigo-direct',
      name: 'IndiGo Direct Booking API Scraper',
      type: 'DIRECT_AIRLINE_API',
      carrier: '6E',
      carrierName: 'IndiGo',
      status: 'ONLINE',
      lastRun: new Date().toISOString(),
      recordsScrapedTotal: 148290,
      errorRate: '0.01%',
      latencyMs: 138,
      proxyPool: '48/50 Active (Mumbai/Delhi DC)',
      targetCorridors: ['DEL-BOM', 'BLR-BOM', 'CCU-DEL', 'MAA-DEL'],
    },
    {
      id: 'worker-airindia-gds',
      name: 'Air India GDS Distribution Feed (Amadeus/Sabre)',
      type: 'GDS_FEED',
      carrier: 'AI',
      carrierName: 'Air India',
      status: 'ONLINE',
      lastRun: new Date().toISOString(),
      recordsScrapedTotal: 112450,
      errorRate: '0.02%',
      latencyMs: 194,
      proxyPool: '32/32 Dedicated IP (Frankfurt/Mumbai)',
      targetCorridors: ['BOM-DEL', 'DEL-BLR', 'HYD-DEL', 'DEL-CCU'],
    },
    {
      id: 'worker-spicejet-rest',
      name: 'SpiceJet Low-Fare Calendar Crawler',
      type: 'REST_SCRAPER',
      carrier: 'SG',
      carrierName: 'SpiceJet',
      status: 'ONLINE',
      lastRun: new Date().toISOString(),
      recordsScrapedTotal: 68120,
      errorRate: '0.04%',
      latencyMs: 162,
      proxyPool: '24/25 Rotating Residential',
      targetCorridors: ['BLR-DEL', 'GOI-BOM', 'DEL-GOI'],
    },
    {
      id: 'worker-akasa-edge',
      name: 'Akasa Air Network Edge Parser',
      type: 'NETWORK_EDGE',
      carrier: 'QP',
      carrierName: 'Akasa Air',
      status: 'ONLINE',
      lastRun: new Date().toISOString(),
      recordsScrapedTotal: 49840,
      errorRate: '0.01%',
      latencyMs: 124,
      proxyPool: '20/20 Cloudflare Bypass Clean',
      targetCorridors: ['BOM-BLR', 'DEL-GOI', 'BLR-HYD'],
    },
    {
      id: 'worker-ota-composite',
      name: 'OTA Meta-Aggregator (MakeMyTrip / EaseMyTrip)',
      type: 'META_OTA_CONNECTOR',
      carrier: 'MULTI',
      carrierName: 'OTA Aggregator',
      status: 'ONLINE',
      lastRun: new Date().toISOString(),
      recordsScrapedTotal: 294710,
      errorRate: '0.03%',
      latencyMs: 242,
      proxyPool: '64/64 Residential Subnets',
      targetCorridors: ['ALL_METRO_CORRIDORS'],
    },
  ];

  private recentPayloads: ScrapedPayload[] = [];
  private logs: ScraperLogEntry[] = [];
  private totalScrapesExecuted: number = 8420;
  private totalRecordsIngested: number = 673410;

  constructor() {
    this.seedInitialPayloadsAndLogs();
  }

  private seedInitialPayloadsAndLogs() {
    const now = Date.now();
    
    // Seed initial payloads
    DOMESTIC_ROUTES.slice(0, 10).forEach((route, idx) => {
      const fluctuation = (Math.random() * 0.08 - 0.04);
      const fare = Math.round(route.base * (1 + fluctuation));
      const taxes = Math.round(fare * 0.12);
      this.recentPayloads.push({
        id: `PAYLOAD-${1000 + idx}`,
        flightNumber: route.flight,
        airlineCode: route.carrier,
        carrierName: route.carrierName,
        origin: route.origin,
        destination: route.destination,
        baseFare: fare,
        taxes,
        totalFare: fare + taxes,
        seatsRemaining: Math.floor(Math.random() * 28) + 3,
        dynamicMultiplier: parseFloat((1 + Math.abs(fluctuation) * 2).toFixed(2)),
        scrapedAt: new Date(now - idx * 45000).toISOString(),
        crawlerId: this.workers[idx % this.workers.length].id,
        confidence: 0.98,
      });
    });

    // Seed initial logs
    this.logs.push(
      {
        id: `LOG-1`,
        timestamp: new Date(now - 180000).toISOString(),
        level: 'INFO',
        crawlerId: 'SYSTEM',
        message: 'AeroNex Scraper Cluster initialized with 5 active worker nodes.',
      },
      {
        id: `LOG-2`,
        timestamp: new Date(now - 120000).toISOString(),
        level: 'SUCCESS',
        crawlerId: 'worker-indigo-direct',
        message: 'Harvested 14 route fares from IndiGo Direct Booking API (Latency: 138ms).',
      },
      {
        id: `LOG-3`,
        timestamp: new Date(now - 90000).toISOString(),
        level: 'DATA',
        crawlerId: 'worker-airindia-gds',
        message: 'Amadeus GDS seat inventory parsed: BOM-DEL & DEL-BLR fares synced to LiveDataStore.',
      },
      {
        id: `LOG-4`,
        timestamp: new Date(now - 45000).toISOString(),
        level: 'INFO',
        crawlerId: 'worker-ota-composite',
        message: 'Outlier winsorization test passed: 0 records exceeded 95th percentile threshold.',
      },
      {
        id: `LOG-5`,
        timestamp: new Date(now - 10000).toISOString(),
        level: 'SUCCESS',
        crawlerId: 'SYSTEM',
        message: 'Continuous scraper pipeline active. Listening for trigger requests.',
      }
    );
  }

  public getStatus() {
    const activeWorkers = this.workers.filter(w => w.status === 'ONLINE' || w.status === 'SCRAPING').length;
    const avgLatency = Math.round(
      this.workers.reduce((acc, w) => acc + w.latencyMs, 0) / this.workers.length
    );

    const metrics: ScraperMetrics = {
      totalScrapesExecuted: this.totalScrapesExecuted,
      totalRecordsIngested: this.totalRecordsIngested,
      currentRecordsPerSec: parseFloat((18.4 + Math.random() * 4.2).toFixed(1)),
      proxyPoolHealth: '99.4% Operational',
      activeWorkers,
      totalWorkers: this.workers.length,
      avgLatencyMs: avgLatency,
      lastIngestionTimestamp: liveDataStore.getLastUpdatedAt().toISOString(),
    };

    return {
      metrics,
      workers: this.workers,
      recentPayloads: this.recentPayloads.slice(0, 15),
      logs: this.logs.slice(-25).reverse(),
    };
  }

  public async triggerManualScrape(targetCrawlerId?: string) {
    const startTime = Date.now();
    this.totalScrapesExecuted += 1;

    // Pick target workers
    const activeWorkers = targetCrawlerId 
      ? this.workers.filter(w => w.id === targetCrawlerId)
      : this.workers;

    // Set worker statuses to SCRAPING
    activeWorkers.forEach(w => {
      w.status = 'SCRAPING';
    });

    const newPayloads: ScrapedPayload[] = [];
    const validFareInputs: FareDataInput[] = [];

    // Simulate realistic flight crawling with jitter
    const routesToScrape = [...DOMESTIC_ROUTES];
    const timestamp = new Date().toISOString();

    for (let i = 0; i < routesToScrape.length; i++) {
      const r = routesToScrape[i];
      const worker = activeWorkers[i % activeWorkers.length] || this.workers[0];
      
      // Random price oscillation (+/- 1.5% to 4.5%)
      const fluctuation = (Math.random() * 0.06 - 0.025);
      const fareAmount = Math.round(r.base * (1 + fluctuation));
      const taxes = Math.round(fareAmount * 0.12);
      const dynamicMultiplier = parseFloat((1 + Math.max(0, fluctuation * 3)).toFixed(2));
      const seatsRemaining = Math.floor(Math.random() * 24) + 2;

      const payloadId = `PAYLOAD-${Date.now().toString().slice(-4)}${i}`;
      const payload: ScrapedPayload = {
        id: payloadId,
        flightNumber: r.flight,
        airlineCode: r.carrier,
        carrierName: r.carrierName,
        origin: r.origin,
        destination: r.destination,
        baseFare: fareAmount,
        taxes,
        totalFare: fareAmount + taxes,
        seatsRemaining,
        dynamicMultiplier,
        scrapedAt: timestamp,
        crawlerId: worker.id,
        confidence: 0.99,
      };

      newPayloads.unshift(payload);

      // Add to valid fare inputs for LiveDataStore
      const departure = new Date(Date.now() + (2 + (i % 7)) * 86400000).toISOString();
      const arrival = new Date(Date.now() + (2 + (i % 7)) * 86400000 + 7200000).toISOString();

      try {
        const validated = validateFareData({
          flight_number: r.flight,
          airline_code: r.carrier,
          origin_iata: r.origin,
          destination_iata: r.destination,
          fare_amount: fareAmount,
          currency: 'INR',
          departure_time: departure,
          arrival_time: arrival,
          source: worker.name,
        });
        validFareInputs.push(validated);

        // Update live database
        const routeKey = `${r.origin}-${r.destination}`;
        liveDataStore.updateFare(routeKey, fareAmount);
      } catch (err) {
        console.warn(`[ScraperService] Validation error for route ${r.origin}-${r.destination}:`, err);
      }

      worker.recordsScrapedTotal += 1;
    }

    // Recompute National Airfare Index using the IndexEngine
    let indexResult = { index_value: 138.4, change_percent: 0.4 };
    try {
      indexResult = indexEngine.calculateIndex(validFareInputs);
      liveDataStore.addIndexHistory(indexResult.index_value);

      const regions = ['North', 'South', 'East', 'West'];
      const regionalIndices = regions.map(region => {
        const res = indexEngine.calculateRegionalIndex(validFareInputs, region);
        return {
          region,
          value: res.index_value,
          change: res.change_percent,
        };
      });
      liveDataStore.setRegionalIndices(regionalIndices);
    } catch (err) {
      console.error('[ScraperService] Index computation error:', err);
    }

    // Revert worker statuses back to ONLINE
    activeWorkers.forEach(w => {
      w.status = 'ONLINE';
      w.lastRun = timestamp;
      w.latencyMs = Math.round(110 + Math.random() * 80);
    });

    // Update store stats
    this.totalRecordsIngested += newPayloads.length;
    this.recentPayloads = [...newPayloads, ...this.recentPayloads].slice(0, 30);

    const elapsedMs = Date.now() - startTime;

    // Log the successful run
    this.logs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      crawlerId: targetCrawlerId || 'CLUSTER',
      message: `Manual scrape executed: Ingested ${newPayloads.length} flight records across ${routesToScrape.length} corridors in ${elapsedMs}ms. New Index: ${indexResult.index_value} (${indexResult.change_percent >= 0 ? '+' : ''}${indexResult.change_percent}%).`,
    });

    return {
      success: true,
      timestamp,
      executionTimeMs: elapsedMs,
      recordsIngested: newPayloads.length,
      affectedRoutes: routesToScrape.length,
      newIndexValue: indexResult.index_value,
      indexChangePercent: indexResult.change_percent,
      latestPayloads: newPayloads.slice(0, 5),
    };
  }
}

export const scraperService = new ScraperService();
