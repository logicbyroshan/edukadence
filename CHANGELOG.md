# Changelog — EduKadence

All notable changes to the EduKadence platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
