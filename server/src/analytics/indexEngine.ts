import { FareDataInput } from '../utils/validation';
import { dgcaRouteBasket } from './dgcaBasket';

export interface IndexCalculationResult {
  index_value: number;
  previous_index_value: number;
  change_percent: number;
  sample_size: number;
}

export class AirfareIndexEngine {
  private baselineFares: Record<string, number> = {
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
    'DEL-PNQ': 4800,
    'PNQ-DEL': 4800,
    'BOM-AMD': 2500,
    'AMD-BOM': 2500,
    'CCU-GAU': 3200,
    'GAU-CCU': 3200,
    'DEL-SXR': 5500,
    'SXR-DEL': 5500,
    'BOM-IXC': 5100,
    'IXC-BOM': 5100,
    'MAA-CJB': 2800,
    'CJB-MAA': 2800,
    'BLR-COK': 2900,
    'COK-BLR': 2900,
  };
  
  private lastIndexValue: number | null = null;
  private lastRegionalIndices: Record<string, number> = {};

  /** The fixed basket behind the index: baseline fare and weight (share of baseline total) per corridor. */
  public getBasket() {
    return dgcaRouteBasket.routes.map(r => ({
      route: r.route,
      baseline: this.baselineFares[r.route] || 5000,
      weightPct: r.weightPct,
    }));
  }

  public calculateIndex(currentFares: FareDataInput[]): IndexCalculationResult {
    let indexSum = 0;
    let sampleSize = 0;
    let totalWeightUsed = 0;

    // We calculate a weighted average of price relatives: sum((Current_i / Base_i) * Weight_i)
    for (const fare of currentFares) {
      const route = `${fare.origin_iata}-${fare.destination_iata}`;
      const baseline = this.baselineFares[route];
      const basketRoute = dgcaRouteBasket.routes.find(r => r.route === route);
      
      if (baseline && basketRoute) {
        const priceRelative = fare.fare_amount / baseline;
        indexSum += priceRelative * basketRoute.weightPct;
        totalWeightUsed += basketRoute.weightPct;
        sampleSize++;
      }
    }

    if (totalWeightUsed === 0) {
      return {
        index_value: this.lastIndexValue ?? 0,
        previous_index_value: this.lastIndexValue ?? 0,
        change_percent: 0,
        sample_size: 0,
      };
    }

    // Normalize back to 100 base if not all weights are present
    const rawIndex = (indexSum / totalWeightUsed) * 100;
    const indexValue = parseFloat(rawIndex.toFixed(2));
    
    const previous = this.lastIndexValue ?? indexValue;
    const changePercent = previous ? parseFloat(((indexValue - previous) / previous * 100).toFixed(2)) : 0;
    
    const result = {
      index_value: indexValue,
      previous_index_value: previous,
      change_percent: changePercent,
      sample_size: sampleSize,
    };

    this.lastIndexValue = indexValue;
    return result;
  }

  public calculateRegionalIndex(currentFares: FareDataInput[], region: string): { index_value: number; change_percent: number } {
    let indexSum = 0;
    let totalWeightUsed = 0;

    for (const fare of currentFares) {
      const route = `${fare.origin_iata}-${fare.destination_iata}`;
      let matched = false;

      if (region === 'North' && (route === 'DEL-BOM' || route === 'DEL-BLR' || route === 'DEL-GOI')) matched = true;
      if (region === 'West' && (route === 'BOM-BLR' || route === 'BOM-HYD')) matched = true;
      if (region === 'South' && (route === 'MAA-DEL' || route === 'HYD-DEL')) matched = true;
      if (region === 'East' && (route === 'CCU-DEL' || route === 'CCU-BLR')) matched = true;

      if (matched) {
        const baseline = this.baselineFares[route];
        const basketRoute = dgcaRouteBasket.routes.find(r => r.route === route);
        if (baseline && basketRoute) {
          const priceRelative = fare.fare_amount / baseline;
          indexSum += priceRelative * basketRoute.weightPct;
          totalWeightUsed += basketRoute.weightPct;
        }
      }
    }

    const prevIndex = this.lastRegionalIndices[region] ?? null;

    if (totalWeightUsed === 0) {
      return { index_value: prevIndex ?? 0, change_percent: 0 };
    }

    const rawIndex = (indexSum / totalWeightUsed) * 100;
    const indexValue = parseFloat(rawIndex.toFixed(2));
    const changePercent = prevIndex ? parseFloat(((indexValue - prevIndex) / prevIndex * 100).toFixed(2)) : 0;

    this.lastRegionalIndices[region] = indexValue;
    
    return { index_value: indexValue, change_percent: changePercent };
  }
}

export const indexEngine = new AirfareIndexEngine();
