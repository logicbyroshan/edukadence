from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import UUIDModel, TimeStampedModel, TenantAwareModel


class LearningLevel(UUIDModel, TimeStampedModel):
    """
    Developmental stages defining the child learning journey (Ages 2-10).
    """
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    min_age = models.DecimalField(max_digits=3, decimal_places=1, default=2.0)
    max_age = models.DecimalField(max_digits=3, decimal_places=1, default=3.0)
    description = models.TextField(blank=True, default='')
    order_index = models.PositiveIntegerField(default=1)
    color_theme = models.CharField(max_length=50, default='emerald')
    icon_name = models.CharField(max_length=50, default='Sparkles')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'learning_levels'
        ordering = ['order_index']
        verbose_name = 'Learning Level'
        verbose_name_plural = 'Learning Levels'

    def __str__(self):
        return f"{self.name} (Age {self.min_age}–{self.max_age})"


class LearningArea(UUIDModel, TimeStampedModel):
    """
    Curriculum domains (Alphabet, Numbers, Shapes, Stories, Science, etc.).
    """
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    icon_name = models.CharField(max_length=50, default='BookOpen')
    order_index = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'learning_areas'
        ordering = ['order_index']
        verbose_name = 'Learning Area'
        verbose_name_plural = 'Learning Areas'

    def __str__(self):
        return self.name


class LearningTopic(UUIDModel, TimeStampedModel):
    """
    Specific learning topics under an area (e.g. Counting 1-10, Phonics A-F).
    """
    learning_area = models.ForeignKey(LearningArea, on_delete=models.CASCADE, related_name='topics')
    learning_level = models.ForeignKey(LearningLevel, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, db_index=True)
    description = models.TextField(blank=True, default='')
    order_index = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'learning_topics'
        ordering = ['order_index']
        unique_together = ['learning_area', 'learning_level', 'code']
        verbose_name = 'Learning Topic'
        verbose_name_plural = 'Learning Topics'

    def __str__(self):
        return f"{self.name} ({self.learning_level.name})"


class ActivityType(models.TextChoices):
    TAP_CHOOSE = 'TAP_CHOOSE', 'Tap & Choose'
    MATCH = 'MATCH', 'Match Pairs'
    DRAG_DROP = 'DRAG_DROP', 'Drag & Drop'
    SORT = 'SORT', 'Sort & Classify'
    COUNT = 'COUNT', 'Visual Counting'
    SEQUENCE = 'SEQUENCE', 'Sequence & Ordering'
    MEMORY = 'MEMORY', 'Memory Card Flip'
    TRACE = 'TRACE', 'Trace Lines & Letters'
    COLOR = 'COLOR', 'Color & Paint'
    QUIZ = 'QUIZ', 'Interactive Quiz'
    STORY = 'STORY', 'Story Interaction'
    VIDEO = 'VIDEO', 'Curated Video Activity'


class DifficultyLevel(models.TextChoices):
    EASY = 'EASY', 'Easy (Level 1)'
    MEDIUM = 'MEDIUM', 'Medium (Level 2)'
    HARD = 'HARD', 'Challenging (Level 3)'


class ContentStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PUBLISHED = 'PUBLISHED', 'Published'
    ARCHIVED = 'ARCHIVED', 'Archived'


