# AGENTS.md — EduKadence Agent Operating System

> **EduKadence** is a cloud-native, multi-tenant SaaS platform engineered specifically for **small early-childhood and primary schools** (serving children aged **2 to 10 years old**, typically up to ~200 students).
>
> This document is the primary instruction manual for all AI agents and automated workflows operating on this codebase.

---

## 1. Project Overview & Philosophy

EduKadence provides three distinct, tailored experiences:
1. **SCHOOL (Manage)**: Clean, low-overhead administrative web app for small educator teams (principals, directors, teachers).
2. **PARENT (Connect)**: Mobile-first web app for parents/guardians to track attendance, activity feeds, teacher notes, and secure pickup PINs.
3. **CHILD / KID MODE (Play + Learn + Grow)**: A safe, delightful visual learning sandbox structured around 6 developmental stages (Explore 2–3, Discover 3–4, Learn 4–5, Build 5–7, Create 7–9, Grow 9–10).

**Core Philosophy**: EduKadence is NOT a bloated enterprise ERP. It prioritizes extreme usability, high trust, mobile responsiveness, and child-centric delight.

---

## 2. Technology Stack

- **Backend**: Python 3.11+, Django 5.2+, Django REST Framework (DRF), Simple JWT (`djangorestframework-simplejwt`), `django-filter`, `django-cors-headers`.
- **Database**: PostgreSQL 16 (production/Docker) with SQLite support for zero-config local development and testing.
- **Frontend**: React 18+ (Pure JavaScript — **NO TypeScript**, **NO Next.js**), Vite, React Router v6, TanStack Query v5, Axios, Tailwind CSS with custom brand tokens, Lucide React icons.
- **Infrastructure**: Docker & Docker Compose (`docker-compose.yml`), `.env` configuration.

---

## 3. Directory Layout

```
edukadence/
├── AGENTS.md                       # This file (Agent operating manual)
├── CHANGELOG.md                    # Permanent human-readable change log
├── .agent-memory/                  # Persistent agent memory system
│   ├── PROJECT.md
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── DECISIONS.md
│   ├── CURRENT_STATE.md
│   ├── KNOWN_ISSUES.md
│   ├── SECURITY.md
│   ├── TASK_HISTORY.md
│   └── sessions/
├── docs/                           # Architecture, Product, and API specifications
├── backend/                        # Django Modular Monolith
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── config/                     # Settings (base, development, production) & URLs
│   ├── apps/
│   │   ├── core/                   # Base models, custom exception handler, pagination, middleware
│   │   ├── users/                  # Custom User model, RBAC, JWT endpoints
│   │   └── schools/                # Multi-school tenancy, memberships, settings, seed command
│   └── tests/                      # Pytest automated test suite (Auth, RBAC, Tenant Isolation)
├── frontend/                       # React + Vite Client Application
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── app/                    # React Router with role guards
│       ├── components/ui/          # 25+ reusable design system primitives
│       ├── layouts/                # AppShell, ParentShell, KidShell, AuthLayout
│       ├── pages/                  # Dashboard, Schools, Users, ParentPortal, KidMode, Settings
│       ├── services/               # Axios API client, auth & school services
│       ├── lib/                    # Token storage, TanStack Query client
│       └── styles/                 # Centralized brand tokens & globals
└── infra/docker/                   # Multi-stage Dockerfiles & Nginx proxy
```

---

## 4. Development, Testing & Build Commands

### Backend
```bash
cd backend
# Run migrations
python manage.py migrate

# Seed demo dataset
python manage.py seed_dev_data

# Start local dev server
python manage.py runserver 0.0.0.0:8000

# Run all tests
pytest tests/ -v

# Run tenant isolation security tests specifically
pytest tests/test_tenant_isolation.py -v
```

### Frontend
```bash
cd frontend
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run production build validation
npm run build
```

---

## 5. Mandatory Git Branching & PR Workflow

> [!IMPORTANT]
> **MANDATORY WORKFLOW FOR ALL FUTURE CHANGES:**
> Every single change (bug fix, feature, refactoring, configuration) MUST follow this strict Git and GitHub CLI workflow. Never push directly to `main` without a pull request.

1. **Create a Dedicated Branch**:
   - For bug fixes: `fix/<short-description>` or `bug/<short-description>`
   - For new features: `feat/<short-description>`
   - For documentation / chores: `docs/<short-description>` or `chore/<short-description>`
   ```bash
   git checkout -b feat/add-student-roster-models
   ```
2. **Implement & Verify**:
   - Run automated tests (`pytest tests/ -v`).
   - Run frontend build (`npm run build`).
   - Ensure working tree is clean and only intended changes are staged.
