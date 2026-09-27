import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  isDemoMode: !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY,
  isProduction: process.env.NODE_ENV === 'production',
  // Scraper service (server-side only: the URL and token are never sent to the browser).
  scraperUrl: (process.env.SCRAPER_API_URL || '').replace(/\/$/, ''),
  scraperToken: process.env.SCRAPER_API_TOKEN || '',
  // Simulated fares are a development aid. They are never used in production unless explicitly allowed.
  allowSimulatedData: process.env.ALLOW_SIMULATED_DATA === 'true' || process.env.NODE_ENV !== 'production',
  // Who may trigger manual scrapes. Empty in production = nobody; outside production any signed-in user may (local development).
  adminEmails: (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean),
};
