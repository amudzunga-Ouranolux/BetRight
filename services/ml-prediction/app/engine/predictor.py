"""Top-level prediction orchestration.

Ties the engine together: form/Elo inputs -> Dixon-Coles goal model -> markets,
ensemble 1X2, confidence, rule-based explanation, and an immutable feature
snapshot. This is the single entry point the FastAPI service and batch jobs call.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from . import ensemble
from .calibration import apply_temperature
from .confidence import Confidence, compute_confidence, data_quality_score
from .dixon_coles import build_goal_model, expected_goals
from .elo import rating_outcome
from .explain import Explanation, build_explanation
from .features import build_snapshot
from .form import TeamForm
from .markets import Markets, OneXTwo, derive_markets, most_likely_score, outcome_probabilities

MODEL_VERSION = "formula-1.0.0"


@dataclass
class PredictionResult:
    model_version: str
    outcome: OneXTwo            # final, ensembled 1X2 (percentages)
    predicted_result: str       # home_win|draw|away_win
    home_xg: float
    away_xg: float
    likely_score: str
    confidence: Confidence
    data_quality_score: float
    markets: Markets
    explanation: Explanation
    feature_snapshot: dict
    # component models kept for transparency / debugging
    statistical: OneXTwo
    rating: OneXTwo


def predict(
    *,
    fixture_id: str,
    home_team_id: str,
    away_team_id: str,
    home_name: str,
    away_name: str,
    home_form: TeamForm,
    away_form: TeamForm,
    elo_home: float,
    elo_away: float,
    league_base_goal_rate: float,
    venue: str,
    as_of: datetime,
    historical_accuracy: float | None = None,
    calibration_temp: float = 1.0,
    home_squad: float | None = None,
    away_squad: float | None = None,
) -> PredictionResult:
    # 1. Expected goals -> Dixon-Coles score matrix.
    home_xg, away_xg = expected_goals(
        home_attack=home_form.attack_strength,
        home_defence=home_form.defence_strength,
        away_attack=away_form.attack_strength,
        away_defence=away_form.defence_strength,
        league_base_goal_rate=league_base_goal_rate,
        venue=venue,
    )
    model = build_goal_model(home_xg, away_xg)

    # 2. Component 1X2 estimates.
    statistical = outcome_probabilities(model)
    rating = rating_outcome(elo_home, elo_away, neutral=(venue == "neutral"))

    # 3. Ensemble — adaptive weighting. The statistical (Dixon-Coles) model is only
    # as good as the form data behind it; for sides with little history (e.g. national
    # teams) it is near-uniform, so down-weight it and let Elo lead. With full form
    # samples it keeps its default weight.
    from .confidence import FULL_SAMPLE

    form_conf = min(home_form.matches_sampled, away_form.matches_sampled) / FULL_SAMPLE
    form_conf = max(0.15, min(1.0, form_conf))
    # Elo is the stronger 1X2/result model; until the ML model lands it inherits the
    # ML model's weight. The statistical (Dixon-Coles) model is mainly a goals model,
    # further down-weighted on the result when its form data is thin.
    tw = ensemble.TARGET_WEIGHTS
    models = {"statistical": statistical, "team_rating": rating}
    weights = {"statistical": tw["statistical"] * form_conf, "team_rating": tw["team_rating"]}

    if home_squad is not None and away_squad is not None:
        from .squad import squad_outcome

        models["player_lineup"] = squad_outcome(home_squad, away_squad, neutral=(venue == "neutral"))
        weights["player_lineup"] = tw["player_lineup"]
        # No ML model yet: split its weight across the two strength models (Elo + squad).
        weights["team_rating"] += tw["ml"] / 2
        weights["player_lineup"] += tw["ml"] / 2
    else:
        # No squad data: Elo inherits the absent ML model's full weight.
        weights["team_rating"] += tw["ml"]

    final = ensemble.combine(models, weights)
    if calibration_temp and abs(calibration_temp - 1.0) > 1e-6:
        h, d, a = apply_temperature(final.home_win, final.draw, final.away_win, calibration_temp)
        final = OneXTwo(home_win=h, draw=d, away_win=a)

    # 4. Markets from the goal model.
    markets = derive_markets(model)
    likely = most_likely_score(model)

    # 5. Confidence + data quality.
    dq = data_quality_score(home_form.matches_sampled, away_form.matches_sampled)
    confidence = compute_confidence(
        final=final,
        statistical=statistical,
        rating=rating,
        data_quality=dq,
        home_results=home_form.recent_results,
        away_results=away_form.recent_results,
        historical_accuracy=historical_accuracy,
    )

    # 6. Explanation + snapshot.
    explanation = build_explanation(
        home_name=home_name,
        away_name=away_name,
        outcome=final,
        home_xg=model.home_xg,
        away_xg=model.away_xg,
        home_form=home_form,
        away_form=away_form,
        markets=markets,
        data_quality=dq,
        venue=venue,
    )
    snapshot = build_snapshot(
        fixture_id=fixture_id,
        as_of=as_of,
        home_form=home_form,
        away_form=away_form,
        elo_home=elo_home,
        elo_away=elo_away,
        league_base_goal_rate=league_base_goal_rate,
        venue=venue,
    )

    predicted_result = _predicted_result(final)

    return PredictionResult(
        model_version=MODEL_VERSION,
        outcome=final,
        predicted_result=predicted_result,
        home_xg=round(model.home_xg, 2),
        away_xg=round(model.away_xg, 2),
        likely_score=likely,
        confidence=confidence,
        data_quality_score=dq,
        markets=markets,
        explanation=explanation,
        feature_snapshot=snapshot,
        statistical=statistical,
        rating=rating,
    )


def _predicted_result(outcome: OneXTwo) -> str:
    trio = [
        ("home_win", outcome.home_win),
        ("draw", outcome.draw),
        ("away_win", outcome.away_win),
    ]
    trio.sort(key=lambda t: t[1], reverse=True)
    return trio[0][0]
