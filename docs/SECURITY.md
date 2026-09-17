# EduKadence — Security Architecture & Data Protection

## 1. Threat Model & Safeguards

As a SaaS serving early education institutions, EduKadence implements defense-in-depth protection across all layers.

---

## 2. Security Pillars

### 2.1 Multi-Tenant Data Isolation
- **Mechanism**: Every query executed by a school member is strictly scoped by `school_id`.
- **Enforcement**: DRF viewsets override `get_queryset()` to ensure records outside the user's active tenant membership are completely invisible (returning `404 Not Found`).
- **Automated Verification**: The test suite includes dedicated tenant isolation tests (`tests/test_tenant_isolation.py`) ensuring cross-tenant data leakage is impossible.

### 2.2 Child Safety & Minor Data Privacy (COPPA / GDPR-K)
- **Zero Third-Party Tracking**: No marketing pixels, Google Analytics trackers, or advertising SDKs.
- **PIN / Guardian Protection**: Kid Mode is an isolated sandbox. Exit to administrative settings requires password/PIN verification.
- **Strict Media Permissions**: Activity photos and child records are accessible only to authorized parents and designated classroom educators.

### 2.3 Authentication & Session Security
- **JWT Storage**: Short-lived access tokens (15–30 min) with refresh token rotation.
- **Password Security**: Django's PBKDF2 / Argon2 hashing with unique cryptographic salts.
- **Brute Force Protection**: Ready for rate limiting on `/api/v1/auth/login/` endpoints.

### 2.4 OWASP Top 10 Protections
- **SQL Injection**: Prevented through Django ORM parameterized queries (zero raw SQL).
- **Cross-Site Scripting (XSS)**: React automatic output encoding; strict CSP headers.
- **Cross-Site Request Forgery (CSRF)**: Token-based stateless API architecture with CORS origin validation.
- **Broken Object Level Authorization (BOLA/IDOR)**: Enforced via tenant-scoped object lookups using UUIDs.
