import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { userService } from '../services/userService';

export interface AuthedUser {
  id: string;
  email: string;
  name?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthedUser;
  }
}

// Service-role client: only used server-side to validate access tokens and
// perform admin operations (e.g. account deletion). Never sent to the browser.
export const supabaseAdmin: SupabaseClient | null =
  config.supabaseUrl && config.supabaseServiceKey
    ? createClient(config.supabaseUrl, config.supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

const TOKEN_TTL_MS = 60_000;
const tokenCache = new Map<string, { user: AuthedUser; expires: number }>();

function pruneCache(now: number) {
  if (tokenCache.size < 500) return;
  for (const [k, v] of tokenCache) if (v.expires < now) tokenCache.delete(k);
}

function extractCredential(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  const apiKey = req.headers['x-api-key'];
  return typeof apiKey === 'string' ? apiKey.trim() : null;
}

async function resolveUser(credential: string): Promise<AuthedUser | null> {
  // Personal API keys (generated in Settings) authenticate read access.
  if (credential.startsWith('aeronex_live_sk_')) {
    const owner = userService.findByApiKey(credential);
    return owner ? { id: owner.id, email: owner.email } : null;
  }

  if (!supabaseAdmin) return null;
  const now = Date.now();
  const cached = tokenCache.get(credential);
  if (cached && cached.expires > now) return cached.user;

  const { data, error } = await supabaseAdmin.auth.getUser(credential);
  if (error || !data.user) return null;
  const user: AuthedUser = {
    id: data.user.id,
    email: (data.user.email || '').toLowerCase(),
    name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
  };
  pruneCache(now);
  tokenCache.set(credential, { user, expires: now + TOKEN_TTL_MS });
  return user;
}

/** Rejects the request unless a valid Supabase session token or API key is supplied. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const credential = extractCredential(req);
  if (!credential) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }
  const usingApiKey = credential.startsWith('aeronex_live_sk_');
  // Personal API keys are read-only and limited to the caller's own alerts/notifications, so a leaked key
  // cannot change settings, rotate keys or delete the account.
  if (usingApiKey && !(req.method === 'GET' && /^\/api\/(alerts|notifications)/.test(req.originalUrl || req.url || ''))) {
    return res.status(403).json({ success: false, error: 'API keys are read-only and can only access your alerts and notifications.' });
  }
  try {
    const user = await resolveUser(credential);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Your session is invalid or has expired. Please sign in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('[auth] Token verification failed:', err);
    res.status(503).json({ success: false, error: 'Authentication service is temporarily unavailable.' });
  }
}

/** Attaches req.user when a valid credential is present, but never blocks. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const credential = extractCredential(req);
  if (credential) {
    try {
      req.user = (await resolveUser(credential)) || undefined;
    } catch {
      /* treat as anonymous */
    }
  }
  next();
}
