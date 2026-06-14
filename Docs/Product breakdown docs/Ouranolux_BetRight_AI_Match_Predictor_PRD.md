# Ouranolux BetRight AI Match Predictor PRD

_Converted from: `Ouranolux_BetRight_AI_Match_Predictor_PRD(3).pdf`_

### Product Requirements Document

### BetRight AI Match Prediction Engine

Self-learning football prediction platform for outcomes, scorelines, goals, player intelligence, history and explainable ML.

Prepared for Ouranolux

Document type Product Requirements Document

Version 1.0

Date 12 June 2026

Status Draft for product and engineering review

<!-- Page 2 -->

### Document Control

Field Value

Product BetRight AI Match Prediction Engine

Owner Ouranolux

Primary audience Product, data science, software engineering, QA, leadership

Purpose Define the full prediction algorithm, data model, ML strategy, self-learning loop and product flow.

Source context Built from the current Poisson/xG predictor concept and expanded into a full hybrid AI prediction platform.

### Executive Summary

BetRight is an AI-powered football match prediction platform designed to predict match outcomes, likely scorelines, expected goals, goal markets, confidence levels and explainable match analysis. The system must not only predict who is likely to win, but explain why the outcome is likely using team strength, home and away advantage, opposition quality, recent form, historical behaviour, player profiles, injuries, suspensions, tactical matchups, psychology, competition context and previous prediction errors.

The current predictor is a good first brick: a fixed team database with attack, defence and tier, home advantage, expected goals, Poisson score matrix, home/draw/away probabilities, over/under, BTTS and confidence. The target system must upgrade this into a self-learning hybrid football intelligence engine.

`Predict -> Store -> Compare -> Learn -> Retrain -> Calibrate -> Improve`

## 1. Product Goals

- Predict home win, draw and away win probabilities.

- Predict expected goals for both teams and likely exact scorelines.

- Predict over/under goal markets and both-teams-to-score probability.

- Analyse home and away advantage dynamically per team, venue and competition.

- Adjust all performance using opposition strength rather than raw averages only.

- Learn from team history, player history, head-to-head history and previous prediction errors.

- Adjust predictions using form, injuries, suspensions, player profiles, tactics, psychology and match context.

- Explain every prediction clearly, including key reasons, risks and data quality.

- Track accuracy over time and improve through rating updates, retraining and calibration.

## 2. Current System Baseline

The current version should be preserved as the baseline statistical engine. It is simple, fast and explainable. However, it must not be mistaken for the final AI model because it does not yet learn automatically from new matches, player availability, historical patterns or previous prediction errors.

Current Element Description Required Upgrade

Team stats Attack, defence weakness and quality tier. Replace fixed-only values with dynamic ratings updated after matches.

<!-- Page 3 -->

Current Element Description Required Upgrade

Expected goals Home/away xG from attack, opponent defence and home boost.

Add home/away split, opponent strength, player availability, fatigue, tactics and history.

Poisson matrix Calculates probabilities for scorelines from 0-10 goals.

Add Dixon-Coles low-score correction and calibration.

Confidence Based mainly on highest outcome probability. Use model agreement, data quality, lineup certainty and historic accuracy.

Fixtures Hardcoded fixture groups. Move to database/API-driven fixture ingestion.

## 3. Core Product Principle

BetRight must not rely on one model only. Football is too noisy for one algorithm to carry the entire product. The final system should use a controlled ensemble of statistical modelling, team ratings, historical learning, player intelligence, machine learning, psychology/context and calibration.

Football Statistical Model
+ Team Rating Model
+ Historical Learning Model
+ Player Profile Model
+ Machine Learning Model
+ Psychology and Context Model
+ Calibration Model
+ Post-Match Learning Loop

## 4. High-Level Prediction Architecture

