"""Rule-based prediction explanations.

Generates the headline / summary / key-reasons / risk-factors deterministically
from feature deltas (home edge, form gap, xG gap, data completeness). No LLM, so
it is reproducible and free. Wording follows the responsible-use rules: never
"guaranteed", always probabilistic.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .form import TeamForm
from .markets import Markets, OneXTwo


@dataclass
class Reason:
    title: str
    description: str
    impact: str       # positive|negative|neutral
    strength: float   # 0-1


@dataclass
class Explanation:
    headline: str
    summary: str
    key_reasons: list[Reason] = field(default_factory=list)
    risk_factors: list[Reason] = field(default_factory=list)


def _favourite(outcome: OneXTwo, home_name: str, away_name: str) -> tuple[str, str, float]:
    """Return (predicted_result, favourite_name, top_probability)."""
    trio = [
        ("home_win", home_name, outcome.home_win),
        ("draw", "Draw", outcome.draw),
        ("away_win", away_name, outcome.away_win),
    ]
    trio.sort(key=lambda t: t[2], reverse=True)
    return trio[0]


def build_explanation(
    home_name: str,
    away_name: str,
    outcome: OneXTwo,
    home_xg: float,
    away_xg: float,
    home_form: TeamForm,
    away_form: TeamForm,
    markets: Markets,
    data_quality: float,
    venue: str = "home",
) -> Explanation:
    result, fav_name, top = _favourite(outcome, home_name, away_name)

    if result == "draw":
        headline = f"{home_name} v {away_name} leans to a tight draw"
    else:
        headline = f"{fav_name} favoured" + (" at home" if result == "home_win" and venue == "home" else "")

    margin = "narrow"
    if top >= 60:
        margin = "clear"
    elif top >= 48:
        margin = "moderate"

    summary = (
        f"The model leans to a {margin} {_phrase(result, home_name, away_name)}, "
        f"with expected goals of {home_xg:.2f} - {away_xg:.2f}. "
        f"Both-teams-to-score sits at {markets.btts_yes:.0f}% and over 2.5 goals at "
        f"{markets.over25:.0f}%. Predictions are probabilistic and never guaranteed."
    )

    key_reasons: list[Reason] = []
    risk_factors: list[Reason] = []

    # Home advantage.
    if result == "home_win" and venue == "home":
        key_reasons.append(
            Reason(
                title="Home advantage",
                description=f"{home_name} are modelled with a home-field edge in this fixture.",
                impact="positive",
                strength=0.6,
            )
        )

    # Attacking output (xG gap).
    xg_gap = home_xg - away_xg
    if abs(xg_gap) >= 0.25:
        stronger, weaker = (home_name, away_name) if xg_gap > 0 else (away_name, home_name)
        key_reasons.append(
            Reason(
                title="Attacking output",
                description=f"{stronger} project more expected goals than {weaker}.",
                impact="positive",
                strength=min(1.0, abs(xg_gap) / 1.5),
            )
        )

    # Recent form (points from last 5).
    home_pts = _form_points(home_form.recent_results)
    away_pts = _form_points(away_form.recent_results)
    if abs(home_pts - away_pts) >= 4:
        stronger, weaker = (home_name, away_name) if home_pts > away_pts else (away_name, home_name)
        key_reasons.append(
            Reason(
                title="Recent form",
                description=f"{stronger} carry stronger recent form than {weaker} over the last five.",
                impact="positive",
                strength=min(1.0, abs(home_pts - away_pts) / 15.0),
            )
        )

    # Goals market signal.
    if markets.over25 >= 60:
        key_reasons.append(
            Reason(
                title="Goals expected",
                description=f"Over 2.5 goals is favoured at {markets.over25:.0f}%.",
                impact="neutral",
                strength=0.5,
            )
        )

    # Risk: thin data.
    if data_quality < 50:
        risk_factors.append(
            Reason(
                title="Limited data",
                description="Sparse recent match history widens the uncertainty on this call.",
                impact="negative",
                strength=0.6,
            )
        )

    # Risk: close three-way.
    spread = max(outcome.home_win, outcome.draw, outcome.away_win) - min(
        outcome.home_win, outcome.draw, outcome.away_win
    )
    if spread < 20:
        risk_factors.append(
            Reason(
                title="Tight matchup",
                description="The three outcomes are closely matched, so the edge is small.",
                impact="negative",
                strength=0.5,
            )
        )

    # Risk: live upset potential when the underdog still has real chances.
    underdog = min(outcome.home_win, outcome.away_win)
    if underdog >= 28 and result != "draw":
        risk_factors.append(
            Reason(
                title="Upset watch",
                description="The underdog retains a realistic route to a result.",
                impact="negative",
                strength=0.5,
            )
        )

    if not key_reasons:
        key_reasons.append(
            Reason(
                title="Balanced profile",
                description="No single factor dominates; the call rests on small combined edges.",
                impact="neutral",
                strength=0.4,
            )
        )

    return Explanation(
        headline=headline,
        summary=summary,
        key_reasons=key_reasons,
        risk_factors=risk_factors,
    )


def _phrase(result: str, home_name: str, away_name: str) -> str:
    if result == "home_win":
        return f"{home_name} win"
    if result == "away_win":
        return f"{away_name} win"
    return "draw"


def _form_points(results: list[str]) -> int:
    return sum(3 if r == "W" else 1 if r == "D" else 0 for r in results)
