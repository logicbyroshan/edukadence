"""Pytest fixtures and configuration for EduKadence test suite."""
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User
from apps.schools.models import School, SchoolMembership, AcademicYear, SchoolSetting

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def super_admin_user(db):
    user = User.objects.create_superuser(
        email='superadmin@edukadence.com',
        password='SuperAdminPassword123!',
        first_name='Super',
        last_name='Admin'
    )
    return user

@pytest.fixture
def school_a(db):
    school = School.objects.create(
        name='Oak Tree Montessori',
        slug='oak-tree-montessori',
        code='OTM-01',
        email='contact@oaktree.edu',
        phone='+1 (555) 111-2222',
        address='100 Oak St'
    )
    AcademicYear.objects.create(
        school=school,
        name='2026-2027',
        start_date='2026-09-01',
        end_date='2027-06-30',
        is_current=True
    )
    return school

@pytest.fixture
def school_b(db):
    school = School.objects.create(
        name='Pine Valley Preschool',
        slug='pine-valley-preschool',
        code='PVP-02',
        email='contact@pinevalley.edu',
        phone='+1 (555) 333-4444',
        address='200 Pine Ave'
    )
    AcademicYear.objects.create(
        school=school,
        name='2026-2027',
        start_date='2026-09-01',
        end_date='2027-06-30',
        is_current=True
    )
    return school

@pytest.fixture
def school_a_admin(db, school_a):
    user = User.objects.create_user(
        email='admin@oaktree.edu',
        password='Password123!',
        first_name='Alice',
        last_name='Oak'
    )
    SchoolMembership.objects.create(
        user=user,
        school=school_a,
        role='SCHOOL_ADMIN',
        is_default=True,
        is_active=True
    )
    return user

@pytest.fixture
def school_b_admin(db, school_b):
    user = User.objects.create_user(
        email='admin@pinevalley.edu',
        password='Password123!',
        first_name='Bob',
        last_name='Pine'
    )
    SchoolMembership.objects.create(
        user=user,
        school=school_b,
        role='SCHOOL_ADMIN',
        is_default=True,
        is_active=True
    )
    return user

@pytest.fixture
def school_a_teacher(db, school_a):
    user = User.objects.create_user(
        email='teacher@oaktree.edu',
        password='Password123!',
        first_name='Tina',
        last_name='Teacher'
    )
    SchoolMembership.objects.create(
        user=user,
        school=school_a,
        role='TEACHER',
        is_default=True,
        is_active=True
    )
    return user

@pytest.fixture
def school_a_parent(db, school_a):
    user = User.objects.create_user(
        email='parent@oaktree.edu',
        password='Password123!',
        first_name='Patricia',
        last_name='Parent'
    )
    SchoolMembership.objects.create(
        user=user,
        school=school_a,
        role='PARENT',
        is_default=True,
        is_active=True
    )
    return user

@pytest.fixture
def school_a_child(db, school_a):
    user = User.objects.create_user(
        username='charlie.kid',
        password='Password123!',
        first_name='Charlie',
        last_name='Child'
    )
    SchoolMembership.objects.create(
        user=user,
        school=school_a,
        role='CHILD',
        is_default=True,
        is_active=True
    )
    return user

@pytest.fixture
def auth_client_factory(api_client):
    def _make_client(user, school_id=None):
        client = APIClient()
        refresh = RefreshToken.for_user(user)
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        if school_id:
            client.defaults['HTTP_X_SCHOOL_ID'] = str(school_id)
        return client
    return _make_client
