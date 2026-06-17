"""Squad-strength model.

Turns two sides' squad-strength ratings (mean club Elo of their expected XI, from
ClubElo) into a 1X2 estimate. Squad strength is on the ClubElo scale (~1300-2050),
so we reuse the same scale-agnostic Elo logistic — a side whose players come from
stronger clubs is favoured. This is the ensemble's `player_lineup` model.
"""

from __future__ import annotations

from .elo import rating_outcome
from .markets import OneXTwo


def squad_outcome(home_strength: float, away_strength: float, neutral: bool = True) -> OneXTwo:
    """1X2 from the squad-strength gap (reuses the Elo expected-score split)."""
    return rating_outcome(home_strength, away_strength, neutral=neutral)
