import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import { liveDataStore } from './liveDataStore';

export interface DashboardMetrics {
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

export interface DatabaseProvider {
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getTopRouteChanges(): Promise<RouteChange[]>;
  getRegionalIndices(): Promise<RegionalIndex[]>;
  getAirfareChartData(timeframe: string): Promise<any[]>;
  getAiInsights(): Promise<any[]>;
  saveAiInsight(insight: any): Promise<void>;
  saveLiveFares(fares: any[]): Promise<void>;
  saveAirfareIndex(indexResult: any): Promise<void>;
  getHealth(): Promise<{ provider: 'supabase' | 'demo'; connected: boolean; message?: string }>;
}

class DemoProvider implements DatabaseProvider {
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

  async saveLiveFares(_fares: any[]): Promise<void> {
    // In demo mode, liveDataStore already tracks in memory
  }

  async saveAirfareIndex(_indexResult: any): Promise<void> {
    // In demo mode, liveDataStore already tracks in memory
  }

  async getHealth() {
    return { provider: 'demo' as const, connected: true, message: 'In-memory simulated provider active' };
  }
}

class SupabaseProvider implements DatabaseProvider {
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async getHealth() {
    try {
      const { error } = await this.client.from('airports').select('count').limit(1);
      if (error && error.code === 'PGRST205') {
        return {
          provider: 'supabase' as const,
          connected: true,
          message: 'Connected to Supabase. Note: Database tables need to be created via SQL migration.',
        };
      }
      if (error) {
        return {
          provider: 'supabase' as const,
          connected: false,
          message: error.message,
        };
      }
      return {
        provider: 'supabase' as const,
        connected: true,
        message: 'Connected and synchronized with Supabase database',
      };
    } catch (err: any) {
      return {
        provider: 'supabase' as const,
        connected: false,
        message: err.message || 'Connection error',
      };
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Query latest airfare index from Supabase
      const { data: latestIndices } = await this.client
        .from('airfare_indices')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(2);

      if (latestIndices && latestIndices.length > 0) {
        const current = latestIndices[0];
        const prev = latestIndices[1] || current;
        const currentVal = Number(current.index_value ?? current.value ?? 100);
        const prevVal = Number(prev.index_value ?? prev.value ?? currentVal);
        const change = prevVal === 0 ? 0 : parseFloat((((currentVal - prevVal) / prevVal) * 100).toFixed(1));

        const memMetrics = liveDataStore.getMetrics();
        return {
          ...memMetrics,
          airfareIndex: {
            value: currentVal,
            change,
          },
        };
      }
    } catch (err) {
      console.warn('[SupabaseProvider] Error querying metrics from Supabase, falling back to live store:', err);
    }

    return liveDataStore.getMetrics();
  }
  
  async getTopRouteChanges(): Promise<RouteChange[]> {
    return liveDataStore.getTopRouteChanges();
  }
  
  async getRegionalIndices(): Promise<RegionalIndex[]> {
    return liveDataStore.getRegionalIndices();
  }
  
  async getAirfareChartData(timeframe: string): Promise<any[]> {
    try {
      const { data } = await this.client
        .from('airfare_indices')
        .select('calculated_at, index_value')
        .order('calculated_at', { ascending: true })
        .limit(30);

      if (data && data.length > 0) {
        return data.map((d: any) => ({
          time: new Date(d.calculated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: Number(d.index_value ?? d.value),
        }));
      }
    } catch (err) {
      console.warn('[SupabaseProvider] Error querying chart data from Supabase:', err);
    }
    return liveDataStore.getChartData(timeframe);
  }
  
  async getAiInsights(): Promise<any[]> {
    try {
      const { data } = await this.client
        .from('ai_insights')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(4);

      if (data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseProvider] Error querying ai_insights from Supabase:', err);
    }
    return liveDataStore.getAiInsights();
  }
  
  async saveAiInsight(insight: any): Promise<void> {
    liveDataStore.addAiInsight(insight);
    try {
      await this.client.from('ai_insights').insert([{
        type: insight.type || 'insight',
        title: insight.title || 'AeroNex Intelligence',
        content: insight.content || '',
        generated_at: new Date().toISOString(),
      }]);
    } catch (err) {
      // Non-fatal if table not yet created
    }
  }

  async saveLiveFares(fares: any[]): Promise<void> {
    try {
      const rows = fares.slice(0, 10).map((f) => ({
        amount: f.fare_amount,
        currency: 'INR',
        source: 'AeroNex-Ingestion',
        captured_at: new Date().toISOString(),
      }));
      await this.client.from('fare_prices').insert(rows);
    } catch (err) {
      // Non-fatal if table not yet created
    }
  }

  async saveAirfareIndex(indexResult: any): Promise<void> {
    try {
      await this.client.from('airfare_indices').insert([{
        region: 'India',
        index_value: indexResult.index_value,
        previous_value: indexResult.previous_value ?? null,
        calculated_at: new Date().toISOString(),
      }]);
    } catch (err) {
      // Non-fatal if table not yet created
    }
  }
}

export const dbService: DatabaseProvider = config.isDemoMode 
  ? new DemoProvider() 
  : new SupabaseProvider(config.supabaseUrl!, config.supabaseServiceKey!);
