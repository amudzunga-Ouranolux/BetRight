"""Derive every goal-based market from the Dixon-Coles score matrix.

All probabilities are returned as percentages (0-100), rounded for display, to
match the shape the app/BFF expect. Internally we work in 0-1 then convert.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .dixon_coles import GoalModel


@dataclass
class OneXTwo:
    home_win: float
    draw: float
    away_win: float


@dataclass
class Scoreline:
    score: str
    home_goals: int
    away_goals: int
    probability: float  # percentage
    rank: int


@dataclass
class Markets:
    over15: float
    over25: float
    over35: float
    under25: float
    btts_yes: float
    btts_no: float
    clean_sheet_home: float
    clean_sheet_away: float
    scorelines: list[Scoreline] = field(default_factory=list)


def outcome_probabilities(model: GoalModel) -> OneXTwo:
    """1X2 from the score matrix (home > away below the diagonal, etc.)."""
    home = draw = away = 0.0
    for i, row in enumerate(model.matrix):
        for j, p in enumerate(row):
            if i > j:
                home += p
            elif i == j:
                draw += p
            else:
                away += p
    total = home + draw + away or 1.0
    return OneXTwo(
        home_win=home / total * 100,
        draw=draw / total * 100,
        away_win=away / total * 100,
    )


def _total_goals_distribution(model: GoalModel) -> list[float]:
    """P(total goals == n) for n = 0..2*max_goals."""
    size = len(model.matrix)
    dist = [0.0] * (2 * size)
    for i, row in enumerate(model.matrix):
        for j, p in enumerate(row):
            dist[i + j] += p
    return dist


def derive_markets(model: GoalModel, top_n_scorelines: int = 5) -> Markets:
    dist = _total_goals_distribution(model)
    over15 = sum(dist[n] for n in range(2, len(dist)))
    over25 = sum(dist[n] for n in range(3, len(dist)))
    over35 = sum(dist[n] for n in range(4, len(dist)))
    under25 = 1.0 - over25

    # BTTS: both score at least one. P(home>=1) and P(away>=1) read off the matrix.
    p_home_zero = sum(model.matrix[0])  # home scores 0
    p_away_zero = sum(row[0] for row in model.matrix)  # away scores 0
    p_both_zero = model.matrix[0][0]
    # P(home>=1 AND away>=1) via inclusion-exclusion on the joint matrix.
    btts_yes = 1.0 - p_home_zero - p_away_zero + p_both_zero
    btts_no = 1.0 - btts_yes

    clean_sheet_home = p_away_zero  # away fails to score
    clean_sheet_away = p_home_zero  # home fails to score

    scorelines = _top_scorelines(model, top_n_scorelines)

    return Markets(
        over15=round(over15 * 100, 1),
        over25=round(over25 * 100, 1),
        over35=round(over35 * 100, 1),
        under25=round(under25 * 100, 1),
        btts_yes=round(btts_yes * 100, 1),
        btts_no=round(btts_no * 100, 1),
        clean_sheet_home=round(clean_sheet_home * 100, 1),
        clean_sheet_away=round(clean_sheet_away * 100, 1),
        scorelines=scorelines,
    )


def _top_scorelines(model: GoalModel, n: int) -> list[Scoreline]:
    cells = [
        (i, j, p)
        for i, row in enumerate(model.matrix)
        for j, p in enumerate(row)
    ]
    cells.sort(key=lambda c: c[2], reverse=True)
    out: list[Scoreline] = []
    for rank, (i, j, p) in enumerate(cells[:n], start=1):
        out.append(
            Scoreline(
                score=f"{i} - {j}",
                home_goals=i,
                away_goals=j,
                probability=round(p * 100, 1),
                rank=rank,
            )
        )
    return out


def most_likely_score(model: GoalModel) -> str:
    best = (0, 0, -1.0)
    for i, row in enumerate(model.matrix):
        for j, p in enumerate(row):
            if p > best[2]:
                best = (i, j, p)
    return f"{best[0]} - {best[1]}"
