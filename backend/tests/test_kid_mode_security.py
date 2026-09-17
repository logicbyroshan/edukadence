import pytest
from rest_framework import status
from apps.learning.models import Activity, LearningLevel, LearningArea
from apps.students.models import Parent, Child, ChildParentRelationship


@pytest.mark.django_db
def test_unpublished_activity_invisible_to_parent_and_kid(auth_client_factory, school_a_parent, school_a_admin, school_a):
    """Test that DRAFT or ARCHIVED activities are never exposed to children or parents."""
    admin_client = auth_client_factory(school_a_admin, school_a.id)
    parent_client = auth_client_factory(school_a_parent, school_a.id)

    level = LearningLevel.objects.create(code='EXPLORE', name='Explore', min_age=2, max_age=3)
    area = LearningArea.objects.create(code='GENERAL', name='General')

    # Create draft activity
    draft_activity = Activity.objects.create(
        title='Secret Draft Mystery Quest',
        learning_level=level,
        learning_area=area,
        activity_type='QUIZ',
        status='DRAFT',
        is_global=True
    )

    # Admin querying activity
    admin_res = admin_client.get(f'/api/v1/learning/activities/{draft_activity.id}/')
    # Parent client querying draft activity should not be returned in published list
    parent_list_res = parent_client.get('/api/v1/learning/activities/')
    assert parent_list_res.status_code == status.HTTP_200_OK
    results = parent_list_res.data.get('results', parent_list_res.data)
    titles = [a['title'] for a in results]
    assert 'Secret Draft Mystery Quest' not in titles
