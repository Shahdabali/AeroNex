import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import { liveDataStore, TIMEFRAME_MS } from './liveDataStore';

export interface DashboardMetrics {
  hasData?: boolean;
  airfareIndex: { value: number; change: number };
  averageFare: { value: number; change: number };
  flightsTracked: { value: number; change: number };
  routesTracked: { value: number; change: number };
  secondary: {
    lowestFare: { fare: number; route: string };
    highestFare: { fare: number; route: string };
    biggestIncrease: { change: number; route: string };
    biggestDecrease: { change: number; route: string };
  };
}

export interface RouteChange {
  route: string;
  currentFare: number;
  change: number;
}

export interface RegionalIndex {
  region: string;
  value: number;
  change: number;
}

const INDEX_PERSIST_SECONDS = parseInt(process.env.INDEX_PERSIST_SECONDS || '300', 10);

export interface DatabaseProvider {
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getTopRouteChanges(): Promise<RouteChange[]>;
  getRegionalIndices(): Promise<RegionalIndex[]>;
  getAirfareChartData(timeframe: string): Promise<any[]>;
  getAiInsights(): Promise<any[]>;
  saveAiInsight(insight: any): Promise<void>;
  saveAirfareIndex(indexResult: any): Promise<void>;
  getHealth(): Promise<{ provider: 'supabase' | 'demo'; connected: boolean; message?: string }>;
}

/** In-memory provider used when no Supabase credentials are configured. */
class MemoryProvider implements DatabaseProvider {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return liveDataStore.getMetrics();
  }

  async getTopRouteChanges(): Promise<RouteChange[]> {
    return liveDataStore.getTopRouteChanges();
  }

  async getRegionalIndices(): Promise<RegionalIndex[]> {
    return liveDataStore.getRegionalIndices();
  }

  async getAirfareChartData(timeframe: string): Promise<any[]> {
    return liveDataStore.getChartData(timeframe);
  }

  async getAiInsights(): Promise<any[]> {
    return liveDataStore.getAiInsights();
  }

  async saveAiInsight(insight: any): Promise<void> {
    liveDataStore.addAiInsight(insight);
  }

  async saveAirfareIndex(_indexResult: any): Promise<void> {
    // Index history is already tracked in memory by the ingestion worker.
  }

  async getHealth() {
    return { provider: 'demo' as const, connected: true, message: 'In-memory store active (history resets on restart)' };
  }
}

class SupabaseProvider implements DatabaseProvider {
  private client: SupabaseClient;
  private lastIndexSavedAt = 0;

  constructor(url: string, key: string) {
    this.client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  async getHealth() {
    try {
      const { error } = await this.client.from('airfare_indices').select('id').limit(1);
      if (error && error.code === 'PGRST205') {
        return {
          provider: 'supabase' as const,
          connected: true,
          message: 'Connected to Supabase, but the database tables have not been migrated yet.',
        };
      }
      if (error) {
        return { provider: 'supabase' as const, connected: false, message: error.message };
      }
      return { provider: 'supabase' as const, connected: true, message: 'Connected to Supabase' };
    } catch (err: any) {
      return { provider: 'supabase' as const, connected: false, message: err.message || 'Connection error' };
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // The in-memory store is refreshed every ingestion cycle; the DB row is throttled, so it is never fresher.
    return liveDataStore.getMetrics();
  }

  async getTopRouteChanges(): Promise<RouteChange[]> {
    return liveDataStore.getTopRouteChanges();
  }

  async getRegionalIndices(): Promise<RegionalIndex[]> {
    return liveDataStore.getRegionalIndices();
  }

  async getAirfareChartData(timeframe: string): Promise<any[]> {
    const windowMs = TIMEFRAME_MS[timeframe] ?? TIMEFRAME_MS['24h'];
    try {
      const since = new Date(Date.now() - windowMs).toISOString();
      const { data, error } = await this.client
        .from('airfare_indices')
        .select('calculated_at, index_value')
        .eq('region', 'India')
        .gte('calculated_at', since)
        .order('calculated_at', { ascending: true })
        .limit(2000);
      if (error) throw error;
      if (data && data.length > 0) {
        // Downsample long windows so the browser never receives thousands of points.
        const step = Math.max(1, Math.ceil(data.length / 120));
        const sameDay = windowMs <= TIMEFRAME_MS['24h'];
        return data
          .filter((_: any, i: number) => i % step === 0 || i === data.length - 1)
          .map((d: any) => {
            const at = new Date(d.calculated_at);
            return {
              time: sameDay
                ? at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : at.toLocaleDateString([], { day: '2-digit', month: 'short' }),
              timestamp: at.toISOString(),
              value: Number(d.index_value),
            };
          });
      }
    } catch (err: any) {
      console.warn('[SupabaseProvider] Chart history unavailable, using in-memory history:', err?.message || err);
    }
    return liveDataStore.getChartData(timeframe);
  }

  async getAiInsights(): Promise<any[]> {
    return liveDataStore.getAiInsights();
  }

  async saveAiInsight(insight: any): Promise<void> {
    liveDataStore.addAiInsight(insight);
    try {
      await this.client.from('ai_insights').insert([
        {
          type: insight.type || 'insight',
          title: insight.title || 'AeroNex Intelligence',
          content: insight.content || '',
          generated_at: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      console.warn('[SupabaseProvider] Insight persist skipped:', err?.message || err);
    }
  }

  async saveAirfareIndex(indexResult: any): Promise<void> {
    // Persist at most every INDEX_PERSIST_SECONDS so the table doesn't grow with every 30s tick.
    const now = Date.now();
    if (now - this.lastIndexSavedAt < INDEX_PERSIST_SECONDS * 1000) return;
    this.lastIndexSavedAt = now;
    try {
      const { error } = await this.client.from('airfare_indices').insert([
        {
          region: 'India',
          index_value: indexResult.index_value,
          previous_value: indexResult.previous_index_value ?? null,
          calculated_at: new Date().toISOString(),
        },
      ]);
      if (error) console.warn('[SupabaseProvider] Index persist skipped:', error.message);
    } catch (err: any) {
      console.warn('[SupabaseProvider] Index persist skipped:', err?.message || err);
    }
  }
}

export const dbService: DatabaseProvider = config.isDemoMode
  ? new MemoryProvider()
  : new SupabaseProvider(config.supabaseUrl!, config.supabaseServiceKey!);
