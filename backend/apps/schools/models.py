"""School, Membership, and Tenancy models for EduKadence."""
from django.db import models
from django.conf import settings
from apps.core.models import UUIDModel, TimeStampedModel

class School(UUIDModel, TimeStampedModel):
    """
    Tenant entity representing an individual small school, preschool, or kindergarten.
    """
    name = models.CharField('School Name', max_length=255, db_index=True)
    slug = models.SlugField('URL Slug', max_length=100, unique=True, db_index=True)
    code = models.CharField('School Code', max_length=32, unique=True, db_index=True, help_text='Short alphanumeric identifier, e.g. LSM-01')
    logo_url = models.URLField('School Logo URL', max_length=500, blank=True, null=True)
    email = models.EmailField('Contact Email', max_length=255, blank=True)
    phone = models.CharField('Contact Phone', max_length=32, blank=True)
    address = models.TextField('Physical Address', blank=True)
    timezone = models.CharField('Timezone', max_length=64, default='UTC')
    is_active = models.BooleanField('Active Status', default=True)

    class Meta:
        db_table = 'schools'
        verbose_name = 'School'
        verbose_name_plural = 'Schools'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

class SchoolMembership(UUIDModel, TimeStampedModel):
    """
    Associates a User with a School under a specific Role.
    A user can belong to multiple schools with different roles.
    """
    ROLE_CHOICES = (
        ('SUPER_ADMIN', 'Super Admin (Global)'),
        ('SCHOOL_ADMIN', 'School Admin / Principal'),
        ('TEACHER', 'Teacher / Educator'),
        ('PARENT', 'Parent / Guardian'),
        ('CHILD', 'Child / Kid Mode'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships',
        db_index=True
    )
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='memberships',
        db_index=True
    )
    role = models.CharField('Role', max_length=32, choices=ROLE_CHOICES, db_index=True)
    is_default = models.BooleanField('Default School Context', default=False)
    is_active = models.BooleanField('Active Membership', default=True)

    class Meta:
        db_table = 'school_memberships'
        verbose_name = 'School Membership'
        verbose_name_plural = 'School Memberships'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'school', 'role'],
                name='unique_user_school_role'
            )
        ]
        ordering = ['-is_default', 'school__name']

    def __str__(self):
        return f"{self.user} - {self.school.name} [{self.role}]"

class AcademicYear(UUIDModel, TimeStampedModel):
    """
    Academic operational period within an individual school.
    """
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='academic_years',
        db_index=True
    )
    name = models.CharField('Academic Year Name', max_length=64, help_text='e.g. 2026-2027')
    start_date = models.DateField('Start Date')
    end_date = models.DateField('End Date')
    is_current = models.BooleanField('Is Current Academic Year', default=False)

    class Meta:
        db_table = 'academic_years'
        verbose_name = 'Academic Year'
        verbose_name_plural = 'Academic Years'
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'name'],
                name='unique_school_academic_year'
            )
        ]
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.school.name} - {self.name} ({'Current' if self.is_current else 'Archived'})"

class SchoolSetting(UUIDModel, TimeStampedModel):
    """
    Customizable key-value JSON parameters for school configuration.
    """
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='settings',
        db_index=True
    )
    key = models.CharField('Setting Key', max_length=100, db_index=True)
    value = models.JSONField('Setting Value', default=dict)

    class Meta:
        db_table = 'school_settings'
        verbose_name = 'School Setting'
        verbose_name_plural = 'School Settings'
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'key'],
                name='unique_school_setting_key'
            )
        ]

    def __str__(self):
        return f"{self.school.name} - {self.key}"
