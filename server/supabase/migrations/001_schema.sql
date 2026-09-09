-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Airports
CREATE TABLE airports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    region VARCHAR(50), -- North, South, East, West
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Airlines
CREATE TABLE airlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    iata_code VARCHAR(2) UNIQUE NOT NULL,
    logo_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_airport_id UUID REFERENCES airports(id),
    destination_airport_id UUID REFERENCES airports(id),
    distance_km INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(origin_airport_id, destination_airport_id)
);

-- Flights
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline_id UUID REFERENCES airlines(id),
    route_id UUID REFERENCES routes(id),
    flight_number VARCHAR(20) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fare Prices (Realtime)
CREATE TABLE fare_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    source VARCHAR(50) DEFAULT 'system',
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fare History (Aggregated daily/hourly)
CREATE TABLE fare_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id),
    average_fare DECIMAL(10, 2) NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Airfare Indices
CREATE TABLE airfare_indices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region VARCHAR(50) NOT NULL, -- 'India', 'North', 'South', 'East', 'West'
    index_value DECIMAL(10, 2) NOT NULL,
    previous_value DECIMAL(10, 2),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CPI Data
CREATE TABLE cpi_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month DATE NOT NULL,
    cpi_value DECIMAL(10, 2) NOT NULL,
    airfare_cpi DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price Alerts
CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- normally references auth.users
    route_id UUID REFERENCES routes(id),
    target_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE
);

-- AI Insights
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    data_snapshot JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_fare_prices_route_id ON fare_prices(route_id);
CREATE INDEX idx_fare_prices_captured_at ON fare_prices(captured_at);
CREATE INDEX idx_fare_history_route_id ON fare_history(route_id);
CREATE INDEX idx_airfare_indices_region ON airfare_indices(region);
CREATE INDEX idx_airfare_indices_calculated_at ON airfare_indices(calculated_at);
