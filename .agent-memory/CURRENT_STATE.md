# Project Memory: Current Project State

## 1. Current Baseline: Version 3.0.0-phase3

Phase 1, Phase 2, and Phase 3 are fully implemented, verified with 38/38 passing backend tests, and frontend production build passes cleanly.

---

## 2. Completed Capabilities (Phases 1, 2 & 3)

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
- [x] 38/38 passing Pytest tests covering RBAC, tenancy, and learning engine.

### Frontend (React + Vite)
- [x] Pure JavaScript React 18 + Vite SPA (NO TypeScript, NO Next.js).
- [x] 25+ reusable UI primitives under `src/components/ui/`.
- [x] School Management Shell (`AppShell`) with categorized sidebar navigation.
- [x] Mobile-First Parent Portal (`ParentShell` & `ParentPortalPage`) with multi-child sibling switcher, daily school status, photo moments feed, monthly attendance, fee dues & receipt view, pickup PIN reveal, and **Learning Journey tab**.
- [x] Safe Kid Mode Sandbox (`KidShell`, `KidHomePage`, `KidExplorePage`, `KidStoriesPage`, `KidVideosPage`, `KidBadgesPage`) with live stars counter, sound switcher, and adult math-gate exit dialog.
- [x] Reusable `ActivityRunner` with 12 interactive activity sub-components and star celebration screen.
- [x] Clean frontend production bundle (`npm run build` succeeds in 6s).

---

## 3. Next Phase (Phase 4: Teacher Interactive Homework Authoring Studio)

Phase 4 will introduce:
1. Teacher Homework Authoring Studio (building interactive lessons, custom quests).
2. Advanced assignment scheduling, submission reviews, and teacher feedback.
3. Homework completion streaks and classroom progress analytics.

---

## 4. Guardrails & Known Constraints
- DO NOT convert React to TypeScript or Next.js.
- DO NOT convert Django to FastAPI or microservices.
- DO NOT compromise multi-tenant isolation (`school_id` filtering must be strictly preserved).
- Always use the mandatory branch + `gh pr create` + `gh pr merge` workflow for any code modification.
