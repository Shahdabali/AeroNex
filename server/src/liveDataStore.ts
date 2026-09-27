export interface RouteFare {
  route: string;
  /** Typical fare on the route (median of the latest scrape). */
  currentFare: number;
  previousFare: number | null;
  lastUpdated: Date;
  /** Cheapest fare in the latest scrape - what a traveller can actually buy. Only set when the source reports it. */
  cheapestFare?: number;
  flightCount?: number;
}

export interface MetricChange {
  value: number;
  change: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export const TIMEFRAME_MS: Record<string, number> = {
  '24h': 86_400_000,
  '7d': 7 * 86_400_000,
  '30d': 30 * 86_400_000,
  '6m': 182 * 86_400_000,
  '1y': 365 * 86_400_000,
};

export class LiveDataStore {
  private currentFares: Map<string, RouteFare> = new Map();
  private fareHistory: { route: string; fare: number; timestamp: Date }[] = [];
  private indexHistory: { value: number; averageFare: number; timestamp: Date }[] = [];
  private regionalIndices: { region: string; value: number; change: number }[] = [];
  private lastUpdatedAt: Date | null = null;
  private observationsTracked = 0;
  private flightsTracked: number | null = null;
  private insights: any[] = [
    { id: '1', title: 'Market Overview (2026)', content: 'Tracking 2026 live Indian domestic airfare dynamics in real time.', type: 'summary' }
  ];

  updateFare(route: string, fare: number) {
    const existing = this.currentFares.get(route);
    this.currentFares.set(route, {
      route,
      currentFare: fare,
      previousFare: existing ? existing.currentFare : null,
      lastUpdated: new Date()
    });
    this.fareHistory.push({ route, fare, timestamp: new Date() });
    this.lastUpdatedAt = new Date();
    this.observationsTracked++;
    // Keep history manageable
    if (this.fareHistory.length > 5000) {
      this.fareHistory.shift();
    }
  }

  /**
   * Records a route observation reported by the scraper, with the scraper's own timestamp and previous value.
   * Unlike updateFare this never invents a "previous" fare or a timestamp.
   */
  setRouteFare(route: string, o: { current: number; previous: number | null; cheapest?: number; observedAt: Date; flightCount?: number }) {
    this.currentFares.set(route, {
      route,
      currentFare: o.current,
      previousFare: o.previous,
      lastUpdated: o.observedAt,
      cheapestFare: o.cheapest,
      flightCount: o.flightCount,
    });
    if (!this.fareHistory.some(h => h.route === route && h.timestamp.getTime() === o.observedAt.getTime())) {
      this.fareHistory.push({ route, fare: o.current, timestamp: o.observedAt });
      this.fareHistory.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      if (this.fareHistory.length > 20000) this.fareHistory.splice(0, this.fareHistory.length - 20000);
    }
    this.observationsTracked++;
    this.lastUpdatedAt = o.observedAt;
  }

  /** Loads persisted route history (from the scraper database) so a server restart does not lose it. */
  seedRouteHistory(route: string, points: { at: Date; fare: number }[]) {
    const keep = this.fareHistory.filter(h => h.route !== route);
    this.fareHistory = [...keep, ...points.map(p => ({ route, fare: p.fare, timestamp: p.at }))].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }

