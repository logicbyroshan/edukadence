"""Serializers for Class Activities and Moments."""
from rest_framework import serializers
from apps.activities.models import ClassActivity

class ClassActivitySerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    section_name = serializers.CharField(source='section.display_name', read_only=True)
    child_name = serializers.CharField(source='child.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ClassActivity
        fields = [
            'id', 'school', 'academic_year', 'class_level', 'class_level_name',
            'section', 'section_name', 'child', 'child_name', 'title',
            'description', 'activity_date', 'category', 'category_display',
            'media_urls', 'video_url', 'created_by', 'created_by_name',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']
