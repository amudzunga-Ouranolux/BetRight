"""Dixon-Coles score-matrix model.

Ports the Poisson score-matrix core from Project/predict.py and adds the
Dixon-Coles low-score correction (the tau function), which fixes the known
under-/over-statement of 0-0, 1-0, 0-1 and 1-1 that an independent Poisson model
produces. The output is a normalised home x away goal-probability matrix from
which every goal-based market is derived (see markets.py).
"""

from __future__ import annotations

from dataclasses import dataclass

from .poisson import MAX_GOALS, poisson_column

# Goal expectation safety clamp (predict.py used [0.3, 5.0]; we widen the floor a
# little for very defensive sides while keeping the upper guard).
LAMBDA_MIN = 0.2
LAMBDA_MAX = 5.5

# Dixon-Coles dependency parameter. Negative values lift low-scoring/draw cells.
# Typically fit from data (~ -0.03..-0.13); a fixed value is fine for the formula
# engine and will be re-estimated once the ML phase lands.
DEFAULT_RHO = -0.06

# Home advantage as a multiplier on the home side's expected goals.
HOME_ADVANTAGE = 1.15


@dataclass
class GoalModel:
    """The output of the Dixon-Coles step: expected goals + the score matrix."""

    home_xg: float
    away_xg: float
    matrix: list[list[float]]  # matrix[i][j] = P(home i, away j)


def expected_goals(
    home_attack: float,
    home_defence: float,
    away_attack: float,
    away_defence: float,
    league_base_goal_rate: float,
    venue: str = "home",
) -> tuple[float, float]:
    """Compute (home_xg, away_xg) from attack/defence strengths.

    Strengths are goals-per-game rates. We normalise the opponent's defensive
    weakness by the league baseline so an average defence is neutral, and apply
    the home-advantage multiplier unless the match is at a neutral venue or the
    "advantage" has been flipped to the away side.
    """
    base = max(league_base_goal_rate, 0.1)
    home_boost = 1.0
    away_boost = 1.0
    if venue == "home":
        home_boost = HOME_ADVANTAGE
    elif venue == "away":
        away_boost = HOME_ADVANTAGE

    home_xg = home_attack * (away_defence / base) * home_boost
    away_xg = away_attack * (home_defence / base) * away_boost
    return _clamp(home_xg), _clamp(away_xg)


def _clamp(lam: float) -> float:
    return max(LAMBDA_MIN, min(LAMBDA_MAX, lam))


def _tau(i: int, j: int, lam_home: float, lam_away: float, rho: float) -> float:
    """Dixon-Coles low-score correction factor."""
    if i == 0 and j == 0:
        return 1.0 - lam_home * lam_away * rho
    if i == 0 and j == 1:
        return 1.0 + lam_home * rho
    if i == 1 and j == 0:
        return 1.0 + lam_away * rho
    if i == 1 and j == 1:
        return 1.0 - rho
    return 1.0


def build_goal_model(
    home_xg: float,
    away_xg: float,
    rho: float = DEFAULT_RHO,
    max_goals: int = MAX_GOALS,
) -> GoalModel:
    """Build the normalised Dixon-Coles score matrix for the given expectations."""
    home_col = poisson_column(home_xg, max_goals)
    away_col = poisson_column(away_xg, max_goals)

    matrix = [[0.0] * (max_goals + 1) for _ in range(max_goals + 1)]
    total = 0.0
    for i in range(max_goals + 1):
        for j in range(max_goals + 1):
            p = home_col[i] * away_col[j] * _tau(i, j, home_xg, away_xg, rho)
            # tau can push a cell marginally negative for extreme rho; guard it.
            p = max(p, 0.0)
            matrix[i][j] = p
            total += p

    if total > 0:
        for i in range(max_goals + 1):
            for j in range(max_goals + 1):
                matrix[i][j] /= total

    return GoalModel(home_xg=home_xg, away_xg=away_xg, matrix=matrix)
