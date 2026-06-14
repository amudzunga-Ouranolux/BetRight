# BetRight Backend — Prediction & ML

The prediction stack behind the mobile app. Two services plus a Postgres database:

```
RN app ──► .NET BFF (/v1/*) ──► Python ML service (/internal/*) ──► Postgres
 camelCase    envelope, cache,        Dixon-Coles + Elo + form,        predictions,
 DTOs         snake→camel mapping     confidence, rule explanations     ratings, results
                                      ▲
              data ingest ───────────┘ football-data.org → competitions/teams/fixtures/matches
              post-match loop: results → Brier/log-loss → Elo update
```

The app never calls the ML service directly — only the BFF does (architecture guardrail).

## What's built (formula-engine milestone)

- **Statistical model:** Poisson **Dixon-Coles** score matrix (low-score τ correction) →
  1X2, over/under, BTTS, clean sheets, top scorelines, xG. Pure Python (`app/engine/`).
- **Team-rating model:** **Elo** (home-field + goal-margin multiplier), updated post-match.
- **Form:** time-decayed (30-day half-life) attack/defence strengths from match history.
- **Ensemble seam:** weighted combine (statistical/ml/rating/lineup/context). Only statistical
  + rating exist today, so weights renormalise over present models; adding ML later is one call.
- **Confidence engine:** the skill's weighted formula (separation, model agreement, data quality,
  team stability, …), capped < 100, with a data-quality score.
- **Explanations:** rule-based headline/summary/key-reasons/risk-factors (responsible-use wording).
- **Learning loop:** scores finished predictions (Brier, log-loss, correctness), updates Elo,
  maintains rolling model-performance metrics.
- **Anti-leakage:** every feature is as-of joined by kickoff and stored in an immutable snapshot.

## Run it locally (offline, no API key)

```bash
cd services/ml-prediction
pip install -e .                      # or: pip install fastapi uvicorn pydantic sqlalchemy httpx
export DATABASE_URL=sqlite+pysqlite:///./dev.db

python -m app.data.seed               # competitions, teams, 2 seasons of results, fixtures + Elo
python -m app.jobs.predict_batch      # predictions for upcoming fixtures
python -m uvicorn app.main:app --port 8001
```

```bash
cd services/bff
dotnet run --project BetRight.Bff --urls http://localhost:8080
# Ml:BaseUrl defaults to http://localhost:8001 (override with env Ml__BaseUrl)
```

Point the app at it: in `betright-mobile/.env` set `EXPO_PUBLIC_USE_MOCK=false` and
`EXPO_PUBLIC_API_URL=http://localhost:8080`, then `npm run web`.

## Run with real data (football-data.org)

Get a free key at <https://www.football-data.org/>, then:

```bash
cd services/ml-prediction
export FOOTBALL_DATA_API_KEY=your_key
export DATABASE_URL=postgresql+psycopg://betright:betright@localhost:5432/betright
python -m app.data.ingest             # fixtures + historical results
python -m app.jobs.postmatch          # bootstrap Elo from history
python -m app.jobs.predict_batch
```

## Docker (full stack)

```bash
docker compose -f infra/docker-compose.yml up
# postgres (migrations auto-applied) + redis + ml (:8001) + bff (:8080)
```

## Tests

```bash
cd services/ml-prediction && pytest      # engine math, confidence cap, anti-leakage, scoring
cd services/bff && dotnet test           # snake→camel mapping, envelope, quick-flags
```

## API surface

BFF (`/v1/*`, app-facing, camelCase envelope): `mobile/home`, `matches`,
`matches/{id}/detail`, `predictions/manual` (POST), `models/performance`.

ML (`/internal/*`, BFF-only, snake_case): `predict`, `predict/manual`,
`predictions/upcoming`, `models/performance`.

## Notes / next

- BFF targets `net10.0` (this env's SDK); the architecture doc specifies .NET 8 — a one-line TFM
  change. Cache is in-memory for dev; Redis is wired in compose for prod.
- **Phase 7 (later):** LightGBM/XGBoost ensemble with time-based CV, calibration, and a model
  registry drops into the existing ensemble seam — flip the ML weight from 0 to live; nothing
  downstream changes. See `Docs/Product breakdown docs/` and the `ml-training-pipeline-skill`.
