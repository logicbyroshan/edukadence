"""Views and ViewSets for Daily Activities and Classroom Moments."""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from apps.activities.models import ClassActivity
from apps.activities.serializers import ClassActivitySerializer
from apps.core.permissions import HasSchoolAccess, IsTeacher
from apps.core.utils import get_request_school_id

class ClassActivityViewSet(viewsets.ModelViewSet):
    """
    Daily Classroom Activity Moments.
    - Teachers and Admins can create and publish moments.
    - Parents can view moments relevant to their children.
    """
    serializer_class = ClassActivitySerializer
    filterset_fields = ['activity_date', 'category', 'class_level', 'section', 'is_published']
    search_fields = ['title', 'description']
    ordering_fields = ['-activity_date', '-created_at']

    def get_permissions(self):
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = ClassActivity.objects.select_related('class_level', 'section', 'child', 'created_by', 'school')

        if user.is_superuser and not school_id:
            return qs

        if school_id:
            is_parent_only = user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'], is_active=True).exists()
            if is_parent_only:
                # Get child IDs and section IDs of parent's children
                parent_children = user.parent_profiles.filter(school_id=school_id).first()
                if parent_children:
                    children = parent_children.child_relationships.values_list('child_id', flat=True)
                    from apps.classes.models import Enrollment
                    section_ids = Enrollment.objects.filter(child_id__in=children, status='ACTIVE').values_list('section_id', flat=True)
                    class_level_ids = Enrollment.objects.filter(child_id__in=children, status='ACTIVE').values_list('class_level_id', flat=True)

                    return qs.filter(
                        school_id=school_id,
                        is_published=True
                    ).filter(
                        Q(child_id__in=children) |
                        Q(section_id__in=section_ids) |
                        Q(class_level_id__in=class_level_ids) |
                        Q(section__isnull=True, class_level__isnull=True, child__isnull=True)
                    ).distinct()
                return qs.none()

            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        section = serializer.validated_data.get('section')
        class_level = serializer.validated_data.get('class_level')
        school_id = self.request.data.get('school') or (section.school_id if section else (class_level.school_id if class_level else get_request_school_id(self.request)))
        serializer.save(school_id=school_id, created_by=self.request.user)
