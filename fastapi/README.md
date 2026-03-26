# Dermiq Backend — FastAPI + PostgreSQL + Alembic

AI-powered skin type analysis API. Receives a face photo, runs inference through a trained MobileNetV2 model, and stores the result with per-user history.

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | FastAPI 0.111 |
| ORM | SQLAlchemy 2 (async) |
| Database | PostgreSQL 16 |
| Migrations | Alembic 1.13 |
| Auth | JWT via `python-jose` + bcrypt via `passlib` |
| ML inference | TensorFlow 2.16 + Pillow |
| Server | Uvicorn |

---

## Project Structure

```
dermiq-backend/
├── app/
│   ├── main.py                  ← FastAPI app, CORS, routers, lifespan
│   ├── core/
│   │   ├── config.py            ← Pydantic settings (reads .env)
│   │   └── security.py          ← JWT encode/decode, password hashing, auth dependency
│   ├── db/
│   │   ├── base.py              ← SQLAlchemy DeclarativeBase
│   │   └── session.py           ← Async engine + get_db() dependency
│   ├── models/
│   │   ├── user.py              ← users table
│   │   ├── lifestyle.py         ← lifestyles table
│   │   └── analysis.py          ← analyses table
│   ├── schemas/
│   │   ├── user.py              ← RegisterRequest, LoginRequest, AuthResponse, UserPublic
│   │   ├── lifestyle.py         ← LifestyleIn, LifestyleOut, ProfileStatusOut
│   │   └── analysis.py          ← AnalysisOut, AnalysisListItem
│   ├── services/
│   │   └── ml_service.py        ← Model loader + predict() function
│   └── api/routes/
│       ├── auth.py              ← /api/auth/*
│       ├── profile.py           ← /api/profile/*
│       └── analysis.py          ← /api/analysis/*
├── alembic/
│   ├── env.py                   ← Async-compatible Alembic environment
│   ├── script.py.mako           ← Migration file template
│   └── versions/
│       └── 0001_initial_schema.py  ← Initial DB schema
├── ml/
│   └── skin_type_best.keras     ← ← PUT YOUR MODEL HERE
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Quick Start (Local)

### 1. Prerequisites

- Python 3.11+
- PostgreSQL 16 running locally
- Your trained model file: `skin_type_best.keras`

### 2. Clone & set up environment

```bash
cd dermiq-backend

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PW@localhost:5432/dermiq
SECRET_KEY=your-random-secret-at-least-32-chars
MODEL_PATH=./ml/skin_type_best.keras
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Place your model

```bash
cp /path/to/skin_type_best.keras ./ml/skin_type_best.keras
```

### 5. Create DB and run migrations

```bash
# Create the database (if it doesn't exist)
psql -U postgres -c "CREATE DATABASE dermiq;"

# Run migrations
alembic upgrade head
```

### 6. Start the server

```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

## Quick Start (Docker Compose)

The easiest way — spins up PostgreSQL + API in one command.

```bash
# 1. Place your model
cp /path/to/skin_type_best.keras ./ml/skin_type_best.keras

# 2. Copy env
cp .env.example .env
# Edit SECRET_KEY at minimum

# 3. Start everything
docker compose up --build

# API → http://localhost:8000
# Docs → http://localhost:8000/docs
```

Migrations run automatically before the API starts.

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | ✗ | Register new user |
| `POST` | `/api/auth/login` | ✗ | Login, receive JWT |
| `GET` | `/api/auth/me` | ✓ | Get current user |
| `POST` | `/api/auth/forgot-password` | ✗ | Request password reset |

**Register request:**
```json
{ "name": "Anna", "email": "anna@example.com", "password": "securepass" }
```

**Auth response (register + login):**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Anna",
    "email": "anna@example.com",
    "onboardingComplete": false
  }
}
```

---

### Profile / Onboarding

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/profile/lifestyle` | ✓ | Save lifestyle answers (sets onboardingComplete = true) |
| `GET` | `/api/profile/lifestyle` | ✓ | Fetch saved lifestyle data |
| `GET` | `/api/profile/status` | ✓ | Check `{ onboardingComplete: bool }` |

**Lifestyle payload:**
```json
{
  "water_intake": "2_3l",
  "sleep_hours": "7_9",
  "diet": "balanced",
  "stress_level": "2",
  "sun_exposure": "30_60min",
  "spf_use": "often",
  "exercise": "3_5pw",
  "current_routine": "moderate",
  "concerns": ["acne", "pores"]
}
```

---

### Analysis

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/analysis/predict` | ✓ | Upload photo → run ML inference |
| `GET` | `/api/analysis/history` | ✓ | Get all past analyses (newest first) |
| `GET` | `/api/analysis/{id}` | ✓ | Get single analysis by UUID |

**Predict:** send `multipart/form-data` with field `image` (JPEG/PNG/WEBP, max 10 MB).

**Predict response:**
```json
{
  "id": "uuid",
  "skin_type": "oily",
  "confidence": 87,
  "probabilities": {
    "combination": 0.05,
    "dry": 0.03,
    "normal": 0.05,
    "oily": 0.87
  },
  "created_at": "2024-06-01T12:00:00Z"
}
```

**History response:** array of `{ id, skin_type, confidence, created_at }`.

---

## ML Model Details

- **Architecture:** MobileNetV2 (pretrained on ImageNet) + custom classification head
- **Input:** 224×224 RGB images
- **Preprocessing:** `tf.keras.applications.mobilenet_v2.preprocess_input` (scales to [-1, 1])
- **Output:** Softmax probabilities over 4 classes
- **Class order:** `combination`, `dry`, `normal`, `oily` (alphabetical, matching `flow_from_directory`)

> ⚠️ **Important:** The class order in `ml_service.py` (`CLASS_NAMES`) must match the alphabetical order of your training dataset folders. If your folders were named differently, update `CLASS_NAMES` accordingly.

---

## Alembic Migrations

```bash
# Apply all migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1

# Auto-generate migration after model changes
alembic revision --autogenerate -m "add column xyz"

# Show current revision
alembic current

# Show migration history
alembic history --verbose
```

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <token>
```

JWT payload:
```json
{ "sub": "<user_uuid>", "exp": <unix_timestamp>, "iat": <unix_timestamp> }
```

Token lifetime: 7 days (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | — | JWT signing key (min 32 chars, keep secret!) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Token TTL (7 days) |
| `APP_ENV` | `development` | Environment name |
| `DEBUG` | `true` | Enables `/docs`, verbose logging |
| `ALLOWED_ORIGINS` | `http://localhost:3000,...` | Comma-separated CORS origins |
| `MODEL_PATH` | `./ml/skin_type_best.keras` | Path to your `.keras` model |
| `MAX_UPLOAD_SIZE_MB` | `10` | Max image upload size |
