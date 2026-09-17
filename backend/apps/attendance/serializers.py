"""Serializers for Attendance records."""
from rest_framework import serializers
from apps.attendance.models import DailyAttendance

class DailyAttendanceSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.full_name', read_only=True)
    child_admission_number = serializers.CharField(source='child.admission_number', read_only=True)
    child_photo_url = serializers.CharField(source='child.profile_photo_url', read_only=True)
    section_name = serializers.CharField(source='section.display_name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = DailyAttendance
        fields = [
            'id', 'school', 'child', 'child_name', 'child_admission_number',
            'child_photo_url', 'section', 'section_name', 'date', 'status',
            'check_in_time', 'check_out_time', 'recorded_by', 'recorded_by_name',
            'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

class BulkAttendanceItemSerializer(serializers.Serializer):
    child_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=DailyAttendance.STATUS_CHOICES, default='PRESENT')
    remarks = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    check_in_time = serializers.TimeField(required=False, allow_null=True, default=None)

class BulkAttendanceRequestSerializer(serializers.Serializer):
    section_id = serializers.UUIDField(required=False, allow_null=True)
    date = serializers.DateField()
    records = BulkAttendanceItemSerializer(many=True)