  seedIndexHistory(points: { at: Date; value: number }[]) {
    this.indexHistory = points.map(p => ({ value: p.value, averageFare: 0, timestamp: p.at })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  addIndexPoint(value: number, at: Date) {
    const last = this.indexHistory[this.indexHistory.length - 1];
    if (last && last.timestamp.getTime() >= at.getTime()) return;
    const fares = Array.from(this.currentFares.values());
    const averageFare = fares.length ? Math.round(fares.reduce((n, f) => n + f.currentFare, 0) / fares.length) : 0;
    this.indexHistory.push({ value, averageFare, timestamp: at });
    if (this.indexHistory.length > 5000) this.indexHistory.shift();
  }

  /** Number of distinct flights the scraper reports as tracked; when unset, metrics fall back to the observation count. */
  setFlightsTracked(n: number) {
    this.flightsTracked = n;
  }

  addIndexHistory(value: number) {
    const fares = Array.from(this.currentFares.values());
    const averageFare = fares.length ? Math.round(fares.reduce((n, f) => n + f.currentFare, 0) / fares.length) : 0;
    this.indexHistory.push({ value, averageFare, timestamp: new Date() });
    if (this.indexHistory.length > 1000) {
      this.indexHistory.shift();
    }
  }

  setRegionalIndices(indices: { region: string; value: number; change: number }[]) {
    this.regionalIndices = indices;
  }

  getMetrics() {
    let sumFare = 0;
    let minFare = Infinity;
    let maxFare = 0;
    let minFareRoute = '';
    let maxFareRoute = '';
    let biggestIncrease = { change: -Infinity, route: '' };
    let biggestDecrease = { change: Infinity, route: '' };

    const routes = Array.from(this.currentFares.values());
    if (routes.length === 0) {
      return {
        hasData: false,
        airfareIndex: { value: 0, change: 0 },
        averageFare: { value: 0, change: 0 },
        flightsTracked: { value: 0, change: 0 },
        routesTracked: { value: 0, change: 0 },
        secondary: {
          lowestFare: { fare: 0, route: '' },
          highestFare: { fare: 0, route: '' },
          biggestIncrease: { change: 0, route: '' },
          biggestDecrease: { change: 0, route: '' },
        },
      };
    }

    for (const data of routes) {
      sumFare += data.currentFare;
      if (data.currentFare < minFare) {
        minFare = data.currentFare;
        minFareRoute = data.route;
      }
      if (data.currentFare > maxFare) {
        maxFare = data.currentFare;
        maxFareRoute = data.route;
      }
      
      if (data.previousFare) {
        const changePct = ((data.currentFare - data.previousFare) / data.previousFare) * 100;
        if (changePct > biggestIncrease.change) {
          biggestIncrease = { change: changePct, route: data.route };
        }
        if (changePct < biggestDecrease.change) {
          biggestDecrease = { change: changePct, route: data.route };
        }
      }
    }

    const latestIndex = this.indexHistory.length > 0 ? this.indexHistory[this.indexHistory.length - 1].value : 0;
    const prevIndex = this.indexHistory.length > 1 ? this.indexHistory[this.indexHistory.length - 2].value : latestIndex;
    const indexChange = prevIndex === 0 ? 0 : ((latestIndex - prevIndex) / prevIndex) * 100;

    const avgNow = Math.round(sumFare / routes.length);
    const prevAvg = this.indexHistory.length > 1 ? this.indexHistory[this.indexHistory.length - 2].averageFare : avgNow;
    const avgChange = prevAvg ? ((avgNow - prevAvg) / prevAvg) * 100 : 0;

    return {
      hasData: true,
      airfareIndex: { value: parseFloat(latestIndex.toFixed(1)), change: parseFloat(indexChange.toFixed(1)) },
      averageFare: { value: avgNow, change: parseFloat(avgChange.toFixed(1)) },
      flightsTracked: { value: this.flightsTracked ?? this.observationsTracked, change: 0 },
      routesTracked: { value: routes.length, change: 0 },
      secondary: {
        lowestFare: { fare: minFare === Infinity ? 0 : minFare, route: minFareRoute },
        highestFare: { fare: maxFare, route: maxFareRoute },
        biggestIncrease: { 
          change: biggestIncrease.change === -Infinity ? 0 : parseFloat(biggestIncrease.change.toFixed(1)), 
          route: biggestIncrease.route 
        },
        biggestDecrease: { 
          change: biggestDecrease.change === Infinity ? 0 : parseFloat(biggestDecrease.change.toFixed(1)), 
          route: biggestDecrease.route 
        }
      }
    };
  }

  getTopRouteChanges() {
    const routes = Array.from(this.currentFares.values());
    const withChanges = routes.map(r => {
      const change = r.previousFare ? ((r.currentFare - r.previousFare) / r.previousFare) * 100 : 0;
      return { route: r.route, currentFare: r.currentFare, change: parseFloat(change.toFixed(1)) };
    });
    
    // Sort by absolute change magnitude
    withChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    return withChanges.slice(0, 5);
  }

  getRegionalIndices() {
    return this.regionalIndices;
  }

  /** Index history within the requested window (only what has actually been observed). */
  getChartData(timeframe: string = '24h') {
    const windowMs = TIMEFRAME_MS[timeframe] ?? TIMEFRAME_MS['24h'];
    const cutoff = Date.now() - windowMs;
    const sameDay = windowMs <= TIMEFRAME_MS['24h'];
    return this.indexHistory
      .filter(h => h.timestamp.getTime() >= cutoff)
      .map(h => ({
        time: sameDay
          ? h.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : h.timestamp.toLocaleDateString([], { day: '2-digit', month: 'short' }),
        timestamp: h.timestamp.toISOString(),
        value: parseFloat(h.value.toFixed(1)),
      }));
  }

  getAiInsights() {
    return this.insights;
  }

  addAiInsight(insight: any) {
    this.insights.unshift(insight);
    if (this.insights.length > 10) {
      this.insights.pop();
    }
  }

  getAllRoutes() {
    return Array.from(this.currentFares.values());
  }

  getRouteHistory(route: string, limit = 20) {
    return this.fareHistory.filter(h => h.route === route).slice(-limit);
  }

  getLastUpdatedAt() {
    return this.lastUpdatedAt;
  }
}

export const liveDataStore = new LiveDataStore();
