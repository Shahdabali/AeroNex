import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAirfareRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 5-Second Continuous Live Streaming Loop
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['routeChanges'] });
      queryClient.invalidateQueries({ queryKey: ['chartData'] });
      queryClient.invalidateQueries({ queryKey: ['regionalIndex'] });
      queryClient.invalidateQueries({ queryKey: ['dataFreshness'] });
      queryClient.invalidateQueries({ queryKey: ['airfareIndexMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['airfareChartData'] });
      queryClient.invalidateQueries({ queryKey: ['airfareIndexRegional'] });
    }, 5000);

    // Supabase Realtime Pipeline Listener (for server events when connected)
    const channel = supabase
      .channel('airfare-pipeline')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fare_prices' }, () => {
        queryClient.invalidateQueries({ queryKey: ['routeChanges'] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'airfare_indices' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['chartData'] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_insights' }, () => {
        queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
