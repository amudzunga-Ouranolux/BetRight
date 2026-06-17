"""Engine math + invariants. Run: pytest (from services/ml-prediction)."""

from datetime import datetime, timedelta, timezone

import pytest

from app.engine import ensemble
from app.engine.calibration import apply_temperature, estimate_temperature
from app.engine.confidence import CONFIDENCE_CAP, compute_confidence, data_quality_score, label_for
from app.engine.dixon_coles import build_goal_model, expected_goals
from app.engine.elo import rating_outcome, updated_ratings
from app.engine.form import HistMatch, TeamForm, compute_form
from app.engine.markets import derive_markets, outcome_probabilities
from app.engine.poisson import poisson_column, poisson_pmf
from app.engine.predictor import predict
from app.engine.squad import squad_outcome
from app.jobs.postmatch import score_prediction

UTC = timezone.utc


# --- Poisson -----------------------------------------------------------------

def test_poisson_column_sums_to_one():
    col = poisson_column(1.5, max_goals=30)
    assert sum(col) == pytest.approx(1.0, abs=1e-6)


def test_poisson_pmf_zero_lambda():
    assert poisson_pmf(0, 0) == 1.0
    assert poisson_pmf(2, 0) == 0.0


# --- Dixon-Coles + markets ---------------------------------------------------

def test_goal_matrix_normalised():
    model = build_goal_model(1.6, 1.1)
    total = sum(p for row in model.matrix for p in row)
    assert total == pytest.approx(1.0, abs=1e-9)


def test_outcome_probabilities_sum_to_100():
    model = build_goal_model(1.8, 1.0)
    o = outcome_probabilities(model)
    assert o.home_win + o.draw + o.away_win == pytest.approx(100.0, abs=1e-6)
    # Stronger home expectation should favour the home win.
    assert o.home_win > o.away_win


def test_over_under_monotonic_and_bounded():
    m = derive_markets(build_goal_model(2.0, 1.4))
    assert 0 <= m.over35 <= m.over25 <= m.over15 <= 100
    assert m.under25 == pytest.approx(100 - m.over25, abs=0.2)
    assert 0 <= m.btts_yes <= 100
    assert m.btts_yes + m.btts_no == pytest.approx(100.0, abs=0.2)


def test_scorelines_ranked_desc():
    m = derive_markets(build_goal_model(1.7, 1.2))
    probs = [s.probability for s in m.scorelines]
    assert probs == sorted(probs, reverse=True)
    assert m.scorelines[0].rank == 1


def test_expected_goals_home_advantage_applied():
    home_xg, away_xg = expected_goals(1.5, 1.2, 1.5, 1.2, 1.4, venue="home")
    home_xg_neutral, _ = expected_goals(1.5, 1.2, 1.5, 1.2, 1.4, venue="neutral")
    assert home_xg > home_xg_neutral  # home boost lifts home xG


# --- Elo ---------------------------------------------------------------------

def test_rating_outcome_sums_100_and_favours_stronger():
    o = rating_outcome(1800, 1500)
    assert o.home_win + o.draw + o.away_win == pytest.approx(100.0, abs=1e-6)
    assert o.home_win > o.away_win


def test_elo_update_is_zero_sum_and_directional():
    new_home, new_away = updated_ratings(1500, 1500, home_goals=3, away_goals=0)
    assert new_home > 1500 and new_away < 1500
    assert (new_home - 1500) == pytest.approx(-(new_away - 1500), abs=1e-9)


# --- Ensemble ----------------------------------------------------------------

def test_ensemble_renormalises_over_present_models():
    a = outcome_probabilities(build_goal_model(2.0, 1.0))
    b = rating_outcome(1700, 1500)
    combined = ensemble.combine({"statistical": a, "team_rating": b})
    assert combined.home_win + combined.draw + combined.away_win == pytest.approx(100.0, abs=0.2)


def test_ensemble_requires_a_known_model():
    with pytest.raises(ValueError):
        ensemble.combine({})


# --- Confidence --------------------------------------------------------------

def test_confidence_never_reaches_100():
    a = outcome_probabilities(build_goal_model(3.5, 0.4))  # very lopsided
    c = compute_confidence(a, a, a, 100.0, ["W"] * 5, ["L"] * 5, historical_accuracy=1.0)
    assert c.score <= CONFIDENCE_CAP < 100


def test_confidence_labels():
    assert label_for(10) == "low"
    assert label_for(50) == "medium_low"
    assert label_for(68) == "medium"
    assert label_for(80) == "high"
    assert label_for(90) == "very_high"


def test_data_quality_scales_with_samples():
    assert data_quality_score(0, 0) == 0.0
    assert data_quality_score(12, 12) == 100.0
    assert 0 < data_quality_score(3, 3) < 100


# --- Form / anti-leakage -----------------------------------------------------

