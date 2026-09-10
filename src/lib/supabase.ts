import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://scybybrkshwwldydnpmf.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_SsYWk1O5yk3zP28ssCz4xw_XCdP7x92';

/**
 * Resolves the active site URL for OAuth redirects and email links across
 * local development and Vercel production deployments.
 */
export function getSiteUrl(): string {
  const envUrl =
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  return envUrl ? envUrl.replace(/\/$/, '') : 'http://localhost:5173';
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  url: string;
  error?: string;
}> {
  try {
    const { error } = await supabase.from('airports').select('count').limit(1);
    if (error && error.code !== 'PGRST205') {
      return { connected: false, url: SUPABASE_URL, error: error.message };
    }
    if (error && error.code === 'PGRST205') {
      return {
        connected: true,
        url: SUPABASE_URL,
        error: 'Connected to Supabase. Tables need to be migrated in SQL Editor.',
      };
    }
    return { connected: true, url: SUPABASE_URL };
  } catch (err: any) {
    return { connected: false, url: SUPABASE_URL, error: err.message || 'Unknown network error' };
  }
}
