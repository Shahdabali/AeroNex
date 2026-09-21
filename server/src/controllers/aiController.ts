import { Request, Response } from 'express';
import { ZodType } from 'zod';
import { aiService } from '../services/aiService';
import {
  predictRequestSchema,
  routeAnalysisRequestSchema,
  bookingRecommendationRequestSchema,
  regionalAnalysisRequestSchema,
  chatRequestSchema,
} from '../validators/aiSchemas';

function fail(res: Response, code: string, err: any) {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  if (status >= 500) console.error(`[AI:${code}]`, err);
  res.status(status).json({
    success: false,
    error: {
      code,
      message: status < 500 ? err.message : 'The AI service could not complete this request. Please try again.',
    },
  });
}

/** Validates the body, runs the handler, and reports errors uniformly. */
function endpoint<T>(code: string, schema: ZodType<T> | null, fallbackMessage: string, run: (input: T) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    try {
      let input = undefined as T;
      if (schema) {
        const parsed = schema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            success: false,
            error: { code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message || fallbackMessage },
          });
        }
        input = parsed.data;
      }
      res.json({ success: true, data: await run(input) });
    } catch (err) {
      fail(res, code, err);
    }
  };
}

export const aiController = {
  getStatus: endpoint('AI_STATUS_ERROR', null, '', async () => aiService.getAIStatus()),

  getInsights: endpoint('AI_INSIGHTS_ERROR', null, '', () => aiService.generateDashboardInsights()),

  predict: endpoint('AI_PREDICTION_ERROR', predictRequestSchema, 'Invalid prediction parameters', ({ route, origin, destination }) =>
    aiService.predictFare(String(route || `${origin}-${destination}`).toUpperCase()),
  ),

  routeAnalysis: endpoint('AI_ROUTE_ANALYSIS_ERROR', routeAnalysisRequestSchema, 'Route identifier is required', ({ route }) =>
    aiService.analyzeRoute(route.toUpperCase()),
  ),

  bookingRecommendation: endpoint(
    'AI_BOOKING_RECOMMENDATION_ERROR',
    bookingRecommendationRequestSchema,
    'Route identifier is required',
    ({ route }) => aiService.recommendBookingWindow(route.toUpperCase()),
  ),

  chat: endpoint('AI_CHAT_ERROR', chatRequestSchema, 'Please type a question.', ({ message, route }) => aiService.answerQuestion(message, route)),

  regionalAnalysis: endpoint('AI_REGIONAL_ANALYSIS_ERROR', regionalAnalysisRequestSchema, 'Valid Indian region required', ({ region }) =>
    aiService.analyzeRegionalTrend(region),
  ),
};
