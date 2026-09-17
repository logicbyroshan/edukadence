"""Attendance models for daily child tracking."""
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import TenantAwareModel

class DailyAttendance(TenantAwareModel):
    """
    Daily attendance record for a child.
    Enforces uniqueness per school + child + date to prevent duplicate logs.
    """
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late Arrival'),
        ('EXCUSED', 'Excused / Leave'),
    )

    child = models.ForeignKey(
        'students.Child',
        on_delete=models.CASCADE,
        related_name='attendances',
        db_index=True
    )
    section = models.ForeignKey(
        'classes.Section',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attendances',
        db_index=True
    )
    date = models.DateField('Attendance Date', default=timezone.localdate, db_index=True)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='PRESENT', db_index=True)
    check_in_time = models.TimeField('Check-in Time', null=True, blank=True)
    check_out_time = models.TimeField('Check-out Time', null=True, blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_attendances'
    )
    remarks = models.CharField('Remarks / Note', max_length=255, blank=True)

    class Meta:
        db_table = 'daily_attendances'
        verbose_name = 'Daily Attendance'
        verbose_name_plural = 'Daily Attendances'
        ordering = ['-date', 'child__first_name']
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'child', 'date'],
                name='unique_school_child_daily_attendance'
            )
        ]

    def __str__(self):
        return f"{self.child.full_name} - {self.date}: {self.get_status_display()}"
