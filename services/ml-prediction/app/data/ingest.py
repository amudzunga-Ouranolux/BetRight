"""Ingestion job: pull reference data + fixtures/results from a provider into the DB.

  python -m app.data.ingest                 # uses football-data.org (needs API key)

Finished matches land in `matches` (history for Elo/form); scheduled/live land in
`fixtures` (prediction targets). Provenance (source_name/source_record_id) is
stored on every row.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from ..store import models
from ..store.db import init_db, session_scope
from .provider import FootballDataProvider, Provider, RawFixture


def ingest(provider: Provider, seasons: list[int] | None = None) -> dict[str, int]:
    counts = {"competitions": 0, "teams": 0, "fixtures": 0, "matches": 0}
    init_db()
    with session_scope() as session:
        for comp in provider.competitions():
            session.merge(
                models.Competition(
                    competition_id=comp.competition_id,
                    name=comp.name,
                    country=comp.country,
                    source_name=provider.source_name,
                    source_record_id=comp.source_record_id,
                )
            )
            counts["competitions"] += 1

            for team in provider.teams(comp.competition_id):
                session.merge(
                    models.Team(
                        team_id=team.team_id,
                        name=team.name,
                        short_name=team.short_name,
                        competition_id=team.competition_id,
                        source_name=provider.source_name,
                        source_record_id=team.source_record_id,
                    )
                )
                counts["teams"] += 1

            target_seasons = seasons or [None]
            for season in target_seasons:
                for fx in provider.fixtures(comp.competition_id, season):
                    _upsert_fixture(session, provider.source_name, fx, counts)

    return counts


def _upsert_fixture(session: Session, source: str, fx: RawFixture, counts: dict) -> None:
    if fx.status == "finished" and fx.home_goals is not None and fx.away_goals is not None:
        session.merge(
            models.Match(
                match_id=fx.fixture_id,
                competition_id=fx.competition_id,
                home_team_id=fx.home_team_id,
                away_team_id=fx.away_team_id,
                kickoff_time=fx.kickoff_time,
                home_goals=fx.home_goals,
                away_goals=fx.away_goals,
                source_name=source,
                source_record_id=fx.source_record_id,
            )
        )
        counts["matches"] += 1
    else:
        session.merge(
            models.Fixture(
                fixture_id=fx.fixture_id,
                competition_id=fx.competition_id,
                home_team_id=fx.home_team_id,
                away_team_id=fx.away_team_id,
                kickoff_time=fx.kickoff_time,
                status=fx.status,
                source_name=source,
                source_record_id=fx.source_record_id,
            )
        )
        counts["fixtures"] += 1


if __name__ == "__main__":
    result = ingest(FootballDataProvider())
    print("ingested:", result)
