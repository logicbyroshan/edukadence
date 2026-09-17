"""Django Admin for Attendance."""
from django.contrib import admin
from apps.attendance.models import DailyAttendance

@admin.register(DailyAttendance)
class DailyAttendanceAdmin(admin.ModelAdmin):
    list_display = ('child', 'date', 'status', 'section', 'recorded_by', 'check_in_time')
    list_filter = ('school', 'date', 'status', 'section')
    search_fields = ('child__first_name', 'child__last_name', 'remarks')
