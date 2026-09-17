"""Tests for School Announcements and parent audience scoping."""
import pytest
from apps.communication.models import Announcement

@pytest.mark.django_db
def test_create_and_read_announcement(auth_client_factory, school_a, school_a_admin, school_a_parent):
    admin_client = auth_client_factory(school_a_admin, school_a.id)

    res_post = admin_client.post('/api/v1/communication/announcements/', {
        'title': 'School Picnic This Friday',
        'message': 'Please bring sunhats and water bottles.',
        'audience_type': 'ALL_SCHOOL',
        'priority': 'HIGH',
        'publish_date': '2026-09-17'
    }, format='json')
    assert res_post.status_code == 201

    parent_client = auth_client_factory(school_a_parent, school_a.id)
    res_parent = parent_client.get('/api/v1/communication/announcements/')
    assert res_parent.status_code == 200
    results = res_parent.data.get('results', res_parent.data)
    assert any(a['title'] == 'School Picnic This Friday' for a in results)
