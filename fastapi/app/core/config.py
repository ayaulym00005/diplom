from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os


class Settings(BaseSettings):
    # ── App ────────────────────────────────────────────
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ── Database ───────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/dermiq"

    # ── JWT ────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-must-be-at-least-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # ── CORS ───────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # ── ML ─────────────────────────────────────────────
    MODEL_PATH: str = "./ml/skin_type_best.keras"

    # ── Upload ─────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 10

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
