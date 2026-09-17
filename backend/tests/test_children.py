"""Tests for Children, Parents, and Relationships."""
import pytest
from datetime import date
from apps.students.models import Child, Parent, ChildParentRelationship

@pytest.mark.django_db
def test_create_child_profile(auth_client_factory, school_a, school_a_admin):
    client = auth_client_factory(school_a_admin, school_a.id)
    payload = {
        'first_name': 'Aarav',
        'last_name': 'Sharma',
        'date_of_birth': '2022-05-14',
        'gender': 'MALE',
        'admission_number': 'TEST-ADM-001',
        'blood_group': 'B+'
    }
    response = client.post('/api/v1/students/children/', payload, format='json')
    assert response.status_code == 201
    assert response.data['first_name'] == 'Aarav'
    assert response.data['admission_number'] == 'TEST-ADM-001'

@pytest.mark.django_db
def test_parent_child_relationship_multiple_children(auth_client_factory, school_a, school_a_admin, school_a_parent):
    client = auth_client_factory(school_a_admin, school_a.id)

    # Create 2 children (siblings)
    c1 = Child.objects.create(
        school=school_a, first_name='Aarav', last_name='Sharma',
        date_of_birth=date(2022, 5, 14), admission_number='S-001'
    )
    c2 = Child.objects.create(
        school=school_a, first_name='Riya', last_name='Sharma',
        date_of_birth=date(2020, 9, 20), admission_number='S-002'
    )

    # Create Parent profile linked to user
    parent = Parent.objects.create(
        school=school_a, user=school_a_parent, first_name='Patricia',
        last_name='Parent', phone='+15551234567'
    )

    # Link both children to the same parent
    ChildParentRelationship.objects.create(school=school_a, child=c1, parent=parent, relationship_type='MOTHER')
    ChildParentRelationship.objects.create(school=school_a, child=c2, parent=parent, relationship_type='MOTHER')

    # Parent client fetches children
    parent_client = auth_client_factory(school_a_parent, school_a.id)
    res = parent_client.get('/api/v1/students/children/')
    assert res.status_code == 200
    results = res.data.get('results', res.data)
    assert len(results) == 2
    names = [item['first_name'] for item in results]
    assert 'Aarav' in names
    assert 'Riya' in names
