# Project Memory: Current Project State

## 1. Current Baseline: Version 4.0.0-phase4

Phases 1, 2, 3, and 4 are fully implemented, verified with 43/43 passing backend tests, and frontend production build passes cleanly with zero warnings or errors.

---

## 2. Completed Capabilities (Phases 1, 2, 3 & 4)

### Backend (Django + DRF)
- [x] Modular Monolith structure: `apps/core`, `apps/users`, `apps/schools`, `apps/classes`, `apps/students`, `apps/attendance`, `apps/fees`, `apps/activities`, `apps/communication`, `apps/reports`, `apps/learning`.
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
- [x] 6 Developmental Stages (`LearningLevel`: Explore 2-3, Discover 3-4, Learn 4-5, Build 5-7, Create 7-9, Grow 9-10).
- [x] Learning curriculum domains (`LearningArea`) and unit topics (`LearningTopic`).
- [x] Data-driven learning activity engine (`Activity`) supporting 12 interactive types.
- [x] Server-side attempt submission (`ActivityAttempt`) with score, star rewards, and progress tracking (`LearningProgress`).
- [x] Achievement milestone badges (`RewardBadge`, `ChildBadge`).
- [x] Interactive storybooks (`InteractiveStory`, `StoryScene`) and curated educational video hub (`CuratedVideo`).
- [x] **Phase 4 Homework Models**: `Homework`, `HomeworkActivity`, `HomeworkAssignment`, `ChildHomeworkProgress`, and enhanced `ActivityAttempt`.
- [x] **Phase 4 REST API Endpoints**: `HomeworkViewSet` (publish, duplicate), `HomeworkAssignmentViewSet` (class_progress, feedback), `ChildHomeworkProgressViewSet`, and activity `templates`.
- [x] 43/43 passing Pytest tests (100% success rate) covering auth, RBAC, multi-tenancy, and Phase 4 teacher learning flows.

### Frontend (React + Vite)
- [x] Pure JavaScript React 18 + Vite SPA (NO TypeScript, NO Next.js).
- [x] 25+ reusable UI primitives under `src/components/ui/`.
- [x] School Management Shell (`AppShell`) with categorized sidebar navigation.
- [x] Mobile-First Parent Portal (`ParentShell` & `ParentPortalPage`) with multi-child sibling switcher, daily school status, photo moments feed, monthly attendance, fee dues & receipt view, pickup PIN reveal, and **Learning Journey tab with Assigned Homework Quests & Teacher Notes**.
- [x] Safe Kid Mode Sandbox (`KidShell`, `KidHomePage`, `KidExplorePage`, `KidStoriesPage`, `KidVideosPage`, `KidBadgesPage`) with live stars counter, sound switcher, adult math-gate exit dialog, and **Today's Learning Quests card section**.
- [x] Reusable `ActivityRunner` with 12 interactive activity sub-components, preview mode, assignmentId context, and star celebration screen.
- [x] **Teacher Learning Studio (`LearningStudioPage.jsx`)**: 4 sub-tabs (Overview, Homework Quests, Activity Studio, Class Progress).
- [x] **Activity Editor Modal (`ActivityEditorModal.jsx`)**: Visual authoring with 6+ starter templates and live test preview.
- [x] **Homework Builder Modal (`HomeworkBuilderModal.jsx`)**: 3-step wizard for bundling activities and scheduling assignments.
- [x] **Teacher Review Modal (`TeacherReviewModal.jsx`)**: Roster submission metrics, student cards, and quick encouragement feedback stamps.
- [x] Clean frontend production bundle (`npm run build` succeeds in 3.5s).

---

## 3. Next Phase (Phase 5: Production Hardening & Deployment)

Phase 5 will introduce:
1. Production staging and live deployment configurations.
2. End-to-end security audits, rate-limiting, and error telemetry.
3. Final production optimizations.

---

## 4. Guardrails & Known Constraints
- DO NOT convert React to TypeScript or Next.js.
- DO NOT convert Django to FastAPI or microservices.
- DO NOT compromise multi-tenant isolation (`school_id` filtering must be strictly preserved).
- Always use the mandatory branch + `gh pr create` + `gh pr merge` workflow for any code modification.
