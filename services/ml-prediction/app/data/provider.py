"""Football data provider abstraction.

The engine and ingest job depend only on these dataclasses + the Provider
protocol, so swapping football-data.org for API-Football or a licensed feed later
is a single new implementation — nothing downstream changes.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Protocol

import httpx

from ..config import get_settings


@dataclass
class RawCompetition:
    competition_id: str
    name: str
    country: str | None
    source_record_id: str
    logo_url: str | None = None


@dataclass
class RawTeam:
    team_id: str
    name: str
    short_name: str | None
    competition_id: str
    source_record_id: str
    logo_url: str | None = None


@dataclass
class RawFixture:
    fixture_id: str
    competition_id: str
    home_team_id: str
    away_team_id: str
    kickoff_time: datetime
    status: str            # scheduled|live|finished
    home_goals: int | None
    away_goals: int | None
    source_record_id: str
    neutral: bool = False


class Provider(Protocol):
    source_name: str

    def competitions(self) -> list[RawCompetition]: ...
    def teams(self, competition_id: str) -> list[RawTeam]: ...
    def fixtures(self, competition_id: str, season: int | None = None) -> list[RawFixture]: ...


# --- football-data.org -------------------------------------------------------

# Map football-data.org competition codes to our internal ids.
FD_COMPETITIONS = {
    "PL": "epl",
    "PD": "laliga",
    "SA": "seriea",
    "BL1": "bundesliga",
    "FL1": "ligue1",
    "CL": "ucl",
}


class FootballDataProvider:
    """Client for https://www.football-data.org/ (free tier covers top leagues)."""

    source_name = "football-data.org"

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        settings = get_settings()
        self._key = api_key or settings.football_data_api_key
        self._base = (base_url or settings.football_data_base_url).rstrip("/")
        if not self._key:
            raise RuntimeError(
                "FOOTBALL_DATA_API_KEY is not set — use the offline seed for local dev."
            )

    def _get(self, path: str, params: dict | None = None) -> dict:
        resp = httpx.get(
            f"{self._base}{path}",
            headers={"X-Auth-Token": self._key},
            params=params,
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

    def competitions(self) -> list[RawCompetition]:
        out = []
        for code, internal in FD_COMPETITIONS.items():
            data = self._get(f"/competitions/{code}")
            out.append(
                RawCompetition(
                    competition_id=internal,
                    name=data.get("name", internal),
                    country=(data.get("area") or {}).get("name"),
                    source_record_id=str(data.get("id", code)),
                )
            )
        return out

    def teams(self, competition_id: str) -> list[RawTeam]:
        code = _code_for(competition_id)
        data = self._get(f"/competitions/{code}/teams")
        out = []
        for t in data.get("teams", []):
            tid = _slug(t.get("tla") or t.get("shortName") or t.get("name"))
            out.append(
                RawTeam(
                    team_id=tid,
                    name=t.get("name", tid),
                    short_name=t.get("tla") or t.get("shortName"),
                    competition_id=competition_id,
                    source_record_id=str(t.get("id")),
                )
            )
        return out

    def fixtures(self, competition_id: str, season: int | None = None) -> list[RawFixture]:
        code = _code_for(competition_id)
        params = {"season": season} if season else None
        data = self._get(f"/competitions/{code}/matches", params=params)
        out = []
        for m in data.get("matches", []):
            home = m.get("homeTeam", {})
            away = m.get("awayTeam", {})
            home_id = _slug(home.get("tla") or home.get("shortName") or home.get("name"))
            away_id = _slug(away.get("tla") or away.get("shortName") or away.get("name"))
            score = (m.get("score") or {}).get("fullTime") or {}
            status = _map_status(m.get("status", "SCHEDULED"))
            out.append(
                RawFixture(
                    fixture_id=f"fd_{m.get('id')}",
                    competition_id=competition_id,
                    home_team_id=home_id,
                    away_team_id=away_id,
                    kickoff_time=_parse_ts(m.get("utcDate")),
                    status=status,
                    home_goals=score.get("home"),
                    away_goals=score.get("away"),
                    source_record_id=str(m.get("id")),
                )
            )
        return out


def _code_for(competition_id: str) -> str:
    for code, internal in FD_COMPETITIONS.items():
        if internal == competition_id:
            return code
    raise ValueError(f"no football-data.org code for competition '{competition_id}'")


def _slug(name: str | None) -> str:
    return (name or "unknown").lower().replace(" ", "-")


def _map_status(s: str) -> str:
    if s in ("FINISHED", "AWARDED"):
        return "finished"
    if s in ("IN_PLAY", "PAUSED"):
        return "live"
    return "scheduled"


def _parse_ts(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
