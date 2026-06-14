"""SQLAlchemy ORM models.

Portable column types (JSON, not JSONB) so the same models run on SQLite for
offline dev and Postgres in production. The raw Postgres schema in
db/migrations/0001_init.sql is the source of truth for the docker/prod database;
these models mirror it and can `create_all` a SQLite db for local runs.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import JSON as _JSON

# JSONB on Postgres (queryable), plain JSON on SQLite (dev/tests) — one column type
# that adapts to the dialect, so there's no schema drift between the two.
JSONFlex = _JSON().with_variant(JSONB, "postgresql")


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Competition(Base):
    __tablename__ = "competitions"
    competition_id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    sport_code: Mapped[str] = mapped_column(String, default="football")
    base_goal_rate: Mapped[float] = mapped_column(Float, default=1.35)
    source_name: Mapped[str | None] = mapped_column(String, nullable=True)
    source_record_id: Mapped[str | None] = mapped_column(String, nullable=True)
    ingest_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Team(Base):
    __tablename__ = "teams"
    team_id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    short_name: Mapped[str | None] = mapped_column(String, nullable=True)
    competition_id: Mapped[str | None] = mapped_column(
        ForeignKey("competitions.competition_id"), nullable=True
    )
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    source_name: Mapped[str | None] = mapped_column(String, nullable=True)
    source_record_id: Mapped[str | None] = mapped_column(String, nullable=True)
    ingest_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Fixture(Base):
    __tablename__ = "fixtures"
    fixture_id: Mapped[str] = mapped_column(String, primary_key=True)
    competition_id: Mapped[str] = mapped_column(ForeignKey("competitions.competition_id"))
    home_team_id: Mapped[str] = mapped_column(ForeignKey("teams.team_id"))
    away_team_id: Mapped[str] = mapped_column(ForeignKey("teams.team_id"))
    kickoff_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    venue: Mapped[str | None] = mapped_column(String, nullable=True)
    neutral: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String, default="scheduled")
    source_name: Mapped[str | None] = mapped_column(String, nullable=True)
    source_record_id: Mapped[str | None] = mapped_column(String, nullable=True)
    ingest_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Match(Base):
    __tablename__ = "matches"
    match_id: Mapped[str] = mapped_column(String, primary_key=True)
    competition_id: Mapped[str] = mapped_column(ForeignKey("competitions.competition_id"))
    home_team_id: Mapped[str] = mapped_column(ForeignKey("teams.team_id"))
    away_team_id: Mapped[str] = mapped_column(ForeignKey("teams.team_id"))
    kickoff_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    home_goals: Mapped[int] = mapped_column(Integer)
    away_goals: Mapped[int] = mapped_column(Integer)
    neutral: Mapped[bool] = mapped_column(Boolean, default=False)
    source_name: Mapped[str | None] = mapped_column(String, nullable=True)
    source_record_id: Mapped[str | None] = mapped_column(String, nullable=True)
    ingest_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class TeamRating(Base):
    __tablename__ = "team_ratings"
    team_id: Mapped[str] = mapped_column(ForeignKey("teams.team_id"), primary_key=True)
    elo: Mapped[float] = mapped_column(Float, default=1500.0)
    attack_strength: Mapped[float] = mapped_column(Float, default=1.35)
    defence_strength: Mapped[float] = mapped_column(Float, default=1.35)
    matches_played: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class TeamRatingHistory(Base):
    __tablename__ = "team_rating_history"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    team_id: Mapped[str] = mapped_column(ForeignKey("teams.team_id"))
    match_id: Mapped[str | None] = mapped_column(String, nullable=True)
    old_elo: Mapped[float] = mapped_column(Float)
    new_elo: Mapped[float] = mapped_column(Float)
    reason: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class ModelVersion(Base):
    __tablename__ = "model_versions"
    model_version: Mapped[str] = mapped_column(String, primary_key=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    trained_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    brier_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    log_loss: Mapped[float | None] = mapped_column(Float, nullable=True)
    accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class FeatureSnapshot(Base):
    __tablename__ = "feature_snapshot"
    feature_snapshot_id: Mapped[str] = mapped_column(String, primary_key=True)
    fixture_id: Mapped[str] = mapped_column(String)
    as_of: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    data_quality_score: Mapped[float] = mapped_column(Float)
    features_json: Mapped[dict] = mapped_column(JSONFlex)
    source_manifest: Mapped[dict | None] = mapped_column(JSONFlex, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Prediction(Base):
    __tablename__ = "predictions"
    prediction_id: Mapped[str] = mapped_column(String, primary_key=True)
    fixture_id: Mapped[str] = mapped_column(String)
    model_version: Mapped[str] = mapped_column(ForeignKey("model_versions.model_version"))
    home_win_probability: Mapped[float] = mapped_column(Float)
    draw_probability: Mapped[float] = mapped_column(Float)
    away_win_probability: Mapped[float] = mapped_column(Float)
    home_xg: Mapped[float] = mapped_column(Float)
    away_xg: Mapped[float] = mapped_column(Float)
    likely_score: Mapped[str | None] = mapped_column(String, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float)
    confidence_label: Mapped[str] = mapped_column(String)
    data_quality_score: Mapped[float] = mapped_column(Float)
    markets_json: Mapped[dict] = mapped_column(JSONFlex)
    explanation_json: Mapped[dict] = mapped_column(JSONFlex)
    feature_snapshot_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class PredictionResult(Base):
    __tablename__ = "prediction_results"
    prediction_id: Mapped[str] = mapped_column(
        ForeignKey("predictions.prediction_id"), primary_key=True
    )
    actual_home_goals: Mapped[int] = mapped_column(Integer)
    actual_away_goals: Mapped[int] = mapped_column(Integer)
    result_correct: Mapped[bool] = mapped_column(Boolean)
    scoreline_correct: Mapped[bool] = mapped_column(Boolean)
    brier_score: Mapped[float] = mapped_column(Float)
    log_loss: Mapped[float] = mapped_column(Float)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


# ---------------------------------------------------------------------------
# User domain. Owned by the BFF at runtime (Dapper), but defined here so Alembic
# is the single schema authority across both services.
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"
    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    display_name: Mapped[str] = mapped_column(String)
    # PBKDF2 hash (set by the BFF on register); null for the seeded dev user.
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True)
    token_hash: Mapped[str] = mapped_column(String, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class UserPreference(Base):
    __tablename__ = "user_preferences"
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
    odds_format: Mapped[str] = mapped_column(String, default="decimal")
    kit_id: Mapped[str] = mapped_column(String, default="home-kit")
    text_size: Mapped[str] = mapped_column(String, default="default")
    notify_predictions: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_results: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_news: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class UserFavourite(Base):
    __tablename__ = "user_favourites"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True)
    kind: Mapped[str] = mapped_column(String)        # 'team' | 'league'
    ref_id: Mapped[str] = mapped_column(String)      # team_id or competition_id
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class SavedPrediction(Base):
    __tablename__ = "saved_predictions"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True)
    fixture_id: Mapped[str] = mapped_column(String)
    snapshot_json: Mapped[dict] = mapped_column(JSONFlex)  # MatchPrediction at save time
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True)
    kind: Mapped[str] = mapped_column(String)        # prediction|result|news|alert
    title: Mapped[str] = mapped_column(String)
    body: Mapped[str] = mapped_column(String)
    fixture_id: Mapped[str | None] = mapped_column(String, nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str | None] = mapped_column(String, nullable=True)
    action: Mapped[str] = mapped_column(String)
    entity: Mapped[str | None] = mapped_column(String, nullable=True)
    entity_id: Mapped[str | None] = mapped_column(String, nullable=True)
    meta_json: Mapped[dict | None] = mapped_column(JSONFlex, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
