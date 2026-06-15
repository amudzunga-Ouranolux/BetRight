"""Walk-forward backtest of the formula engine on completed World Cup matches.

  python -m app.jobs.backtest

Anti-leakage by construction: matches are replayed in kickoff order; each match is
predicted using ONLY the Elo state and form built from earlier matches, then the
actual result updates Elo. Reports 1X2 accuracy / Brier / log-loss, goals MAE,
over-2.5 and BTTS accuracy, scoreline hit rate, a calibration table, and naive
baselines (always-home, Elo-favourite) for comparison. Broken out by season.
"""

from __future__ import annotations

import math
from collections import defaultdict

from sqlalchemy import select

from ..engine import ensemble
from ..engine.dixon_coles import build_goal_model, expected_goals
from ..engine.elo import rating_outcome, updated_ratings
from ..engine.form import HistMatch, compute_form
from ..engine.markets import derive_markets, most_likely_score, outcome_probabilities
from ..store import models
from ..store.db import get_session

INITIAL_ELO = 1500.0
BASE_GOAL_RATE = 1.35


def _result(h: int, a: int) -> str:
    return "home_win" if h > a else "draw" if h == a else "away_win"


def run() -> None:
    session = get_session()
    matches = [
        m for m in session.scalars(select(models.Match).order_by(models.Match.kickoff_time))
        if m.competition_id == "wc"
    ]
    session.close()

    elo: dict[str, float] = defaultdict(lambda: INITIAL_ELO)
    prior: list[HistMatch] = []
    rows: list[dict] = []

    for m in matches:
        as_of = m.kickoff_time
        hf = compute_form(m.home_team_id, prior, as_of, BASE_GOAL_RATE)
        af = compute_form(m.away_team_id, prior, as_of, BASE_GOAL_RATE)
        venue = "neutral" if m.neutral else "home"

        hxg, axg = expected_goals(hf.attack_strength, hf.defence_strength, af.attack_strength, af.defence_strength, BASE_GOAL_RATE, venue)
        gm = build_goal_model(hxg, axg)
        statistical = outcome_probabilities(gm)
        rating = rating_outcome(elo[m.home_team_id], elo[m.away_team_id], neutral=m.neutral)
        final = ensemble.combine({"statistical": statistical, "team_rating": rating})
        markets = derive_markets(gm)
        likely = most_likely_score(gm).replace(" ", "")

        ah, ag = m.home_goals, m.away_goals
        actual = _result(ah, ag)
        probs = {"home_win": final.home_win / 100, "draw": final.draw / 100, "away_win": final.away_win / 100}
        pred = max(probs, key=probs.get)

        rows.append({
            "year": as_of.year,
            "correct": pred == actual,
            "brier": sum((probs[k] - (1.0 if k == actual else 0.0)) ** 2 for k in probs),
            "logloss": -math.log(max(probs[actual], 1e-12)),
            "top_prob": probs[pred],
            "goal_abs_err": abs((hxg + axg) - (ah + ag)),
            "over_correct": (markets.over25 >= 50) == (ah + ag > 2.5),
            "btts_correct": (markets.btts_yes >= 50) == (ah >= 1 and ag >= 1),
            "scoreline_hit": likely == f"{ah}-{ag}",
            "home_correct": actual == "home_win",
            "elo_fav_correct": actual == ("home_win" if elo[m.home_team_id] >= elo[m.away_team_id] else "away_win"),
        })

        nh, na = updated_ratings(elo[m.home_team_id], elo[m.away_team_id], ah, ag, neutral=m.neutral)
        elo[m.home_team_id], elo[m.away_team_id] = nh, na
        prior.append(HistMatch(as_of, m.home_team_id, m.away_team_id, ah, ag))

    _report("ALL completed WC matches", rows)
    for year in sorted({r["year"] for r in rows}):
        _report(f"Season {year}", [r for r in rows if r["year"] == year])
    _calibration(rows)


def _report(title: str, rows: list[dict]) -> None:
    n = len(rows)
    if not n:
        return
    acc = sum(r["correct"] for r in rows) / n
    print(f"\n=== {title}  (n={n}) ===")
    print(f"  1X2 accuracy        : {acc * 100:5.1f}%")
    print(f"  Brier score         : {sum(r['brier'] for r in rows) / n:5.3f}   (lower better; 0.0=perfect, ~0.67 random)")
    print(f"  Log loss            : {sum(r['logloss'] for r in rows) / n:5.3f}   (lower better; ~1.10 random)")
    print(f"  Goals MAE (total)   : {sum(r['goal_abs_err'] for r in rows) / n:5.2f}   goals/match")
    print(f"  Over/Under 2.5 acc  : {sum(r['over_correct'] for r in rows) / n * 100:5.1f}%")
    print(f"  BTTS accuracy       : {sum(r['btts_correct'] for r in rows) / n * 100:5.1f}%")
    print(f"  Exact scoreline hit : {sum(r['scoreline_hit'] for r in rows) / n * 100:5.1f}%")
    print(f"  -- baselines --")
    print(f"  always-home acc     : {sum(r['home_correct'] for r in rows) / n * 100:5.1f}%")
    print(f"  Elo-favourite acc   : {sum(r['elo_fav_correct'] for r in rows) / n * 100:5.1f}%")


def _calibration(rows: list[dict]) -> None:
    print("\n=== Calibration (predicted top outcome) ===")
    buckets: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        lo = int(r["top_prob"] * 10) * 10
        buckets[f"{lo}-{lo+10}%"].append(r)
    print("  predicted-prob bucket | n | actual hit-rate")
    for b in sorted(buckets):
        rs = buckets[b]
        print(f"   {b:>10} | {len(rs):3d} | {sum(x['correct'] for x in rs) / len(rs) * 100:5.1f}%")


if __name__ == "__main__":
    run()
