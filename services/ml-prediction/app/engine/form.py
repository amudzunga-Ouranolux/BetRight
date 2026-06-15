"""Recent-form and attack/defence strengths from match history.

Strengths are time-decayed goals-for / goals-against per game (exponential decay,
30-day half-life by default, per the deep-research feature spec). Everything is
computed strictly from matches *before* an ``as_of`` timestamp so the feature
snapshot can never leak post-kickoff information (anti-leakage rule).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime


# Pseudo-matches at the league baseline used to shrink sparse-sample strengths.
PSEUDO_MATCHES = 4.0


@dataclass
class HistMatch:
    kickoff_time: datetime
    home_team_id: str
    away_team_id: str
    home_goals: int
    away_goals: int


@dataclass
class TeamForm:
    team_id: str
    attack_strength: float       # decayed goals scored / game
    defence_strength: float      # decayed goals conceded / game
    matches_sampled: int
    goals_scored_avg: float
    goals_conceded_avg: float
    recent_results: list[str] = field(default_factory=list)  # chronological, W/D/L


def compute_form(
    team_id: str,
    matches: list[HistMatch],
    as_of: datetime,
    league_base_goal_rate: float,
    half_life_days: float = 30.0,
    recent_n: int = 5,
) -> TeamForm:
    """Compute a team's strengths and last-N results as of ``as_of``."""
    played = [
        m
        for m in matches
        if m.kickoff_time < as_of and team_id in (m.home_team_id, m.away_team_id)
    ]
    played.sort(key=lambda m: m.kickoff_time)

    if not played:
        # Cold start: lean on the league baseline (neutral strengths).
        return TeamForm(
            team_id=team_id,
            attack_strength=league_base_goal_rate,
            defence_strength=league_base_goal_rate,
            matches_sampled=0,
            goals_scored_avg=league_base_goal_rate,
            goals_conceded_avg=league_base_goal_rate,
            recent_results=[],
        )

    weighted_scored = 0.0
    weighted_conceded = 0.0
    weight_total = 0.0
    raw_scored = 0
    raw_conceded = 0
    for m in played:
        is_home = m.home_team_id == team_id
        scored = m.home_goals if is_home else m.away_goals
        conceded = m.away_goals if is_home else m.home_goals
        age_days = (as_of - m.kickoff_time).total_seconds() / 86400.0
        w = math.pow(0.5, age_days / half_life_days)
        weighted_scored += scored * w
        weighted_conceded += conceded * w
        weight_total += w
        raw_scored += scored
        raw_conceded += conceded

    # Shrink toward the league baseline by sample size (empirical-Bayes pseudo-counts)
    # so teams with little history (e.g. national sides early in a tournament) regress
    # to a sensible average instead of producing noisy, extreme expected goals.
    attack = (weighted_scored + league_base_goal_rate * PSEUDO_MATCHES) / (weight_total + PSEUDO_MATCHES)
    defence = (weighted_conceded + league_base_goal_rate * PSEUDO_MATCHES) / (weight_total + PSEUDO_MATCHES)

    recent = []
    for m in played[-recent_n:]:
        is_home = m.home_team_id == team_id
        scored = m.home_goals if is_home else m.away_goals
        conceded = m.away_goals if is_home else m.home_goals
        recent.append("W" if scored > conceded else "D" if scored == conceded else "L")

    return TeamForm(
        team_id=team_id,
        attack_strength=round(attack, 3),
        defence_strength=round(defence, 3),
        matches_sampled=len(played),
        goals_scored_avg=round(raw_scored / len(played), 2),
        goals_conceded_avg=round(raw_conceded / len(played), 2),
        recent_results=recent,
    )
