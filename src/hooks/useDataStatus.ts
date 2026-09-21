import { useQuery } from '@tanstack/react-query';
import { api, type DataStatus } from '../services/api';

export type FeedState = 'live' | 'simulated' | 'delayed' | 'offline' | 'loading';

export interface FeedInfo {
  state: FeedState;
  status?: DataStatus;
  label: string;
  detail: string;
}

/**
 * Single source of truth for "is this data real, fresh, or simulated?".
 * Every "LIVE" badge in the UI derives from this hook so nothing claims to be live when it is not.
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
  const age = data.ageSec === null ? null : data.ageSec < 90 ? `${data.ageSec}s ago` : `${Math.round(data.ageSec / 60)} min ago`;
  if (data.stale) {
    return {
      state: 'delayed',
      status: data,
      label: 'Delayed',
      detail: `${data.provider}: last successful update ${age ?? 'not yet received'}${data.lastError ? ` (${data.lastError})` : ''}.`,
    };
  }
  if (data.mode === 'live') {
    return { state: 'live', status: data, label: 'Live', detail: `${data.provider}: updated ${age}. Refreshes every ${data.refreshIntervalSec}s.` };
  }
  return {
    state: 'simulated',
    status: data,
    label: 'Simulated',
    detail: `${data.provider}. Fares are modelled, not real airline prices. Updated ${age}.`,
  };
}
