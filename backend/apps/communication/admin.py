"""Django Admin for Communication."""
from django.contrib import admin
from apps.communication.models import Announcement

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'school', 'audience_type', 'priority', 'publish_date', 'is_pinned')
    list_filter = ('school', 'audience_type', 'priority', 'is_pinned', 'publish_date')
    search_fields = ('title', 'message')
