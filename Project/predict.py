import json
import numpy as np
from scipy.stats import poisson
from scipy.special import factorial

# Team strength database
# (attack, defense, home_boost) — attack/defense are goals scored/conceded rates
# Calibrated roughly to real team quality tiers

TEAM_STATS = {
    # World Cup teams
    "Brazil":        {"att": 2.1, "def": 0.85, "tier": 1},
    "Argentina":     {"att": 2.2, "def": 0.80, "tier": 1},
    "France":        {"att": 2.0, "def": 0.90, "tier": 1},
    "England":       {"att": 1.8, "def": 0.95, "tier": 1},
    "Germany":       {"att": 1.9, "def": 1.00, "tier": 1},
    "Spain":         {"att": 1.8, "def": 0.85, "tier": 1},
    "Portugal":      {"att": 1.9, "def": 0.95, "tier": 1},
    "Netherlands":   {"att": 1.7, "def": 1.00, "tier": 1},
    "USA":           {"att": 1.5, "def": 1.20, "tier": 2},
    "Mexico":        {"att": 1.4, "def": 1.25, "tier": 2},
    "Morocco":       {"att": 1.3, "def": 0.90, "tier": 2},
    "Senegal":       {"att": 1.4, "def": 1.10, "tier": 2},
    "Japan":         {"att": 1.4, "def": 1.05, "tier": 2},
    "South Korea":   {"att": 1.3, "def": 1.15, "tier": 2},
    "Nigeria":       {"att": 1.3, "def": 1.30, "tier": 2},
    "South Africa":  {"att": 1.1, "def": 1.35, "tier": 3},
    "Uruguay":       {"att": 1.5, "def": 1.10, "tier": 2},
    "Colombia":      {"att": 1.4, "def": 1.15, "tier": 2},
    "Australia":     {"att": 1.2, "def": 1.30, "tier": 3},
    "Saudi Arabia":  {"att": 1.1, "def": 1.40, "tier": 3},
    # Champions League
    "Real Madrid":   {"att": 2.3, "def": 0.80, "tier": 1},
    "Manchester City":{"att": 2.2, "def": 0.85, "tier": 1},
    "Bayern Munich": {"att": 2.2, "def": 0.88, "tier": 1},
    "PSG":           {"att": 2.0, "def": 0.95, "tier": 1},
    "Arsenal":       {"att": 1.9, "def": 0.90, "tier": 1},
    "Inter Milan":   {"att": 1.7, "def": 0.85, "tier": 1},
    "Barcelona":     {"att": 2.0, "def": 0.90, "tier": 1},
    "Juventus":      {"att": 1.6, "def": 0.90, "tier": 2},
    "Atletico Madrid":{"att": 1.6, "def": 0.80, "tier": 1},
    "Benfica":       {"att": 1.7, "def": 1.05, "tier": 2},
    "Dortmund":      {"att": 1.8, "def": 1.10, "tier": 2},
    "Chelsea":       {"att": 1.7, "def": 1.00, "tier": 1},
    "Liverpool":     {"att": 2.0, "def": 0.90, "tier": 1},
    "Porto":         {"att": 1.6, "def": 1.05, "tier": 2},
    "AC Milan":      {"att": 1.7, "def": 0.95, "tier": 1},
    "Ajax":          {"att": 1.6, "def": 1.10, "tier": 2},
    # Premier League
    "Tottenham":     {"att": 1.7, "def": 1.10, "tier": 2},
    "Manchester Utd":{"att": 1.5, "def": 1.20, "tier": 2},
    "Newcastle":     {"att": 1.6, "def": 1.00, "tier": 2},
    "Aston Villa":   {"att": 1.6, "def": 1.05, "tier": 2},
    "Brighton":      {"att": 1.5, "def": 1.10, "tier": 2},
    "West Ham":      {"att": 1.4, "def": 1.25, "tier": 3},
    "Everton":       {"att": 1.2, "def": 1.35, "tier": 3},
    "Wolves":        {"att": 1.2, "def": 1.30, "tier": 3},
    "Brentford":     {"att": 1.4, "def": 1.20, "tier": 3},
    "Fulham":        {"att": 1.4, "def": 1.20, "tier": 3},
    "Crystal Palace":{"att": 1.3, "def": 1.25, "tier": 3},
    "Leicester":     {"att": 1.3, "def": 1.30, "tier": 3},
    # La Liga
    "Sevilla":       {"att": 1.5, "def": 1.10, "tier": 2},
    "Valencia":      {"att": 1.3, "def": 1.25, "tier": 3},
    "Villarreal":    {"att": 1.5, "def": 1.10, "tier": 2},
    "Athletic Bilbao":{"att": 1.5, "def": 1.05, "tier": 2},
    "Real Sociedad": {"att": 1.5, "def": 1.10, "tier": 2},
    "Osasuna":       {"att": 1.2, "def": 1.30, "tier": 3},
    "Betis":         {"att": 1.4, "def": 1.15, "tier": 2},
    "Girona":        {"att": 1.5, "def": 1.05, "tier": 2},
    "Celta Vigo":    {"att": 1.3, "def": 1.25, "tier": 3},
    "Mallorca":      {"att": 1.1, "def": 1.30, "tier": 3},
    "Getafe":        {"att": 1.0, "def": 1.20, "tier": 3},
    # AFCON
    "Egypt":         {"att": 1.4, "def": 1.05, "tier": 2},
    "Cameroon":      {"att": 1.3, "def": 1.15, "tier": 2},
    "Ghana":         {"att": 1.2, "def": 1.25, "tier": 3},
    "Ivory Coast":   {"att": 1.4, "def": 1.10, "tier": 2},
    "Algeria":       {"att": 1.4, "def": 1.10, "tier": 2},
    "Mali":          {"att": 1.2, "def": 1.20, "tier": 3},
    "Tunisia":       {"att": 1.2, "def": 1.15, "tier": 3},
    "DR Congo":      {"att": 1.2, "def": 1.25, "tier": 3},
    # PSL
    "Kaizer Chiefs":       {"att": 1.4, "def": 1.20, "tier": 2},
    "Orlando Pirates":     {"att": 1.5, "def": 1.10, "tier": 2},
    "Mamelodi Sundowns":   {"att": 1.7, "def": 0.95, "tier": 1},
    "Cape Town City":      {"att": 1.3, "def": 1.20, "tier": 3},
    "SuperSport Utd":      {"att": 1.2, "def": 1.20, "tier": 3},
    "AmaZulu":             {"att": 1.2, "def": 1.25, "tier": 3},
    "Stellenbosch FC":     {"att": 1.2, "def": 1.20, "tier": 3},
    "Chippa Utd":          {"att": 1.0, "def": 1.40, "tier": 3},
    "TS Galaxy":           {"att": 1.1, "def": 1.35, "tier": 3},
    "Sekhukhune Utd":      {"att": 1.1, "def": 1.30, "tier": 3},
}

