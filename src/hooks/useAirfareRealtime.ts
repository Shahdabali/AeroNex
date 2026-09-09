import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAirfareRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {

    const channel = supabase
      .channel('airfare-pipeline')
      // Listen to fare_prices inserts
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fare_prices' }, (payload) => {
        console.log('Realtime Fare Update:', payload);
        queryClient.invalidateQueries({ queryKey: ['routeChanges'] });
      })
      // Listen to airfare_indices updates
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'airfare_indices' }, (payload) => {
        console.log('Realtime Index Update:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['chartData'] });
      })
      // Listen to AI insights
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_insights' }, (payload) => {
        console.log('Realtime AI Insight Update:', payload);
        queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
