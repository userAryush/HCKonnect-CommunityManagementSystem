# HCKonnect

**A web-based platform for managing tech communities, job vacancies, discussions, and events for students.**

HCKonnect connects students with campus tech communities through a unified feed, community dashboards, vacancy applications, event registration, discussion forums, and shared resources—backed by a Django REST API and a React single-page application.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [API Overview](#api-overview)
- [Folder Structure](#folder-structure)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Contributors](#contributors)
- [License](#license)

---

## Features

### Authentication & User Management
- User registration and login with **JWT** (access + refresh tokens)
- **Google OAuth** sign-in (`django-allauth`)
- Password reset flow (OTP verification)
- User profiles, theme preferences, and first-login password change
- Global search across platform entities
- Contact / support messaging

### Communities
- Browse and view community profiles
- Community dashboard with aggregated summaries and analytics
- Member management (add, remove, role updates)
- Community-scoped messaging

### Job Vacancies
- Create and manage community vacancies (community admins / reps)
- Public vacancy browsing and detail pages
- Student applications with application review for communities
- AI-assisted job description and application text enhancement

### Events
- Event listing, creation, update, and deletion
- Event registration and participant management
- Attendance tracking and manual participant addition
- Event statistics and AI-assisted event content generation

### Content & Engagement
- **Announcements** — community announcements with visibility controls
- **Posts** — create, edit, react, and comment on posts
- **Resources** — upload and manage shared files (Cloudinary storage)
- **Discussions** — threaded topics with replies and reactions
- **Feed** — personalized and community-scoped activity feeds (Redis-cached)

### Notifications
- In-app notification list
- Mark as read (single or all) and delete notifications

### AI Services (Google Gemini)
- Job description generation
- Resume and cover letter improvement
- Application analysis and text enhancement
- Discussion summarization
- General text enhancement

### Administration
- Django admin with **Jazzmin** UI and **TinyMCE** rich text
- Platform analytics for community accounts

---

## System Architecture

HCKonnect follows a **client–server** architecture with a decoupled frontend and REST API backend.

```text
┌─────────────────┐         HTTPS / REST (JSON)         ┌──────────────────────┐
│  React + Vite   │  ◄────────────────────────────────► │  Django + DRF API    │
│  (FRONTEND/)    │         JWT Bearer + cookies        │  (BACKEND/)          │
└────────┬────────┘                                     └──────────┬───────────┘
         │                                                           │
         │                                                    ┌──────┴──────┐
         │                                                    │             │
         ▼                                                    ▼             ▼
   Vercel (deploy)                                    PostgreSQL      Redis (cache)
   (placeholder)                                      (primary DB)    Cloudinary (media)
```

**Request flow (simplified):**
1. The React SPA authenticates via `/accounts/login/` or Google OAuth and stores JWT tokens.
2. Authenticated requests include a `Bearer` access token; refresh is handled via `/accounts/token/refresh/`.
3. DRF viewsets and API views serve domain data from PostgreSQL.
4. Frequently accessed data (feeds, dashboards, discussion threads) is cached in **Redis**.
5. Uploaded media (images, resources) is stored in **Cloudinary**.

> **Realtime:** WebSocket-based realtime is **not currently implemented** in this repository. Notifications are delivered via REST polling. *(Add WebSocket / Django Channels here if introduced later.)*

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python, Django 5.2, Django REST Framework |
| **Frontend** | React 19, Vite 7, React Router 7, Tailwind CSS 4, Axios |
| **Database** | PostgreSQL (`psycopg2-binary`) |
| **Authentication** | `djangorestframework-simplejwt`, `django-allauth` (Google) |
| **Caching** | Redis (`django-redis` backend) |
| **Media storage** | Cloudinary (`django-cloudinary-storage`) |
| **AI** | Google Gemini (`google-generativeai`, LangChain) |
| **Admin UI** | Django Jazzmin, TinyMCE |
| **Deployment** | Docker *(placeholder — not in repo yet)*, Vercel (frontend), Render (backend) |

---

## Installation & Setup

### Prerequisites

- **Python** 3.12+ (recommended; project uses `cpython-312` artifacts)
- **Node.js** 18+ and **npm**
- **PostgreSQL** database instance
- **Redis** instance
- **Cloudinary** account
- **Google Cloud** credentials (OAuth + Gemini API key, as needed)

---

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/HCKonnect.git
cd HCKonnect
```

---

### 2. Backend setup

```bash
cd BACKEND

# Create and activate virtual environment
python -m venv env

# Windows (PowerShell)
.\env\Scripts\Activate.ps1

# macOS / Linux
# source env/bin/activate

pip install -r requirements.txt
```

Create `BACKEND/.env` (see [Environment variables](#environment-variables) below).

```bash
# Apply migrations
python manage.py migrate

# Create superuser (optional, for admin)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Default API base URL: `http://127.0.0.1:8000/`

---

### 3. Frontend setup

```bash
cd FRONTEND

npm install
```

Create `FRONTEND/.env` (see below).

```bash
# Development server (default: http://localhost:5173)
npm run dev

# Production build
npm run build
npm run preview
```

---

### Environment variables

#### `BACKEND/.env`

```env
# Django
SECRET_KEY=your-django-secret-key
DEBUG=True
FRONTEND_URL=http://localhost:5173

# PostgreSQL
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432

# JWT (optional overrides)
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=50
JWT_REFRESH_TOKEN_LIFETIME_DAYS=2

# Redis
REDIS_URL=redis://127.0.0.1:6379/0

# Cache TTLs (optional, seconds)
DASHBOARD_CACHE_TIMEOUT=3000
FEED_CACHE_TIMEOUT=1800

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (password reset / OTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=noreply@example.com

# Google OAuth & AI
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_API_KEY=your_google_gemini_api_key
GOOGLE_GEMINI_MODEL=gemini-2.5-flash
```

> Adjust PostgreSQL `OPTIONS` in `BACKEND/hckonnect/settings.py` (e.g. `sslmode`) for local development if your database does not require SSL.

#### `FRONTEND/.env`

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

### 4. Deployment (placeholders)

| Component | Target | Notes |
|-----------|--------|-------|
| Frontend | **Vercel** | Set `VITE_API_BASE_URL` to production API URL |
| Backend | **Render** | Set all `BACKEND/.env` variables; run `collectstatic` and migrations |
| Docker | *(optional)* | Add `Dockerfile` / `docker-compose.yml` — not included in repo yet |

<!-- TODO: Add deployment URLs -->
- **Live frontend:** `https://your-frontend-url.vercel.app`
- **Live API:** `https://your-backend-url.onrender.com`

---

## API Overview

All API routes are prefixed from the Django root URLconf. Authenticated endpoints require:

```http
Authorization: Bearer <access_token>
```

### Base paths

| Prefix | Domain |
|--------|--------|
| `/accounts/` | Registration, login, logout, profile, search, Google auth |
| `/communities/` | Communities, dashboard, vacancies, members, analytics |
| `/contents/` | Feed, announcements, posts, comments, resources |
| `/events/` | Events, registration, participants, attendance |
| `/discussions/` | Discussion threads, replies, reactions |
| `/notifications/` | User notifications |
| `/api/ai/` | Gemini-powered AI endpoints |
| `/admin/` | Django admin panel |

### Example endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/accounts/register/` | Register a new user |
| `POST` | `/accounts/login/` | Obtain JWT tokens |
| `POST` | `/accounts/token/refresh/` | Refresh access token |
| `GET` | `/accounts/profile/` | Current user profile |
| `GET` | `/communities/communities-list/` | List communities |
| `GET` | `/communities/vacancies/` | List vacancies |
| `POST` | `/communities/vacancies/apply/` | Apply to a vacancy |
| `GET` | `/contents/feed/` | Activity feed |
| `GET` | `/contents/post-list/` | List posts |
| `GET` | `/events/event-list/` | List events |
| `POST` | `/events/<uuid>/register/` | Register for an event |
| `GET` | `/discussions/list/` | List discussions |
| `GET` | `/notifications/` | List notifications |
| `POST` | `/api/ai/job-description/` | AI job description |

> For the full route list, inspect `BACKEND/hckonnect/urls.py` and each app's `urls.py`.

---

## Folder Structure

```text
HCKonnect/
├── BACKEND/                    # Django project
│   ├── accounts/               # Users, auth, profiles, search
│   ├── communities/            # Communities, vacancies, members, dashboard
│   ├── contents/               # Posts, announcements, resources, feed
│   ├── discussion/             # Discussion threads and replies
│   ├── events/                 # Events and registrations
│   ├── notifications/          # In-app notifications
│   ├── services/
│   │   ├── ai/                 # Gemini / LangChain AI endpoints
│   │   └── cache/              # Redis cache keys and invalidation
│   ├── hckonnect/              # Project settings, URLs, admin branding
│   ├── utils/                  # Shared utilities (email, pagination, limits)
│   ├── templates/              # Admin / auth HTML templates
│   ├── static/                 # Static assets for admin
│   ├── manage.py
│   └── requirements.txt
│
├── FRONTEND/                   # React + Vite SPA
│   ├── src/
│   │   ├── features/           # Feature modules (auth, feed, events, etc.)
│   │   ├── shared/             # Reusable components, services, constants
│   │   └── utils/              # Helpers (API errors, formatting, etc.)
│   ├── public/
│   ├── package.json
│   └── vite.config.js          # (if present)
│
├── .gitignore
└── README.md
```

---

## Usage

### For students
1. Register or sign in (email/password or Google).
2. Browse **Communities** and join or follow community activity.
3. Use the **Feed** to see posts, announcements, and updates.
4. Apply to **Vacancies**, register for **Events**, and participate in **Discussions**.
5. View and edit your **Profile**; manage notifications from the app UI.

### For community administrators
1. Sign in with a community account.
2. Open the **Community Dashboard** (`/community/:id/dashboard`).
3. Manage **Members**, **Vacancies**, **Events**, and **Announcements** from management routes.
4. Review vacancy applications and event participants.
5. Use **AI tools** where available to draft descriptions and review applications.

### For platform administrators
1. Access Django admin at `/admin/` (superuser credentials).
2. Manage users, communities, and platform content via the Jazzmin admin interface.

---

## Screenshots

<!-- Add screenshots to a /docs/screenshots/ folder and link them here -->

| Screen | Preview |
|--------|---------|
| Landing page | ![Landing page](docs/screenshots/landing.png) |
| Feed | ![Feed](docs/screenshots/feed.png) |
| Community dashboard | ![Community dashboard](docs/screenshots/dashboard.png) |
| Vacancy listing | ![Vacancies](docs/screenshots/vacancies.png) |
| Event detail | ![Event detail](docs/screenshots/event-detail.png) |
| Discussion thread | ![Discussion](docs/screenshots/discussion.png) |

> **Placeholder:** Replace image paths above after adding screenshots to the repository.

---

## Future Improvements

- [ ] Docker Compose for local one-command setup (API + DB + Redis)
- [ ] WebSocket / realtime notifications (Django Channels or similar)
- [ ] Expanded automated test coverage (API + frontend E2E)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] API documentation (OpenAPI / Swagger via `drf-spectacular`)
- [ ] Mobile-responsive audit and accessibility (WCAG) pass
- [ ] Rate limiting and security hardening for production
- [ ] *(Add your FYP roadmap items here)*

---

## Contributors

| Name | Role | Contact |
|------|------|---------|
| *[Your Name]* | Developer / FYP Student | *[email@example.com]* |
| *[Supervisor Name]* | Academic Supervisor | *[supervisor@example.com]* |
| *[Team Member]* | *[Role]* | *[email@example.com]* |

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 [Your Name / Institution]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  <strong>HCKonnect</strong> — Connecting students with tech communities.
</p>
