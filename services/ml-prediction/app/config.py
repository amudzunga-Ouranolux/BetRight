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
        self.port: int = int(os.getenv("PORT", "8001"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
