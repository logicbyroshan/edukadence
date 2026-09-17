"""Django Admin for Fees."""
from django.contrib import admin
from apps.fees.models import FeeStructure, StudentFeeItem, FeePayment

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ('name', 'school', 'academic_year', 'class_level', 'amount', 'frequency', 'is_active')
    list_filter = ('school', 'academic_year', 'fee_type', 'frequency', 'is_active')
    search_fields = ('name',)

@admin.register(StudentFeeItem)
class StudentFeeItemAdmin(admin.ModelAdmin):
    list_display = ('child', 'title', 'amount', 'amount_paid', 'due_date', 'status')
    list_filter = ('school', 'academic_year', 'status')
    search_fields = ('child__first_name', 'child__last_name', 'title')

@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'child', 'amount', 'payment_method', 'payment_date', 'received_by')
    list_filter = ('school', 'payment_method', 'payment_date')
    search_fields = ('receipt_number', 'child__first_name', 'child__last_name', 'reference_number')
