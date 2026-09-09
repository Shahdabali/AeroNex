import express from 'express';
import cors from 'cors';
import { dbService } from './dbService';
import { config } from './config';
import { liveDataStore } from './liveDataStore';
import { startIngestionWorker } from './workers/fareIngestionWorker';
import { aiRouter } from './routes/aiRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// AeroNex Server-Side AI Subsystem
app.use('/api/ai', aiRouter);

// Dashboard Analytics Routes
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const data = await dbService.getDashboardMetrics();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/routes', async (req, res) => {
  try {
    const data = await dbService.getTopRouteChanges();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/regional-index', async (req, res) => {
  try {
    const data = await dbService.getRegionalIndices();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/chart-data', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || '24h';
    const data = await dbService.getAirfareChartData(timeframe);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/freshness', (req, res) => {
  res.json({ lastUpdatedAt: liveDataStore.getLastUpdatedAt(), status: 'live' });
});

// Reference Data Routes
app.get('/api/health', async (req, res) => {
  const dbHealth = await dbService.getHealth();
  res.json({ 
    brand: 'AeroNex',
    tagline: 'FLY BEYOND LIMITS',
    status: 'ok', 
    services: { 
      db: dbHealth.connected ? 'ok' : 'degraded',
      dbDetails: dbHealth,
      worker: 'ok', 
      ai: 'ok' 
    } 
  });
});

app.get('/api/airports', (req, res) => {
  const airports = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'GOI', 'AMD', 'PNQ', 'COK', 'JAI', 'LKO', 'GAU', 'IXC'];
  res.json(airports);
});

app.get('/api/airlines', (req, res) => {
  const airlines = [
    { code: '6E', name: 'IndiGo' },
    { code: 'AI', name: 'Air India' },
    { code: 'SG', name: 'SpiceJet' },
    { code: 'UK', name: 'Vistara' },
    { code: 'G8', name: 'Go First' },
    { code: 'I5', name: 'AirAsia India' },
    { code: 'QP', name: 'Akasa Air' }
  ];
  res.json(airlines);
});

app.get('/api/routes', (req, res) => {
  res.json(liveDataStore.getAllRoutes());
});

app.get('/api/routes/:id', (req, res) => {
  const history = liveDataStore.getRouteHistory(req.params.id);
  res.json(history);
});

app.get('/api/flights/search', (req, res) => {
  const { from, to } = req.query;
  const route = `${from}-${to}`;
  const routes = liveDataStore.getAllRoutes();
  const found = routes.find(r => r.route === route);
  if (found) {
    res.json([{ flight: '6E-123', price: found.currentFare, time: '10:00 AM' }]);
  } else {
    res.json([]);
  }
});

// In-Memory Alerts Store
const alerts: any[] = [];
app.post('/api/alerts', (req, res) => {
  const alert = { id: Date.now().toString(), ...req.body };
  alerts.push(alert);
  res.json(alert);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.delete('/api/alerts/:id', (req, res) => {
  const index = alerts.findIndex(a => a.id === req.params.id);
  if (index >= 0) alerts.splice(index, 1);
  res.json({ success: true });
});

app.get('/api/notifications', (req, res) => {
  res.json([{ id: 1, message: 'Price dropped for DEL-BOM', read: false }]);
});

app.listen(config.port, () => {
  console.log(`AeroNex API running on port ${config.port}`);
  console.log(`Tagline: FLY BEYOND LIMITS`);
  console.log(`Mode: ${config.isDemoMode ? 'DEMO' : 'SUPABASE'}`);
  
  // Start the background data ingestion pipeline
  startIngestionWorker();
});
