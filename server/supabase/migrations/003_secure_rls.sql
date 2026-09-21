-- ==============================================================================
-- 003: Replace the wide-open "Public full access" RLS policies with real ones.
--
-- Migration 000 granted USING (true) WITH CHECK (true) on every table. Because the
-- anon key ships in the browser bundle, that let ANY visitor read, edit or delete
-- every user's profile, alerts, search history and rewards.
--
-- After this migration:
--   * Market/reference tables are world-readable but writable only by the server
--     (the service-role key bypasses RLS).
--   * User-owned tables are readable/writable only by their owner (auth.uid()).
--   * The `todos` quickstart table is locked down completely.
--
-- Run in the Supabase SQL editor (or `supabase db push`) AFTER 000-002.
-- ==============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'airports','airlines','routes','flights','fare_prices','fare_history','airfare_indices',
    'cpi_data','price_alerts','ai_insights','ai_predictions','profiles','user_preferences',
    'search_history','user_rewards','reward_transactions','todos'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public full access %s" ON %I', t, t);
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- 1. Public, read-only market data ---------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'airports','airlines','routes','flights','fare_prices','fare_history',
    'airfare_indices','cpi_data','ai_insights','ai_predictions'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read %s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "Public read %s" ON %I FOR SELECT TO anon, authenticated USING (true)', t, t);
  END LOOP;
END $$;

-- 2. Profiles: a user can only see and change their own row ----------------------
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile insert" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;
CREATE POLICY "Own profile select" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Own profile insert" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Own profile update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 3. Owner-only tables keyed by user_id -------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['user_preferences','search_history','user_rewards','reward_transactions','price_alerts'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Own rows %s" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "Own rows %s" ON %I FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())',
      t, t
    );
  END LOOP;
END $$;

-- Reward ledgers should only ever be written by the server.
DROP POLICY IF EXISTS "Own rows user_rewards" ON user_rewards;
DROP POLICY IF EXISTS "Own rows reward_transactions" ON reward_transactions;
CREATE POLICY "Own rows user_rewards" ON user_rewards FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own rows reward_transactions" ON reward_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 4. Indexes that back the owner policies ------------------------------------------
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 5. Prevent duplicate rows ----------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_preferences_user ON user_preferences(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_rewards_user ON user_rewards(user_id);
