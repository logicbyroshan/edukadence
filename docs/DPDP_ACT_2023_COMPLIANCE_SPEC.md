# EduKadence DPDP Act, 2023 & DPDP Rules, 2025 Technical Architecture & Compliance Specification

> **Classification**: Statutory Data Governance, Privacy Engineering & Security Architecture  
> **Applicable Laws**: Digital Personal Data Protection Act, 2023 (DPDP Act) & Digital Personal Data Protection Rules, 2025 (DPDP Rules)  
> **System Scope**: Multi-tenant Early Childhood & Primary Education SaaS Platform (Serving Children Ages 2–10, Parents, Educators, Administrators)  
> **Status**: Verified in Code & Production Bundles (59/59 Automated Tests Passing)

---

## 1. Executive Summary & Regulatory Characterization

EduKadence is engineered specifically for early childhood education (pre-schools, kindergartens, primary schools serving children aged 2 to 10 years old).

### 1.1 Data Fiduciary vs. Data Processor Assessment
- **Client Schools as Data Fiduciaries**: Each school institution determines the primary purpose and means of processing student educational data, enrollment files, attendance logs, and fee payments.
- **EduKadence Platform as Data Processor**: Under Section 8 of the DPDP Act, EduKadence acts as a technical **Data Processor** providing multi-tenant isolation, database storage, and secure processing infrastructure under contractual data processing agreements.
- **EduKadence as Data Fiduciary (Direct Contexts)**: For direct platform user accounts, authentication tokens, SaaS subscription billing, platform error monitoring, and global curriculum library usage, EduKadence acts as a Data Fiduciary.

### 1.2 Children's Data Processing (Section 9 DPDP Act)
Under Section 2(f) and Section 9 of the DPDP Act 2023:
- A "child" is defined as an individual who has not completed 18 years of age.
- **All student data in EduKadence represents children's personal data (ages 2–10).**
- **Verifiable Parental Consent**: Recorded via `apps.privacy.models.ConsentRecord` linked to parent user profiles and verified student relationships.
- **Prohibitions Enforced in Code**:
  1. No behavioural tracking, profiling, or commercial surveillance of children.
  2. 100% ad-free environment across all shells (Kid Mode sandbox, Parent Portal, School App).
  3. No detrimental processing of children's data.

---

## 2. Personal Data Inventory & Data Mapping Matrix

| Personal Data Category | Database Model & Fields | Processing Purpose | Legal Basis (DPDP Act) | Storage & Jurisdiction | Retention Limit | Deletion / Erasure Method |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Child Identity & Profile** | `Child` (first_name, last_name, date_of_birth, gender, admission_number) | Classroom enrollment, developmental progress tracking, early education delivery | Specified Purpose (Sec 4 & 7) + Parental Consent (Sec 9) | PostgreSQL (India Data Center) | Duration of enrollment + 5 years | Irreversible Anonymization (`execute_child_erasure`) |
| **Emergency Health & Medical** | `Child` (blood_group, medical_notes, emergency_contact_name, emergency_contact_phone) | Child physical safety on campus, allergy alerts, emergency medical care | Vital Interests & Explicit Parental Authorization | PostgreSQL (India Data Center) | Duration of active enrollment | Hard Delete on Withdrawal / Anonymization |
| **Parent & Guardian Contact** | `Parent` (first_name, last_name, phone, email, address, occupation) | School bulletins, fee dues notification, emergency coordination | Contractual Service & Consent (Sec 6) | PostgreSQL (India Data Center) | Duration of enrollment | Hard Delete on Account Closure |
| **Authorized Pickups & Dismissal PINs** | `AuthorizedPickupPerson`, `PickupRecord` (name, relationship, phone, pickup_pin, photo_url) | Preventing child unauthorized dismissal, safe handoff audit trail | Campus Safety Protocol & Explicit Consent | PostgreSQL (India Data Center) | 365 Days (1 Academic Year) | Automated Purge / Deletion |
| **Daily Attendance Logs** | `DailyAttendance` (date, status, check_in_time, check_out_time, remarks) | Educational attendance record, truancy prevention | Legitimate Educational Use | PostgreSQL (India Data Center) | 3 Academic Years | Scheduled Purge |
| **Fee Invoicing & Payment Receipts** | `StudentFeeItem`, `FeePayment` (receipt_number, amount, payment_method, ref_no) | Fee billing, payment tracking, official tax receipts | Statutory Accounting & Tax Compliance | PostgreSQL (India Data Center) | 7 Years (Statutory Tax Requirement) | Encrypted Archival / Purge |
| **Classroom Photo Moments** | `ClassActivity` (media_urls, title, description, activity_date) | Sharing classroom learning moments with enrolled parents | Explicit Parental Consent (Sec 6 & 9) | Object Storage (India Region, Signed URLs) | Active Year + 1 Year Archive | Hard Delete from Storage Bucket |
| **Learning & Milestone Attempts** | `ActivityAttempt`, `LearningProgress`, `ChildBadge` (score, stars, mastery) | Pedagogical milestone tracking across 6 developmental stages | Core Educational Delivery | PostgreSQL (India Data Center) | Active Academic Journey | Anonymization / Archive |

