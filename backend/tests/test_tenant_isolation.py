"""
Critical Multi-Tenant Isolation Security Test Suite.
Verifies that a user belonging to School A cannot read, query, or mutate
data belonging to School B under any circumstance.
"""
import pytest
from rest_framework import status
from apps.schools.models import AcademicYear, SchoolSetting

@pytest.mark.django_db
def test_school_a_admin_cannot_see_school_b_in_list(auth_client_factory, school_a_admin, school_a, school_b, school_b_admin):
    """Ensure School A admin only sees School A when listing schools."""
    client = auth_client_factory(school_a_admin)
    response = client.get('/api/v1/schools/')
    
    assert response.status_code == status.HTTP_200_OK
    school_ids = [item['id'] for item in response.data['results']]
    assert str(school_a.id) in school_ids
    assert str(school_b.id) not in school_ids

@pytest.mark.django_db
def test_school_a_admin_cannot_access_school_b_detail(auth_client_factory, school_a_admin, school_b):
    """Ensure School A admin receives 404 when directly requesting School B detail."""
    client = auth_client_factory(school_a_admin)
    response = client.get(f'/api/v1/schools/{school_b.id}/')
    
    # Must be 404 (or 403) to prevent information leakage
    assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

@pytest.mark.django_db
def test_school_a_admin_cannot_mutate_school_b(auth_client_factory, school_a_admin, school_b):
    """Ensure School A admin cannot patch or alter School B."""
    client = auth_client_factory(school_a_admin)
    response = client.patch(f'/api/v1/schools/{school_b.id}/', {
        'name': 'Hacked School Name'
    })
    
    assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]
    school_b.refresh_from_db()
    assert school_b.name != 'Hacked School Name'

@pytest.mark.django_db
def test_school_a_admin_cannot_see_school_b_members(auth_client_factory, school_a_admin, school_a, school_b, school_b_admin):
    """Ensure memberships list excludes members from School B."""
    client = auth_client_factory(school_a_admin, school_id=school_a.id)
    response = client.get('/api/v1/schools/memberships/')
    
    assert response.status_code == status.HTTP_200_OK
    member_emails = [m['user_details']['email'] for m in response.data['results'] if m['user_details']]
    assert 'admin@oaktree.edu' in member_emails
    assert 'admin@pinevalley.edu' not in member_emails

@pytest.mark.django_db
def test_cross_tenant_header_spoofing_rejected(auth_client_factory, school_a_admin, school_b):
    """Ensure spoofing X-School-ID with School B does not grant School A user access."""
    # School A admin attempts to send X-School-ID: <school_b.id>
    client = auth_client_factory(school_a_admin, school_id=school_b.id)
    response = client.get('/api/v1/schools/memberships/')
    
    # Should either return empty or fail permissions
    if response.status_code == status.HTTP_200_OK:
        assert response.data['count'] == 0
    else:
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]
