-- BetRight core schema (v1: formula prediction engine).
-- Grounded in betright_claude_self_building_system/.claude/skills/database-schema-skill/tables.md
-- and the prediction engine's needs (ratings, feature snapshots, post-match results).
--
-- Conventions: stable text ids (slugs / provider-derived), timestamptz everywhere,
-- immutable prediction + feature snapshots, provenance on ingested rows.

BEGIN;

-- ---------------------------------------------------------------------------
-- Reference data (ingested from the football data provider)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS competitions (
    competition_id   TEXT PRIMARY KEY,         -- internal stable id (e.g. 'epl')
    name             TEXT NOT NULL,
    country          TEXT,
    sport_code       TEXT NOT NULL DEFAULT 'football',
    -- league baseline used by the xG engine; refreshed by the form job
    base_goal_rate   DOUBLE PRECISION NOT NULL DEFAULT 1.35,
    source_name      TEXT,
    source_record_id TEXT,
    ingest_ts        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
    team_id          TEXT PRIMARY KEY,         -- internal stable id (e.g. 'mci')
    name             TEXT NOT NULL,
    short_name       TEXT,
    competition_id   TEXT REFERENCES competitions(competition_id),
    logo_url         TEXT,
    source_name      TEXT,
    source_record_id TEXT,
    ingest_ts        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scheduled / upcoming matches (predictions are made against these).
CREATE TABLE IF NOT EXISTS fixtures (
    fixture_id       TEXT PRIMARY KEY,
    competition_id   TEXT NOT NULL REFERENCES competitions(competition_id),
    home_team_id     TEXT NOT NULL REFERENCES teams(team_id),
    away_team_id     TEXT NOT NULL REFERENCES teams(team_id),
    kickoff_time     TIMESTAMPTZ NOT NULL,
    venue            TEXT,
    neutral          BOOLEAN NOT NULL DEFAULT FALSE,
    status           TEXT NOT NULL DEFAULT 'scheduled',  -- scheduled|live|finished
    source_name      TEXT,
    source_record_id TEXT,
    ingest_ts        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff ON fixtures(kickoff_time);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status);

-- Completed matches with final scores (history that feeds Elo + form).
CREATE TABLE IF NOT EXISTS matches (
    match_id         TEXT PRIMARY KEY,
    competition_id   TEXT NOT NULL REFERENCES competitions(competition_id),
    home_team_id     TEXT NOT NULL REFERENCES teams(team_id),
    away_team_id     TEXT NOT NULL REFERENCES teams(team_id),
    kickoff_time     TIMESTAMPTZ NOT NULL,
    home_goals       INT NOT NULL,
    away_goals       INT NOT NULL,
    neutral          BOOLEAN NOT NULL DEFAULT FALSE,
    source_name      TEXT,
    source_record_id TEXT,
    ingest_ts        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_time);
CREATE INDEX IF NOT EXISTS idx_matches_home ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away ON matches(away_team_id);

-- ---------------------------------------------------------------------------
-- Ratings (updated by the post-match learning loop)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS team_ratings (
    team_id          TEXT PRIMARY KEY REFERENCES teams(team_id),
    elo              DOUBLE PRECISION NOT NULL DEFAULT 1500,
    attack_strength  DOUBLE PRECISION NOT NULL DEFAULT 1.35,  -- goals scored / game
    defence_strength DOUBLE PRECISION NOT NULL DEFAULT 1.35,  -- goals conceded / game
    matches_played   INT NOT NULL DEFAULT 0,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_rating_history (
    id               BIGSERIAL PRIMARY KEY,
    team_id          TEXT NOT NULL REFERENCES teams(team_id),
    match_id         TEXT REFERENCES matches(match_id),
    old_elo          DOUBLE PRECISION NOT NULL,
    new_elo          DOUBLE PRECISION NOT NULL,
    reason           TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rating_history_team ON team_rating_history(team_id);

-- ---------------------------------------------------------------------------
-- Predictions (immutable) + the point-in-time feature snapshot behind each
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS model_versions (
    model_version    TEXT PRIMARY KEY,         -- e.g. 'formula-1.0.0'
    description      TEXT,
    trained_at       TIMESTAMPTZ,
    -- rolling accuracy metrics maintained by the post-match loop
    brier_score      DOUBLE PRECISION,
    log_loss         DOUBLE PRECISION,
    accuracy         DOUBLE PRECISION,
    sample_size      INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Immutable as-of snapshot of the inputs used (anti-leakage: only data known
-- before kickoff). Stored as JSON so the feature set can grow without migrations.
CREATE TABLE IF NOT EXISTS feature_snapshot (
    feature_snapshot_id TEXT PRIMARY KEY,
    fixture_id          TEXT NOT NULL,
    as_of               TIMESTAMPTZ NOT NULL,   -- always <= kickoff_time
    data_quality_score  DOUBLE PRECISION NOT NULL,
    features_json       JSONB NOT NULL,
    source_manifest     JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
    prediction_id        TEXT PRIMARY KEY,
    fixture_id           TEXT NOT NULL,
    model_version        TEXT NOT NULL REFERENCES model_versions(model_version),
    home_win_probability DOUBLE PRECISION NOT NULL,
    draw_probability     DOUBLE PRECISION NOT NULL,
    away_win_probability DOUBLE PRECISION NOT NULL,
    home_xg              DOUBLE PRECISION NOT NULL,
    away_xg              DOUBLE PRECISION NOT NULL,
    likely_score         TEXT,
    confidence_score     DOUBLE PRECISION NOT NULL,
    confidence_label     TEXT NOT NULL,
    data_quality_score   DOUBLE PRECISION NOT NULL,
    markets_json         JSONB NOT NULL,        -- over/under, btts, clean sheets, scorelines
    explanation_json     JSONB NOT NULL,        -- headline, summary, key_reasons, risk_factors
    feature_snapshot_id  TEXT REFERENCES feature_snapshot(feature_snapshot_id),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_predictions_fixture ON predictions(fixture_id);

-- Scored after the match finishes (post-match learning loop).
CREATE TABLE IF NOT EXISTS prediction_results (
    prediction_id      TEXT PRIMARY KEY REFERENCES predictions(prediction_id),
    actual_home_goals  INT NOT NULL,
    actual_away_goals  INT NOT NULL,
    result_correct     BOOLEAN NOT NULL,
    scoreline_correct  BOOLEAN NOT NULL,
    brier_score        DOUBLE PRECISION NOT NULL,
    log_loss           DOUBLE PRECISION NOT NULL,
    evaluated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
