import { 
  predictRequestSchema, 
  routeAnalysisRequestSchema, 
  predictionOutputSchema, 
  routeAnalysisOutputSchema 
} from '../validators/aiSchemas';
import { aiService } from '../services/aiService';

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
  assert(status.status === 'healthy', 'AI subsystem reports status "healthy"');
  assert(status.provider === 'Google Gemini', 'AI provider identifies as "Google Gemini"');
  assert(typeof status.rateLimitPerMinute === 'number', 'Rate limit is configured as a number');

  // Test 3: Fare Prediction
  console.log('\n[3] Testing Fare Prediction Engine:');
  const prediction = await aiService.predictFare('DEL-BOM');
  assert(prediction.route === 'DEL-BOM', 'Prediction route matches requested route');
  assert(typeof prediction.predictedFare === 'number' && prediction.predictedFare > 0, 'Predicted fare is a positive number');
  assert(['increase', 'decrease', 'stable'].includes(prediction.direction), `Direction is valid (${prediction.direction})`);
  assert(prediction.confidence >= 0 && prediction.confidence <= 1, 'Confidence is between 0 and 1');
  assert(prediction.disclaimer.includes('not guaranteed'), 'Disclaimer is present in prediction output');

  const validatedPrediction = predictionOutputSchema.safeParse(prediction);
  assert(validatedPrediction.success, 'Prediction output matches Zod schema contract');

  // Test 4: Route Market Analysis
  console.log('\n[4] Testing Route Market Analysis:');
  const analysis = await aiService.analyzeRoute('DEL-BOM');
  assert(analysis.route === 'DEL-BOM', 'Route matches in analysis');
  assert(['Low', 'Moderate', 'High'].includes(analysis.volatilityRisk), `Volatility risk is valid (${analysis.volatilityRisk})`);
  assert(analysis.recommendation.length > 10, 'Strategic recommendation provided');
  assert(analysis.bestBookingWindow.length > 5, 'Best booking window provided');

  const validatedAnalysis = routeAnalysisOutputSchema.safeParse(analysis);
  assert(validatedAnalysis.success, 'Route analysis output matches Zod schema contract');

  // Test 5: Dashboard Insights Generation
  console.log('\n[5] Testing Dashboard Insights Generation:');
  const insights = await aiService.generateDashboardInsights();
  assert(Array.isArray(insights) && insights.length >= 4, 'Generates at least 4 actionable insights');
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
