from rest_framework import serializers
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
)
from apps.students.models import Child


class LearningLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningLevel
        fields = [
            'id',
            'code',
            'name',
            'min_age',
            'max_age',
            'description',
            'order_index',
            'color_theme',
            'icon_name',
            'is_active',
        ]


class LearningTopicSerializer(serializers.ModelSerializer):
    learning_area_name = serializers.ReadOnlyField(source='learning_area.name')
    learning_level_name = serializers.ReadOnlyField(source='learning_level.name')

    class Meta:
        model = LearningTopic
        fields = [
            'id',
            'learning_area',
            'learning_area_name',
            'learning_level',
            'learning_level_name',
            'code',
            'name',
            'description',
            'order_index',
            'is_active',
        ]


class LearningAreaSerializer(serializers.ModelSerializer):
    topics = LearningTopicSerializer(many=True, read_only=True)

    class Meta:
        model = LearningArea
        fields = [
            'id',
            'code',
            'name',
            'description',
            'icon_name',
            'order_index',
            'is_active',
            'topics',
        ]


class ActivityListSerializer(serializers.ModelSerializer):
    level_name = serializers.ReadOnlyField(source='learning_level.name')
    level_code = serializers.ReadOnlyField(source='learning_level.code')
    level_color = serializers.ReadOnlyField(source='learning_level.color_theme')
    area_name = serializers.ReadOnlyField(source='learning_area.name')
    area_icon = serializers.ReadOnlyField(source='learning_area.icon_name')
    topic_name = serializers.ReadOnlyField(source='topic.name')

    class Meta:
        model = Activity
        fields = [
            'id',
            'title',
            'description',
            'activity_type',
            'difficulty',
            'estimated_duration_minutes',
            'star_reward',
            'thumbnail_url',
            'media_asset_url',
            'learning_level',
            'level_name',
            'level_code',
            'level_color',
            'learning_area',
            'area_name',
            'area_icon',
            'topic',
            'topic_name',
            'is_global',
            'status',
            'order_index',
        ]


class ActivityDetailSerializer(serializers.ModelSerializer):
    level_name = serializers.ReadOnlyField(source='learning_level.name')
    level_code = serializers.ReadOnlyField(source='learning_level.code')
    level_color = serializers.ReadOnlyField(source='learning_level.color_theme')
    area_name = serializers.ReadOnlyField(source='learning_area.name')
    topic_name = serializers.ReadOnlyField(source='topic.name')

    class Meta:
        model = Activity
        fields = [
            'id',
            'title',
            'description',
            'activity_type',
            'difficulty',
            'estimated_duration_minutes',
            'star_reward',
            'thumbnail_url',
            'media_asset_url',
            'audio_instruction_url',
            'content',
            'learning_level',
            'level_name',
            'level_code',
            'level_color',
            'learning_area',
            'area_name',
            'topic',
            'topic_name',
            'is_global',
            'status',
            'order_index',
        ]