HOME_ADVANTAGE = 1.15  # home team scores ~15% more
MAX_GOALS = 10         # max goals to consider in Poisson sum

def get_team(name):
    return TEAM_STATS.get(name, {"att": 1.3, "def": 1.20, "tier": 3})

def predict_match(home, away, neutral=False):
    h = get_team(home)
    a = get_team(away)

    # Expected goals using Dixon-Coles style
    home_boost = 1.0 if neutral else HOME_ADVANTAGE
    lambda_home = h["att"] * (a["def"] / 1.2) * home_boost
    lambda_away = a["att"] * (h["def"] / 1.2)

    # Clamp
    lambda_home = max(0.3, min(lambda_home, 5.0))
    lambda_away = max(0.3, min(lambda_away, 5.0))

    # Build score probability matrix
    goals = np.arange(0, MAX_GOALS + 1)
    home_probs = poisson.pmf(goals, lambda_home)
    away_probs = poisson.pmf(goals, lambda_away)
    score_matrix = np.outer(home_probs, away_probs)

    # Match outcome probabilities
    home_win = float(np.sum(np.tril(score_matrix, -1)))
    draw     = float(np.sum(np.diag(score_matrix)))
    away_win = float(np.sum(np.triu(score_matrix, 1)))

    total = home_win + draw + away_win
    home_win /= total
    draw     /= total
    away_win /= total

    # Over/under goals
    total_goals_matrix = np.zeros((MAX_GOALS * 2 + 1,))
    for i in range(MAX_GOALS + 1):
        for j in range(MAX_GOALS + 1):
            total_goals_matrix[i + j] += score_matrix[i, j]

    over15 = float(sum(total_goals_matrix[k] for k in range(2, len(total_goals_matrix))))
    over25 = float(sum(total_goals_matrix[k] for k in range(3, len(total_goals_matrix))))
    over35 = float(sum(total_goals_matrix[k] for k in range(4, len(total_goals_matrix))))
    under25 = 1.0 - over25
    under15 = 1.0 - over15

    # BTTS — both score at least 1
    home_scores = 1 - poisson.pmf(0, lambda_home)
    away_scores = 1 - poisson.pmf(0, lambda_away)
    btts_yes = float(home_scores * away_scores)
    btts_no  = 1.0 - btts_yes

    # Confidence — based on how dominant the favourite is
    max_outcome = max(home_win, draw, away_win)
    confidence = int(40 + (max_outcome - 0.33) / 0.67 * 60)
    confidence = max(40, min(95, confidence))

    def pct(v):
        return round(v * 100)

    return {
        "homeWin":   pct(home_win),
        "draw":      pct(draw),
        "awayWin":   pct(away_win),
        "over15":    pct(over15),
        "over25":    pct(over25),
        "over35":    pct(over35),
        "under25":   pct(under25),
        "bttsYes":   pct(btts_yes),
        "bttsNo":    pct(btts_no),
        "confidence": confidence,
        "xgHome":    round(lambda_home, 2),
        "xgAway":    round(lambda_away, 2),
    }

