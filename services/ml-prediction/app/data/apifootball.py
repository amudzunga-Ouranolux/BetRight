"""API-Football client for national squads + player clubs.

Free tier: seasons 2022-2024, 100 requests/day. We use it to learn each national
player's current club (so ClubElo can rate the squad). A RequestBudget caps calls
per run so the daily limit is never blown, and the mapping job is resumable.

Paid-ready: the same client works for season 2026 (live World Cup) once the plan
is upgraded — only the season + key change.
"""

from __future__ import annotations

import time
from dataclasses import dataclass

import httpx

from ..config import get_settings

# Free tier allows ~10 requests/minute; space calls out to stay under it.
_MIN_INTERVAL_S = 6.5

# International competitions to skip when picking a player's CLUB from their
# season statistics (we want the club team, not the national team).
_INTERNATIONAL = {"world cup", "friendlies", "uefa nations league", "euro",
                  "copa america", "africa cup of nations", "wc qualification"}


class BudgetExceeded(Exception):
    """Raised when the per-run API-Football request cap is hit (resume next run)."""


class RequestBudget:
    def __init__(self, cap: int) -> None:
        self.cap = cap
        self.used = 0

    def spend(self) -> None:
        if self.used >= self.cap:
            raise BudgetExceeded(f"API-Football request cap reached ({self.cap})")
        self.used += 1


@dataclass
class AfPlayer:
    player_id: int
    name: str
    position: str | None


class ApiFootballClient:
    def __init__(self, budget: RequestBudget | None = None) -> None:
        s = get_settings()
        self._key = s.api_football_key
        self._base = s.api_football_base_url.rstrip("/")
        self.season = s.squad_season
        self.budget = budget or RequestBudget(s.api_football_daily_cap)
        self._last_call = 0.0
        if not self._key:
            raise RuntimeError("API_FOOTBALL_KEY is not set")

    def _get(self, path: str, params: dict) -> dict:
        self.budget.spend()
        # Throttle to respect the free per-minute limit.
        wait = _MIN_INTERVAL_S - (time.monotonic() - self._last_call)
        if wait > 0:
            time.sleep(wait)
        resp = httpx.get(
            f"{self._base}{path}", params=params,
            headers={"x-apisports-key": self._key}, timeout=30,
        )
        self._last_call = time.monotonic()
        if resp.status_code == 429:
            # Rate/quota limit hit — stop gracefully so the job resumes next run.
            raise BudgetExceeded("API-Football rate limit (429)")
        resp.raise_for_status()
        return resp.json()

    def national_teams(self, league: int = 1) -> list[tuple[int, str]]:
        """(af_team_id, name) for every nation in the competition that season."""
        data = self._get("/teams", {"league": league, "season": self.season})
        return [(t["team"]["id"], t["team"]["name"]) for t in data.get("response", [])]

    def squad(self, af_team_id: int) -> list[AfPlayer]:
        data = self._get("/players/squads", {"team": af_team_id})
        resp = data.get("response", [])
        if not resp:
            return []
        return [
            AfPlayer(player_id=p["id"], name=p["name"], position=p.get("position"))
            for p in resp[0].get("players", [])
        ]

    def player_club(self, player_id: int) -> str | None:
        """The player's club for the season (skips national-team statistics)."""
        data = self._get("/players", {"id": player_id, "season": self.season})
        resp = data.get("response", [])
        if not resp:
            return None
        club = None
        for stat in resp[0].get("statistics", []):
            league_name = (stat.get("league", {}).get("name") or "").lower()
            team_name = stat.get("team", {}).get("name")
            if not team_name:
                continue
            if any(intl in league_name for intl in _INTERNATIONAL):
                continue  # skip national-team rows
            club = team_name
            break
        return club
