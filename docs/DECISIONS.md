# EduKadence — Architecture Decision Records (ADRs)

This log records major architectural and technical decisions made for EduKadence, their context, and their rationale.

---

## ADR 001: Modular Monolith vs. Microservices
- **Date**: 2026-09-17
- **Status**: Accepted
- **Context**: EduKadence is a SaaS designed for small early-childhood schools (~200 students per school).
- **Decision**: Adopt a Modular Monolith architecture in Django with domain-driven modular apps (`apps.users`, `apps.schools`, `apps.core`, etc.).
- **Rationale**: Microservices introduce significant network latency, orchestration overhead, deployment complexity, and infrastructure cost. A modular monolith provides strict code boundaries with single-database transactional integrity, keeping hosting costs low and developer velocity high.

---

## ADR 002: Frontend Framework Selection: React (JavaScript) + Vite
- **Date**: 2026-09-17
- **Status**: Accepted
- **Context**: The frontend requires rapid development, instant HMR, high responsiveness, and three distinct user shells (School, Parent, Kid).
- **Decision**: Use React 18+ with JavaScript and Vite. Avoid TypeScript and Next.js for Phase 1.
- **Rationale**: Plain JavaScript with modern React patterns keeps the frontend lightweight, accessible to developers, fast to bundle, and free of unnecessary server-side rendering (SSR) overhead. Vite provides ultra-fast development iterations.

---

## ADR 003: Multi-Tenancy via Shared Database and Foreign Key Isolation
- **Date**: 2026-09-17
- **Status**: Accepted
- **Context**: EduKadence must support multiple independent schools while maintaining low infrastructure costs.
- **Decision**: Implement multi-tenancy using a shared database and table schema, where every tenant-owned entity includes a foreign key to `schools.School`.
- **Rationale**: Database-per-tenant or schema-per-tenant architectures create severe migration and connection-pooling bottlenecks when scaling to hundreds of small schools. Foreign key isolation in PostgreSQL combined with DRF query filtering provides robust security and straightforward data maintenance.

---

## ADR 004: JWT Authentication with Simple JWT
- **Date**: 2026-09-17
- **Status**: Accepted
- **Context**: Need a stateless, secure authentication protocol that works consistently across web browsers, mobile viewports, and future native apps.
- **Decision**: Use `djangorestframework-simplejwt` with short-lived access tokens (15–30 min) and rotating refresh tokens.
- **Rationale**: Stateless JWTs avoid server-side session lookup bottlenecks and allow cross-domain API consumption while maintaining fine-grained token revocation.

---

## ADR 005: Custom Design System with Logo-Derived Brand Tokens
- **Date**: 2026-09-17
- **Status**: Accepted
- **Context**: The application must look professional and trustworthy for school administrators and parents, while remaining cheerful and engaging for kids.
- **Decision**: Build a custom design system of 25+ reusable primitives using Tailwind CSS with brand tokens derived strictly from the EduKadence logo (Electric Blue, Sky Blue, Dark Sky Slate, and Clean White surfaces).
- **Rationale**: Avoids heavy third-party UI component libraries (such as MUI or Ant Design) that add runtime bloat and create generic ERP aesthetics. Custom tokens ensure global consistency and instant theme controllability.
