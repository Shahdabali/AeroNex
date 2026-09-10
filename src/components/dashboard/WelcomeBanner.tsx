import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CinematicHeroBanner } from '../animations/CinematicHeroBanner';

export function WelcomeBanner() {
  const { data: freshness } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    refetchInterval: 5000,
  });

  return <CinematicHeroBanner freshnessStatus={freshness?.status || 'live'} />;
}
