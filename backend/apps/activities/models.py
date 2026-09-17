"""Daily activities, classroom moments, and learning experiences."""
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import TenantAwareModel

class ClassActivity(TenantAwareModel):
    """
    Classroom activity, lesson moment, or daily milestone posted by teachers.
    Safe photo stream for young learners (ages 2-10).
    """
    CATEGORY_CHOICES = (
        ('ART', 'Art & Craft'),
        ('LEARNING', 'Early Literacy & Numeracy'),
        ('MUSIC', 'Music, Dance & Rhymes'),
        ('OUTDOOR', 'Outdoor & Physical Play'),
        ('STORY', 'Storytelling & Circle Time'),
        ('MEAL', 'Meal & Snack Time'),
        ('NAP', 'Nap & Quiet Rest'),
        ('OTHER', 'Special Event / Other'),
    )

    academic_year = models.ForeignKey(
        'schools.AcademicYear',
        on_delete=models.CASCADE,
        related_name='activities',
        db_index=True
    )
    class_level = models.ForeignKey(
        'classes.ClassLevel',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='activities',
        db_index=True
    )
    section = models.ForeignKey(
        'classes.Section',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='activities',
        db_index=True
    )
    child = models.ForeignKey(
        'students.Child',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='individual_activities',
        help_text='Optional: Specific to an individual child (e.g. birthday or individual milestone)'
    )
    title = models.CharField('Activity Title', max_length=150, db_index=True)
    description = models.TextField('Description / Story')
    activity_date = models.DateField('Activity Date', default=timezone.localdate, db_index=True)
    category = models.CharField('Category', max_length=20, choices=CATEGORY_CHOICES, default='LEARNING', db_index=True)
    media_urls = models.JSONField('Media / Photo URLs', default=list, blank=True)
    video_url = models.URLField('Video URL', max_length=500, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_activities'
    )
    is_published = models.BooleanField('Published to Parents', default=True)

    class Meta:
        db_table = 'class_activities'
        verbose_name = 'Class Activity'
        verbose_name_plural = 'Class Activities'
        ordering = ['-activity_date', '-created_at']

    def __str__(self):
        target = self.section.display_name if self.section else (self.class_level.name if self.class_level else 'School-wide')
        return f"{self.title} - {target} ({self.activity_date})"
