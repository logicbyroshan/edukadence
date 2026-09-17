from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Count
from django.utils import timezone

from .models import (
    LearningLevel,
    LearningArea,
    LearningTopic,
    Activity,
    ActivityAttempt,
    LearningProgress,
    LearningSession,
    RewardBadge,
    ChildBadge,
    InteractiveStory,
    StoryScene,
    CuratedVideo,
    ActivityAssignment,
    ContentStatus,
    ActivityType,
)
from .serializers import (
    LearningLevelSerializer,
    LearningAreaSerializer,
    LearningTopicSerializer,
    ActivityListSerializer,
    ActivityDetailSerializer,
    ActivityAttemptSerializer,
    SubmitAttemptSerializer,
    LearningProgressSerializer,
    RewardBadgeSerializer,
    ChildBadgeSerializer,
    InteractiveStorySerializer,
    CuratedVideoSerializer,
    ActivityAssignmentSerializer,
)
from apps.students.models import Child, ChildParentRelationship
from apps.core.utils import get_request_school_id


class LearningLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LearningLevel.objects.filter(is_active=True).order_index if hasattr(LearningLevel.objects, 'order_index') else LearningLevel.objects.filter(is_active=True).order_by('order_index')
    serializer_class = LearningLevelSerializer
    permission_classes = [permissions.AllowAny]


class LearningAreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LearningArea.objects.filter(is_active=True).prefetch_related('topics').order_by('order_index')
    serializer_class = LearningAreaSerializer
    permission_classes = [permissions.AllowAny]


class LearningTopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LearningTopic.objects.filter(is_active=True).select_related('learning_area', 'learning_level').order_by('order_index')
    serializer_class = LearningTopicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        level = self.request.query_params.get('level')
        area = self.request.query_params.get('area')
        if level:
            qs = qs.filter(Q(learning_level_id=level) | Q(learning_level__code=level))
        if area:
            qs = qs.filter(Q(learning_area_id=area) | Q(learning_area__code=area))
        return qs


class ActivityViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ActivityDetailSerializer
        return ActivityListSerializer

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)

        # Base filter: Global published activities OR school-specific activities
        q_filter = Q(is_global=True)
        if school_id:
            q_filter |= Q(school_id=school_id)

        # Public child mode/parent users should only see PUBLISHED status
        if not (user.is_superuser or (hasattr(user, 'role') and user.role in ['SUPER_ADMIN', 'SCHOOL_ADMIN'])):
            q_filter &= Q(status=ContentStatus.PUBLISHED)

        qs = Activity.objects.filter(q_filter).select_related('learning_level', 'learning_area', 'topic')

        # Filters
        level = self.request.query_params.get('level')
        level_code = self.request.query_params.get('level_code')
        area = self.request.query_params.get('area')
        topic = self.request.query_params.get('topic')
        activity_type = self.request.query_params.get('activity_type')
        status_param = self.request.query_params.get('status')

        if level:
            qs = qs.filter(learning_level_id=level)
        if level_code:
            qs = qs.filter(learning_level__code=level_code)
        if area:
            qs = qs.filter(Q(learning_area_id=area) | Q(learning_area__code=area))
        if topic:
            qs = qs.filter(topic_id=topic)
        if activity_type:
            qs = qs.filter(activity_type=activity_type)
        if status_param and user.is_superuser:
            qs = qs.filter(status=status_param)

        return qs.order_by('learning_level__order_index', 'order_index')

    @action(detail=True, methods=['post'], url_path='submit_attempt')
    def submit_attempt(self, request, pk=None):
        """
        Submits an activity attempt, calculates score and stars, updates progress, and checks for badge unlocks.
        """
        activity = self.get_object()
        serializer = SubmitAttemptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        child_id = serializer.validated_data['child_id']
        correct_count = serializer.validated_data.get('correct_count', 1)
        total_count = serializer.validated_data.get('total_count', 1)
        is_completed = serializer.validated_data.get('is_completed', True)
        answer_metadata = serializer.validated_data.get('answer_metadata', {})

        # Verify child existence and permissions
        try:
            child = Child.objects.get(id=child_id)
        except Child.DoesNotExist:
            return Response({'error': 'Child not found'}, status=status.HTTP_404_NOT_FOUND)

        # Calculate score and star rewards on server
        if total_count > 0:
            percentage = int((correct_count / total_count) * 100)
        else:
            percentage = 100

        # Base stars derived from activity specification (1 to 3 stars)
        if is_completed:
            if percentage >= 80:
                stars_awarded = activity.star_reward or 1
            elif percentage >= 50:
                stars_awarded = max(1, (activity.star_reward or 1) - 1)
            else:
                stars_awarded = 1
        else:
            stars_awarded = 0

        # Create attempt record
        attempt = ActivityAttempt.objects.create(
            school=child.school,
            child=child,
            activity=activity,
            completed_at=timezone.now() if is_completed else None,
            is_completed=is_completed,
            score=percentage,
            correct_count=correct_count,
            total_count=total_count,
            stars_awarded=stars_awarded,
            answer_metadata=answer_metadata,
        )

        # Update or create LearningProgress
        progress, _ = LearningProgress.objects.get_or_create(
            school=child.school,
            child=child,
            learning_area=activity.learning_area,
            topic=activity.topic,
        )
        if is_completed:
            progress.activities_completed_count += 1
            progress.total_stars_earned += stars_awarded
            # Simple mastery progression formula
            progress.mastery_percentage = min(100, progress.activities_completed_count * 20)
            progress.last_activity_at = timezone.now()
            progress.save()

        # Check for Badge Unlock Criteria
        total_child_stars = ActivityAttempt.objects.filter(child=child, is_completed=True).aggregate(s=Sum('stars_awarded'))['s'] or 0
        total_completed_activities = ActivityAttempt.objects.filter(child=child, is_completed=True).count()

        unlocked_badge_name = None
        # Star milestone badges
        eligible_badges = RewardBadge.objects.filter(is_active=True)
        for b in eligible_badges:
            if b.badge_type == 'STAR_MILESTONE' and total_child_stars >= b.required_count:
                if not ChildBadge.objects.filter(child=child, badge=b).exists():
                    ChildBadge.objects.create(school=child.school, child=child, badge=b)
                    unlocked_badge_name = b.name
            elif b.badge_type == 'ACTIVITY_COUNT' and total_completed_activities >= b.required_count:
                if not ChildBadge.objects.filter(child=child, badge=b).exists():
                    ChildBadge.objects.create(school=child.school, child=child, badge=b)
                    unlocked_badge_name = b.name

        return Response({
            'success': True,
            'attempt_id': attempt.id,
            'stars_awarded': stars_awarded,
            'total_child_stars': total_child_stars,
            'score_percentage': percentage,
            'is_completed': is_completed,
            'badge_unlocked': unlocked_badge_name,
        }, status=status.HTTP_201_CREATED)


class ActivityAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        child_id = self.request.query_params.get('child_id')

        qs = ActivityAttempt.objects.select_related('activity', 'child').order_by('-created_at')

        if hasattr(user, 'parent_profile') and user.parent_profile:
            parent_child_ids = ChildParentRelationship.objects.filter(parent=user.parent_profile).values_list('child_id', flat=True)
            qs = qs.filter(child_id__in=parent_child_ids)
        elif school_id:
            qs = qs.filter(child__school_id=school_id)

        if child_id:
            qs = qs.filter(child_id=child_id)

        return qs


class LearningProgressViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LearningProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        child_id = self.request.query_params.get('child_id')

        qs = LearningProgress.objects.select_related('learning_area', 'topic', 'child').order_by('-last_activity_at')

        if hasattr(user, 'parent_profile') and user.parent_profile:
            parent_child_ids = ChildParentRelationship.objects.filter(parent=user.parent_profile).values_list('child_id', flat=True)
            qs = qs.filter(child_id__in=parent_child_ids)
        elif school_id:
            qs = qs.filter(school_id=school_id)

        if child_id:
            qs = qs.filter(child_id=child_id)

        return qs


class RewardBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RewardBadge.objects.filter(is_active=True).order_by('required_count')
    serializer_class = RewardBadgeSerializer
    permission_classes = [permissions.AllowAny]


class ChildBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChildBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        child_id = self.request.query_params.get('child_id')
        school_id = get_request_school_id(self.request)

        qs = ChildBadge.objects.select_related('badge', 'child').order_by('-earned_at')

        if hasattr(user, 'parent_profile') and user.parent_profile:
            parent_child_ids = ChildParentRelationship.objects.filter(parent=user.parent_profile).values_list('child_id', flat=True)
            qs = qs.filter(child_id__in=parent_child_ids)
        elif school_id:
            qs = qs.filter(school_id=school_id)

        if child_id:
            qs = qs.filter(child_id=child_id)

        return qs


class InteractiveStoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InteractiveStorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        q_filter = Q(is_global=True, status=ContentStatus.PUBLISHED)
        if school_id:
            q_filter |= Q(school_id=school_id, status=ContentStatus.PUBLISHED)

        qs = InteractiveStory.objects.filter(q_filter).prefetch_related('scenes').select_related('learning_level')

        level = self.request.query_params.get('level')
        if level:
            qs = qs.filter(Q(learning_level_id=level) | Q(learning_level__code=level))
        return qs.order_by('learning_level__order_index', 'title')


class CuratedVideoViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CuratedVideoSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        q_filter = Q(is_global=True, status=ContentStatus.PUBLISHED)
        if school_id:
            q_filter |= Q(school_id=school_id, status=ContentStatus.PUBLISHED)

        qs = CuratedVideo.objects.filter(q_filter).select_related('learning_level', 'learning_area')

        level = self.request.query_params.get('level')
        area = self.request.query_params.get('area')
        if level:
            qs = qs.filter(Q(learning_level_id=level) | Q(learning_level__code=level))
        if area:
            qs = qs.filter(Q(learning_area_id=area) | Q(learning_area__code=area))
        return qs.order_by('title')


class ActivityAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        if not school_id:
            return ActivityAssignment.objects.none()
        return ActivityAssignment.objects.filter(school_id=school_id, is_active=True).select_related('activity', 'class_level', 'section', 'child')

    def perform_create(self, serializer):
        school_id = get_request_school_id(self.request)
        serializer.save(school_id=school_id, assigned_by=self.request.user)


class KidDashboardView(viewsets.ViewSet):
    """
    Dedicated lightweight summary endpoint for Kid Mode Home World.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        child_id = request.query_params.get('child_id')
        child = None

        if child_id:
            try:
                child = Child.objects.get(id=child_id)
            except Child.DoesNotExist:
                pass

        if not child:
            # Fallback: check if parent has linked children
            if hasattr(request.user, 'parent_profile') and request.user.parent_profile:
                rel = ChildParentRelationship.objects.filter(parent=request.user.parent_profile).first()
                if rel:
                    child = rel.child
            elif hasattr(request.user, 'child_profile') and request.user.child_profile:
                child = request.user.child_profile

        # Default fallback child for development if none found
        if not child:
            child = Child.objects.first()

        if not child:
            return Response({'error': 'No child available'}, status=status.HTTP_404_NOT_FOUND)

        # Compute Total Stars & Badges
        total_stars = ActivityAttempt.objects.filter(child=child, is_completed=True).aggregate(s=Sum('stars_awarded'))['s'] or 0
        unlocked_badges = ChildBadge.objects.filter(child=child).select_related('badge')
        badges_data = ChildBadgeSerializer(unlocked_badges, many=True).data

        # Map Child Age to Appropriate Learning Level
        # Stage 1 (Explore 2-3), Stage 2 (Discover 3-4), Stage 3 (Learn 4-5), Stage 4 (Build 5-7), Stage 5 (Create 7-9), Stage 6 (Grow 9-10)
        age = 3.5
        dob = getattr(child, 'date_of_birth', None) or getattr(child, 'dob', None)
        if dob:
            today = timezone.localdate()
            age = (today - dob).days / 365.25

        matching_level = LearningLevel.objects.filter(
            min_age__lte=age,
            max_age__gte=age,
            is_active=True
        ).first()

        if not matching_level:
            matching_level = LearningLevel.objects.filter(is_active=True).order_by('order_index').first()

        level_data = LearningLevelSerializer(matching_level).data if matching_level else None

        # Determine "Continue Adventure" Activity
        last_attempt = ActivityAttempt.objects.filter(child=child).select_related('activity').first()
        continue_activity = None
        if last_attempt and last_attempt.activity:
            continue_activity = ActivityListSerializer(last_attempt.activity).data

        # Recommended Activities for this child's level
        activities_qs = Activity.objects.filter(
            Q(is_global=True) | Q(school=child.school),
            status=ContentStatus.PUBLISHED
        )
        if matching_level:
            level_activities = activities_qs.filter(learning_level=matching_level)[:6]
        else:
            level_activities = activities_qs[:6]

        recommended_data = ActivityListSerializer(level_activities, many=True).data

        # Today's Challenge (Pick 1 published activity of high reward)
        today_challenge = activities_qs.filter(activity_type__in=[ActivityType.COUNT, ActivityType.MATCH, ActivityType.QUIZ]).first()
        challenge_data = ActivityListSerializer(today_challenge).data if today_challenge else None

        return Response({
            'child': {
                'id': child.id,
                'name': child.full_name,
                'first_name': child.first_name,
                'age': round(age, 1),
                'avatar_url': getattr(child, 'photo_url', '') or '',
                'admission_number': child.admission_number,
                'current_class': getattr(child, 'current_class', ''),
                'section': getattr(child, 'section', ''),
            },
            'total_stars': total_stars,
            'level': level_data,
            'badges': badges_data,
            'continue_activity': continue_activity,
            'recommended_activities': recommended_data,
            'today_challenge': challenge_data,
        })
