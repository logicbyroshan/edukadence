"""Serializers for Child, Parent, Relationships, Pickups, and Dismissals."""
from rest_framework import serializers
from apps.students.models import (
    Child,
    Parent,
    ChildParentRelationship,
    AuthorizedPickupPerson,
    PickupRecord
)

class AuthorizedPickupPersonSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.full_name', read_only=True)

    class Meta:
        model = AuthorizedPickupPerson
        fields = [
            'id', 'school', 'child', 'child_name', 'name', 'relationship',
            'phone', 'photo_url', 'identification_number', 'pickup_pin',
            'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

class PickupRecordSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.full_name', read_only=True)
    child_admission_number = serializers.CharField(source='child.admission_number', read_only=True)
    child_photo_url = serializers.CharField(source='child.profile_photo_url', read_only=True)
    class_section = serializers.SerializerMethodField()
    recorded_by_name = serializers.CharField(source='recorded_by_staff.full_name', read_only=True)

    class Meta:
        model = PickupRecord
        fields = [
            'id', 'school', 'child', 'child_name', 'child_admission_number',
            'child_photo_url', 'class_section', 'date', 'pickup_time',
            'status', 'authorized_person', 'picked_up_by_name',
            'picked_up_by_relationship', 'recorded_by_staff', 'recorded_by_name',
            'pin_verified', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

    def get_class_section(self, obj):
        enrollment = obj.child.enrollments.filter(status='ACTIVE').select_related('section').first()
        if enrollment and enrollment.section:
            return enrollment.section.display_name
        return "Not Assigned"

class ChildParentRelationshipSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.full_name', read_only=True)
    parent_phone = serializers.CharField(source='parent.phone', read_only=True)
    parent_email = serializers.CharField(source='parent.email', read_only=True)
    parent_occupation = serializers.CharField(source='parent.occupation', read_only=True)
    child_name = serializers.CharField(source='child.full_name', read_only=True)

    class Meta:
        model = ChildParentRelationship
        fields = [
            'id', 'school', 'child', 'child_name', 'parent', 'parent_name',
            'parent_phone', 'parent_email', 'parent_occupation',
            'relationship_type', 'is_primary_contact', 'is_emergency_contact',
            'can_pickup', 'communication_authorized', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

class ParentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    children = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Parent
        fields = [
            'id', 'school', 'user', 'user_email', 'first_name', 'last_name',
            'full_name', 'relationship_type', 'phone', 'email', 'occupation',
            'address', 'preferred_communication', 'is_active', 'children',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

    def get_children(self, obj):
        relationships = obj.child_relationships.select_related('child').all()
        return [
            {
                'id': str(rel.child.id),
                'name': rel.child.full_name,
                'admission_number': rel.child.admission_number,
                'relationship_type': rel.relationship_type,
                'is_primary_contact': rel.is_primary_contact,
                'status': rel.child.status,
            }
            for rel in relationships
        ]

class ChildListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    current_class = serializers.SerializerMethodField()
    primary_parent = serializers.SerializerMethodField()

    class Meta:
        model = Child
        fields = [
            'id', 'school', 'first_name', 'middle_name', 'last_name', 'full_name',
            'preferred_name', 'date_of_birth', 'gender', 'admission_number',
            'admission_date', 'profile_photo_url', 'status', 'blood_group',
            'emergency_contact_name', 'emergency_contact_phone', 'current_class',
            'primary_parent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

    def get_current_class(self, obj):
        enrollment = obj.enrollments.filter(status='ACTIVE').select_related('section__class_level').first()
        if enrollment:
            return {
                'enrollment_id': str(enrollment.id),
                'class_level': enrollment.class_level.name if enrollment.class_level else '',
                'section': enrollment.section.name if enrollment.section else '',
                'display_name': enrollment.section.display_name if enrollment.section else '',
                'roll_number': enrollment.roll_number,
            }
        return None

    def get_primary_parent(self, obj):
        rel = obj.parent_relationships.filter(is_primary_contact=True).select_related('parent').first()
        if not rel:
            rel = obj.parent_relationships.select_related('parent').first()
        if rel and rel.parent:
            return {
                'id': str(rel.parent.id),
                'name': rel.parent.full_name,
                'relationship': rel.relationship_type,
                'phone': rel.parent.phone,
            }
        return None

class ChildDetailSerializer(ChildListSerializer):
    parents = serializers.SerializerMethodField()
    authorized_pickups = AuthorizedPickupPersonSerializer(many=True, read_only=True)
    today_pickup_status = serializers.SerializerMethodField()

    class Meta(ChildListSerializer.Meta):
        fields = ChildListSerializer.Meta.fields + [
            'medical_notes', 'notes', 'parents', 'authorized_pickups', 'today_pickup_status'
        ]

    def get_parents(self, obj):
        relationships = obj.parent_relationships.select_related('parent').all()
        return [
            {
                'relationship_id': str(rel.id),
                'parent_id': str(rel.parent.id),
                'name': rel.parent.full_name,
                'relationship_type': rel.relationship_type,
                'phone': rel.parent.phone,
                'email': rel.parent.email,
                'is_primary_contact': rel.is_primary_contact,
                'is_emergency_contact': rel.is_emergency_contact,
                'can_pickup': rel.can_pickup,
                'communication_authorized': rel.communication_authorized,
            }
            for rel in relationships
        ]

    def get_today_pickup_status(self, obj):
        from django.utils import timezone
        today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
        record = obj.pickup_records.filter(date=today).first()
        if record:
            return {
                'id': str(record.id),
                'status': record.status,
                'picked_up_by_name': record.picked_up_by_name,
                'pickup_time': record.pickup_time,
                'pin_verified': record.pin_verified,
            }
        return {'status': 'WAITING', 'id': None}
