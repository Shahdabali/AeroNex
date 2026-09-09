import { AirfareProvider } from './AirfareProvider';
import { FareDataInput } from '../utils/validation';

export class DemoAirfareProvider implements AirfareProvider {
  private basePrices: Record<string, number> = {
    'DEL-BOM': 5000,
    'BOM-DEL': 5000,
    'BOM-BLR': 4500,
    'BLR-BOM': 4500,
    'DEL-BLR': 6000,
    'BLR-DEL': 6000,
    'MAA-DEL': 4000,
    'DEL-MAA': 4000,
    'HYD-DEL': 5500,
    'DEL-HYD': 5500,
    'CCU-DEL': 4800,
    'DEL-CCU': 4800,
    'GOI-BOM': 3500,
    'BOM-GOI': 3500,
    'DEL-GOI': 6500,
    'GOI-DEL': 6500,
    'BLR-CCU': 5200,
    'CCU-BLR': 5200,
    'BLR-HYD': 3000,
    'HYD-BLR': 3000,
  };

  async fetchLatestFares(): Promise<FareDataInput[]> {
    const results: FareDataInput[] = [];
    
    // Simulate real-time volatility
    for (const [route, base] of Object.entries(this.basePrices)) {
      const [origin, dest] = route.split('-');
      // Random fluctuation between -5% and +5% (to include +/- 1-5%)
      const sign = Math.random() > 0.5 ? 1 : -1;
      const pct = (1 + Math.random() * 4) / 100; // 1% to 5%
      const fluctuation = 1 + (sign * pct);
      const newFare = Math.round(base * fluctuation);
      
      // Update base for next tick so it drifts naturally
      this.basePrices[route] = newFare;

      const now = new Date();
      const arrival = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      results.push({
        flight_number: `6E-${Math.floor(Math.random() * 900) + 100}`,
        airline_code: '6E',
        origin_iata: origin,
        destination_iata: dest,
        fare_amount: newFare,
        currency: 'INR',
        departure_time: now.toISOString(),
        arrival_time: arrival.toISOString(),
        source: 'DemoAirfareProvider',
      });
    }

    return results;
  }
}
