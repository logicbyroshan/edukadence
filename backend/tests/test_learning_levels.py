import pytest
from rest_framework import status
from apps.learning.models import LearningLevel, LearningArea, LearningTopic, Activity


@pytest.mark.django_db
def test_learning_levels_list(api_client):
    """Test public listing of the 6 developmental stages."""
    # Create levels
    LearningLevel.objects.create(code='EXPLORE_2_3', name='Explore', min_age=2.0, max_age=3.0, order_index=1)
    LearningLevel.objects.create(code='DISCOVER_3_4', name='Discover', min_age=3.0, max_age=4.0, order_index=2)
    LearningLevel.objects.create(code='LEARN_4_5', name='Learn', min_age=4.0, max_age=5.0, order_index=3)
    LearningLevel.objects.create(code='BUILD_5_7', name='Build', min_age=5.0, max_age=7.0, order_index=4)
    LearningLevel.objects.create(code='CREATE_7_9', name='Create', min_age=7.0, max_age=9.0, order_index=5)
    LearningLevel.objects.create(code='GROW_9_10', name='Grow', min_age=9.0, max_age=10.0, order_index=6)

    response = api_client.get('/api/v1/learning/levels/')
    assert response.status_code == status.HTTP_200_OK
    data = response.data.get('results', response.data)
    assert len(data) >= 6
    codes = [lvl['code'] for lvl in data]
    assert 'EXPLORE_2_3' in codes
    assert 'DISCOVER_3_4' in codes
    assert 'LEARN_4_5' in codes
    assert 'BUILD_5_7' in codes
    assert 'CREATE_7_9' in codes
    assert 'GROW_9_10' in codes


@pytest.mark.django_db
def test_learning_areas_and_topics(api_client):
    """Test learning areas and their topics."""
    area = LearningArea.objects.create(code='MATH', name='Numbers & Math', order_index=1)
    lvl = LearningLevel.objects.create(code='EXPLORE', name='Explore', min_age=2, max_age=3, order_index=1)
    LearningTopic.objects.create(learning_area=area, learning_level=lvl, code='COUNTING', name='Counting 1-5')

    response = api_client.get('/api/v1/learning/areas/')
    assert response.status_code == status.HTTP_200_OK
    data = response.data.get('results', response.data)
    assert len(data) >= 1
    assert data[0]['name'] == 'Numbers & Math'
    assert len(data[0]['topics']) == 1


@pytest.mark.django_db
def test_filter_activities_by_level_and_type(auth_client_factory, school_a_admin, school_a):
    """Test filtering activity catalog by developmental level and activity type."""
    client = auth_client_factory(school_a_admin, school_a.id)

    lvl1 = LearningLevel.objects.create(code='EXPLORE_2_3', name='Explore', min_age=2, max_age=3, order_index=1)
    lvl2 = LearningLevel.objects.create(code='DISCOVER_3_4', name='Discover', min_age=3, max_age=4, order_index=2)
    area = LearningArea.objects.create(code='SHAPES', name='Shapes & Colors', order_index=1)

    Activity.objects.create(
        title='Shape Detective',
        learning_level=lvl1,
        learning_area=area,
        activity_type='TAP_CHOOSE',
        status='PUBLISHED',
        is_global=True
    )
    Activity.objects.create(
        title='Counting Safari',
        learning_level=lvl2,
        learning_area=area,
        activity_type='COUNT',
        status='PUBLISHED',
        is_global=True
    )

    response = client.get('/api/v1/learning/activities/?level_code=EXPLORE_2_3')
    assert response.status_code == status.HTTP_200_OK
    data = response.data.get('results', response.data)
    assert len(data) == 1
    assert data[0]['title'] == 'Shape Detective'
