# EduKadence — System Architecture Document

## 1. Architectural Style: Modular Monolith

EduKadence is designed as a **Modular Monolith** using Django REST Framework on the backend and React (Vite) on the frontend. 

### Why a Modular Monolith?
- **Low Operational Cost & Simplicity**: Ideal for small schools with predictable traffic patterns. Runs economically on a single modest VPS or container cluster.
- **Strict Domain Boundaries**: Each functional area lives in its own decoupled Django app (`apps/users`, `apps/schools`, `apps/core`), keeping code organized without the network latency and distributed failure modes of microservices.
- **Transactional Integrity**: Multi-tenant data consistency, user-school role mappings, and audit trails leverage ACID relational guarantees in PostgreSQL.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EDUKADENCE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [ FRONTEND - React + Vite SPA ]                                        │
│  ├── React Router v6 (Shell Dispatchers: School / Parent / Kid)         │
│  ├── TanStack Query Cache (Server State Separation)                     │
│  ├── Axios API Client (Bearer Token Interceptor & Auto-Refresh)         │
│  └── Centralized Design Tokens & 25+ Accessible UI Primitives           │
│                                                                         │
│                          │ HTTPS REST API                               │
│                          ▼ /api/v1/                                     │
│                                                                         │
│  [ BACKEND - Django & Django REST Framework ]                           │
│  ├── Middleware Layer                                                   │
│  │   ├── Security & CORS Middleware                                     │
│  │   ├── JWT Authentication Middleware                                  │
│  │   └── TenantContextMiddleware (Active School Scoping)                │
│  ├── Domain Applications                                                │
│  │   ├── apps.core    (Base models, Standard exceptions, Pagination)    │
│  │   ├── apps.users   (Custom User, RBAC hierarchy, Auth views)         │
│  │   └── apps.schools (Multi-School, Memberships, Settings, Seed)       │
│  └── Future Domain App Extension Slots                                  │
│      ├── apps.students, apps.attendance, apps.learning, apps.homework   │
│                                                                         │
│                          │ Relational ORM Queries                       │
│                          ▼                                              │
│                                                                         │
│  [ DATABASE - PostgreSQL 16 ]                                           │
│  ├── Users, Roles, School Memberships (Global / Multi-School)           │
│  └── Tenant-Isolated Entities (Indexed by school_id FK)                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenancy Architecture

EduKadence serves multiple independent schools from a single application deployment with **strict data isolation**.

### Tenant Strategy: Shared Database with Foreign Key Isolation
- Every tenant-owned entity inherits from `TenantAwareModel` in `apps.core.models`.
- A `school` foreign key links each record directly to its owning school.
- Every API viewset filters records through the active `school_id` derived from:
  1. Header: `X-School-ID` (validated against the authenticated user's active memberships).
  2. Fallback: User's default `SchoolMembership`.

```python
# apps/core/models.py
class TenantAwareModel(TimeStampedModel, UUIDModel):
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_set',
        db_index=True
    )

    class Meta:
        abstract = True
```

### Multi-School User Membership
A single user (e.g. an educator teaching at two partner nursery schools, or a parent with children at different locations) can belong to multiple schools with independent roles:
- User `U1` -> School `S1` as `SCHOOL_ADMIN`
- User `U1` -> School `S2` as `PARENT`

Tenancy enforcement occurs at the database query level in DRF `get_queryset()` methods, ensuring that **School A users can never inspect, create, or alter records belonging to School B**.

---

## 3. Frontend Architecture

### State Segregation
1. **Server State**: Managed strictly via **TanStack React Query**. Handles background caching, automatic revalidation, query invalidation, and pagination state.
2. **Client / UI State**: Managed via lightweight React hooks, contextual providers (Auth Context, Theme Provider, Toast Provider), and local component state.
3. **Storage Abstraction**: JWT tokens are managed through a centralized storage utility (`tokenStorage.js`) that synchronizes memory and persistent storage with cross-tab safety.

### Layered Shell System
The frontend renders one of three primary shell layouts depending on the active user role and route:
- **AppShell**: Comprehensive navigation drawer, header with school switcher, notifications, breadcrumbs, and command bar.
- **ParentShell**: Mobile-optimized viewport with bottom navigation tabs, child profile selector, and quick notification feed.
- **KidShell**: Fullscreen visual canvas with high contrast, large touch triggers, and playful audio-visual elements.

---

## 4. API Layer Conventions

- **Prefix**: `/api/v1/`
- **Standard Envelope**: All endpoints return predictable JSON envelopes.
- **Error Uniformity**: Custom exception handling catches Django and DRF exceptions, producing standardized error objects with codes, human-readable messages, and field-level validation breakdowns.

---

## 5. Future Module Integration Slots

The modular monolith is structured so that future modules connect cleanly without touching core infrastructure:

```
apps/
  core/         <- Shared base classes, middleware, error handlers
  users/        <- User accounts, auth, global RBAC
  schools/      <- School profiles, settings, memberships, academic years
  # --- Phase 2 Slots ---
  students/     <- Child profiles, medical notes, guardian linkages
  attendance/   <- Daily check-in/out logs, pickup verification
  fees/         <- Invoicing, payment status tracking
  # --- Phase 3 Slots ---
  learning/     <- Content catalog, age stages, games, activities
  # --- Phase 4 Slots ---
  homework/     <- Interactive assignments, teacher review
```
Each new app depends on `apps.core` and references `apps.schools.School` without circular imports.
