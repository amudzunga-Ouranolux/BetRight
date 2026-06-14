"""Batch prediction job (Phase 3).

  python -m app.jobs.predict_batch

Generates and stores a prediction for every upcoming fixture so the read APIs are
fast (precomputed). Safe to run repeatedly — each run stores a fresh prediction
row (predictions are immutable history; the latest is served).
"""

from __future__ import annotations

from ..service import predict_fixture
from ..store import repo
from ..store.db import init_db, session_scope


def run() -> dict[str, int]:
    init_db()
    counts = {"predicted": 0, "skipped": 0}
    with session_scope() as session:
        fixtures = repo.upcoming_fixtures(session)
    for fx in fixtures:
        with session_scope() as session:
            try:
                predict_fixture(session, fx.fixture_id, persist=True)
                counts["predicted"] += 1
            except LookupError:
                counts["skipped"] += 1
    return counts


if __name__ == "__main__":
    print("predict_batch:", run())
