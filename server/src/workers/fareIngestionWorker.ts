import { DemoAirfareProvider } from '../providers/DemoAirfareProvider';
import { validateFareData } from '../utils/validation';
import { indexEngine } from '../analytics/indexEngine';
import { liveDataStore } from '../liveDataStore';
import { dbService } from '../dbService';

const provider = new DemoAirfareProvider();
const INTERVAL_MS = 30 * 1000; // 30-second interval

export async function startIngestionWorker() {
  console.log(`[Worker] Starting Airfare Ingestion Worker (Interval: ${INTERVAL_MS}ms)`);
  
  const runCycle = async () => {
    try {
      console.log(`[Worker] Fetching latest fares...`);
      const rawFares = await provider.fetchLatestFares();
      
      // 1. Validation
      const validFares = rawFares.map(validateFareData);
      
      // 2. Store valid fares in LiveDataStore
      for (const fare of validFares) {
        const route = `${fare.origin_iata}-${fare.destination_iata}`;
        liveDataStore.updateFare(route, fare.fare_amount);
      }

      // 3. Airfare Index Calculation
      const indexResult = indexEngine.calculateIndex(validFares);
      liveDataStore.addIndexHistory(indexResult.index_value);
      
      // 4. Regional Index Calculation
      const regions = ['North', 'South', 'East', 'West'];
      const regionalIndices = regions.map(region => {
        const result = indexEngine.calculateRegionalIndex(validFares, region);
        return {
          region,
          value: result.index_value,
          change: result.change_percent
        };
      });
      // 5. Persist to Supabase if connected
      await dbService.saveAirfareIndex(indexResult);
      await dbService.saveLiveFares(validFares);

      console.log(`[Worker] New Airfare Index: ${indexResult.index_value} (${indexResult.change_percent > 0 ? '+' : ''}${indexResult.change_percent}%)`);
      console.log(`[Worker] Ingestion cycle complete. Fares updated: ${validFares.length}`);
    } catch (err) {
      console.error(`[Worker] Ingestion failed:`, err);
    }
  };

  // Run once immediately, then on interval
  await runCycle();
  setInterval(runCycle, INTERVAL_MS);
}
