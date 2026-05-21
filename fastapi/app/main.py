import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request

from app.core.config import settings
from app.api.routes import auth, profile, analysis, admin, reviews, diary, progress, chat

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Dermiq API ...")

    # Барлық кестелерді автоматты жасау
    try:
        from app.db.base import Base
        from app.db.session import engine
        import app.models.user      # noqa: F401
        import app.models.analysis  # noqa: F401
        from app.api.routes.diary    import DiaryEntry   # noqa: F401
        from app.api.routes.reviews  import Review       # noqa: F401
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ready.")
    except Exception as e:
        logger.warning(f"DB init error: {e}")

    try:
        from app.services.ml_service import _load_model
        _load_model()
        logger.info("ML model ready.")
    except Exception as e:
        logger.warning(f"ML model could not be loaded: {e}")
    yield
    logger.info("Shutting down Dermiq API.")


app = FastAPI(
    title="Dermiq API",
    description="AI-powered skin analysis",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS — барлық origin рұқсат (development үшін) ───────────────────────────
_ORIGINS = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Server error. Please try again."},
    )


API_PREFIX = "/api"
app.include_router(auth.router,     prefix=API_PREFIX)
app.include_router(profile.router,  prefix=API_PREFIX)
app.include_router(analysis.router, prefix=API_PREFIX)
app.include_router(admin.router,    prefix=API_PREFIX)
app.include_router(reviews.router,  prefix=API_PREFIX)
app.include_router(diary.router,    prefix=API_PREFIX)
app.include_router(progress.router, prefix=API_PREFIX)
app.include_router(chat.router,    prefix=API_PREFIX)


@app.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)