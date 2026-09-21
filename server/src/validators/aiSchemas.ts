import { z } from 'zod';

const routeCode = z.string().regex(/^[A-Za-z]{3}-[A-Za-z]{3}$/, 'Route must look like DEL-BOM');

// Input schemas
export const predictRequestSchema = z.object({
  route: routeCode.optional(),
  origin: z.string().length(3).optional(),
  destination: z.string().length(3).optional(),
  departureDate: z.string().optional(),
}).refine(data => data.route || (data.origin && data.destination), {
  message: "Either route (e.g. DEL-BOM) or both origin and destination must be provided"
});

export const routeAnalysisRequestSchema = z.object({
  route: routeCode,
});

export const bookingRecommendationRequestSchema = z.object({
  route: routeCode,
  targetFare: z.number().positive().optional(),
});

export const regionalAnalysisRequestSchema = z.object({
  region: z.enum(['North', 'South', 'East', 'West', 'Central', 'Northeast']),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(2, 'Please type a question.').max(500, 'Questions are limited to 500 characters.'),
  route: routeCode.optional(),
});

// Output validation schemas
export const predictionOutputSchema = z.object({
  route: z.string(),
  currentFare: z.number(),
  predictedFare: z.number(),
  direction: z.enum(['increase', 'decrease', 'stable']),
  predictedChangePercent: z.number(),
  confidence: z.number().min(0).max(1),
  recommendedAction: z.enum(['book_now', 'book_soon', 'wait', 'monitor']),
  bestBookingWindow: z.string(),
  reason: z.string(),
  disclaimer: z.string().default('AI predictions are estimates based on available airfare data and are not guaranteed.'),
  // Explainability: why the recommendation was produced and what it was based on.
  explanation: z.object({
    price: z.string(),
    timing: z.string(),
    route: z.string(),
  }).optional(),
  dataUsed: z.array(z.string()).optional(),
  caveats: z.array(z.string()).optional(),
  source: z.enum(['gemini', 'deterministic']).optional(),
});

export const routeAnalysisOutputSchema = z.object({
  route: z.string(),
  currentSituation: z.string(),
  priceTrend: z.string(),
  volatilityRisk: z.enum(['Low', 'Moderate', 'High']),
  recommendation: z.string(),
  bestBookingWindow: z.string(),
  explanation: z.string(),
  stats: z.object({
    observations: z.number(),
    minFare: z.number().nullable(),
    maxFare: z.number().nullable(),
    averageFare: z.number().nullable(),
    currentFare: z.number(),
  }).optional(),
  source: z.enum(['gemini', 'deterministic']).optional(),
});

export const aiInsightItemSchema = z.object({
  id: z.string(),
  type: z.enum(['alert', 'recommendation', 'insight', 'summary']),
  title: z.string(),
  content: z.string(),
  severity: z.enum(['low', 'medium', 'high']).default('low'),
  timestamp: z.string().optional(),
});
