import { createServerClient, type CookieOptions } from '@supabase/ssr';

declare const process: any;

export function createClient(cookieStore?: {
  getAll?: () => { name: string; value: string }[];
  setAll?: (cookies: { name: string; value: string; options: CookieOptions }[]) => void;
}) {
  const supabaseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    'https://scybybrkshwwldydnpmf.supabase.co';
  const supabaseKey =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    'sb_publishable_SsYWk1O5yk3zP28ssCz4xw_XCdP7x92';

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore?.getAll ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet) {
        try {
          cookieStore?.setAll?.(cookiesToSet);
        } catch {
          // Ignored if called from context where cookies cannot be mutated
        }
      },
    },
  });
}
