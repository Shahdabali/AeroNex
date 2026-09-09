-- Add these to existing schema

-- Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- references auth.users
    full_name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'passenger',
    currency VARCHAR(3) DEFAULT 'INR',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    theme VARCHAR(20) DEFAULT 'dark',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search History
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    search_query TEXT NOT NULL,
    route_id UUID REFERENCES routes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Rewards
CREATE TABLE user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    total_points INTEGER DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'bronze',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward Transactions
CREATE TABLE reward_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    points INTEGER NOT NULL,
    description TEXT,
    transaction_type VARCHAR(50), -- earned, spent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Ingestion Runs
CREATE TABLE data_ingestion_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100),
    records_received INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'running',
    error_message TEXT
);

-- AI Predictions
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id),
    prediction_type VARCHAR(50),
    current_fare DECIMAL(10, 2),
    predicted_fare DECIMAL(10, 2),
    predicted_change_percent DECIMAL(5, 2),
    direction VARCHAR(20), -- increase, decrease, stable
    confidence DECIMAL(5, 2),
    recommended_action VARCHAR(50),
    reason TEXT,
    prediction_horizon VARCHAR(50),
    input_snapshot JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
