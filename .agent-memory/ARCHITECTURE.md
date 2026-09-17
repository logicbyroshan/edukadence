# Project Memory: Architecture & Data Flow

## 1. High-Level Architectural Blueprint

EduKadence is designed as a **Modular Monolith** with clear domain separation between backend Django applications and a decoupled React (Vite) Single Page Application.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EDUKADENCE ARCHITECTURE                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ FRONTEND - React 18 + Vite SPA ]                                    │
│  ├── React Router v6: Root dispatcher into AppShell/Parent/KidShell   │
│  ├── TanStack Query: Manages all server state, cache & invalidation    │
│  ├── Axios Client: Interceptors for Bearer Token & X-School-ID header  │
│  └── Design System: 25+ accessible primitives in src/components/ui/   │
│                                                                        │
│                          │ HTTPS REST API                              │
│                          ▼ /api/v1/                                    │
│                                                                        │
│  [ BACKEND - Django + Django REST Framework ]                          │
│  ├── Middleware: TenantContextMiddleware (extracts active school)      │
│  ├── Apps:                                                             │
│  │   ├── apps.core: Abstract bases, custom exception handler, paginate │
│  │   ├── apps.users: Custom User model, Simple JWT auth views, RBAC   │
│  │   └── apps.schools: School, Membership, AcademicYear, Settings     │
│  └── Extension Slots: apps.students, apps.attendance, apps.learning   │
│                                                                        │
│                          │ Relational ORM Queries                      │
│                          ▼                                             │
│                                                                        │
│  [ DATABASE - PostgreSQL 16 ]                                          │
│  └── Multi-tenant tables scoped by school_id FK                        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenancy & Data Isolation Model

- **Strategy**: Shared Database with Foreign Key Isolation.
- **Model Hierarchy**: All tenant-owned data models inherit from `apps.core.models.TenantAwareModel`:
  ```python
  class TenantAwareModel(UUIDModel, TimeStampedModel):
      school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='%(app_label)s_%(class)s_set', db_index=True)
  ```
- **Context Resolution**:
  - `TenantContextMiddleware` extracts `X-School-ID` from request headers or query params.
  - ViewSets filter querysets against the active school ID.
  - Users can hold memberships across multiple schools (`SchoolMembership`) with distinct roles (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `PARENT`, `CHILD`).
  - Strict security testing guarantees School A members receive `404 Not Found` when attempting to access School B records.

---

## 3. Authentication & Session Flow

1. **Login**: `POST /api/v1/auth/login/` with `identifier` (email or username) and `password`. Returns `{ access, refresh, user }`.
2. **Access Token**: Short-lived JWT (30 min) sent via `Authorization: Bearer <token>`.
3. **Refresh Token**: Sliding JWT (7 days). On HTTP 401, Axios interceptor queues pending requests, requests new access token from `/api/v1/auth/refresh/`, updates `tokenStorage`, and replays queued requests.
4. **Current User**: `GET /api/v1/auth/me/` returns user details, active school context, and full membership roster.

---

## 4. Frontend State Architecture

1. **Server State**: Managed strictly by TanStack React Query (`queryClient.js`). Never duplicate server state in manual `useState`/`useEffect` patterns.
2. **Client State**: Light context providers:
   - `AuthProvider` (`src/hooks/useAuth.jsx`): Manages authentication status, current user profile, active membership, active role, and school switching.
   - `ToastProvider` (`src/hooks/useToast.jsx`): Application-wide toast notifications.
3. **Storage**: `tokenStorage.js` encapsulates `localStorage` interactions with fallback clearing.
