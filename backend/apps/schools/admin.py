"""Django admin registrations for Schools and Memberships."""
from django.contrib import admin
from apps.schools.models import School, SchoolMembership, AcademicYear, SchoolSetting

class AcademicYearInline(admin.TabularInline):
    model = AcademicYear
    extra = 1

class SchoolSettingInline(admin.TabularInline):
    model = SchoolSetting
    extra = 1

class SchoolMembershipInline(admin.TabularInline):
    model = SchoolMembership
    extra = 1
    raw_id_fields = ('user',)

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'slug', 'email', 'phone', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'code', 'slug', 'email')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [AcademicYearInline, SchoolSettingInline, SchoolMembershipInline]

@admin.register(SchoolMembership)
class SchoolMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'school', 'role', 'is_default', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_default')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'school__name')
    raw_id_fields = ('user', 'school')

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('school', 'name', 'start_date', 'end_date', 'is_current')
    list_filter = ('is_current',)
    search_fields = ('school__name', 'name')

@admin.register(SchoolSetting)
class SchoolSettingAdmin(admin.ModelAdmin):
    list_display = ('school', 'key')
    search_fields = ('school__name', 'key')
