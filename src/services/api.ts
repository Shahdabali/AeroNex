const API_BASE = 'http://localhost:5000';

async function fetchJson(url: string) {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`AeroNex API Error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
}

async function postJson(url: string, body?: any) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || `AeroNex API Error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
}

async function deleteJson(url: string) {
  const res = await fetch(`${API_BASE}${url}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`AeroNex API Error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
}

export const api = {
  // Dashboard Analytics
  getDashboardMetrics: () => fetchJson('/api/dashboard/metrics'),
  getRouteChanges: () => fetchJson('/api/dashboard/routes'),
  getRegionalIndex: () => fetchJson('/api/dashboard/regional-index'),
  getChartData: (timeframe: string) => fetchJson(`/api/dashboard/chart-data?timeframe=${timeframe}`),
  getFreshness: () => fetchJson('/api/dashboard/freshness'),

  // AeroNex Server-Side AI Subsystem
  getInsights: () => fetchJson('/api/ai/insights'),
  generateInsights: () => postJson('/api/ai/insights'),
  predict: (params: { route?: string; origin?: string; destination?: string }) => 
    postJson('/api/ai/predict', typeof params === 'string' ? { route: params } : params),
  routeAnalysis: (route: string) => postJson('/api/ai/route-analysis', { route }),
  bookingRecommendation: (route: string) => postJson('/api/ai/booking-recommendation', { route }),
  regionalAnalysis: (region: string) => postJson('/api/ai/regional-analysis', { region }),
  getAIStatus: () => fetchJson('/api/ai/status'),

  // Reference data
  getAirports: () => fetchJson('/api/airports'),
  getAirlines: () => fetchJson('/api/airlines'),

  // Routes
  getRoutes: () => fetchJson('/api/routes'),
  getRouteHistory: (routeId: string) => fetchJson(`/api/routes/${routeId}`),

  // Flight search
  searchFlights: (from: string, to: string, date?: string) =>
    fetchJson(`/api/flights/search?from=${from}&to=${to}${date ? `&date=${date}` : ''}`),

  // Price alerts
  getAlerts: () => fetchJson('/api/alerts'),
  createAlert: (alert: { route: string; targetPrice: number }) => postJson('/api/alerts', alert),
  deleteAlert: (id: string) => deleteJson(`/api/alerts/${id}`),

  // Notifications
  getNotifications: () => fetchJson('/api/notifications'),

  // Health
  getHealth: () => fetchJson('/api/health'),
};