```
Fixture Input
-> Data Collection
-> Data Cleaning and Normalisation
-> Team Profile Creation
-> Player Profile Creation
-> Historical Profile Creation
-> Feature Engineering
-> Home/Away Strength Analysis
-> Opposition Strength Adjustment
-> Player Availability and Lineup Analysis
-> Tactical Matchup Analysis
-> Psychology and Context Analysis
-> Expected Goals Calculation
-> Poisson / Dixon-Coles Score Matrix
-> Machine Learning Prediction
-> Elo / Rating Prediction
-> Ensemble Combination
-> Probability Calibration
-> Confidence Calculation
-> Prediction Explanation
-> Prediction Storage
-> Post-Match Result Ingestion
-> Model Learning and Rating Update
```

<!-- Page 4 -->

## 5. Prediction Output Requirements

Each match prediction must return a structured response that can be consumed by the web app, mobile app, reporting tools and admin dashboards.

```json
{
"match": "Team A vs Team B",
"competition": "Premier League",
"date": "2026-05-10",
"prediction": {
"home_win_probability": 48.6,
"draw_probability": 27.2,
"away_win_probability": 24.2,
"predicted_result": "Home Win",
"xg_home": 1.74,
"xg_away": 1.18,
"most_likely_scores": [
{"score": "2-1", "probability": 11.2},
{"score": "1-1", "probability": 10.4},
{"score": "1-0", "probability": 9.8}
],
"over_1_5": 78.5,
"over_2_5": 54.3,
"over_3_5": 31.1,
"btts_yes": 57.6
},
"confidence": {"score": 68, "label": "Medium"},
"data_quality_score": 84,
"model_version": "v1.0.0"
}
```

## 6. Team Strength Module

The team strength module calculates the real strength of each team, not just raw goals scored and conceded. It must include overall strength, attack strength, defence strength, home and away splits, recent form, squad strength, historical strength, psychology strength and competition strength.

- overall_team_strength

- attack_strength

- defence_strength

- home_attack_strength

- home_defence_strength

- away_attack_strength

- away_defence_strength

- recent_form_strength

- squad_strength

- historical_strength

- psychology_strength

- competition_strength

`team_strength = 30% long_term_rating + 20% recent_form_rating + 15% home_or_away_rating + 10% squad_availability_ra`

## 7. Home and Away Advantage Module

Home advantage must be dynamic. A fixed home boost is useful, but incomplete. Some teams are strong at home, some travel poorly, some derbies reduce venue advantage and neutral venues remove it completely.

- home_team_home_win_rate

<!-- Page 5 -->

- home_team_home_xg_for

- home_team_home_xg_against

- away_team_away_win_rate

- away_team_away_xg_for

- away_team_away_xg_against

- travel_distance

- neutral_venue

- crowd_factor

- altitude_factor

- pitch_familiarity

- same_city_derby

`home_advantage = league_average_home_advantage x team_specific_home_factor x opponent_away_weakness_factor x crowd_`

## 8. Opposition Strength Module

Raw form is dangerous without opponent context. A team winning five games against weak teams is not the same as winning five games against elite teams.

- opponent_elo

- opponent_attack_rating

- opponent_defence_rating

- opponent_league_strength

- opponent_recent_form

- opponent_squad_strength

- match_location

adjusted_attack_performance = actual_xg_for x opponent_defence_strength_factor adjusted_result_score = actual_result_points x opponent_strength_factor

## 9. Recent Form Module

Recent form must be included but not overvalued. The model must balance long-term quality with the last five and last ten match trends.

- last_5_points

- last_10_points

- last_5_goals_for

- last_5_goals_against

- last_5_xg_for

- last_5_xg_against

- last_5_clean_sheets

- last_5_btts

- last_5_over_2_5

Long-term strength: 50% | Recent 10 matches: 30% | Recent 5 matches: 20%

<!-- Page 6 -->

## 10. Historical Learning Module

