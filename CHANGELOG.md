# Changelog — EduKadence

All notable changes to the EduKadence platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.0.0-audit] - 2026-09-18

### Fixed & Stabilized
- **Global UI Design System & Component Harmonization**:
  - Standardized `<Button />` with unified sizing scale (`sm`, `md`, `lg`, `xl`), brand tokens (`#0084D6`, `#00C3FF`), accessible focus states, and double-click lock protection during async mutations.
  - Enhanced `<Avatar />` component with dynamic initials fallback, soft gradient styling, and React `onError` event handling to eliminate broken image icons across all roles.
  - Standardized `<EduKadenceLogo />` and brand color palette across `AppShell`, `ParentShell`, `KidShell`, and `AuthLayout`.
- **Parent Portal & Mobile Responsive Stabilization**:
  - Overhauled mobile bottom navigation to a uniform 6-column grid (`min-h-[48px]`, centered SVG stroke icons, active indicator pills, zero text wrapping/clipping).
  - Modernized parent sibling selector into an `overflow-x-auto no-scrollbar` flex capsule container seamlessly accommodating 1 to 10+ children.
  - Replaced raw image elements with `<Avatar />` and safe image fallbacks across Children directory, Attendance roster, Classroom Moments, Dismissals, and Kid stories/videos.
- **Backend Tenant Isolation & Child Security Shielding**:
  - Introduced `IsNotChild` RBAC permission class in `apps/core/permissions.py` shielding institutional fee structures, billing invoices, and staff settings from child sessions.
  - Scoped parent endpoints to strictly authorized child records in `apps/students/views.py`.
  - Added `backend/tests/test_audit_stabilization.py` validating cross-school isolation, parent-child record shielding, child mode restrictions, and pickup transitions.
  - 47 of 47 backend tests passing (100% pass rate).
  - Frontend production build (`npm run build`) passing with zero errors.

---

## [4.0.0-phase4] - 2026-09-18

### Added
- **Teacher Learning Studio & Quest Authoring (`apps.learning`)**:
  - `Homework` model (UUID, tenant-aware, title, instructions, learning area, topic, target level, difficulty, estimated minutes, status lifecycle, versioning).
  - `HomeworkActivity` linking activities into ordered sequential quest bundles with completion requirements.
  - `HomeworkAssignment` class scheduling model with start date, due date, section/class targeting, and active state management.
  - `ChildHomeworkProgress` tracking individual student completion rates, average scores, total stars earned, and personalized teacher feedback.
  - Enhanced `Activity` model with teacher authorship tracking (`created_by`), versioning, and starter template classification (`is_template`, `template_category`).
  - Enhanced `ActivityAttempt` linking attempts to homework quest and assignment context.
- **REST APIs & Backend Workflows (`backend/apps/learning/`)**:
  - `HomeworkViewSet` with CRUD, duplicate, and publish endpoints.
  - `HomeworkAssignmentViewSet` with automated child progress generation upon assignment, `class_progress` roster breakdown, and `feedback` endpoint.
  - `ChildHomeworkProgressViewSet` for student submission tracking.
  - Enhanced `ActivityViewSet` with `templates` catalog and 1-click `duplicate` action.
  - Enhanced `submit_attempt` action automatically updating `ChildHomeworkProgress` and rewarding safe stars.
  - Enhanced `KidDashboardView` returning active assigned homework quests for enrolled students.
- **Frontend Teacher Learning Studio (`frontend/src/pages/LearningStudioPage.jsx`)**:
  - Four dedicated sub-tabs: Overview, Homework Quests, Activity Studio, and Class Progress.
  - Quick KPI summary cards, active quests overview, and starter template scaffolds.
  - Visual activity authoring modal (`ActivityEditorModal.jsx`) supporting 12 data-driven activity types with real-time test preview.
  - Multi-step quest builder modal (`HomeworkBuilderModal.jsx`) for bundling activities and scheduling assignments.
  - Teacher Review & Encouragement Modal (`TeacherReviewModal.jsx`) with roster completion metrics, score cards, and positive feedback stamps.
- **Child Kid Mode & Parent Portal Extensions**:
  - `KidHomePage.jsx`: "Today's Learning Quests" card section displaying teacher-assigned quests with sequential play triggers and teacher notes.
  - `ParentPortalPage.jsx`: "Assigned Homework Quests" list under Learning Journey tab displaying quest progress, due dates, and teacher feedback notes.
