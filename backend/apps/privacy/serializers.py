"""
DRF Serializers for Privacy, Consent, Data Rights, Grievances, and Incident Response.
"""
from rest_framework import serializers
from apps.privacy.models import (
    PrivacyNotice, ConsentPurpose, ConsentRecord, DataPrincipalRequest,
    DataPrincipalNomination, PrivacyGrievance, DataBreachIncident,
    DataRetentionPolicy, PrivacyAuditLog
)


class PrivacyNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyNotice
        fields = [
            'id', 'version', 'title', 'effective_date', 'summary',
            'itemized_purposes', 'child_safeguards_statement',
            'grievance_officer_name', 'grievance_officer_email', 'grievance_officer_phone',
            'grievance_officer_address', 'dpo_applicable', 'dpo_name', 'dpo_email',
            'is_active', 'created_at'
        ]


class ConsentPurposeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentPurpose
        fields = [
            'id', 'code', 'name', 'category', 'description',
            'data_fields_collected', 'is_mandatory', 'default_granted',
            'order_index', 'is_active'
        ]


class ConsentRecordSerializer(serializers.ModelSerializer):
    purpose_details = ConsentPurposeSerializer(source='purpose', read_only=True)
    child_name = serializers.ReadOnlyField(source='child.full_name')

    class Meta:
        model = ConsentRecord
        fields = [
            'id', 'school', 'user', 'child', 'child_name', 'purpose', 'purpose_details',
            'notice', 'status', 'verification_method', 'granted_at',
            'withdrawn_at', 'revocation_reason', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'school', 'granted_at', 'withdrawn_at', 'created_at']


class ConsentActionSerializer(serializers.Serializer):
    purpose_id = serializers.UUIDField(required=True)
    child_id = serializers.UUIDField(required=False, allow_null=True)
    status = serializers.ChoiceField(choices=['GRANTED', 'WITHDRAWN', 'DENIED'], default='GRANTED')
    revocation_reason = serializers.CharField(required=False, allow_blank=True, default='')
    verification_method = serializers.CharField(required=False, default='PORTAL_ACTION')


class DataPrincipalRequestSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.full_name')
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = DataPrincipalRequest
        fields = [
            'id', 'school', 'reference_number', 'user', 'user_name', 'user_email',
            'child', 'child_name', 'request_type', 'status', 'details',
            'submitted_at', 'acknowledged_at', 'deadline_at', 'completed_at',
            'assigned_to', 'resolution_notes', 'result_package'
        ]
        read_only_fields = [
            'id', 'school', 'reference_number', 'user', 'submitted_at',
            'acknowledged_at', 'deadline_at', 'completed_at'
        ]


class DataPrincipalRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataPrincipalRequest
        fields = ['child', 'request_type', 'details']


class DataPrincipalNominationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataPrincipalNomination
        fields = [
            'id', 'school', 'user', 'nominee_name', 'nominee_relationship',
            'nominee_phone', 'nominee_email', 'nominee_address',
            'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'user', 'created_at', 'updated_at']


class PrivacyGrievanceSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = PrivacyGrievance
        fields = [
            'id', 'school', 'grievance_number', 'user', 'user_name', 'user_email',
            'category', 'subject', 'description', 'status',
            'submitted_at', 'target_resolution_date', 'resolved_at',
            'assigned_officer', 'resolution_summary'
        ]
        read_only_fields = [
            'id', 'school', 'grievance_number', 'user', 'submitted_at',
            'target_resolution_date', 'resolved_at'
        ]


class PrivacyGrievanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyGrievance
        fields = ['category', 'subject', 'description']


class DataBreachIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataBreachIncident
        fields = [
            'id', 'school', 'incident_number', 'title', 'description', 'severity',
            'affected_categories', 'estimated_affected_count', 'detected_at',
            'contained_at', 'dpbi_status', 'dpbi_notified_at',
            'principals_status', 'principals_notified_at',
            'containment_measures', 'post_incident_review',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'incident_number', 'created_at', 'updated_at']


class DataRetentionPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = DataRetentionPolicy
        fields = [
            'id', 'data_category', 'category_name', 'purpose',
            'retention_period_days', 'statutory_justification',
            'deletion_method', 'is_active', 'created_at', 'updated_at'
        ]


class PrivacyAuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source='actor.full_name')

    class Meta:
        model = PrivacyAuditLog
        fields = [
            'id', 'school', 'actor', 'actor_name', 'action',
            'target_resource', 'details', 'timestamp'
        ]
