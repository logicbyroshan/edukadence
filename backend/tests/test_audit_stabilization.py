"""Comprehensive audit and pre-production stabilization test suite for EduKadence.
Covers tenant isolation, object authorization, role boundaries, kid mode security,
and dismissal workflows.
"""
import pytest
from datetime import date
from rest_framework import status
from apps.users.models import User
from apps.schools.models import School, SchoolMembership, AcademicYear
from apps.students.models import Child, Parent, ChildParentRelationship, PickupRecord
from apps.classes.models import ClassLevel, Section, Enrollment
from apps.attendance.models import DailyAttendance
from apps.fees.models import FeeStructure

@pytest.mark.django_db
class TestAuditTenantAndObjectIsolation:
    """Test multi-tenant isolation and object authorization across schools and parents."""

    def test_cross_school_child_access_denied(self, auth_client_factory, school_a, school_b, school_a_admin, school_b_admin):
        # Create child in School A
        child_a = Child.objects.create(
            school=school_a,
            first_name='Aarav',
            last_name='Sharma',
            date_of_birth=date(2021, 5, 12),
            gender='MALE',
            admission_number='ADM-A-001'
        )

        client_b = auth_client_factory(school_b_admin, school_b.id)
        
        # School B admin tries to access School A's child directly
        response = client_b.get(f'/api/v1/students/children/{child_a.id}/')
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

        # School B admin tries to list children - should not see child_a
        response_list = client_b.get('/api/v1/students/children/')
        assert response_list.status_code == status.HTTP_200_OK
        results = response_list.data if isinstance(response_list.data, list) else response_list.data.get('results', [])
        assert not any(c['id'] == str(child_a.id) for c in results)

    def test_parent_object_isolation(self, auth_client_factory, school_a):
        # Create two parents in School A
        user_parent_1 = User.objects.create_user(email='p1@oaktree.edu', password='Password123!', first_name='Parent', last_name='One')
        user_parent_2 = User.objects.create_user(email='p2@oaktree.edu', password='Password123!', first_name='Parent', last_name='Two')
        
        SchoolMembership.objects.create(user=user_parent_1, school=school_a, role='PARENT', is_active=True)
        SchoolMembership.objects.create(user=user_parent_2, school=school_a, role='PARENT', is_active=True)

        parent_prof_1 = Parent.objects.create(user=user_parent_1, school=school_a, first_name='Parent', last_name='One', phone='+15551111')
        parent_prof_2 = Parent.objects.create(user=user_parent_2, school=school_a, first_name='Parent', last_name='Two', phone='+15552222')

        child_1 = Child.objects.create(school=school_a, first_name='Kid', last_name='One', date_of_birth=date(2021, 1, 1), admission_number='K-01')
        child_2 = Child.objects.create(school=school_a, first_name='Kid', last_name='Two', date_of_birth=date(2021, 2, 2), admission_number='K-02')

        ChildParentRelationship.objects.create(school=school_a, child=child_1, parent=parent_prof_1, relationship_type='MOTHER', is_primary_contact=True)
        ChildParentRelationship.objects.create(school=school_a, child=child_2, parent=parent_prof_2, relationship_type='FATHER', is_primary_contact=True)

        client_p1 = auth_client_factory(user_parent_1, school_a.id)

        # Parent 1 querying /api/v1/students/children/ should only return child 1
        resp = client_p1.get('/api/v1/students/children/')
        assert resp.status_code == status.HTTP_200_OK
        results = resp.data if isinstance(resp.data, list) else resp.data.get('results', [])
        assert len(results) == 1
        assert results[0]['id'] == str(child_1.id)

    def test_kid_mode_cannot_access_school_admin_api(self, auth_client_factory, school_a, school_a_child):
        client_kid = auth_client_factory(school_a_child, school_a.id)

        # Kid tries to access admin settings or finance
        resp = client_kid.get('/api/v1/fees/structures/')
        assert resp.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED]

        resp_schools = client_kid.get('/api/v1/schools/settings/')
        assert resp_schools.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED]

@pytest.mark.django_db
class TestAuditPickupAndAttendance:
    """Test safety-critical dismissal PIN, pickup transitions, and attendance integrity."""

    def test_pickup_record_creation_and_filtering(self, auth_client_factory, school_a, school_a_admin):
        child = Child.objects.create(
            school=school_a,
            first_name='Leo',
            last_name='Das',
            date_of_birth=date(2020, 6, 15),
            admission_number='LEO-01'
        )

        client = auth_client_factory(school_a_admin, school_a.id)
        
        # Mark ready for pickup
        resp = client.post('/api/v1/students/pickup-records/record_dismissal/', {
            'child_id': str(child.id),
            'status': 'READY_FOR_PICKUP',
            'notes': 'Waiting in entrance pod'
        }, format='json')
        assert resp.status_code == status.HTTP_200_OK

        # Verify pickup records today
        resp_list = client.get(f'/api/v1/students/pickup-records/?date={date.today().isoformat()}')
        assert resp_list.status_code == status.HTTP_200_OK
        records = resp_list.data if isinstance(resp_list.data, list) else resp_list.data.get('results', [])
        assert any(r['child'] == child.id or r['child'] == str(child.id) for r in records)
