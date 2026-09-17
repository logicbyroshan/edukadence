"""Child, Parent, Relationship, Authorized Pickup, and Dismissal models."""
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import TenantAwareModel

class Child(TenantAwareModel):
    """
    Central child/student profile for early childhood and primary education (ages 2-10).
    """
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
        ('PREFER_NOT_TO_SAY', 'Prefer not to say'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Active Enrolled'),
        ('INACTIVE', 'Inactive / Paused'),
        ('GRADUATED', 'Graduated / Completed'),
        ('TRANSFERRED', 'Transferred Out'),
    )

    first_name = models.CharField('First Name', max_length=100, db_index=True)
    middle_name = models.CharField('Middle Name', max_length=100, blank=True)
    last_name = models.CharField('Last Name', max_length=100, db_index=True)
    preferred_name = models.CharField('Preferred / Nickname', max_length=100, blank=True)
    date_of_birth = models.DateField('Date of Birth')
    gender = models.CharField('Gender', max_length=20, choices=GENDER_CHOICES, default='PREFER_NOT_TO_SAY')
    admission_number = models.CharField('Admission / Student ID', max_length=64, db_index=True)
    admission_date = models.DateField('Admission Date', default=timezone.localdate)
    profile_photo_url = models.CharField('Profile Photo URL', max_length=500, blank=True)
    status = models.CharField('Enrollment Status', max_length=20, choices=STATUS_CHOICES, default='ACTIVE', db_index=True)
    
    # Health & Safety
    blood_group = models.CharField('Blood Group', max_length=10, blank=True)
    medical_notes = models.TextField('Allergies & Medical Notes', blank=True)
    emergency_contact_name = models.CharField('Emergency Contact Name', max_length=120, blank=True)
    emergency_contact_phone = models.CharField('Emergency Contact Phone', max_length=32, blank=True)
    
    # Internal notes
    notes = models.TextField('Staff Notes', blank=True)

    class Meta:
        db_table = 'children'
        verbose_name = 'Child'
        verbose_name_plural = 'Children'
        ordering = ['first_name', 'last_name']
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'admission_number'],
                name='unique_school_child_admission_number'
            )
        ]

    def __str__(self):
        return f"{self.full_name} ({self.admission_number})"

    @property
    def full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}".strip()
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def current_enrollment(self):
        """Returns the most recent active enrollment."""
        return self.enrollments.filter(status='ACTIVE').select_related('section__class_level', 'academic_year').first()


class Parent(TenantAwareModel):
    """
    Parent/Guardian profile. Can be linked to an authenticated user account
    and to multiple children (e.g. siblings).
    """
    RELATIONSHIP_CHOICES = (
        ('MOTHER', 'Mother'),
        ('FATHER', 'Father'),
        ('GUARDIAN', 'Legal Guardian'),
        ('OTHER', 'Other Family Member'),
    )

    COMMUNICATION_CHOICES = (
        ('IN_APP', 'In-App Portal'),
        ('WHATSAPP', 'WhatsApp'),
        ('SMS', 'SMS Text'),
        ('EMAIL', 'Email'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='parent_profiles',
        help_text='Associated login account if registered'
    )
    first_name = models.CharField('First Name', max_length=100)
    last_name = models.CharField('Last Name', max_length=100)
    relationship_type = models.CharField('Relationship', max_length=20, choices=RELATIONSHIP_CHOICES, default='MOTHER')
    phone = models.CharField('Phone Number', max_length=32, db_index=True)
    email = models.EmailField('Email Address', max_length=255, blank=True)
    occupation = models.CharField('Occupation', max_length=120, blank=True)
    address = models.TextField('Home Address', blank=True)
    preferred_communication = models.CharField(
        'Preferred Communication',
        max_length=20,
        choices=COMMUNICATION_CHOICES,
        default='IN_APP'
    )
    is_active = models.BooleanField('Active', default=True)

    class Meta:
        db_table = 'parents'
        verbose_name = 'Parent / Guardian'
        verbose_name_plural = 'Parents & Guardians'
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.full_name} ({self.get_relationship_type_display()}) - {self.phone}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class ChildParentRelationship(TenantAwareModel):
    """
    Many-to-Many junction between Child and Parent with rich metadata.
    Enables single parents, mothers, fathers, guardians, and multi-child families.
    """
    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name='parent_relationships',
        db_index=True
    )
    parent = models.ForeignKey(
        Parent,
        on_delete=models.CASCADE,
        related_name='child_relationships',
        db_index=True
    )
    relationship_type = models.CharField('Relationship', max_length=20, choices=Parent.RELATIONSHIP_CHOICES, default='MOTHER')
    is_primary_contact = models.BooleanField('Primary Emergency Contact', default=False)
    is_emergency_contact = models.BooleanField('Emergency Contact', default=True)
    can_pickup = models.BooleanField('Authorized for Daily Pickup', default=True)
    communication_authorized = models.BooleanField('Authorized for School Notices', default=True)

    class Meta:
        db_table = 'child_parent_relationships'
        verbose_name = 'Child Parent Relationship'
        verbose_name_plural = 'Child Parent Relationships'
        constraints = [
            models.UniqueConstraint(
                fields=['child', 'parent'],
                name='unique_child_parent_relationship'
            )
        ]

    def __str__(self):
        return f"{self.parent.full_name} ({self.relationship_type}) -> {self.child.full_name}"


