# EduKadence — REST API Conventions & Specification

## 1. Global API Standards

- **Base URL Prefix**: `/api/v1/`
- **Protocol**: HTTPS only
- **Data Format**: JSON (`Content-Type: application/json; charset=utf-8`)
- **Authentication**: Bearer JWT (`Authorization: Bearer <access_token>`)
- **Tenant Context Header**: `X-School-ID: <uuid>` (Optional; switches the active school context if the user belongs to multiple schools)

---

## 2. Standard Response Format

All API responses conform to a predictable envelope.

### Success Response Envelope (Single Resource)
```json
{
  "success": true,
  "data": {
    "id": "7b0688fc-8f77-4b13-8d6f-23df2f2e5192",
    "name": "Little Sprouts Montessori",
    "slug": "little-sprouts-montessori",
    "code": "LSM-01",
    "created_at": "2026-09-17T04:30:00Z"
  },
  "message": "School retrieved successfully"
}
```

### Success Response Envelope (Paginated List)
```json
{
  "success": true,
  "count": 42,
  "total_pages": 3,
  "current_page": 1,
  "page_size": 20,
  "next": "http://api.edukadence.com/api/v1/schools/?page=2",
  "previous": null,
  "results": [
    {
      "id": "7b0688fc-8f77-4b13-8d6f-23df2f2e5192",
      "name": "Little Sprouts Montessori"
    }
  ]
}
```

### Standard Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted payload contains invalid data.",
    "details": {
      "email": ["A user with this email address already exists."]
    }
  }
}
```

---

## 3. Standard HTTP Status Codes

| Code | Meaning | Usage Scenario |
| :--- | :--- | :--- |
| `200 OK` | Success | Standard response for successful GET, PUT, PATCH |
| `201 Created` | Resource Created | Response for successful POST creation |
| `204 No Content`| Successfully Deleted | Response for successful DELETE |
| `400 Bad Request`| Validation Error | Malformed request body or serializer validation failure |
| `401 Unauthorized`| Authentication Required| Missing, expired, or malformed JWT token |
| `403 Forbidden` | Access Denied | Authenticated user lacks required role/permission |
| `404 Not Found` | Resource Not Found | Resource ID does not exist within the tenant scope |
| `409 Conflict` | State Conflict | Unique constraint collision |
| `500 Server Error`| Internal Failure | Uncaught backend runtime exception |

---

## 4. Phase 1 Core Endpoints

### 4.1 System & Health
- `GET /api/v1/health/` — System health check (returns status, DB connectivity, timestamp).

### 4.2 Authentication & User Profile (`/api/v1/auth/`)
- `POST /api/v1/auth/login/` — Authenticate via email/password. Returns `{ access, refresh, user }`.
- `POST /api/v1/auth/refresh/` — Exchange refresh token for a new access token.
- `POST /api/v1/auth/logout/` — Blacklist refresh token & terminate session.
- `GET /api/v1/auth/me/` — Retrieve authenticated user profile, active school memberships, and roles.
- `POST /api/v1/auth/change-password/` — Change user password securely.

### 4.3 Schools & Tenancy (`/api/v1/schools/`)
- `GET /api/v1/schools/` — List schools accessible to the current user.
- `POST /api/v1/schools/` — Register a new school (Super Admin or initial school onboarding).
- `GET /api/v1/schools/{id}/` — Retrieve school details.
- `PATCH /api/v1/schools/{id}/` — Update school details (School Admin).
- `GET /api/v1/schools/{id}/memberships/` — List all members (admins, teachers, parents, children).
- `POST /api/v1/schools/{id}/memberships/` — Assign a user to a school with a specified role.
- `GET /api/v1/schools/{id}/academic-years/` — List academic years for the school.
- `POST /api/v1/schools/{id}/academic-years/` — Create a new academic year.

### 4.4 User Management (`/api/v1/users/`)
- `GET /api/v1/users/` — List users within the tenant scope.
- `POST /api/v1/users/` — Create a user within the active school.
- `GET /api/v1/users/{id}/` — Get user profile.
- `PATCH /api/v1/users/{id}/` — Update user profile.
