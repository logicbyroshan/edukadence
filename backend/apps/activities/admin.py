"""Django Admin for Activities."""
from django.contrib import admin
from apps.activities.models import ClassActivity

@admin.register(ClassActivity)
class ClassActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'school', 'section', 'category', 'activity_date', 'created_by', 'is_published')
    list_filter = ('school', 'category', 'activity_date', 'is_published')
    search_fields = ('title', 'description')
