import { useQuery } from '@tanstack/react-query';
import { api, type DataStatus } from '../services/api';

export type FeedState = 'live' | 'delayed' | 'offline' | 'loading';

export interface FeedInfo {
  state: FeedState;
  status?: DataStatus;
  label: string;
  detail: string;
}

export function formatAge(sec: number | null | undefined): string {
  if (sec === null || sec === undefined) return 'not yet received';
  if (sec < 90) return `${sec}s ago`;
  if (sec < 5400) return `${Math.round(sec / 60)} min ago`;
  if (sec < 172800) return `${Math.round(sec / 3600)} h ago`;
  return `${Math.round(sec / 86400)} days ago`;
}

export function formatInterval(sec: number | null | undefined): string {
  if (!sec) return '—';
  if (sec < 120) return `${sec}s`;
  if (sec < 7200) return `${Math.round(sec / 60)} min`;
  return `${Math.round(sec / 3600)} h`;
}

/**
 * Single source of truth for "is this data real, fresh, or simulated?".
 * Every "LIVE" badge in the UI derives from this hook, so nothing claims to be live when it is not.
 *
 * "Live" means the newest successful collection is recent - it never means an old cached value.
 * The freshness state (live/delayed/stale/unavailable) always comes from the backend
 * (ingestionMonitor.getDataSource(), driven by the scraper's own thresholds), never re-derived
 * client-side - two independent classifiers can only ever disagree, never agree for free.
 */
export function useDataStatus(): FeedInfo {
  const { data, isPending, isError } = useQuery({
    queryKey: ['dataStatus'],
    queryFn: api.getDataStatus,
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: 1,
  });

  if (isPending) return { state: 'loading', label: 'Checking feed', detail: 'Checking the data feed status…' };
  if (isError || !data) {
    return { state: 'offline', label: 'Offline', detail: 'The AeroNex data server is unreachable, so the figures shown may be out of date.' };
  }
  if (data.mode === 'unconfigured') {
    return {
      state: 'offline',
      status: data,
      label: 'No data source',
      detail: `${data.provider}. No live airfare source is configured, so no fares are shown.`,
    };
  }
  const age = formatAge(data.ageSec);
  if (data.freshness === 'unavailable' || data.ageSec === null) {
    return {
      state: 'delayed',
      status: data,
      label: 'No data yet',
      detail: `${data.provider}: no fares have been collected yet${data.lastError ? ` (${data.lastError})` : ''}.`,
    };
  }
  if (data.stale) {
    const stale = data.freshness === 'stale';
    return {
      state: 'delayed',
      status: data,
      label: stale ? 'Stale' : 'Delayed',
      detail: `${data.provider}: last successful update ${age}${data.lastError ? ` (${data.lastError})` : ''}.`,
    };
  }
  if (data.mode === 'live') {
    return {
      state: 'live',
      status: data,
      label: 'Live',
      detail: `${data.provider}: data collected ${age}. Refreshed about every ${Math.round(data.refreshIntervalSec / 60) || 1} min.${data.lastError ? ` Note: ${data.lastError} These figures will be marked delayed if they get older.` : ''}`,
    };
  }
  return {
    state: 'offline',
    status: data,
    label: 'Unknown',
    detail: 'Unknown feed state.',
  };
}
