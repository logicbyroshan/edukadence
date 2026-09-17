"""Operational reports and CSV data export views."""
import csv
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.students.models import Child, PickupRecord
from apps.classes.models import ClassLevel, Section, Enrollment
from apps.attendance.models import DailyAttendance
from apps.fees.models import FeePayment, StudentFeeItem
from apps.core.permissions import IsSchoolAdmin, HasSchoolAccess
from apps.core.utils import get_request_school_id

class AttendanceReportView(APIView):
    """
    Detailed attendance report aggregated by date and classroom section.
    """
    permission_classes = [IsAuthenticated, HasSchoolAccess]

    def get(self, request):
        school_id = get_request_school_id(request)
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        section_id = request.query_params.get('section_id')

        today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
        if not start_date:
            start_date = today.replace(day=1)
        if not end_date:
            end_date = today

        qs = DailyAttendance.objects.filter(
            school_id=school_id,
            date__range=[start_date, end_date]
        )
        if section_id:
            qs = qs.filter(section_id=section_id)

        records_by_section = {}
        for section in Section.objects.filter(school_id=school_id):
            sec_qs = qs.filter(section=section)
            total = sec_qs.count()
            present = sec_qs.filter(status='PRESENT').count()
            absent = sec_qs.filter(status='ABSENT').count()
            late = sec_qs.filter(status='LATE').count()
            rate = round((present / total * 100), 1) if total > 0 else 0

            records_by_section[section.display_name] = {
                'section_id': str(section.id),
                'total_records': total,
                'present': present,
                'absent': absent,
                'late': late,
                'attendance_rate': rate
            }

        return Response({
            'success': True,
            'data': {
                'start_date': str(start_date),
                'end_date': str(end_date),
                'summary_by_section': records_by_section
            }
        })


class FeeReportView(APIView):
    """
    Financial collections & outstanding dues summary.
    """
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get(self, request):
        school_id = get_request_school_id(request)
        payments = FeePayment.objects.filter(school_id=school_id)
        fee_items = StudentFeeItem.objects.filter(school_id=school_id)

        # Payment methods breakdown
        by_method = payments.values('payment_method').annotate(
            total_amount=Sum('amount'),
            total_transactions=Count('id')
        )

        total_collected = payments.aggregate(total=Sum('amount'))['total'] or 0
        total_due = sum(item.balance_due for item in fee_items if item.status in ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'])
        overdue_count = fee_items.filter(status='OVERDUE').count()

        return Response({
            'success': True,
            'data': {
                'total_collected': float(total_collected),
                'total_pending_due': float(total_due),
                'overdue_count': overdue_count,
                'by_payment_method': list(by_method)
            }
        })


class ClassStrengthReportView(APIView):
    """
    Classroom capacity, enrollment counts, and gender distribution.
    """
    permission_classes = [IsAuthenticated, HasSchoolAccess]

    def get(self, request):
        school_id = get_request_school_id(request)
        sections = Section.objects.filter(school_id=school_id, is_active=True).select_related('class_level')

        report = []
        for sec in sections:
            enrollments = sec.enrollments.filter(status='ACTIVE')
            total = enrollments.count()
            males = enrollments.filter(child__gender='MALE').count()
            females = enrollments.filter(child__gender='FEMALE').count()
            other = total - (males + females)

            report.append({
                'section_id': str(sec.id),
                'class_level': sec.class_level.name,
                'section_name': sec.name,
                'display_name': sec.display_name,
                'capacity': sec.capacity,
                'enrolled': total,
                'available_seats': max(0, sec.capacity - total),
                'boys_count': males,
                'girls_count': females,
                'other_count': other,
            })

        return Response({
            'success': True,
            'data': {
                'classes': report,
                'total_school_enrolled': sum(item['enrolled'] for item in report)
            }
        })


class ExportCsvView(APIView):
    """
    Exports clean CSV spreadsheets for Children, Attendance, or Fees.
    """
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get(self, request, report_type):
        school_id = get_request_school_id(request)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="edukadence_{report_type}_{timezone.now().strftime("%Y%m%d")}.csv"'

        writer = csv.writer(response)

        if report_type == 'children':
            writer.writerow(['Admission No', 'First Name', 'Last Name', 'Gender', 'DOB', 'Class Section', 'Status', 'Emergency Phone'])
            children = Child.objects.filter(school_id=school_id).prefetch_related('enrollments__section')
            for c in children:
                enrollment = c.enrollments.filter(status='ACTIVE').first()
                sec_name = enrollment.section.display_name if enrollment and enrollment.section else ''
                writer.writerow([
                    c.admission_number, c.first_name, c.last_name, c.gender,
                    c.date_of_birth, sec_name, c.status, c.emergency_contact_phone
                ])

        elif report_type == 'attendance':
            writer.writerow(['Date', 'Student Name', 'Admission No', 'Section', 'Status', 'Check In', 'Remarks'])
            attendances = DailyAttendance.objects.filter(school_id=school_id).select_related('child', 'section').order_by('-date')[:500]
            for a in attendances:
                writer.writerow([
                    a.date, a.child.full_name, a.child.admission_number,
                    a.section.display_name if a.section else '', a.status,
                    a.check_in_time or '', a.remarks
                ])

        elif report_type == 'fees':
            writer.writerow(['Receipt No', 'Date', 'Student Name', 'Admission No', 'Amount', 'Payment Method', 'Ref No'])
            payments = FeePayment.objects.filter(school_id=school_id).select_related('child').order_by('-payment_date')[:500]
            for p in payments:
                writer.writerow([
                    p.receipt_number, p.payment_date, p.child.full_name,
                    p.child.admission_number, p.amount, p.payment_method, p.reference_number
                ])
        else:
            return Response({'error': 'Invalid report type'}, status=400)

        return response
