"""FastAPI ML service (internal API).

The .NET BFF is the only caller; the mobile app never reaches this directly.
Reads recompute predictions on the fly (the formula engine is deterministic given
the stored data, so a recompute equals the batch-persisted row) which keeps the
read path simple and always consistent with the latest ratings.
"""

from __future__ import annotations

from collections.abc import Iterator

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from .engine.predictor import MODEL_VERSION
from .schemas import (
    FixturePredictRequest,
    ManualPredictRequest,
    ModelPerformanceOut,
    PredictionOut,
)
from .service import predict_fixture, predict_manual
from .store import repo
from .store.db import get_session, init_db

app = FastAPI(title="BetRight ML Prediction Service", version="1.0.0")


@app.on_event("startup")
def _startup() -> None:
    init_db()


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
        return predict_fixture(session, req.fixture_id, persist=False)
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
    fixtures = repo.upcoming_fixtures(session, limit=limit)
    out: list[PredictionOut] = []
    for fx in fixtures:
        try:
            out.append(predict_fixture(session, fx.fixture_id, persist=False))
        except LookupError:
            continue
    return out


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
