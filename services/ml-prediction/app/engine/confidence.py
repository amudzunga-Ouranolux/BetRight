"""Confidence + data-quality scoring.

Confidence answers "how trustworthy is this estimate?" — distinct from the win
probability itself. It follows the weighted formula in
prediction-engine-skill/formulas.md:

    confidence =
        25% probability_separation
      + 20% model_agreement
      + 20% data_quality
      + 15% lineup_certainty
      + 10% team_stability
      + 10% historical_accuracy

Each component is a 0-1 score. The result is scaled to 0-95 and capped below 100
(football "deserves no arrogance"). Components we cannot compute yet (lineup) are
held at a neutral 0.5 so the seam is honest about what it knows.
"""

from __future__ import annotations

from dataclasses import dataclass

from .markets import OneXTwo

WEIGHTS = {
    "probability_separation": 0.25,
    "model_agreement": 0.20,
    "data_quality": 0.20,
    "lineup_certainty": 0.15,
    "team_stability": 0.10,
    "historical_accuracy": 0.10,
}

CONFIDENCE_CAP = 95

# Sample size at which we consider a team's form fully observed.
FULL_SAMPLE = 12


@dataclass
class Confidence:
    score: int          # 0-95
    label: str          # low|medium_low|medium|high|very_high
    components: dict[str, float]


def label_for(score: float) -> str:
    if score < 40:
        return "low"
    if score < 60:
        return "medium_low"
    if score < 75:
        return "medium"
    if score < 85:
        return "high"
    return "very_high"


def data_quality_score(home_samples: int, away_samples: int) -> float:
    """0-100 score driven (for v1) by how much match history we observed."""
    coverage = min(1.0, (home_samples + away_samples) / (2 * FULL_SAMPLE))
    return round(coverage * 100, 1)


def _separation(outcome: OneXTwo) -> float:
    probs = sorted([outcome.home_win, outcome.draw, outcome.away_win], reverse=True)
    # Gap between the top two outcomes, normalised to 0-1.
    return min(1.0, (probs[0] - probs[1]) / 100.0 * 2.0)


def _team_stability(home_results: list[str], away_results: list[str]) -> float:
    """Steadier recent form (fewer swings) => higher stability."""

    def streakiness(results: list[str]) -> float:
        if len(results) < 2:
            return 0.5
        flips = sum(1 for a, b in zip(results, results[1:]) if a != b)
        return 1.0 - flips / (len(results) - 1)

    return (streakiness(home_results) + streakiness(away_results)) / 2.0


def compute_confidence(
    final: OneXTwo,
    statistical: OneXTwo,
    rating: OneXTwo,
    data_quality: float,
    home_results: list[str],
    away_results: list[str],
    historical_accuracy: float | None = None,
    lineup_certainty: float = 0.5,
) -> Confidence:
    from .ensemble import agreement

    components = {
        "probability_separation": _separation(final),
        "model_agreement": agreement(statistical, rating),
        "data_quality": data_quality / 100.0,
        "lineup_certainty": lineup_certainty,
        "team_stability": _team_stability(home_results, away_results),
        # Neutral 0.6 until the post-match loop has enough scored predictions.
        "historical_accuracy": historical_accuracy if historical_accuracy is not None else 0.6,
    }

    raw = sum(WEIGHTS[name] * value for name, value in components.items())
    score = min(CONFIDENCE_CAP, round(raw * 100))
    return Confidence(
        score=score,
        label=label_for(score),
        components={k: round(v, 3) for k, v in components.items()},
    )
