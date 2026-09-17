# Session Memory: 2026-09-17 — Initial Audit & Memory Bootstrap

## 1. Context & Objectives
- Established the permanent, token-efficient operating system for EduKadence.
- Audited the entire repository recursively to build a complete mental model of backend, frontend, database, tenancy, permissions, routing, and design systems.
- Created `AGENTS.md`, `CHANGELOG.md`, and `.agent-memory/` directory tree.

---

## 2. Key Codebase Findings

### Architecture
- **Backend**: Django modular monolith (`apps.core`, `apps.users`, `apps.schools`).
- **Frontend**: React (pure JavaScript) + Vite SPA with 3 dedicated shells (`AppShell`, `ParentShell`, `KidShell`).
- **Data Isolation**: Strict `school_id` foreign key isolation tested via `backend/tests/test_tenant_isolation.py`.
- **RBAC**: 5 distinct roles (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `PARENT`, `CHILD`).

### Watchpoints Discovered
- Management commands must use ASCII indicators (`[+]`) rather than unicode checkmarks for Windows console `cp1252` compatibility.
- DRF test client requests with nested dict bodies require `format='json'`.
- All changes must follow dedicated branch creation -> push -> `gh pr create` -> `gh pr merge`.

---

## 3. Next Steps for Future Sessions
- Phase 2 implementation when requested by user.
- Consult `AGENTS.md` and `.agent-memory/` first before inspecting code on each new task.
