import pytest
from datetime import date
from rest_framework import status
from apps.learning.models import Activity, ActivityAttempt, LearningProgress, LearningLevel, LearningArea
from apps.students.models import Child


@pytest.mark.django_db
def test_submit_activity_attempt_and_earn_stars(auth_client_factory, school_a_admin, school_a):
    """Test submitting an interactive activity attempt and receiving server-calculated stars."""
    client = auth_client_factory(school_a_admin, school_a.id)

    level = LearningLevel.objects.create(code='EXPLORE_2_3', name='Explore', min_age=2, max_age=3)
    area = LearningArea.objects.create(code='MATH', name='Math')
    activity = Activity.objects.create(
        title='Counting Apples',
        learning_level=level,
        learning_area=area,
        activity_type='COUNT',
        star_reward=2,
        status='PUBLISHED',
        is_global=True
    )

    child = Child.objects.create(
        school=school_a,
        first_name='Aarav',
        last_name='Sharma',
        date_of_birth=date(2022, 5, 15),
        admission_number='ADM-101'
    )

    payload = {
        'child_id': str(child.id),
        'correct_count': 1,
        'total_count': 1,
        'is_completed': True,
        'answer_metadata': {'selected_option': 'opt1'}
    }

    url = f'/api/v1/learning/activities/{activity.id}/submit_attempt/'
    response = client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['success'] is True
    assert response.data['stars_awarded'] == 2
    assert response.data['is_completed'] is True

    # Verify attempt created in DB
    attempt = ActivityAttempt.objects.filter(id=response.data['attempt_id']).first()
    assert attempt is not None
    assert attempt.child == child
    assert attempt.activity == activity
    assert attempt.score == 100

    # Verify progress updated
    progress = LearningProgress.objects.filter(child=child, learning_area=activity.learning_area).first()
    assert progress is not None
    assert progress.activities_completed_count == 1
    assert progress.total_stars_earned == 2
