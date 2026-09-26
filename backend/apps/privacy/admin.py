"""
Django Admin registrations for DPDP Privacy Models.
"""
from django.contrib import admin
from apps.privacy.models import (
    PrivacyNotice, ConsentPurpose, ConsentRecord, DataPrincipalRequest,
    DataPrincipalNomination, PrivacyGrievance, DataBreachIncident,
    DataRetentionPolicy, PrivacyAuditLog
)


@admin.register(PrivacyNotice)
class PrivacyNoticeAdmin(admin.ModelAdmin):
    list_display = ('version', 'title', 'effective_date', 'is_active', 'grievance_officer_name', 'created_at')
    list_filter = ('is_active', 'effective_date')
    search_fields = ('version', 'title', 'summary')


@admin.register(ConsentPurpose)
class ConsentPurposeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'is_mandatory', 'default_granted', 'order_index', 'is_active')
    list_filter = ('category', 'is_mandatory', 'is_active')
    search_fields = ('code', 'name', 'description')


@admin.register(ConsentRecord)
class ConsentRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'child', 'purpose', 'status', 'verification_method', 'granted_at', 'withdrawn_at')
    list_filter = ('status', 'verification_method', 'purpose')
    search_fields = ('user__email', 'user__first_name', 'child__first_name')


@admin.register(DataPrincipalRequest)
class DataPrincipalRequestAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'user', 'child', 'request_type', 'status', 'submitted_at', 'deadline_at', 'completed_at')
    list_filter = ('request_type', 'status')
    search_fields = ('reference_number', 'user__email', 'user__first_name', 'details')


@admin.register(DataPrincipalNomination)
class DataPrincipalNominationAdmin(admin.ModelAdmin):
    list_display = ('user', 'nominee_name', 'nominee_relationship', 'nominee_phone', 'nominee_email', 'is_active')
    list_filter = ('is_active', 'nominee_relationship')
    search_fields = ('user__email', 'nominee_name', 'nominee_email')


@admin.register(PrivacyGrievance)
class PrivacyGrievanceAdmin(admin.ModelAdmin):
    list_display = ('grievance_number', 'user', 'category', 'subject', 'status', 'submitted_at', 'target_resolution_date', 'resolved_at')
    list_filter = ('category', 'status')
    search_fields = ('grievance_number', 'user__email', 'subject', 'description')


@admin.register(DataBreachIncident)
class DataBreachIncidentAdmin(admin.ModelAdmin):
    list_display = ('incident_number', 'title', 'severity', 'dpbi_status', 'principals_status', 'detected_at', 'contained_at')
    list_filter = ('severity', 'dpbi_status', 'principals_status')
    search_fields = ('incident_number', 'title', 'description')


@admin.register(DataRetentionPolicy)
class DataRetentionPolicyAdmin(admin.ModelAdmin):
    list_display = ('category_name', 'data_category', 'retention_period_days', 'deletion_method', 'is_active')
    list_filter = ('deletion_method', 'is_active')
    search_fields = ('category_name', 'data_category', 'statutory_justification')


@admin.register(PrivacyAuditLog)
class PrivacyAuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'target_resource', 'actor', 'school', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('target_resource', 'actor__email')
    readonly_fields = ('timestamp',)
