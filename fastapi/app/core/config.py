from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── App ────────────────────────────────────────────
    APP_ENV: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "Dermiq"

    MAIL_USERNAME: str = "amirzhanovaayaulum@gmail.com"
    MAIL_PASSWORD: str = "fjkr xwan osdq raoo"
    MAIL_FROM: str = "amirzhanovaayaulum@gmail.com"

    # ── Database ───────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/dermiq"

    # ── JWT ────────────────────────────────────────────
    SECRET_KEY: str = "dermiq-super-secret-key-2024-xK9mP3nQ"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # ── CORS ───────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # ── Gemini AI ──────────────────────────────────────
    GEMINI_API_KEY: str = "AIzaSyBIeXGMUj3Y9RROCvdIabznn_Wr21zK0EQ"

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