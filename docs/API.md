# AeroNex server API - flight data

Base URL: the AeroNex server (`VITE_API_BASE_URL`). These endpoints are read from the stored, validated fares of the
scraper service; they never scrape and never generate values.

| | |
|---|---|
| **Success** | `{ "data": ..., "meta": { ... } }` |
| **Failure** | `{ "success": false, "error": "<friendly message>", "code": "<stable code>" }` |
| **Auth** | Flight-data reads are public. `/api/scraper/*` requires a signed-in user (`Authorization: Bearer <Supabase access token>`); starting a scrape additionally requires `ADMIN_EMAILS`. |
| **Rate limits** | 300 requests/min per IP overall; `GET /api/flights/search` 40/min per IP (it can create scrape work). |
| **Freshness** | Every response that carries fares has `meta.freshness` (`live/delayed/stale/unavailable`) and a timestamp. |
| **Pagination** | Not needed: a search is one route and one date (~100-150 flights). Histories take `hours`. |

Codes: `invalid_request`/`invalid_search` 400, `live_data_not_configured` 503 (no scraper configured),
`live_data_unavailable` 503 (scraper unreachable/timeout/error), `rate_limited` 429, `internal_error` 500.

## Flights

### `GET /api/flights/search?from=DEL&to=BOM&date=2026-10-15[&pax=1&cabin=economy&refresh=1]`
Returns the stored fares for that route/date and, if they are older than the cache window (15 min by default), queues a
refresh. `meta.status` drives the UI:

| `meta.status` | show |
|---|---|
| `pending` | progress (`meta.job.stage`: queued, fetching, parsing, validating, storing) - poll every ~1.5 s |
| `refreshing` | the stored results plus a "newer scrape is running" note - keep polling |
| `ready` | results; `meta.servedFrom` says `cache` or `fresh` |
| `ready_stale` | results flagged as older, with `meta.errorMessage` if the refresh failed |
| `failed` | nothing stored; `meta.errorMessage` is a friendly explanation, `meta.retryAfterSec` the cooldown |

Also: `meta.noFlights` (a successful search that found none - distinct from a failure), `meta.sources[]` (found / kept /
rejected per source), `meta.ageSec`, `meta.lastUpdated`. Only one adult and economy are collected; other values return `400`.

### `GET /api/flights/:id`
`{ flight, history[], priceChanges[] }` - every stored observation of one flight and each detected price change.

## Routes, history, index

| endpoint | notes |
|---|---|
| `GET /api/routes/:origin/:destination` | route intelligence (`stats`, `airlines`, `departureTimes`, `stops`, `cabins`, `trend`, `flights`); `insufficientData: true` when nothing is stored |
| `GET /api/fares/history?route=DEL-BOM[&window=15&hours=168]` | route snapshots over time |
| `GET /api/fares/trends[?hours=24]` | typical-fare change per route, biggest single-flight moves |
| `GET /api/air-price-index` | latest index, components, regional values; `meta.method` describes the calculation |
| `GET /api/air-price-index/history[?hours=720]` | index over time |
| `GET /api/data/freshness` | this server's view of the feed and the scraper's per-route freshness |
| `GET /api/data-status` | provider, mode, `freshness`, age, last error (drives every LIVE badge) |
| `GET /api/health` | service health including `services.dataSource` |

Dashboard endpoints (`/api/dashboard/metrics|routes|regional-index|chart-data|basket`, `/api/routes`, `/api/routes/:id`) keep
their existing shapes and are fed from the same stored data.

## Pipeline administration (signed-in)

* `GET /api/scraper/status` - this server's ingestion view plus the scraper's own health: per-source status, success rate,
  latency, errors by kind, rate-gate state, queue depth, worker liveness, recent jobs; `canTrigger` says whether the caller may start a scrape.
* `POST /api/scraper/trigger` - `202 { queued, alreadyQueued, message }` - jobs are **queued**, not finished. `403` for non-administrators,
  `429` if repeated within 10 s.