3. **Commit with Conventional Commit Message**:
   ```bash
   git add -A
   git commit -m "feat(schools): implement student roster models and serializers"
   ```
4. **Push Branch to Remote**:
   ```bash
   git push origin feat/add-student-roster-models
   ```
5. **Create PR Using GitHub CLI (`gh`)**:
   ```bash
   gh pr create --title "feat(schools): implement student roster models and serializers" --body "Detailed description of changes and verification."
   ```
6. **Merge PR Using GitHub CLI (`gh`)**:
   ```bash
   gh pr merge --merge --auto --delete-branch
   # Or direct merge:
   gh pr merge --merge --delete-branch
   ```
7. **Sync Local Main**:
   ```bash
   git checkout main
   git pull origin main
   ```

---

## 6. Code & Architectural Conventions

### Backend (Django / DRF)
- **Modular Monolith**: Code is organized into cohesive domain apps under `apps/`.
- **Custom User Model**: Always reference `settings.AUTH_USER_MODEL` or `apps.users.models.User`.
- **Tenancy Scoping**: All tenant-owned models inherit from `apps.core.models.TenantAwareModel`.
- **ViewSets**: Override `get_queryset()` to scope objects by `school_id` derived from `request.active_school_id` or `X-School-ID` header.
- **Standard API Envelope**: Custom exception handler produces `{ "success": false, "error": { "code": "...", "message": "...", "details": ... } }`.
- **No Raw SQL**: Parameterized ORM queries only.
- **Cross-Platform Compatibility**: Never print non-ASCII unicode symbols directly in management commands (`cp1252` Windows compatibility).

### Frontend (React / Vite)
- **Pure JavaScript**: Do not use TypeScript (`.jsx` / `.js` only).
- **State Separation**:
  - Server state: TanStack Query (`useQuery`, `useMutation`).
  - Client state: React context / hooks (`useAuth`, `useToast`).
- **Brand Identity**: Use centralized brand tokens (`brand-600: #2563EB`, `skybrand-500: #0EA5E9`, `navy-900: #0F172A`). Never hard-code ad-hoc hex colors.
- **UI Primitives**: Always reuse components from `src/components/ui/` (`Button`, `Input`, `Card`, `Modal`, `Table`, `Badge`, `Alert`, etc.).
- **Shell Segregation**:
  - `AppShell` for School Admin / Teacher.
  - `ParentShell` for Parent (mobile-first).
  - `KidShell` for Kid Mode (visual, playful, locked sandbox).

---

## 7. Rules for Agents (MUST and MUST NOT)

### Things an Agent MUST Do
1. **Check Persistent Memory First**: Read `AGENTS.md` and relevant `.agent-memory/` files before starting any task.
2. **Respect Multi-Tenancy**: Ensure any new endpoint or model query enforces `school_id` tenant isolation.
3. **Verify Security on Backend**: Backend authorization is security; frontend hiding is UX.
4. **Run Tests & Verification**: Run backend tests (`pytest tests/ -v`) and frontend build (`npm run build`) before considering a task complete.
5. **Update Memory & Changelog**: Keep `CHANGELOG.md`, `.agent-memory/CURRENT_STATE.md`, and `.agent-memory/TASK_HISTORY.md` synchronized after meaningful changes.
6. **Follow Branch & PR Workflow**: Create a dedicated branch, push, create PR with `gh`, and merge with `gh`.

### Things an Agent MUST NOT Do
1. **DO NOT modify existing files casually**: Change only what is strictly necessary for the requested task.
2. **DO NOT convert project to TypeScript or Next.js**: The project is intentionally React (JS) + Vite.
3. **DO NOT convert backend to FastAPI or microservices**: The project is intentionally a Django modular monolith.
4. **DO NOT bypass tenant isolation**: Never write querysets like `Model.objects.all()` in tenant-facing views without filtering by school.
5. **DO NOT commit secrets**: Secrets belong in `.env` (which is git-ignored).
6. **DO NOT introduce heavy enterprise bloat**: No premature Redis, Celery, Kafka, or microservices unless explicitly requested.

---

## 8. Continuous Memory & Documentation Rules

Whenever making meaningful changes:
1. **Update `CHANGELOG.md`** under the appropriate version/date heading.
2. **Update `.agent-memory/CURRENT_STATE.md`** with the updated feature status.
3. **Update `.agent-memory/TASK_HISTORY.md`** with the task summary, affected files, and verification performed.
4. **Update `.agent-memory/DECISIONS.md`** if a new architectural or design decision was made.
5. **Update `.agent-memory/KNOWN_ISSUES.md`** if a bug was resolved or discovered.
