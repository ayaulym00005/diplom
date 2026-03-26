# Dermiq — Skin Intelligence Frontend

A polished, production-ready React frontend for AI-powered skin type analysis.

## Stack

- **React 18** + **React Router v6**
- **Tailwind CSS** (custom design system)
- **Framer Motion** — page/element animations
- **React Hook Form** — form validation
- **React Dropzone** — photo upload with drag & drop
- **Axios** — HTTP client with JWT interceptors
- **React Hot Toast** — notifications
- **Vite** — build tool

---

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx        # JWT auth state (login, register, logout)
├── services/
│   └── api.js                 # All API calls (auth, profile, analysis)
├── utils/
│   └── skinData.js            # Skin type data + lifestyle questions
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx         # Responsive navbar with mobile menu
│   │   ├── PageLayout.jsx     # Page wrapper with grain overlay + navbar
│   │   └── ProtectedRoute.jsx # Auth guard + onboarding guard
│   └── ui/
│       └── index.jsx          # Spinner, FadeUp, Card, Badge, StepIndicator…
└── pages/
    ├── LandingPage.jsx        # Public landing with hero, features, CTA
    ├── LoginPage.jsx          # Login form
    ├── RegisterPage.jsx       # Register form
    ├── OnboardingPage.jsx     # 3-step lifestyle questionnaire
    ├── AnalyzePage.jsx        # Photo upload + analysis loader
    ├── ResultPage.jsx         # Analysis results + recommendations
    ├── DashboardPage.jsx      # User dashboard with history overview
    ├── HistoryPage.jsx        # Full analysis history grouped by month
    └── NotFoundPage.jsx       # 404 page
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in env
cp .env.example .env
# Set VITE_API_URL=http://your-backend/api

# 3. Run dev server
npm run dev

# 4. Build for production
npm run build
```

---

## API Endpoints Used

All base URLs come from `VITE_API_URL`. You can change endpoint paths in `src/services/api.js`.

### Auth
| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/auth/register` | `{ name, email, password }` | `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | — | `{ user }` |

### Profile / Onboarding
| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/profile/lifestyle` | lifestyle answers object | `{ success }` |
| GET | `/profile/lifestyle` | — | lifestyle answers |
| GET | `/profile/status` | — | `{ onboardingComplete }` |

### Analysis
| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/analysis/predict` | `FormData { image: File }` | `{ id, skin_type, confidence, created_at }` |
| GET | `/analysis/history` | — | `Array<{ id, skin_type, confidence, created_at }>` |
| GET | `/analysis/:id` | — | `{ id, skin_type, confidence, created_at }` |

---

## User / Auth object shape

```json
{
  "id": "uuid",
  "name": "Anna Smith",
  "email": "anna@example.com",
  "onboardingComplete": true
}
```

The `onboardingComplete` flag controls whether the user is redirected to `/onboarding` after login.

---

## Skin Types Supported

The model should return one of these values as `skin_type`:
- `oily`
- `dry`
- `normal`
- `combination`

Each type has a full data profile in `src/utils/skinData.js` including description, traits, tips, and key ingredients.

---

## Design System

Colors, fonts, shadows, and animations are all defined in `tailwind.config.js`.

**Palette:** Cream · Blush · Bark · Sage  
**Fonts:** Cormorant Garamond (display) · Outfit (body) · DM Mono (numbers)  
**Aesthetic:** Organic luxury — warm, editorial, light-toned

---

## JWT Flow

1. Token stored in `localStorage` as `dermiq_token`
2. Axios interceptor attaches `Authorization: Bearer <token>` to every request
3. On 401 response, user is auto-logged out and redirected to `/login`
4. User object cached in `localStorage` as `dermiq_user`
