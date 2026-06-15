# BetRight Backend — Prediction & ML

The prediction stack behind the mobile app. Two services plus a Postgres database + Redis:

```
RN app ──► .NET BFF (/v1/*) ──► Python ML service (/internal/*) ──► Postgres
 camelCase    envelope, Redis cache,    Dixon-Coles + Elo + form,        predictions, ratings,
 DTOs         snake→camel mapping,      confidence, rule explanations,    results, users, saved,
              Dapper user-domain        store-and-serve + scheduler       favourites, notifications
                                        ▲
              data ingest ──────────────┘ football-data.org → competitions/teams/fixtures/matches
              post-match loop: results → Brier/log-loss → Elo update
```

The app never calls the ML service directly — only the BFF does (architecture guardrail). The
**ML service** owns the prediction-domain tables; the **BFF** owns the user-domain tables (Dapper)
in the same Postgres. **Alembic** (in the ML service) is the single schema authority for both.

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

SQLite path — no Docker needed (user-domain endpoints need Postgres, see below):

```bash
cd services/ml-prediction
pip install -e .                      # fastapi uvicorn pydantic sqlalchemy alembic apscheduler httpx
export DATABASE_URL=sqlite+pysqlite:///./dev.db

python -m alembic upgrade head        # create schema (prediction + user domains)
python -m app.data.seed               # teams, 2 seasons of results, fixtures, Elo, dev user
python -m app.jobs.predict_batch      # persist predictions for upcoming fixtures
python -m uvicorn app.main:app --port 8001
```

```bash
cd services/bff
dotnet run --project BetRight.Bff --urls http://localhost:8080
# Ml:BaseUrl defaults to http://localhost:8001; set ConnectionStrings__Postgres +
# ConnectionStrings__Redis to enable the user-domain endpoints (favourites/saved/…).
```

Point the app at it: in `betright-mobile/.env` set `EXPO_PUBLIC_USE_MOCK=false` and
`EXPO_PUBLIC_API_URL=http://localhost:8080`, then `npm run web`.

## Run with Postgres + Redis (full surface)

```bash
docker compose -f infra/docker-compose.yml up -d postgres redis   # host Postgres → 5433
cd services/ml-prediction
export DATABASE_URL="postgresql+psycopg://betright:betright@localhost:5433/betright"
python -m alembic upgrade head && python -m app.data.seed && python -m app.jobs.predict_batch
SCHEDULER_ENABLED=true python -m uvicorn app.main:app --port 8001   # background batch + post-match
```

```bash
cd services/bff
ConnectionStrings__Postgres="Host=localhost;Port=5433;Database=betright;Username=betright;Password=betright" \
ConnectionStrings__Redis="localhost:6379" Ml__BaseUrl="http://localhost:8001" \
  dotnet run --project BetRight.Bff --urls http://localhost:8080
```

The dev user is `dev-user` (the `X-User-Id` header overrides it; real JWT auth is a later step).

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

BFF (`/v1/*`, app-facing, camelCase envelope, Redis-cached reads, per-IP rate limited,
`X-Request-Id` correlation):
- Auth: `auth/register|login|refresh|logout` (POST) — JWT + rotating refresh tokens
- Feed: `mobile/home`, `mobile/favourites`, `matches`, `matches/{id}/detail`,
  `matches/{id}/stream` (SSE), `predictions/manual` (POST → prediction + breakdown),
  `models/performance`, `teams/{id}`, `competitions/{id}`
- User: `users/me/profile`, `users/me/preferences` (PUT), `users/me/favourites` (POST),
  `users/me/compliance` (PUT), `users/me/export` (GET), `users/me` (DELETE),
  `users/me/saved-predictions` (GET/POST/DELETE)
- Notifications: `notifications` (GET), `notifications/unread-count` (GET),
  `notifications/{id}/read` (PUT), `notifications/preferences` (PUT)

Auth: real JWT (`sub` claim). A dev seam (`X-User-Id`, default `dev-user`) stays active
while `Auth:AllowDevUser` is true; set it false in production to require a token.

ML (`/internal/*`, BFF-only, snake_case): `predict`, `predict/manual`, `predictions/upcoming`,
`teams/{id}`, `competitions/{id}`, `models/performance`, `jobs/predict|postmatch|ingest`.

## Notes / next

- BFF targets `net10.0` (this env's SDK); the architecture doc specifies .NET 8 — a one-line TFM
  change. Cache is Redis when `ConnectionStrings:Redis` is set, else in-memory.
- **Store-and-serve:** the batch job + scheduler persist predictions; reads serve the stored row
  (recompute only on a miss). Manual predictions are computed on demand (not stored).
- **Auth:** real JWT (PBKDF2 hashes, rotating refresh tokens). Tokens live in the app's
  SecureStore. Set `Auth:AllowDevUser=false` to disable the dev `X-User-Id` seam in prod.
- **Calibration:** a temperature derived from scored predictions softens/sharpens probabilities
  before serving (`model_versions.calibration_temp`). The ML ensemble can replace it later.

### Needs external input (built to the seam, not faked)
- **Live data:** set `FOOTBALL_DATA_API_KEY`, then `python -m app.data.ingest` (or
  `POST /internal/jobs/ingest`, also scheduled daily when the key is present). Until then the
  offline seed is the data source.
- **ML ensemble (Phase 7):** LightGBM/XGBoost with time-based CV + a model registry drops into the
  existing ensemble seam — flip the ML weight from 0 to live; nothing downstream changes. Needs
  `numpy`/`lightgbm` (not on this env's Python 3.14) + seasons of real data.
- **Push notifications:** the in-app notification feed + unread badge are live; real delivery needs
  FCM/Expo credentials and a dev build. SSE (`/v1/matches/{id}/stream`) is implemented; the app
  uses polling (`useMatchDetail(id, { live: true })`) as the portable fallback.
- **Deployment:** local `docker-compose` only; cloud hosting + store signing are out of scope.
