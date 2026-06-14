---
name: database-schema-skill
description: BetRight PostgreSQL schema, migration, indexing, audit, prediction history, and data retention standards.
---

# Database Schema Skill

## Core tables

```text
users
user_preferences
sports
competitions
teams
players
fixtures
matches
lineups
player_availability
predictions
prediction_results
prediction_errors
team_rating_history
model_versions
saved_predictions
notifications
audit_logs
```

## Rules

- Use UUIDs or stable IDs.
- Keep prediction snapshots immutable.
- Store model version for every prediction.
- Add indexes for read-heavy screens.
- Do not store secrets in plain text.
- Audit sensitive state changes.

Read `tables.md` and `migrations.md`.
