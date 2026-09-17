"""Serializers for Classes, Sections, Teacher Assignments, and Enrollments."""
from rest_framework import serializers
from apps.classes.models import ClassLevel, Section, ClassTeacherAssignment, Enrollment
from apps.schools.models import AcademicYear

class SectionSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    display_name = serializers.CharField(read_only=True)
    enrolled_count = serializers.SerializerMethodField()
    primary_teacher = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = [
            'id', 'school', 'class_level', 'class_level_name', 'name',
            'display_name', 'capacity', 'room_number', 'is_active',
            'enrolled_count', 'primary_teacher', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

    def get_enrolled_count(self, obj):
        return obj.enrollments.filter(status='ACTIVE').count()

    def get_primary_teacher(self, obj):
        assignment = obj.teacher_assignments.filter(is_primary=True).select_related('teacher').first()
        if assignment and assignment.teacher:
            return {
                'id': str(assignment.teacher.id),
                'name': assignment.teacher.full_name or assignment.teacher.username,
                'email': assignment.teacher.email,
            }
        return None

class ClassLevelSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    total_sections = serializers.SerializerMethodField()
    total_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = ClassLevel
        fields = [
            'id', 'school', 'name', 'code', 'order_index',
            'description', 'is_active', 'sections', 'total_sections',
            'total_enrolled', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

    def get_total_sections(self, obj):
        return obj.sections.filter(is_active=True).count()

    def get_total_enrolled(self, obj):
        return obj.enrollments.filter(status='ACTIVE').count()

class ClassTeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    teacher_email = serializers.CharField(source='teacher.email', read_only=True)
    section_name = serializers.CharField(source='section.display_name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = ClassTeacherAssignment
        fields = [
            'id', 'school', 'section', 'section_name', 'teacher',
            'teacher_name', 'teacher_email', 'academic_year',
            'academic_year_name', 'is_primary', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.full_name', read_only=True)
    child_admission_number = serializers.CharField(source='child.admission_number', read_only=True)
    child_gender = serializers.CharField(source='child.gender', read_only=True)
    child_photo_url = serializers.CharField(source='child.profile_photo_url', read_only=True)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    section_display_name = serializers.CharField(source='section.display_name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'school', 'child', 'child_name', 'child_admission_number',
            'child_gender', 'child_photo_url', 'academic_year', 'academic_year_name',
            'class_level', 'class_level_name', 'section', 'section_name',
            'section_display_name', 'enrollment_date', 'status', 'roll_number',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']
