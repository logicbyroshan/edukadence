"""Views and ViewSets for Announcements and Notices."""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from apps.communication.models import Announcement
from apps.communication.serializers import AnnouncementSerializer
from apps.core.permissions import HasSchoolAccess, IsTeacher
from apps.core.utils import get_request_school_id

class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    Announcements and school notices.
    - Admins & Teachers can post announcements.
    - Parents receive relevant announcements.
    """
    serializer_class = AnnouncementSerializer
    filterset_fields = ['audience_type', 'priority', 'is_pinned', 'class_level', 'section']
    search_fields = ['title', 'message']
    ordering_fields = ['-is_pinned', '-publish_date', '-created_at']

    def get_permissions(self):
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
        qs = Announcement.objects.select_related('class_level', 'section', 'child', 'created_by', 'school')

        if user.is_superuser and not school_id:
            return qs

        if school_id:
            is_parent_only = user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'], is_active=True).exists()
            if is_parent_only:
                parent_profile = user.parent_profiles.filter(school_id=school_id).first()
                children = []
                section_ids = []
                class_level_ids = []
                if parent_profile:
                    children = list(parent_profile.child_relationships.values_list('child_id', flat=True))
                    from apps.classes.models import Enrollment
                    section_ids = list(Enrollment.objects.filter(child_id__in=children, status='ACTIVE').values_list('section_id', flat=True))
                    class_level_ids = list(Enrollment.objects.filter(child_id__in=children, status='ACTIVE').values_list('class_level_id', flat=True))

                return qs.filter(
                    school_id=school_id,
                    publish_date__lte=today
                ).filter(
                    Q(expiry_date__isnull=True) | Q(expiry_date__gte=today)
                ).filter(
                    Q(audience_type='ALL_SCHOOL') |
                    Q(audience_type='SECTION', section_id__in=section_ids) |
                    Q(audience_type='CLASS_LEVEL', class_level_id__in=class_level_ids) |
                    Q(audience_type='INDIVIDUAL_CHILD', child_id__in=children)
                ).distinct()

            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        section = serializer.validated_data.get('section')
        class_level = serializer.validated_data.get('class_level')
        school_id = self.request.data.get('school') or (section.school_id if section else (class_level.school_id if class_level else get_request_school_id(self.request)))
        serializer.save(school_id=school_id, created_by=self.request.user)
