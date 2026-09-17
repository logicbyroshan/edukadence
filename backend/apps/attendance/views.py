"""Attendance ViewSet with fast 1-tap bulk marking and analytics."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from apps.attendance.models import DailyAttendance
from apps.attendance.serializers import (
    DailyAttendanceSerializer,
    BulkAttendanceRequestSerializer
)
from apps.students.models import Child
from apps.classes.models import Section
from apps.core.permissions import HasSchoolAccess, IsTeacher
from apps.core.utils import get_request_school_id

class DailyAttendanceViewSet(viewsets.ModelViewSet):
    """
    Daily Attendance Management.
    - Teachers and Admins can record, bulk mark, and modify attendance.
    - Parents can view historical attendance for their own children.
    """
    serializer_class = DailyAttendanceSerializer
    filterset_fields = ['date', 'status', 'child', 'section']
    ordering_fields = ['date', 'child__first_name', 'status']

    def get_permissions(self):
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = DailyAttendance.objects.select_related('child', 'section__class_level', 'recorded_by', 'school')

        if user.is_superuser and not school_id:
            return qs

        if school_id:
            # If user is a Parent only, restrict to own children
            is_parent_only = user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'], is_active=True).exists()
            if is_parent_only:
                return qs.filter(school_id=school_id, child__parent_relationships__parent__user=user).distinct()
            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child')
        school_id = self.request.data.get('school') or (child.school_id if child else get_request_school_id(self.request))
        serializer.save(school_id=school_id, recorded_by=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """
        Fast 1-tap attendance marking for an entire classroom section.
        Payload: { section_id, date, records: [{ child_id, status, remarks }] }
        """
        serializer = BulkAttendanceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        school_id = get_request_school_id(request)
        att_date = data['date']
        section_id = data.get('section_id')
        records = data['records']

        section = None
        if section_id:
            section = Section.objects.filter(id=section_id, school_id=school_id).first()

        created_or_updated = []
        with transaction.atomic():
            for item in records:
                child_id = item['child_id']
                status_val = item.get('status', 'PRESENT')
                remarks_val = item.get('remarks', '')
                check_in_time = item.get('check_in_time')

                try:
                    child = Child.objects.get(id=child_id, school_id=school_id)
                except Child.DoesNotExist:
                    continue

                # Upsert attendance record
                att_obj, _ = DailyAttendance.objects.update_or_create(
                    school_id=school_id,
                    child=child,
                    date=att_date,
                    defaults={
                        'section': section or (child.enrollments.filter(status='ACTIVE').first().section if child.enrollments.filter(status='ACTIVE').exists() else None),
                        'status': status_val,
                        'remarks': remarks_val,
                        'check_in_time': check_in_time,
                        'recorded_by': request.user
                    }
                )
                created_or_updated.append(att_obj)

        return Response({
            'success': True,
            'message': f"Attendance successfully recorded for {len(created_or_updated)} students on {att_date}",
            'data': {
                'date': str(att_date),
                'total_marked': len(created_or_updated),
            }
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Returns attendance summary metrics for today or a specific date / month.
        """
        school_id = get_request_school_id(request)
        date_str = request.query_params.get('date')
        section_id = request.query_params.get('section_id')
        child_id = request.query_params.get('child_id')

        if date_str:
            try:
                target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
        else:
            target_date = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()

        qs = self.get_queryset()
        if section_id:
            qs = qs.filter(section_id=section_id)
        if child_id:
            qs = qs.filter(child_id=child_id)

        today_qs = qs.filter(date=target_date)
        present = today_qs.filter(status='PRESENT').count()
        absent = today_qs.filter(status='ABSENT').count()
        late = today_qs.filter(status='LATE').count()
        excused = today_qs.filter(status='EXCUSED').count()
        total_marked = present + absent + late + excused

        # Total active students in scope
        children_qs = Child.objects.filter(school_id=school_id, status='ACTIVE')
        if section_id:
            children_qs = children_qs.filter(enrollments__section_id=section_id, enrollments__status='ACTIVE')
        total_enrolled = children_qs.count()

        return Response({
            'success': True,
            'data': {
                'date': str(target_date),
                'total_enrolled': total_enrolled,
                'total_marked': total_marked,
                'present': present,
                'absent': absent,
                'late': late,
                'excused': excused,
                'attendance_rate': round((present / total_enrolled * 100), 1) if total_enrolled > 0 else 0
            }
        })
