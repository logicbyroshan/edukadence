"""Tests for Class levels, Sections, and Enrollments."""
import pytest
from datetime import date
from apps.classes.models import ClassLevel, Section, Enrollment
from apps.students.models import Child

@pytest.mark.django_db
def test_create_class_and_section(auth_client_factory, school_a, school_a_admin):
    client = auth_client_factory(school_a_admin, school_a.id)

    # 1. Create Class Level
    res_cl = client.post('/api/v1/classes/levels/', {
        'name': 'Nursery',
        'code': 'NUR',
        'order_index': 1
    }, format='json')
    assert res_cl.status_code == 201
    class_id = res_cl.data['id']

    # 2. Create Section
    res_sec = client.post('/api/v1/classes/sections/', {
        'class_level': class_id,
        'name': 'A',
        'capacity': 20
    }, format='json')
    assert res_sec.status_code == 201
    assert res_sec.data['display_name'] == 'Nursery A'

@pytest.mark.django_db
def test_enrollment_historical_tracking(auth_client_factory, school_a, school_a_admin):
    client = auth_client_factory(school_a_admin, school_a.id)
    ay = school_a.academic_years.first()

    cl = ClassLevel.objects.create(school=school_a, name='Nursery', code='NUR')
    sec = Section.objects.create(school=school_a, class_level=cl, name='A')
    child = Child.objects.create(
        school=school_a, first_name='Aarav', last_name='Sharma',
        date_of_birth=date(2022, 5, 14), admission_number='S-100'
    )

    res_enr = client.post('/api/v1/classes/enrollments/', {
        'child': str(child.id),
        'academic_year': str(ay.id),
        'class_level': str(cl.id),
        'section': str(sec.id),
        'enrollment_date': '2026-09-01',
        'roll_number': '01'
    }, format='json')
    assert res_enr.status_code == 201
    assert child.enrollments.count() == 1
    assert child.enrollments.first().section == sec
