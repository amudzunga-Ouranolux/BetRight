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
                        logo_url=team.logo_url,
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
                neutral=fx.neutral,
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
                neutral=fx.neutral,
                status=fx.status,
                source_name=source,
                source_record_id=fx.source_record_id,
            )
        )
        counts["fixtures"] += 1


def run(seasons: list[int] | None = None) -> dict:
    """Scheduler/endpoint entry point. Selects the provider and seeds Elo from the
    ingested history. ESPN needs no key; football-data needs FOOTBALL_DATA_API_KEY."""
    from ..config import get_settings
    from ..jobs.postmatch import bootstrap_ratings
    from ..store.db import session_scope

    settings = get_settings()
    if settings.provider == "football-data":
        if not settings.football_data_api_key:
            return {"skipped": "FOOTBALL_DATA_API_KEY not set"}
        provider = FootballDataProvider()
    else:
        from .espn import EspnProvider

        provider = EspnProvider()

    counts = ingest(provider, seasons)
    # Seed Elo from the freshly ingested results so predictions have signal.
    with session_scope() as session:
        counts["ratings_bootstrapped"] = bootstrap_ratings(session)
    return counts


if __name__ == "__main__":
    print("ingested:", run())
