"""Repository functions — all DB access goes through here."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..engine.form import HistMatch
from . import models


# --- reference reads ---------------------------------------------------------

def get_team(session: Session, team_id: str) -> models.Team | None:
    return session.get(models.Team, team_id)


def get_competition(session: Session, competition_id: str) -> models.Competition | None:
    return session.get(models.Competition, competition_id)


def get_fixture(session: Session, fixture_id: str) -> models.Fixture | None:
    return session.get(models.Fixture, fixture_id)


def upcoming_fixtures(session: Session, limit: int = 200) -> list[models.Fixture]:
    stmt = (
        select(models.Fixture)
        .where(models.Fixture.status == "scheduled")
        .order_by(models.Fixture.kickoff_time)
        .limit(limit)
    )
    return list(session.scalars(stmt))


def team_upcoming_fixtures(session: Session, team_id: str, limit: int = 10) -> list[models.Fixture]:
    stmt = (
        select(models.Fixture)
        .where(
            models.Fixture.status == "scheduled",
            (models.Fixture.home_team_id == team_id) | (models.Fixture.away_team_id == team_id),
        )
        .order_by(models.Fixture.kickoff_time)
        .limit(limit)
    )
    return list(session.scalars(stmt))


def competition_teams(session: Session, competition_id: str) -> list[models.Team]:
    stmt = select(models.Team).where(models.Team.competition_id == competition_id)
    return list(session.scalars(stmt))


def competition_upcoming(session: Session, competition_id: str, limit: int = 20) -> list[models.Fixture]:
    stmt = (
        select(models.Fixture)
        .where(models.Fixture.status == "scheduled", models.Fixture.competition_id == competition_id)
        .order_by(models.Fixture.kickoff_time)
        .limit(limit)
    )
    return list(session.scalars(stmt))


def get_rating(session: Session, team_id: str) -> models.TeamRating | None:
    return session.get(models.TeamRating, team_id)


def matches_between(session: Session, a: str, b: str, limit: int = 5) -> list[models.Match]:
    """Most recent finished matches between two teams (either home/away order)."""
    stmt = (
        select(models.Match)
        .where(
            ((models.Match.home_team_id == a) & (models.Match.away_team_id == b))
            | ((models.Match.home_team_id == b) & (models.Match.away_team_id == a))
        )
        .order_by(models.Match.kickoff_time.desc())
        .limit(limit)
    )
    return list(session.scalars(stmt))


def matches_for_teams(
    session: Session, team_ids: list[str], before: datetime
) -> list[HistMatch]:
    """All finished matches before ``before`` involving any of the given teams."""
    stmt = select(models.Match).where(
        models.Match.kickoff_time < before,
        (models.Match.home_team_id.in_(team_ids)) | (models.Match.away_team_id.in_(team_ids)),
    )
    return [
        HistMatch(
            kickoff_time=_aware(m.kickoff_time),
            home_team_id=m.home_team_id,
            away_team_id=m.away_team_id,
            home_goals=m.home_goals,
            away_goals=m.away_goals,
        )
        for m in session.scalars(stmt)
    ]


# --- ratings -----------------------------------------------------------------

def get_or_create_rating(session: Session, team_id: str) -> models.TeamRating:
    rating = session.get(models.TeamRating, team_id)
    if rating is None:
        # Set values explicitly: SQLAlchemy column defaults only apply at flush,
        # but callers read .elo immediately (e.g. the Elo replay).
        rating = models.TeamRating(
            team_id=team_id, elo=1500.0, attack_strength=1.35,
            defence_strength=1.35, matches_played=0,
        )
        session.add(rating)
    return rating


# --- model version -----------------------------------------------------------

def ensure_model_version(session: Session, version: str, description: str = "") -> models.ModelVersion:
    mv = session.get(models.ModelVersion, version)
    if mv is None:
        mv = models.ModelVersion(model_version=version, description=description)
        session.add(mv)
    return mv


def get_model_version(session: Session, version: str) -> models.ModelVersion | None:
    return session.get(models.ModelVersion, version)


# --- predictions -------------------------------------------------------------

def latest_prediction(session: Session, fixture_id: str) -> models.Prediction | None:
    stmt = (
        select(models.Prediction)
        .where(models.Prediction.fixture_id == fixture_id)
        .order_by(models.Prediction.created_at.desc())
        .limit(1)
    )
    return session.scalars(stmt).first()


def get_prediction(session: Session, prediction_id: str) -> models.Prediction | None:
    return session.get(models.Prediction, prediction_id)


def has_result(session: Session, prediction_id: str) -> bool:
    return session.get(models.PredictionResult, prediction_id) is not None


def _aware(dt: datetime) -> datetime:
    """SQLite returns naive datetimes; normalise to aware UTC."""
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
