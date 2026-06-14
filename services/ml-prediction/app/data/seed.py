"""Offline seed (no API key needed).

  python -m app.data.seed

Creates a small but realistic dataset — three competitions, a set of teams with
distinct strength profiles, two seasons of deterministically-generated results
(so Elo/form have signal), and a handful of upcoming fixtures — then bootstraps
Elo ratings. Lets the full pipeline run end-to-end locally without a provider.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from ..store import models
from ..store.db import init_db, session_scope
from ..jobs.postmatch import bootstrap_ratings


@dataclass
class Profile:
    team_id: str
    name: str
    short: str
    competition_id: str
    attack: float   # baseline goals scored
    defence: float  # baseline goals conceded (defensive weakness)


PROFILES = [
    # Premier League
    Profile("mci", "Manchester City", "MCI", "epl", 2.2, 0.9),
    Profile("ars", "Arsenal", "ARS", "epl", 1.9, 0.95),
    Profile("liv", "Liverpool", "LIV", "epl", 2.0, 1.0),
    Profile("che", "Chelsea", "CHE", "epl", 1.6, 1.1),
    Profile("mun", "Manchester United", "MUN", "epl", 1.5, 1.2),
    Profile("tot", "Tottenham", "TOT", "epl", 1.7, 1.25),
    # La Liga
    Profile("rma", "Real Madrid", "RMA", "laliga", 2.1, 0.9),
    Profile("fcb", "Barcelona", "FCB", "laliga", 2.0, 1.0),
    Profile("atm", "Atletico Madrid", "ATM", "laliga", 1.6, 0.85),
    Profile("sev", "Sevilla", "SEV", "laliga", 1.4, 1.2),
]

COMPETITIONS = [
    ("epl", "Premier League", "England", 1.45),
    ("laliga", "La Liga", "Spain", 1.35),
    ("ucl", "UEFA Champions League", "Europe", 1.40),
]

BY_ID = {p.team_id: p for p in PROFILES}


def _score(home: str, away: str, salt: str) -> tuple[int, int]:
    """Deterministic plausible scoreline from team strengths + a stable jitter."""
    h, a = BY_ID[home], BY_ID[away]
    lam_h = h.attack * (a.defence / 1.3) * 1.15
    lam_a = a.attack * (h.defence / 1.3)
    jh = int(hashlib.sha1(f"{home}{away}{salt}h".encode()).hexdigest(), 16) % 3 - 1
    ja = int(hashlib.sha1(f"{home}{away}{salt}a".encode()).hexdigest(), 16) % 3 - 1
    return max(0, round(lam_h) + jh), max(0, round(lam_a) + ja)


def seed() -> dict[str, int]:
    init_db()
    now = datetime.now(timezone.utc)
    counts = {"teams": 0, "matches": 0, "fixtures": 0}

    with session_scope() as session:
        for cid, name, country, base in COMPETITIONS:
            session.merge(models.Competition(
                competition_id=cid, name=name, country=country,
                base_goal_rate=base, source_name="seed",
            ))
        for p in PROFILES:
            session.merge(models.Team(
                team_id=p.team_id, name=p.name, short_name=p.short,
                competition_id=p.competition_id, source_name="seed",
            ))
            counts["teams"] += 1

        # Two seasons of double round-robin within each league.
        leagues: dict[str, list[Profile]] = {}
        for p in PROFILES:
            leagues.setdefault(p.competition_id, []).append(p)

        match_day = now - timedelta(days=720)
        for season in range(2):
            for teams in leagues.values():
                ids = [t.team_id for t in teams]
                for home in ids:
                    for away in ids:
                        if home == away:
                            continue
                        salt = f"s{season}"
                        hg, ag = _score(home, away, salt)
                        match_day += timedelta(days=3)
                        mid = f"seed_{season}_{home}_{away}"
                        session.merge(models.Match(
                            match_id=mid,
                            competition_id=BY_ID[home].competition_id,
                            home_team_id=home, away_team_id=away,
                            kickoff_time=match_day, home_goals=hg, away_goals=ag,
                            source_name="seed",
                        ))
                        counts["matches"] += 1

        # Upcoming fixtures (a domestic pair per league + two UCL cross-ties).
        upcoming = [
            ("epl", "mci", "mun", False),
            ("epl", "liv", "ars", False),
            ("laliga", "rma", "fcb", False),
            ("ucl", "mci", "rma", False),
            ("ucl", "fcb", "liv", False),
        ]
        for i, (cid, home, away, neutral) in enumerate(upcoming):
            session.merge(models.Fixture(
                fixture_id=f"seed_fx_{i+1}",
                competition_id=cid, home_team_id=home, away_team_id=away,
                kickoff_time=now + timedelta(days=2 + i), venue=BY_ID[home].name,
                neutral=neutral, status="scheduled", source_name="seed",
            ))
            counts["fixtures"] += 1

    with session_scope() as session:
        replayed = bootstrap_ratings(session)
    counts["ratings_bootstrapped"] = replayed
    return counts


if __name__ == "__main__":
    print("seeded:", seed())
