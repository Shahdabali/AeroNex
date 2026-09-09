# AeroNex Architecture
> **FLY BEYOND LIMITS**

## System Design

```mermaid
graph TD
    APIs[AIRFARE APIs / Simulation Engine] --> Ingestion[Data Ingestion Worker]
    Ingestion --> DB[(PostgreSQL / LiveDataStore)]
    
    DB --> Analytics[Analytics Engine]
    DB --> Alerts[Price Alerts]
    DB --> History[Fare History]
    
    Analytics --> Index[Deterministic Airfare Index Engine]
    Alerts --> Notifications[Notifications]
    History --> Notifications
    
    Index --> Gemini[AeroNex AI Service / Gemini]
    
    Gemini --> Predictions[AI Predictions]
    Gemini --> Insights[AI Insights]
    
    Predictions --> Backend[AeroNex Backend API]
    Insights --> Backend
    
    Backend --> Dashboard[AeroNex React Dashboard]
    
    Dashboard --> Realtime[Supabase Realtime / Polling]
```

## Data Ingestion & Analytics Flow
The backend uses a `dbService` layer that can switch between an active Supabase provider and a local Demo provider (to run without cloud setup).
When airfare data is ingested, it calculates indices like `Airfare Index` and regional fluctuations.
The `aiService` then queries these aggregated metrics and asks Gemini to generate human-readable insights, which are cached with a configurable TTL to prevent unnecessary API usage.
