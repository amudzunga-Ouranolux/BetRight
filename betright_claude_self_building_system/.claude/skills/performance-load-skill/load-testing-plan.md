# Load Testing Plan

Test endpoints:

```text
GET /v1/mobile/home
GET /v1/mobile/favourites
GET /v1/matches
GET /v1/matches/{id}/detail
POST /v1/predictions/manual
GET /v1/models/performance
```

Scenarios:
- app open spike;
- match day spike;
- favourite team notification spike;
- manual prediction burst;
- live match updates.
