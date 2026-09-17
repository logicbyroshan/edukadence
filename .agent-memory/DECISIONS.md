# Project Memory: Architecture Decision Records (ADRs)

This document tracks all foundational architectural and technical decisions made for EduKadence.

---

## ADR 001: Modular Monolith vs. Microservices
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: Build EduKadence as a modular monolith in Django with isolated domain apps (`apps/core`, `apps/users`, `apps/schools`).
- **Rationale**: Target schools are small (~200 students). Microservices add extreme operational complexity, network latency, distributed transaction failures, and hosting costs. A modular monolith provides strict code boundaries with single-database transactional integrity and low operational cost.

---

## ADR 002: Frontend Stack: React (Pure JavaScript) + Vite
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: Use React 18+ with plain JavaScript and Vite. Reject TypeScript and Next.js for Phase 1.
- **Rationale**: Keeps development fast and accessible, eliminates SSR operational overhead, provides instant HMR, and produces lightweight static client bundles.

---

## ADR 003: Multi-Tenancy via Shared Database with Foreign Key Isolation
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: Implement multi-tenancy using a single PostgreSQL database where every tenant-owned entity inherits `TenantAwareModel` with a `school` FK constraint.
- **Rationale**: Database-per-tenant or schema-per-tenant architectures create severe migration and connection-pooling bottlenecks when scaling to hundreds of small schools. Foreign key isolation in PostgreSQL combined with DRF query filtering provides robust security and straightforward data maintenance.

---

## ADR 004: Stateless JWT Authentication with Simple JWT
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: Use `djangorestframework-simplejwt` with 30-minute access tokens and rotating 7-day refresh tokens.
- **Rationale**: Stateless tokens avoid session lookup bottlenecks and provide uniform authentication across desktop web, mobile viewports, and future native apps.

---

## ADR 005: Custom Design System with Logo-Derived Tokens
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: Build a custom design system of 25+ primitives using Tailwind CSS with tokens derived directly from the EduKadence logo (Electric Blue `#2563EB`, Sky Blue `#0EA5E9`, Deep Navy `#0F172A`).
- **Rationale**: Avoids heavy third-party UI component libraries (such as MUI or Ant Design) that add runtime bloat and create generic ERP aesthetics. Custom tokens ensure global consistency and instant theme controllability.

---

## ADR 006: Mandatory Branch & GitHub CLI PR Workflow
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: All future modifications (features, fixes, chores) must be developed on dedicated branches (`feat/`, `fix/`, `bug/`), pushed to remote, submitted via GitHub CLI (`gh pr create`), and merged via GitHub CLI (`gh pr merge`). Direct pushes to `main` are disallowed.
- **Rationale**: Ensures isolated changes, verifiable pull requests, clean history, and consistent automated verification.

---

## ADR 007: Normalized Parent-Child Relational Model
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: Model parents as first-class entities with an explicit `ChildParentRelationship` through-model holding relationship type, primary contact, emergency contact, and pickup authorization flags.
- **Rationale**: Real-world early childhood schools have diverse family structures (mothers, fathers, guardians, shared custody, siblings). Hardcoding mother/father columns fails when siblings share parents or non-parent guardians are authorized.

---

## ADR 008: 1-Tap Bulk Attendance with Unique Date-Child Constraints
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: Implement daily attendance with a dedicated `bulk_mark` endpoint and database-level `unique_together = ['school', 'child', 'date']` constraint.
- **Rationale**: Early childhood teachers need to mark attendance for 15-20 toddlers in under 10 seconds. 1-tap bulk submission with server-side upsert guarantees high speed while strictly preventing duplicate attendance records.

---

## ADR 009: Scoped Classroom Moments & PIN-Verified Safe Dismissal
- **Date**: 2026-09-17
- **Status**: Accepted
- **Decision**: Isolate daily classroom photo streams by class/section audience and require server-validated authorization checks and pickup PIN verification for child dismissal.
- **Rationale**: Early childhood photos and dismissal are safety-critical. Scoped audiences ensure parents only see photos from their child's classroom, and server-side pickup verification prevents unauthorized dismissals.

