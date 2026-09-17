from django.contrib import admin
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


@admin.register(LearningLevel)
class LearningLevelAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'min_age', 'max_age', 'order_index', 'is_active']
    ordering = ['order_index']


@admin.register(LearningArea)
class LearningAreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'order_index', 'is_active']
    ordering = ['order_index']


@admin.register(LearningTopic)
class LearningTopicAdmin(admin.ModelAdmin):
    list_display = ['name', 'learning_area', 'learning_level', 'code', 'order_index', 'is_active']
    list_filter = ['learning_area', 'learning_level']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'activity_type', 'learning_level', 'learning_area', 'difficulty', 'star_reward', 'status', 'is_global']
    list_filter = ['activity_type', 'learning_level', 'learning_area', 'status', 'is_global']
    search_fields = ['title', 'description']


@admin.register(ActivityAttempt)
class ActivityAttemptAdmin(admin.ModelAdmin):
    list_display = ['child', 'activity', 'is_completed', 'score', 'stars_awarded', 'started_at']
    list_filter = ['is_completed', 'activity__activity_type']
    search_fields = ['child__first_name', 'child__last_name', 'activity__title']


@admin.register(LearningProgress)
class LearningProgressAdmin(admin.ModelAdmin):
    list_display = ['child', 'learning_area', 'topic', 'activities_completed_count', 'total_stars_earned', 'mastery_percentage']
    list_filter = ['learning_area']


@admin.register(RewardBadge)
class RewardBadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'badge_type', 'required_count', 'is_active']


@admin.register(ChildBadge)
class ChildBadgeAdmin(admin.ModelAdmin):
    list_display = ['child', 'badge', 'earned_at']


class StorySceneInline(admin.TabularInline):
    model = StoryScene
    extra = 1


@admin.register(InteractiveStory)
class InteractiveStoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'learning_level', 'author', 'star_reward', 'status']
    inlines = [StorySceneInline]


@admin.register(CuratedVideo)
class CuratedVideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'learning_level', 'learning_area', 'duration_seconds', 'status']


@admin.register(ActivityAssignment)
class ActivityAssignmentAdmin(admin.ModelAdmin):
    list_display = ['activity', 'class_level', 'section', 'child', 'assigned_by', 'due_date', 'is_active']
