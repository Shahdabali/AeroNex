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
    { id: '1', title: 'Market Overview', content: 'Tracking live airfare data dynamically.', type: 'summary' }
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
        airfareIndex: { value: 100, change: 0 },
        averageFare: { value: 0, change: 0 },
        flightsTracked: { value: 0, change: 0 },
        routesTracked: { value: 0, change: 0 },
        secondary: {
          lowestFare: { fare: 0, route: 'N/A' },
          highestFare: { fare: 0, route: 'N/A' },
          biggestIncrease: { change: 0, route: 'N/A' },
          biggestDecrease: { change: 0, route: 'N/A' }
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
