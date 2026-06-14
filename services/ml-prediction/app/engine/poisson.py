"""Poisson helpers (pure Python, no numpy/scipy dependency).

The original Project/predict.py used scipy's ``poisson.pmf``; we reimplement the
small amount of maths we need in the standard library so the engine runs and is
testable anywhere (numpy stays optional, for the later ML phase only).
"""

from __future__ import annotations

import math

# Goal grid is truncated at this many goals per side (matches predict.py MAX_GOALS).
MAX_GOALS = 10


def poisson_pmf(k: int, lam: float) -> float:
    """P(X = k) for X ~ Poisson(lam)."""
    if lam <= 0:
        return 1.0 if k == 0 else 0.0
    return math.exp(-lam) * (lam**k) / math.factorial(k)


def poisson_column(lam: float, max_goals: int = MAX_GOALS) -> list[float]:
    """Probability of scoring 0..max_goals goals for a Poisson(lam) side."""
    return [poisson_pmf(k, lam) for k in range(max_goals + 1)]
