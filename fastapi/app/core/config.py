from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "Dermiq"

    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""

    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/dermiq"

    SECRET_KEY: str = "change-me-in-production-must-be-at-least-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    ALLOWED_ORIGINS: str = "https://dermiq.site,https://www.dermiq.site,http://localhost:3000,http://localhost:5173"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    GEMINI_API_KEY: str = ""

    MODEL_PATH: str = "./ml/skin_type_best.keras"

    MAX_UPLOAD_SIZE_MB: int = 10

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }


settings = Settings()
