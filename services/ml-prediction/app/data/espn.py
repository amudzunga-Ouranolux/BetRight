"""ESPN soccer provider (free, no API key).

Uses ESPN's public JSON endpoints to pull the FIFA World Cup: nations (+ flag
logos), the full fixture list with live status / scores / neutral-site flag, and
historical results (the previous edition) so Elo has signal. Unofficial/
undocumented API — fine for live data now; football-data.org is the official
fallback (needs a key).

Events are fetched once and cached so teams() and fixtures() agree on the set of
teams (every team referenced by a match is captured → no FK gaps).
"""

from __future__ import annotations

from datetime import datetime, timezone

import httpx

from .provider import RawCompetition, RawFixture, RawTeam

ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer"
WC_LEAGUE = "fifa.world"
COMPETITION_ID = "wc"

# Date windows pulled for the men's World Cup: the previous edition (Elo priors)
# plus the current tournament window.
DEFAULT_WINDOWS = [("20221120", "20221218"), ("20260601", "20260720")]


class EspnProvider:
    source_name = "espn"

    def __init__(self, league: str = WC_LEAGUE, windows: list[tuple[str, str]] | None = None) -> None:
        self.league = league
        self.windows = windows or DEFAULT_WINDOWS
        self._events: list[dict] | None = None

    def _get(self, path: str, params: dict | None = None) -> dict:
        resp = httpx.get(f"{ESPN_BASE}{path}", params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def _load_events(self) -> list[dict]:
        if self._events is None:
            events: list[dict] = []
            for start, end in self.windows:
                data = self._get(f"/{self.league}/scoreboard", {"dates": f"{start}-{end}"})
                events.extend(data.get("events", []))
            self._events = events
        return self._events

    def competitions(self) -> list[RawCompetition]:
        return [RawCompetition(
            competition_id=COMPETITION_ID, name="FIFA World Cup", country="World",
            source_record_id=self.league,
        )]

    def teams(self, competition_id: str) -> list[RawTeam]:
        out: dict[str, RawTeam] = {}
        # Official tournament roster (with flag logos).
        data = self._get(f"/{self.league}/teams")
        for entry in data.get("sports", [{}])[0].get("leagues", [{}])[0].get("teams", []):
            t = entry.get("team", {})
            tid = _team_id(t)
            out[tid] = RawTeam(
                team_id=tid, name=t.get("displayName", tid), short_name=t.get("abbreviation"),
                competition_id=COMPETITION_ID, source_record_id=str(t.get("id")),
                logo_url=_logo(t),
            )
        # Plus every team referenced by a historical/current match (e.g. past hosts).
        for ev in self._load_events():
            for c in ev.get("competitions", [{}])[0].get("competitors", []):
                t = c.get("team", {})
                tid = _team_id(t)
                if tid not in out:
                    out[tid] = RawTeam(
                        team_id=tid, name=t.get("displayName", tid), short_name=t.get("abbreviation"),
                        competition_id=COMPETITION_ID, source_record_id=str(t.get("id")),
                        logo_url=_logo(t),
                    )
        return list(out.values())

    def fixtures(self, competition_id: str, season: int | None = None) -> list[RawFixture]:
        out: list[RawFixture] = []
        for ev in self._load_events():
            comp = ev.get("competitions", [{}])[0]
            competitors = comp.get("competitors", [])
            home = next((c for c in competitors if c.get("homeAway") == "home"), None)
            away = next((c for c in competitors if c.get("homeAway") == "away"), None)
            if not home or not away:
                continue
            st = ev.get("status", {}).get("type", {})
            status = "finished" if st.get("completed") else ("live" if st.get("state") == "in" else "scheduled")
            out.append(RawFixture(
                fixture_id=f"espn_{ev['id']}",
                competition_id=COMPETITION_ID,
                home_team_id=_team_id(home.get("team", {})),
                away_team_id=_team_id(away.get("team", {})),
                kickoff_time=_parse_ts(ev.get("date")),
                status=status,
                home_goals=_score(home),
                away_goals=_score(away),
                source_record_id=str(ev["id"]),
                neutral=bool(comp.get("neutralSite")),
            ))
        return out


def _team_id(team: dict) -> str:
    abbr = team.get("abbreviation")
    return abbr.lower() if abbr else f"t{team.get('id')}"


def _logo(team: dict) -> str | None:
    if team.get("logos"):
        return team["logos"][0].get("href")
    return team.get("logo")


def _score(competitor: dict) -> int | None:
    raw = competitor.get("score")
    if raw is None:
        return None
    try:
        return int(str(raw))
    except ValueError:
        return None


def _parse_ts(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
