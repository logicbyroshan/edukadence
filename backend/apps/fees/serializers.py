"""Serializers for Fee Structures, Invoices/Dues, and Payment Receipts."""
from rest_framework import serializers
from decimal import Decimal
from apps.fees.models import FeeStructure, StudentFeeItem, FeePayment

class FeeStructureSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = FeeStructure
        fields = [
            'id', 'school', 'academic_year', 'academic_year_name', 'class_level',
            'class_level_name', 'name', 'fee_type', 'amount', 'frequency',
            'due_day', 'is_active', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'created_at', 'updated_at']

class StudentFeeItemSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.full_name', read_only=True)
    child_admission_number = serializers.CharField(source='child.admission_number', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = StudentFeeItem
        fields = [
            'id', 'school', 'child', 'child_name', 'child_admission_number',
            'fee_structure', 'academic_year', 'academic_year_name', 'title',
            'amount', 'discount_amount', 'amount_paid', 'balance_due',
            'due_date', 'status', 'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'balance_due', 'created_at', 'updated_at']

class FeePaymentSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.full_name', read_only=True)
    child_admission_number = serializers.CharField(source='child.admission_number', read_only=True)
    fee_title = serializers.CharField(source='fee_item.title', read_only=True)
    received_by_name = serializers.CharField(source='received_by.full_name', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    school_address = serializers.CharField(source='school.address', read_only=True)
    school_phone = serializers.CharField(source='school.phone', read_only=True)

    class Meta:
        model = FeePayment
        fields = [
            'id', 'school', 'school_name', 'school_address', 'school_phone',
            'fee_item', 'fee_title', 'child', 'child_name', 'child_admission_number',
            'amount', 'payment_method', 'payment_date', 'reference_number',
            'receipt_number', 'received_by', 'received_by_name', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'school', 'receipt_number', 'created_at', 'updated_at']

class AssignFeeStructureSerializer(serializers.Serializer):
    fee_structure_id = serializers.UUIDField()
    academic_year_id = serializers.UUIDField()
    section_id = serializers.UUIDField(required=False, allow_null=True)
    class_level_id = serializers.UUIDField(required=False, allow_null=True)
    due_date = serializers.DateField()
    custom_title = serializers.CharField(max_length=150, required=False, allow_blank=True)
