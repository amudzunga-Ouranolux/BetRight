# Performance and Peak Load Plan

## Key principle

Read-heavy endpoints must be cached and cheap.

## High-risk endpoints

```text
GET /v1/mobile/home
GET /v1/mobile/favourites
GET /v1/matches
GET /v1/matches/{fixtureId}/detail
POST /v1/predictions/manual
```

## Peak-load scenarios

```text
- app open spike after big notification
- popular match kickoff
- lineups confirmed
- live match red card/update
- manual prediction burst
```

## Recommended strategy

```text
- Redis cache for home/matches/detail
- immutable prediction snapshots
- async queue for expensive prediction generation
- ML service rate limits
- DB indexes on fixture/date/user favourites
- CDN for static assets
- background pre-generation for known fixtures
```

## Release gate

No release if:
- p95 is above target without explanation;
- error rate > 1%;
- DB CPU/connection pool saturates in test;
- cache hit rate is unexpectedly low for read-heavy endpoints.
