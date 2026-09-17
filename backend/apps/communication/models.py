"""Announcements and structured parent notices."""
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import TenantAwareModel

class Announcement(TenantAwareModel):
    """
    School-wide, class-level, or section-specific announcement / bulletin.
    """
    AUDIENCE_CHOICES = (
        ('ALL_SCHOOL', 'Whole School (All Parents & Staff)'),
        ('CLASS_LEVEL', 'Specific Grade Level'),
        ('SECTION', 'Specific Classroom Section'),
        ('INDIVIDUAL_CHILD', 'Specific Child / Family Notice'),
    )

    PRIORITY_CHOICES = (
        ('LOW', 'Low / Information'),
        ('NORMAL', 'Normal / General'),
        ('HIGH', 'Important'),
        ('URGENT', 'Urgent / Emergency'),
    )

    title = models.CharField('Announcement Title', max_length=200, db_index=True)
    message = models.TextField('Message Body')
    audience_type = models.CharField('Audience Scope', max_length=20, choices=AUDIENCE_CHOICES, default='ALL_SCHOOL', db_index=True)
    class_level = models.ForeignKey(
        'classes.ClassLevel',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcements'
    )
    section = models.ForeignKey(
        'classes.Section',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcements'
    )
    child = models.ForeignKey(
        'students.Child',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcements'
    )
    publish_date = models.DateField('Publish Date', default=timezone.localdate, db_index=True)
    expiry_date = models.DateField('Expiry Date', null=True, blank=True)
    is_pinned = models.BooleanField('Pin to Top', default=False)
    priority = models.CharField('Priority Level', max_length=20, choices=PRIORITY_CHOICES, default='NORMAL')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_announcements'
    )

    class Meta:
        db_table = 'announcements'
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
        ordering = ['-is_pinned', '-publish_date', '-created_at']

    def __str__(self):
        return f"[{self.get_priority_display()}] {self.title} ({self.get_audience_type_display()})"