The model must learn from long-term team history. It must understand how a team behaves at home, away, under pressure, against strong opponents, after scoring first, after conceding first, in derbies, finals and knockout games.

- historical_win_rate

- historical_draw_rate

- historical_loss_rate

- historical_goals_scored

- historical_goals_conceded

- historical_xg_for

- historical_xg_against

- historical_home_performance

- historical_away_performance

- historical_pressure_performance

- historical_comeback_record

current season: 45% | previous season: 25% | two seasons ago: 15% | three seasons ago: 10% | older history: 5%

## 11. Head-to-Head History Module

Head-to-head history must be used carefully. It should influence the model, not control it. Old matches with different players and managers must decay heavily.

- h2h_matches_played

- h2h_home_win_rate

- h2h_draw_rate

- h2h_away_win_rate

- h2h_average_goals

- h2h_btts_rate

- h2h_over_2_5_rate

- h2h_red_card_rate

- h2h_late_goal_rate

Normal league match: 3%-7% | Derby: 8%-12% | Knockout repeat fixture: 8%-15% | Old history: <3%

<!-- Page 7 -->

## 12. Player Profile Intelligence

A team is not only a badge and a name. A team is the players available on the day. BetRight must have a player-level model that understands player importance, form, fitness, pressure profile, role, replacement gap and tactical matchups.

Area Required Data / Logic

Player profile Name, team, position, age, nationality, preferred foot, height, starts, minutes, goals, assists, xG, xA, shots, tackles, cards, errors, injury history and suspension history.

Importance score Minutes share, xG/xA contribution, defensive/goalkeeping impact, leadership, replacement gap and recent form.

Player form Last 5 minutes, goals, assists, xG, xA, shots, key passes, defensive actions, cards and fitness.

Lineup model Pre-lineup prediction uses expected lineups. Confirmed-lineup prediction uses actual starters and bench.

Chemistry Same starting 11 frequency, centre-back pairing minutes, goalkeeper-defence continuity, midfield unit minutes and manager tenure.

Player matchups Pace advantage, aerial advantage, press resistance, side-specific attack vs defence, set-piece mismatches.

Position-Specific Missing Player Impact

Missing Player Prediction Impact

Goalkeeper Increase opponent xG, opponent scoring probability and BTTS; reduce clean-sheet probability.

Centre-back Increase opponent xG, set-piece concession risk, BTTS and over 2.5 probability.

Defensive midfielder Increase opponent transition threat, shot quality and central chance creation.

Main striker Reduce team xG, team goal probability and attacking confidence.

Creative midfielder Reduce chance creation, striker service, team xG and BTTS probability.

## 13. Tactical Style Module

The system must understand style matchups. Tactics should not replace xG and ratings, but should adjust the expected goal model and explanation layer.

Scenario Adjustment

High pressing team vs weak build-up team Increase pressing team xG and opponent error risk.

Counter-attacking team vs high defensive line Increase counter-attacking team xG and high-quality chance probability.

Set-piece strong team vs weak aerial defence Increase set-piece xG and likely goal probability.

Both teams low tempo Reduce over 2.5 and over 3.5 probabilities.

Fast winger vs slow fullback Increase chance creation from that side.

## 14. Psychology and Motivation Module

Psychology must be modelled through measurable football signals, not guesswork. The system should infer pressure, motivation and volatility from context.

- league position

- title race status

- relegation risk

<!-- Page 8 -->

- top-four race

- must-win match

- recent losing streak

- recent comeback wins

- manager under pressure

- new manager bounce

- derby or rivalry

- revenge fixture

- cup final context

- knockout pressure

- home crowd pressure

- historical pressure performance

- penalty shootout history

`psychology_score = motivation_score + pressure_handling_score + momentum_score + rivalry_intensity_score - instabil`

Scenario Rule

Derby match Increase volatility and card probability, reduce confidence, slightly increase draw probability.

Cup final Reduce open-play goal expectation, increase caution, experience and pressure weighting.

