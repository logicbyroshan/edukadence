"""Serializers for Announcements."""
from rest_framework import serializers
from apps.communication.models import Announcement

class AnnouncementSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    section_name = serializers.CharField(source='section.display_name', read_only=True)
    child_name = serializers.CharField(source='child.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    audience_display = serializers.CharField(source='get_audience_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Announcement
        fields = [
            'id', 'school', 'title', 'message', 'audience_type',
            'audience_display', 'class_level', 'class_level_name',
            'section', 'section_name', 'child', 'child_name',
            'publish_date', 'expiry_date', 'is_pinned', 'priority',
            'priority_display', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']
