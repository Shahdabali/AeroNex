import { AirfareProvider } from './AirfareProvider';
import { FareDataInput } from '../utils/validation';
import { indexEngine } from '../analytics/indexEngine';

/**
 * Development-only fare model. Explicitly and honestly labelled `mode: 'simulated'` (never 'live') and
 * `source: 'simulated-market-model'`, so it can never be mistaken for a real observation anywhere downstream
 * (ingestionMonitor, the dashboard freshness badge, the pipeline page) - see config.allowSimulatedData, which
 * gates this provider out of production entirely unless explicitly overridden.
 *
 * Reuses the same corridor basket as the index engine (indexEngine.getBasket()) instead of a second hard-coded
 * price list. Each tick nudges the current price by a small random walk, clamped to +-20% of the corridor's
 * baseline fare (mean-reversion) so it stays a plausible, bounded model rather than drifting arbitrarily.
 */
export class DemoAirfareProvider implements AirfareProvider {
  readonly name = 'Simulated market model';
  readonly mode = 'simulated' as const;

  private current = new Map<string, number>();

  async fetchLatestFares(): Promise<FareDataInput[]> {
    const now = new Date();
    const departure = new Date(now.getTime() + 14 * 86_400_000);
    const arrival = new Date(departure.getTime() + 2 * 3_600_000);

    return indexEngine.getBasket().map(({ route, baseline }) => {
      const [origin, destination] = route.split('-');
      const prev = this.current.get(route) ?? baseline;
      const step = prev * (1 + (Math.random() - 0.5) * 0.04);
      const clamped = Math.min(baseline * 1.2, Math.max(baseline * 0.8, step));
      this.current.set(route, clamped);
      return {
        flight_number: `SIM-${route}`,
        airline_code: 'SM',
        origin_iata: origin,
        destination_iata: destination,
        fare_amount: Math.round(clamped),
        currency: 'INR',
        departure_time: departure.toISOString(),
        arrival_time: arrival.toISOString(),
        source: 'simulated-market-model',
      };
    });
  }
}
