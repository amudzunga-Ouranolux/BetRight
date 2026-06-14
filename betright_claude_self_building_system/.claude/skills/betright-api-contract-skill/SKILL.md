---
name: betright-api-contract-skill
description: BetRight API contract standards, response envelopes, endpoint rules, DTO patterns, and mobile BFF requirements.
---

# BetRight API Contract Skill

## Rule

The mobile app calls the .NET BFF only.

```text
Mobile App -> .NET BFF -> Core Services -> Python ML Service
```

The mobile app must not call the ML service directly.

## Response envelope

```json
{
  "data": {},
  "meta": {
    "request_id": "req_123",
    "generated_at": "2026-06-12T12:00:00Z",
    "cache_status": "hit"
  },
  "errors": []
}
```

## Core endpoints

Read `endpoints.md` and `response-patterns.md`.
