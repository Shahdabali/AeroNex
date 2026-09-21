import { Request, Response, NextFunction, RequestHandler } from 'express';
import { CorsOptions } from 'cors';

/** Allowed browser origins. Set CORS_ORIGINS (comma separated) in production. */
const configured = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const corsOptions: CorsOptions = {
  origin(origin, cb) {
    // Non-browser clients (curl, server-to-server, API keys) send no Origin header.
    if (!origin) return cb(null, true);
    cb(null, configured.includes(origin) || LOCAL_ORIGIN.test(origin));
  },
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 600,
};

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.removeHeader('X-Powered-By');
  next();
}

interface LimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

/** Fixed-window per-IP limiter. */
export function createRateLimiter({ windowMs, max, message }: LimiterOptions): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (entry.count >= max) {
      const retry = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retry));
      return res.status(429).json({ success: false, error: message || `Too many requests. Try again in ${retry}s.` });
    }
    entry.count++;
    next();
  };
}

/** Central error handler: never leaks internals to clients. */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'The request is too large.' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Malformed JSON in request body.' });
  }
  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
    return res.status(status).json({ success: false, error: 'Something went wrong on our side. Please try again.' });
  }
  res.status(status).json({ success: false, error: err.message || 'Bad request.' });
}
