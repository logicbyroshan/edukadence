"""Fee structures, child fee items, and payment receipts."""
from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from apps.core.models import TenantAwareModel

class FeeStructure(TenantAwareModel):
    """
    Standard fee templates defined per academic year and class level (or school-wide).
    """
    FEE_TYPE_CHOICES = (
        ('ADMISSION', 'Admission / Registration Fee'),
        ('TUITION', 'Tuition / Academic Fee'),
        ('ACTIVITY', 'Activity & Materials Fee'),
        ('ANNUAL', 'Annual / Development Charges'),
        ('MEALS', 'Snacks / Meals Fee'),
        ('TRANSPORT', 'Transport / Bus Fee'),
        ('OTHER', 'Other Charges'),
    )

    FREQUENCY_CHOICES = (
        ('ONE_TIME', 'One-Time Payment'),
        ('MONTHLY', 'Monthly Recurring'),
        ('QUARTERLY', 'Quarterly (3 Months)'),
        ('TERMLY', 'Per Term / Semester'),
        ('YEARLY', 'Annual Payment'),
    )

    academic_year = models.ForeignKey(
        'schools.AcademicYear',
        on_delete=models.CASCADE,
        related_name='fee_structures',
        db_index=True
    )
    class_level = models.ForeignKey(
        'classes.ClassLevel',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='fee_structures',
        help_text='Optional: Specific to a grade level or school-wide if blank'
    )
    name = models.CharField('Fee Name', max_length=120, db_index=True)
    fee_type = models.CharField('Fee Type', max_length=20, choices=FEE_TYPE_CHOICES, default='TUITION')
    amount = models.DecimalField('Amount (INR/Currency)', max_digits=10, decimal_places=2)
    frequency = models.CharField('Billing Frequency', max_length=20, choices=FREQUENCY_CHOICES, default='MONTHLY')
    due_day = models.PositiveIntegerField('Due Day of Month', default=10)
    is_active = models.BooleanField('Active', default=True)
    description = models.TextField('Description / Notes', blank=True)

    class Meta:
        db_table = 'fee_structures'
        verbose_name = 'Fee Structure'
        verbose_name_plural = 'Fee Structures'
        ordering = ['academic_year', 'name']

    def __str__(self):
        target = self.class_level.name if self.class_level else 'All Classes'
        return f"{self.name} - ₹{self.amount} ({target})"


class StudentFeeItem(TenantAwareModel):
    """
    Individual fee dues assigned to a specific child.
    """
    STATUS_CHOICES = (
        ('PENDING', 'Pending Payment'),
        ('PARTIALLY_PAID', 'Partially Paid'),
        ('PAID', 'Paid in Full'),
        ('WAIVED', 'Waived / Scholarship'),
        ('OVERDUE', 'Overdue'),
    )

    child = models.ForeignKey(
        'students.Child',
        on_delete=models.CASCADE,
        related_name='fee_items',
        db_index=True
    )
    fee_structure = models.ForeignKey(
        FeeStructure,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_student_items'
    )
    academic_year = models.ForeignKey(
        'schools.AcademicYear',
        on_delete=models.CASCADE,
        related_name='student_fee_items',
        db_index=True
    )
    title = models.CharField('Fee Item Title', max_length=150)
    amount = models.DecimalField('Original Amount', max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField('Discount / Concession', max_digits=10, decimal_places=2, default=Decimal('0.00'))
    amount_paid = models.DecimalField('Total Paid', max_digits=10, decimal_places=2, default=Decimal('0.00'))
    due_date = models.DateField('Due Date', db_index=True)
    status = models.CharField('Payment Status', max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    remarks = models.TextField('Notes / Concession Reason', blank=True)

    class Meta:
        db_table = 'student_fee_items'
        verbose_name = 'Student Fee Due'
        verbose_name_plural = 'Student Fee Dues'
        ordering = ['due_date', 'child__first_name']

    def __str__(self):
        return f"{self.child.full_name} - {self.title} (₹{self.balance_due} Due)"

    @property
    def balance_due(self):
        net_payable = max(Decimal('0.00'), self.amount - self.discount_amount)
        return max(Decimal('0.00'), net_payable - self.amount_paid)

    def update_payment_status(self):
        """Recomputes and saves status based on amounts."""
        net = max(Decimal('0.00'), self.amount - self.discount_amount)
        if self.amount_paid >= net:
            self.status = 'PAID'
        elif self.amount_paid > Decimal('0.00'):
            self.status = 'PARTIALLY_PAID'
        else:
            today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
            if self.due_date < today:
                self.status = 'OVERDUE'
            else:
                self.status = 'PENDING'
        self.save(update_fields=['amount_paid', 'status'])


class FeePayment(TenantAwareModel):
    """
    Payment transaction record and receipt.
    """
    PAYMENT_METHOD_CHOICES = (
        ('CASH', 'Cash'),
        ('UPI', 'UPI / QR Code'),
        ('BANK_TRANSFER', 'Bank Transfer / NEFT'),
        ('CHEQUE', 'Cheque / DD'),
        ('CARD', 'Debit / Credit Card'),
        ('OTHER', 'Other'),
    )

    fee_item = models.ForeignKey(
        StudentFeeItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    child = models.ForeignKey(
        'students.Child',
        on_delete=models.CASCADE,
        related_name='payments',
        db_index=True
    )
    amount = models.DecimalField('Amount Paid', max_digits=10, decimal_places=2)
    payment_method = models.CharField('Payment Method', max_length=20, choices=PAYMENT_METHOD_CHOICES, default='CASH')
    payment_date = models.DateField('Payment Date', default=timezone.localdate, db_index=True)
    reference_number = models.CharField('Reference / Transaction / Cheque No', max_length=100, blank=True)
    receipt_number = models.CharField('Official Receipt Number', max_length=64, db_index=True)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collected_payments'
    )
    notes = models.TextField('Remarks', blank=True)

    class Meta:
        db_table = 'fee_payments'
        verbose_name = 'Fee Payment'
        verbose_name_plural = 'Fee Payments'
        ordering = ['-payment_date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['school', 'receipt_number'],
                name='unique_school_receipt_number'
            )
        ]

    def __str__(self):
        return f"Receipt #{self.receipt_number} - {self.child.full_name}: ₹{self.amount}"
