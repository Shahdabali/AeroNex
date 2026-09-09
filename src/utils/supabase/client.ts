import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://scybybrkshwwldydnpmf.supabase.co';
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_SsYWk1O5yk3zP28ssCz4xw_XCdP7x92';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
