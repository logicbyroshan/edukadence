# EduKadence — Database Modeling & Tenancy Specification

## 1. Database Principles

EduKadence relies on **PostgreSQL 16** for its strong relational integrity, ACID compliance, robust indexing capabilities, and JSONB support for flexible school-level configurations.

### Core Modeling Standards
1. **Primary Keys**: Universally Unique Identifiers (UUIDv4) are used for entity IDs to prevent enumeration attacks and simplify future distributed data synchronization.
2. **Audit Timestamps**: All entities inherit `created_at` and `updated_at` (auto-now UTC timestamps).
3. **Foreign Keys & Constraints**: Hard foreign key constraints with explicit `on_delete` behaviors (`CASCADE`, `PROTECT`, or `SET_NULL`).
4. **Normalized Relational Design**: Core business entities are stored in normalized relational tables. JSON fields are strictly reserved for arbitrary school configuration dictionaries (`SchoolSetting`).

---

## 2. Entity Relationship Model (Phase 1)

```
┌────────────────────────────────┐                 ┌────────────────────────────────┐
│             users              │                 │            schools             │
├────────────────────────────────┤                 ├────────────────────────────────┤
│ id (UUID, PK)                  │                 │ id (UUID, PK)                  │
│ email (VARCHAR, Unique)        │                 │ name (VARCHAR)                 │
│ first_name (VARCHAR)           │                 │ slug (VARCHAR, Unique)         │
│ last_name (VARCHAR)            │                 │ code (VARCHAR, Unique)         │
│ phone_number (VARCHAR)         │                 │ logo_url (VARCHAR)             │
│ avatar (VARCHAR)               │                 │ email (VARCHAR)                │
│ is_active (BOOLEAN)            │                 │ phone (VARCHAR)                │
│ is_staff (BOOLEAN)             │                 │ address (TEXT)                 │
│ is_superuser (BOOLEAN)         │                 │ timezone (VARCHAR)             │
│ created_at (TIMESTAMPTZ)       │                 │ is_active (BOOLEAN)            │
│ updated_at (TIMESTAMPTZ)       │                 │ created_at (TIMESTAMPTZ)       │
└───────────────┬────────────────┘                 └───────────────┬────────────────┘
                │                                                  │
                │         ┌──────────────────────────────┐         │
                └────────►│      school_memberships      │◄────────┘
                          ├──────────────────────────────┤
                          │ id (UUID, PK)                │
                          │ user_id (UUID, FK -> users)  │
                          │ school_id (UUID, FK->schools)│
                          │ role (VARCHAR: ADMIN/TEACHER)│
                          │ is_default (BOOLEAN)         │
                          │ is_active (BOOLEAN)          │
                          │ created_at (TIMESTAMPTZ)     │
                          │ UNIQUE(user, school, role)   │
                          └──────────────────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │       academic_years         │
                          ├──────────────────────────────┤
                          │ id (UUID, PK)                │
                          │ school_id (UUID, FK->schools)│
                          │ name (VARCHAR: 2026-2027)    │
                          │ start_date (DATE)            │
                          │ end_date (DATE)              │
                          │ is_current (BOOLEAN)         │
                          │ created_at (TIMESTAMPTZ)     │
                          │ UNIQUE(school, name)         │
                          └──────────────────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │       school_settings        │
                          ├──────────────────────────────┤
                          │ id (UUID, PK)                │
                          │ school_id (UUID, FK->schools)│
                          │ key (VARCHAR)                │
                          │ value (JSONB)                │
                          │ UNIQUE(school, key)          │
                          └──────────────────────────────┘
```

---

## 3. Detailed Schema Definitions

### `users` Table
- `id`: `UUID` (Primary Key, default `gen_random_uuid()`)
- `email`: `VARCHAR(255)` (Unique, Index)
- `first_name`: `VARCHAR(150)`
- `last_name`: `VARCHAR(150)`
- `phone_number`: `VARCHAR(32)` (Nullable, Indexed)
- `avatar`: `VARCHAR(500)` (Nullable)
- `password`: `VARCHAR(128)` (Django Argon2/PBKDF2 hash)
- `is_active`: `BOOLEAN` (Default `True`)
- `is_staff`: `BOOLEAN` (Default `False`)
- `is_superuser`: `BOOLEAN` (Default `False`)
- `date_joined`: `TIMESTAMPTZ` (Default `NOW()`)
- `updated_at`: `TIMESTAMPTZ` (Auto-updated)

### `schools` Table
- `id`: `UUID` (Primary Key)
- `name`: `VARCHAR(255)` (Index)
- `slug`: `VARCHAR(100)` (Unique, Index, e.g. `little-sprouts-montessori`)
- `code`: `VARCHAR(32)` (Unique, Index, e.g. `LSM-01`)
- `logo_url`: `VARCHAR(500)` (Nullable)
- `email`: `VARCHAR(255)`
- `phone`: `VARCHAR(32)`
- `address`: `TEXT`
- `timezone`: `VARCHAR(64)` (Default `UTC`)
- `is_active`: `BOOLEAN` (Default `True`)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`

### `school_memberships` Table
- `id`: `UUID` (Primary Key)
- `user_id`: `UUID` (Foreign Key to `users.id`, `on_delete=CASCADE`)
- `school_id`: `UUID` (Foreign Key to `schools.id`, `on_delete=CASCADE`)
- `role`: `VARCHAR(32)` (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `PARENT`, `CHILD`)
- `is_default`: `BOOLEAN` (Default `False`)
- `is_active`: `BOOLEAN` (Default `True`)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`
- **Constraint**: `UniqueConstraint(fields=['user', 'school', 'role'])`

### `academic_years` Table
- `id`: `UUID` (Primary Key)
- `school_id`: `UUID` (Foreign Key to `schools.id`, `on_delete=CASCADE`)
- `name`: `VARCHAR(64)` (e.g. `2026-2027`)
- `start_date`: `DATE`
- `end_date`: `DATE`
- `is_current`: `BOOLEAN` (Default `False`)
- **Constraint**: `UniqueConstraint(fields=['school', 'name'])`

---

## 4. Indexing Strategy

1. **Multi-tenant foreign keys**: Every tenant-scoped entity indexes `(school_id, created_at)` or `(school_id, is_active)` for ultra-fast filtered queries.
2. **Lookup fields**: Unique indexes on `users.email`, `schools.slug`, `schools.code`.
3. **Compound membership indexes**: `(user_id, school_id)` and `(school_id, role)`.

---

## 5. Migration Strategy

- All database modifications are executed exclusively through Django migrations (`python manage.py makemigrations` and `python manage.py migrate`).
- Migrations are version-controlled in each app's `migrations/` directory.
- No destructive direct-table queries are permitted in production environments.