Knockout match Predict 90-minute result separately from qualification; include extra-time and penalty probability.

Relegation battle Increase motivation, volatility, physical intensity and card risk.

Dead rubber Decrease motivation, increase rotation risk and reduce confidence.

Early season Reduce recent form weight, increase previous-season and transfer impact.

Late season Increase motivation, fatigue and rotation context.

<!-- Page 9 -->

## 15. Expected Goals Engine

The expected goals engine produces lambda_home and lambda_away. These are the expected goal values used by the score probability model.

home_xg = league_base_goal_rate
x home_attack_strength
x away_defence_weakness
x home_advantage
x recent_form_factor
x squad_availability_factor
x player_lineup_factor
x opponent_strength_factor
x tactical_matchup_factor
x psychology_factor
x fatigue_factor
x historical_factor

away_xg = league_base_goal_rate
x away_attack_strength
x home_defence_weakness
x away_performance_factor
x recent_form_factor
x squad_availability_factor
x player_lineup_factor
x opponent_strength_factor
x tactical_matchup_factor
x psychology_factor
x fatigue_factor
x historical_factor

Recommended xG clamp: minimum_xg = 0.15 and maximum_xg = 5.50. The system must log every clamping event. If clamping happens often, the rating model is probably broken.

## 16. Scoreline Probability Engine

The system must use a score probability matrix from 0-0 to 10-10. For each possible score, calculate the independent Poisson probability, apply Dixon-Coles correction for low scores, normalise the matrix and derive outcome markets.

`P(score) = P(home_goals) x P(away_goals)`

Derived outputs:
- home win probability
- draw probability
- away win probability
- over/under goals
- BTTS
- clean-sheet probability
- team total goals
- most likely exact scores

Dixon-Coles correction should improve the modelling of 0-0, 1-0, 0-1 and 1-1 because football has more low-score dependency than a pure independent Poisson model assumes.

## 17. Machine Learning Model

The ML model must learn patterns that the statistical model does not capture easily. It should not replace the statistical model at first; it should sit beside it and then be combined through the ensemble.

Item Requirement

Recommended models Start with Logistic Regression, Random Forest, XGBoost, LightGBM and CatBoost. Use LightGBM or XGBoost as the primary production candidate.

Avoid initially Deep neural networks for v1. They require more data, are harder to explain and can produce fancy nonsense if rushed.

Outputs Home win, draw, away win, home goals expected, away goals expected, over 2.5 and BTTS.

<!-- Page 10 -->

Item Requirement

Targets Actual result, actual goals, over 2.5 result, BTTS result, goal difference and total goals.

Core ML Feature Set

home_elo, away_elo, elo_difference, home_attack_rating, away_attack_rating, home_defence_rating, away_defence_rating, home_recent_form, away_recent_form, home_historical_strength, away_historical_strength, home_xg_for_last_5, away_xg_for_last_5, home_xg_against_last_5, away_xg_against_last_5, home_rest_days, away_rest_days, home_injury_impact, away_injury_impact, home_lineup_strength, away_lineup_strength, home_missing_player_impact, away_missing_player_impact, home_player_form_score, away_player_form_score, home_chemistry_score, away_chemistry_score, home_psychology_score, away_psychology_score, neutral_venue, derby_match, knockout_match, final_match, travel_distance, competition_strength, h2h_home_advantage, h2h_goal_average, tactical_matchup_score

<!-- Page 11 -->

## 18. Ensemble Prediction Strategy

The final prediction must combine multiple models. Initial weights should be conservative and explainable. Over time, these weights should become dynamic based on model performance by league, match type and data quality.

Model Layer Starting Weight

Poisson/Dixon-Coles score model 30%

Machine learning model 30%

Elo/team rating model 15%

Player/lineup model 15%

Psychology/history/context model 10%

Dynamic Weighting Rules

- Increase player/lineup weight when lineups are confirmed.

