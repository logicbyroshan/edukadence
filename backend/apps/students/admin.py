"""Django Admin for Students, Parents, and Pickups."""
from django.contrib import admin
from apps.students.models import (
    Child,
    Parent,
    ChildParentRelationship,
    AuthorizedPickupPerson,
    PickupRecord
)

class ChildParentInline(admin.TabularInline):
    model = ChildParentRelationship
    extra = 1

class AuthorizedPickupInline(admin.TabularInline):
    model = AuthorizedPickupPerson
    extra = 1

@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'admission_number', 'school', 'gender', 'date_of_birth', 'status')
    list_filter = ('school', 'status', 'gender')
    search_fields = ('first_name', 'last_name', 'admission_number')
    inlines = [ChildParentInline, AuthorizedPickupInline]

@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'school', 'relationship_type', 'phone', 'email', 'is_active')
    list_filter = ('school', 'relationship_type', 'is_active')
    search_fields = ('first_name', 'last_name', 'phone', 'email')

@admin.register(ChildParentRelationship)
class ChildParentRelationshipAdmin(admin.ModelAdmin):
    list_display = ('child', 'parent', 'relationship_type', 'is_primary_contact', 'can_pickup')
    list_filter = ('school', 'relationship_type', 'is_primary_contact', 'can_pickup')

@admin.register(AuthorizedPickupPerson)
class AuthorizedPickupPersonAdmin(admin.ModelAdmin):
    list_display = ('name', 'child', 'relationship', 'phone', 'is_active')
    list_filter = ('school', 'is_active')
    search_fields = ('name', 'phone', 'child__first_name')

@admin.register(PickupRecord)
class PickupRecordAdmin(admin.ModelAdmin):
    list_display = ('child', 'date', 'status', 'pickup_time', 'picked_up_by_name', 'pin_verified')
    list_filter = ('school', 'date', 'status', 'pin_verified')
    search_fields = ('child__first_name', 'picked_up_by_name')
