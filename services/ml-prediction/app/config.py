"""Service configuration (env-driven)."""

from __future__ import annotations

import os
from functools import lru_cache


class Settings:
    def __init__(self) -> None:
        # SQLite by default so the service runs offline; Postgres via env in prod.
        self.database_url: str = os.getenv(
            "DATABASE_URL", "sqlite+pysqlite:///./betright.db"
        )
        self.football_data_api_key: str = os.getenv("FOOTBALL_DATA_API_KEY", "")
        self.football_data_base_url: str = os.getenv(
            "FOOTBALL_DATA_BASE_URL", "https://api.football-data.org/v4"
        )
        # Data provider: 'espn' (free, no key, live WC) or 'football-data' (needs key).
        self.provider: str = os.getenv("PROVIDER", "espn")
        self.port: int = int(os.getenv("PORT", "8001"))
        # Background scheduler (batch predict + post-match). Off by default so dev
        # reloads and tests don't spawn timers; compose turns it on.
        self.scheduler_enabled: bool = os.getenv("SCHEDULER_ENABLED", "false").lower() == "true"
        self.predict_interval_minutes: int = int(os.getenv("PREDICT_INTERVAL_MINUTES", "60"))
        self.postmatch_interval_minutes: int = int(os.getenv("POSTMATCH_INTERVAL_MINUTES", "30"))
        # How often to re-pull fixtures/live scores/results from the provider.
        self.ingest_interval_minutes: int = int(os.getenv("INGEST_INTERVAL_MINUTES", "15"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