- Reduce player/lineup weight when lineups are not confirmed.

- Increase historical model weight for teams with long reliable history.

- Reduce historical model weight for new or poor-data teams.

- Increase psychology/context weight for knockout games and finals.

- Increase ML weight for major leagues with strong historical data.

- Increase Elo and competition-strength weight for unknown teams.

- Reduce recent form weight early in the season.

- Increase motivation and fatigue weight late in the season.

## 19. Probability Calibration

If the model says a team has a 70% chance of winning, those predictions should historically win around 70% of the time. Calibration prevents the model from becoming overconfident.

- Platt scaling

- Isotonic regression

- Temperature scaling

- Confidence bucket calibration

The system must track predicted probability, actual result, calibration error and confidence bucket accuracy.

## 20. Confidence Engine

Confidence must be richer than the highest outcome probability. It should account for probability separation, model agreement, data quality, lineup certainty, team volatility and historical performance of similar predictions.

confidence =
25% probability_separation_score
+ 20% model_agreement_score
+ 20% data_quality_score
+ 15% lineup_certainty_score
+ 10% team_stability_score
+ 10% historical_model_accuracy_score

<!-- Page 12 -->

Range Label

0-39 Low

40-59 Medium-Low

60-74 Medium

75-84 High

85-95 Very High

Confidence must be capped at 95. The system must never output 100% confidence. Football does not deserve that kind of arrogance.

## 21. Data Quality Engine

Every prediction must include a data quality score. This score affects confidence and dynamic model weights.

- team data completeness

- recent match data completeness

- xG availability

- player profile completeness

- lineup availability

- injury data availability

- competition data availability

- weather data availability

- historical sample size

- head-to-head relevance

Condition Action

Unknown team Reduce confidence heavily.

No recent xG data Reduce confidence and increase uncertainty.

No player profile data Reduce player model weight.

No confirmed lineup Apply lineup uncertainty penalty.

Unknown neutral venue status Reduce confidence.

Small historical sample Reduce historical model weight.

<!-- Page 13 -->

## 22. Self-Learning System

The self-learning system must update after every match. The model must learn from actual results, actual xG, player performance, opponent strength and its own prediction errors.

```
Match finishes
-> Actual result is ingested
-> Prediction is compared to actual result
-> Prediction accuracy is calculated
-> Team ratings are updated
-> Player ratings are updated
-> Model error is stored
-> Training dataset is updated
-> ML model is retrained on schedule
-> Calibration model is updated
```

Immediate Rating Updates

- team_elo

- attack_rating

- defence_rating

- home_rating

- away_rating

- form_rating

- finishing_rating

- goalkeeper_rating

- player_form_rating

- player_importance_rating

- psychology_stability_rating

### Rating Update Principles

Do not update ratings based only on final score. Use actual goals, expected goals, shots, big chances, red cards, opponent strength, home/away context, lineup strength, match state and player performance.

Observed Result Learning Rule

Team wins 3-0 with only 0.7 xG Do not over-upgrade attack. Increase finishing slightly and mark as possible overperformance.

Team loses 1-0 with 2.4 xG Do not over-punish. Attack performance may still improve while finishing decreases.

Weak team creates high xG against elite defence

Increase attack rating more than normal because opponent difficulty was high.

Strong team concedes high xG to weak attack

Penalise defensive rating more because opponent difficulty was low.

Prediction Error Learning

- wrong_result

- wrong_scoreline

- underestimated_home_team

- overestimated_home_team

- underestimated_away_team

<!-- Page 14 -->

- overestimated_away_team

- underestimated_goals

- overestimated_goals

- missed_injury_impact

- missed_red_card_impact

- missed_rotation

- missed_psychology_factor

- poor_data_quality

Repeated Error Correction

Underestimates a team away from home Increase away strength rating.

Overpredicts goals in knockout matches Increase knockout caution adjustment.

