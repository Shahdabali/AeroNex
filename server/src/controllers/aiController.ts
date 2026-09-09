import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { 
  predictRequestSchema, 
  routeAnalysisRequestSchema, 
  bookingRecommendationRequestSchema,
  regionalAnalysisRequestSchema
} from '../validators/aiSchemas';

export const aiController = {
  async getStatus(req: Request, res: Response) {
    try {
      const status = aiService.getAIStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AI_STATUS_ERROR', message: err.message },
      });
    }
  },

  async getInsights(req: Request, res: Response) {
    try {
      const insights = await aiService.generateDashboardInsights();
      res.json({
        success: true,
        data: insights,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AI_INSIGHTS_ERROR', message: err.message },
      });
    }
  },

  async predict(req: Request, res: Response) {
    try {
      const validation = predictRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: validation.error.issues[0]?.message || 'Invalid prediction parameters',
          }
        });
      }

      const { route, origin, destination } = validation.data;
      const targetRoute = route || `${origin}-${destination}`;
      const prediction = await aiService.predictFare(targetRoute);

      res.json({
        success: true,
        data: prediction,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AI_PREDICTION_ERROR', message: err.message },
      });
    }
  },

  async routeAnalysis(req: Request, res: Response) {
    try {
      const validation = routeAnalysisRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: validation.error.issues[0]?.message || 'Route identifier is required',
          }
        });
      }

      const analysis = await aiService.analyzeRoute(validation.data.route);
      res.json({
        success: true,
        data: analysis,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AI_ROUTE_ANALYSIS_ERROR', message: err.message },
      });
    }
  },

  async bookingRecommendation(req: Request, res: Response) {
    try {
      const validation = bookingRecommendationRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: validation.error.issues[0]?.message || 'Route identifier is required',
          }
        });
      }

      const recommendation = await aiService.recommendBookingWindow(validation.data.route);
      res.json({
        success: true,
        data: recommendation,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AI_BOOKING_RECOMMENDATION_ERROR', message: err.message },
      });
    }
  },

  async regionalAnalysis(req: Request, res: Response) {
    try {
      const validation = regionalAnalysisRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: validation.error.issues[0]?.message || 'Valid Indian region required',
          }
        });
      }

      const analysis = await aiService.analyzeRegionalTrend(validation.data.region);
      res.json({
        success: true,
        data: analysis,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AI_REGIONAL_ANALYSIS_ERROR', message: err.message },
      });
    }
  },
};
