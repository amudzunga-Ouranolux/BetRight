"""Probability calibration (dependency-free).

Football models tend to be over/under-confident. We measure this from scored
predictions (post-match results) and derive a single temperature `T` applied to
the 1X2 distribution before serving:
  * T > 1 softens (flattens) probabilities  -> fixes over-confidence
  * T < 1 sharpens probabilities            -> fixes under-confidence

This is a lightweight, transparent alternative to a learned calibrator (Platt /
isotonic), which the ML phase can replace later.
"""

from __future__ import annotations

T_MIN = 0.5
T_MAX = 2.0


def apply_temperature(home: float, draw: float, away: float, t: float) -> tuple[float, float, float]:
    """Temperature-scale a 1X2 distribution given as percentages (0-100)."""
    if t <= 0 or abs(t - 1.0) < 1e-6:
        return home, draw, away
    ps = [max(p, 1e-9) / 100.0 for p in (home, draw, away)]
    adj = [p ** (1.0 / t) for p in ps]
    total = sum(adj) or 1.0
    return tuple(round(a / total * 100, 1) for a in adj)  # type: ignore[return-value]


def estimate_temperature(pairs: list[tuple[float, bool]]) -> float:
    """Estimate T from (top_probability_fraction, was_correct) pairs.

    Compares mean predicted confidence to the observed accuracy: if the model
    predicts 70% on average but only wins 55%, it's over-confident (T > 1).
    """
    if len(pairs) < 10:
        return 1.0  # not enough signal; stay neutral
    avg_conf = sum(p for p, _ in pairs) / len(pairs)
    accuracy = sum(1 for _, c in pairs if c) / len(pairs)
    if accuracy <= 0 or avg_conf <= 0:
        return 1.0
    return max(T_MIN, min(T_MAX, avg_conf / accuracy))