- **Automated Tests & Quality Gate**:
  - Comprehensive Pytest test suite (`tests/test_phase4_teacher_learning.py`) covering homework creation, class assignment, child progress updates, teacher review/feedback, and strict multi-tenant isolation.
  - 43 of 43 automated backend tests passing with 100% success rate.
  - Frontend production build (`npm run build`) passing with 0 errors.

---

## [3.0.1] - 2026-09-18

### Fixed
- **Frontend Utilities & Gitignore**:
  - Scoped `lib/` in root `.gitignore` to prevent unintentionally ignoring `frontend/src/lib/`.
  - Added `frontend/src/lib/tokenStorage.js` for robust JWT token persistence, active school context tracking, and cross-tab session syncing.
  - Added `frontend/src/lib/queryClient.js` for centralized TanStack Query client configuration.
  - Resolved `npm run build` import resolution errors.

---

## [3.0.0-phase3] - 2026-09-17

### Added
- **Learning Engine & Developmental Stages (`apps.learning`)**:
  - `LearningLevel` supporting 6 developmental stages (Explore 2–3, Discover 3–4, Learn 4–5, Build 5–7, Create 7–9, Grow 9–10) with age-adaptive interactions.
  - `LearningArea` (Alphabet, Math, Shapes, Stories, Science, Creativity) and `LearningTopic` unit models.
  - `Activity` model supporting 12 data-driven activity types (`TAP_CHOOSE`, `COUNT`, `MATCH`, `SORT`, `MEMORY`, `SEQUENCE`, `TRACE`, `COLOR`, `QUIZ`, `DRAG_DROP`, `STORY`, `VIDEO`).
- **Server-Side Evaluation & Rewards Engine (`apps.learning`)**:
  - `ActivityAttempt` with server-calculated star awards (1–3 stars) and anti-cheat validation.
  - `LearningProgress` tracking topic and curriculum area mastery per child.
  - `RewardBadge` and `ChildBadge` milestone achievement system.
- **Interactive Storybooks & Curated Video Hub (`apps.learning`)**:
  - `InteractiveStory` and `StoryScene` models for multi-scene illustrated storybooks with audio cues and checkpoint questions.
  - `CuratedVideo` for controlled, ad-free educational mini-videos.
- **Kid Mode Experience (`frontend/src/pages/kid/` & `KidShell`)**:
  - `KidHomePage`: Personalized greeting, age-adaptive layout, Continue Learning, Today's Challenge, Recommended Activities, and Category Carousels.
  - `KidExplorePage`: Developmental stage explorer from Explore 2–3 to Grow 9–10 with filtered activities.
  - `KidStoriesPage`: Interactive storybook corner.
  - `KidVideosPage`: Curated educational video theatre.
  - `KidBadgesPage`: "My World" trophy room with star wallet, unlocked badges, and area mastery trees.
  - `KidShell`: Cheerful top bar with live stars counter, sibling switcher, sound toggle, and adult math-challenge exit gate.
- **Data-Driven Activity Engine (`frontend/src/components/learning/`)**:
  - `ActivityRunner` container with progress, audio instructions, and star celebration modal.
  - 12 interactive activity sub-components (`TapChooseActivity`, `CountActivity`, `MatchActivity`, `SortActivity`, `MemoryActivity`, `SequenceActivity`, `TraceActivity`, `ColorActivity`, `QuizActivity`, `DragDropActivity`, `StoryReader`, `CuratedVideoPlayer`).
- **Parent & School Integration**:
  - `ParentPortalPage` "Learning Journey" tab displaying completed activities, stars earned, topic progress, unlocked badges, and 1-tap Kid Mode launcher.
  - `DashboardPage` operational control with Kid Sandbox launcher.
- **Automated Test Coverage**:
  - 38 of 38 passing backend tests (100% pass rate) covering learning levels, activity attempts, reward unlocks, and kid mode security.

---

## [2.0.0-phase2] - 2026-09-17

### Added
- **Children & Student Management (`apps.students`)**:
  - `Child` model with comprehensive student profile (name, DOB, gender, admission ID, blood group, emergency contacts, medical notes, status lifecycle).
  - Tabbed 360-degree `ChildProfilePage` (Overview, Parents, Attendance, Fees, Pickups, Moments).
- **Parents & Multi-Child Sibling Support (`apps.students`)**:
  - `Parent` and `ChildParentRelationship` models allowing multiple children/siblings per parent account.
  - Dedicated `ParentsPage` for guardian management.
