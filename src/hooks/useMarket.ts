import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

/** Server data refreshes every 30-60s, so polling faster than this only wastes requests. */
export const MARKET_REFRESH_MS = 15_000;

const shared = { refetchInterval: MARKET_REFRESH_MS, staleTime: 10_000, retry: 1 } as const;

export const useMetrics = () => useQuery({ queryKey: ['dashboardMetrics'], queryFn: api.getDashboardMetrics, ...shared });
export const useRouteChanges = () => useQuery({ queryKey: ['routeChanges'], queryFn: api.getRouteChanges, ...shared });
export const useRegionalIndex = () => useQuery({ queryKey: ['regionalIndex'], queryFn: api.getRegionalIndex, ...shared });
export const useRoutes = () => useQuery({ queryKey: ['routes'], queryFn: api.getRoutes, ...shared });
export const useChartData = (timeframe: string) =>
  useQuery({ queryKey: ['chartData', timeframe], queryFn: () => api.getChartData(timeframe), ...shared });
export const useAiInsights = () => useQuery({ queryKey: ['aiInsights'], queryFn: api.getInsights, staleTime: 60_000, retry: 1 });

/** "DEL-BOM" | "DEL → BOM" -> ["DEL", "BOM"] */
export function splitRoute(route: string): [string, string] {
  const [from = '', to = ''] = String(route).split(/\s*(?:-|→|➔)\s*/);
  return [from.trim().toUpperCase(), to.trim().toUpperCase()];
}

export const fmtINR = (n: number | null | undefined) => (n == null ? '—' : `₹${Math.round(n).toLocaleString('en-IN')}`);
