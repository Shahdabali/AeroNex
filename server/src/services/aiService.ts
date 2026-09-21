import { GoogleGenAI } from '@google/genai';
import { aiConfig } from '../config/aiConfig';
import { liveDataStore } from '../liveDataStore';
import { ingestionMonitor } from './ingestionMonitor';
import { HttpError } from '../utils/errors';
import { z } from 'zod';
import { predictionOutputSchema, routeAnalysisOutputSchema } from '../validators/aiSchemas';

export type PredictionResult = z.infer<typeof predictionOutputSchema>;
export type RouteAnalysisResult = z.infer<typeof routeAnalysisOutputSchema>;

const GEMINI_TIMEOUT_MS = 15_000;
const MIN_HISTORY_FOR_TREND = 5;

let genAI: GoogleGenAI | null = null;
if (aiConfig.geminiApiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey: aiConfig.geminiApiKey });
  } catch (err) {
    console.warn('[AeroNex AI] Failed to initialize GoogleGenAI client:', err);
  }
}

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const aiCache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = aiCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    aiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setInCache<T>(key: string, data: T, ttlMinutes = aiConfig.cacheTtlMinutes) {
  if (aiCache.size > 500) aiCache.clear();
  aiCache.set(key, { data, expiresAt: Date.now() + ttlMinutes * 60 * 1000 });
}

