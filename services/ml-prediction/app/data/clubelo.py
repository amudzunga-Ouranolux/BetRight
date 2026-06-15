"""ClubElo squad-strength signal (free, no key).

National-team strength is largely the quality of the clubs its players play for.
ClubElo (http://api.clubelo.com) gives every club a continuously-updated Elo in a
single free request; this module turns a squad's club list into a strength score.

The reusable half is here: fetch ClubElo, match club names, aggregate a squad.
The one missing input is the player->club list per nation — ESPN's WC roster does
NOT expose club (its defaultTeam ref points back to the national team), so that
list must come from API-Football (squads endpoint), a scrape, or be supplied
manually. Once provided, `squad_strength(clubs)` produces the signal that can feed
the ensemble as a third model (forward-looking; not backtestable on past squads).
"""

from __future__ import annotations

import csv
import io
from difflib import get_close_matches

import httpx

CLUBELO_SNAPSHOT = "http://api.clubelo.com/{date}"

# A few hand aliases where ClubElo's short name differs from common usage.
ALIASES = {
    "manchester city": "man city",
    "manchester united": "man united",
    "paris saint-germain": "paris sg",
    "paris saint germain": "paris sg",
    "internazionale": "inter",
    "inter milan": "inter",
    "atletico madrid": "atletico",
    "tottenham hotspur": "tottenham",
    "wolverhampton": "wolves",
    "borussia dortmund": "dortmund",
    "bayern munich": "bayern",
}


def _norm(name: str) -> str:
    n = name.strip().lower()
    return ALIASES.get(n, n)


def fetch_club_elos(date: str = "2026-06-15") -> dict[str, float]:
    """Return {normalised club name -> Elo} for all clubs on the given date."""
    resp = httpx.get(CLUBELO_SNAPSHOT.format(date=date), timeout=30)
    resp.raise_for_status()
    out: dict[str, float] = {}
    for row in csv.DictReader(io.StringIO(resp.text)):
        try:
            out[_norm(row["Club"])] = float(row["Elo"])
        except (KeyError, ValueError):
            continue
    return out


def lookup(club: str, elos: dict[str, float]) -> float | None:
    """Elo for a club, with alias + fuzzy matching against the ClubElo names."""
    key = _norm(club)
    if key in elos:
        return elos[key]
    match = get_close_matches(key, elos.keys(), n=1, cutoff=0.85)
    return elos[match[0]] if match else None


def squad_strength(clubs: list[str], elos: dict[str, float], top_n: int = 16) -> dict:
    """Aggregate a squad's club Elos into a strength score.

    Returns the mean of the strongest `top_n` matched clubs, plus a 0-1 score
    scaled between a weak (1300) and elite (2050) club baseline, and match coverage.
    """
    matched = [e for c in clubs if (e := lookup(c, elos)) is not None]
    if not matched:
        return {"strength_elo": None, "score": 0.0, "matched": 0, "total": len(clubs)}
    matched.sort(reverse=True)
    top = matched[:top_n]
    mean_elo = sum(top) / len(top)
    score = max(0.0, min(1.0, (mean_elo - 1300) / (2050 - 1300)))
    return {
        "strength_elo": round(mean_elo, 1),
        "score": round(score, 3),
        "matched": len(matched),
        "total": len(clubs),
    }


# --- Demo: a few real (approx) 2026 squads' clubs to prove the join works. -------
# In production these club lists come from the player->club feed (API-Football).
_DEMO_SQUADS = {
    "France": ["Real Madrid", "Paris SG", "Bayern", "Liverpool", "Juventus", "Inter", "Marseille", "Lille", "Monaco", "Tottenham"],
    "Brazil": ["Real Madrid", "Arsenal", "Barcelona", "Newcastle", "Al Hilal", "Flamengo", "Palmeiras", "Tottenham", "West Ham", "Juventus"],
    "Argentina": ["Inter", "Atletico", "Liverpool", "Benfica", "Roma", "Tottenham", "Aston Villa", "Lyon", "Manchester United", "River Plate"],
    "Saudi Arabia": ["Al Hilal", "Al Nassr", "Al Ahli", "Al Ittihad", "Al Shabab", "Al Ettifaq", "Al Fateh", "Al Taawoun"],
}


def _demo() -> None:
    elos = fetch_club_elos()
    print(f"ClubElo snapshot: {len(elos)} clubs\n")
    ranking = []
    for nation, clubs in _DEMO_SQUADS.items():
        s = squad_strength(clubs, elos)
        ranking.append((nation, s))
    for nation, s in sorted(ranking, key=lambda x: -(x[1]["strength_elo"] or 0)):
        print(f"  {nation:14} squad-strength Elo {s['strength_elo']}  score {s['score']}  (matched {s['matched']}/{s['total']})")


if __name__ == "__main__":
    _demo()
