"""Backfill years of international results from ESPN to seed Elo with real signal.

  python -m app.data.espn_history

Pulls completed matches across the major international competitions (friendlies,
Nations League, confederation qualifiers, continental tournaments, past World
Cups) over a multi-year span and stores them under an 'intl' competition. These
feed Elo/form history so ratings reflect real team strength from match one — the
biggest free fix for the weak-Elo problem the backtest exposed.

Teams are keyed by FIFA abbreviation (same as the WC ingest) so nations line up
across competitions; existing teams are never downgraded.
"""

from __future__ import annotations

from datetime import datetime, timedelta

import httpx

from .espn import _logo, _parse_ts, _score, _team_id
from ..store import models
from ..store.db import init_db, session_scope

ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer"

INTL_LEAGUES = [
    # NB: 'fifa.world' is intentionally excluded — the World Cup is ingested
    # separately (competition_id='wc') and shares match ids, so pulling it here
    # would re-tag those matches. It still warms Elo in the backtest regardless.
    "fifa.friendly",         # international friendlies (global)
    "uefa.nations",          # UEFA Nations League
    "uefa.euro",             # European Championship
    "conmebol.america",      # Copa America
    "fifa.worldq.uefa",      # WC qualifiers by confederation
    "fifa.worldq.conmebol",
    "fifa.worldq.concacaf",
    "fifa.worldq.afc",
    "fifa.worldq.caf",
]

SPAN_START = "20210601"
SPAN_END = "20260615"


def _windows(span_start: str, span_end: str, step_days: int = 60) -> list[tuple[str, str]]:
    s = datetime.strptime(span_start, "%Y%m%d")
    e = datetime.strptime(span_end, "%Y%m%d")
    out, cur = [], s
    while cur < e:
        nxt = min(cur + timedelta(days=step_days), e)
        out.append((cur.strftime("%Y%m%d"), nxt.strftime("%Y%m%d")))
        cur = nxt + timedelta(days=1)
    return out


def _finished_events(league: str, start: str, end: str) -> list[dict]:
    try:
        resp = httpx.get(f"{ESPN_BASE}/{league}/scoreboard", params={"dates": f"{start}-{end}"}, timeout=30)
        resp.raise_for_status()
    except httpx.HTTPError:
        return []
    out = []
    for ev in resp.json().get("events", []):
        if not ev.get("status", {}).get("type", {}).get("completed"):
            continue
        comp = ev.get("competitions", [{}])[0]
        cs = comp.get("competitors", [])
        home = next((c for c in cs if c.get("homeAway") == "home"), None)
        away = next((c for c in cs if c.get("homeAway") == "away"), None)
        if not home or not away:
            continue
        hg, ag = _score(home), _score(away)
        if hg is None or ag is None:
            continue
        out.append({"event": ev, "home": home, "away": away, "hg": hg, "ag": ag, "neutral": bool(comp.get("neutralSite"))})
    return out


def ingest_history(span_start: str = SPAN_START, span_end: str = SPAN_END) -> dict:
    init_db()
    counts = {"matches": 0, "teams": 0, "requests": 0}
    seen_teams: set[str] = set()
    windows = _windows(span_start, span_end)

    with session_scope() as session:
        session.merge(models.Competition(
            competition_id="intl", name="International", country="World",
            base_goal_rate=1.3, source_name="espn",
        ))
        for league in INTL_LEAGUES:
            for start, end in windows:
                counts["requests"] += 1
                for rec in _finished_events(league, start, end):
                    for side in (rec["home"], rec["away"]):
                        team = side.get("team", {})
                        tid = _team_id(team)
                        if tid not in seen_teams and session.get(models.Team, tid) is None:
                            session.add(models.Team(
                                team_id=tid, name=team.get("displayName", tid),
                                short_name=team.get("abbreviation"), competition_id="intl",
                                logo_url=_logo(team), source_name="espn",
                            ))
                            counts["teams"] += 1
                        seen_teams.add(tid)
                    ev = rec["event"]
                    session.merge(models.Match(
                        match_id=f"espn_{ev['id']}", competition_id="intl",
                        home_team_id=_team_id(rec["home"].get("team", {})),
                        away_team_id=_team_id(rec["away"].get("team", {})),
                        kickoff_time=_parse_ts(ev.get("date")),
                        home_goals=rec["hg"], away_goals=rec["ag"], neutral=rec["neutral"],
                        source_name="espn",
                    ))
                    counts["matches"] += 1
    return counts


if __name__ == "__main__":
    print("international history:", ingest_history())
