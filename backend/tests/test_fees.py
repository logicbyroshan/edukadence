"""Tests for Fee Structures, Invoicing, Payments, and Receipts."""
import pytest
from datetime import date
from decimal import Decimal
from apps.fees.models import FeeStructure, StudentFeeItem, FeePayment
from apps.students.models import Child

@pytest.mark.django_db
def test_fee_assignment_and_payment_receipt(auth_client_factory, school_a, school_a_admin):
    client = auth_client_factory(school_a_admin, school_a.id)
    ay = school_a.academic_years.first()

    child = Child.objects.create(
        school=school_a, first_name='Aarav', last_name='S',
        date_of_birth=date(2022, 1, 1), admission_number='C-99'
    )

    fee_structure = FeeStructure.objects.create(
        school=school_a, academic_year=ay, name='Tuition Term 1',
        amount=Decimal('3000.00'), frequency='MONTHLY'
    )

    fee_item = StudentFeeItem.objects.create(
        school=school_a, child=child, fee_structure=fee_structure,
        academic_year=ay, title='Tuition Term 1', amount=Decimal('3000.00'),
        due_date=date(2026, 10, 10), status='PENDING'
    )

    # Record partial payment
    res_pay = client.post('/api/v1/fees/payments/', {
        'fee_item': str(fee_item.id),
        'child': str(child.id),
        'amount': '3000.00',
        'payment_method': 'UPI',
        'reference_number': 'UPI123456'
    }, format='json')

    assert res_pay.status_code == 201
    assert 'receipt_number' in res_pay.data
    assert res_pay.data['receipt_number'].startswith('REC-')

    fee_item.refresh_from_db()
    assert fee_item.status == 'PAID'
    assert fee_item.amount_paid == Decimal('3000.00')
    assert fee_item.balance_due == Decimal('0.00')
