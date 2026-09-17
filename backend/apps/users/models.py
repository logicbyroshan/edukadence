"""Custom User model and manager for EduKadence."""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from apps.core.models import UUIDModel, TimeStampedModel

class UserManager(BaseUserManager):
    """Custom manager for the EduKadence User model."""

    def create_user(self, email=None, password=None, username=None, **extra_fields):
        if not email and not username:
            raise ValueError('A user must have either an email address or a username.')
        
        if email:
            email = self.normalize_email(email).lower()

        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email=email, password=password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, UUIDModel, TimeStampedModel):
    """
    Primary User model for EduKadence.
    Supports email authentication as well as username identification for children.
    """
    email = models.EmailField(
        'Email Address',
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        db_index=True
    )
    username = models.CharField(
        'Username',
        max_length=150,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text='Identifier for child or parent accounts without unique email'
    )
    first_name = models.CharField('First Name', max_length=150, blank=True)
    last_name = models.CharField('Last Name', max_length=150, blank=True)
    phone_number = models.CharField('Phone Number', max_length=32, blank=True, null=True, db_index=True)
    avatar = models.URLField('Avatar URL', max_length=500, blank=True, null=True)
    
    is_active = models.BooleanField('Active', default=True)
    is_staff = models.BooleanField('Staff Status', default=False)
    date_joined = models.DateTimeField('Date Joined', default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.email or self.username or str(self.id)

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else (self.email or self.username or 'EduKadence User')