Underestimates missing striker impact Increase striker absence weighting.

Overvalues head-to-head Reduce H2H weight.

Retraining Cadence

Cadence Action

After every match Update team and player ratings.

Daily Refresh form tables, injuries, player availability and fixture context.

Weekly Retrain ML models.

Monthly Recalibrate probabilities.

End of season Rebuild baseline ratings and archive season model.

<!-- Page 15 -->

## 23. Database Requirements

The system must store not only teams and fixtures, but also model versions, prediction snapshots, player profiles, historical profiles, lineups, player match stats and prediction errors.

Table Key Fields

Team team_id, name, country, league, continent, current_elo, attack_rating, defence_rating, home_attack_rating, home_defence_rating, away_attack_rating, away_defence_rating, squad_strength, manager_id, created_at, updated_at

Match match_id, date, season, competition, round, home_team_id, away_team_id, venue, neutral_venue, home_goals, away_goals, home_xg, away_xg, shots, shots_on_target, red_cards, status

Fixture fixture_id, date, competition, round, home_team_id, away_team_id, venue, neutral_venue, status

Player player_id, team_id, name, position, age, nationality, preferred_foot, height, weight, current_status, importance_score, form_score, pressure_score, fitness_score

PlayerMatchStats match_id, player_id, minutes, goals, assists, xg, xa, shots, key_passes, tackles, interceptions, clearances, aerials, errors, cards, rating

Lineup lineup_id, match_id, team_id, player_id, is_starter, position_played, minutes_played, subbed_on, subbed_off

PlayerAvailability availability_id, fixture_id, player_id, status, reason, expected_minutes, replacement_player_id, impact_score

TeamHistoricalProfile team_id, season, competition, home_win_rate, away_win_rate, goals_for, goals_against, xg_for, xg_against, clean_sheet_rate, btts_rate, over_2_5_rate, pressure_match_performance

Prediction prediction_id, fixture_id, model_version, predicted_goals, outcome probabilities, over_2_5, btts, confidence_score, data_quality_score, created_at

PredictionResult prediction_id, actual goals, actual result, result_correct, scoreline_correct, goal errors, brier_score, log_loss

PredictionError prediction_id, match_id, model_version, error_type, expected_value, actual_value, error_size, suspected_reason

TeamRatingHistory team_id, match_id, rating_type, old_rating, new_rating, rating_change, reason

ModelVersion version, model_type, training_date, training window, brier_score, log_loss, accuracy, calibration_score, status

<!-- Page 16 -->

## 24. API Requirements

### Predict Match API

### POST /api/predictions/match

Request:
{
"home_team": "Arsenal",
"away_team": "Chelsea",
"competition": "Premier League",
"date": "2026-05-10",
"neutral_venue": false
}

Response: { "home_win": 48.6, "draw": 27.2, "away_win": 24.2, "xg_home": 1.74, "xg_away": 1.18, "most_likely_score": "2-1", "confidence": 68, "analysis": [ "Arsenal have stronger home attacking numbers", "Chelsea away defence has underperformed recently" ] }

### Post-Match Update API

### POST /api/matches/result

Triggers:
- prediction comparison
- team rating update
- player rating update
- error logging
- training dataset update

### Model Performance API

### GET /api/models/performance

Returns:
- accuracy
- Brier score
- log loss
- calibration
- scoreline error
- market prediction performance
- league-by-league performance
- model-version comparison

## 25. Admin Dashboard Requirements

- upcoming fixtures

- predictions generated

- prediction confidence

- model version used

- missing data warnings

- post-match accuracy

- team rating changes

- player rating changes

<!-- Page 17 -->

- model calibration

- best-performing leagues

- worst-performing leagues

- prediction error categories

Admin users must be able to trigger prediction generation, review data gaps, approve model updates, compare model versions, view explanations, review prediction errors and inspect team/player rating changes.

## 26. User-Facing Match Page

