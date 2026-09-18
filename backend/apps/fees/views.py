"""Fee management, dues assignment, and payment receipt ViewSets."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Count, Q
from decimal import Decimal
import uuid
import random

from apps.fees.models import FeeStructure, StudentFeeItem, FeePayment
from apps.fees.serializers import (
    FeeStructureSerializer,
    StudentFeeItemSerializer,
    FeePaymentSerializer,
    AssignFeeStructureSerializer
)
from apps.students.models import Child
from apps.classes.models import Section, Enrollment
from apps.schools.models import AcademicYear
from apps.core.permissions import IsSchoolAdmin, HasSchoolAccess, IsNotChild
from apps.core.utils import get_request_school_id

def generate_receipt_number(school):
    """Generates a clean sequential/timestamped receipt number within a school context."""
    now = timezone.now()
    date_prefix = now.strftime('%Y%m')
    count = FeePayment.objects.filter(school=school, created_at__year=now.year, created_at__month=now.month).count() + 1
    rand_suffix = random.randint(10, 99)
    return f"REC-{date_prefix}-{count:04d}-{rand_suffix}"

class FeeStructureViewSet(viewsets.ModelViewSet):
    """
    Standard fee structure definitions.
    """
    serializer_class = FeeStructureSerializer
    filterset_fields = ['academic_year', 'class_level', 'fee_type', 'frequency', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['amount', 'name', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess(), IsNotChild()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = FeeStructure.objects.select_related('academic_year', 'class_level', 'school')

        if user.is_superuser and not school_id:
            return qs
        if school_id:
            return qs.filter(school_id=school_id)
        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        academic_year = serializer.validated_data.get('academic_year')
        school_id = self.request.data.get('school') or (academic_year.school_id if academic_year else get_request_school_id(self.request))
        serializer.save(school_id=school_id)


class StudentFeeItemViewSet(viewsets.ModelViewSet):
    """
    Individual fee dues and invoices assigned to children.
    """
    serializer_class = StudentFeeItemSerializer
    filterset_fields = ['academic_year', 'status', 'child', 'due_date']
    search_fields = ['title', 'child__first_name', 'child__last_name', 'child__admission_number']
    ordering_fields = ['due_date', 'amount', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'assign_bulk']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess(), IsNotChild()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = StudentFeeItem.objects.select_related('child', 'fee_structure', 'academic_year', 'school')

        if user.is_superuser and not school_id:
            return qs
        if school_id:
            is_parent_only = user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'], is_active=True).exists()
            if is_parent_only:
                return qs.filter(school_id=school_id, child__parent_relationships__parent__user=user).distinct()
            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child')
        school_id = self.request.data.get('school') or (child.school_id if child else get_request_school_id(self.request))
        serializer.save(school_id=school_id)

    @action(detail=False, methods=['post'])
    def assign_bulk(self, request):
        """
        Mass assigns a fee structure to all enrolled children in a class level or section.
        """
        serializer = AssignFeeStructureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        school_id = get_request_school_id(request)
        fee_structure = FeeStructure.objects.get(id=data['fee_structure_id'], school_id=school_id)
        academic_year = AcademicYear.objects.get(id=data['academic_year_id'], school_id=school_id)

        enrollments = Enrollment.objects.filter(
            school_id=school_id,
            academic_year=academic_year,
            status='ACTIVE'
        )

        if data.get('section_id'):
            enrollments = enrollments.filter(section_id=data['section_id'])
        elif data.get('class_level_id'):
            enrollments = enrollments.filter(class_level_id=data['class_level_id'])

        title = data.get('custom_title') or fee_structure.name
        due_date = data['due_date']
        created_count = 0

        with transaction.atomic():
            for enrollment in enrollments:
                child = enrollment.child
                # Avoid duplicate fee assignment for the same title and due date
                existing = StudentFeeItem.objects.filter(
                    school_id=school_id,
                    child=child,
                    fee_structure=fee_structure,
                    academic_year=academic_year,
                    due_date=due_date
                ).exists()

                if not existing:
                    StudentFeeItem.objects.create(
                        school_id=school_id,
                        child=child,
                        fee_structure=fee_structure,
                        academic_year=academic_year,
                        title=title,
                        amount=fee_structure.amount,
                        due_date=due_date,
                        status='PENDING'
                    )
                    created_count += 1

        return Response({
            'success': True,
            'message': f"Assigned '{title}' to {created_count} students.",
            'assigned_count': created_count
        })


class FeePaymentViewSet(viewsets.ModelViewSet):
    """
    Payment receipts and recording.
    """
    serializer_class = FeePaymentSerializer
    filterset_fields = ['payment_method', 'child']
    search_fields = ['receipt_number', 'transaction_reference', 'child__first_name', 'child__last_name']
    ordering_fields = ['payment_date', 'amount', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess(), IsNotChild()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = FeePayment.objects.select_related('child', 'fee_item', 'received_by', 'school')

        if user.is_superuser and not school_id:
            return qs
        if school_id:
            is_parent_only = user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'], is_active=True).exists()
            if is_parent_only:
                return qs.filter(school_id=school_id, child__parent_relationships__parent__user=user).distinct()
            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child')
        school = child.school if child else self.request.user.memberships.filter(is_active=True).first().school
        receipt_no = generate_receipt_number(school)

        with transaction.atomic():
            payment = serializer.save(
                school=school,
                receipt_number=receipt_no,
                received_by=self.request.user
            )
            # Update associated fee item status if linked
            fee_item = payment.fee_item
            if fee_item:
                fee_item.amount_paid += payment.amount
                fee_item.update_payment_status()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Returns fee collections & outstanding balance overview."""
        school_id = get_request_school_id(request)
        today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()

        payments_qs = FeePayment.objects.filter(school_id=school_id)
        today_collections = payments_qs.filter(payment_date=today).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        month_collections = payments_qs.filter(payment_date__year=today.year, payment_date__month=today.month).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        fee_items_qs = StudentFeeItem.objects.filter(school_id=school_id)
        pending_items = fee_items_qs.filter(status__in=['PENDING', 'PARTIALLY_PAID', 'OVERDUE'])
        overdue_items = fee_items_qs.filter(status='OVERDUE')

        total_due = sum(item.balance_due for item in pending_items)
        overdue_count = overdue_items.count()

        return Response({
            'success': True,
            'data': {
                'today_collections': float(today_collections),
                'month_collections': float(month_collections),
                'total_pending_due': float(total_due),
                'overdue_count': overdue_count,
            }
        })
