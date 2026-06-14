"""Elo team-rating model.

Two responsibilities:
  1. Turn two Elo ratings into a 1X2 estimate (the "team rating" model that the
     ensemble blends with the Dixon-Coles statistical model).
  2. Update ratings after a match finishes (the post-match learning loop).
"""

from __future__ import annotations

from .markets import OneXTwo

# Elo points added to the home side when computing the expectation.
HOME_FIELD_ELO = 60.0
# K-factor controls how fast ratings move after each result.
K_FACTOR = 24.0
# Baseline draw rate for evenly-matched sides; shrinks as the gap widens.
BASE_DRAW = 0.28
DRAW_DECAY = 0.0009  # per Elo point of separation
MIN_DRAW = 0.10


def expected_score(elo_home: float, elo_away: float, neutral: bool = False) -> float:
    """Home expected score in [0,1] (win = 1, draw = 0.5), incl. home field."""
    adv = 0.0 if neutral else HOME_FIELD_ELO
    diff = (elo_home + adv) - elo_away
    return 1.0 / (1.0 + 10 ** (-diff / 400.0))


def rating_outcome(elo_home: float, elo_away: float, neutral: bool = False) -> OneXTwo:
    """Split the Elo expectation into home/draw/away probabilities.

    Elo gives a combined "expected score" (win + half the draw). We model the
    draw probability separately (narrowing as the rating gap grows) and split the
    remainder into win/loss around the expectation.
    """
    adv = 0.0 if neutral else HOME_FIELD_ELO
    diff = (elo_home + adv) - elo_away
    e_home = 1.0 / (1.0 + 10 ** (-diff / 400.0))

    draw = max(MIN_DRAW, BASE_DRAW - DRAW_DECAY * abs(diff))
    home = e_home - draw / 2.0
    away = (1.0 - e_home) - draw / 2.0

    # Guard against the draw term overshooting for near-even sides.
    home = max(home, 0.0)
    away = max(away, 0.0)
    total = home + draw + away or 1.0
    return OneXTwo(
        home_win=home / total * 100,
        draw=draw / total * 100,
        away_win=away / total * 100,
    )


def updated_ratings(
    elo_home: float,
    elo_away: float,
    home_goals: int,
    away_goals: int,
    neutral: bool = False,
    k: float = K_FACTOR,
) -> tuple[float, float]:
    """Return (new_home_elo, new_away_elo) after a finished match.

    Uses a goal-difference multiplier so emphatic wins move ratings more, which
    is standard practice for football Elo (e.g. World Football Elo).
    """
    e_home = expected_score(elo_home, elo_away, neutral)
    if home_goals > away_goals:
        s_home = 1.0
    elif home_goals == away_goals:
        s_home = 0.5
    else:
        s_home = 0.0

    margin = abs(home_goals - away_goals)
    g = 1.0 if margin <= 1 else (1.5 if margin == 2 else (11 + margin) / 8.0)

    delta = k * g * (s_home - e_home)
    return elo_home + delta, elo_away - delta
