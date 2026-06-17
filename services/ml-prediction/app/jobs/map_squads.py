"""Map national squads -> player clubs -> ClubElo -> team squad strength.

  python -m app.jobs.map_squads                 # all WC nations (budget-capped)
  python -m app.jobs.map_squads --teams arg,fra # target specific nations
  python -m app.jobs.map_squads --seed file.csv # offline: national_team_id,player_name,club_name

API-Football's free tier is 100 req/day, so this is budget-capped and resumable:
players already mapped for the season are skipped, so re-running continues where it
left off. Each mapped nation's `team_squad_strength` is (re)computed from the
strongest club Elos in its squad.
"""

from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
from difflib import get_close_matches

from sqlalchemy import select

from ..config import get_settings
from ..data import clubelo
from ..data.apifootball import ApiFootballClient, BudgetExceeded, RequestBudget
from ..store import models
from ..store.db import init_db, session_scope

TOP_N = 16  # squad strength = mean of the strongest N club Elos


def _team_index(session) -> dict[str, str]:
    """Lowercased team name -> our team_id, for matching provider nation names."""
    return {t.name.lower(): t.team_id for t in session.scalars(select(models.Team))}


def _resolve(name: str, index: dict[str, str]) -> str | None:
    key = name.lower()
    if key in index:
        return index[key]
    match = get_close_matches(key, index.keys(), n=1, cutoff=0.85)
    return index[match[0]] if match else None


def _aggregate(session, team_id: str, season: int) -> dict:
    snaps = list(session.scalars(
        select(models.PlayerClubSnapshot).where(
            models.PlayerClubSnapshot.national_team_id == team_id,
            models.PlayerClubSnapshot.season == season,
        )
    ))
    elos = sorted((s.club_elo for s in snaps if s.club_elo is not None), reverse=True)
    matched, total = len(elos), len(snaps)
    if elos:
        top = elos[:TOP_N]
        strength = sum(top) / len(top)
        score = max(0.0, min(1.0, (strength - 1300) / (2050 - 1300)))
    else:
        strength, score = None, 0.0

    existing = session.scalars(
        select(models.TeamSquadStrength).where(
            models.TeamSquadStrength.team_id == team_id,
            models.TeamSquadStrength.season == season,
        )
    ).first()
    if existing is None:
        existing = models.TeamSquadStrength(team_id=team_id, season=season)
        session.add(existing)
    existing.strength_elo = strength
    existing.score = score
    existing.matched = matched
    existing.total = total
    existing.as_of = datetime.now(timezone.utc)
    return {"team": team_id, "strength": strength, "matched": matched, "total": total}


def run_api(only_teams: list[str] | None = None) -> dict:
    init_db()
    settings = get_settings()
    season = settings.squad_season
    elos = clubelo.fetch_club_elos()
    budget = RequestBudget(settings.api_football_daily_cap)
    counts = {"nations": 0, "players": 0, "requests_used": 0}

    with session_scope() as session:
        index = _team_index(session)
        try:
            client = ApiFootballClient(budget=budget)
            for af_id, af_name in client.national_teams():
                team_id = _resolve(af_name, index)
                if team_id is None or (only_teams and team_id not in only_teams):
                    continue
                for ap in client.squad(af_id):
                    already = session.scalars(
                        select(models.PlayerClubSnapshot).where(
                            models.PlayerClubSnapshot.player_id == ap.player_id,
                            models.PlayerClubSnapshot.season == season,
                        )
                    ).first()
                    if already is not None:
                        continue
                    club = client.player_club(ap.player_id)
                    session.add(models.PlayerClubSnapshot(
                        player_id=ap.player_id, name=ap.name, national_team_id=team_id,
                        season=season, club_name=club,
                        club_elo=clubelo.lookup(club, elos) if club else None,
                        position=ap.position,
                    ))
                    counts["players"] += 1
                session.flush()
                _aggregate(session, team_id, season)
                counts["nations"] += 1
        except BudgetExceeded:
            print("  (request budget reached — resume with another run)")
        counts["requests_used"] = budget.used
    return counts


def run_seed(path: str) -> dict:
    """Offline: load player->club from a CSV (national_team_id,player_name,club_name)."""
    init_db()
    season = get_settings().squad_season
    elos = clubelo.fetch_club_elos()
    counts = {"players": 0, "nations": 0}
    teams = set()
    with session_scope() as session, open(path, newline="", encoding="utf-8") as fh:
        for i, row in enumerate(csv.DictReader(fh)):
            team_id = row["national_team_id"].strip()
            club = row["club_name"].strip()
            session.add(models.PlayerClubSnapshot(
                player_id=-(i + 1), name=row["player_name"].strip(), national_team_id=team_id,
                season=season, club_name=club, club_elo=clubelo.lookup(club, elos), position=None,
            ))
            counts["players"] += 1
            teams.add(team_id)
        session.flush()
        for team_id in teams:
            _aggregate(session, team_id, season)
        counts["nations"] = len(teams)
    return counts


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--teams", help="comma-separated our team_ids to target")
    ap.add_argument("--seed", help="CSV: national_team_id,player_name,club_name")
    args = ap.parse_args()
    if args.seed:
        print("seeded:", run_seed(args.seed))
    else:
        only = [t.strip() for t in args.teams.split(",")] if args.teams else None
        print("mapped:", run_api(only))
