export interface RouteFare {
  route: string;
  currentFare: number;
  previousFare: number | null;
  lastUpdated: Date;
}

export interface MetricChange {
  value: number;
  change: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export class LiveDataStore {
  private currentFares: Map<string, RouteFare> = new Map();
  private fareHistory: { route: string; fare: number; timestamp: Date }[] = [];
  private indexHistory: { value: number; timestamp: Date }[] = [];
  private regionalIndices: { region: string; value: number; change: number }[] = [];
  private lastUpdatedAt: Date = new Date();
  private insights: any[] = [
    { id: '1', title: 'Market Overview (2026)', content: 'Tracking 2026 live Indian domestic airfare dynamics in real time.', type: 'summary' }
  ];

  constructor() {
    // Pre-populate with 2026 realistic baseline data
    const initial2026Fares: Record<string, number> = {
      'DEL-BOM': 5680,
      'BOM-DEL': 5620,
      'BOM-BLR': 4450,
      'BLR-BOM': 4480,
      'DEL-BLR': 7120,
      'BLR-DEL': 7080,
      'MAA-DEL': 5350,
      'DEL-MAA': 5350,
      'HYD-DEL': 4680,
      'DEL-HYD': 4680,
      'CCU-DEL': 5490,
      'DEL-CCU': 5490,
      'GOI-BOM': 3620,
      'BOM-GOI': 3620,
      'DEL-GOI': 6750,
      'GOI-DEL': 6750,
      'BLR-CCU': 5850,
      'CCU-BLR': 5850,
      'BLR-HYD': 3450,
      'HYD-BLR': 3450,
    };

    for (const [route, fare] of Object.entries(initial2026Fares)) {
      this.currentFares.set(route, {
        route,
        currentFare: fare,
        previousFare: Math.round(fare * 0.97),
        lastUpdated: new Date()
      });
      this.fareHistory.push({ route, fare, timestamp: new Date() });
    }

    this.indexHistory.push({ value: 135.2, timestamp: new Date(Date.now() - 3600000) });
    this.indexHistory.push({ value: 138.4, timestamp: new Date() });

    this.regionalIndices = [
      { region: 'North', value: 134.8, change: 2.4 },
      { region: 'West', value: 138.2, change: 1.9 },
      { region: 'East', value: 126.5, change: 1.5 },
      { region: 'South', value: 142.1, change: 3.6 }
    ];
  }

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
    // Keep history manageable
    if (this.fareHistory.length > 5000) {
      this.fareHistory.shift();
    }
  }

  addIndexHistory(value: number) {
    this.indexHistory.push({ value, timestamp: new Date() });
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
        airfareIndex: { value: 138.4, change: 3.2 },
        averageFare: { value: 6450, change: 1.8 },
        flightsTracked: { value: 2840, change: 6.2 },
        routesTracked: { value: 246, change: 3.4 },
        secondary: {
          lowestFare: { fare: 3620, route: 'BOM → GOI' },
          highestFare: { fare: 7120, route: 'DEL → BLR' },
          biggestIncrease: { change: 14.2, route: 'DEL → GOI' },
          biggestDecrease: { change: -7.8, route: 'MAA → DEL' }
        }
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

    const latestIndex = this.indexHistory.length > 0 ? this.indexHistory[this.indexHistory.length - 1].value : 100;
    const prevIndex = this.indexHistory.length > 1 ? this.indexHistory[this.indexHistory.length - 2].value : latestIndex;
    const indexChange = prevIndex === 0 ? 0 : ((latestIndex - prevIndex) / prevIndex) * 100;

    return {
      airfareIndex: { value: parseFloat(latestIndex.toFixed(1)), change: parseFloat(indexChange.toFixed(1)) },
      averageFare: { value: Math.round(sumFare / routes.length), change: 0 },
      flightsTracked: { value: routes.length * 10, change: 0 },
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

  getChartData(_timeframe?: string) {
    // Return the latest index history formatted for charts
    return this.indexHistory.map(h => ({
      time: h.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      value: parseFloat(h.value.toFixed(1))
    })).slice(-24); // Return last 24 points to keep it manageable
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

  getRouteHistory(route: string) {
    return this.fareHistory.filter(h => h.route === route).slice(-20);
  }

  getLastUpdatedAt() {
    return this.lastUpdatedAt;
  }
}

export const liveDataStore = new LiveDataStore();
