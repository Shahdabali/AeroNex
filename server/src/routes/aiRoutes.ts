import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { aiRateLimiter } from '../middleware/rateLimit';

export const aiRouter = Router();

// Apply rate limiting middleware to all AI endpoints
aiRouter.use(aiRateLimiter);

// AI Status
aiRouter.get('/status', aiController.getStatus);

// Insights
aiRouter.get('/insights', aiController.getInsights);
aiRouter.post('/insights', aiController.getInsights);

// Prediction
aiRouter.post('/predict', aiController.predict);

// Route Deep Analysis
aiRouter.post('/route-analysis', aiController.routeAnalysis);

// Booking Recommendation
aiRouter.post('/booking-recommendation', aiController.bookingRecommendation);

// Regional Trend
aiRouter.post('/regional-analysis', aiController.regionalAnalysis);

// AI Trip Suggester — India Domestic
import { tripSuggesterController } from '../controllers/tripSuggesterController';
aiRouter.post('/trip-suggester', tripSuggesterController.suggestTrip);
aiRouter.post('/parse-trip', tripSuggesterController.parseTrip);
aiRouter.post('/recommendations', tripSuggesterController.suggestTrip);
aiRouter.post('/booking-advice', tripSuggesterController.getBookingAdvice);