class ActivityAttemptSerializer(serializers.ModelSerializer):
    activity_title = serializers.ReadOnlyField(source='activity.title')
    activity_type = serializers.ReadOnlyField(source='activity.activity_type')
    child_name = serializers.ReadOnlyField(source='child.full_name')

    class Meta:
        model = ActivityAttempt
        fields = [
            'id',
            'child',
            'child_name',
            'activity',
            'activity_title',
            'activity_type',
            'started_at',
            'completed_at',
            'is_completed',
            'score',
            'correct_count',
            'total_count',
            'stars_awarded',
            'answer_metadata',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class SubmitAttemptSerializer(serializers.Serializer):
    child_id = serializers.UUIDField()
    assignment_id = serializers.UUIDField(required=False, allow_null=True)
    homework_id = serializers.UUIDField(required=False, allow_null=True)
    correct_count = serializers.IntegerField(required=False, default=1)
    total_count = serializers.IntegerField(required=False, default=1)
    is_completed = serializers.BooleanField(required=False, default=True)
    answer_metadata = serializers.JSONField(required=False, default=dict)


class LearningProgressSerializer(serializers.ModelSerializer):
    area_name = serializers.ReadOnlyField(source='learning_area.name')
    area_icon = serializers.ReadOnlyField(source='learning_area.icon_name')
    topic_name = serializers.ReadOnlyField(source='topic.name')
    child_name = serializers.ReadOnlyField(source='child.full_name')

    class Meta:
        model = LearningProgress
        fields = [
            'id',
            'child',
            'child_name',
            'learning_area',
            'area_name',
            'area_icon',
            'topic',
            'topic_name',
            'activities_completed_count',
            'total_stars_earned',
            'mastery_percentage',
            'last_activity_at',
        ]


class RewardBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardBadge
        fields = [
            'id',
            'code',
            'name',
            'description',
            'icon_name',
            'badge_type',
            'required_count',
            'color_accent',
            'is_active',
        ]


class ChildBadgeSerializer(serializers.ModelSerializer):
    badge = RewardBadgeSerializer(read_only=True)
    child_name = serializers.ReadOnlyField(source='child.full_name')

    class Meta:
        model = ChildBadge
        fields = [
            'id',
            'child',
            'child_name',
            'badge',
            'earned_at',
        ]


class StorySceneSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryScene
        fields = [
            'id',
            'scene_number',
            'title',
            'text_content',
            'illustration_url',
            'audio_narration_url',
            'checkpoint_prompt',
        ]


class InteractiveStorySerializer(serializers.ModelSerializer):
    scenes = StorySceneSerializer(many=True, read_only=True)
    level_name = serializers.ReadOnlyField(source='learning_level.name')

    class Meta:
        model = InteractiveStory
        fields = [
            'id',
            'learning_level',
            'level_name',
            'title',
            'synopsis',
            'cover_image_url',
            'author',
            'estimated_reading_minutes',
            'star_reward',
            'is_global',
            'status',
            'scenes',
        ]


class CuratedVideoSerializer(serializers.ModelSerializer):
    level_name = serializers.ReadOnlyField(source='learning_level.name')
    area_name = serializers.ReadOnlyField(source='learning_area.name')

    class Meta:
        model = CuratedVideo
        fields = [
            'id',
            'learning_level',
            'level_name',
            'learning_area',
            'area_name',
            'title',
            'description',
            'duration_seconds',
            'thumbnail_url',
            'video_url',
            'checkpoint_question',
            'is_global',
            'status',
        ]


class ActivityAssignmentSerializer(serializers.ModelSerializer):
    activity_title = serializers.ReadOnlyField(source='activity.title')
    activity_type = serializers.ReadOnlyField(source='activity.activity_type')
    class_name = serializers.ReadOnlyField(source='class_level.name')
    section_name = serializers.ReadOnlyField(source='section.name')
    child_name = serializers.ReadOnlyField(source='child.full_name')

    class Meta:
        model = ActivityAssignment
        fields = [
            'id',
            'activity',
            'activity_title',
            'activity_type',
            'class_level',
            'class_name',
            'section',
            'section_name',
            'child',
            'child_name',
            'assigned_at',
            'due_date',
            'instructions',
            'is_active',
        ]
        read_only_fields = ['id', 'assigned_at']


# ==============================================================================
# Phase 4 Homework & Teacher Learning Studio Serializers
# ==============================================================================

class HomeworkActivitySerializer(serializers.ModelSerializer):
    activity_title = serializers.ReadOnlyField(source='activity.title')
    activity_type = serializers.ReadOnlyField(source='activity.activity_type')
    star_reward = serializers.ReadOnlyField(source='activity.star_reward')
    thumbnail_url = serializers.ReadOnlyField(source='activity.thumbnail_url')
    activity_detail = ActivityDetailSerializer(source='activity', read_only=True)

    class Meta:
        from .models import HomeworkActivity
        model = HomeworkActivity
        fields = [
            'id',
            'activity',
            'activity_title',
            'activity_type',
            'star_reward',
            'thumbnail_url',
            'order_index',
            'instructions_override',
            'required_to_complete',
            'activity_detail',
        ]


class HomeworkListSerializer(serializers.ModelSerializer):
    level_name = serializers.ReadOnlyField(source='learning_level.name')
    level_code = serializers.ReadOnlyField(source='learning_level.code')
    area_name = serializers.ReadOnlyField(source='learning_area.name')
    topic_name = serializers.ReadOnlyField(source='topic.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')
    activity_count = serializers.SerializerMethodField()
    total_stars = serializers.SerializerMethodField()

    class Meta:
        from .models import Homework
        model = Homework
        fields = [
            'id',
            'title',
            'description',
            'instructions',
            'learning_level',
            'level_name',
            'level_code',
            'learning_area',
            'area_name',
            'topic',
            'topic_name',
            'difficulty',
            'estimated_duration_minutes',
            'status',
            'version',
            'is_template',
            'cover_image_url',
            'theme_color',
            'created_by',
            'created_by_name',
            'activity_count',
            'total_stars',
            'created_at',
        ]

    def get_activity_count(self, obj):
        return obj.items.count()

    def get_total_stars(self, obj):
        return sum(item.activity.star_reward for item in obj.items.select_related('activity'))


class HomeworkDetailSerializer(serializers.ModelSerializer):
    level_name = serializers.ReadOnlyField(source='learning_level.name')
    level_code = serializers.ReadOnlyField(source='learning_level.code')
    area_name = serializers.ReadOnlyField(source='learning_area.name')
    topic_name = serializers.ReadOnlyField(source='topic.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')
    items = HomeworkActivitySerializer(many=True, read_only=True)

    class Meta:
        from .models import Homework
        model = Homework
        fields = [
            'id',
            'title',
            'description',
            'instructions',
            'learning_level',
            'level_name',
            'level_code',
            'learning_area',
            'area_name',
            'topic',
            'topic_name',
            'difficulty',
            'estimated_duration_minutes',
            'status',
            'version',
            'is_template',
            'cover_image_url',
            'theme_color',
            'created_by',
            'created_by_name',
            'items',
            'created_at',
            'updated_at',
        ]


class HomeworkCreateUpdateSerializer(serializers.ModelSerializer):
    activity_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True,
        help_text="Ordered list of activity UUIDs to attach to this homework"
    )

    class Meta:
        from .models import Homework
        model = Homework
        fields = [
            'id',
            'title',
            'description',
            'instructions',
            'learning_level',
            'learning_area',
            'topic',
            'difficulty',
            'estimated_duration_minutes',
            'status',
            'cover_image_url',
            'theme_color',
            'activity_ids',
        ]

    def create(self, validated_data):
        from .models import Homework, HomeworkActivity, Activity
        activity_ids = validated_data.pop('activity_ids', [])
        homework = Homework.objects.create(**validated_data)
        for idx, act_id in enumerate(activity_ids, start=1):
            try:
                act = Activity.objects.get(id=act_id)
                HomeworkActivity.objects.create(homework=homework, activity=act, order_index=idx)
            except Activity.DoesNotExist:
                pass
        return homework

    def update(self, instance, validated_data):
        from .models import HomeworkActivity, Activity
        activity_ids = validated_data.pop('activity_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if activity_ids is not None:
            instance.items.all().delete()
            for idx, act_id in enumerate(activity_ids, start=1):
                try:
                    act = Activity.objects.get(id=act_id)
                    HomeworkActivity.objects.create(homework=instance, activity=act, order_index=idx)
                except Activity.DoesNotExist:
                    pass
        return instance


class ChildHomeworkProgressSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.full_name')
    child_first_name = serializers.ReadOnlyField(source='child.first_name')
    child_admission = serializers.ReadOnlyField(source='child.admission_number')
    child_avatar = serializers.ReadOnlyField(source='child.profile_photo_url')
    homework_title = serializers.ReadOnlyField(source='assignment.homework.title')
    due_date = serializers.ReadOnlyField(source='assignment.due_date')
    teacher_feedback_by_name = serializers.ReadOnlyField(source='teacher_feedback_by.full_name')

    class Meta:
        from .models import ChildHomeworkProgress
        model = ChildHomeworkProgress
        fields = [
            'id',
            'assignment',
            'child',
            'child_name',
            'child_first_name',
            'child_admission',
            'child_avatar',
            'homework_title',
            'due_date',
            'status',
            'started_at',
            'completed_at',
            'completed_activities_count',
            'total_activities_count',
            'total_stars_earned',
            'average_score',
            'teacher_feedback',
            'teacher_feedback_at',
            'teacher_feedback_by_name',
            'created_at',
        ]


class HomeworkAssignmentSerializer(serializers.ModelSerializer):
    homework_title = serializers.ReadOnlyField(source='homework.title')
    homework_level_name = serializers.ReadOnlyField(source='homework.learning_level.name')
    homework_cover = serializers.ReadOnlyField(source='homework.cover_image_url')
    class_name = serializers.ReadOnlyField(source='class_level.name')
    section_name = serializers.ReadOnlyField(source='section.name')
    assigned_by_name = serializers.ReadOnlyField(source='assigned_by.full_name')
    submissions = ChildHomeworkProgressSerializer(many=True, read_only=True)
    summary_stats = serializers.SerializerMethodField()

    child_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True,
        help_text="Optional list of specific child UUIDs for INDIVIDUAL_CHILDREN assignment target"
    )

    class Meta:
        from .models import HomeworkAssignment
        model = HomeworkAssignment
        fields = [
            'id',
            'homework',
            'homework_title',
            'homework_level_name',
            'homework_cover',
            'target_type',
            'class_level',
            'class_name',
            'section',
            'section_name',
            'assigned_by',
            'assigned_by_name',
            'assigned_at',
            'due_date',
            'status',
            'is_active',
            'teacher_notes',
            'child_ids',
            'submissions',
            'summary_stats',
        ]
        read_only_fields = ['id', 'assigned_at']

    def get_summary_stats(self, obj):
        total = obj.submissions.count()
        completed = obj.submissions.filter(status='COMPLETED').count()
        in_progress = obj.submissions.filter(status='IN_PROGRESS').count()
        not_started = obj.submissions.filter(status='NOT_STARTED').count()
        return {
            'total_students': total,
            'completed_count': completed,
            'in_progress_count': in_progress,
            'not_started_count': not_started,
            'completion_rate': int((completed / total * 100)) if total > 0 else 0,
        }


class TeacherFeedbackSerializer(serializers.Serializer):
    child_id = serializers.UUIDField()
    feedback = serializers.CharField(max_length=1000, allow_blank=False)

