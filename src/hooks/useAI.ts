import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useAIInsights() {
  return useQuery({
    queryKey: ['aeronex_ai_insights'],
    queryFn: api.getInsights,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useFarePrediction(route: string) {
  return useQuery({
    queryKey: ['aeronex_fare_prediction', route],
    queryFn: () => api.predict({ route }),
    enabled: Boolean(route && route.length >= 3),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRouteAnalysis(route: string) {
  return useQuery({
    queryKey: ['aeronex_route_analysis', route],
    queryFn: () => api.routeAnalysis(route),
    enabled: Boolean(route && route.length >= 3),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAIStatus() {
  return useQuery({
    queryKey: ['aeronex_ai_status'],
    queryFn: api.getAIStatus,
    staleTime: 30 * 1000,
  });
}

export function usePredictMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { route?: string; origin?: string; destination?: string }) => 
      api.predict(params),
    onSuccess: (data, variables) => {
      const key = variables.route || `${variables.origin}-${variables.destination}`;
      queryClient.setQueryData(['aeronex_fare_prediction', key], data);
    }
  });
}
