"""Pydantic request/response models for the internal ML API.

snake_case field names per prediction-engine-skill/model-outputs.md. The .NET BFF
maps these to the camelCase DTOs the mobile app expects.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class TeamOut(BaseModel):
    team_id: str
    name: str
    short_name: str | None = None


class OutcomeOut(BaseModel):
    home_win: float
    draw: float
    away_win: float


class ExpectedGoalsOut(BaseModel):
    home_xg: float
    away_xg: float


class ScorelineOut(BaseModel):
    score: str
    home_goals: int
    away_goals: int
    probability: float
    rank: int


class MarketsOut(BaseModel):
    over15: float
    over25: float
    over35: float
    under25: float
    btts_yes: float
    btts_no: float
    clean_sheet_home: float
    clean_sheet_away: float


class ConfidenceOut(BaseModel):
    score: int
    label: str


class ReasonOut(BaseModel):
    title: str
    description: str
    impact: str
    strength: float


class ExplanationOut(BaseModel):
    headline: str
    summary: str
    key_reasons: list[ReasonOut]
    risk_factors: list[ReasonOut]


class PredictionOut(BaseModel):
    prediction_id: str
    fixture_id: str
    model_version: str
    generated_at: str
    competition_id: str | None = None
    competition_name: str | None = None
    kickoff_time: str | None = None
    home_team: TeamOut
    away_team: TeamOut
    predicted_result: str
    outcome: OutcomeOut
    expected_goals: ExpectedGoalsOut
    likely_score: str
    likely_scorelines: list[ScorelineOut]
    markets: MarketsOut
    confidence: ConfidenceOut
    data_quality_score: float
    explanation: ExplanationOut
    feature_snapshot_id: str | None = None


class ManualPredictRequest(BaseModel):
    home_team_id: str
    away_team_id: str
    venue: Literal["home", "neutral", "away"] = "home"


class FormBreakdownOut(BaseModel):
    results: list[str]
    goals_scored: float
    goals_conceded: float


class H2HOut(BaseModel):
    home_goals: int
    away_goals: int


class KeyStatOut(BaseModel):
    label: str
    home: float
    away: float
    unit: str | None = None
    lower_is_better: bool = False


class ManualBreakdownOut(BaseModel):
    home_form: FormBreakdownOut
    away_form: FormBreakdownOut
    h2h: list[H2HOut]
    key_stats: list[KeyStatOut]
    tip: str


class ManualPredictionOut(BaseModel):
    prediction: PredictionOut
    breakdown: ManualBreakdownOut


class FixturePredictRequest(BaseModel):
    fixture_id: str


class ModelPerformanceOut(BaseModel):
    model_version: str
    accuracy: float | None = None
    brier_score: float | None = None
    log_loss: float | None = None
    sample_size: int


class TeamFormOut(BaseModel):
    attack_strength: float
    defence_strength: float
    matches_sampled: int
    goals_scored_avg: float
    goals_conceded_avg: float
    recent_results: list[str]


class TeamProfileOut(BaseModel):
    team: TeamOut
    competition_id: str | None = None
    competition_name: str | None = None
    elo: float
    form: TeamFormOut
    upcoming: list[PredictionOut]


class StandingRow(BaseModel):
    team: TeamOut
    elo: float
    matches_played: int


class CompetitionProfileOut(BaseModel):
    competition_id: str
    name: str
    table: list[StandingRow]
    upcoming: list[PredictionOut]
