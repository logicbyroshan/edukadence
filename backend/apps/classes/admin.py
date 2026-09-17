"""Django Admin registration for Classes app."""
from django.contrib import admin
from apps.classes.models import ClassLevel, Section, ClassTeacherAssignment, Enrollment

@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'school', 'order_index', 'is_active')
    list_filter = ('school', 'is_active')
    search_fields = ('name', 'code')

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'school', 'capacity', 'room_number', 'is_active')
    list_filter = ('school', 'class_level', 'is_active')
    search_fields = ('name', 'room_number')

@admin.register(ClassTeacherAssignment)
class ClassTeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'section', 'academic_year', 'is_primary')
    list_filter = ('school', 'academic_year', 'is_primary')
    search_fields = ('teacher__email', 'teacher__first_name', 'teacher__last_name')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('child', 'section', 'academic_year', 'status', 'roll_number')
    list_filter = ('school', 'academic_year', 'class_level', 'status')
    search_fields = ('child__first_name', 'child__last_name', 'child__admission_number', 'roll_number')