FIXTURES = {
    "wc2026": [
        ("USA","Mexico","Group A · Jun 22", True),
        ("Brazil","Argentina","Group B · Jun 23", True),
        ("France","Germany","Group C · Jun 24", True),
        ("England","Spain","Group D · Jun 25", True),
        ("Portugal","Morocco","Group E · Jun 26", True),
        ("Netherlands","Senegal","Group F · Jun 27", True),
        ("Japan","South Korea","Group G · Jun 28", True),
        ("Nigeria","South Africa","Group H · Jun 29", True),
        ("Uruguay","Colombia","Group I · Jun 30", True),
        ("Australia","Saudi Arabia","Group J · Jul 1", True),
    ],
    "ucl": [
        ("Real Madrid","Manchester City","Round of 16 · Feb 18", False),
        ("Bayern Munich","PSG","Round of 16 · Feb 19", False),
        ("Arsenal","Inter Milan","Round of 16 · Feb 25", False),
        ("Barcelona","Juventus","Round of 16 · Feb 26", False),
        ("Atletico Madrid","Benfica","Quarter-final · Apr 8", False),
        ("Dortmund","Chelsea","Quarter-final · Apr 9", False),
        ("Liverpool","Porto","Quarter-final · Apr 15", False),
        ("AC Milan","Ajax","Quarter-final · Apr 16", False),
        ("Real Madrid","Arsenal","Semi-final · Apr 29", True),
        ("Bayern Munich","Liverpool","Semi-final · Apr 30", True),
    ],
    "epl": [
        ("Arsenal","Chelsea","Matchday 36 · May 10", False),
        ("Manchester City","Liverpool","Matchday 36 · May 10", False),
        ("Tottenham","Manchester Utd","Matchday 36 · May 11", False),
        ("Newcastle","Aston Villa","Matchday 36 · May 11", False),
        ("Brighton","West Ham","Matchday 37 · May 17", False),
        ("Everton","Wolves","Matchday 37 · May 17", False),
        ("Brentford","Fulham","Matchday 37 · May 18", False),
        ("Crystal Palace","Leicester","Matchday 37 · May 18", False),
        ("Arsenal","Manchester City","Matchday 38 · May 25", False),
        ("Liverpool","Tottenham","Matchday 38 · May 25", False),
    ],
    "laliga": [
        ("Real Madrid","Barcelona","Matchday 34 · May 11", False),
        ("Atletico Madrid","Sevilla","Matchday 34 · May 11", False),
        ("Valencia","Villarreal","Matchday 34 · May 12", False),
        ("Athletic Bilbao","Real Sociedad","Matchday 35 · May 18", False),
        ("Osasuna","Betis","Matchday 35 · May 18", False),
        ("Barcelona","Atletico Madrid","Matchday 36 · May 25", False),
        ("Real Madrid","Athletic Bilbao","Matchday 36 · May 25", False),
        ("Girona","Celta Vigo","Matchday 36 · May 25", False),
        ("Mallorca","Getafe","Matchday 37 · Jun 1", False),
        ("Sevilla","Valencia","Matchday 37 · Jun 1", False),
    ],
    "afcon": [
        ("Morocco","Egypt","Group A · Dec 21", True),
        ("Nigeria","Senegal","Group B · Dec 22", True),
        ("Cameroon","Ghana","Group C · Dec 23", True),
        ("Ivory Coast","Algeria","Group D · Dec 24", True),
        ("Mali","Tunisia","Group E · Dec 25", True),
        ("South Africa","DR Congo","Group F · Dec 26", True),
        ("Morocco","Nigeria","Quarter-final · Jan 3", True),
        ("Senegal","Ivory Coast","Quarter-final · Jan 4", True),
        ("Egypt","Cameroon","Semi-final · Jan 7", True),
        ("Morocco","Senegal","Final · Jan 11", True),
    ],
    "psl": [
        ("Kaizer Chiefs","Orlando Pirates","Matchday 28 · May 10", False),
        ("Mamelodi Sundowns","Cape Town City","Matchday 28 · May 10", False),
        ("SuperSport Utd","AmaZulu","Matchday 28 · May 11", False),
        ("Stellenbosch FC","Chippa Utd","Matchday 28 · May 11", False),
        ("Orlando Pirates","Mamelodi Sundowns","Matchday 29 · May 17", False),
        ("Cape Town City","Kaizer Chiefs","Matchday 29 · May 17", False),
        ("AmaZulu","Stellenbosch FC","Matchday 29 · May 18", False),
        ("TS Galaxy","Sekhukhune Utd","Matchday 29 · May 18", False),
        ("Mamelodi Sundowns","Kaizer Chiefs","Matchday 30 · May 24", False),
        ("Orlando Pirates","SuperSport Utd","Matchday 30 · May 24", False),
    ],
}

# Compute all predictions
results = {}
for league_id, fixtures in FIXTURES.items():
    results[league_id] = []
    for home, away, meta, neutral in fixtures:
        pred = predict_match(home, away, neutral=neutral)
        pred["home"] = home
        pred["away"] = away
        pred["meta"] = meta
        results[league_id].append(pred)

print(json.dumps(results, indent=2))