"""Command-line tool to run and inspect the predictor against the database.

Examples (set DATABASE_URL first, e.g. the docker Postgres or a local sqlite):

  python -m app.cli backtest                 # walk-forward test vs all completed matches
  python -m app.cli upcoming                 # predict all upcoming fixtures
  python -m app.cli upcoming --competition wc --limit 10
  python -m app.cli team bra                 # a team's rating/form + its upcoming predictions
  python -m app.cli match bra arg            # one-off prediction for two teams (+ breakdown)
  python -m app.cli match bra arg --venue neutral
  python -m app.cli fixture espn_12345       # predict a specific fixture by id
  python -m app.cli teams --search eng       # find team ids by name
"""

from __future__ import annotations

import argparse

from .service import manual_prediction, predict_fixture, team_profile
from .store import models, repo
from .store.db import get_session


def _line(p) -> str:
    """Compact one-line summary of a PredictionOut."""
    o = p.outcome
    return (
        f"{p.home_team.name} vs {p.away_team.name}  "
        f"[{o.home_win:.0f}/{o.draw:.0f}/{o.away_win:.0f}] -> {p.predicted_result} "
        f"({p.confidence.score} {p.confidence.label}) | {p.likely_score} | "
        f"O2.5 {p.markets.over25:.0f}% BTTS {p.markets.btts_yes:.0f}%"
    )


def _detail(p) -> str:
    o = p.outcome
    return "\n".join([
        f"  {p.home_team.name}  vs  {p.away_team.name}",
        f"    1X2 result   : {o.home_win:.1f}% / {o.draw:.1f}% / {o.away_win:.1f}%  -> {p.predicted_result}",
        f"    expected gls : {p.expected_goals.home_xg} - {p.expected_goals.away_xg}  (likely {p.likely_score})",
        f"    confidence   : {p.confidence.score} ({p.confidence.label})   data quality {p.data_quality_score:.0f}",
        f"    markets      : O1.5 {p.markets.over15:.0f}%  O2.5 {p.markets.over25:.0f}%  O3.5 {p.markets.over35:.0f}%  "
        f"BTTS {p.markets.btts_yes:.0f}%  CS-H {p.markets.clean_sheet_home:.0f}%  CS-A {p.markets.clean_sheet_away:.0f}%",
        f"    scorelines   : " + ", ".join(f"{s.score} ({s.probability:.0f}%)" for s in p.likely_scorelines[:3]),
        f"    insight      : {p.explanation.headline}",
    ])


def cmd_upcoming(session, args) -> None:
    fixtures = repo.upcoming_fixtures(session, limit=args.limit)
    if args.competition:
        fixtures = [f for f in fixtures if f.competition_id == args.competition]
    if not fixtures:
        print("No upcoming fixtures.")
        return
    print(f"Upcoming predictions ({len(fixtures)}):\n")
    for fx in fixtures:
        try:
            print("  " + _line(predict_fixture(session, fx.fixture_id, persist=False)))
        except LookupError as exc:
            print(f"  ! {fx.fixture_id}: {exc}")


def cmd_team(session, args) -> None:
    try:
        tp = team_profile(session, args.team_id)
    except LookupError as exc:
        print(exc)
        return
    f = tp.form
    print(f"{tp.team.name}  ({tp.team.team_id})")
    print(f"  Elo {tp.elo}   form {''.join(f.recent_results) or '-'}   "
          f"GF/g {f.goals_scored_avg}  GA/g {f.goals_conceded_avg}  (sampled {f.matches_sampled})")
    print(f"  competition: {tp.competition_name or '-'}")
    print(f"\n  Upcoming ({len(tp.upcoming)}):")
    for p in tp.upcoming:
        print("    " + _line(p))


def cmd_match(session, args) -> None:
    try:
        mp = manual_prediction(session, args.home, args.away, args.venue)
    except LookupError as exc:
        print(exc)
        return
    print(_detail(mp.prediction))
    b = mp.breakdown
    print(f"    form (home)  : {''.join(b.home_form.results) or '-'}  GF {b.home_form.goals_scored} GA {b.home_form.goals_conceded}")
    print(f"    form (away)  : {''.join(b.away_form.results) or '-'}  GF {b.away_form.goals_scored} GA {b.away_form.goals_conceded}")
    print(f"    head-to-head : " + (", ".join(f"{h.home_goals}-{h.away_goals}" for h in b.h2h) or "none on record"))
    print("    key stats    :")
    for k in b.key_stats:
        unit = k.unit or ""
        print(f"       {k.label:18} {k.home}{unit}  vs  {k.away}{unit}")
    print(f"    tip          : {b.tip}")


def cmd_fixture(session, args) -> None:
    try:
        print(_detail(predict_fixture(session, args.fixture_id, persist=False)))
    except LookupError as exc:
        print(exc)


def cmd_teams(session, args) -> None:
    q = session.query(models.Team)
    if args.competition:
        q = q.filter(models.Team.competition_id == args.competition)
    teams = q.order_by(models.Team.name).all()
    if args.search:
        s = args.search.lower()
        teams = [t for t in teams if s in t.name.lower() or s in t.team_id.lower()]
    for t in teams[: args.limit]:
        print(f"  {t.team_id:8} {t.name:28} {t.competition_id or ''}")
    print(f"\n  ({len(teams)} teams)")


def cmd_backtest(session, args) -> None:
    from .jobs.backtest import run
    run()


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli", description="Run/inspect the BetRight predictor.")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("upcoming", help="predict all upcoming fixtures")
    p.add_argument("--competition", help="filter by competition id (e.g. wc)")
    p.add_argument("--limit", type=int, default=50)
    p.set_defaults(func=cmd_upcoming)

    p = sub.add_parser("team", help="a team's rating/form + upcoming predictions")
    p.add_argument("team_id")
    p.set_defaults(func=cmd_team)

    p = sub.add_parser("match", help="one-off prediction for two teams")
    p.add_argument("home")
    p.add_argument("away")
    p.add_argument("--venue", choices=["home", "neutral", "away"], default="neutral")
    p.set_defaults(func=cmd_match)

    p = sub.add_parser("fixture", help="predict a specific fixture by id")
    p.add_argument("fixture_id")
    p.set_defaults(func=cmd_fixture)

    p = sub.add_parser("teams", help="list/find team ids")
    p.add_argument("--competition")
    p.add_argument("--search")
    p.add_argument("--limit", type=int, default=60)
    p.set_defaults(func=cmd_teams)

    p = sub.add_parser("backtest", help="walk-forward test vs all completed matches")
    p.set_defaults(func=cmd_backtest)

    args = parser.parse_args()
    session = get_session()
    try:
        args.func(session, args)
    finally:
        session.close()


if __name__ == "__main__":
    main()
