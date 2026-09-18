"""Role-Based Access Control (RBAC) permissions for EduKadence."""
from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    """Allows access only to Super Admins / Global SaaS operators."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff))

class HasSchoolAccess(BasePermission):
    """Allows access to users who have an active membership in the requested school."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        school_id = getattr(request, 'active_school_id', None) or request.headers.get('X-School-ID')
        if not school_id:
            # Check if user has any active membership
            return request.user.memberships.filter(is_active=True).exists()
        return request.user.memberships.filter(school_id=school_id, is_active=True).exists()

class IsSchoolAdmin(BasePermission):
    """Allows access to School Admins or Super Admins for the active school."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        school_id = getattr(request, 'active_school_id', None) or request.headers.get('X-School-ID')
        if not school_id:
            return request.user.memberships.filter(
                role__in=['SCHOOL_ADMIN', 'SUPER_ADMIN'],
                is_active=True
            ).exists()
        return request.user.memberships.filter(
            school_id=school_id,
            role__in=['SCHOOL_ADMIN', 'SUPER_ADMIN'],
            is_active=True
        ).exists()

class IsTeacher(BasePermission):
    """Allows access to Teachers and above for the active school."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        school_id = getattr(request, 'active_school_id', None) or request.headers.get('X-School-ID')
        if not school_id:
            return request.user.memberships.filter(
                role__in=['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'],
                is_active=True
            ).exists()
        return request.user.memberships.filter(
            school_id=school_id,
            role__in=['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'],
            is_active=True
        ).exists()

class IsParent(BasePermission):
    """Allows access to Parents for the active school."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        school_id = getattr(request, 'active_school_id', None) or request.headers.get('X-School-ID')
        if not school_id:
            return request.user.memberships.filter(role='PARENT', is_active=True).exists()
        return request.user.memberships.filter(
            school_id=school_id,
            role='PARENT',
            is_active=True
        ).exists()

class IsChild(BasePermission):
    """Allows access to Child accounts in Kid Mode."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        school_id = getattr(request, 'active_school_id', None) or request.headers.get('X-School-ID')
        if not school_id:
            return request.user.memberships.filter(role='CHILD', is_active=True).exists()
        return request.user.memberships.filter(
            school_id=school_id,
            role='CHILD',
            is_active=True
        ).exists()

class IsNotChild(BasePermission):
    """Ensures child accounts in Kid Mode cannot access adult/admin/financial endpoints."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        school_id = getattr(request, 'active_school_id', None) or request.headers.get('X-School-ID')
        memberships = request.user.memberships.filter(
            school_id=school_id, is_active=True
        ) if school_id else request.user.memberships.filter(is_active=True)
        
        roles = list(memberships.values_list('role', flat=True))
        if roles and all(r == 'CHILD' for r in roles):
            return False
        return True

