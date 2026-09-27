# Deployment

The system is four separately deployed parts. They are separate on purpose: the scraper needs a **persistent process
with a browser**, which does not fit a serverless function, while the frontend is a static site.

| Part | What | Suggested host | Notes |
|---|---|---|---|
| Frontend | `npm run build` -> `dist/` | Vercel / any static host | `VITE_API_BASE_URL`, Supabase anon key |
| AeroNex server | `server/` (`npm run build && npm start`) | Render / Railway / Fly / a VM | needs a persistent disk for `AERONEX_DATA_DIR` (per-user data) |
| Scraper API | `python run_api.py` | same private network as the AeroNex server | **HTTPS + `SCRAPER_API_TOKEN`**; the server calls it, browsers never do |
| Scraper worker | `python run_worker.py` | a small always-on VM/container with Chromium | 1 process is enough; it holds the browser and the schedule |
| Database | Postgres (Supabase) for the scraper; Supabase for accounts | managed | apply `server/supabase/migrations/*` for accounts |

## Order of operations

1. **Database.** Create/choose a Postgres database and set `DATABASE_URL` for the scraper. The scraper creates its own tables on
   first connect (`app/schema.py`). **The Postgres path has NOT been run.** The code is written to be portable (one DDL translated for
   Postgres, `ON CONFLICT`, `RETURNING`, window functions) and an opt-in test exists, but this machine's Application Control policy
   blocked running a local Postgres, so no Postgres run happened. Before relying on it, point `AERONEX_TEST_PG_URL` at an empty
   throwaway database and run `pytest tests/test_postgres.py`, then run `python run_worker.py --once` against it.
2. **Scraper worker + API** (same image, two commands):
   ```bash
   docker build -t aeronex-scraper ../AeroNex/Backend      # python:3.11 + `playwright install --with-deps chromium`
   AERONEX_ENV=production SCRAPER_API_TOKEN=... DATABASE_URL=... AERONEX_BOT_CONTACT=https://your-site \
     docker run aeronex-scraper python run_api.py 8000
   DATABASE_URL=... AERONEX_BOT_CONTACT=https://your-site docker run aeronex-scraper python run_worker.py
   ```
   Keep the API on a private network or behind HTTPS; it refuses to start in production without a token.
3. **AeroNex server.** `NODE_ENV=production`, `SCRAPER_API_URL`, `SCRAPER_API_TOKEN`, `SUPABASE_*`, `CORS_ORIGINS`,
   `TRUST_PROXY=1`, `ADMIN_EMAILS`. With no fare source configured in production it reports "no data source" rather than simulating.
4. **Frontend.** Set `VITE_API_BASE_URL` to the server's URL and deploy `dist/`.
5. **Supabase security.** Apply `server/supabase/migrations/003_secure_rls.sql`, then run Supabase's security advisor.

## Checklist before you call it live

- [ ] `SCRAPER_API_TOKEN` set on the scraper API and the server; the API is not reachable without it
- [ ] `AERONEX_BOT_CONTACT` set so the source's operators can reach you
- [ ] You have reviewed the fare source's terms of service (robots.txt is a technical signal, not a licence)
- [ ] `GET /api/scraper/status` (signed in) shows the worker running and the source `healthy`
- [ ] `GET /api/data-status` says `live` with a recent `ageSec`
- [ ] The database is backed up; `fare_observations` grows ~2,500 rows per 24-search cycle (retention is not automated yet)

## Scheduled alternative

If you cannot run a persistent worker, `python run_worker.py --once` on a schedule (the scraper repo ships a GitHub Actions
workflow) refreshes the standard routes. On-demand user searches then wait for the next run, so the UI will show stored results
flagged by age instead of fresh ones.
