# Prediction Formulas

## Expected goals

```text
home_xg =
  league_base_goal_rate
× home_attack_strength
× away_defence_weakness
× home_advantage
× recent_form_factor
× squad_availability_factor
× player_lineup_factor
× opponent_strength_factor
× tactical_matchup_factor
× psychology_factor
× fatigue_factor
× historical_factor
```

## Ensemble

```text
final_prediction =
  30% statistical_model
+ 30% ml_model
+ 15% team_rating_model
+ 15% player_lineup_model
+ 10% context_model
```

## Confidence

```text
confidence =
  25% probability_separation
+ 20% model_agreement
+ 20% data_quality
+ 15% lineup_certainty
+ 10% team_stability
+ 10% historical_accuracy
```

Confidence is capped below 100.
