import { 
  predictRequestSchema, 
  routeAnalysisRequestSchema, 
  predictionOutputSchema, 
  routeAnalysisOutputSchema 
} from '../validators/aiSchemas';
import { aiService } from '../services/aiService';
import { liveDataStore } from '../liveDataStore';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== AeroNex Server-Side AI Test Suite ===\n');

  // Seed observed fares (the AI layer only works from observed data).
  [5200, 5250, 5300, 5280, 5350, 5400, 5380].forEach(f => liveDataStore.updateFare('DEL-BOM', f));
  liveDataStore.addIndexHistory(101);
  liveDataStore.addIndexHistory(102);
  liveDataStore.setRegionalIndices([{ region: 'North', value: 101, change: 0.5 }]);

  // Test 1: Input Validation
  console.log('[1] Testing Input Validation Schemas:');
  const validPredict = predictRequestSchema.safeParse({ route: 'DEL-BOM' });
  assert(validPredict.success, 'Valid route "DEL-BOM" passes validation');

  const validOriginDest = predictRequestSchema.safeParse({ origin: 'DEL', destination: 'BOM' });
  assert(validOriginDest.success, 'Valid origin "DEL" and destination "BOM" passes validation');

  const invalidPredict = predictRequestSchema.safeParse({});
  assert(!invalidPredict.success, 'Empty prediction request is correctly rejected');

  const validRouteAnalysis = routeAnalysisRequestSchema.safeParse({ route: 'BOM-BLR' });
  assert(validRouteAnalysis.success, 'Valid route analysis request passes validation');

  const invalidRouteAnalysis = routeAnalysisRequestSchema.safeParse({ route: '' });
  assert(!invalidRouteAnalysis.success, 'Empty route analysis is correctly rejected');

  // Test 2: AI Status
  console.log('\n[2] Testing AI Status & Diagnostics:');
  const status = aiService.getAIStatus();
  assert(['healthy', 'fallback'].includes(status.status), `AI subsystem reports a valid status (${status.status})`);
  assert(typeof status.rateLimitPerMinute === 'number', 'Rate limit is configured as a number');

  // Test 3: Fare Prediction
  console.log('\n[3] Testing Fare Prediction Engine:');
  const prediction = await aiService.predictFare('DEL-BOM');
  assert(prediction.route === 'DEL-BOM', 'Prediction route matches requested route');
  assert(typeof prediction.predictedFare === 'number' && prediction.predictedFare > 0, 'Predicted fare is a positive number');
  assert(['increase', 'decrease', 'stable'].includes(prediction.direction), `Direction is valid (${prediction.direction})`);
  assert(prediction.confidence >= 0 && prediction.confidence <= 1, 'Confidence is between 0 and 1');
  assert(prediction.disclaimer.toLowerCase().includes('not guaranteed'), 'Disclaimer is present in prediction output');

  const validatedPrediction = predictionOutputSchema.safeParse(prediction);
  assert(validatedPrediction.success, 'Prediction output matches Zod schema contract');

  // Test 4: Route Market Analysis
  console.log('\n[4] Testing Route Market Analysis:');
  const analysis = await aiService.analyzeRoute('DEL-BOM');
  assert(analysis.route === 'DEL-BOM', 'Route matches in analysis');
  assert(['Low', 'Moderate', 'High'].includes(analysis.volatilityRisk), `Volatility risk is valid (${analysis.volatilityRisk})`);
  assert(analysis.recommendation.length > 10, 'Strategic recommendation provided');
  assert(analysis.bestBookingWindow.length > 5, 'Best booking window provided');
  assert(analysis.stats?.observations === 7, 'Route analysis reports how many observations it used');

  // Test 4b: unknown routes are rejected rather than fabricated
  let unknownRejected = false;
  try { await aiService.predictFare('ZZZ-YYY'); } catch (e: any) { unknownRejected = e.status === 404; }
  assert(unknownRejected, 'Prediction for a route with no observed data is rejected (404)');

  const validatedAnalysis = routeAnalysisOutputSchema.safeParse(analysis);
  assert(validatedAnalysis.success, 'Route analysis output matches Zod schema contract');

  // Test 5: Dashboard Insights Generation
  console.log('\n[5] Testing Dashboard Insights Generation:');
  const insights = await aiService.generateDashboardInsights();
  assert(Array.isArray(insights) && insights.length >= 2, 'Generates data-grounded insights');
  assert(insights[0].title.length > 0, 'Insights have non-empty titles');
  assert(insights[0].content.length > 0, 'Insights have non-empty content');

  // Test 6: In-Memory Caching
  console.log('\n[6] Testing Cache Latency & Hit:');
  const t0 = Date.now();
  const cachedPrediction = await aiService.predictFare('DEL-BOM');
  const t1 = Date.now();
  assert(t1 - t0 < 20, `Second prediction call served from cache in ${t1 - t0}ms`);
  assert(cachedPrediction.predictedFare === prediction.predictedFare, 'Cached prediction retains identical values');

  console.log(`\n========================================`);
  console.log(`AeroNex AI Tests: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
