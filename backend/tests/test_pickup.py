"""Tests for Authorized Pickup and Safe Dismissal workflow."""
import pytest
from datetime import date
from apps.students.models import Child, AuthorizedPickupPerson, PickupRecord

@pytest.mark.django_db
def test_authorized_pickup_workflow(auth_client_factory, school_a, school_a_teacher, school_a_parent):
    client = auth_client_factory(school_a_teacher, school_a.id)

    child = Child.objects.create(
        school=school_a, first_name='Aarav', last_name='S',
        date_of_birth=date(2022, 1, 1), admission_number='C-88'
    )

    auth_person = AuthorizedPickupPerson.objects.create(
        school=school_a, child=child, name='Grandma Sharma',
        relationship='Grandmother', phone='+15559998888', pickup_pin='1234'
    )

    # Teacher records dismissal
    res_dismiss = client.post('/api/v1/students/pickup-records/record_dismissal/', {
        'child_id': str(child.id),
        'status': 'PICKED_UP',
        'picked_up_by_name': 'Grandma Sharma',
        'picked_up_by_relationship': 'Grandmother',
        'authorized_person_id': str(auth_person.id),
        'pin': '1234'
    }, format='json')

    assert res_dismiss.status_code == 200
    assert res_dismiss.data['data']['status'] == 'PICKED_UP'
    assert res_dismiss.data['data']['pin_verified'] is True
