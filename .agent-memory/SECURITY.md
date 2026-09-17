# Project Memory: Security Model & Minor Data Protection

## 1. Security Architecture & Threat Model

EduKadence serves educational institutions caring for young children (ages 2–10). Security, privacy, and minor data protection are paramount.

---

## 2. Core Security Pillars

### 2.1 Multi-Tenant Isolation
- **Mechanism**: Every query executed by an authenticated user is scoped by `school_id`.
- **Enforcement**: DRF viewsets override `get_queryset()` to ensure records outside the user's active tenant membership are completely invisible (returning `404 Not Found`).
- **Automated Verification**: The test suite includes dedicated tenant isolation tests (`tests/test_tenant_isolation.py`) ensuring cross-tenant data leakage is impossible.

### 2.2 Child Safety & Minor Data Privacy (COPPA / GDPR-K)
- **Zero Third-Party Trackers**: No advertising pixels, third-party analytics trackers, or commercial SDKs.
- **PIN / Guardian Protection**: Kid Mode is an isolated sandbox. Exiting Kid Mode to access administrative or parent settings requires adult confirmation/PIN.
- **Strict Media Permissions**: Activity photos and child records are accessible only to authorized parents and designated classroom educators.

### 2.3 Authentication & Session Security
- **JWT Storage**: Short-lived access tokens (30 min) with refresh token rotation.
- **Password Security**: Django's PBKDF2 / Argon2 hashing with unique cryptographic salts.
- **Stateless Tokens**: Tokens are verified cryptographically via `SIMPLE_JWT['SIGNING_KEY']`.

### 2.4 OWASP Top 10 Protections
- **SQL Injection**: Prevented through Django ORM parameterized queries (zero raw SQL allowed).
- **Cross-Site Scripting (XSS)**: React automatic output encoding; strict CSP headers in production.
- **Cross-Site Request Forgery (CSRF)**: Token-based stateless API architecture with CORS origin validation.
- **Broken Object Level Authorization (BOLA/IDOR)**: Enforced via tenant-scoped object lookups using UUIDs.

---

## 3. Security Rules for AI Agents
1. **Never Commit Secrets**: Secrets must only exist in `.env` (which is git-ignored).
2. **Never Disable Tenant Filtering**: Always ensure new viewsets filter querysets by the active school.
3. **Never Output Plaintext Passwords**: Passwords must never appear in logs or API serialization.
