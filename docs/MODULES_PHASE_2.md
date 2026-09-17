# EduKadence Phase 2: School Management & Parent Experience Specification

## 1. Overview & Core Philosophy
EduKadence is designed specifically for small early-childhood and primary schools (serving children aged 2 to 10 years old, up to ~200 students).

The core triad is:
- **SCHOOL (Manage)**: Clean, low-overhead operational web application for principals, directors, and teachers.
- **PARENT (Connect)**: Mobile-first web portal for parents and guardians to track attendance, photo feeds, teacher notes, dues & receipts, and secure pickup PINs.
- **CHILD (Play + Learn + Grow)**: Phase 3 domain (Kid Mode learning sandbox).

---

## 2. Phase 2 Domain Modules

### 1. Children Directory (`apps.students.Child`)
- Central student profiles supporting full name, date of birth, gender, admission identifier, admission date, photo URL, blood group, medical notes, emergency contacts, and active enrollment status.
- Lifecycle states: `ACTIVE`, `INACTIVE`, `GRADUATED`, `TRANSFERRED`.
- Preserves historical records without destructive deletions.

### 2. Parents & Multi-Child Sibling Management (`apps.students.Parent` & `ChildParentRelationship`)
- First-class parent and guardian entities linked to authenticated user logins.
- Multi-child relationships allow a single parent account to manage multiple enrolled siblings (e.g. Aarav in Nursery and Riya in Class 1) without duplicate accounts.
- Relationship metadata: `relationship_type` (Mother, Father, Guardian), `is_primary_contact`, `is_emergency_contact`, `can_pickup`, `communication_authorized`.

### 3. Teachers & Classroom Assignments (`apps.classes.ClassTeacherAssignment`)
- Assigns educators to specific classroom sections for an academic year.
- Distinguishes Lead Class Teachers from assistant educators.

### 4. Classes & Sections (`apps.classes.ClassLevel` & `Section`)
- Configurable grade hierarchy: Playgroup, Nursery, LKG, UKG, Class 1-5.
- Class sections (e.g. Nursery A, Nursery B, Sunshine) with room numbers and student capacity limits.

### 5. Historical Enrollments (`apps.classes.Enrollment`)
- Tracks child progression across academic years without overwriting previous historical records.
- Links child, academic year, class level, section, roll number, and status (`ACTIVE`, `PROMOTED`, `TRANSFERRED`, `WITHDRAWN`).

### 6. Daily Attendance (`apps.attendance.DailyAttendance`)
- Fast 1-tap mass attendance marker for classroom cohorts.
- Status choices: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
- Database uniqueness constraint on `[school, child, date]` to strictly prevent duplicate attendance logs.
- Real-time aggregate statistics (present count, absent count, late count, attendance percentage).

### 7. Fees & Official Invoicing (`apps.fees.FeeStructure`, `StudentFeeItem`, `FeePayment`)
- Configurable fee templates: Admission, Tuition, Activity kits, Annual charges with customizable billing frequencies (monthly, quarterly, yearly).
- Bulk assignment engine generating fee due items for entire classroom sections or grades.
- Payment recording with auto-generated unique receipts (`REC-YYYYMM-XXXX-RR`).
- Balance due tracking: `max(0, amount - discount_amount - amount_paid)`.

### 8. Safe Pickup & Dismissal Handoff (`apps.students.AuthorizedPickupPerson` & `PickupRecord`)
- Authorized third-party collector registry (Grandparents, Drivers, Babysitters) with relationship, phone, photo, and 4-6 digit dismissal PIN.
- Real-time dismissal queue tracking status: `WAITING` -> `READY_FOR_PICKUP` -> `PICKED_UP`.
- Secure verification audit capturing date, time, collector name, staff recorder, and PIN validation flag.

### 9. Classroom Moments & Daily Activities (`apps.activities.ClassActivity`)
- Photo and story stream for early childhood learning experiences.
- Categories: Art & Craft, Literacy & Math, Music & Rhymes, Outdoor Play, Storytelling, Meal Time.
- Strict tenant and audience isolation ensuring parents only access photos belonging to their children's cohorts.

### 10. School Announcements & Bulletins (`apps.communication.Announcement`)
- Structured school notices with priority levels (`NORMAL`, `HIGH`, `URGENT`) and pin-to-top support.
- Audience scoping: `ALL_SCHOOL`, `CLASS_LEVEL`, `SECTION`, `INDIVIDUAL_CHILD`.

### 11. Reports & Data Export (`apps.reports`)
- Classroom capacity and gender distribution metrics.
- Attendance breakdown by section and date ranges.
- Fee collection breakdown by payment methods (UPI, Cash, Bank Transfer, Cheque).
- 1-click clean CSV downloads for Children, Attendance logs, and Fee transactions.

---

## 3. API Endpoints Summary

| Endpoint | Method | Role Permissions | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/students/children/` | GET, POST | School Admin / Teacher / Parent (scoped) | List & create children |
| `/api/v1/students/children/{id}/overview/` | GET | Authenticated User | 360-degree profile data |
| `/api/v1/students/parents/` | GET, POST | School Admin / Parent | Parent directory & accounts |
| `/api/v1/students/authorized-pickups/` | GET, POST | School Admin / Teacher / Parent | Trusted collector registry |
| `/api/v1/students/pickup-records/record_dismissal/` | POST | Staff / Teacher | Safe child handoff & dismissal |
| `/api/v1/classes/levels/` | GET, POST | School Admin (CRUD) / Staff / Parent (Read) | Grade levels |
| `/api/v1/classes/sections/{id}/roster/` | GET | Authenticated User | Section student roster |
| `/api/v1/attendance/bulk_mark/` | POST | Teacher / School Admin | Fast 1-tap mass attendance |
| `/api/v1/attendance/summary/` | GET | Authenticated User | Daily/monthly attendance stats |
| `/api/v1/fees/structures/` | GET, POST | School Admin | Fee templates |
| `/api/v1/fees/items/assign_bulk/` | POST | School Admin | Mass fee assignment |
| `/api/v1/fees/payments/` | GET, POST | School Admin / Parent (Read) | Payments & receipts |
| `/api/v1/fees/payments/stats/` | GET | School Admin | Collections & outstanding overview |
| `/api/v1/activities/` | GET, POST | Teacher / School Admin / Parent (Read) | Classroom photo moments |
| `/api/v1/communication/announcements/` | GET, POST | Teacher / School Admin / Parent (Read) | Announcements & notices |
| `/api/v1/reports/class-strength/` | GET | School Admin / Staff | Capacity & gender strength |
| `/api/v1/reports/export/{type}/` | GET | School Admin | CSV export (children, attendance, fees) |
