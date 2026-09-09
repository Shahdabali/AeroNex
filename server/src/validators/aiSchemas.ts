import { z } from 'zod';

// Input schemas
export const predictRequestSchema = z.object({
  route: z.string().min(3).optional(),
  origin: z.string().length(3).optional(),
  destination: z.string().length(3).optional(),
  departureDate: z.string().optional(),
}).refine(data => data.route || (data.origin && data.destination), {
  message: "Either route (e.g. DEL-BOM) or both origin and destination must be provided"
});

export const routeAnalysisRequestSchema = z.object({
  route: z.string().min(3),
});

export const bookingRecommendationRequestSchema = z.object({
  route: z.string().min(3),
  targetFare: z.number().positive().optional(),
});

export const regionalAnalysisRequestSchema = z.object({
  region: z.enum(['North', 'South', 'East', 'West', 'Central', 'Northeast']),
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
  disclaimer: z.string().default('AI predictions are estimates based on available airfare data and are not guaranteed.')
});

export const routeAnalysisOutputSchema = z.object({
  route: z.string(),
  currentSituation: z.string(),
  priceTrend: z.string(),
  volatilityRisk: z.enum(['Low', 'Moderate', 'High']),
  recommendation: z.string(),
  bestBookingWindow: z.string(),
  explanation: z.string(),
});

export const aiInsightItemSchema = z.object({
  id: z.string(),
  type: z.enum(['alert', 'recommendation', 'insight', 'summary']),
  title: z.string(),
  content: z.string(),
  severity: z.enum(['low', 'medium', 'high']).default('low'),
  timestamp: z.string().optional(),
});
