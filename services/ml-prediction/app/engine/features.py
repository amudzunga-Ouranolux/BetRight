"""Point-in-time feature snapshot.

Captures exactly the inputs the prediction was built from, as of a timestamp that
must be <= kickoff. Stored immutably alongside the prediction so results can be
audited and the anti-leakage guarantee is verifiable (nothing in here may depend
on the final score).
"""

from __future__ import annotations

import hashlib
from datetime import datetime

from .form import TeamForm


def build_snapshot(
    fixture_id: str,
    as_of: datetime,
    home_form: TeamForm,
    away_form: TeamForm,
    elo_home: float,
    elo_away: float,
    league_base_goal_rate: float,
    venue: str,
) -> dict:
    """Assemble the feature dict and a deterministic snapshot id."""
    features = {
        "venue": venue,
        "league_base_goal_rate": league_base_goal_rate,
        "home": _team_features(home_form, elo_home),
        "away": _team_features(away_form, elo_away),
    }
    raw = f"{fixture_id}|{as_of.isoformat()}|{elo_home}|{elo_away}|{venue}"
    snapshot_id = "fs_" + hashlib.sha1(raw.encode()).hexdigest()[:16]
    return {
        "feature_snapshot_id": snapshot_id,
        "fixture_id": fixture_id,
        "as_of": as_of.isoformat(),
        "features": features,
    }


def _team_features(form: TeamForm, elo: float) -> dict:
    return {
        "team_id": form.team_id,
        "elo": round(elo, 1),
        "attack_strength": form.attack_strength,
        "defence_strength": form.defence_strength,
        "matches_sampled": form.matches_sampled,
        "goals_scored_avg": form.goals_scored_avg,
        "goals_conceded_avg": form.goals_conceded_avg,
        "recent_results": form.recent_results,
    }