class Activity(UUIDModel, TimeStampedModel):
    """
    Core interactive learning activity model supporting 12 data-driven types.
    Can be globally provided by EduKadence or customized per school.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='custom_activities'
    )
    is_global = models.BooleanField(default=True, db_index=True)
    learning_level = models.ForeignKey(LearningLevel, on_delete=models.CASCADE, related_name='activities')
    learning_area = models.ForeignKey(LearningArea, on_delete=models.CASCADE, related_name='activities')
    topic = models.ForeignKey(LearningTopic, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    activity_type = models.CharField(max_length=50, choices=ActivityType.choices, default=ActivityType.TAP_CHOOSE, db_index=True)
    difficulty = models.CharField(max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.EASY)
    estimated_duration_minutes = models.PositiveIntegerField(default=5)
    star_reward = models.PositiveIntegerField(default=1)

    thumbnail_url = models.CharField(max_length=500, blank=True, default='')
    media_asset_url = models.CharField(max_length=500, blank=True, default='')
    audio_instruction_url = models.CharField(max_length=500, blank=True, default='')

    content = models.JSONField(default=dict, blank=True, help_text="Structured payload for the activity renderer")
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.PUBLISHED, db_index=True)
    order_index = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'learning_activities'
        ordering = ['learning_level__order_index', 'order_index']
        verbose_name = 'Learning Activity'
        verbose_name_plural = 'Learning Activities'
        indexes = [
            models.Index(fields=['learning_level', 'status']),
            models.Index(fields=['learning_area', 'status']),
            models.Index(fields=['activity_type', 'status']),
        ]

    def __str__(self):
        return f"[{self.get_activity_type_display()}] {self.title} ({self.learning_level.name})"


class ActivityAttempt(UUIDModel, TimeStampedModel):
    """
    Tracks individual activity attempts by children with server-evaluated rewards.
    """
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='activity_attempts', null=True, blank=True)
    child = models.ForeignKey('students.Child', on_delete=models.CASCADE, related_name='activity_attempts')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='attempts')

    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    score = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    total_count = models.IntegerField(default=0)
    stars_awarded = models.IntegerField(default=0)

    answer_metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'learning_activity_attempts'
        ordering = ['-created_at']
        verbose_name = 'Activity Attempt'
        verbose_name_plural = 'Activity Attempts'
        indexes = [
            models.Index(fields=['child', 'is_completed']),
            models.Index(fields=['activity', 'is_completed']),
        ]

    def __str__(self):
        return f"{self.child.full_name} - {self.activity.title} ({'Done' if self.is_completed else 'Started'})"


class LearningProgress(UUIDModel, TimeStampedModel):
    """
    Aggregate topic/area progress and mastery tracker per child.
    """
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='learning_progress')
    child = models.ForeignKey('students.Child', on_delete=models.CASCADE, related_name='learning_progress')
    learning_area = models.ForeignKey(LearningArea, on_delete=models.CASCADE, related_name='progress_records')
    topic = models.ForeignKey(LearningTopic, on_delete=models.CASCADE, null=True, blank=True, related_name='progress_records')

    activities_completed_count = models.PositiveIntegerField(default=0)
    total_stars_earned = models.PositiveIntegerField(default=0)
    mastery_percentage = models.PositiveIntegerField(default=0)
    last_activity_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'learning_progress'
        unique_together = ['child', 'learning_area', 'topic']
        ordering = ['-last_activity_at']
        verbose_name = 'Learning Progress'
        verbose_name_plural = 'Learning Progress'

    def __str__(self):
        return f"{self.child.full_name} - {self.learning_area.name} ({self.mastery_percentage}%)"


class LearningSession(UUIDModel, TimeStampedModel):
    """
    Session logger for Kid Mode usage.
    """
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='learning_sessions')
    child = models.ForeignKey('students.Child', on_delete=models.CASCADE, related_name='learning_sessions')
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    activities_attempted_count = models.PositiveIntegerField(default=0)
    stars_earned = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'learning_sessions'
        ordering = ['-started_at']
        verbose_name = 'Learning Session'
        verbose_name_plural = 'Learning Sessions'


class RewardBadge(UUIDModel, TimeStampedModel):
    """
    Data-driven achievements unlocked by learning milestones.
    """
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    icon_name = models.CharField(max_length=50, default='Trophy')
    badge_type = models.CharField(max_length=50, default='STAR_MILESTONE')
    required_count = models.PositiveIntegerField(default=10)
    color_accent = models.CharField(max_length=50, default='amber')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'reward_badges'
        ordering = ['required_count']
        verbose_name = 'Reward Badge'
        verbose_name_plural = 'Reward Badges'

    def __str__(self):
        return f"🏆 {self.name}"


class ChildBadge(UUIDModel, TimeStampedModel):
    """
    Badges earned by a specific child.
    """
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='child_badges')
    child = models.ForeignKey('students.Child', on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(RewardBadge, on_delete=models.CASCADE, related_name='awarded_to')
    earned_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'child_badges'
        unique_together = ['child', 'badge']
        ordering = ['-earned_at']
        verbose_name = 'Child Badge'
        verbose_name_plural = 'Child Badges'

    def __str__(self):
        return f"{self.child.full_name} earned {self.badge.name}"


class InteractiveStory(UUIDModel, TimeStampedModel):
    """
    Curated interactive storybook library for children.
    """
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, null=True, blank=True, related_name='custom_stories')
    learning_level = models.ForeignKey(LearningLevel, on_delete=models.CASCADE, related_name='stories')
    title = models.CharField(max_length=200)
    synopsis = models.TextField(blank=True, default='')
    cover_image_url = models.CharField(max_length=500, blank=True, default='')
    author = models.CharField(max_length=100, default='EduKadence Story Lab')
    estimated_reading_minutes = models.PositiveIntegerField(default=5)
    star_reward = models.PositiveIntegerField(default=3)
    is_global = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.PUBLISHED)

    class Meta:
        db_table = 'interactive_stories'
        ordering = ['learning_level__order_index', 'title']
        verbose_name = 'Interactive Story'
        verbose_name_plural = 'Interactive Stories'

    def __str__(self):
        return f"📖 {self.title} ({self.learning_level.name})"


class StoryScene(UUIDModel, TimeStampedModel):
    """
    Individual scene/page within an interactive story.
    """
    story = models.ForeignKey(InteractiveStory, on_delete=models.CASCADE, related_name='scenes')
    scene_number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=150, blank=True, default='')
    text_content = models.TextField()
    illustration_url = models.CharField(max_length=500, blank=True, default='')
    audio_narration_url = models.CharField(max_length=500, blank=True, default='')
    checkpoint_prompt = models.JSONField(default=dict, blank=True, help_text="Optional comprehension prompt at scene end")

    class Meta:
        db_table = 'story_scenes'
        ordering = ['scene_number']
        unique_together = ['story', 'scene_number']
        verbose_name = 'Story Scene'
        verbose_name_plural = 'Story Scenes'

    def __str__(self):
        return f"{self.story.title} - Scene {self.scene_number}"


class CuratedVideo(UUIDModel, TimeStampedModel):
    """
    Curated safe educational video library.
    """
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, null=True, blank=True, related_name='custom_videos')
    learning_level = models.ForeignKey(LearningLevel, on_delete=models.CASCADE, related_name='videos')
    learning_area = models.ForeignKey(LearningArea, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    duration_seconds = models.PositiveIntegerField(default=180)
    thumbnail_url = models.CharField(max_length=500, blank=True, default='')
    video_url = models.CharField(max_length=500, blank=True, default='')
    checkpoint_question = models.JSONField(default=dict, blank=True)
    is_global = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.PUBLISHED)

    class Meta:
        db_table = 'curated_videos'
        ordering = ['title']
        verbose_name = 'Curated Video'
        verbose_name_plural = 'Curated Videos'

    def __str__(self):
        return f"🎬 {self.title}"


class ActivityAssignment(UUIDModel, TimeStampedModel):
    """
    Teacher/School assignment of learning activities to classes, sections, or individual children.
    """
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='learning_assignments')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='assignments')
    class_level = models.ForeignKey('classes.ClassLevel', on_delete=models.CASCADE, null=True, blank=True, related_name='learning_assignments')
    section = models.ForeignKey('classes.Section', on_delete=models.CASCADE, null=True, blank=True, related_name='learning_assignments')
    child = models.ForeignKey('students.Child', on_delete=models.CASCADE, null=True, blank=True, related_name='learning_assignments')
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='assigned_learning_tasks')
    assigned_at = models.DateTimeField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    instructions = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'learning_assignments'
        ordering = ['-assigned_at']
        verbose_name = 'Activity Assignment'
        verbose_name_plural = 'Activity Assignments'