class AuthorizedPickupPerson(TenantAwareModel):
    """
    Trusted third-party individuals authorized by parents/guardians to collect the child.
    Includes grandparents, authorized drivers, carpools, nannies, etc.
    """
    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name='authorized_pickups',
        db_index=True
    )
    name = models.CharField('Full Name', max_length=120)
    relationship = models.CharField('Relationship to Child', max_length=100, help_text='e.g. Grandfather, Driver, Babysitter')
    phone = models.CharField('Phone Number', max_length=32)
    photo_url = models.CharField('Photo URL', max_length=500, blank=True)
    identification_number = models.CharField('ID / License Number', max_length=64, blank=True)
    pickup_pin = models.CharField('Secret Pickup PIN', max_length=8, blank=True, help_text='4-6 digit numeric dismissal verification code')
    is_active = models.BooleanField('Authorization Active', default=True)
    notes = models.TextField('Authorization Notes / Restrictions', blank=True)

    class Meta:
        db_table = 'authorized_pickup_persons'
        verbose_name = 'Authorized Pickup Person'
        verbose_name_plural = 'Authorized Pickup Persons'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.relationship}) for {self.child.full_name}"


class PickupRecord(TenantAwareModel):
    """
    Daily child dismissal and safe handoff log.
    Ensures absolute safety and audit trail for early childhood dismissals.
    """
    STATUS_CHOICES = (
        ('WAITING', 'Waiting in Classroom / Care'),
        ('READY_FOR_PICKUP', 'Ready at Gate / Waiting Room'),
        ('PICKED_UP', 'Picked Up & Dismissed'),
    )

    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name='pickup_records',
        db_index=True
    )
    date = models.DateField('Date', default=timezone.localdate, db_index=True)
    pickup_time = models.DateTimeField('Dismissal Timestamp', null=True, blank=True)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='WAITING', db_index=True)
    authorized_person = models.ForeignKey(
        AuthorizedPickupPerson,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pickup_logs'
    )
    picked_up_by_name = models.CharField('Collector Name', max_length=120, blank=True)
    picked_up_by_relationship = models.CharField('Collector Relationship', max_length=100, blank=True)
    recorded_by_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_pickups'
    )
    pin_verified = models.BooleanField('PIN / Identity Verified', default=False)
    notes = models.TextField('Dismissal Remarks', blank=True)

    class Meta:
        db_table = 'pickup_records'
        verbose_name = 'Pickup Record'
        verbose_name_plural = 'Pickup Records'
        ordering = ['-date', '-pickup_time', 'child__first_name']
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'child', 'date'],
                name='unique_school_child_daily_pickup'
            )
        ]

    def __str__(self):
        return f"{self.child.full_name} [{self.get_status_display()}] on {self.date}"