def test_compute_form_ignores_matches_at_or_after_as_of():
    as_of = datetime(2026, 6, 13, tzinfo=UTC)
    matches = [
        HistMatch(as_of - timedelta(days=7), "mci", "ars", 3, 0),   # before -> counted
        HistMatch(as_of + timedelta(days=1), "mci", "liv", 0, 5),   # after -> must be ignored
    ]
    form = compute_form("mci", matches, as_of, league_base_goal_rate=1.4)
    assert form.matches_sampled == 1
    assert form.recent_results == ["W"]  # the future 0-5 loss is excluded


def test_compute_form_cold_start_uses_league_base():
    form = compute_form("xyz", [], datetime(2026, 1, 1, tzinfo=UTC), league_base_goal_rate=1.3)
    assert form.matches_sampled == 0
    assert form.attack_strength == 1.3 and form.defence_strength == 1.3


# --- End to end --------------------------------------------------------------

def test_apply_temperature_softens_sharpens_and_noop():
    base = (70.0, 20.0, 10.0)
    soft = apply_temperature(*base, 1.5)   # T>1 flattens toward uniform
    assert soft[0] < 70 and sum(soft) == pytest.approx(100, abs=0.3)
    sharp = apply_temperature(*base, 0.6)  # T<1 sharpens
    assert sharp[0] > 70 and sum(sharp) == pytest.approx(100, abs=0.3)
    assert apply_temperature(*base, 1.0) == base  # T=1 is a no-op


def test_estimate_temperature_overconfident_and_small_sample():
    # avg confidence 0.8 but only 50% correct -> over-confident -> T > 1
    overconfident = [(0.8, i < 5) for i in range(10)]
    assert estimate_temperature(overconfident) > 1.0
    # too few samples -> neutral
    assert estimate_temperature([(0.8, True)]) == 1.0


def test_squad_outcome_favours_stronger_squad():
    o = squad_outcome(1900, 1500, neutral=True)
    assert o.home_win + o.draw + o.away_win == pytest.approx(100.0, abs=1e-6)
    assert o.home_win > o.away_win


def test_predict_squad_model_shifts_outcome():
    even = TeamForm("a", 1.5, 1.2, 14, 1.5, 1.2, ["W", "D", "W", "L", "W"])
    even2 = TeamForm("b", 1.5, 1.2, 14, 1.5, 1.2, ["W", "D", "W", "L", "W"])
    kw = dict(
        fixture_id="fx", home_team_id="a", away_team_id="b", home_name="A", away_name="B",
        home_form=even, away_form=even2, elo_home=1500, elo_away=1500,
        league_base_goal_rate=1.4, venue="neutral", as_of=datetime(2026, 6, 13, tzinfo=UTC),
    )
    base = predict(**kw)
    stronger = predict(**kw, home_squad=1950, away_squad=1450)
    # A much stronger home squad must raise the home win probability.
    assert stronger.outcome.home_win > base.outcome.home_win
    assert stronger.outcome.home_win + stronger.outcome.draw + stronger.outcome.away_win == pytest.approx(100.0, abs=0.3)


def test_score_prediction_brier_logloss():
    # Confident home call that comes in: low Brier, low log-loss, correct.
    good = score_prediction(80, 15, 5, home_goals=2, away_goals=0)
    assert good["outcome"] == "home_win"
    assert good["result_correct"] is True
    assert good["brier"] < 0.2 and good["log_loss"] < 0.3

    # Same confident call, but an away upset: high Brier, high log-loss, wrong.
    bad = score_prediction(80, 15, 5, home_goals=0, away_goals=2)
    assert bad["outcome"] == "away_win"
    assert bad["result_correct"] is False
    assert bad["brier"] > good["brier"] and bad["log_loss"] > good["log_loss"]


def test_score_prediction_brier_bounds():
    s = score_prediction(33.3, 33.3, 33.4, 1, 1)
    assert 0.0 <= s["brier"] <= 2.0  # Brier for a 3-class one-hot is in [0,2]


def test_predict_end_to_end_no_guaranteed_language():
    home = TeamForm("mci", 2.1, 0.9, 14, 2.1, 0.9, ["W", "W", "D", "W", "L"])
    away = TeamForm("mun", 1.4, 1.3, 13, 1.4, 1.3, ["W", "L", "D", "W", "W"])
    r = predict(
        fixture_id="fx_1", home_team_id="mci", away_team_id="mun",
        home_name="Man City", away_name="Man United",
        home_form=home, away_form=away, elo_home=1720, elo_away=1610,
        league_base_goal_rate=1.4, venue="home", as_of=datetime(2026, 6, 13, tzinfo=UTC),
    )
    assert r.outcome.home_win + r.outcome.draw + r.outcome.away_win == pytest.approx(100.0, abs=0.3)
    assert r.predicted_result == "home_win"
    text = (r.explanation.summary + r.explanation.headline).lower()
    # Responsible-use: no certainty claims, and the probabilistic disclaimer is present.
    for forbidden in ("guaranteed win", "certain win", "sure thing", "100%"):
        assert forbidden not in text
    assert "probabilistic and never guaranteed" in text
    assert r.feature_snapshot["feature_snapshot_id"].startswith("fs_")
