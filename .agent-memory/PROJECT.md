# Project Memory: EduKadence Overview

## 1. What is EduKadence?
EduKadence is a cloud-native, multi-tenant Software-as-a-Service (SaaS) platform purposefully created for **small early-childhood and primary educational institutions** (typically serving children aged **2 to 10 years old** with student enrollments up to ~200 students).

Target Institutions:
- Play Schools & Crèches
- Daycares & Preschools
- Nursery Schools
- Montessori Schools
- Kindergartens (LKG/UKG)
- Primary Schools (Grades 1 through 5)

---

## 2. Core Value Proposition & Philosophy

Traditional enterprise school ERPs fail for small early-learning institutions due to overwhelming bureaucracy, complex interfaces, and lack of child/parent delight. EduKadence delivers three specialized experiences:

1. **SCHOOL (Manage)**: Clean, zero-overhead administration for 1 principal and 3–8 teachers.
2. **PARENT (Connect)**: Mobile-first reassurance with real-time check-in/out timestamps, activity feeds, teacher messages, and secure pickup PINs.
3. **CHILD / KID MODE (Play + Learn + Grow)**: Safe, visual, distraction-free educational playground tailored to 6 developmental stages (Explore, Discover, Learn, Build, Create, Grow).

---

## 3. Technology Stack & Constraints

- **Backend**: Python 3.11+, Django 5.2+, Django REST Framework (DRF), Simple JWT.
- **Frontend**: React 18, JavaScript (ES6+), Vite, React Router v6, TanStack Query v5, Axios, Tailwind CSS.
- **Database**: PostgreSQL 16 (production/Docker) + SQLite fallback (local dev/tests).
- **Architecture**: Modular Monolith with domain-driven apps (`apps/core`, `apps/users`, `apps/schools`).
- **Hard Constraints**:
  - Pure JavaScript (NO TypeScript).
  - Single Page Application (NO Next.js / SSR).
  - Django REST Framework (NO FastAPI).
  - PostgreSQL (NO MongoDB).
  - Low infrastructure overhead (no premature microservices, Kafka, Celery, or Redis in Phase 1).

---

## 4. Current State & Maturity
- **Phase**: Phase 1 Foundation Complete.
- **Status**: Stable, verified baseline with 100% passing tests (21/21), production build passing, seeded demo dataset, and full documentation.
