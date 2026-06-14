"""FastAPI ML service (internal API).

The .NET BFF is the only caller; the mobile app never reaches this directly.
Reads are served from STORED predictions (the batch job + scheduler keep them
fresh); a miss computes and persists on the fly. A background scheduler refreshes
predictions and runs the post-match learning loop.
"""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from .config import get_settings
from .engine.predictor import MODEL_VERSION
from .jobs.predict_batch import run as run_predict_batch
from .schemas import (
    CompetitionProfileOut,
    FixturePredictRequest,
    ManualPredictRequest,
    ModelPerformanceOut,
    PredictionOut,
    TeamProfileOut,
)
from .service import (
    competition_profile,
    get_or_create_prediction,
    predict_manual,
    team_profile,
)
from .store import repo
from .store.db import get_session, init_db, session_scope

_scheduler = None  # APScheduler instance when enabled


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    settings = get_settings()
    global _scheduler
    if settings.scheduler_enabled:
        from apscheduler.schedulers.background import BackgroundScheduler

        from .jobs.postmatch import bootstrap_ratings, run_postmatch

        def _postmatch() -> None:
            with session_scope() as s:
                run_postmatch(s)

        _scheduler = BackgroundScheduler(daemon=True)
        _scheduler.add_job(run_predict_batch, "interval", minutes=settings.predict_interval_minutes, id="predict")
        _scheduler.add_job(_postmatch, "interval", minutes=settings.postmatch_interval_minutes, id="postmatch")
        _scheduler.start()
    try:
        yield
    finally:
        if _scheduler is not None:
            _scheduler.shutdown(wait=False)


app = FastAPI(title="BetRight ML Prediction Service", version="1.0.0", lifespan=lifespan)


def db() -> Iterator[Session]:
    session = get_session()
    try:
        yield session
    finally:
        session.close()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_version": MODEL_VERSION}


@app.post("/internal/predict", response_model=PredictionOut)
def predict_one(req: FixturePredictRequest, session: Session = Depends(db)) -> PredictionOut:
    try:
        return get_or_create_prediction(session, req.fixture_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/internal/predict/manual", response_model=PredictionOut)
def predict_manual_route(req: ManualPredictRequest, session: Session = Depends(db)) -> PredictionOut:
    try:
        return predict_manual(session, req.home_team_id, req.away_team_id, req.venue)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/internal/predictions/upcoming", response_model=list[PredictionOut])
def upcoming(limit: int = 50, session: Session = Depends(db)) -> list[PredictionOut]:
    out: list[PredictionOut] = []
    for fx in repo.upcoming_fixtures(session, limit=limit):
        try:
            out.append(get_or_create_prediction(session, fx.fixture_id))
        except LookupError:
            continue
    return out


@app.get("/internal/teams/{team_id}", response_model=TeamProfileOut)
def team(team_id: str, session: Session = Depends(db)) -> TeamProfileOut:
    try:
        return team_profile(session, team_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/internal/competitions/{competition_id}", response_model=CompetitionProfileOut)
def competition(competition_id: str, session: Session = Depends(db)) -> CompetitionProfileOut:
    try:
        return competition_profile(session, competition_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/internal/models/performance", response_model=ModelPerformanceOut)
def model_performance(session: Session = Depends(db)) -> ModelPerformanceOut:
    mv = repo.get_model_version(session, MODEL_VERSION)
    if mv is None:
        return ModelPerformanceOut(model_version=MODEL_VERSION, sample_size=0)
    return ModelPerformanceOut(
        model_version=mv.model_version,
        accuracy=mv.accuracy,
        brier_score=mv.brier_score,
        log_loss=mv.log_loss,
        sample_size=mv.sample_size,
    )


@app.post("/internal/jobs/predict")
def trigger_predict() -> dict:
    return run_predict_batch()


@app.post("/internal/jobs/postmatch")
def trigger_postmatch() -> dict:
    from .jobs.postmatch import run_postmatch

    with session_scope() as s:
        return run_postmatch(s)
