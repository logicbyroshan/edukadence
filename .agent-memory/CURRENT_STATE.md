# Project Memory: Current Project State

## 1. Current Baseline: Version 2.0.0-phase2

Phase 1 & Phase 2 are fully implemented, verified with 31/31 passing backend tests, and frontend build passes cleanly.

---

## 2. Completed Capabilities (Phase 1 & 2)

### Backend (Django + DRF)
- [x] Modular Monolith structure: `apps/core`, `apps/users`, `apps/schools`, `apps/classes`, `apps/students`, `apps/attendance`, `apps/fees`, `apps/activities`, `apps/communication`, `apps/reports`.
- [x] Multi-tenant database model with foreign-key isolation and active school context resolution.
- [x] Custom `User` model supporting both email and child username login.
- [x] 5-Role RBAC hierarchy (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `PARENT`, `CHILD`).
- [x] Student profiles (`Child`), parent entities (`Parent`), and multi-child sibling linkages (`ChildParentRelationship`).
- [x] Grade levels (`ClassLevel`), sections (`Section`), historical enrollments (`Enrollment`), and teacher assignments (`ClassTeacherAssignment`).
- [x] 1-Tap Daily mass attendance (`DailyAttendance`) with database uniqueness constraints.
- [x] School fee structures (`FeeStructure`), student dues (`StudentFeeItem`), and payments with receipts (`FeePayment`).
- [x] Safe dismissal handoffs (`AuthorizedPickupPerson`, `PickupRecord`) with PIN verification.
- [x] Classroom moments & photo stream (`ClassActivity`) with audience isolation.
- [x] School bulletins and announcements (`Announcement`) with priority and audience filters.
- [x] Operational analytics reports and 1-click CSV exports (`apps.reports`).
- [x] Enhanced `seed_dev_data` management command seeding demo school "Sunrise Kids Academy".
- [x] 31/31 passing Pytest tests covering RBAC, tenant isolation, and all Phase 2 operational flows.

### Frontend (React + Vite)
- [x] Pure JavaScript React 18 + Vite SPA (NO TypeScript, NO Next.js).
- [x] 25+ reusable UI primitives under `src/components/ui/`.
- [x] School Management Shell (`AppShell`) with categorized sidebar navigation.
- [x] Mobile-First Parent Portal (`ParentShell` & `ParentPortalPage`) with multi-child sibling switcher, daily school status, photo moments feed, monthly attendance, fee dues & receipt view, pickup PIN reveal, and notices.
- [x] Operational pages: `ChildrenPage`, `ChildProfilePage`, `ParentsPage`, `TeachersPage`, `ClassesPage`, `AttendancePage`, `FeesPage`, `PaymentsPage`, `PickupPage`, `ActivitiesPage`, `AnnouncementsPage`, `ReportsPage`, `DashboardPage`.
- [x] Clean frontend production bundle (`npm run build` succeeds in 28s).

---

## 3. Next Phase (Phase 3: Kid Mode & Visual Learning Sandbox)

Phase 3 will introduce:
1. Safe visual learning environment structured around 6 developmental stages.
2. Interactive play modules, visual progress, and child delight elements.
3. Locked kid sandbox controls without external ad/social exposure.

---

## 4. Guardrails & Known Constraints
- DO NOT convert React to TypeScript or Next.js.
- DO NOT convert Django to FastAPI or microservices.
- DO NOT compromise multi-tenant isolation (`school_id` filtering must be strictly preserved).
- Always use the mandatory branch + `gh pr create` + `gh pr merge` workflow for any code modification.
