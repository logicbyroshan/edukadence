"""Class, Section, Teacher Assignment, and Enrollment ViewSets."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.classes.models import ClassLevel, Section, ClassTeacherAssignment, Enrollment
from apps.classes.serializers import (
    ClassLevelSerializer,
    SectionSerializer,
    ClassTeacherAssignmentSerializer,
    EnrollmentSerializer
)
from apps.core.permissions import IsSchoolAdmin, HasSchoolAccess, IsTeacher
from apps.core.utils import get_request_school_id

class ClassLevelViewSet(viewsets.ModelViewSet):
    """
    Class Level (Grade) management.
    School Admins can CRUD; Teachers and Parents can view.
    """
    serializer_class = ClassLevelSerializer
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['order_index', 'name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        if user.is_superuser and not school_id:
            return ClassLevel.objects.all().prefetch_related('sections')
        if school_id:
            return ClassLevel.objects.filter(school_id=school_id).prefetch_related('sections')
        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return ClassLevel.objects.filter(school_id__in=user_schools).prefetch_related('sections')

    def perform_create(self, serializer):
        school_id = self.request.data.get('school') or get_request_school_id(self.request)
        serializer.save(school_id=school_id)

class SectionViewSet(viewsets.ModelViewSet):
    """
    Classroom section management.
    """
    serializer_class = SectionSerializer
    filterset_fields = ['class_level', 'is_active']
    search_fields = ['name', 'room_number', 'class_level__name']
    ordering_fields = ['class_level__order_index', 'name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = Section.objects.select_related('class_level', 'school')
        if user.is_superuser and not school_id:
            return qs
        if school_id:
            return qs.filter(school_id=school_id)
        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        class_level = serializer.validated_data.get('class_level')
        school_id = self.request.data.get('school') or (class_level.school_id if class_level else get_request_school_id(self.request))
        serializer.save(school_id=school_id)

    @action(detail=True, methods=['get'])
    def roster(self, request, pk=None):
        """Returns the active student roster for this section."""
        section = self.get_object()
        enrollments = section.enrollments.filter(status='ACTIVE').select_related('child', 'academic_year')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response({
            'success': True,
            'data': {
                'section_id': str(section.id),
                'section_name': section.display_name,
                'total_students': enrollments.count(),
                'roster': serializer.data
            }
        })

class ClassTeacherAssignmentViewSet(viewsets.ModelViewSet):
    """
    Teacher assignments to classroom sections.
    """
    serializer_class = ClassTeacherAssignmentSerializer
    filterset_fields = ['section', 'teacher', 'academic_year', 'is_primary']
    ordering_fields = ['created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = ClassTeacherAssignment.objects.select_related('section__class_level', 'teacher', 'academic_year', 'school')
        if user.is_superuser and not school_id:
            return qs
        if school_id:
            return qs.filter(school_id=school_id)
        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        section = serializer.validated_data.get('section')
        school_id = self.request.data.get('school') or (section.school_id if section else get_request_school_id(self.request))
        serializer.save(school_id=school_id)

class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    Student enrollment management linking children to class/section/academic year.
    """
    serializer_class = EnrollmentSerializer
    filterset_fields = ['academic_year', 'class_level', 'section', 'status', 'child']
    search_fields = ['child__first_name', 'child__last_name', 'child__admission_number', 'roll_number']
    ordering_fields = ['roll_number', 'enrollment_date', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = Enrollment.objects.select_related('child', 'academic_year', 'class_level', 'section', 'school')
        if user.is_superuser and not school_id:
            return qs
        if school_id:
            return qs.filter(school_id=school_id)
        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child')
        school_id = self.request.data.get('school') or (child.school_id if child else get_request_school_id(self.request))
        serializer.save(school_id=school_id)
