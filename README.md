# EduKadence (Phase 1 Foundation)

> **EduKadence** is a modern, production-ready SaaS platform purposefully architected for small schools serving young children approximately **2 to 10 years old** (play schools, preschools, nursery schools, Montessori, kindergartens, and primary schools up to ~200 students).

---

## 🌟 Product Philosophy

EduKadence departs from traditional, convoluted enterprise ERPs by delivering three tailored, role-specific experiences:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              EDUKADENCE                                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
   1. SCHOOL                  2. PARENT                  3. CHILD
     MANAGE                    CONNECT             PLAY + LEARN + GROW
  Clean, minimal         Mobile-first window      Safe, visual, playful
  administration for      into their child's       learning universe &
   small educators         daily school life       interactive homework
```

1. **SCHOOL (Manage)**: Streamlined, minimal administration for small educator teams without ERP bloat.
2. **PARENT (Connect)**: Mobile-first window into the child's daily school life, attendance, milestones, and direct communication.
3. **CHILD / KID MODE (Play + Learn + Grow)**: A safe, delightful visual interface for age-tailored exploration and interactive learning.

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18+ with JavaScript (clean, zero-overhead tooling)
- **Bundler & Tooling**: Vite
- **Routing**: React Router v6
- **Server State & Caching**: TanStack Query v5
- **HTTP Client**: Axios with automated JWT renewal and error interceptors
- **Design System**: Tailwind CSS with centralized brand tokens & custom accessible UI primitives
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.11+ / Django 5+
- **API Engine**: Django REST Framework (DRF)
- **Authentication**: Simple JWT (Access + Refresh token lifecycle)
- **Filtering & Validation**: `django-filter`, DRF Serializers
- **Architecture**: Modular Monolith with domain-driven app structure (`apps/core`, `apps/users`, `apps/schools`)
- **Testing**: `pytest`, `pytest-django`

### Database & Multi-Tenancy
- **Database**: PostgreSQL 16 (with zero-config SQLite fallback for local test runs)
- **Multi-Tenancy**: Shared database, tenant-isolated schema with strict school-scoped querysets and backend RBAC authorization

### Infrastructure
- **Containers**: Docker & Docker Compose
- **Environment**: Strict `.env` configuration

---

## 📂 Repository Structure

```
edukadence/
├── .editorconfig
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
│
├── docs/                           # Comprehensive Engineering & Product Documentation
│   ├── PRODUCT.md                  # Product vision, age progression, 3 experiences
│   ├── ARCHITECTURE.md             # Modular monolith, tenancy, frontend & backend design
│   ├── DATABASE.md                 # Schema modeling, conventions, indexing, tenancy
│   ├── API.md                      # REST conventions, /api/v1/ standards, error formats
│   ├── AUTHENTICATION.md           # JWT lifecycle, token refresh, password hashing
│   ├── RBAC.md                     # Role hierarchy, permissions, backend authorization
│   ├── UI_DESIGN_SYSTEM.md         # Color tokens, typography, 25+ UI primitives
│   ├── DEVELOPMENT.md              # Local setup, CLI workflows, seeding data
│   ├── DEPLOYMENT.md               # Production Docker, cloud deployment strategies
│   ├── SECURITY.md                 # OWASP posture, tenant isolation, minor safety
│   ├── MEDIA_STORAGE.md            # Media and asset pipeline architecture
│   ├── PHASES.md                   # 5-Phase strategic roadmap (Phases 1–5)
│   └── DECISIONS.md                # Architecture Decision Records (ADRs)
│
├── backend/                        # Django + DRF Backend Modular Monolith
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── config/                     # Settings (base, development, production) & URLs
│   ├── apps/
│   │   ├── core/                   # Base models, custom exceptions, tenant middleware
│   │   ├── users/                  # Custom User model, RBAC, JWT Auth endpoints
│   │   └── schools/                # Multi-school tenancy, memberships, seed data
│   └── tests/                      # Automated test suite (Auth, RBAC, Tenant Isolation)
│
├── frontend/                       # React + Vite Client Application
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── app/                    # Routing & App entry
│       ├── components/ui/          # 25+ reusable design system primitives
│       ├── layouts/                # AppShell, ParentShell, KidShell, AuthLayout
│       ├── pages/                  # Login, Dashboard, Schools, Users, Parent, Kid
│       ├── services/               # Axios API client, auth & school services
│       ├── lib/                    # Storage, queryClient, formatting utilities
│       └── styles/                 # Brand tokens, global styles
│
└── infra/
    └── docker/                     # Dockerfiles & Nginx reverse proxy configs
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm 9+
- PostgreSQL (or use Docker / SQLite for instant local dev)

### 2. Clone & Environment Setup
```bash
git clone https://github.com/logicbyroshan/edukadence.git
cd edukadence
cp .env.example .env
```

### 3. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_dev_data
python manage.py runserver
```
The API is available at `http://127.0.0.1:8000/api/v1/`.

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run backend tests (including the critical multi-tenant isolation security tests):
```bash
cd backend
pytest tests/ -v
```

---

## 👥 Seeded Demo Accounts

When you run `python manage.py seed_dev_data`, the following test users are created:

| Role | Email / Username | Password | Experience |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@edukadence.com` | `Admin@12345` | Global SaaS Management |
| **School Admin** | `principal@littlesprouts.edu` | `School@12345` | School Management Shell |
| **Teacher** | `sarah.teacher@littlesprouts.edu` | `Teacher@12345` | Class & Student Workflows |
| **Parent** | `john.parent@gmail.com` | `Parent@12345` | Mobile-First Parent Portal |
| **Child** | `leo.kid` | `Kid@12345` | Kid Mode Learning Shell |

---

## 🐳 Running with Docker Compose

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/v1/`
- PostgreSQL: `localhost:5432`

---

## 📄 License

Proprietary & Confidential - EduKadence Inc.
