"""Tests for Role-Based Access Control (RBAC)."""
import pytest
from rest_framework import status

@pytest.mark.django_db
def test_teacher_cannot_update_school_settings(auth_client_factory, school_a_teacher, school_a):
    client = auth_client_factory(school_a_teacher, school_id=school_a.id)
    response = client.post('/api/v1/schools/settings/', {
        'school': school_a.id,
        'key': 'test_setting',
        'value': {'enabled': True}
    }, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data['error']['code'] == 'PERMISSION_DENIED'

@pytest.mark.django_db
def test_parent_cannot_view_school_memberships_management(auth_client_factory, school_a_parent, school_a):
    client = auth_client_factory(school_a_parent, school_id=school_a.id)
    response = client.get('/api/v1/schools/memberships/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data['error']['code'] == 'PERMISSION_DENIED'

@pytest.mark.django_db
def test_child_cannot_manage_users(auth_client_factory, school_a_child, school_a):
    client = auth_client_factory(school_a_child, school_id=school_a.id)
    response = client.get('/api/v1/auth/management/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data['error']['code'] == 'PERMISSION_DENIED'
