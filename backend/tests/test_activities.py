"""Tests for Daily Activities and Classroom Moments."""
import pytest
from datetime import date
from apps.activities.models import ClassActivity
from apps.classes.models import ClassLevel, Section

@pytest.mark.django_db
def test_post_and_view_activity(auth_client_factory, school_a, school_a_teacher, school_a_admin):
    client = auth_client_factory(school_a_teacher, school_a.id)
    ay = school_a.academic_years.first()
    cl = ClassLevel.objects.create(school=school_a, name='Nursery')
    sec = Section.objects.create(school=school_a, class_level=cl, name='A')

    # Teacher posts activity
    payload = {
        'academic_year': str(ay.id),
        'class_level': str(cl.id),
        'section': str(sec.id),
        'title': 'Color Mixing Fun',
        'description': 'Learned how blue and yellow make green.',
        'activity_date': '2026-09-17',
        'category': 'ART',
        'media_urls': ['https://example.com/photo1.jpg']
    }
    res = client.post('/api/v1/activities/', payload, format='json')
    assert res.status_code == 201
    assert res.data['title'] == 'Color Mixing Fun'
    assert res.data['category'] == 'ART'