- **Classes, Sections & Historical Enrollments (`apps.classes`)**:
  - `ClassLevel`, `Section`, `ClassTeacherAssignment`, and `Enrollment` models.
  - `ClassesPage` and `TeachersPage` managing grade levels, cohorts, room capacities, and teacher assignments.
- **1-Tap Mass Attendance (`apps.attendance`)**:
  - `DailyAttendance` model with database uniqueness constraints `[school, child, date]`.
  - `AttendancePage` supporting 1-tap bulk marking (Present, Absent, Late) and instant statistics.
- **School Fees & Invoicing (`apps.fees`)**:
  - `FeeStructure`, `StudentFeeItem`, and `FeePayment` models.
  - `FeesPage` and `PaymentsPage` supporting mass fee assignment and official printable receipts (`REC-YYYYMM-XXXX`).
- **Safe Dismissal & Pickup Workflow (`apps.students`)**:
  - `AuthorizedPickupPerson` and `PickupRecord` models.
  - `PickupPage` featuring real-time queue (`WAITING`, `READY_FOR_PICKUP`, `PICKED_UP`) and 4-digit dismissal PIN verification.
- **Classroom Moments & Photo Feed (`apps.activities`)**:
  - `ClassActivity` model with category tagging (Art, Learning, Music, Outdoor, Story).
  - `ActivitiesPage` photo stream with tenant and section audience isolation.
- **School Announcements (`apps.communication`)**:
  - `Announcement` model with audience scoping (`ALL_SCHOOL`, `CLASS_LEVEL`, `SECTION`, `INDIVIDUAL_CHILD`) and priority tags.
  - `AnnouncementsPage` noticeboard.
- **Operational Reports & CSV Exports (`apps.reports`)**:
  - `ReportsPage` for class strength, attendance breakdowns, fee collections, and 1-click CSV downloads.
- **Parent Connect Portal (`ParentPortalPage` & `ParentShell`)**:
  - Mobile-first interface with multi-child sibling switcher, daily school status ("At School"), photo moments feed, monthly attendance, outstanding fee dues & receipts, and dismissal PIN reveal.
- **Enhanced Seed Data & Testing**:
  - Seeded realistic small demo school "Sunrise Kids Academy" with 10+ students, teachers, parents, attendance, fees, activities, and pickups.
  - 31 automated backend tests passing with 100% success rate.

## [1.0.0-phase1] - 2026-09-17

### Added
- **Core Architecture**:
  - Initialized modular monolith in Django 5 + Django REST Framework.
  - Multi-tenant data model with shared PostgreSQL database and foreign key isolation.
  - Base models (`UUIDModel`, `TimeStampedModel`, `TenantAwareModel`) in `apps.core`.
  - Standardized JSON API exception handler and pagination.
- **Authentication & RBAC**:
  - Stateless JWT authentication via `djangorestframework-simplejwt`.
  - Custom `User` model supporting email and username identification.
  - Role-based permissions (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `PARENT`, `CHILD`).
  - `TenantContextMiddleware` resolving active school context from `X-School-ID` headers.
- **Schools & Multi-Tenancy**:
  - `School`, `SchoolMembership`, `AcademicYear`, and `SchoolSetting` models.
  - Multi-school user memberships allowing a single user to belong to multiple schools with distinct roles.
  - `seed_dev_data` management command providing demo schools and pre-seeded test accounts.
- **Frontend & Design System**:
  - React 18 + JavaScript Single Page Application built with Vite.
  - Centralized design tokens derived from the EduKadence logo (Electric Blue `#2563EB`, Sky Blue `#0EA5E9`, Deep Navy `#0F172A`).
  - 25+ accessible, responsive UI primitives under `src/components/ui/`.
  - Three distinct application shells:
    - `AppShell`: School Admin / Teacher desktop & tablet management.
    - `ParentShell`: Mobile-first parent portal with daily feed, attendance, and pickup PIN.
    - `KidShell`: Safe visual learning sandbox structured across 6 developmental stages.
  - Axios API client with automatic JWT refresh queue on 401 and tenant context headers.
- **Testing & Security**:
  - Pytest test suite with 21 passing automated tests.
  - Dedicated multi-tenant isolation security tests (`test_tenant_isolation.py`).
- **Infrastructure & Documentation**:
  - Docker Compose setup for PostgreSQL, Django, and React.
  - 13 comprehensive specifications under `docs/` and root `README.md`.
  - Permanent agent operating memory system in `AGENTS.md` and `.agent-memory/`.
