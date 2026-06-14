"""Prediction service layer.

Bridges the database and the pure engine: loads form/Elo/league inputs for a
fixture, runs the engine, persists the prediction + immutable feature snapshot,
and shapes the API response. Also powers the manual (ad-hoc) prediction.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from .engine.form import compute_form
from .engine.predictor import MODEL_VERSION, PredictionResult, predict
from .schemas import (
    ConfidenceOut,
    ExpectedGoalsOut,
    ExplanationOut,
    MarketsOut,
    OutcomeOut,
    PredictionOut,
    ReasonOut,
    ScorelineOut,
    TeamOut,
)
from .store import models, repo

DEFAULT_ELO = 1500.0


def predict_fixture(session: Session, fixture_id: str, persist: bool = True) -> PredictionOut:
    fixture = repo.get_fixture(session, fixture_id)
    if fixture is None:
        raise LookupError(f"fixture not found: {fixture_id}")

    home = repo.get_team(session, fixture.home_team_id)
    away = repo.get_team(session, fixture.away_team_id)
    if home is None or away is None:
        raise LookupError("fixture references unknown team")

    competition = repo.get_competition(session, fixture.competition_id)
    base_rate = competition.base_goal_rate if competition else 1.35

    kickoff = _aware(fixture.kickoff_time)
    # Predict as of now, but never past kickoff (anti-leakage).
    as_of = min(_now(), kickoff)

    result = _run(session, fixture_id, home, away, base_rate,
                  venue=("neutral" if fixture.neutral else "home"), as_of=as_of)

    if persist:
        _persist(session, fixture_id, result)
        session.commit()

    return _to_out(
        result,
        fixture_id=fixture_id,
        home=home,
        away=away,
        competition=competition,
        kickoff_time=kickoff,
        generated_at=as_of,
    )


def predict_manual(
    session: Session, home_team_id: str, away_team_id: str, venue: str
) -> PredictionOut:
    home = repo.get_team(session, home_team_id)
    away = repo.get_team(session, away_team_id)
    if home is None or away is None:
        raise LookupError("unknown team in manual prediction")

    competition = repo.get_competition(session, home.competition_id) if home.competition_id else None
    base_rate = competition.base_goal_rate if competition else 1.35
    as_of = _now()
    fixture_id = f"manual_{home_team_id}_{away_team_id}"

    result = _run(session, fixture_id, home, away, base_rate, venue=venue, as_of=as_of)
    # Manual predictions are ad-hoc; we don't persist them by default.
    return _to_out(
        result,
        fixture_id=fixture_id,
        home=home,
        away=away,
        competition=competition,
        kickoff_time=None,
        generated_at=as_of,
    )


def _run(
    session: Session,
    fixture_id: str,
    home: models.Team,
    away: models.Team,
    base_rate: float,
    venue: str,
    as_of: datetime,
) -> PredictionResult:
    matches = repo.matches_for_teams(session, [home.team_id, away.team_id], as_of)
    home_form = compute_form(home.team_id, matches, as_of, base_rate)
    away_form = compute_form(away.team_id, matches, as_of, base_rate)

    home_rating = session.get(models.TeamRating, home.team_id)
    away_rating = session.get(models.TeamRating, away.team_id)
    elo_home = home_rating.elo if home_rating else DEFAULT_ELO
    elo_away = away_rating.elo if away_rating else DEFAULT_ELO

    mv = repo.get_model_version(session, MODEL_VERSION)
    historical_accuracy = mv.accuracy if (mv and mv.accuracy is not None) else None

    return predict(
        fixture_id=fixture_id,
        home_team_id=home.team_id,
        away_team_id=away.team_id,
        home_name=home.name,
        away_name=away.name,
        home_form=home_form,
        away_form=away_form,
        elo_home=elo_home,
        elo_away=elo_away,
        league_base_goal_rate=base_rate,
        venue=venue,
        as_of=as_of,
        historical_accuracy=historical_accuracy,
    )


def _persist(session: Session, fixture_id: str, result: PredictionResult) -> str:
    repo.ensure_model_version(session, result.model_version, "Formula engine (Dixon-Coles + Elo)")

    snap = result.feature_snapshot
    session.merge(
        models.FeatureSnapshot(
            feature_snapshot_id=snap["feature_snapshot_id"],
            fixture_id=fixture_id,
            as_of=datetime.fromisoformat(snap["as_of"]),
            data_quality_score=result.data_quality_score,
            features_json=snap["features"],
            source_manifest={"engine": result.model_version},
        )
    )

    prediction_id = f"pred_{uuid.uuid4().hex[:12]}"
    session.add(
        models.Prediction(
            prediction_id=prediction_id,
            fixture_id=fixture_id,
            model_version=result.model_version,
            home_win_probability=result.outcome.home_win,
            draw_probability=result.outcome.draw,
            away_win_probability=result.outcome.away_win,
            home_xg=result.home_xg,
            away_xg=result.away_xg,
            likely_score=result.likely_score,
            confidence_score=result.confidence.score,
            confidence_label=result.confidence.label,
            data_quality_score=result.data_quality_score,
            markets_json=_markets_dict(result),
            explanation_json=_explanation_dict(result),
            feature_snapshot_id=snap["feature_snapshot_id"],
        )
    )
    return prediction_id


def _markets_dict(result: PredictionResult) -> dict:
    m = result.markets
    return {
        "over15": m.over15,
        "over25": m.over25,
        "over35": m.over35,
        "under25": m.under25,
        "btts_yes": m.btts_yes,
        "btts_no": m.btts_no,
        "clean_sheet_home": m.clean_sheet_home,
        "clean_sheet_away": m.clean_sheet_away,
        "scorelines": [
            {"score": s.score, "home_goals": s.home_goals, "away_goals": s.away_goals,
             "probability": s.probability, "rank": s.rank}
            for s in m.scorelines
        ],
    }


def _explanation_dict(result: PredictionResult) -> dict:
    e = result.explanation
    return {
        "headline": e.headline,
        "summary": e.summary,
        "key_reasons": [r.__dict__ for r in e.key_reasons],
        "risk_factors": [r.__dict__ for r in e.risk_factors],
    }


def _to_out(
    result: PredictionResult,
    *,
    fixture_id: str,
    home: models.Team,
    away: models.Team,
    competition: models.Competition | None,
    kickoff_time: datetime | None,
    generated_at: datetime,
) -> PredictionOut:
    e = result.explanation
    return PredictionOut(
        prediction_id=f"pred_{fixture_id}",
        fixture_id=fixture_id,
        model_version=result.model_version,
        generated_at=generated_at.isoformat(),
        competition_id=competition.competition_id if competition else None,
        competition_name=competition.name if competition else None,
        kickoff_time=kickoff_time.isoformat() if kickoff_time else None,
        home_team=TeamOut(team_id=home.team_id, name=home.name, short_name=home.short_name),
        away_team=TeamOut(team_id=away.team_id, name=away.name, short_name=away.short_name),
        predicted_result=result.predicted_result,
        outcome=OutcomeOut(
            home_win=result.outcome.home_win,
            draw=result.outcome.draw,
            away_win=result.outcome.away_win,
        ),
        expected_goals=ExpectedGoalsOut(home_xg=result.home_xg, away_xg=result.away_xg),
        likely_score=result.likely_score,
        likely_scorelines=[
            ScorelineOut(
                score=s.score, home_goals=s.home_goals, away_goals=s.away_goals,
                probability=s.probability, rank=s.rank,
            )
            for s in result.markets.scorelines
        ],
        markets=MarketsOut(
            over15=result.markets.over15,
            over25=result.markets.over25,
            over35=result.markets.over35,
            under25=result.markets.under25,
            btts_yes=result.markets.btts_yes,
            btts_no=result.markets.btts_no,
            clean_sheet_home=result.markets.clean_sheet_home,
            clean_sheet_away=result.markets.clean_sheet_away,
        ),
        confidence=ConfidenceOut(score=result.confidence.score, label=result.confidence.label),
        data_quality_score=result.data_quality_score,
        explanation=ExplanationOut(
            headline=e.headline,
            summary=e.summary,
            key_reasons=[ReasonOut(**r.__dict__) for r in e.key_reasons],
            risk_factors=[ReasonOut(**r.__dict__) for r in e.risk_factors],
        ),
        feature_snapshot_id=result.feature_snapshot["feature_snapshot_id"],
    )


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
