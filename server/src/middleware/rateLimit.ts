import { Request, Response, NextFunction } from 'express';
import { aiConfig } from '../config/aiConfig';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function aiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window

  let record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(ip, record);
    return next();
  }

  if (record.count >= aiConfig.rateLimitPerMinute) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `AeroNex AI rate limit exceeded (${aiConfig.rateLimitPerMinute} requests/minute). Please try again in ${retryAfterSeconds} seconds.`,
      }
    });
  }

  record.count += 1;
  next();
}
