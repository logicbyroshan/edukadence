"""Class, Section, and Enrollment domain models."""
from django.db import models
from django.conf import settings
from apps.core.models import TenantAwareModel

class ClassLevel(TenantAwareModel):
    """
    Grade or educational level within a school (e.g. Playgroup, Nursery, LKG, UKG, Class 1-5).
    Configurable per school.
    """
    name = models.CharField('Class Name', max_length=100, db_index=True)
    code = models.CharField('Class Code', max_length=32, blank=True, help_text='Short code, e.g. NUR, LKG, UKG')
    order_index = models.PositiveIntegerField('Sort Order', default=0)
    description = models.TextField('Description', blank=True)
    is_active = models.BooleanField('Active', default=True)

    class Meta:
        db_table = 'class_levels'
        verbose_name = 'Class Level'
        verbose_name_plural = 'Class Levels'
        ordering = ['order_index', 'name']
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'name'],
                name='unique_school_class_level_name'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.school.name})"

class Section(TenantAwareModel):
    """
    Specific classroom or cohort group under a class level (e.g. Nursery A, Nursery B).
    """
    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name='sections',
        db_index=True
    )
    name = models.CharField('Section Name', max_length=50, help_text='e.g. A, B, Bluebirds, Sunflowers')
    capacity = models.PositiveIntegerField('Max Student Capacity', default=25)
    room_number = models.CharField('Room / Area', max_length=64, blank=True)
    is_active = models.BooleanField('Active', default=True)

    class Meta:
        db_table = 'sections'
        verbose_name = 'Section'
        verbose_name_plural = 'Sections'
        ordering = ['class_level__order_index', 'name']
        constraints = [
            models.UniqueConstraint(
                fields=['class_level', 'name'],
                name='unique_class_level_section_name'
            )
        ]

    def __str__(self):
        return f"{self.class_level.name} - {self.name}"

    @property
    def display_name(self):
        return f"{self.class_level.name} {self.name}"

class ClassTeacherAssignment(TenantAwareModel):
    """
    Assigns an educator/teacher to a specific classroom section for an academic year.
    """
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='teacher_assignments',
        db_index=True
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='class_assignments',
        db_index=True
    )
    academic_year = models.ForeignKey(
        'schools.AcademicYear',
        on_delete=models.CASCADE,
        related_name='teacher_assignments',
        db_index=True
    )
    is_primary = models.BooleanField('Primary Class Lead Teacher', default=True)

    class Meta:
        db_table = 'class_teacher_assignments'
        verbose_name = 'Teacher Assignment'
        verbose_name_plural = 'Teacher Assignments'
        constraints = [
            models.UniqueConstraint(
                fields=['section', 'teacher', 'academic_year'],
                name='unique_section_teacher_year'
            )
        ]

    def __str__(self):
        return f"{self.teacher.full_name} -> {self.section.display_name} ({self.academic_year.name})"

class Enrollment(TenantAwareModel):
    """
    Historical and active enrollment record linking a child to a class/section for an academic year.
    Preserves child progression without overwriting historical data.
    """
    STATUS_CHOICES = (
        ('ACTIVE', 'Active Enrolled'),
        ('PROMOTED', 'Promoted to Next Grade'),
        ('TRANSFERRED', 'Transferred Section / School'),
        ('WITHDRAWN', 'Withdrawn / Left'),
    )

    child = models.ForeignKey(
        'students.Child',
        on_delete=models.CASCADE,
        related_name='enrollments',
        db_index=True
    )
    academic_year = models.ForeignKey(
        'schools.AcademicYear',
        on_delete=models.CASCADE,
        related_name='enrollments',
        db_index=True
    )
    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name='enrollments',
        db_index=True
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='enrollments',
        db_index=True
    )
    enrollment_date = models.DateField('Enrollment Date')
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='ACTIVE', db_index=True)
    roll_number = models.CharField('Roll Number / Identifier', max_length=32, blank=True)

    class Meta:
        db_table = 'enrollments'
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        ordering = ['-academic_year__start_date', 'roll_number']
        constraints = [
            models.UniqueConstraint(
                fields=['child', 'academic_year'],
                name='unique_child_academic_year_enrollment'
            )
        ]

    def __str__(self):
        return f"{self.child.full_name} - {self.section.display_name} ({self.academic_year.name})"
