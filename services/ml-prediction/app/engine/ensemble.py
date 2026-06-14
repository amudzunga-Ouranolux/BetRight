"""Ensemble combiner for the 1X2 outcome.

The target weighting (prediction-engine-skill/formulas.md) is:
    statistical 30 / ml 30 / team_rating 15 / player_lineup 15 / context 10

In the formula-engine milestone only the statistical (Dixon-Coles) and team_rating
(Elo) models exist, so we **renormalise the weights over the models actually
present**. Adding the ML / lineup / context models later is then a matter of
passing them in here — no downstream changes.
"""

from __future__ import annotations

from .markets import OneXTwo

TARGET_WEIGHTS = {
    "statistical": 0.30,
    "ml": 0.30,
    "team_rating": 0.15,
    "player_lineup": 0.15,
    "context": 0.10,
}


def combine(models: dict[str, OneXTwo]) -> OneXTwo:
    """Blend the supplied model outputs using renormalised target weights.

    ``models`` maps a model name (must be a key in TARGET_WEIGHTS) to its 1X2
    estimate. Missing models are simply absent; the present models' weights are
    renormalised to sum to 1.
    """
    present = {name: m for name, m in models.items() if name in TARGET_WEIGHTS}
    if not present:
        raise ValueError("ensemble.combine requires at least one known model")

    weight_total = sum(TARGET_WEIGHTS[name] for name in present)
    home = draw = away = 0.0
    for name, m in present.items():
        w = TARGET_WEIGHTS[name] / weight_total
        home += w * m.home_win
        draw += w * m.draw
        away += w * m.away_win

    total = home + draw + away or 1.0
    return OneXTwo(
        home_win=round(home / total * 100, 1),
        draw=round(draw / total * 100, 1),
        away_win=round(away / total * 100, 1),
    )


def agreement(a: OneXTwo, b: OneXTwo) -> float:
    """Agreement between two 1X2 estimates in [0,1] (1 = identical).

    Based on total variation distance over the 3-way distribution.
    """
    tvd = (
        abs(a.home_win - b.home_win)
        + abs(a.draw - b.draw)
        + abs(a.away_win - b.away_win)
    ) / 200.0  # /2 for TVD, /100 to undo percentages
    return max(0.0, 1.0 - tvd)
