import { AirfareProvider } from './AirfareProvider';
import { FareDataInput } from '../utils/validation';

export class DemoAirfareProvider implements AirfareProvider {
  private basePrices: Record<string, number> = {
    'DEL-BOM': 5680,
    'BOM-DEL': 5620,
    'BOM-BLR': 4450,
    'BLR-BOM': 4480,
    'DEL-BLR': 7120,
    'BLR-DEL': 7080,
    'MAA-DEL': 5350,
    'DEL-MAA': 5350,
    'HYD-DEL': 4680,
    'DEL-HYD': 4680,
    'CCU-DEL': 5490,
    'DEL-CCU': 5490,
    'GOI-BOM': 3620,
    'BOM-GOI': 3620,
    'DEL-GOI': 6750,
    'GOI-DEL': 6750,
    'BLR-CCU': 5850,
    'CCU-BLR': 5850,
    'BLR-HYD': 3450,
    'HYD-BLR': 3450,
  };

  async fetchLatestFares(): Promise<FareDataInput[]> {
    const results: FareDataInput[] = [];
    const airlines = ['6E', 'AI', 'QP', 'UK', 'SG'];
    
    // Simulate real-time volatility with 2026 dynamic drift
    for (const [route, base] of Object.entries(this.basePrices)) {
      const [origin, dest] = route.split('-');
      // Random fluctuation between -4% and +4%
      const sign = Math.random() > 0.5 ? 1 : -1;
      const pct = (1 + Math.random() * 3.5) / 100;
      const fluctuation = 1 + (sign * pct);
      const newFare = Math.round(base * fluctuation);
      
      // Update base for next tick so it drifts naturally around 2026 levels
      this.basePrices[route] = newFare;

      const now = new Date();
      const arrival = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      const airlineCode = airlines[Math.floor(Math.random() * airlines.length)];

      results.push({
        flight_number: `${airlineCode}-${Math.floor(Math.random() * 900) + 100}`,
        airline_code: airlineCode,
        origin_iata: origin,
        destination_iata: dest,
        fare_amount: newFare,
        currency: 'INR',
        departure_time: now.toISOString(),
        arrival_time: arrival.toISOString(),
        source: 'DemoAirfareProvider-2026',
      });
    }

    return results;
  }
}