---

## 3. Data Principal Rights Implementation (Sections 11–14)

### 3.1 Right to Access Information (Section 11)
- **Instant JSON Export**: Endpoint `GET /api/v1/privacy/export-my-data/` compiles an itemized, structured data package containing user profile, parent profiles, child profiles, attendance history, fee receipts, learning milestones, and consent history.
- **Zero-Friction Access**: Accessible from Privacy Center Modal and standalone `/privacy` page.

### 3.2 Right to Correction, Completion & Updating (Section 12)
- Formally managed via `DataPrincipalRequest` model (`request_type='CORRECTION'`, `'COMPLETION'`, `'UPDATING'`).
- Requests generate unique tracking identifiers (e.g. `DPR-20260926-XXXX`).
- School Administrators review, verify identity, update records, and provide resolution remarks within the 90-day statutory SLA.

### 3.3 Right to Erasure (Section 12)
- Supported via `PrivacyErasureService.execute_child_erasure(...)`.
- Redacts names, photos, medical notes, emergency phones, and de-links authorized pickup records while preserving non-identifying operational audit integrity.

### 3.4 Right to Nominate (Section 14)
- Managed via `DataPrincipalNomination` model and `POST /api/v1/privacy/nominations/`.
- Parents/Users designate a trusted nominee (relationship, contact details, special conditions) to exercise rights in the event of death or incapacity.

### 3.5 Grievance Redressal Mechanism (Section 13)
- Fully accessible via `PrivacyGrievance` model and `POST /api/v1/privacy/grievances/`.
- Every ticket generates a formal reference (e.g. `PGR-20260926-XXXX`) with statutory resolution deadline (max 90 days as prescribed by DPDP Rules 2025).
- Grievance Redressal Officer investigation and resolution reporting.

---

## 4. Personal Data Breach Incident Response (Section 8(6))

- **Incident Register**: Managed via `DataBreachIncident` model (`apps.privacy.models.DataBreachIncident`).
- **Classification Levels**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- **Statutory Reporting**: Tracking of Data Protection Board of India (DPBI) notification status and Data Principal notification status.
- **Containment & Review**: Dedicated fields for containment measures, root cause analysis, and post-incident reviews.

---

## 5. Automated Data Retention & Deletion Schedule

- **Matrix Management**: `DataRetentionPolicy` model.
- **Scheduled Purging**: Management command `python manage.py run_retention_cleanup` automatically purges expired session metadata, old withdrawn consent logs (> 3 years), and obsolete dismissal records.
- **Audit Logging**: `PrivacyAuditLog` maintains a tamper-evident record of all privacy mutations, consent grants, revocations, and data exports.

---

## 6. Technical Security & Isolation Verification

1. **Strict Multi-Tenant Isolation**: Tenant foreign keys and `X-School-ID` resolution prevent cross-school data leakage across all privacy endpoints.
2. **Kid Mode Sandboxing**: Child roles (`ROLE='CHILD'`) are strictly restricted from accessing administrative privacy management or altering parental consent records.
3. **HTTP Security Headers**: Enforced via `django.middleware.security.SecurityMiddleware` with `X-Frame-Options: DENY`, `SECURE_CONTENT_TYPE_NOSNIFF`, and `Referrer-Policy: strict-origin-when-cross-origin`.
