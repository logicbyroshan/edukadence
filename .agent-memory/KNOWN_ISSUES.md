# Project Memory: Known Issues & Technical Debt

This document tracks all known bugs, technical limitations, edge cases, and architectural watchpoints.

---

## 1. Active Watchpoints & Technical Notes

| ID | Category | Description | Status | Workaround / Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **ISS-001** | Platform (Windows) | Windows console (`cp1252`) fails with `UnicodeEncodeError` when CLI management commands output raw unicode checkmarks (`\u2713`). | **Mitigated** | Always use standard ASCII indicators (e.g. `[+]` or `SUCCESS:`) in `self.stdout.write()`. |
| **ISS-002** | Testing (DRF) | `APIClient.post()` defaults to multipart form-data. Nested dictionaries in test payloads fail without `format='json'`. | **Mitigated** | Always include `format='json'` when testing endpoints that accept nested dictionaries (e.g., `SchoolSetting.value`). |
| **ISS-003** | Frontend Routing | Sub-routes under `/parent/*` (`/parent/activities`, `/parent/pickup`, `/parent/messages`, `/parent/profile`) currently render `ParentPortalPage` preview component. | **Open (Planned Phase 2)** | Dedicated child views and modals will be implemented in Phase 2. |
| **ISS-004** | Media Storage | Django currently serves local media in dev via `urlpatterns += static(settings.MEDIA_URL)`. | **Open (Planned Phase 2/5)** | Transition to S3-compatible cloud storage (Cloudflare R2 / AWS S3) with pre-signed URLs when daily activity photo uploads are introduced. |

---

## 2. Resolved Issues History

- **2026-09-17**: Resolved unicode encoding failure in `seed_dev_data` by replacing `\u2713` with `[+]`.
- **2026-09-17**: Resolved nested JSON renderer assertion in `test_permissions.py` by adding `format='json'`.
