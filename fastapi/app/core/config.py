from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── App ────────────────────────────────────────────
    APP_ENV: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "Dermiq"

    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str

    # ── Database ───────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/dermiq"

    # ── JWT ────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-must-be-at-least-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # ── CORS ───────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # ── Gemini AI ──────────────────────────────────────
    GEMINI_API_KEY: str = ""

    # ── ML ─────────────────────────────────────────────
    MODEL_PATH: str = "./ml/skin_type_best.keras"

    # ── Upload ─────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 10

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    # ✅ Тек осыны қалдыр
    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }


settings = Settings()