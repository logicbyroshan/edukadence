"""Serializers for School management, memberships, and settings."""
from rest_framework import serializers
from apps.schools.models import School, SchoolMembership, AcademicYear, SchoolSetting
from apps.users.serializers import UserSerializer

class SchoolSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    current_academic_year = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = [
            'id',
            'name',
            'slug',
            'code',
            'logo_url',
            'email',
            'phone',
            'address',
            'timezone',
            'is_active',
            'members_count',
            'current_academic_year',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_members_count(self, obj):
        return obj.memberships.filter(is_active=True).count()

    def get_current_academic_year(self, obj):
        current_year = obj.academic_years.filter(is_current=True).first()
        if current_year:
            return {
                'id': current_year.id,
                'name': current_year.name,
                'start_date': current_year.start_date,
                'end_date': current_year.end_date
            }
        return None

class SchoolMembershipSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = SchoolMembership
        fields = [
            'id',
            'user',
            'user_details',
            'school',
            'school_name',
            'role',
            'is_default',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = [
            'id',
            'school',
            'name',
            'start_date',
            'end_date',
            'is_current',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        if attrs.get('start_date') and attrs.get('end_date'):
            if attrs['start_date'] >= attrs['end_date']:
                raise serializers.ValidationError('Start date must be before end date.')
        return attrs

    def save(self, **kwargs):
        # If this academic year is set to is_current=True, unset other academic years for the same school
        is_current = self.validated_data.get('is_current', False)
        school = self.validated_data.get('school') or (self.instance.school if self.instance else None)
        if is_current and school:
            AcademicYear.objects.filter(school=school, is_current=True).update(is_current=False)
        return super().save(**kwargs)

class SchoolSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSetting
        fields = [
            'id',
            'school',
            'key',
            'value',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
