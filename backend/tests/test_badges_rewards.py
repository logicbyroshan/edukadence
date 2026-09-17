import pytest
from datetime import date
from rest_framework import status
from apps.learning.models import Activity, ActivityAttempt, RewardBadge, ChildBadge, LearningLevel, LearningArea
from apps.students.models import Child, Parent, ChildParentRelationship


@pytest.mark.django_db
def test_star_accumulation_and_badge_unlock(auth_client_factory, school_a_admin, school_a):
    """Test unlocking a milestone badge upon completing activities."""
    client = auth_client_factory(school_a_admin, school_a.id)

    child = Child.objects.create(
        school=school_a,
        first_name='Riya',
        last_name='Patel',
        date_of_birth=date(2021, 3, 10),
        admission_number='ADM-102'
    )
    level = LearningLevel.objects.create(code='DISCOVER_3_4', name='Discover', min_age=3, max_age=4)
    area = LearningArea.objects.create(code='SHAPES', name='Shapes')
    activity = Activity.objects.create(
        title='Shape Game',
        learning_level=level,
        learning_area=area,
        activity_type='TAP_CHOOSE',
        star_reward=3,
        status='PUBLISHED',
        is_global=True
    )

    badge = RewardBadge.objects.create(
        code='TEST_MILESTONE',
        name='Test Explorer Badge',
        badge_type='STAR_MILESTONE',
        required_count=1,
        is_active=True
    )

    payload = {
        'child_id': str(child.id),
        'correct_count': 1,
        'total_count': 1,
        'is_completed': True
    }

    url = f'/api/v1/learning/activities/{activity.id}/submit_attempt/'
    response = client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED

    # Verify badge is awarded to child
    child_badge = ChildBadge.objects.filter(child=child, badge=badge).first()
    assert child_badge is not None


@pytest.mark.django_db
def test_kid_home_dashboard_endpoint(auth_client_factory, school_a_parent, school_a):
    """Test the kid home world summary endpoint."""
    client = auth_client_factory(school_a_parent, school_a.id)

    parent_profile = Parent.objects.create(school=school_a, user=school_a_parent, phone='+1555123456')
    child = Child.objects.create(
        school=school_a,
        first_name='Aarav',
        last_name='ParentTest',
        date_of_birth=date(2022, 1, 20),
        admission_number='ADM-103'
    )
    ChildParentRelationship.objects.create(school=school_a, parent=parent_profile, child=child, relationship_type='FATHER')

    level = LearningLevel.objects.create(code='EXPLORE_2_3', name='Explore', min_age=2, max_age=4, is_active=True)
    area = LearningArea.objects.create(code='MATH', name='Math', is_active=True)
    Activity.objects.create(
        title='Counting Fun',
        learning_level=level,
        learning_area=area,
        activity_type='COUNT',
        status='PUBLISHED',
        is_global=True
    )

    response = client.get(f'/api/v1/learning/kid-home/?child_id={child.id}')
    assert response.status_code == status.HTTP_200_OK
    assert 'child' in response.data
    assert response.data['child']['name'] == child.full_name
    assert 'total_stars' in response.data
    assert 'recommended_activities' in response.data