- match details

- predicted result

- win/draw/loss probabilities

- expected goals

- likely scorelines

- over/under probabilities

- BTTS probability

- confidence score

- key reasons

- risk factors

- team form

- home/away comparison

- head-to-head history

- injury impact

- player profile impact

- lineup impact

- psychology/context notes

- historical match patterns

<!-- Page 18 -->

## 27. Model Evaluation Metrics

- home/draw/away accuracy

- exact score accuracy

- goal difference accuracy

- mean absolute goal error

- over/under accuracy

- BTTS accuracy

- Brier score

- log loss

- calibration curve

- confidence bucket accuracy

- league-specific accuracy

- team-specific error patterns

- player-impact prediction accuracy

Predictions between 60-70% confidence should be correct roughly 60-70% of the time. If they are not, the confidence model must be recalibrated.

## 28. MVP Scope

Version Scope

MVP 1 Team database, fixture input, Poisson score matrix, home/away advantage, opponent strength, basic Elo, recent form, basic historical team profile, prediction storage, result storage, basic rating updates, explanation and confidence.

MVP 2 Dixon-Coles correction, xG-based updates, injury/suspension module, player profile table, lineup model, data quality scoring, evaluation dashboard and weekly retraining.

MVP 3 ML model, ensemble engine, historical learning, player importance, player form, psychology, tactical module, calibration and dynamic model weighting.

MVP 4 Advanced player-level modelling, lineup-based refresh, live in-play prediction, market comparison, advanced explainability, player matchup modelling and pressure modelling.

## 29. Non-Functional Requirements

Category Requirement

Performance Single match prediction under 2 seconds. Batch prediction for 100 fixtures under 60 seconds.

Reliability All predictions stored with timestamp, model version, input snapshot, feature values and final output.

Explainability Every prediction must include human-readable reasoning. No black-box output without explanation.

Versioning Every model must have a version such as poisson-v1.0, dixon-coles-v1.1, ml-xgboost-v1.0, ensemble-v1.2.

Auditability System must answer what was predicted, when, by which model, with what data, what happened, and why the prediction was right or wrong.

## 30. Risks and Mitigations

<!-- Page 19 -->

Risk Mitigation

Bad data Data quality scoring, source validation, missing data penalties and manual review queue.

Overfitting Cross-validation, season-based testing, league-based testing, calibration and baseline comparison.

Overconfidence Confidence cap, calibration, uncertainty scoring and risk factor display.

Subjective psychology modelling Use measurable proxies only, avoid emotional assumptions and keep weights controlled.

Incomplete player data Fallback to team-level model, reduce player model weight and apply data quality penalty.

## 31. Success Metrics

- prediction accuracy improves over time

- Brier score improves over time

- log loss reduces over time

- confidence calibration becomes reliable

- users understand why predictions were made

- model performs better than the baseline Poisson model

- model performs consistently across leagues

- model correctly adjusts for injuries, lineups and home/away context

- model learns from historical team and player patterns

<!-- Page 20 -->

## 32. Final Recommended Build Strategy

1 Clean up the current Poisson model.

2 Add database and prediction storage.

3 Add post-match result ingestion.

4 Add team ratings and Elo.

5 Add home/away and opponent strength logic.

6 Add historical team profiles.

7 Add xG and form modules.

8 Add confidence and data quality scoring.

9 Add self-learning rating updates.

10 Add player profiles and lineup model.

11 Add ML model.

12 Add ensemble and calibration.

13 Add psychology and tactical intelligence.

14 Add prediction error learning.

15 Add full explainability dashboard.

Final Requirement

The model must learn from team history, player history, head-to-head history, home/away history, competition history, psychological/context history and its own prediction history.

The prediction engine must become better not only because it has more data, but because it understands who played, where they played, who they played against, how strong the opponent was, what the match meant, what the model predicted, what actually happened and why the prediction was right or wrong.

