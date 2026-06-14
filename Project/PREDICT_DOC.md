# predict.py — How It Works

## Overview

`predict.py` is a football match prediction engine. Given two teams, it calculates the probability of each possible match outcome (home win, draw, away win) along with betting-relevant stats like over/under goals, both-teams-to-score (BTTS), and expected goals (xG). It then runs those predictions across a set of hardcoded fixtures and prints the full results as JSON.

---

## Team Database (`TEAM_STATS`)

Each team is stored with three values:

| Field | Meaning |
|-------|---------|
| `att` | Average goals scored per game (attack strength) |
| `def` | Average goals conceded per game (defensive weakness — lower is better) |
| `tier` | Quality tier (1 = elite, 2 = mid, 3 = lower) |

The database covers ~80 teams across six competitions: World Cup, Champions League, Premier League, La Liga, AFCON, and the South African PSL.

Teams not in the database fall back to `{"att": 1.3, "def": 1.20, "tier": 3}` — a generic mid-lower side.

---

## Prediction Model (`predict_match`)

### 1. Expected Goals (xG)

The model calculates an expected goals figure for each team using a Dixon-Coles–style formula:

```
lambda_home = home_att  × (away_def / 1.2) × home_boost
lambda_away = away_att  × (home_def / 1.2)
```

- `away_def / 1.2` normalises the opponent's defensive weakness against a baseline of 1.2 goals conceded.
- `home_boost` applies a 15% attacking bonus to the home team (`HOME_ADVANTAGE = 1.15`). For neutral-venue matches this is set to 1.0.
- Both values are clamped to `[0.3, 5.0]` to avoid extreme outputs.

### 2. Score Probability Matrix

Using the Poisson distribution, the model calculates the probability of each team scoring 0–10 goals. An 11×11 matrix is built where `matrix[i][j]` = probability the home team scores `i` and away team scores `j`.

### 3. Match Outcome Probabilities

- **Home win**: sum of all cells below the diagonal (`i > j`)
- **Draw**: sum of the diagonal cells (`i == j`)
- **Away win**: sum of all cells above the diagonal (`i < j`)

These are normalised to sum to 100%.

### 4. Over/Under Goals

The score matrix is collapsed into a 1D array of total-goals probabilities. Thresholds:

| Market | Logic |
|--------|-------|
| Over 1.5 | ≥ 2 total goals |
| Over 2.5 | ≥ 3 total goals |
| Over 3.5 | ≥ 4 total goals |
| Under 2.5 | complement of Over 2.5 |
| Under 1.5 | complement of Over 1.5 |

### 5. Both Teams to Score (BTTS)

```
P(home scores) = 1 - Poisson(0, lambda_home)
P(away scores) = 1 - Poisson(0, lambda_away)
BTTS Yes       = P(home scores) × P(away scores)
```

### 6. Confidence Score

A single integer from 40–95 representing how decisive the predicted outcome is:

```
confidence = 40 + (max_outcome_prob - 0.33) / 0.67 × 60
```

At a perfectly even three-way split (33% each), confidence = 40. At near-certainty (100%), confidence = 100, capped at 95.

---

## Output Format

`predict_match` returns a dict with all values as rounded percentages:

```json
{
  "home": "Arsenal",
  "away": "Chelsea",
  "meta": "Matchday 36 · May 10",
  "homeWin": 52,
  "draw": 24,
  "awayWin": 24,
  "over15": 84,
  "over25": 61,
  "over35": 37,
  "under25": 39,
  "bttsYes": 58,
  "bttsNo": 42,
  "confidence": 68,
  "xgHome": 1.73,
  "xgAway": 1.42
}
```

---

## Fixtures (`FIXTURES`)

Six competitions are hardcoded with 10 fixtures each:

| ID | Competition |
|----|-------------|
| `wc2026` | 2026 FIFA World Cup (group stage + knockout) |
| `ucl` | UEFA Champions League (R16 through semi-finals) |
| `epl` | Premier League (Matchdays 36–38) |
| `laliga` | La Liga (Matchdays 34–37) |
| `afcon` | Africa Cup of Nations (group through final) |
| `psl` | South African Premier Soccer League (Matchdays 28–30) |

Each fixture is a tuple: `(home, away, label, neutral)`. The `neutral` flag suppresses the home advantage multiplier for matches played at a neutral venue.

---

## Running It

```bash
python predict.py
```

Outputs a single JSON object keyed by competition ID, each containing an array of prediction objects for all fixtures in that competition.
