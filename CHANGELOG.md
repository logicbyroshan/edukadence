# Changelog — EduKadence

All notable changes to the EduKadence platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
