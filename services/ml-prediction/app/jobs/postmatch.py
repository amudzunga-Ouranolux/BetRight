"""Post-match learning loop (Phase 5).

  python -m app.jobs.postmatch

Two responsibilities:
  * bootstrap_ratings: replay all finished matches in date order to seed Elo
    (used once after ingest/seed).
  * run_postmatch: for finished matches that have a stored prediction but no
    scored result, compute Brier/log-loss/correctness, update Elo, and refresh
    the rolling model-performance metrics.
"""

from __future__ import annotations

import math

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..engine.elo import updated_ratings
from ..engine.predictor import MODEL_VERSION
from ..store import models, repo
from ..store.db import init_db, session_scope

INITIAL_ELO = 1500.0
_EPS = 1e-12


def bootstrap_ratings(session: Session) -> int:
    """Replay every finished match chronologically to seed team Elo ratings."""
    # Reset ratings.
    for rating in session.scalars(select(models.TeamRating)):
        rating.elo = INITIAL_ELO
        rating.matches_played = 0

    matches = list(
        session.scalars(select(models.Match).order_by(models.Match.kickoff_time))
    )
    for m in matches:
        home = repo.get_or_create_rating(session, m.home_team_id)
        away = repo.get_or_create_rating(session, m.away_team_id)
        new_home, new_away = updated_ratings(
            home.elo, away.elo, m.home_goals, m.away_goals, neutral=m.neutral
        )
        home.elo, away.elo = new_home, new_away
        home.matches_played += 1
        away.matches_played += 1
    return len(matches)


def score_prediction(
    p_home: float, p_draw: float, p_away: float, home_goals: int, away_goals: int
) -> dict:
    """Brier + log-loss + correctness for a single prediction (probs in 0-100)."""
    ph, pd, pa = p_home / 100.0, p_draw / 100.0, p_away / 100.0
    if home_goals > away_goals:
        outcome, oh, od, oa = "home_win", 1, 0, 0
    elif home_goals == away_goals:
        outcome, oh, od, oa = "draw", 0, 1, 0
    else:
        outcome, oh, od, oa = "away_win", 0, 0, 1

    brier = (ph - oh) ** 2 + (pd - od) ** 2 + (pa - oa) ** 2
    p_actual = {"home_win": ph, "draw": pd, "away_win": pa}[outcome]
    log_loss = -math.log(max(p_actual, _EPS))
    predicted = max(
        [("home_win", ph), ("draw", pd), ("away_win", pa)], key=lambda t: t[1]
    )[0]
    return {
        "outcome": outcome,
        "brier": round(brier, 4),
        "log_loss": round(log_loss, 4),
        "result_correct": predicted == outcome,
    }


def run_postmatch(session: Session) -> dict[str, int]:
    """Score predictions whose match has finished and isn't yet evaluated."""
    counts = {"scored": 0}
    matches = {m.match_id: m for m in session.scalars(select(models.Match))}

    for pred in session.scalars(select(models.Prediction)):
        if repo.has_result(session, pred.prediction_id):
            continue
        match = matches.get(pred.fixture_id)
        if match is None:
            continue  # fixture not finished yet

        scored = score_prediction(
            pred.home_win_probability,
            pred.draw_probability,
            pred.away_win_probability,
            match.home_goals,
            match.away_goals,
        )
        scoreline_correct = (pred.likely_score or "").replace(" ", "") == (
            f"{match.home_goals}-{match.away_goals}"
        )
        session.add(
            models.PredictionResult(
                prediction_id=pred.prediction_id,
                actual_home_goals=match.home_goals,
                actual_away_goals=match.away_goals,
                result_correct=scored["result_correct"],
                scoreline_correct=scoreline_correct,
                brier_score=scored["brier"],
                log_loss=scored["log_loss"],
            )
        )

        # Update Elo from the actual result.
        home = repo.get_or_create_rating(session, match.home_team_id)
        away = repo.get_or_create_rating(session, match.away_team_id)
        old_home = home.elo
        new_home, new_away = updated_ratings(
            home.elo, away.elo, match.home_goals, match.away_goals, neutral=match.neutral
        )
        home.elo, away.elo = new_home, new_away
        session.add(
            models.TeamRatingHistory(
                team_id=match.home_team_id, match_id=match.match_id,
                old_elo=old_home, new_elo=new_home, reason="postmatch",
            )
        )
        counts["scored"] += 1

    _refresh_metrics(session)
    return counts


def _refresh_metrics(session: Session) -> None:
    results = list(session.scalars(select(models.PredictionResult)))
    if not results:
        return
    n = len(results)
    accuracy = sum(1 for r in results if r.result_correct) / n
    brier = sum(r.brier_score for r in results) / n
    log_loss = sum(r.log_loss for r in results) / n

    mv = repo.ensure_model_version(session, MODEL_VERSION, "Formula engine (Dixon-Coles + Elo)")
    mv.accuracy = round(accuracy, 4)
    mv.brier_score = round(brier, 4)
    mv.log_loss = round(log_loss, 4)
    mv.sample_size = n


if __name__ == "__main__":
    init_db()
    with session_scope() as s:
        replayed = bootstrap_ratings(s)
    with session_scope() as s:
        scored = run_postmatch(s)
    print(f"bootstrapped {replayed} matches; scored {scored['scored']} predictions")
