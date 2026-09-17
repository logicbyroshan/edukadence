"""School management viewsets enforcing tenant isolation."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.schools.models import School, SchoolMembership, AcademicYear, SchoolSetting
from apps.schools.serializers import (
    SchoolSerializer,
    SchoolMembershipSerializer,
    AcademicYearSerializer,
    SchoolSettingSerializer
)
from apps.core.permissions import IsSuperAdmin, IsSchoolAdmin, HasSchoolAccess

class SchoolViewSet(viewsets.ModelViewSet):
    """
    School Management ViewSet.
    Super Admins can create and manage all schools.
    School Admins can update their own school.
    Regular users can view schools they are members of.
    """
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'slug', 'code', 'email']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return School.objects.all()
        # Filter to schools where the user has active membership
        return School.objects.filter(memberships__user=user, memberships__is_active=True).distinct()

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsSuperAdmin()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess()]

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        school = self.get_object()
        memberships = school.memberships.filter(is_active=True)
        return Response({
            'success': True,
            'data': {
                'total_members': memberships.count(),
                'admins_count': memberships.filter(role='SCHOOL_ADMIN').count(),
                'teachers_count': memberships.filter(role='TEACHER').count(),
                'parents_count': memberships.filter(role='PARENT').count(),
                'children_count': memberships.filter(role='CHILD').count(),
                'current_academic_year': school.academic_years.filter(is_current=True).values('id', 'name').first()
            }
        })

class SchoolMembershipViewSet(viewsets.ModelViewSet):
    """
    Membership management for an individual school.
    Enforces strict tenant scoping based on active school.
    """
    serializer_class = SchoolMembershipSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]
    filterset_fields = ['role', 'is_active', 'is_default']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'user__username']
    ordering_fields = ['created_at', 'role']

    def get_queryset(self):
        user = self.request.user
        active_school_id = getattr(self.request, 'active_school_id', None) or self.kwargs.get('school_pk')

        if user.is_superuser:
            if active_school_id:
                return SchoolMembership.objects.filter(school_id=active_school_id).select_related('user', 'school')
            return SchoolMembership.objects.all().select_related('user', 'school')

        if active_school_id:
            # Ensure requesting user is admin of this school
            is_admin = user.memberships.filter(school_id=active_school_id, role__in=['SCHOOL_ADMIN', 'SUPER_ADMIN'], is_active=True).exists()
            if is_admin:
                return SchoolMembership.objects.filter(school_id=active_school_id).select_related('user', 'school')

        # Fallback to schools where user is admin
        admin_school_ids = user.memberships.filter(role__in=['SCHOOL_ADMIN', 'SUPER_ADMIN'], is_active=True).values_list('school_id', flat=True)
        return SchoolMembership.objects.filter(school_id__in=admin_school_ids).select_related('user', 'school')

class AcademicYearViewSet(viewsets.ModelViewSet):
    """
    Academic Year management per school.
    """
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]
    ordering_fields = ['start_date', 'name']

    def get_queryset(self):
        user = self.request.user
        active_school_id = getattr(self.request, 'active_school_id', None) or self.kwargs.get('school_pk')

        if user.is_superuser:
            if active_school_id:
                return AcademicYear.objects.filter(school_id=active_school_id)
            return AcademicYear.objects.all()

        if active_school_id:
            # Check user membership
            if user.memberships.filter(school_id=active_school_id, is_active=True).exists():
                return AcademicYear.objects.filter(school_id=active_school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return AcademicYear.objects.filter(school_id__in=user_schools)

class SchoolSettingViewSet(viewsets.ModelViewSet):
    """
    Custom school key-value settings management.
    """
    serializer_class = SchoolSettingSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get_queryset(self):
        user = self.request.user
        active_school_id = getattr(self.request, 'active_school_id', None)

        if user.is_superuser:
            if active_school_id:
                return SchoolSetting.objects.filter(school_id=active_school_id)
            return SchoolSetting.objects.all()

        if active_school_id:
            return SchoolSetting.objects.filter(school_id=active_school_id)

        user_admin_schools = user.memberships.filter(role__in=['SCHOOL_ADMIN', 'SUPER_ADMIN'], is_active=True).values_list('school_id', flat=True)
        return SchoolSetting.objects.filter(school_id__in=user_admin_schools)
