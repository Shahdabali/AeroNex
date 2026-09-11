import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAirfareRealtime() {
  const queryClient = useQueryClient();
  const isDocumentVisibleRef = useRef(true);

  useEffect(() => {
    const invalidateDashboardQueries = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['routeChanges'] });
      queryClient.invalidateQueries({ queryKey: ['chartData'] });
      queryClient.invalidateQueries({ queryKey: ['regionalIndex'] });
      queryClient.invalidateQueries({ queryKey: ['dataFreshness'] });
    };

    // Coordinated 8-Second Telemetry Refresh Loop (only when tab is active)
    const interval = setInterval(invalidateDashboardQueries, 8000);

    // Immediate refresh on tab regaining focus
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      isDocumentVisibleRef.current = isVisible;
      if (isVisible) {
        invalidateDashboardQueries();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    // Supabase Realtime Pipeline Listener (for server events when connected)
    const channel = supabase
      .channel('airfare-pipeline')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fare_prices' }, () => {
        if (isDocumentVisibleRef.current) {
          queryClient.invalidateQueries({ queryKey: ['routeChanges'] });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'airfare_indices' }, () => {
        if (isDocumentVisibleRef.current) {
          queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
          queryClient.invalidateQueries({ queryKey: ['chartData'] });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_insights' }, () => {
        if (isDocumentVisibleRef.current) {
          queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
