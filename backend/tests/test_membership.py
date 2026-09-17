"""Tests for User-School Memberships."""
import pytest
from django.db import IntegrityError
from rest_framework import status
from apps.users.models import User
from apps.schools.models import SchoolMembership

@pytest.mark.django_db
def test_list_memberships(auth_client_factory, school_a_admin, school_a):
    client = auth_client_factory(school_a_admin, school_id=school_a.id)
    response = client.get('/api/v1/schools/memberships/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] >= 1

@pytest.mark.django_db
def test_unique_membership_constraint(school_a, school_a_admin):
    # Attempting to duplicate the exact same (user, school, role) should trigger IntegrityError
    with pytest.raises(IntegrityError):
        SchoolMembership.objects.create(
            user=school_a_admin,
            school=school_a,
            role='SCHOOL_ADMIN'
        )

@pytest.mark.django_db
def test_user_can_belong_to_multiple_schools(school_a, school_b):
    user = User.objects.create_user(email='multischool@test.com', password='Password123!')
    m1 = SchoolMembership.objects.create(user=user, school=school_a, role='TEACHER')
    m2 = SchoolMembership.objects.create(user=user, school=school_b, role='PARENT')
    
    assert user.memberships.count() == 2
    assert set(user.memberships.values_list('role', flat=True)) == {'TEACHER', 'PARENT'}