/** Runs a Gemini JSON request with a hard timeout. Returns null on any failure. */
async function askGemini(prompt: string): Promise<unknown | null> {
  if (!genAI || !aiConfig.isConfigured) return null;
  try {
    const call = genAI.models.generateContent({
      model: aiConfig.model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini request timed out')), GEMINI_TIMEOUT_MS));
    const response = await Promise.race([call, timeout]);
    const text = response.text;
    if (!text) throw new Error('Gemini returned an empty response');
    return JSON.parse(text);
  } catch (err: any) {
    console.warn('[AeroNex AI] Gemini call failed, using deterministic analysis:', err?.message || err);
    return null;
  }
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

interface RouteEvidence {
  route: string;
  currentFare: number;
  previousFare: number | null;
  fares: number[];
  observedSince: string | null;
  changePct: number; // first -> last observation in the window
  min: number;
  max: number;
  avg: number;
  volatilityPct: number; // coefficient of variation
}

function gatherEvidence(route: string): RouteEvidence {
  const current = liveDataStore.getAllRoutes().find(r => r.route === route);
  if (!current) {
    throw new HttpError(404, `AeroNex has no observed fares for ${route} yet, so it can't be analysed.`);
  }
  const history = liveDataStore.getRouteHistory(route);
  const fares = history.map(h => h.fare);
  const n = fares.length || 1;
  const avg = fares.reduce((a, b) => a + b, 0) / n;
  const variance = fares.reduce((a, b) => a + (b - avg) ** 2, 0) / n;
  const first = fares[0] ?? current.currentFare;
  return {
    route,
    currentFare: current.currentFare,
    previousFare: current.previousFare,
    fares,
    observedSince: history[0]?.timestamp ? new Date(history[0].timestamp).toISOString() : null,
    changePct: first ? ((current.currentFare - first) / first) * 100 : 0,
    min: fares.length ? Math.min(...fares) : current.currentFare,
    max: fares.length ? Math.max(...fares) : current.currentFare,
    avg,
    volatilityPct: avg ? (Math.sqrt(variance) / avg) * 100 : 0,
  };
}

function dataModeNote(): string {
  const ds = ingestionMonitor.getDataSource();
  return ds.mode === 'live'
    ? `Fares come from ${ds.provider} (live).`
    : `Fares come from ${ds.provider}, a simulated feed, so this is not based on real airline prices.`;
}

const CITY_TO_IATA: Record<string, string> = {
  delhi: 'DEL', mumbai: 'BOM', bombay: 'BOM', bengaluru: 'BLR', bangalore: 'BLR', hyderabad: 'HYD', chennai: 'MAA',
  kolkata: 'CCU', calcutta: 'CCU', goa: 'GOI',
};

/** Finds "DEL-BOM" style corridors mentioned in free text (IATA codes or city names), in order of appearance. */
function detectRoute(text: string): string | null {
  const found: string[] = [];
  const lower = text.toLowerCase();
  const tokens = lower.match(/[a-z]+/g) || [];
  const known = new Set(Object.values(CITY_TO_IATA));
  for (const t of tokens) {
    if (CITY_TO_IATA[t]) found.push(CITY_TO_IATA[t]);
    else if (t.length === 3 && known.has(t.toUpperCase())) found.push(t.toUpperCase());
  }
  const unique = found.filter((c, i) => found.indexOf(c) === i);
  return unique.length >= 2 ? `${unique[0]}-${unique[1]}` : null;
}

export const aiService = {
  getAIStatus() {
    const ds = ingestionMonitor.getDataSource();
    return {
      configured: aiConfig.isConfigured,
      provider: aiConfig.isConfigured ? 'Google Gemini' : 'AeroNex deterministic analytics',
      model: aiConfig.isConfigured ? aiConfig.model : 'rule-based',
      status: aiConfig.isConfigured ? 'healthy' : 'fallback',
      cachedEntries: aiCache.size,
      rateLimitPerMinute: aiConfig.rateLimitPerMinute,
      dataMode: ds.mode,
    };
  },

  async predictFare(routeKey: string): Promise<PredictionResult> {
    const cacheKey = `predict_${routeKey}`;
    const cached = getFromCache<PredictionResult>(cacheKey);
    if (cached) return cached;

    const ev = gatherEvidence(routeKey);
    const metrics = liveDataStore.getMetrics();
    const enoughHistory = ev.fares.length >= MIN_HISTORY_FOR_TREND;

    // Momentum projection: half of the observed drift, capped, and only with enough history.
    const projected = enoughHistory ? Math.max(-10, Math.min(10, ev.changePct * 0.5)) : 0;
    const direction: PredictionResult['direction'] = Math.abs(projected) < 0.5 ? 'stable' : projected > 0 ? 'increase' : 'decrease';
    const belowAvg = ev.avg ? ((ev.currentFare - ev.avg) / ev.avg) * 100 : 0;

    let action: PredictionResult['recommendedAction'] = 'monitor';
    if (enoughHistory) {
      if (direction === 'increase') action = 'book_soon';
      else if (direction === 'decrease') action = 'wait';
      else action = belowAvg <= -2 ? 'book_now' : 'monitor';
    }

    const result: PredictionResult = {
      route: routeKey,
      currentFare: ev.currentFare,
      predictedFare: Math.round(ev.currentFare * (1 + projected / 100)),
      direction,
      predictedChangePercent: parseFloat(Math.abs(projected).toFixed(1)),
      // Reflects how much history we hold, not a calibrated probability.
      confidence: enoughHistory ? parseFloat(Math.min(0.75, 0.3 + ev.fares.length * 0.02).toFixed(2)) : 0.2,
      recommendedAction: action,
      bestBookingWindow: 'Not derived from observed data (AeroNex does not yet hold departure-date fare curves)',
      reason: enoughHistory
        ? `Across ${ev.fares.length} observations the fare moved ${pct(ev.changePct)} (${inr(ev.min)}–${inr(ev.max)}). The current fare is ${pct(belowAvg)} versus its recent average of ${inr(ev.avg)}.`
        : `Only ${ev.fares.length} observation${ev.fares.length === 1 ? '' : 's'} recorded for ${routeKey}; at least ${MIN_HISTORY_FOR_TREND} are needed before a trend can be estimated.`,
      disclaimer: 'Estimates based on observed fares only. Not guaranteed. Not a booking guarantee.',
      explanation: {
        price: enoughHistory
          ? `Current fare ${inr(ev.currentFare)}; recent range ${inr(ev.min)}–${inr(ev.max)}, average ${inr(ev.avg)}. Fare volatility (std-dev / mean) is ${ev.volatilityPct.toFixed(1)}%.`
          : `Current fare ${inr(ev.currentFare)}. Not enough history to characterise the price range.`,
        timing: 'No departure-date fare history is available, so no booking-window advice is derived from data. Prices for near-dated flights are generally more volatile.',
        route: `Route ${routeKey}. National airfare index is ${metrics.airfareIndex.value} (${pct(metrics.airfareIndex.change)} since last refresh).`,
      },
      dataUsed: [
        `${ev.fares.length} observed fares for ${routeKey}${ev.observedSince ? ` since ${new Date(ev.observedSince).toLocaleString('en-IN')}` : ''}`,
        'National airfare index and latest refresh delta',
        dataModeNote(),
      ],
      caveats: [
        'Projection is a damped extrapolation of recent movement, not a model of airline pricing.',
        'Confidence reflects how much history is stored, not a statistical probability.',
        ...(ingestionMonitor.getDataSource().mode === 'simulated' ? ['The underlying feed is simulated; do not use this for real purchase decisions.'] : []),
      ],
      source: 'deterministic',
    };

    const gemini = await askGemini(`${aiConfig.systemPrompt}

TASK: Rewrite the reasoning for a fare outlook on route "${routeKey}". Do NOT change any numbers.
VERIFIED DATA (only source of truth):
${JSON.stringify({
  route: routeKey,
  currentFare: ev.currentFare,
  observations: ev.fares.length,
  min: ev.min,
  max: ev.max,
  average: Math.round(ev.avg),
  changeOverWindowPercent: parseFloat(ev.changePct.toFixed(2)),
  volatilityPercent: parseFloat(ev.volatilityPct.toFixed(2)),
  nationalIndex: metrics.airfareIndex,
  dataMode: ingestionMonitor.getDataSource().mode,
})}

Return JSON: { "reason": "2 sentences grounded only in the data above", "price": "string", "timing": "string (say data is unavailable if so)", "route": "string" }`) as any;
    if (gemini && typeof gemini.reason === 'string') {
      result.reason = gemini.reason;
      result.explanation = {
        price: typeof gemini.price === 'string' ? gemini.price : result.explanation!.price,
        timing: typeof gemini.timing === 'string' ? gemini.timing : result.explanation!.timing,
        route: typeof gemini.route === 'string' ? gemini.route : result.explanation!.route,
      };
      result.source = 'gemini';
    }

    const validated = predictionOutputSchema.safeParse(result);
    const final = validated.success ? validated.data : result;
    setInCache(cacheKey, final, 2);
    return final;
  },

  async analyzeRoute(routeKey: string): Promise<RouteAnalysisResult> {
    const cacheKey = `route_analysis_${routeKey}`;
    const cached = getFromCache<RouteAnalysisResult>(cacheKey);
    if (cached) return cached;

    const ev = gatherEvidence(routeKey);
    const enough = ev.fares.length >= MIN_HISTORY_FOR_TREND;
    const risk: RouteAnalysisResult['volatilityRisk'] = ev.volatilityPct < 1.5 ? 'Low' : ev.volatilityPct < 4 ? 'Moderate' : 'High';
    const vsAvg = ev.avg ? ((ev.currentFare - ev.avg) / ev.avg) * 100 : 0;

    const result: RouteAnalysisResult = {
      route: routeKey,
      currentSituation: `The latest observed fare on ${routeKey} is ${inr(ev.currentFare)}${
        ev.previousFare ? ` (previously ${inr(ev.previousFare)})` : ''
      }. ${dataModeNote()}`,
      priceTrend: enough
        ? `${pct(ev.changePct)} across ${ev.fares.length} observations (range ${inr(ev.min)}–${inr(ev.max)}).`
        : `Insufficient history (${ev.fares.length} observation${ev.fares.length === 1 ? '' : 's'}) to describe a trend.`,
      volatilityRisk: risk,
      recommendation: !enough
        ? 'Keep monitoring: wait for more observations before acting on this route.'
        : vsAvg <= -2
          ? `The fare is ${Math.abs(vsAvg).toFixed(1)}% below its recent average, which is a comparatively good price to lock in if your dates are fixed.`
          : vsAvg >= 2
            ? `The fare is ${vsAvg.toFixed(1)}% above its recent average; consider setting a price alert instead of booking immediately.`
            : 'The fare is close to its recent average. A price alert lets you act if it drops.',
      bestBookingWindow: 'Not derived from observed data',
      explanation: `Volatility risk is ${risk} (fare std-dev is ${ev.volatilityPct.toFixed(1)}% of the mean). Analysis uses only fares AeroNex has observed for this route; it does not include seat inventory, fare classes or departure-date effects.`,
      stats: {
        observations: ev.fares.length,
        minFare: ev.fares.length ? ev.min : null,
        maxFare: ev.fares.length ? ev.max : null,
        averageFare: ev.fares.length ? Math.round(ev.avg) : null,
        currentFare: ev.currentFare,
      },
      source: 'deterministic',
    };

    const gemini = await askGemini(`${aiConfig.systemPrompt}

TASK: Summarise the market situation for route "${routeKey}" using ONLY this verified data. Do not invent numbers.
${JSON.stringify(result.stats)}
Trend: ${result.priceTrend}
Volatility: ${risk}

Return JSON: { "currentSituation": "string", "recommendation": "string", "explanation": "string" }`) as any;
    if (gemini && typeof gemini.currentSituation === 'string') {
      result.currentSituation = gemini.currentSituation;
      if (typeof gemini.recommendation === 'string') result.recommendation = gemini.recommendation;
      if (typeof gemini.explanation === 'string') result.explanation = gemini.explanation;
      result.source = 'gemini';
    }

    const validated = routeAnalysisOutputSchema.safeParse(result);
    const final = validated.success ? validated.data : result;
    setInCache(cacheKey, final, 2);
    return final;
  },

  async recommendBookingWindow(routeKey: string) {
    const analysis = await this.analyzeRoute(routeKey);
    return {
      route: routeKey,
      bestBookingWindow: analysis.bestBookingWindow,
      recommendation: analysis.recommendation,
      basis: analysis.stats,
    };
  },

  async analyzeRegionalTrend(region: string) {
    const match = liveDataStore.getRegionalIndices().find(r => r.region.toLowerCase() === region.toLowerCase());
    if (!match || match.value === 0) {
      throw new HttpError(404, `No regional index is available for ${region}. Tracked regions: North, South, East, West.`);
    }
    return {
      region,
      index: match.value,
      change: match.change,
      analysis: `The ${region} regional index stands at ${match.value} (${pct(match.change)} since the last refresh), where 100 is the baseline fare basket for that region's tracked corridors. ${dataModeNote()}`,
    };
  },

  /** Free-text Q&A grounded strictly in observed data. */
  async answerQuestion(message: string, routeHint?: string) {
    const route = routeHint?.toUpperCase() || detectRoute(message);
    const metrics = liveDataStore.getMetrics() as any;
    if (metrics.hasData === false) {
      return { answer: 'AeroNex has not observed any fares yet, so there is nothing to answer from. Try again after the next data refresh.', source: 'deterministic' as const, dataUsed: [] as string[] };
    }
    const regional = liveDataStore.getRegionalIndices().filter(r => r.value > 0);
    const movers = liveDataStore.getTopRouteChanges();
    const q = message.toLowerCase();
    const dataUsed: string[] = [];

    let routeFacts: { analysis: RouteAnalysisResult; prediction: PredictionResult } | null = null;
    if (route) {
      try {
        routeFacts = { analysis: await this.analyzeRoute(route), prediction: await this.predictFare(route) };
        dataUsed.push(`Observed fares for ${route}`);
      } catch (err: any) {
        if (err?.status === 404) {
          return { answer: err.message + ' AeroNex currently tracks DEL, BOM, BLR, HYD, MAA, CCU and GOI corridors.', source: 'deterministic' as const, route, dataUsed };
        }
        throw err;
      }
    }

    // Grounded LLM answer when Gemini is configured.
    const context = { route, routeFacts, metrics, regional, movers, dataMode: ingestionMonitor.getDataSource().mode };
    const llm = (await askGemini(`${aiConfig.systemPrompt}

TASK: Answer the user's question using ONLY the verified data below. If the data cannot answer it, say so plainly. Keep it under 120 words.
QUESTION: ${JSON.stringify(message)}
VERIFIED DATA: ${JSON.stringify(context)}

Return JSON: { "answer": "string" }`)) as any;
    if (llm && typeof llm.answer === 'string' && llm.answer.trim()) {
      dataUsed.push('National index, regional indices and latest route movements');
      return { answer: llm.answer.trim(), source: 'gemini' as const, route: route || undefined, dataUsed };
    }

    // Deterministic answers.
    if (routeFacts) {
      const { analysis: a, prediction: p } = routeFacts;
      return {
        answer: `${a.currentSituation} ${a.priceTrend} Volatility: ${a.volatilityRisk}. ${a.recommendation} Outlook: ${p.reason}`,
        source: 'deterministic' as const,
        route: route || undefined,
        dataUsed,
      };
    }
    if (/(cheap|lowest|low fare|least)/.test(q)) {
      dataUsed.push('Lowest observed fare');
      return { answer: `The lowest fare currently observed is ${inr(metrics.secondary.lowestFare.fare)} on ${metrics.secondary.lowestFare.route}.`, source: 'deterministic' as const, dataUsed };
    }
    if (/(expensive|highest|costly|most)/.test(q)) {
      dataUsed.push('Highest observed fare');
      return { answer: `The highest fare currently observed is ${inr(metrics.secondary.highestFare.fare)} on ${metrics.secondary.highestFare.route}.`, source: 'deterministic' as const, dataUsed };
    }
    if (/(region|north|south|east|west)/.test(q) && regional.length) {
      dataUsed.push('Regional indices');
      return { answer: 'Regional indices (baseline 100): ' + regional.map(r => `${r.region} ${r.value} (${pct(r.change)})`).join(', ') + '.', source: 'deterministic' as const, dataUsed };
    }
    if (/(index|inflation|cpi|market|overall|trend)/.test(q)) {
      dataUsed.push('National airfare index');
      return { answer: `The national airfare index is ${metrics.airfareIndex.value} (${pct(metrics.airfareIndex.change)} since the last refresh); the average observed fare is ${inr(metrics.averageFare.value)} across ${metrics.routesTracked.value} routes. ${dataModeNote()}`, source: 'deterministic' as const, dataUsed };
    }
    if (/(move|change|drop|rise|rose|fell|spike)/.test(q) && movers.length) {
      dataUsed.push('Latest route movements');
      return { answer: 'Biggest moves on the latest refresh: ' + movers.map(m => `${m.route} ${pct(m.change)}`).join(', ') + '.', source: 'deterministic' as const, dataUsed };
    }
    return {
      answer: "I can answer from the fares AeroNex has observed. Try naming a corridor (for example \"Delhi to Mumbai\" or \"DEL-BLR\"), or ask about the airfare index, the cheapest or most expensive route, regional indices, or the biggest recent moves.",
      source: 'deterministic' as const,
      dataUsed,
    };
  },

  async generateDashboardInsights(): Promise<any[]> {
    const cacheKey = 'dashboard_insights';
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    const metrics = liveDataStore.getMetrics();
    if (!(metrics as any).hasData) return [];
    const regional = liveDataStore.getRegionalIndices().filter(r => r.value > 0);
    const movers = liveDataStore.getTopRouteChanges();
    const now = new Date().toISOString();
    const insights: any[] = [];

    insights.push({
      id: 'index',
      type: 'summary',
      title: 'National Airfare Index',
      content: `The index is ${metrics.airfareIndex.value} (${pct(metrics.airfareIndex.change)} since the last refresh) across ${metrics.routesTracked.value} tracked routes; average fare ${inr(metrics.averageFare.value)}. ${dataModeNote()}`,
      severity: 'low',
      timestamp: now,
    });

    const top = movers.find(m => m.change !== 0);
    if (top) {
      insights.push({
        id: 'mover',
        type: Math.abs(top.change) >= 5 ? 'alert' : 'insight',
        title: `Biggest mover: ${top.route.replace('-', ' → ')}`,
        content: `${top.route} moved ${pct(top.change)} on the latest refresh to ${inr(top.currentFare)}.`,
        severity: Math.abs(top.change) >= 5 ? 'high' : 'medium',
        timestamp: now,
      });
    }

    if (regional.length) {
      const lead = [...regional].sort((a, b) => b.value - a.value)[0];
      insights.push({
        id: 'region',
        type: 'insight',
        title: `${lead.region} region leads the index`,
        content: `${lead.region} is highest at ${lead.value} (${pct(lead.change)}). Regional indices compare current fares with each region's baseline basket.`,
        severity: 'low',
        timestamp: now,
      });
    }

    const gemini = (await askGemini(`${aiConfig.systemPrompt}

TASK: Write ONE short additional insight (max 2 sentences) grounded only in this data. Do not invent numbers.
Metrics: ${JSON.stringify(metrics)}
Regional: ${JSON.stringify(regional)}
Movers: ${JSON.stringify(movers)}

Return JSON: { "title": "string", "content": "string" }`)) as any;
    if (gemini && typeof gemini.title === 'string' && typeof gemini.content === 'string') {
      insights.push({ id: 'ai', type: 'recommendation', title: gemini.title, content: gemini.content, severity: 'low', timestamp: now, source: 'gemini' });
    }

    setInCache(cacheKey, insights, 5);
    return insights;
  },
};
