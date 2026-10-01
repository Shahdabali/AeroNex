const fs = require('fs');

let indexEngine = fs.readFileSync('server/src/analytics/indexEngine.ts', 'utf8');

indexEngine = indexEngine.replace(/import \{ FareDataInput \} from '\.\.\/utils\/validation';/, "import { FareDataInput } from '../utils/validation';\nimport { dgcaRouteBasket } from './dgcaBasket';");

indexEngine = indexEngine.replace(/public getBasket\(\) \{[\s\S]+?\}/, `public getBasket() {
    return dgcaRouteBasket.routes.map(r => ({
      route: r.route,
      baseline: this.baselineFares[r.route] || 5000,
      weightPct: r.weightPct,
    }));
  }`);

indexEngine = indexEngine.replace(/public calculateIndex\(currentFares: FareDataInput\[\]\): IndexCalculationResult \{[\s\S]+?this\.lastIndexValue = indexValue;\n    return result;\n  \}/, `public calculateIndex(currentFares: FareDataInput[]): IndexCalculationResult {
    let indexSum = 0;
    let sampleSize = 0;
    let totalWeightUsed = 0;

    // We calculate a weighted average of price relatives: sum((Current_i / Base_i) * Weight_i)
    for (const fare of currentFares) {
      const route = \`\${fare.origin_iata}-\${fare.destination_iata}\`;
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
  }`);

fs.writeFileSync('server/src/analytics/indexEngine.ts', indexEngine);
