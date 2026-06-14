---
name: prediction-engine-skill
description: BetRight prediction system: xG, Poisson/Dixon-Coles, Elo, player impact, ensemble, confidence, calibration, and explainability.
---

# Prediction Engine Skill

## Architecture

```text
Fixture
→ Data quality check
→ Feature snapshot
→ Team rating model
→ xG model
→ Poisson/Dixon-Coles score model
→ ML model
→ Player/lineup adjustment
→ Ensemble
→ Calibration
→ Confidence
→ Explanation
→ Prediction audit
```

## Required outputs

- home/draw/away probabilities
- xG
- likely scores
- over/under analytics
- BTTS analytics
- confidence
- data quality
- explanation
- model version

No "guaranteed" predictions.

Read `formulas.md`.
