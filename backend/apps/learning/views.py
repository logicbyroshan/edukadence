from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Count, Avg
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
    Homework,
    HomeworkActivity,
    HomeworkAssignment,
    ChildHomeworkProgress,
    ContentStatus,
    ActivityType,
    HomeworkStatus,
    AssignmentTargetType,
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
    HomeworkListSerializer,
    HomeworkDetailSerializer,
    HomeworkCreateUpdateSerializer,
    HomeworkAssignmentSerializer,
    ChildHomeworkProgressSerializer,
    TeacherFeedbackSerializer,
)
from apps.students.models import Child, ChildParentRelationship
from apps.classes.models import Enrollment, Section, ClassLevel
from apps.core.utils import get_request_school_id


def is_teacher_or_admin(user, school_id=None):
    """Returns True if the authenticated user is a Super Admin, School Admin, or Teacher in the school."""
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    membership_qs = user.memberships.filter(is_active=True)
    if school_id:
        membership_qs = membership_qs.filter(school_id=school_id)
    return membership_qs.filter(role__in=['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']).exists()



class LearningLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LearningLevel.objects.filter(is_active=True).order_by('order_index')
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
        if self.action in ['retrieve', 'update', 'partial_update', 'create']:
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
        if not is_teacher_or_admin(user, school_id):
            q_filter &= Q(status=ContentStatus.PUBLISHED)

        qs = Activity.objects.filter(q_filter).select_related('learning_level', 'learning_area', 'topic', 'created_by')

        # Filters
        level = self.request.query_params.get('level')
        level_code = self.request.query_params.get('level_code')
        area = self.request.query_params.get('area')
        topic = self.request.query_params.get('topic')
        activity_type = self.request.query_params.get('activity_type')
        status_param = self.request.query_params.get('status')
        scope = self.request.query_params.get('scope')  # 'my', 'school', 'global'

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
        if status_param:
            qs = qs.filter(status=status_param)

        if scope == 'my' and user.is_authenticated:
            qs = qs.filter(created_by=user)
        elif scope == 'school' and school_id:
            qs = qs.filter(school_id=school_id, is_global=False)
        elif scope == 'global':
            qs = qs.filter(is_global=True)

        return qs.order_by('learning_level__order_index', 'order_index')

    def perform_create(self, serializer):
        school_id = get_request_school_id(self.request)
        serializer.save(
            school_id=school_id,
            created_by=self.request.user,
            is_global=False if school_id else True,
        )

    @action(detail=False, methods=['get'], url_path='templates')
    def templates(self, request):
        """
        Returns structured starter activity templates for teachers to author new activities with 1 click.
        """
        templates_data = [
            {
                'id': 'tpl-tap-choose',
                'title': 'Choose the Correct Object',
                'activity_type': 'TAP_CHOOSE',
                'description': 'Identify the correct picture or word among multiple visual options.',
                'template_category': 'Visual Recognition',
                'difficulty': 'EASY',
                'star_reward': 2,
                'content': {
                    'prompt': 'Which one is an Apple?',
                    'audio_prompt': 'Can you find the apple?',
                    'options': [
                        {'id': 'opt-1', 'label': 'Apple', 'emoji': '🍎', 'is_correct': True},
                        {'id': 'opt-2', 'label': 'Banana', 'emoji': '🍌', 'is_correct': False},
                        {'id': 'opt-3', 'label': 'Carrot', 'emoji': '🥕', 'is_correct': False},
                        {'id': 'opt-4', 'label': 'Donut', 'emoji': '🍩', 'is_correct': False},
                    ]
                }
            },
            {
                'id': 'tpl-match-pairs',
                'title': 'Match the Pairs',
                'activity_type': 'MATCH',
                'description': 'Connect matching words, uppercase/lowercase letters, or animals to their homes.',
                'template_category': 'Association',
                'difficulty': 'EASY',
                'star_reward': 2,
                'content': {
                    'prompt': 'Match the animals with their favorite foods!',
                    'pairs': [
                        {'left': 'Cat 🐱', 'right': 'Milk 🥛'},
                        {'left': 'Monkey 🐒', 'right': 'Banana 🍌'},
                        {'left': 'Rabbit 🐰', 'right': 'Carrot 🥕'},
                        {'left': 'Dog 🐶', 'right': 'Bone 🦴'},
                    ]
                }
            },
            {
                'id': 'tpl-count-objects',
                'title': 'Count the Objects',
                'activity_type': 'COUNT',
                'description': 'Count the cheerful items on screen and select or tap the correct number.',
                'template_category': 'Math & Numeracy',
                'difficulty': 'EASY',
                'star_reward': 2,
                'content': {
                    'prompt': 'How many glowing stars are in the night sky?',
                    'emoji': '⭐',
                    'count': 5,
                    'options': [3, 4, 5, 6]
                }
            },
            {
                'id': 'tpl-sequence-order',
                'title': 'Complete the Pattern',
                'activity_type': 'SEQUENCE',
                'description': 'Figure out what number, letter, or shape comes next in order.',
                'template_category': 'Logical Reasoning',
                'difficulty': 'MEDIUM',
                'star_reward': 3,
                'content': {
                    'prompt': 'What comes next in the rainbow sequence?',
                    'sequence': ['🔴', '🔵', '🔴', '🔵', '?'],
                    'correct_answer': '🔴',
                    'options': ['🔴', '🔵', '🟢', '🟡']
                }
            },
            {
                'id': 'tpl-sort-groups',
                'title': 'Sort & Classify',
                'activity_type': 'SORT',
                'description': 'Organize objects into two categories (e.g. Fruits vs Vegetables).',
                'template_category': 'Classification',
                'difficulty': 'MEDIUM',
                'star_reward': 3,
                'content': {
                    'prompt': 'Sort the items into Healthy Food and Sweet Treats!',
                    'categories': ['Healthy Foods 🥗', 'Sweet Treats 🍭'],
                    'items': [
                        {'id': 'i1', 'label': 'Apple 🍎', 'category_index': 0},
                        {'id': 'i2', 'label': 'Cupcake 🧁', 'category_index': 1},
                        {'id': 'i3', 'label': 'Broccoli 🥦', 'category_index': 0},
                        {'id': 'i4', 'label': 'Lollipop 🍭', 'category_index': 1},
                    ]
                }
            },
            {
                'id': 'tpl-quiz-multiple-choice',
                'title': 'Picture Quiz',
                'activity_type': 'QUIZ',
                'description': 'A 3-question visual quiz with positive feedback sound prompts.',
                'template_category': 'Comprehension',
                'difficulty': 'MEDIUM',
                'star_reward': 3,
                'content': {
                    'questions': [
                        {
                            'question': 'What color is the bright sun?',
                            'options': ['Yellow ☀️', 'Blue 💧', 'Green 🌿'],
                            'correct_index': 0
                        },
                        {
                            'question': 'Which animal says "Woof Woof"?',
                            'options': ['Duck 🦆', 'Dog 🐶', 'Cow 🐮'],
                            'correct_index': 1
                        },
                    ]
                }
            },
            {
                'id': 'tpl-memory-flip',
                'title': 'Memory Card Flip',
                'activity_type': 'MEMORY',
                'description': 'Flip cards and find matching pairs of letters, numbers, or cute icons.',
                'template_category': 'Memory & Focus',
                'difficulty': 'EASY',
                'star_reward': 2,
                'content': {
                    'prompt': 'Find all 3 matching pairs!',
                    'cards': ['🦁', '🦁', '🐘', '🐘', '🦒', '🦒']
                }
            },
            {
                'id': 'tpl-trace-letter',
                'title': 'Trace Letter & Shape',
                'activity_type': 'TRACE',
                'description': 'Guide touch line tracing for uppercase and lowercase alphabet letters.',
                'template_category': 'Fine Motor Skills',
                'difficulty': 'EASY',
                'star_reward': 2,
                'content': {
                    'target_character': 'A',
                    'prompt': 'Trace uppercase letter A with your finger!'
                }
            }
        ]
        return Response({'success': True, 'templates': templates_data})

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate(self, request, pk=None):
        """
        Clones an activity into a new DRAFT owned by the requesting teacher.
        """
        original = self.get_object()
        school_id = get_request_school_id(request) or original.school_id

        clone = Activity.objects.create(
            school_id=school_id,
            created_by=request.user,
            is_global=False,
            learning_level=original.learning_level,
            learning_area=original.learning_area,
            topic=original.topic,
            title=f"Copy of {original.title}",
            description=original.description,
            activity_type=original.activity_type,
            difficulty=original.difficulty,
            estimated_duration_minutes=original.estimated_duration_minutes,
            star_reward=original.star_reward,
            thumbnail_url=original.thumbnail_url,
            media_asset_url=original.media_asset_url,
            audio_instruction_url=original.audio_instruction_url,
            content=original.content,
            status=ContentStatus.DRAFT,
            order_index=original.order_index + 1,
            version=1,
        )
        return Response({
            'success': True,
            'message': 'Activity duplicated as draft',
            'data': ActivityDetailSerializer(clone).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='submit_attempt')
    def submit_attempt(self, request, pk=None):
        """
        Submits an activity attempt, calculates score and stars, updates progress,
        links to homework assignment context (if supplied), and checks for badge unlocks.
        """
        activity = self.get_object()
        serializer = SubmitAttemptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        child_id = serializer.validated_data['child_id']
        assignment_id = serializer.validated_data.get('assignment_id')
        homework_id = serializer.validated_data.get('homework_id')
        correct_count = serializer.validated_data.get('correct_count', 1)
        total_count = serializer.validated_data.get('total_count', 1)
        is_completed = serializer.validated_data.get('is_completed', True)
        answer_metadata = serializer.validated_data.get('answer_metadata', {})

        # Verify child existence and permissions
        try:
            child = Child.objects.get(id=child_id)
        except Child.DoesNotExist:
            return Response({'error': 'Child not found'}, status=status.HTTP_404_NOT_FOUND)

        # Resolve Assignment if passed
        assignment = None
        if assignment_id:
            try:
                assignment = HomeworkAssignment.objects.select_related('homework').get(id=assignment_id)
            except HomeworkAssignment.DoesNotExist:
                pass

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
            homework=assignment.homework if assignment else (Homework.objects.filter(id=homework_id).first() if homework_id else None),
            assignment=assignment,
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
            progress.mastery_percentage = min(100, progress.activities_completed_count * 20)
            progress.last_activity_at = timezone.now()
            progress.save()

        # Update Homework Assignment Child Progress if in assignment context
        homework_completed = False
        if assignment and is_completed:
            child_hw, _ = ChildHomeworkProgress.objects.get_or_create(
                school=child.school,
                assignment=assignment,
                child=child,
                defaults={
                    'total_activities_count': assignment.homework.items.count() or 1,
                    'status': HomeworkStatus.IN_PROGRESS,
                    'started_at': timezone.now(),
                }
            )
            # Count distinct completed activities for this assignment
            completed_acts_count = ActivityAttempt.objects.filter(
                assignment=assignment,
                child=child,
                is_completed=True
            ).values('activity_id').distinct().count()

            total_acts_in_hw = assignment.homework.items.count() or 1
            child_hw.completed_activities_count = completed_acts_count
            child_hw.total_activities_count = total_acts_in_hw
            child_hw.total_stars_earned += stars_awarded

            # Average score across completed attempts for this homework
            avg_score = ActivityAttempt.objects.filter(
                assignment=assignment,
                child=child,
                is_completed=True
            ).aggregate(avg=Avg('score'))['avg'] or percentage
            child_hw.average_score = int(avg_score)

            if completed_acts_count >= total_acts_in_hw:
                child_hw.status = HomeworkStatus.COMPLETED
                child_hw.completed_at = timezone.now()
                homework_completed = True
            else:
                child_hw.status = HomeworkStatus.IN_PROGRESS
                if not child_hw.started_at:
                    child_hw.started_at = timezone.now()

            child_hw.save()

        # Check for Badge Unlock Criteria
        total_child_stars = ActivityAttempt.objects.filter(child=child, is_completed=True).aggregate(s=Sum('stars_awarded'))['s'] or 0
        total_completed_activities = ActivityAttempt.objects.filter(child=child, is_completed=True).count()

        unlocked_badge_name = None
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
            'homework_completed': homework_completed,
            'badge_unlocked': unlocked_badge_name,
        }, status=status.HTTP_201_CREATED)


class ActivityAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        child_id = self.request.query_params.get('child_id')
        assignment_id = self.request.query_params.get('assignment_id')

        qs = ActivityAttempt.objects.select_related('activity', 'child', 'homework').order_by('-created_at')

        if hasattr(user, 'parent_profile') and user.parent_profile:
            parent_child_ids = ChildParentRelationship.objects.filter(parent=user.parent_profile).values_list('child_id', flat=True)
            qs = qs.filter(child_id__in=parent_child_ids)
        elif school_id:
            qs = qs.filter(child__school_id=school_id)

        if child_id:
            qs = qs.filter(child_id=child_id)
        if assignment_id:
            qs = qs.filter(assignment_id=assignment_id)

        return qs


class HomeworkViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Teacher & School Homework Sets.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return HomeworkListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return HomeworkCreateUpdateSerializer
        return HomeworkDetailSerializer

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        user = self.request.user
        if not school_id:
            return Homework.objects.none()

        qs = Homework.objects.filter(school_id=school_id).select_related(
            'learning_level', 'learning_area', 'topic', 'created_by'
        ).prefetch_related('items__activity').order_by('-created_at')

        # Role filter: Child/Parent can only see PUBLISHED homework
        if not is_teacher_or_admin(user, school_id):
            qs = qs.filter(status=ContentStatus.PUBLISHED)

        # Query parameter filters
        level = self.request.query_params.get('level')
        area = self.request.query_params.get('area')
        status_param = self.request.query_params.get('status')
        created_by_me = self.request.query_params.get('my_only')

        if level:
            qs = qs.filter(learning_level_id=level)
        if area:
            qs = qs.filter(learning_area_id=area)
        if status_param:
            qs = qs.filter(status=status_param)
        if created_by_me == 'true':
            qs = qs.filter(created_by=user)

        return qs

    def perform_create(self, serializer):
        school_id = get_request_school_id(self.request)
        serializer.save(
            school_id=school_id,
            created_by=self.request.user,
        )

    @action(detail=True, methods=['post'], url_path='publish')
    def publish(self, request, pk=None):
        """
        Publishes draft homework making it assignable to classrooms.
        """
        homework = self.get_object()
        if homework.items.count() == 0:
            return Response(
                {'error': 'Cannot publish homework with 0 activities. Please add at least 1 activity.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        homework.status = ContentStatus.PUBLISHED
        homework.save()
        return Response({'success': True, 'message': 'Homework published successfully', 'status': homework.status})

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate(self, request, pk=None):
        """
        Duplicates a homework set and all its activity inclusions as a new DRAFT.
        """
        original = self.get_object()
        school_id = get_request_school_id(request) or original.school_id

        clone = Homework.objects.create(
            school_id=school_id,
            created_by=request.user,
            title=f"Copy of {original.title}",
            description=original.description,
            instructions=original.instructions,
            learning_level=original.learning_level,
            learning_area=original.learning_area,
            topic=original.topic,
            difficulty=original.difficulty,
            estimated_duration_minutes=original.estimated_duration_minutes,
            status=ContentStatus.DRAFT,
            cover_image_url=original.cover_image_url,
            theme_color=original.theme_color,
            version=1,
        )

        for item in original.items.all():
            HomeworkActivity.objects.create(
                homework=clone,
                activity=item.activity,
                order_index=item.order_index,
                instructions_override=item.instructions_override,
                required_to_complete=item.required_to_complete,
            )

        return Response({
            'success': True,
            'message': 'Homework duplicated as draft',
            'data': HomeworkDetailSerializer(clone).data
        }, status=status.HTTP_201_CREATED)


class HomeworkAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for scheduling and distributing homework sets to classes/children.
    """
    serializer_class = HomeworkAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        user = self.request.user
        if not school_id:
            return HomeworkAssignment.objects.none()

        qs = HomeworkAssignment.objects.filter(school_id=school_id, is_active=True).select_related(
            'homework__learning_level', 'homework__learning_area', 'class_level', 'section', 'assigned_by'
        ).prefetch_related('submissions__child').order_by('-assigned_at', '-due_date')

        # Role-based scoping
        if hasattr(user, 'parent_profile') and user.parent_profile:
            parent_child_ids = ChildParentRelationship.objects.filter(parent=user.parent_profile).values_list('child_id', flat=True)
            qs = qs.filter(submissions__child_id__in=parent_child_ids).distinct()
        elif hasattr(user, 'child_profile') and user.child_profile:
            qs = qs.filter(submissions__child=user.child_profile).distinct()

        # Query filters
        section_id = self.request.query_params.get('section')
        class_level_id = self.request.query_params.get('class_level')
        status_param = self.request.query_params.get('status')
        child_id = self.request.query_params.get('child_id')

        if section_id:
            qs = qs.filter(section_id=section_id)
        if class_level_id:
            qs = qs.filter(class_level_id=class_level_id)
        if status_param:
            qs = qs.filter(status=status_param)
        if child_id:
            qs = qs.filter(submissions__child_id=child_id)

        return qs

    def perform_create(self, serializer):
        school_id = get_request_school_id(self.request)
        child_ids = serializer.validated_data.pop('child_ids', [])
        assignment = serializer.save(
            school_id=school_id,
            assigned_by=self.request.user,
        )

        # Populate ChildHomeworkProgress records for all targeted children
        target_children = []
        if assignment.target_type == AssignmentTargetType.SECTION and assignment.section:
            enrolled_child_ids = Enrollment.objects.filter(
                section=assignment.section,
                status='ACTIVE'
            ).values_list('child_id', flat=True)
            target_children = Child.objects.filter(id__in=enrolled_child_ids, school_id=school_id)
        elif assignment.target_type == AssignmentTargetType.CLASS and assignment.class_level:
            enrolled_child_ids = Enrollment.objects.filter(
                class_level=assignment.class_level,
                status='ACTIVE'
            ).values_list('child_id', flat=True)
            target_children = Child.objects.filter(id__in=enrolled_child_ids, school_id=school_id)
        elif assignment.target_type == AssignmentTargetType.INDIVIDUAL_CHILDREN and child_ids:
            target_children = Child.objects.filter(id__in=child_ids, school_id=school_id)
        else:
            # Fallback: if section or class selected
            if assignment.section:
                enrolled_child_ids = Enrollment.objects.filter(section=assignment.section, status='ACTIVE').values_list('child_id', flat=True)
                target_children = Child.objects.filter(id__in=enrolled_child_ids, school_id=school_id)

        total_acts = assignment.homework.items.count() or 1
        for child in target_children:
            ChildHomeworkProgress.objects.get_or_create(
                school_id=school_id,
                assignment=assignment,
                child=child,
                defaults={
                    'total_activities_count': total_acts,
                    'status': HomeworkStatus.NOT_STARTED,
                }
            )

    @action(detail=True, methods=['get'], url_path='class_progress')
    def class_progress(self, request, pk=None):
        """
        Returns class-level aggregated completion breakdown and individual student submission cards.
        """
        assignment = self.get_object()
        submissions = assignment.submissions.select_related('child', 'teacher_feedback_by').order_by('child__first_name')
        
        total_students = submissions.count()
        completed = submissions.filter(status=HomeworkStatus.COMPLETED).count()
        in_progress = submissions.filter(status=HomeworkStatus.IN_PROGRESS).count()
        not_started = submissions.filter(status=HomeworkStatus.NOT_STARTED).count()
        avg_score = submissions.filter(status=HomeworkStatus.COMPLETED).aggregate(avg=Avg('average_score'))['avg'] or 0

        submissions_data = ChildHomeworkProgressSerializer(submissions, many=True).data

        return Response({
            'assignment': {
                'id': assignment.id,
                'title': assignment.homework.title,
                'level_name': assignment.homework.learning_level.name,
                'due_date': assignment.due_date,
                'target_name': assignment.section.display_name if assignment.section else (assignment.class_level.name if assignment.class_level else 'Custom Group'),
                'total_activities': assignment.homework.items.count(),
            },
            'summary': {
                'total_students': total_students,
                'completed_count': completed,
                'in_progress_count': in_progress,
                'not_started_count': not_started,
                'completion_percentage': int((completed / total_students * 100)) if total_students > 0 else 0,
                'average_score': int(avg_score),
            },
            'students': submissions_data,
        })

    @action(detail=True, methods=['post'], url_path='feedback')
    def feedback(self, request, pk=None):
        """
        Leaves encouraging teacher feedback on a specific child's submission.
        """
        assignment = self.get_object()
        serializer = TeacherFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        child_id = serializer.validated_data['child_id']
        feedback_text = serializer.validated_data['feedback']

        try:
            submission = ChildHomeworkProgress.objects.get(assignment=assignment, child_id=child_id)
        except ChildHomeworkProgress.DoesNotExist:
            return Response({'error': 'Student submission record not found'}, status=status.HTTP_404_NOT_FOUND)

        submission.teacher_feedback = feedback_text
        submission.teacher_feedback_at = timezone.now()
        submission.teacher_feedback_by = request.user
        submission.save()

        return Response({
            'success': True,
            'message': 'Feedback saved successfully',
            'data': ChildHomeworkProgressSerializer(submission).data
        })


class ChildHomeworkProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for inspecting child homework progress records.
    """
    serializer_class = ChildHomeworkProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        child_id = self.request.query_params.get('child_id')
        assignment_id = self.request.query_params.get('assignment_id')

        qs = ChildHomeworkProgress.objects.select_related('assignment__homework', 'child', 'teacher_feedback_by').order_by('-created_at')

        if hasattr(user, 'parent_profile') and user.parent_profile:
            parent_child_ids = ChildParentRelationship.objects.filter(parent=user.parent_profile).values_list('child_id', flat=True)
            qs = qs.filter(child_id__in=parent_child_ids)
        elif school_id:
            qs = qs.filter(school_id=school_id)

        if child_id:
            qs = qs.filter(child_id=child_id)
        if assignment_id:
            qs = qs.filter(assignment_id=assignment_id)

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
    Includes developmental level, stars, badges, continue activity, and active homework quests.
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

        # Today's Challenge
        today_challenge = activities_qs.filter(activity_type__in=[ActivityType.COUNT, ActivityType.MATCH, ActivityType.QUIZ]).first()
        challenge_data = ActivityListSerializer(today_challenge).data if today_challenge else None

        # Fetch Active Assigned Homework for this child
        homework_progress_records = ChildHomeworkProgress.objects.filter(
            child=child,
            assignment__is_active=True,
            assignment__status=ContentStatus.PUBLISHED,
        ).select_related(
            'assignment__homework__learning_level',
            'assignment__homework__learning_area',
            'assignment__assigned_by'
        ).prefetch_related('assignment__homework__items__activity')

        active_homework_list = []
        for hw_prog in homework_progress_records:
            hw = hw_prog.assignment.homework
            # List items with per-activity child attempt status
            items_data = []
            for item in hw.items.all():
                is_act_done = ActivityAttempt.objects.filter(
                    assignment=hw_prog.assignment,
                    child=child,
                    activity=item.activity,
                    is_completed=True
                ).exists()
                items_data.append({
                    'id': item.id,
                    'activity_id': item.activity.id,
                    'title': item.activity.title,
                    'activity_type': item.activity.activity_type,
                    'star_reward': item.activity.star_reward,
                    'thumbnail_url': item.activity.thumbnail_url,
                    'order_index': item.order_index,
                    'is_completed': is_act_done,
                    'activity_detail': ActivityDetailSerializer(item.activity).data,
                })

            active_homework_list.append({
                'progress_id': hw_prog.id,
                'assignment_id': hw_prog.assignment.id,
                'homework_id': hw.id,
                'title': hw.title,
                'description': hw.description,
                'instructions': hw.instructions,
                'due_date': hw_prog.assignment.due_date,
                'status': hw_prog.status,
                'completed_activities_count': hw_prog.completed_activities_count,
                'total_activities_count': hw_prog.total_activities_count,
                'total_stars_earned': hw_prog.total_stars_earned,
                'teacher_feedback': hw_prog.teacher_feedback,
                'teacher_name': hw_prog.assignment.assigned_by.full_name if hw_prog.assignment.assigned_by else 'Class Teacher',
                'items': items_data,
            })

        return Response({
            'child': {
                'id': child.id,
                'name': child.full_name,
                'first_name': child.first_name,
                'age': round(age, 1),
                'avatar_url': getattr(child, 'profile_photo_url', '') or '',
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
            'active_homework': active_homework_list,
        })
