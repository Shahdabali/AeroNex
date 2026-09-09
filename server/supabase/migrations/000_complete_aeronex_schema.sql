-- ==============================================================================
-- AERONEX — COMPLETE SUPABASE DATABASE SCHEMA & INITIAL DATA
-- Tagline: FLY BEYOND LIMITS
-- ==============================================================================

-- 1. Enable Cryptographic & UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Airports Table
CREATE TABLE IF NOT EXISTS airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    region VARCHAR(50), -- North, South, East, West
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Airlines Table
CREATE TABLE IF NOT EXISTS airlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    iata_code VARCHAR(2) UNIQUE NOT NULL,
    logo_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_airport_id UUID REFERENCES airports(id) ON DELETE CASCADE,
    destination_airport_id UUID REFERENCES airports(id) ON DELETE CASCADE,
    distance_km INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(origin_airport_id, destination_airport_id)
);

-- 5. Flights Table
CREATE TABLE IF NOT EXISTS flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airline_id UUID REFERENCES airlines(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    flight_number VARCHAR(20) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Fare Prices (Realtime Streaming)
CREATE TABLE IF NOT EXISTS fare_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    source VARCHAR(50) DEFAULT 'system',
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Fare History (Aggregated Trends)
CREATE TABLE IF NOT EXISTS fare_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    average_fare DECIMAL(10, 2) NOT NULL,
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Airfare Indices (Market Intelligence)
CREATE TABLE IF NOT EXISTS airfare_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region VARCHAR(50) DEFAULT 'India',
    index_value DECIMAL(10, 2) NOT NULL,
    previous_value DECIMAL(10, 2),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CPI Data (Inflation & Purchasing Power Analytics)
CREATE TABLE IF NOT EXISTS cpi_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month DATE NOT NULL,
    cpi_value DECIMAL(10, 2) NOT NULL,
    airfare_cpi DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Price Alerts
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    target_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    triggered_at TIMESTAMPTZ
);

