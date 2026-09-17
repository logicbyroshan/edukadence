"""Core abstract model bases for EduKadence."""
import uuid
from django.db import models
from django.utils import timezone

class UUIDModel(models.Model):
    """Abstract model providing a UUID primary key."""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    class Meta:
        abstract = True

class TimeStampedModel(models.Model):
    """Abstract model providing automatic audit timestamps."""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class SoftDeletableModel(models.Model):
    """Abstract model providing soft-delete functionality where strictly appropriate."""
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])

class TenantAwareModel(UUIDModel, TimeStampedModel):
    """
    Abstract model establishing strict multi-tenant school isolation.
    All tenant-owned models MUST inherit from TenantAwareModel.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_set',
        db_index=True
    )

    class Meta:
        abstract = True
