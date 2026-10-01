/**
 * Tracks what the ingestion pipeline has *actually* done: which provider
 * supplied data, how many observations passed validation, when the last cycle
 * ran and whether it failed. Nothing in here is synthetic — the Data Pipeline
 * page and `/api/data-status` read straight from these counters.
 */
export type DataMode = 'live' | 'unconfigured';
export type Freshness = 'live' | 'delayed' | 'stale' | 'unavailable';

export interface Observation {
  id: string;
  flightNumber: string;
  airlineCode: string;
  origin: string;
  destination: string;
  fare: number;
  source: string;
  capturedAt: string;
  flagged: boolean;
  deviationPct: number | null;
}

export interface PipelineLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}

export interface CycleReport {
  provider: string;
  mode: DataMode;
  attempted: number;
  accepted: number;
  rejected: number;
  flagged: number;
  durationMs: number;
  observations: Observation[];
  indexValue?: number;
  indexChangePercent?: number;
  error?: string;
  /** When the underlying data was collected (the scraper's newest scrape), as opposed to when this server polled it. */
  dataAsOf?: string | null;
}

const MAX_LOGS = 60;
const MAX_OBSERVATIONS = 40;

class IngestionMonitor {
  private provider = 'not started';
  private mode: DataMode = 'unconfigured';
  private intervalSec = 30;
  private cycles = 0;
  private failures = 0;
  private totalAttempted = 0;
  private totalAccepted = 0;
  private totalFlagged = 0;
  private lastCycleAt: Date | null = null;
  private dataThresholds: { liveMaxSec: number; delayedMaxSec: number } | null = null;
  private lastDurationMs: number | null = null;
  private lastError: string | null = null;
  private observations: Observation[] = [];
  private logs: PipelineLog[] = [];
  private seq = 0;

  configure(provider: string, mode: DataMode, intervalSec: number) {
    this.provider = provider;
    this.mode = mode;
    this.intervalSec = intervalSec;
    const what = mode === 'live' ? 'live market data' : 'no data source configured';
    this.log('INFO', `Pipeline configured: ${provider} (${what}), refresh every ${intervalSec}s.`);
  }

  /** A provider that knows how old its data is (the scraper) supplies its own freshness thresholds. */
  setFreshnessThresholds(liveMaxSec: number, delayedMaxSec: number, intervalSec?: number) {
    this.dataThresholds = { liveMaxSec, delayedMaxSec };
    if (intervalSec) this.intervalSec = intervalSec;
  }

  log(level: PipelineLog['level'], message: string) {
    this.logs.unshift({ id: `log_${++this.seq}`, timestamp: new Date().toISOString(), level, message });
    if (this.logs.length > MAX_LOGS) this.logs.pop();
  }

  recordCycle(report: CycleReport) {
    // The report is authoritative for what actually produced this data.
    this.provider = report.provider;
    this.mode = report.mode;
    this.cycles++;
    this.totalAttempted += report.attempted;
    this.totalAccepted += report.accepted;
    this.totalFlagged += report.flagged;
    this.lastDurationMs = report.durationMs;
    if (report.error) {
      this.failures++;
      this.lastError = report.error;
      this.log('ERROR', `Cycle failed after ${report.durationMs}ms: ${report.error}`);
      return;
    }
    this.lastCycleAt = report.dataAsOf ? new Date(report.dataAsOf) : new Date();
    this.lastError = null;
    this.observations = [...report.observations, ...this.observations].slice(0, MAX_OBSERVATIONS);
    const idx = report.indexValue !== undefined
      ? ` Index ${report.indexValue} (${(report.indexChangePercent ?? 0) >= 0 ? '+' : ''}${report.indexChangePercent ?? 0}%).`
      : '';
    this.log(
      report.rejected > 0 || report.flagged > 0 ? 'WARN' : 'SUCCESS',
      `Ingested ${report.accepted}/${report.attempted} observations in ${report.durationMs}ms` +
        (report.rejected ? `, ${report.rejected} rejected by validation` : '') +
        (report.flagged ? `, ${report.flagged} flagged as outliers` : '') +
        `.${idx}`,
    );
  }

  getDataSource() {
    const now = Date.now();
    const ageSec = this.lastCycleAt ? Math.round((now - this.lastCycleAt.getTime()) / 1000) : null;
    // Older than the provider's own limit (default: three refresh intervals) is stale.
    const liveMax = this.dataThresholds?.liveMaxSec ?? this.intervalSec * 3;
    const delayedMax = this.dataThresholds?.delayedMaxSec ?? this.intervalSec * 12;
    const freshness: Freshness =
      this.mode === 'unconfigured' || ageSec === null ? 'unavailable' : ageSec <= liveMax ? 'live' : ageSec <= delayedMax ? 'delayed' : 'stale';
    const stale = freshness !== 'live';
    return {
      mode: this.mode,
      provider: this.provider,
      lastCycleAt: this.lastCycleAt ? this.lastCycleAt.toISOString() : null,
      ageSec,
      freshness,
      stale,
      refreshIntervalSec: this.intervalSec,
      lastError: this.lastError,
    };
  }

  getStatus() {
    const ds = this.getDataSource();
    const passRate = this.totalAttempted ? (this.totalAccepted / this.totalAttempted) * 100 : null;
    const outlierRate = this.totalAccepted ? (this.totalFlagged / this.totalAccepted) * 100 : null;
    return {
      dataSource: ds,
      metrics: {
        cycles: this.cycles,
        failedCycles: this.failures,
        observationsAccepted: this.totalAccepted,
        observationsAttempted: this.totalAttempted,
        validationPassRate: passRate === null ? null : parseFloat(passRate.toFixed(1)),
        outliersFlagged: this.totalFlagged,
        outlierRate: outlierRate === null ? null : parseFloat(outlierRate.toFixed(1)),
        lastDurationMs: this.lastDurationMs,
      },
      recentObservations: this.observations,
      logs: this.logs,
    };
  }
}

export const ingestionMonitor = new IngestionMonitor();
