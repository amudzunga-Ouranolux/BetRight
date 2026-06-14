---
name: performance-load-skill
description: BetRight performance, peak-load, caching, database indexing, load testing, latency budgets, and scalability standards.
---

# Performance and Load Skill

## Performance goals

```text
Home API p95 < 500 ms cached
Match detail p95 < 800 ms cached
Manual prediction p95 < 2.5 sec MVP
Live event delivery < 2 sec
Mobile app cold start < 3 sec target
```

## Load strategy

- Cache read-heavy endpoints.
- Use Redis for home/matches/detail.
- Use async prediction generation where needed.
- Store immutable prediction snapshots.
- Use queue for notification fan-out.
- Protect ML service with rate limits and caching.

Read `load-testing-plan.md`.
