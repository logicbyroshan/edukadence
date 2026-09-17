# EduKadence — Role-Based Access Control (RBAC) & Permissions

## 1. Security Philosophy

> **Frontend hiding is User Experience (UX); Backend authorization is Security.**

EduKadence enforces all permissions at the Django/DRF API level. Hiding or disabling buttons in React is strictly a cosmetic convenience. If an unauthorized user crafts a raw HTTP request, the backend immediately rejects it with a `403 Forbidden` or `404 Not Found` response.

---

## 2. Role Hierarchy

EduKadence defines 5 foundational roles:

```
                  ┌─────────────────┐
                  │   SUPER_ADMIN   │ (Global SaaS Operator / Owner)
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │  SCHOOL_ADMIN   │ (Principal / Director / Office Mgr)
                  └────────┬────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────▼────────┐┌───────▼────────┐┌───────▼────────┐
│     TEACHER     ││     PARENT     ││     CHILD      │
│ (Educator/Staff)││(Guardian/Family││(Kid Mode Only) │
└─────────────────┘└────────────────┘└────────────────┘
```

### Role Capabilities & Boundaries

| Role | Scope | Permitted Actions | Restricted Actions |
| :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Global | Create/suspend schools, manage global configurations, inspect system metrics. | None. |
| **`SCHOOL_ADMIN`** | School-wide | Manage school profile, manage teachers/classes/students, assign roles, view finances. | Cannot access other schools' data. |
| **`TEACHER`** | Assigned Classes | View roster, mark daily attendance, post activity photos/notes, grade tasks. | Cannot alter school settings, fee structures, or staff payroll. |
| **`PARENT`** | Linked Children | View child's status, attendance, photos, pickup codes, pay school fees. | Cannot view other children's private records or administrative settings. |
| **`CHILD`** | Kid Mode | Play learning games, complete interactive homework, earn reward badges. | Strict sandbox. No administrative access, zero private communications. |

---

## 3. Backend Permission Classes

Located in `backend/apps/core/permissions.py`:

```python
class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class IsSchoolAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        school_id = request.headers.get('X-School-ID') or getattr(request, 'active_school_id', None)
        return request.user.memberships.filter(
            school_id=school_id, 
            role__in=['SCHOOL_ADMIN', 'SUPER_ADMIN'],
            is_active=True
        ).exists()

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        ...

class IsParent(BasePermission):
    def has_permission(self, request, view):
        ...

class IsChild(BasePermission):
    def has_permission(self, request, view):
        ...
```

---

## 4. Multi-Tenant Role Isolation Guarantee

When a user belongs to multiple schools, their permissions are evaluated **strictly within the context of the active school**. For example, a user who is a `SCHOOL_ADMIN` at School A and a `PARENT` at School B cannot perform administrative actions when interacting with School B.