-- 11. AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    data_snapshot JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 12. AI Predictions
CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    prediction_type VARCHAR(50),
    current_fare DECIMAL(10, 2),
    predicted_fare DECIMAL(10, 2),
    predicted_change_percent DECIMAL(5, 2),
    direction VARCHAR(20),
    confidence DECIMAL(5, 2),
    recommended_action VARCHAR(50),
    reason TEXT,
    prediction_horizon VARCHAR(50),
    input_snapshot JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Profiles (User Accounts)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'passenger',
    currency VARCHAR(3) DEFAULT 'INR',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'dark',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Search History
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. User Rewards & Gamification
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'bronze',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Reward Transactions
CREATE TABLE IF NOT EXISTS reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    description TEXT,
    transaction_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Quickstart Verification Table (todos)
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    is_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_fare_prices_route_id ON fare_prices(route_id);
CREATE INDEX IF NOT EXISTS idx_fare_prices_captured_at ON fare_prices(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_airfare_indices_calculated_at ON airfare_indices(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_generated_at ON ai_insights(generated_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — SEAMLESS ACCESS FOR CLIENT & BACKEND
-- ==============================================================================
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE fare_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fare_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE airfare_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Allow public read & write operations
DO \$\$
BEGIN
    EXECUTE 'CREATE POLICY "Public full access airports" ON airports FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access airlines" ON airlines FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access routes" ON routes FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access flights" ON flights FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access fare_prices" ON fare_prices FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access fare_history" ON fare_history FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access airfare_indices" ON airfare_indices FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access cpi_data" ON cpi_data FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access price_alerts" ON price_alerts FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access ai_insights" ON ai_insights FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access ai_predictions" ON ai_predictions FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access profiles" ON profiles FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access user_preferences" ON user_preferences FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access search_history" ON search_history FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access user_rewards" ON user_rewards FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access reward_transactions" ON reward_transactions FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Public full access todos" ON todos FOR ALL USING (true) WITH CHECK (true)';
EXCEPTION WHEN duplicate_object THEN
    NULL;
END \$\$;

-- ==============================================================================
-- REALTIME WEBSOCKET SUBSCRIPTIONS
-- ==============================================================================
DO \$\$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE fare_prices, airfare_indices, ai_insights;
EXCEPTION WHEN OTHERS THEN
  NULL;
END \$\$;

-- ==============================================================================
-- INITIAL REFERENCE DATA SEEDING
-- ==============================================================================

-- Airports
INSERT INTO airports (iata_code, icao_code, name, city, state, country, latitude, longitude, region)
VALUES
  ('DEL', 'VIDP', 'Indira Gandhi International Airport', 'New Delhi', 'Delhi', 'India', 28.5562, 77.1000, 'North'),
  ('BOM', 'VABB', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'Maharashtra', 'India', 19.0896, 72.8656, 'West'),
  ('BLR', 'VOBL', 'Kempegowda International Airport', 'Bengaluru', 'Karnataka', 'India', 13.1986, 77.7066, 'South'),
  ('HYD', 'VOHS', 'Rajiv Gandhi International Airport', 'Hyderabad', 'Telangana', 'India', 17.2403, 78.4294, 'South'),
  ('MAA', 'VOMM', 'Chennai International Airport', 'Chennai', 'Tamil Nadu', 'India', 12.9941, 80.1709, 'South'),
  ('CCU', 'VECC', 'Netaji Subhash Chandra Bose International Airport', 'Kolkata', 'West Bengal', 'India', 22.6547, 88.4467, 'East'),
  ('GOI', 'VOGO', 'Dabolim Airport', 'Goa', 'Goa', 'India', 15.3808, 73.8314, 'West'),
  ('AMD', 'VAAH', 'Sardar Vallabhbhai Patel International Airport', 'Ahmedabad', 'Gujarat', 'India', 23.0772, 72.6347, 'West'),
  ('PNQ', 'VAPO', 'Pune Airport', 'Pune', 'Maharashtra', 'India', 18.5822, 73.9197, 'West'),
  ('COK', 'VOCI', 'Cochin International Airport', 'Kochi', 'Kerala', 'India', 10.1520, 76.4019, 'South'),
  ('JAI', 'VIJP', 'Jaipur International Airport', 'Jaipur', 'Rajasthan', 'India', 26.8242, 75.8122, 'North'),
  ('LKO', 'VILK', 'Chaudhary Charan Singh International Airport', 'Lucknow', 'Uttar Pradesh', 'India', 26.7606, 80.8893, 'North'),
  ('GAU', 'VEGT', 'Lokpriya Gopinath Bordoloi International Airport', 'Guwahati', 'Assam', 'India', 26.1061, 91.5859, 'East'),
  ('IXC', 'VICG', 'Shaheed Bhagat Singh International Airport', 'Chandigarh', 'Punjab', 'India', 30.6735, 76.7885, 'North')
ON CONFLICT (iata_code) DO NOTHING;

-- Airlines
INSERT INTO airlines (name, iata_code, active)
VALUES
  ('IndiGo', '6E', true),
  ('Air India', 'AI', true),
  ('SpiceJet', 'SG', true),
  ('Vistara', 'UK', true),
  ('Go First', 'G8', true),
  ('AirAsia India', 'I5', true),
  ('Akasa Air', 'QP', true)
ON CONFLICT (iata_code) DO NOTHING;

-- Baseline Airfare Indices
INSERT INTO airfare_indices (region, index_value, previous_value)
VALUES
  ('India', 100.00, 99.40),
  ('North', 102.50, 101.80),
  ('South', 98.20, 99.10),
  ('East', 101.10, 100.50),
  ('West', 99.40, 100.00);

-- Initial AI Insights
INSERT INTO ai_insights (type, title, content)
VALUES
  ('volatility', 'AeroNex Corridor Alert', 'Mumbai-Delhi trunk route experiencing elevated demand (+4.8% delta). Advance booking window of 14+ days advised.'),
  ('prediction', 'Optimal Booking Window', 'Bengaluru to Goa airfares projected to cool down by ~8% within 5 days. Recommendation: WAIT.'),
  ('regional', 'Western Airspace Stability', 'Regional index holding steady at 99.40 with balanced seat load factor across carriers.');

-- Verification Todo
INSERT INTO todos (name, is_complete)
VALUES
  ('AeroNex connected to Supabase', true);
