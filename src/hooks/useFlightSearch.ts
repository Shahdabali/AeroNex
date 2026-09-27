import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type LiveSearchResult } from '../services/api';

/** How long the UI keeps polling for a refresh before it stops and tells the user. */
export const MAX_POLL_MS = 90_000;
const POLL_MS = 1500;

export type SearchPhase =
  | 'idle'
  | 'searching'   // nothing stored yet; a scrape is running - no results to show
  | 'refreshing'  // stored results are shown while a newer scrape runs
  | 'ready'       // fresh enough to trust as current
  | 'stale'       // stored results are older than the cache window and no refresh is running
  | 'failed'      // the scrape failed and there is nothing stored to show
  | 'timeout'     // still not finished after MAX_POLL_MS
  | 'error';      // the AeroNex server itself could not be reached

/**
 * Live flight search with stale-while-revalidate semantics.
 *  - The first response is immediate: whatever is already stored, with its freshness.
 *  - If a refresh is running, the hook polls every 1.5 s (bounded) and swaps in the new results when it lands.
 *  - `refresh()` asks for a new scrape explicitly.
 */
export function useFlightSearch(from: string, to: string, date: string) {
  const qc = useQueryClient();
  const enabled = Boolean(from && to && date && from !== to);
  const searchId = `${from}|${to}|${date}`;
  const key = ['flightSearch', from, to, date] as const;
  // When the current search started (ms). 0 = not started yet; set in effects/handlers, never during render.
  const startedAt = useRef(0);
  // The search id that has run out of patience. Keyed so a new search is automatically not timed out.
  const [timedOutId, setTimedOutId] = useState('');

  useEffect(() => {
    startedAt.current = Date.now();
  }, [searchId]);

  const query = useQuery<LiveSearchResult>({
    queryKey: key,
    queryFn: () => api.searchFlightsLive({ from, to, date }),
    enabled,
    staleTime: 10_000,
    retry: 1,
    refetchInterval: q => {
      const status = q.state.data?.meta.status;
      if (status !== 'pending' && status !== 'refreshing') return false;
      return startedAt.current && Date.now() - startedAt.current > MAX_POLL_MS ? false : POLL_MS;
    },
  });

  const data = query.data;
  const meta = data?.meta;
  const active = meta?.status === 'pending' || meta?.status === 'refreshing';
  useEffect(() => {
    if (!active) return;
    const left = MAX_POLL_MS - (Date.now() - (startedAt.current || Date.now()));
    const t = setTimeout(() => setTimedOutId(searchId), Math.max(left, 0) + 100);
    return () => clearTimeout(t);
  }, [active, searchId, data]);
  const timedOut = timedOutId === searchId;

  const refresh = useCallback(async () => {
    startedAt.current = Date.now();
    setTimedOutId('');
    const res = await api.searchFlightsLive({ from, to, date, refresh: true });
    qc.setQueryData(key, res);
  }, [from, to, date, qc]); // eslint-disable-line react-hooks/exhaustive-deps

  let phase: SearchPhase = 'idle';
  if (!enabled) phase = 'idle';
  else if (query.isError && !data) phase = 'error';
  else if (!meta) phase = 'searching';
  else if (meta.status === 'failed') phase = 'failed';
  else if (meta.status === 'pending') phase = timedOut ? 'timeout' : 'searching';
  else if (meta.status === 'refreshing') phase = timedOut ? 'stale' : 'refreshing';
  else if (meta.status === 'ready_stale') phase = 'stale';
  else phase = 'ready';

  return {
    flights: data?.data ?? [],
    meta,
    phase,
    error: query.error,
    isInitialLoading: query.isPending && enabled,
    isFetching: query.isFetching,
    refresh,
    refetch: query.refetch,
  };
}
