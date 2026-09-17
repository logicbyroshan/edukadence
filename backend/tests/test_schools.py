"""Tests for School management."""
import pytest
from rest_framework import status

@pytest.mark.django_db
def test_super_admin_can_create_school(auth_client_factory, super_admin_user):
    client = auth_client_factory(super_admin_user)
    payload = {
        'name': 'Maple Leaf Daycare',
        'slug': 'maple-leaf-daycare',
        'code': 'MLD-03',
        'email': 'info@mapleleaf.edu',
        'phone': '+1 555-444-3322',
        'address': '55 Maple Way'
    }
    response = client.post('/api/v1/schools/', payload)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['name'] == 'Maple Leaf Daycare'
    assert response.data['code'] == 'MLD-03'

@pytest.mark.django_db
def test_school_admin_cannot_create_new_school(auth_client_factory, school_a_admin):
    client = auth_client_factory(school_a_admin)
    payload = {
        'name': 'Unauthorized School',
        'slug': 'unauthorized-school',
        'code': 'UNAUTH-01'
    }
    response = client.post('/api/v1/schools/', payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data['error']['code'] == 'PERMISSION_DENIED'

@pytest.mark.django_db
def test_school_admin_can_update_own_school(auth_client_factory, school_a_admin, school_a):
    client = auth_client_factory(school_a_admin, school_id=school_a.id)
    response = client.patch(f'/api/v1/schools/{school_a.id}/', {
        'phone': '+1 (555) 999-8888'
    })
    assert response.status_code == status.HTTP_200_OK
    assert response.data['phone'] == '+1 (555) 999-8888'

@pytest.mark.django_db
def test_school_stats_endpoint(auth_client_factory, school_a_admin, school_a):
    client = auth_client_factory(school_a_admin, school_id=school_a.id)
    response = client.get(f'/api/v1/schools/{school_a.id}/stats/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    assert 'total_members' in response.data['data']
