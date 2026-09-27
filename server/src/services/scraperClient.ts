import { config } from '../config';

/**
 * Client for the scraper service (/internal/v1). Server-side only: the base URL and bearer token come from the
 * environment and are never exposed to the browser. Every failure is classified so callers can show a truthful,
 * user-presentable message instead of a stack trace.
 */
export type ScraperFailure =
  | 'not_configured'
  | 'unreachable'
  | 'timeout'
  | 'unauthorized'
  | 'bad_request'
  | 'rate_limited'
  | 'upstream'
  | 'invalid_response';

export class ScraperError extends Error {
  constructor(public kind: ScraperFailure, message: string, public status = 0) {
    super(message);
    this.name = 'ScraperError';
  }
}

export interface Envelope<T> {
  data: T;
  meta: Record<string, any>;
}

const DEFAULT_TIMEOUT_MS = 8_000;

export const scraperConfigured = () => Boolean(config.scraperUrl);

export class ScraperClient {
  constructor(
    private baseUrl: string = config.scraperUrl,
    private token: string = config.scraperToken,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown, timeoutMs = DEFAULT_TIMEOUT_MS, attempt = 0): Promise<Envelope<T>> {
    if (!this.baseUrl) throw new ScraperError('not_configured', 'No scraper service is configured on this server.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await this.fetchImpl(`${this.baseUrl}/internal/v1${path}`, {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      let json: any;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new ScraperError('invalid_response', 'The scraper service returned a response that is not JSON.', res.status);
      }
      if (!res.ok) {
        const msg: string = json?.error?.message || `Scraper service responded ${res.status}.`;
        if (res.status === 401 || res.status === 403) throw new ScraperError('unauthorized', 'The scraper service rejected this server’s credentials.', res.status);
        if (res.status === 429) throw new ScraperError('rate_limited', msg, res.status);
        if (res.status >= 400 && res.status < 500) throw new ScraperError('bad_request', msg, res.status);
        // A transient upstream failure on a read is retried once.
        if (method === 'GET' && attempt < 1 && res.status >= 502) return this.request(method, path, body, timeoutMs, attempt + 1);
        throw new ScraperError('upstream', msg, res.status);
      }
      if (!json || typeof json !== 'object' || !('data' in json)) {
        throw new ScraperError('invalid_response', 'The scraper service response had an unexpected shape.', res.status);
      }
      return json as Envelope<T>;
    } catch (err: any) {
      if (err instanceof ScraperError) throw err;
      if (err?.name === 'AbortError') throw new ScraperError('timeout', 'The scraper service took too long to respond.');
      if (method === 'GET' && attempt < 1) return this.request(method, path, body, timeoutMs, attempt + 1);
      throw new ScraperError('unreachable', 'The scraper service could not be reached.');
    } finally {
      clearTimeout(timer);
    }
  }

  get<T = any>(path: string, timeoutMs?: number) {
    return this.request<T>('GET', path, undefined, timeoutMs);
  }

  post<T = any>(path: string, body: unknown, timeoutMs?: number) {
    return this.request<T>('POST', path, body, timeoutMs);
  }
}

export const scraper = new ScraperClient();

/** Turns a scraper failure into a message that is safe and useful to show a person. */
export function friendlyScraperMessage(err: unknown): { status: number; code: string; message: string } {
  if (err instanceof ScraperError) {
    switch (err.kind) {
      case 'not_configured':
        return { status: 503, code: 'live_data_not_configured', message: 'Live airfare data is not configured on this server.' };
      case 'bad_request':
        return { status: 400, code: 'invalid_search', message: err.message };
      case 'rate_limited':
        return { status: 429, code: 'rate_limited', message: 'Too many searches right now. Please try again in a moment.' };
      default:
        return { status: 503, code: 'live_data_unavailable', message: 'Live airfare data is temporarily unavailable.' };
    }
  }
  return { status: 500, code: 'internal_error', message: 'Something went wrong. Please try again.' };
}

/** Maps a failed scrape job (as recorded by the scraper) to what a person should read. */
export function friendlyJobError(kind: string | null | undefined): string {
  switch (kind) {
    case 'access_denied':
      return 'The fare source is refusing automated access right now, so fresh fares could not be collected.';
    case 'robots_disallowed':
      return 'The fare source’s crawling rules currently do not allow collecting these fares.';
    case 'rate_limited':
      return 'The fare source asked us to slow down. Fresh fares will be collected again shortly.';
    case 'source_unavailable':
      return 'The fare source is paused after repeated failures and will be retried automatically.';
    case 'timeout':
    case 'network':
    case 'upstream_5xx':
    case 'session':
      return 'The fare source did not respond in time. Live airfare data is temporarily unavailable.';
    case 'parser':
    case 'selector':
    case 'invalid_response':
      return 'AeroNex could not read the fare source’s response, so these fares were not stored.';
    default:
      return 'Live airfare data is temporarily unavailable.';
  }
}
