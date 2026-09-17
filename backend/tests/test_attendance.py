"""Tests for Daily Attendance and fast bulk marking."""
import pytest
from datetime import date
from apps.attendance.models import DailyAttendance
from apps.students.models import Child
from apps.classes.models import ClassLevel, Section, Enrollment

@pytest.mark.django_db
def test_bulk_attendance_marking_and_summary(auth_client_factory, school_a, school_a_teacher):
    client = auth_client_factory(school_a_teacher, school_a.id)

    cl = ClassLevel.objects.create(school=school_a, name='Nursery')
    sec = Section.objects.create(school=school_a, class_level=cl, name='A')
    c1 = Child.objects.create(school=school_a, first_name='Aarav', last_name='S', date_of_birth=date(2022, 1, 1), admission_number='C-01')
    c2 = Child.objects.create(school=school_a, first_name='Riya', last_name='S', date_of_birth=date(2022, 1, 1), admission_number='C-02')

    ay = school_a.academic_years.first()
    Enrollment.objects.create(school=school_a, child=c1, academic_year=ay, class_level=cl, section=sec, enrollment_date=date(2026, 9, 1))
    Enrollment.objects.create(school=school_a, child=c2, academic_year=ay, class_level=cl, section=sec, enrollment_date=date(2026, 9, 1))

    # Bulk mark: c1 PRESENT, c2 ABSENT
    payload = {
        'section_id': str(sec.id),
        'date': '2026-09-17',
        'records': [
            {'child_id': str(c1.id), 'status': 'PRESENT', 'remarks': 'On time'},
            {'child_id': str(c2.id), 'status': 'ABSENT', 'remarks': 'Fever'}
        ]
    }
    res = client.post('/api/v1/attendance/bulk_mark/', payload, format='json')
    assert res.status_code == 200
    assert res.data['data']['total_marked'] == 2

    # Check summary
    res_sum = client.get('/api/v1/attendance/summary/?date=2026-09-17')
    assert res_sum.status_code == 200
    assert res_sum.data['data']['present'] == 1
    assert res_sum.data['data']['absent'] == 1
