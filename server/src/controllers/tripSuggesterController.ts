import { Request, Response } from 'express';
import { 
  validateDomesticAirports, 
  parseIndianTripRequest, 
  suggestDomesticTrip 
} from '../services/tripSuggesterService';

export const tripSuggesterController = {
  suggestTrip(req: Request, res: Response) {
    try {
      const { origin, destination } = req.body;
      const validation = validateDomesticAirports(origin, destination);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INTERNATIONAL_ROUTE_REJECTED',
            message: validation.error || 'AeroNex AI Trip Suggester currently supports domestic flights within India only.'
          }
        });
      }

      const result = suggestDomesticTrip(req.body);
      return res.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'TRIP_SUGGESTER_ERROR',
          message: err.message || 'Error calculating domestic trip recommendations'
        }
      });
    }
  },

  parseTrip(req: Request, res: Response) {
    try {
      const { prompt } = req.body;
      const parsed = parseIndianTripRequest(prompt);
      return res.json({
        success: true,
        data: parsed
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'PARSE_TRIP_ERROR',
          message: err.message
        }
      });
    }
  },

  getBookingAdvice(req: Request, res: Response) {
    try {
      const { origin, destination } = req.body;
      const validation = validateDomesticAirports(origin, destination);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INTERNATIONAL_ROUTE_REJECTED',
            message: validation.error
          }
        });
      }

      return res.json({
        success: true,
        data: {
          recommendation: 'FAIR_PRICE',
          advanceBookingWindow: '14-21 days before departure',
          weekdaySavingsInsight: 'Tuesday & Wednesday departures are ₹1,200–₹1,600 cheaper than weekend departures.'
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'ADVICE_ERROR', message: err.message }
      });
    }
  }
};
