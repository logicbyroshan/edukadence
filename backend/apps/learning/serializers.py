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
